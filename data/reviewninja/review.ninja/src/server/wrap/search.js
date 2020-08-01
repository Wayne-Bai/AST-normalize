'use strict';
// modules
var async = require('async');
var github = require('../services/github');
var sugar = require('array-sugar');
// models
var User = require('mongoose').model('User');

module.exports = {

    repos: function(req, results, done) {

        var repos = [];

        User.findOne({ uuid: req.user.id }, function(err, user) {

            if(err || !user) {
                return done(null, repos);
            }

            async.each(results.items, function(result, call) {

                github.call({
                    obj: 'repos',
                    fun: 'one',
                    arg: { id: result.id },
                    token: req.user.token
                }, function(err, repo) {

                    if(repo && repo.permissions.push && !user.repos.contains(repo.id)) {
                        repos.push(repo);
                    }

                    return call(null);
                });

            }, function() {
                done(null, repos);
            });
        });
    }
};
