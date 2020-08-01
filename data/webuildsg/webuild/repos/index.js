'use strict';

var fs = require('fs');
var jf = require('jsonfile');
var mess = require('mess');
var request = require('request');
var Promise = require('promise');
var GitHubApi = require('github');
var whitelistUsers = require('./whitelistUsers');
var config = require('./config.js');
var moment = require('moment-timezone');
var github;
var clc = require('cli-color');

github = new GitHubApi({
  version: '3.0.0',
  debug: config.debug
});

if (config.github.clientID && config.github.clientSecret) {
  github.authenticate({
    type: 'oauth',
    key: config.github.clientID,
    secret: config.github.clientSecret
  });
}

function fetch(method, args, limit) {
  return new Promise(function(resolve, reject) {
    var items = [];
    method(args, function recv(err, res) {
      if (err) {
        if (err.code === 403) {
          console.log(clc.yellow('Warn: Github rate limited. Will try again.'));
          setTimeout(function() {
            console.log(clc.blue('Info: Retrying github'));
            method(args, recv);
          }, 60000);
        } else {
          reject(err);
        }
        return;
      }
      res.items
        .slice(0, limit - items.length)
        .forEach(function(item) {
          items.push(item);
          // console.log(items.length, item);
        });
      if (items.length >= limit || !github.hasNextPage(res)) {
        resolve(items);
      } else {
        github.getNextPage(res, recv);
      }
    });
  });
}

function chunk(arr, size) {
  if (size < 0) {
    throw Error('Invalid size');
  }
  var chunks = [];
  while (arr.length) {
    chunks.push(arr.splice(0, size));
  }
  return chunks;
}

function pushed3MonthsAgo() {
  return moment().subtract(3, 'months').format('YYYY-MM-DD');
}

function insertWhiteList(searchedUsers, whitelistUsers) {
  whitelistUsers.forEach(function(whitelistUser) {
    var found = searchedUsers.filter(function(searchedUser) {
        return searchedUser.login === whitelistUser.login;
      });
    if (found.length === 0) {
      //console.log("adding.. ", whitelistUser.login);
      searchedUsers.push(whitelistUser);
    }
  });
  return searchedUsers;
}

exports.feed = { repos: [] };

exports.config = config;

exports.update = function() {
  var pushedQuery = 'pushed:>' + pushed3MonthsAgo();

  console.log('Info: Updating the repos feed... this may take a while');
  return fetch(github.search.users, {
    q: 'location:' + config.github.location
  }, config.github.maxUsers)
  .then(function(users) {
    users = insertWhiteList(users, whitelistUsers);
    console.log(clc.blue('Info: Found ' + users.length + ' github.com users'));
    var searches = chunk(mess(users), 20).map(function(users) {
      return fetch(github.search.repos, {
        sort: 'updated',
        order: 'desc',
        q: [
          'stars:>=' + config.github.starLimit,
          'fork:true',
          pushedQuery
        ].concat(
          users
            .filter(function(user) {
              return !/"/.test(user.login);
            })
            .map(function(user) {
              return 'user:"' + user.login + '"';
            })
        ).join('+')
      }, config.github.maxRepos);
    });
    return Promise.all(searches);
  })
  .then(function(results) {
    var owners = {};
    return [].concat.apply([], results)
      .map(function(repo) {
        return {
          name: repo.name,
          html_url: repo.html_url,
          description: repo.description,
          pushed_at: repo.pushed_at,
          updated_at: repo.updated_at,
          language: repo.language,
          stargazers_count: repo.stargazers_count,
          owner: {
            login: repo.owner.login,
            avatar_url: repo.owner.avatar_url,
            html_url: repo.owner.html_url
          }
        };
      })
      .sort(function(a, b) {
        return a.pushed_at > b.pushed_at ? -1 : 1;
      })
      .filter(function(repo) {
        owners[ repo.owner.login ] = 1 + (owners[ repo.owner.login ] || 0);
        return owners[ repo.owner.login ] === 1;
      })
      .slice(0, config.github.maxRepos);
  })
  .then(function(repos) {
    console.log(clc.green('Success: Added ' + repos.length + ' GitHub repos'));
    var feed = {
      meta: {
        generated_at: new Date().toISOString(),
        location: config.github.location,
        total_repos: repos.length,
        api_version: 'v1',
        max_users: config.github.maxUsers,
        max_repos: config.github.maxRepos
      },
      repos: repos
    };
    exports.feed = feed;
    jf.writeFile(config.outfile, feed);
    return feed;
  })
  .catch(function(err) {
    console.error(err);
  });
};

fs.exists(config.outfile, function(exists) {
  if (exists) {
    jf.readFile(config.outfile, function(err, feed) {
      if (!err) {
        exports.feed = feed;
        console.log('Info: Loaded ' + feed.repos.length + ' repos from cache');
      }
    });
  } else {
    console.log(clc.blue('Info: Fetching public repos feed...'));
    request('http://webuild.sg/api/v1/repos', function(err, res, body) {
      if (!err && res.statusCode === 200) {
        var data = JSON.parse(body);
        exports.feed = data;
        jf.writeFile(config.outfile, data);
        console.log(clc.blue('Info: Saved %d repos to cache', data.repos.length));
      } else {
        if (res) {
          console.warn(clc.red('Error: Failed to retrieve data (Status code: %s)', res.statusCode));
        } else {
          console.warn(clc.red('Error: Failed to retrieve data (Status code: %s)', err));
        }
      }
    });
  }
});

exports.pushed3MonthsAgo = pushed3MonthsAgo;
