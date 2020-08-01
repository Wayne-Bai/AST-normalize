'use strict';
// module
var url = require('../services/url');
var github = require('../services/github');

module.exports = {

    get: function(user, repo, token, done) {

        var regex = new RegExp(url.baseWebhook + '([0-9a-f]+)');

        github.call({
            obj: 'repos',
            fun: 'getHooks',
            arg: {
                user: user,
                repo: repo
            },
            token: token
        }, function(err, hooks) {
            var hook = null;
            if(!err) {
                hooks.forEach(function(webhook) {
                    if(webhook.config.url && regex.exec(webhook.config.url)) {
                        hook = webhook;
                    }
                });
            }
            done(err, hook);
        });
    }
};
