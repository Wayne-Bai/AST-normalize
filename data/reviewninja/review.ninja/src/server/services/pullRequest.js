'use strict';
var url = require('./url');
var github = require('./github');

var Repo = require('mongoose').model('Repo');

module.exports = {

    badgeComment: function(user, repo, repo_uuid, number) {

        Repo.findOneAndUpdate({
            repo: repo_uuid
        }, {}, {
            upsert: true
        }, function(err, settings) {

            if(!err && settings.comment && config.server.github.user) {

                var badgeUrl = url.pullRequestBadge(repo_uuid, number);
                var pullUrl = url.reviewPullRequest(user, repo, number);

                var badgelink = '<a href="' + pullUrl + '" target="_blank"><img src="' + badgeUrl + '" alt="ReviewNinja"/>';

                github.call({
                    obj: 'issues',
                    fun: 'createComment',
                    arg: {
                        user: user,
                        repo: repo,
                        number: number,
                        body: badgelink
                    },
                    basicAuth: {
                        user: config.server.github.user,
                        pass: config.server.github.pass
                    }
                });
            }
        });
    },

    isWatched: function(pull, settings) {

        // by default we are watching all branches
        var watched = !settings.watched.length;

        settings.watched.forEach(function(watch) {
            // escape all regex symbols except '*'
            var watchRegex = watch.replace(/[-[\]{}()+?.,\\^$|#\s]/g, '\\$&');
            // replace '*' with regex anything until next symbol (.*?)
            watchRegex = watchRegex.replace(/[*]/g, '(.*?)');
            var re = RegExp(watchRegex, 'g');
            if(re.exec(pull.base.ref) || re.exec(pull.head.ref)) {
                watched = true;
            }
        });
        return watched;
    }
};
