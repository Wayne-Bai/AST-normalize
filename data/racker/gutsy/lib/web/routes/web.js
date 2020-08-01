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

var fs                 = require('fs');
var querystring        = require('querystring');
var url                = require('url');

var express            = require('express');
var async              = require('async');
var _                  = require('underscore');
var moment             = require('moment');

var db                 = require('../db');
var urls               = require('../urls');
var middleware         = require('../middleware');
var settings           = require('../../settings');
var utils              = require('../../utils').common;
var constants          = require('../../utils').constants;
var log                = require('../../log');
var ReleaseNotesWorker = require('../release_notes/worker');
var projects           = require('../projects');
var events             = require("../events");
var et                 = require('elementtree');
var ElementTree        = et.ElementTree;
var Element            = et.Element;

var RELATED_APIS       = events.RELATED_APIS;
var MULTIPLIERS        = events.MULTIPLIERS;

module.exports.install = function(web_app, installed_projects){
  web_app.use(express.errorHandler({ showStack: true, dumpExceptions: true }));

  var default_middleware = [middleware.project_checker(installed_projects), middleware.injector.inject];

  var add_route = function(method, urls, middleware, func){
    if (func === undefined){
      func = middleware;
      middleware = undefined;
    }
    middleware = middleware !== undefined ? middleware.concat(default_middleware) : default_middleware;
    web_app[method](urls, middleware, func);
  };

  add_route('get',
    urls.DEFECTS,
    function(req, res) {
      res.render('defects.jade');
  });

  add_route('post',
    urls.DEFECTS,
    [express.bodyParser()],
    function(req, res){
      var v1_response;
      var v1_error;
      var data = req.body;
      var err = false;
      var name;
      var description;
      var scope;
      var severity;
      var asset;
      var scope_asset;
      var post_data;
      var api_config;
      var options;
      var xml;
      var id;
      var submit;
      var Element    = et.Element;
      var SubElement = et.SubElement;
      api_config     = req.project.get_api_config('version_one');
      // data should have data.title .description .severity .scope
      var required   = ["title", "name", "description", "severity", "scope"];
      _.each(required, function (element) {
        if (data[element] === undefined || data[element].length <= 0) {
          err = true;
        }
      });
      if (err === true) {
        v1_error = "Oops! You missed something. Please fill all fields.";
        res.render('defects.jade', {v1_response: v1_response, v1_error: v1_error});
        return;
      }
      data.description = data.description + "--- Defect Created By: " + data.name;
      asset = Element("Asset");
        name = SubElement(asset, "Attribute");
          name.attrib["name"] = "Name";
          name.attrib["act"] = "set";
          name.text = data.title;
        description = SubElement(asset, "Attribute");
          description.attrib["name"] = "Description";
          description.attrib["act"] = "set";
          description.text = data.description;
        scope = SubElement(asset, "Relation");
          scope.attrib["name"] = "Scope";
          scope.attrib["act"] = "set";
          scope_asset = SubElement(scope, "Asset");
            scope_asset.attrib["idref"] = "Scope:" + data.scope;
            scope_asset.attrib["href"] = api_config.name + "rest-1.v1/Data/Scope/" + data.scope;

        if (data.severity === "1-Critical") {
          severity_number = "73992";
        } else if (data.severity === "2-Major") {
          severity_number = "73993";
        } else if (data.severity === "3-Normal") {
          severity_number = "73994";
        } else if (data.severity === "4-Minor") {
          severity_number = "73995";
        }

        severity_relation = SubElement(asset, "Relation");
          severity_relation.attrib["name"] = "Custom_Severity";
          severity_relation.attrib["act"] = "set";
            severity_asset = SubElement(severity_relation, "Asset");
            severity_asset.attrib["href"] = api_config.name  + "/rest-1.v1/Data/Custom_DefectSeverity/" + severity_number;
            severity_asset.attrib["idref"] = "Custom_DefectSeverity:" + severity_number;

      post_data = et.tostring(asset);

      options = {
        method: 'POST',
        port: 443,
        headers: {
          'Authorization': "Basic " + new Buffer(api_config.auth).toString('base64')
        },
        host: api_config.host,
        path: '/' + api_config.name + '/rest-1.v1/Data/Defect',
        dont_stringify: true,
        post_data: post_data
      };

      utils.request_maker(options, function (err, response) {
        if (err) {
          console.error(response.data);
          xml         = et.parse(response.data);
          message     = xml._root._children[0].text;
          v1_error    = err + "\n" + message;
        }else{
          xml         = et.parse(response.data);
          url         = xml._root.attrib.href;
          id          = xml._root.attrib.id;
          v1_response = {id: id, url: url};
        }
        res.render('defects.jade', {v1_response: v1_response, v1_error: v1_error});
      });
    }
  );

  add_route('get',
    urls.DEVHEALTH,
    function(req, res) {
      res.render('devhealth.jade');
    });

  add_route('get',
    urls.RELEASE_NOTES,
    function(req, res) {
      var context = {notes: null, errors: null};
      var start   = req.query.start;
      var end     = req.query.end;
      var worker;
      var project;
      var poller_data;
      var jsonify = false;
      var rssify  = false;

      project = req.project;
      poller_data = project.get_data('release_notes');

      if (req.query.format) {
        switch (req.query.format.toLowerCase()) {
          case 'json':
            jsonify = true;
          break;
          case 'rss':
            rssify = true;
            end = poller_data ? poller_data.end : moment().subtract('minutes', 5);
            start = poller_data ? poller_data.start: end.clone().subtract('days', 7);
          break;
        }
      }

      var respond = function(err, results){
        var notes = [];
        var note;
        var i;
        var related_api = project.get_api_config('version_one');
        if (err){
          context.errors = err;
        }
        if (results){
          _.defaults(context, results);
        }

        for (i=0; i<context.notes.length; i++){
          note = context.notes[i];
          if (note.filter(start, end)) {
            if (jsonify) {
              notes.push(note.toJSON(related_api));
            }
            else {
              notes.push(note);
            }
          }
        }

        if (jsonify) {
          return res.json(notes);
        }
        context.notes = notes;
        context.last_crawl_time = results.end;

        if (rssify) {
          res.header('Content-Type', 'application/xml');
          return res.render('release_notes_xml.jade', context);
        }
        return res.render('release_notes.jade', context);
      };

      if(!start && !end){
        end = poller_data ? poller_data.end : moment().subtract('minutes', 5);
        start = poller_data ? poller_data.start: end.clone().subtract('days', 7);
        context.end = end;
        context.start = start;
        return res.render('release_notes.jade', context);
      }

      context.start = start;
      context.end = end;
      if (!start || !end){
        context.errors = "Supply start and end!";
        return res.render('release_notes.jade', context);
      }

      try{
        start = utils.validate_date(start);
      }catch(e){
        context.errors = "I could not parse start!";
        return respond();
      }

      try{
        end = utils.validate_date(end);
      }catch(e){
        context.errors = "I could not parse end!";
        return respond();
      }

      // we now know that the dates are valid
      context.start = start.toISOString();
      context.end = end.toISOString();

      if (poller_data && start >= poller_data.start && end <= poller_data.end) {
        return respond(null, poller_data);
      }
      worker = new ReleaseNotesWorker(start, end, project).work(respond);
  });

  add_route('get',
    urls.RELEASE_NOTES_TODAY,
    function(req, res) {
      var context = {notes: null, errors: null};
      var end = new Date();
      var start = moment(end.toISOString()).subtract('days', 1).toDate();
      var worker;
      var project;
      var poller_data;
      var jsonify = false;
      var rssify  = false;

      project = req.project;
      poller_data = project.get_data('release_notes');

      //TODO: This function is duplicated from above. We should abastract this.
      var respond = function(err, results){
        var notes = [];
        var note;
        var i;
        var related_api = project.get_api_config('version_one');
        if (err){
          context.errors = err;
        }
        if (results){
          _.defaults(context, results);
        }

        for (i=0; i<context.notes.length; i++){
          note = context.notes[i];
          if (note.filter(start, end)) {
            if (jsonify) {
              notes.push(note.toJSON(related_api));
            }
            else {
              notes.push(note);
            }
          }
        }

        if (jsonify) {
          return res.json(notes);
        }
        context.notes = notes;
        context.last_crawl_time = results.end;

        if (rssify) {
          res.header('Content-Type', 'application/xml');
          return res.render('release_notes_xml.jade', context);
        }
        return res.render('release_notes.jade', context);
      };

      if (req.query.format) {
        switch (req.query.format.toLowerCase()) {
          case 'json':
            jsonify = true;
          break;
          case 'rss':
            rssify = true;
            end = poller_data ? poller_data.end : moment().subtract('minutes', 5);
            start = poller_data ? poller_data.start: end.clone().subtract('days', 7);
          break;
        }
      }
      worker = new ReleaseNotesWorker(start, end, project).work(respond);
  });

  add_route('get',
    urls.INDEX,
    function(req, res) {
      var project = req.project;
      var events  = project.devops.events;
      var max     = 0;
      var now     = (new Date()).getTime();
      var event;
      var future_events = [];
      for (var i=0; i<events.length; i++){
        event = events[i];
        if (_.isNull(event.timestamp)){
          continue;
        }
        // convert to seconds
        event.seconds = event.timestamp * 1000;
        // get max
        if (event.seconds > max){
          max = event.seconds;
        }
        // make valid events list
        if (event.seconds > now){
          future_events.push(event);
        }
      }
      if (future_events.length > 1) {
        future_events.sort(function(x,y) {
          return y.timestamp < x.timestamp;
        });
      }
      _.each(future_events, function(event){
        event.days_remaining = Math.floor((event.seconds - now) / (1000*60*60*24));
        // figure out the amount and offset from the right 100px and from the left 25px
        var amt = ((event.seconds - now) / (max - now + 1)) * 0.8;
        event.position = amt * 100;
      });
      res.render('index.jade', {events: future_events, devops: project.devops});
  });
  add_route('get',
    urls.ABOUT,
    function(req, res) {
      res.render("about.jade", {name: "About"});
    });

  add_route('get',
    urls.META_INDEX,
    function(req, res) {
      var query_parse = url.parse(req.url).query;
      var query;
      var meta_index_projects = req.projects;
      var tags = [];
      var query_tags = [];
      var intersection;
      var tag_count = {};
      _.each(req.projects, function(project){
          if (!project.devops) {return;}
          tags = tags.concat(project.devops.tags);
      });
      _.each(tags, function(value, i) {
        if (tag_count[value]) {tag_count[value]++;}
        else {tag_count[value] = 1;}
      });
      if (query_parse) {
        meta_index_projects = [];
        query = query_parse.split('=')[1];
        query = decodeURIComponent(query).split(',');
        _.each(req.projects, function(project){
          if (!project.devops) {return;}
          project_tags = project.devops.tags;
          intersection = _.intersection(query, project_tags);
          if (intersection.length === query.length) {
             meta_index_projects.push(project);
          }
        });
      }
      var context = {
        name: 'Dashboards',
        projects: meta_index_projects,
        external_projects: settings.external_projects,
        links: settings.metadashboard_uris,
        tags: tag_count
      };
      res.render('meta_index.jade', context);
    });

  add_route('post',
    urls.META_INDEX,
    [express.bodyParser()],
    function(req, res) {
      var data  = req.body;
      var creds = {};
      var project;
      var id;

      var respond = function(err, project){
        var location = urls.META_INDEX;
        if (err) {
          log.error(err);
        }
        if (project && project.needs_creds){
          location += "?edit_project=" + project.id;
        }

        return res.redirect(location);
      };

      if (!data.id) {
        return projects.add_project(data.name, data.url, data.devops_json, data.creds, respond);
      }
      id = parseInt(data.id, 10);
      // lame workaround because forms can only POST and GET
      if (data.action === "Delete") {
        return projects.delete_project(id, respond);
      }

      _.each(data, function(value, name){
        if (name.indexOf(constants.EXTERNAL_TOKEN) === 0){
          var items      = name.split(constants.DELIMITER);
          var api_name   = items[1];
          var field_name = items[2];
          if (value === constants.EMPTY_FIELD){
            return;
          }
          creds[api_name] = creds[api_name] || {};
          creds[api_name][field_name] = value;
        }
      });

      if (_.isEmpty(creds)){
        creds = undefined;
      }
      return projects.update_project(id, data.name, data.url, data.devops_json, creds, respond);
    });

  add_route('post',
    urls.CRAWL,
    function (req, res) {
      projects.install(function (err, result) {
        return res.redirect(urls.META_INDEX);
      });
    });

  add_route('get',
    urls.SERVICE_HEALTH,
    function(req, res){
      var context = {};
      context.health = {
        healthy: "health-healthy",
        unhealthy: "health-unhealthy"
      };
      res.render('service_health.jade', context);
    });
  add_route('post',
    urls.SERVICE_HEALTH,
    [express.bodyParser()],
    function(req, res){
      var data    = req.body;
      var project = req.project;
      var context = {};
      if (req.body.hostname !== undefined) {
        // delete the host from the DB
        db.del_service_stat(project.name, req.body.hostname);
        context.hostname = {hostname: req.body.hostname};
      }
      context.health = {
        healthy: "health-healthy",
        unhealthy: "health-unhealthy"
      };
      res.render('service_health.jade', context);
    });
  add_route('get',
    urls.HIGH_SCORES,
    function(req, res){
      var correlated_data       = {};
      var project               = req.project;
      var start_date            = req.query.start;
      var end_date              = req.query.end;
      var all                   = req.query.all;
      var temp_date             = new Date();
      var query                 = req.query;
      var query_string          = "";
      var should_add_start_date = !(start_date || all);

      if (all && _.keys(query).length > 1) {
        return res.redirect("https://" + req.headers.host + req.path + "?all=true");
      }

      if (should_add_start_date) {
        start_date = new Date(temp_date.getFullYear(), temp_date.getMonth());
        query.start = start_date.toISOString();
        query_string = querystring.stringify(query);
        return res.redirect("https://" + req.headers.host + req.path + "?" + query_string);
      }

      db.get_highscores(project.name, start_date, end_date, function(errors, results){

        res.render('highscores.jade', {
          data: results,
          errors: errors,
          start: req.query.start,
          end: req.query.end,
          encodeURI: encodeURI,
          query_string: querystring.stringify(query)
        });
      });
    }
  );

  add_route('get',
    urls.HIGH_SCORES_BREAKDOWN,
    function (req, res) {
      var project = req.project;
      var username = req.params.username;
      var start_date = req.query.start;
      var end_date = req.query.end;

      var options = {
        breakdown: function(cb){
          db.get_highscore_breakdown(project.name, start_date, end_date, username, cb);
        },
        aliases: function(cb){
          db.get_aliases(username, cb);
        },
        api_user_dict: function (cb) {
          db.get_db().all('SELECT related_api FROM events WHERE user=? GROUP BY user;', [username], cb);
        },
        alias_display: function (cb) {
          db.get_db().get('SELECT * FROM alias_display WHERE display_name=?;', [username], cb);
        }
      };
      async.parallel(options, function(err, results){
        var aliases = {};

        _.each(results.api_user_dict, function(related_api) {
          aliases[related_api.related_api] = username;
        });

        _.each(results.aliases, function(alias){
          aliases[alias.related_api] = alias.alias;
        });

        var context = {
          display_name: username,
          alias_display_id: results.alias_display ? results.alias_display.id : null,
          events: results.breakdown,
          aliases: aliases,
          start: start_date,
          end: end_date,
          MULTIPLIERS: MULTIPLIERS,
          describe: events.describe,
          supported_apis: RELATED_APIS
        };
        res.render('highscores_breakdown.jade', context);
      });
    });

  add_route('post',
    urls.ADD_TITLE,
    [express.bodyParser()],
    function(req, res){
      var data = req.body;
      var db_queries = [];

      if (!data || !data.display_name || data.display_name.length <= 0){
        return res.redirect("back");
      }

      _.each(RELATED_APIS, function (related_api) {
        db_queries.push(function(cb) {
          if (data[related_api] && data[related_api].length > 0) {
            db.add_alias(data[related_api], data.display_name, related_api, data.alias_display_id, cb);
          }
          else {
            db.delete_alias(related_api, data.alias_display_id, cb);
          }
        });
      });

      async.parallel(db_queries, function(err, results) {
        var path;
        var parsed_url;
        var referer = req.header('referer');

        if (err) {
          log.error(err);
        }

        parsed_url = url.parse(referer);

        path = parsed_url.pathname.slice(0, parsed_url.pathname.lastIndexOf('/'));
        path += '/' + encodeURI(data.display_name);

        return res.redirect("https://" + parsed_url.host + path + "?" + parsed_url.query);
      });
  });

  add_route('post',
    urls.STATS_API,
    [middleware.vpn_only,
     express.bodyParser()],
    function(req, res) {
      var project = req.project;
      var data = req.body;
      var msg;
      //TODO: use swiz for this
      if (!data || _.isEmpty(data)){
        return res.send('You must give me data.  Did you specify the mime type?', 400);
      }
      //TODO: do we need to parse for safety?
      db.add_service_stat(project.name, req.socket.remoteAddress, data, function(err, results){
        if (err){
          log.error(err);
          return res.send('oh noes', 400);
        }
        res.json('OK');
      });
    });
};
