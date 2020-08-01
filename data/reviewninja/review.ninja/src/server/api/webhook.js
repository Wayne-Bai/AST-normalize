'use strict';
// module
var url = require('../services/url');
var github = require('../services/github');
var webhook = require('../services/webhook');
// models
var User = require('mongoose').model('User');

var contains = function(events) {
    var contains = true;
    config.server.github.webhook_events.forEach(function(event) {
        if(events.indexOf(event) === -1) {
            contains = false;
        }
    });
    return contains;
};

module.exports = {

    get: function(req, done) {

        var regex = /\/github\/webhook\/([0-9a-f]+)/;

        webhook.get(req.args.user, req.args.repo, req.user.token,
            function(err, hook) {

                if(err || !hook) {
                    return done(err, hook);
                }

                var match = regex.exec(hook.config.url);
                var user = match ? match[1] : null;

                User.findOne({_id: user}, function(err, user) {

                    if(err) {
                        return done(err, hook);
                    }

                    var token = user ? user.token : null;

                    github.call({
                        obj: 'repos',
                        fun: 'get',
                        arg: {
                            user: req.args.user,
                            repo: req.args.repo
                        },
                        token: token
                    }, function(err, repo) {
                        if((err && err.code === 401) || (!err && !repo.permissions) || (!err && !repo.permissions.admin) || !contains(hook.events)) {
                            // remove the webhook
                            github.call({
                                obj: 'repos',
                                fun: 'deleteHook',
                                arg: {
                                    user: req.args.user,
                                    repo: req.args.repo,
                                    id: hook.id
                                },
                                token: req.user.token
                            });

                            err = null;
                            hook = null;
                        }

                        done(err, hook);
                    });
                });
            }
        );
    },

    create: function(req, done) {
        User.findOne({uuid: req.args.user_uuid}, function(err, user) {

            if(err || !user) {
                return done(err);
            }

            github.call({
                obj: 'repos',
                fun: 'createHook',
                arg: {
                    user: req.args.user,
                    repo: req.args.repo,
                    name: 'web',
                    config: { url: url.webhook(user._id), content_type: 'json' },
                    events: config.server.github.webhook_events,
                    active: true
                },
                token: req.user.token
            }, done);
        });
    }
};
