// Load modules

var Project = require('./project');
var Task = require('./task');


// Declare internals

var internals = {};


// Last information for project (with tasks)

exports.getProject = {

    handler: function (request, reply) {

        exports.load(this.db, request.auth.credentials.user, function (err, last) {

            if (err) {
                return reply(err);
            }

            if (!last ||
                !last.projects ||
                !last.projects[request.params.id]) {

                return reply({ id: request.auth.credentials.user, projects: {} });
            }

            var record = { id: last._id, projects: {} };
            record.projects[request.params.id] = last.projects[request.params.id];
            return reply(record);
        });
    }
};


// Set last project timestamp

exports.postProject = {

    handler: function (request, reply) {

        var self = this;

        Project.load(this.db, request.params.id, request.auth.credentials.user, false, function (err, project, member) {

            if (err || !project) {
                return reply(err);
            }

            exports.setLast(self.db, request.auth.credentials.user, project, null, function (err) {

                if (err) {
                    return reply(err);
                }

                return reply({ status: 'ok' });
            });
        });
    }
};


// Last information for single task

exports.getTask = {

    handler: function (request, reply) {

        var self = this;

        Task.load(this.db, request.params.id, request.auth.credentials.user, false, function (err, task, project) {

            if (err || !task) {
                return reply(err);
            }

            exports.load(self.db, request.auth.credentials.user, function (err, last) {

                if (err) {
                    return reply(err);
                }

                if (!last ||
                    !last.projects ||
                    !last.projects[task.project] ||
                    !last.projects[task.project].tasks ||
                    !last.projects[task.project].tasks[request.params.id]) {

                    return reply({ id: request.auth.credentials.user, projects: {} });
                }

                var record = { id: last._id, projects: {} };
                record.projects[task.project] = { tasks: {} };
                record.projects[task.project].tasks[request.params.id] = last.projects[task.project].tasks[request.params.id];
                return reply(record);
            });
        });
    }
};


// Set last task timestamp

exports.postTask = {
    handler: function (request, reply) {

        var self = this;

        Task.load(this.db, request.params.id, request.auth.credentials.user, false, function (err, task, project) {

            if (err || !task) {
                return reply(err);
            }

            exports.setLast(self.db, request.auth.credentials.user, project, task, function (err) {

                return reply(err || { status: 'ok' });
            });
        });
    }
};


// Load user last timestamps

exports.load = function (db, userId, callback) {

    db.get('user.last', userId, function (err, item) {

        if (err) {
            return callback(err);
        }

        if (!item) {
            return callback(null, null);
        }

        return callback(null, item);
    });
};


// Clear project last

exports.delProject = function (db, userId, projectId, callback) {

    var self = this;

    exports.load(db, userId, function (err, last) {

        if (err ||
            !last ||
            !last.projects ||
            !last.projects[projectId]) {

            return callback(err);
        }

        var changes = { $unset: {} };
        changes.$unset['projects.' + projectId] = 1;

        self.db.update('user.last', last._id, changes, function (err) {

            return callback(err);
        });
    });
};


// Set last timestamp

exports.setLast = function (db, userId, project, task, callback) {

    var now = Date.now();

    exports.load(db, userId, function (err, last) {

        if (err) {
            return callback(err);
        }

        if (last) {

            // Existing last record

            var changes = { $set: {} };

            if (task === null) {

                // Project last: last->projects.{projectId}.last

                if (last.projects) {
                    if (last.projects[project._id]) {
                        changes.$set['projects.' + project._id + '.last'] = now;
                    }
                    else {
                        changes.$set['projects.' + project._id] = { tasks: {}, last: now };
                    }
                }
                else {
                    changes.$set.projects = {};
                    changes.$set.projects[project._id] = { tasks: {}, last: now };
                }
            }
            else {

                // Task last: last->projects.{projectId}.tasks.{taskId}

                if (last.projects) {
                    if (last.projects[project._id]) {
                        if (last.projects[project._id].tasks) {
                            changes.$set['projects.' + project._id + '.tasks.' + task._id] = now;
                        }
                        else {
                            changes.$set['projects.' + project._id + '.tasks'] = {};
                            changes.$set['projects.' + project._id + '.tasks'][task._id] = now;
                        }
                    }
                    else {
                        changes.$set['projects.' + project._id] = { tasks: {} };
                        changes.$set['projects.' + project._id].tasks[task._id] = now;
                    }
                }
                else {
                    changes.$set.projects = {};
                    changes.$set.projects[project._id] = { tasks: {} };
                    changes.$set.projects[project._id].tasks[task._id] = now;
                }
            }

            db.update('user.last', last._id, changes, function (err) {

                return callback(err);
            });
        }
        else {

            // First last timestamp

            last = { _id: userId, projects: {} };
            last.projects[project._id] = { tasks: {} };

            if (task === null) {
                last.projects[project._id].last = now;
            }
            else {
                last.projects[project._id].tasks[task._id] = now;
            }

            db.insert('user.last', last, function (err, items) {

                return callback(err);
            });
        }
    });
};


// Remove entire last record

exports.delUser = function (db, userId, callback) {

    db.remove('user.last', userId, callback);
};



