'use strict';

var fs = require('fs');
var ejs = require('ejs');
var github = require('../services/github');

module.exports = {
  createRepo: function(token, username, done) {
    github.call({
      obj: 'repos',
      fun: 'create',
      arg: {
        name: 'ReviewNinja-Welcome',
        description: 'Welcome repo for ReviewNinja to help you get started. Feel free to delete when you\'re done, we won\'t take it personally.'
      },
      token: token
    }, done);
  },

  createFile: function(token, username, done) {

    var content = '# ReviewNinja-Welcome';

    github.call({
      obj: 'repos',
      fun: 'createFile',
      arg: {
        user: username,
        repo: 'ReviewNinja-Welcome',
        path: 'ReadMe.md',
        message: 'Initial commit',
        content: new Buffer(content).toString('base64'),
        branch: 'master'
      },
      token: token
    }, done);
  },

  getBranch: function(username, done) {
    github.call({
      obj: 'gitdata',
      fun: 'getReference',
      arg: {
        user: username,
        repo: 'ReviewNinja-Welcome',
        ref: 'heads/master'
      }
    }, done);
  },

  createBranch: function(token, username, sha, done) {
    github.call({
      obj: 'gitdata',
      fun: 'createReference',
      arg: {
        user: username,
        repo: 'ReviewNinja-Welcome',
        ref: 'refs/heads/' + username + '-patch-1',
        sha: sha
      },
      token: token
    }, done);
  },

  getFile: function(username, done) {
    github.call({
      obj: 'repos',
      fun: 'getContent',
      arg: {
        user: username,
        repo: 'ReviewNinja-Welcome',
        ref: 'refs/heads/' + username + '-patch-1',
        path: 'ReadMe.md'
      }
    }, done);
  },

  updateFile: function(token, username, sha, done) {

    var file = fs.readFileSync('src/server/templates/onboarding.ejs', 'utf-8');
    var content = ejs.render(file);

    github.call({
      obj: 'repos',
      fun: 'updateFile',
      arg: {
        user: username,
        repo: 'ReviewNinja-Welcome',
        path: 'ReadMe.md',
        message: 'Update ReadMe.md',
        content: new Buffer(content).toString('base64'),
        sha: sha,
        branch: username + '-patch-1'
      },
      token: token
    }, done);
  },

  createPullRequest: function(token, username, done) {
    github.call({
      obj: 'pullRequests',
      fun: 'create',
      arg: {
        user: username,
        repo: 'ReviewNinja-Welcome',
        title: 'Review this to get started',
        base: 'master',
        head: username + '-patch-1'
      },
      token: token
    }, done);
  },

  getRepo: function(token, username, done) {
    github.call({
      obj: 'repos',
      fun: 'get',
      arg: {
        user: username,
        repo: 'ReviewNinja-Welcome'
      },
      token: token
    }, done);
  }
};
