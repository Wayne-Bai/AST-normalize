'use strict';
// models
var User = require('mongoose').model('User');
var Milestone = require('mongoose').model('Milestone');

//services
var url = require('../services/url');
var github = require('../services/github');
var status = require('../services/status');
var milestone = require('../services/milestone');
var pullRequest = require('../services/pullRequest');
var notification = require('../services/notification');

//////////////////////////////////////////////////////////////////////////////////////////////
// Github Pull Request Webhook Handler
//////////////////////////////////////////////////////////////////////////////////////////////

module.exports = function(req, res) {

    var user = req.args.repository.owner.login;
    var repo = req.args.repository.name;
    var number = req.args.number;
    var sender = req.args.sender;
    var repo_uuid = req.args.repository.id;
    var sha = req.args.pull_request.head.sha;

    User.findOne({ _id: req.params.id }, function(err, ninja) {

        if(err || !ninja) {
            return res.status(404).send('User not found');
        }

        var actions = {
            opened: function() {
                status.update({
                    sha: sha,
                    user: user,
                    repo: repo,
                    number: number,
                    repo_uuid: repo_uuid,
                    token: ninja.token
                });

                notification.sendmail('pull_request_opened', user, repo, repo_uuid, ninja.token, number, {
                    user: user,
                    repo: repo,
                    number: number,
                    sender: sender,
                    settings: url.reviewSettings(user, repo),
                    url: url.reviewPullRequest(user, repo, number)
                });

                pullRequest.badgeComment(user, repo, repo_uuid, number);
            },
            synchronize: function() {
                status.update({
                    sha: sha,
                    user: user,
                    repo: repo,
                    number: number,
                    repo_uuid: repo_uuid,
                    token: ninja.token
                });

                notification.sendmail('pull_request_synchronized', user, repo, repo_uuid, ninja.token, number, {
                    user: user,
                    repo: repo,
                    number: number,
                    sender: sender,
                    settings: url.reviewSettings(user, repo),
                    url: url.reviewPullRequest(user, repo, number)
                });

                var event = user + ':' + repo + ':' + 'pull-request-' + number + ':synchronize';
                io.emit(event, sha);
            },
            closed: function() {
                if(req.args.pull_request.merged) {
                    var event = user + ':' + repo + ':' + 'pull-request-' + number + ':merged';
                    io.emit(event, number);
                }

                milestone.close(user, repo, repo_uuid, number, ninja.token);
            },
            reopened: function() {
                // a pull request you have reviewed has a been reopened
                // send messages to responsible users?
            }
        };

        if (actions[req.args.action]) {
            actions[req.args.action]();
        }

        res.end();
    });
};
