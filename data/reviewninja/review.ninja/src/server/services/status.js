'use strict';
var url = require('./url');
var github = require('./github');
var Star = require('mongoose').model('Star');
var Repo = require('mongoose').model('Repo');
var Milestone = require('mongoose').model('Milestone');

module.exports = {
    update: function(args, done) {

        Repo.findOneAndUpdate({
            repo: args.repo_uuid
        }, {}, {
            upsert: true
        }, function(err, repo){

            repo = repo || {threshold: 1};

            Star.find({repo: args.repo_uuid, sha: args.sha}, function(err, stars) {

                stars = stars || [];

                Milestone.findOne({
                    pull: args.number,
                    repo: args.repo_uuid
                }, function(err, mile) {

                    github.call({
                        obj: 'issues',
                        fun: 'getMilestone',
                        arg: {
                            user: args.user,
                            repo: args.repo,
                            number: mile ? mile.number : null
                        },
                        token: args.token
                    }, function(err, githubMile) {

                        var issues = githubMile && mile.id === githubMile.id ? githubMile.open_issues : 0;
                        var reachedThreshold = stars.length >= repo.threshold;

                        var status = issues ? 'failure' : reachedThreshold ? 'success' : 'pending';
                        var diff = repo.threshold - stars.length;
                        var startext = reachedThreshold ? stars.length + (stars.length === 1 ? ' star, ' : ' stars, ')
                                                        : diff + (diff === 1 ? ' star' : ' stars') + ' needed, ';
                        github.call({
                            obj: 'statuses',
                            fun: 'create',
                            arg: {
                                user: args.user,
                                repo: args.repo,
                                sha: args.sha,
                                state: status,
                                description: 'ReviewNinja: ' + startext + issues + (issues === 1 ? ' issue' : ' issues'),
                                target_url: url.reviewPullRequest(args.user, args.repo, args.number),
                                context: 'code-review/reviewninja'
                            },
                            token: args.token
                        }, done);
                    });
                });
            });
        });
    }
};
