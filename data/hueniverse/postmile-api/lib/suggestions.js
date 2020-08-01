// Load modules

var Boom = require('boom');
var Rules = require('./rules');
var Project = require('./project');


// Declare internals

var internals = {};


// Suggestions cache

internals.suggestions = {};


// Pre-load all suggestions into cache

exports.initialize = function (db) {

    db.all('suggestion', function (err, results) {

        for (var i = 0, il = results.length; i < il; ++i) {
            var suggestion = results[i];
            if (suggestion.rule &&
                suggestion.title) {

                var statement = Rules.normalize(suggestion.rule);
                if (statement) {
                    suggestion.statement = statement;
                    internals.suggestions[suggestion._id] = suggestion;
                }
                else {
                    console.log('Failed to load suggestions: ' + suggestion._id);
                }
            }
            else {
                console.log('Bad suggestion: missing rule or title');
            }
        }
    });
};


// Remove suggestion from project

exports.exclude = {
    handler: function (request, reply) {

        var self = this;

        Project.load(this.db, request.params.id, request.auth.credentials.user, false, function (err, project, member) {

            if (err || !project) {
                return reply(err);
            }

            var suggestion = internals.suggestions[request.params.drop];
            if (!suggestion) {
                return reply(Boom.notFound());
            }

            self.db.get('user.exclude', request.auth.credentials.user, function (err, excludes) {

                if (err) {
                    return reply(err);
                }

                if (excludes) {

                    // Existing excludes

                    var changes = { $set: {} };
                    var now = Date.now();

                    if (excludes.projects) {
                        if (excludes.projects[project._id]) {
                            if (excludes.projects[project._id].suggestions) {
                                changes.$set['projects.' + project._id + '.suggestions.' + request.params.drop] = now;
                            }
                            else {
                                changes.$set['projects.' + project._id + '.suggestions'] = {};
                                changes.$set['projects.' + project._id + '.suggestions'][request.params.drop] = now;
                            }
                        }
                        else {
                            changes.$set['projects.' + project._id] = { suggestions: {} };
                            changes.$set['projects.' + project._id].suggestions[request.params.drop] = now;
                        }
                    }
                    else {
                        changes.$set.projects = {};
                        changes.$set.projects[project._id] = { suggestions: {} };
                        changes.$set.projects[project._id].suggestions[request.params.drop] = now;
                    }

                    self.db.update('user.exclude', excludes._id, changes, function (err) {

                        return reply(err || { status: 'ok' });
                    });
                }
                else {

                    // First exclude

                    excludes = { _id: request.auth.credentials.user, projects: {} };
                    excludes.projects[project._id] = { suggestions: {} };
                    excludes.projects[project._id].suggestions[request.params.drop] = Date.now();

                    self.db.insert('user.exclude', excludes, function (err, items) {

                        return reply(err || { status: 'ok' });
                    });
                }
            });
        });
    }
};


// Analyze project and return suggestions list

exports.list = function (db, project, userId, callback) {

    db.get('user.exclude', userId, function (err, item) {

        if (err) {
            return callback(err, null);
        }

        var results = [];
        var excludes = item;
        for (var i in internals.suggestions) {
            if (internals.suggestions.hasOwnProperty(i)) {
                var suggestion = internals.suggestions[i];

                var isExcluded = false;
                if (excludes &&
                    excludes.projects &&
                    excludes.projects[project._id] &&
                    excludes.projects[project._id].suggestions &&
                    excludes.projects[project._id].suggestions[suggestion._id]) {

                    isExcluded = true;
                }

                if (isExcluded === false) {
                    try {
                        if (eval(suggestion.statement)) {
                            results.push({
                                id: suggestion._id,
                                title: suggestion.title,
                                isSponsored: suggestion.isSponsored
                            });
                        }
                    }
                    catch (e) {
                        // Bad rule
                        console.log('Bad suggestion rule:' + suggestion._id);
                    }
                }
            }
        }

        return callback(null, results);
    });
};


// Get suggestion

exports.get = function (suggestionId, callback) {

    callback(internals.suggestions[suggestionId]);
};


// Remove entire exclude record

exports.delUser = function (db, userId, callback) {

    db.remove('user.exclude', userId, callback);
};
