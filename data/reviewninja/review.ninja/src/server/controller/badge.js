'use strict';
var express = require('express');
var ejs = require('ejs');
var fs = require('fs');
var router = express.Router();

// services
var github = require('../services/github');

// models
var Star = require('mongoose').model('Star');
var Milestone = require('mongoose').model('Milestone');

//////////////////////////////////////////////////////////////////////////////////////////////
// Badge controller
//////////////////////////////////////////////////////////////////////////////////////////////

router.all('/:repoId/pull/:number/badge', function(req, res) {

    //
    // Helper functions
    //

    function addAuth(options) {
        if(config.server.github.user && config.server.github.pass) {
            options.basicAuth = {
                user: config.server.github.user,
                pass: config.server.github.pass
            };
        }
    }

    Milestone.findOne({
        pull: req.params.number,
        repo: req.params.repoId
    }, function(err, mile) {

        var options = {
            obj: 'repos',
            fun: 'one',
            arg: {
                id: req.params.repoId
            }
        };
        addAuth(options);

        github.call(options, function(err, githubRepo) {
            if(err) {
                return res.status(304).send();
            }

            var options = {
                obj: 'issues',
                fun: 'getMilestone',
                arg: {
                    user: githubRepo.owner.login,
                    repo: githubRepo.name,
                    number: mile ? mile.number : null
                }
            };
            addAuth(options);

            github.call(options, function(err, githubMile) {

                var issues = githubMile && mile.id === githubMile.id ? githubMile.open_issues : 0;

                var options = {
                    obj: 'pullRequests',
                    fun: 'get',
                    arg: {
                        user: githubRepo.owner.login,
                        repo: githubRepo.name,
                        number: req.params.number
                    }
                };
                addAuth(options);

                github.call(options, function(err, githubPullRequest) {
                    Star.find({sha: githubPullRequest ? githubPullRequest.head.sha : null, repo: githubRepo.id}, function(err, stars) {
                        if(err) {
                            return res.status(304).send();
                        }

                        var hash = require('crypto').createHash('md5').update(stars.length + ':' + issues, 'utf8').digest('hex');

                        if(req.get('If-None-Match') === hash) {
                            return res.status(304).send();
                        }

                        res.set('Content-Type', 'image/svg+xml');
                        res.set('Cache-Control', 'no-cache');
                        res.set('Etag', hash);

                        var tmp = fs.readFileSync('src/server/templates/badge.svg', 'utf-8');
                        var svg = ejs.render(tmp, {stars: stars.length, openIssues: issues});
                        res.send(svg);
                    });
                });
            });
        });
    });
});

module.exports = router;
