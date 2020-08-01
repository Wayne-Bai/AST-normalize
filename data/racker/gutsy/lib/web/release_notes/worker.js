/*
 *  Copyright 2011 Rackspace
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
var util = require('util');
var url = require('url');

var async = require('async');
var _ = require('underscore');

var log = require('../../log');
var utils = require('../../utils').common;
var v1 = require('../../utils').v1;
var notes = require('./notes');

var Note = notes.Note;

module.exports = utils.make_class({
  cutoff: 31 * 24 * 60 *60 * 1000,
  init: function(start, end, project){
    var self = this;
    var __worker;

    var dread_data;
    var config = project.get_api_config('release_notes');

    self.latest_commit = undefined;

    self.v1_data = {};
    self.notes = [];
    self._start = start;
    self._end = end;
    self.cb = undefined;
    self.v1_config = config.version_one;
    self.github_config = config.github;
    self.dreadnot_config = config.dreadnot;
    self.github_commit_task = undefined;
    self.date_of_last_merge_before_deploy = undefined;
    // this is really the time of the commit for the last pr merged into master that was deployed-
    // slightly different than the merged_at time.
    self.last_pr_commit_to_live_time = undefined;
    self.last_merged_sha = undefined;
    self.dreadnot_deploy_href = undefined;
    self.dreadnot_deploy_time = undefined;

    if(self.dreadnot_config){
      dread_data = project.get_data('dreadnot');
      self.github_commit_task = self._make_last_merge_task(self.github_config, dread_data);
    }

    self._cutoff = new Date(self._end.valueOf() - self.cutoff).valueOf();

    self.v1_support = self.v1_config ? true : false;

    self.v1_response_handler = _.bind(self.__v1_response_handler, self);
    self.github_response_handler = _.bind(self.__github_response_handler, self);

    __worker = function(task, cb){
      // we want to end when we are done processing data,
      // not sending off requests
      utils.request_maker(task.options, function(err, res){
        // this is synchronous so its ok
        try{
          task.cb(err, res);
        }catch(e){
          log.error(e);
        }finally{
          // alert the queue
          cb();
        }
      });
    };

    // a queue to grab info from v1 (after we get info from github :(
    self._q = async.queue(__worker, 10);

  },
  work: function(cb){
    var self = this;
    var options;
    self.cb = cb;

    if (!(self.v1_support && self.github_config)) {
      return cb(null, {notes: []});
    }

    // cb is called after we are all done
    self._q.drain = function(err){
      _.each(self.notes, function(note){
        if (note.v1.id !== undefined){
          var split = note.v1.id.split(':');
          var type = split[0];
          var id = split[1];
          try {
            delete self.v1_data[type][id];
          }
          catch (e) {
          }
        }
      });

      _.each(self.v1_data, function(assets, type){
        _.each(assets, function(asset, id){
          var new_note = new Note();
          new_note.set_v1(asset);
          self.notes.push(new_note);
        });
      });

      self.notes.sort(function(a, b){
        var a_time = a.merged_at || a.v1.change_date;
        var b_time = b.merged_at || b.v1.change_date;

        return ( b_time.valueOf() - a_time.valueOf() );
      });

      cb(err, {
        notes: self.notes,
        start: new Date(self._start),
        end: new Date(self._end),
        to_revision_time: self.last_pr_commit_to_live_time,
        last_merged_sha: self.last_merged_sha,
        pr_id: self.pr_id,
        dreadnot_deploy_href: self.dreadnot_deploy_href,
        dreadnot_deploy_time: self.dreadnot_deploy_time
      });
    };
    // and .... go!
    if (self.github_commit_task){
      self._push_to_q(self.github_commit_task);
    }

    if (self.github_config) {
      _.each(self.github_config.repo, function (repo) {
        self._q_github_request(repo);
      });
    }
    self._get_v1_history();
  },
  _make_last_merge_task: function(github_config, dread_data){
    var self = this;
    var sha;
    var repo;

    if (!dread_data){
      return;
    }
    try{
      sha = dread_data[0].deploy.to_revision;
      repo = url.parse(dread_data[0].github_href).path.split("/").slice(-1)[0];
    }catch(e){
      log.error(e);
      return;
    }
    self.last_merged_sha = sha;
    self.dreadnot_deploy_href = util.format("https://%s/stacks/%s/regions/%s/deployments/%s",
      self.dreadnot_config.host,
      dread_data[0].deploy.stackName,
      dread_data[0].deploy.region,
      dread_data[0].deploy.name);
    self.dreadnot_deploy_time = new Date(dread_data[0].deploy.time);
    return {
      options: utils.github_options(self.github_config,
        repo,
        util.format('/commits/%s', sha)),
      cb: _.bind(self.github_sha_getter_cb, self)
    };
  },
  github_sha_getter_cb: function(err, results){
    var self = this;
    var data;
    var error;

    if (err){
      return self._die(err);
    }
    try{
      data = JSON.parse(results.data);
    }catch(e){
      return self._die(e);
    }
    if (data.message){
      return self._die('Github says: ' + data.message);
    }

    try{
      self.last_pr_commit_to_live_time = new Date(data.commit.committer.date);
      log.log(self.last_pr_commit_to_live_time);
      self.pr_id = data.id;
    }catch(e){
      return self._die(e, 'Github says');
    }
  },
  _get_history_options: function(start, end, type){
    var self = this;
    var path = [
      "/Hist/",
      type,
      util.format("?where=Scope=%s;ChangeDate>'%s';ChangeDate<'%s'&sel=%s&s",
      v1.scope_maker(self.v1_config.project), new Date(start).toISOString(), new Date(end).toISOString(), notes.SELECTION)
    ];
    return v1.options(self.v1_config, path);
  },
  _get_options_from_branch_name: function(v1_story_info){
    var self = this;
    var options, path, identifier;
    path = [
      '/Data/',
      v1_story_info.long_name,
      util.format("?where=Number='%s'&sel=%s", v1_story_info.number, notes.SELECTION)
    ];
    return v1.options(self.v1_config, path);
  },
  _history_handler: function(type, err, results){
    var self = this;
    self.v1_data[type] = {};
    v1.parse(results.data, function(err, assets){
      _.each(assets, function(asset){
        if (v1.asset_is_open(asset) === true){
          return;
        }
        var name = asset.id.split(":")[1];
        var asset_history = self.v1_data[type][name];
        if (asset_history === undefined){
          self.v1_data[type][name] = asset;
          return;
        }
        if (Date.parse(asset.ChangeDate) < Date.parse(asset_history.ChangeDate)){
          self.v1_data[type][name] = asset;
        }
      });
    });
  },
  _get_v1_history: function(){
    var self = this;

    if (!self.v1_support){
      return;
    }
    _.each(['Story', 'Defect', 'Test', 'Task'], function(type){
      var options = self._get_history_options(self._start, self._end, type);
      self._push_to_q({options: options, cb: _.bind(self._history_handler, self, type)});
    });
  },
  add_note: function(pull_request){
    var self = this;
    var note = new Note(pull_request);

    self.notes.push(note);

    if (self.v1_support){
      self._q_v1_request(note);
    }
    return note;
  },
  _push_to_q: function(task){
    var self = this;
    if(!self._q){
      return;
    }
    self._q.push(task);
  },
  _die: function(err){
    var self = this;
    log.error(arguments);
    self.cb(err);
    delete self._q;
  },
  // TODO: move this into dreadnot poller!

  _q_github_request: function(repo, uri){
    var self = this;
    var options;
    var path;
    options = utils.github_options(self.github_config, repo, '/pulls?state=closed&per_page=100&page=1', uri);
    self._push_to_q({options: options, cb: self.github_response_handler});
  },
  _q_v1_request: function(note){
    var self = this;
    var options;

    var v1_story_info = v1.match(note.title);
    if (!v1_story_info){
      return;
    }

    options = self._get_options_from_branch_name(v1_story_info);

    self._push_to_q({options: options, cb: function(err, results){
      // could use bind again, but this is clearerer
      self.v1_response_handler(note, err, results);
      }
    });
  },
  __v1_response_handler: function(note, errors, results){
    var self = this;
    var asset;
    var v1_error = "";

    if (errors){
      note.set_error(errors);
      return;
    }
    v1.parse(results.data, function(error, asset){
      if (error){
        note.set_error(error);
        return;
      }
      asset = asset[0];
      note.set_v1(asset);
    });
  },
  __github_response_handler: function(errors, results){
    var self = this;
    var pulls;
    var res;
    var links;
    var i;
    var pull;
    var merged_at;
    var reached_cutoff = false;

    if (errors) {
      return self._die(errors);
    }

    try{
      res = results.res;
      pulls = JSON.parse(results.data);
    } catch (e){
      return self._die(e);
    }

    if (pulls.message){
      return self._die('Github says: ' + pulls.message);
    }

    for (i=0; i<pulls.length; i++){

      pull = pulls[i];
      if (Date.parse(pull.created_at) < self._cutoff){
        reached_cutoff = true;
      }
      if (!pull.merged_at){
        continue;
      }
      // TODO: check for pull.base.label === 'master'?
      merged_at = new Date(pull.merged_at);

      if (merged_at >= self._start && merged_at <= self._end){
        self.add_note(pull);
      }
    }
    // make another github request?
    if (!reached_cutoff && res.headers.link){
      _.each(res.headers.link.split(','), function(link){
        var rel_position, rel, uri;
        uri = link.match(/<(.+?)>/)[1];
        rel = link.match(/rel="(.+?)"/)[1];
        if (rel === "next"){
          self._q_github_request(undefined, uri);
        }
      });
    }
  }
});
