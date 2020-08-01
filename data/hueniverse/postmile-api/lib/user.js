// Load modules

var Hoek = require('hoek');
var Boom = require('boom');
var Joi = require('joi');
var Email = require('./email');
var Invite = require('./invite');
var Last = require('./last');
var Session = require('./session');
var Project = require('./project');
var Sort = require('./sort');
var Storage = require('./storage');
var Suggestions = require('./suggestions');
var Utils = require('./utils');


// Declare internals

var internals = {};


// Forbidden usernames

internals.forbiddenUsernames = {
    about: true,
    account: true,
    auth: true,
    blog: true,
    copyright: true,
    css: true,
    developer: true,
    gallery: true,
    guide: true,
    help: true,
    images: true,
    imwithstupid: true,
    login: true,
    logout: true,
    privacy: true,
    scripts: true,
    script: true,
    search: true,
    signup: true,
    support: true,
    terms: true,
    test: true,
    tos: true,
    view: true,
    welcome: true
};


// Current user information

exports.get = {
    auth: {
        tos: false
    },
    handler: function (request, reply) {

        exports.load(this.db, request.auth.credentials.user, function (err, user) {

            if (!user) {
                return reply(err);
            }

            Utils.removeKeys(user, ['contacts', 'origin', 'tos', 'tickets']);
            return reply(user);
        });
    }
};


// Change profile properties

exports.post = {
    validate: {
        payload: {
            name: Joi.string(),
            username: Joi.string().allow('')
        }
    },
    auth: {
        tos: false
    },
    handler: function (request, reply) {

        var self = this;

        exports.load(this.db, request.auth.credentials.user, function (err, user) {

            if (err || !user) {
                return reply(err);
            }

            // Remove identical username

            if (request.payload.username &&
                request.payload.username === user.username) {

                delete request.payload.username;
            }

            // Lookup username

            if (request.payload.username) {
                internals.checkUsername(self.db, request.payload.username, function (err, lookupUser) {

                    if (!err ||
                        err.code !== Boom.notFound().code) {

                        return reply(typeof err === 'string' ? Boom.badRequest('Invalid username: ' + err) : err);
                    }

                    self.db.update('user', user._id, self.db.toChanges(request.payload), function (err) {

                        if (err) {
                            return reply(err);
                        }

                        self.streamer.update({ object: 'profile', user: user._id }, request);
                        return reply({ status: 'ok' });
                    });
                });
            }
            else {
                self.db.update('user', user._id, self.db.toChanges(request.payload), function (err) {

                    if (err) {
                        return reply(err);
                    }

                    self.streamer.update({ object: 'profile', user: user._id }, request);
                    return reply({ status: 'ok' });
                });
            }
        });
    }
};


// Change profile email settings

exports.email = {
    validate: {
        payload: {
            address: Joi.string().required(),
            action: Joi.string().required().valid('remove', 'primary', 'add', 'verify')
        }
    },
    auth: {
        tos: false
    },
    handler: function (request, reply) {

        var self = this;

        var address = request.payload.address.toLowerCase();
        exports.load(this.db, request.auth.credentials.user, function (err, user) {

            if (err || !user) {
                return reply(err);
            }

            // Find the address

            var isFound = false;
            user.emails = user.emails || [];
            for (var i = 0, il = user.emails.length; i < il; ++i) {
                if (user.emails[i].address === address) {
                    isFound = true;
                    break;
                }
            }

            if (request.payload.action === 'add') {

                // Add

                if (isFound) {
                    return reply(Boom.badRequest('Address already present'));
                }

                // Check is already used by someone else

                self.db.count('user', { 'emails.address': address }, function (err, count) {

                    if (err) {
                        return reply(err);
                    }

                    if (count) {
                        return reply(Boom.badRequest('Email already assigned to another account'));
                    }

                    // Save

                    self.db.update('user', user._id, { '$push': { emails: { address: address, isVerified: false } } }, function (err) {

                        if (err) {
                            return reply(err);
                        }

                        Email.sendValidation(self, user, address, function (err) {

                            // Ignore errors

                            self.streamer.update({ object: 'profile', user: user._id }, request);
                            return reply({ status: 'ok' });
                        });
                    });
                });
            }
            else if (request.payload.action === 'primary') {

                // Primary

                if (!isFound) {
                    return reply(Boom.notFound('No such email address'));
                }

                // Check if current primary

                if (i === 0) {
                    return reply(Boom.badRequest('Address already primary'));
                }

                // Check if verified

                if (!user.emails[i].isVerified) {
                    return reply(Boom.badRequest('Email must be verified before made primary'));
                }

                // Remove from list

                user.emails.splice(i, 1);

                // Add back at head

                user.emails.unshift({ address: address, isVerified: true });

                // OVerride entire array

                self.db.update('user', user._id, { '$set': { 'emails': user.emails } }, function (err) {

                    if (err) {
                        return reply(err);
                    }

                    self.streamer.update({ object: 'profile', user: user._id }, request);
                    return reply({ status: 'ok' });
                });
            }
            else if (request.payload.action === 'remove') {

                // Remove

                if (!isFound) {
                    return reply(Boom.notFound('No such email address'));
                }

                // Check if current primary

                if (i === 0) {
                    return reply(Boom.badRequest('Cannot remove primary address'));
                }

                if (user.emails.length <= 1) {
                    return reply(Boom.badRequest('Cannot remove the only address present'));
                }

                // Save

                self.db.update('user', user._id, { '$pull': { emails: { address: address } } }, function (err) {

                    if (err) {
                        return reply(err);
                    }

                    self.streamer.update({ object: 'profile', user: user._id }, request);
                    return reply({ status: 'ok' });
                });
            }
            else if (request.payload.action === 'verify') {

                // Verify

                if (!isFound) {
                    return reply(Boom.notFound('No such email address'));
                }

                if (user.emails[i].isVerified) {
                    return reply(Boom.badRequest('Account already verified'));
                }

                Email.sendValidation(self, user, address, function (err) {

                    if (err) {
                        return reply(err);
                    }

                    return reply({ result: 'ok' });
                });
            }
        });
    }
};


// Current user contacts list

exports.contacts = {
    validate: {
        query: {
            exclude: Joi.string()
        }
    },
    auth: {
        tos: false
    },
    handler: function (request, reply) {

        var self = this;

        var load = function () {

            if (request.query.exclude) {
                Project.load(self.db, request.query.exclude, request.auth.credentials.user, false, function (err, project, member) {

                    if (err) {
                        return reply(err);
                    }

                    getList(Project.participantsMap(project));
                });
            }
            else {
                getList(null);
            }
        };

        var getList = function (exclude) {

            exports.load(self.db, request.auth.credentials.user, function (err, user) {

                if (err || !user) {
                    return reply(err);
                }

                var userIds = [];
                for (var i in user.contacts) {
                    if (user.contacts.hasOwnProperty(i)) {
                        if (user.contacts[i].type === 'user' &&
                            (exclude === null || exclude.users[i] !== true)) {

                            userIds.push(i);
                        }
                    }
                }

                exports.expandIds(self.db, userIds, function (users, usersMap) {

                    var contacts = [];
                    for (var i in user.contacts) {
                        if (user.contacts.hasOwnProperty(i)) {
                            var contact = null;
                            if (user.contacts[i].type === 'user') {

                                // Registered user

                                contact = usersMap[i];
                                if (contact) {
                                    contact.type = 'user';
                                    contact.last = user.contacts[i].last;
                                    contacts.push(contact);
                                }
                            }
                            else if (user.contacts[i].type === 'email') {

                                // Email contact

                                var email = self.db.decodeKey(i);
                                if (exclude === null ||
                                    exclude.emails[email] !== true) {

                                    contact = {
                                        id: email,
                                        display: email,
                                        last: user.contacts[i].last,
                                        type: 'email'
                                    };

                                    contacts.push(contact);
                                }
                            }
                        }
                    }

                    contacts.sort(function (a, b) {

                        if (a.last > b.last) {
                            return -1;
                        }

                        if (a.last < b.last) {
                            return 1;
                        }

                        return 0;
                    });

                    return reply(contacts);
                });
            });
        };

        load();
    }
};


// Who am I?

exports.who = {
    auth: {
        tos: false
    },
    handler: function (request, reply) {

        return reply({ user: request.auth.credentials.user });
    }
};


// Register new user

exports.put = {
    validate: {
        query: {
            invite: Joi.string().required()
        },
        payload: {
            username: Joi.string(),
            name: Joi.string(),
            network: Joi.array().includes(Joi.string()),
            email: Joi.string().email()
        }
    },
    auth: {
        scope: 'signup',
        entity: 'app'
    },
    handler: function (request, reply) {

        var self = this;

        // Check invitation code

        var inviteId = null;
        var origin = null;
        var projectPid = null;

        var email = null;
        var isEmailVerified = null;

        var add = function () {

            // Check code source (invite or project participation)

            if (request.query.invite.indexOf('project:') !== 0) {

                // Invite code

                Invite.load(self.db, request.query.invite, function (err, invite) {

                    if (err) {
                        return reply(err);
                    }

                    inviteId = invite._id;
                    origin = { type: 'invite', invite: inviteId };
                    return validate();
                });

                return;
            }

            // Project participation

            var inviteRegex = /^project:([^:]+):([^:]+):([^:]+)$/;
            var parts = inviteRegex.exec(request.query.invite);
            if (!parts ||
                parts.length !== 4) {

                return reply(Boom.badRequest('Invalid invitation format'));
            }

            var projectId = parts[1];
            var pid = parts[2];
            var code = parts[3];

            // Load project (not using Project.load since there is no active user)

            self.db.get('project', projectId, function (err, project) {

                if (err || !project) {
                    return reply(err);
                }

                // Lookup code

                for (var i = 0, il = project.participants.length; i < il; ++i) {
                    if (project.participants[i].pid &&
                        project.participants[i].pid === pid) {

                        if (!project.participants[i].code ||
                            project.participants[i].code !== code) {

                            // Invalid code
                            break;
                        }

                        projectPid = project.participants[i];
                        projectPid.project = project;                // Pass on for later use

                        origin = { type: 'project', project: project._id };

                        if (project.participants[i].inviter) {
                            origin.user = project.participants[i].inviter;
                        }

                        break;
                    }
                }

                if (!origin) {
                    return reply(Boom.badRequest('Invalid invitation code'));
                }

                return validate();
            });
        };

        var validate = function () {

            // Look for email address

            email = (request.payload.email ? request.payload.email : (projectPid && projectPid.email ? projectPid.email : null));
            isEmailVerified = (projectPid && projectPid.email && projectPid.email === email ? true : false);

            // Check for at least one identifier

            if (!request.payload.network &&
                !email) {

                return reply(Boom.badRequest('Must include either a network id or email address'));
            }

            if (!email) {
                return validateNetwork();
            }

            self.db.count('user', { 'emails.address': email }, function (err, count) {

                if (err) {
                    return reply(err);
                }

                if (count) {
                    return reply(Boom.badRequest('Email address already linked to an existing user'));
                }

                return validateNetwork();
            });
        };

        var validateNetwork = function () {

            if (!request.payload.network) {
                return validateUsername();
            }

            if (request.payload.network.length !== 2) {
                return reply(Boom.badRequest('Bad network array size'));
            }

            var network = request.payload.network[0];
            var networkId = request.payload.network[1];

            if (!networkId) {
                return reply(Boom.badRequest('Empty network id'));
            }

            if (['twitter', 'facebook', 'yahoo'].indexOf(network) === -1) {
                return reply(Boom.badRequest('Unknown network'));
            }

            var criteria = {};
            criteria[request.payload.network[0]] = request.payload.network[1];
            self.db.count('user', criteria, function (err, count) {

                if (err) {
                    return reply(err);
                }

                if (count) {
                    return reply(Boom.badRequest(request.payload.network[0].replace(/^\w/, function ($0) { return $0.toUpperCase(); }) + ' account already linked to an existing user'));
                }

                return validateUsername();
            });
        };

        var validateUsername = function () {

            if (!request.payload.username) {
                return createAccount();
            }

            internals.checkUsername(self.db, request.payload.username, function (err, lookupUser) {

                if (!err ||
                    err.code !== Boom.notFound().code) {

                    return reply(typeof err === 'string' ? Boom.badRequest('Invalid username: ' + err) : err);
                }

                return createAccount();
            });
        };

        var createAccount = function () {

            var user = { origin: origin };

            if (request.payload.name) {
                user.name = request.payload.name;
            }

            if (request.payload.username) {
                user.username = request.payload.username;
            }

            if (email) {
                user.emails = [{ address: email, isVerified: isEmailVerified }];
            }

            if (request.payload.network) {
                user[request.payload.network[0]] = request.payload.network[1];
            }

            self.db.insert('user', user, function (err, items) {

                if (err) {
                    return reply(err);
                }

                if (items.length !== 1 ||
                    !items[0]._id) {

                    return reply(Boom.internal('Failed to retrieve new user id', user));
                }

                var userId = items[0]._id;
                if (inviteId) {
                    // Decrease invitation count
                    self.db.update('invite', inviteId, { $inc: { count: 1 } }, function (err) { });
                }

                if (!projectPid) {
                    return sendWelcome(items[0]);
                }

                // Update project with new participant

                Project.replacePid(self.db, projectPid.project, projectPid.pid, userId, function (err) {

                    if (err) {
                        return reply(err);
                    }

                    self.streamer.update({ object: 'project', project: projectPid.project._id }, request);
                    return sendWelcome(items[0]);
                });
            });
        };

        var sendWelcome = function (user) {

            // Send welcome email (also serves as verification email)

            Email.sendWelcome(self, user, function (err) {    // Ignore error

                return reply({ status: 'ok', id: user._id });
            });
        };

        add();
    }
};


// Set Terms of Service version

exports.tos = {
    auth: {
        tos: false,
        scope: 'tos',
        entity: 'app'
    },
    handler: function (request, reply) {

        var self = this;

        exports.load(this.db, request.params.id, function (err, user) {

            if (err || !user) {
                return reply(err);
            }

            user.tos = user.tos || {};
            user.tos[request.params.version] = Date.now();
            self.db.update('user', user._id, { $set: { 'tos': user.tos } }, function (err) {

                return reply(err || { status: 'ok' });
            });
        });
    }
};


// Link other account

exports.link = {
    validate: {
        payload: {
            id: Joi.string().required()
        }
    },
    auth: {
        scope: 'login',
        entity: 'app'
    },
    handler: function (request, reply) {

        var self = this;

        if (['twitter', 'facebook', 'yahoo'].indexOf(request.params.network) === -1) {
            return reply(Boom.badRequest('Unknown network'));
        }

        exports.load(this.db, request.params.id, function (err, user) {

            if (err || !user) {
                return reply(err);
            }

            // Check if already has a linked account for this network

            if (user[request.params.network]) {
                return reply(Boom.badRequest('Network already linked'));
            }

            // Check if already assigned to someone else

            var criteria = {};
            criteria[request.params.network] = request.params.id;

            self.db.count('user', criteria, function (err, count) {

                if (err) {
                    return reply(err);
                }

                if (count) {
                    return reply(Boom.badRequest('Network id already linked to another user'));
                }

                var changes = { $set: {} };
                changes.$set[request.params.network] = request.payload.id;

                self.db.update('user', user._id, changes, function (err) {

                    if (err) {
                        return reply(err);
                    }

                    self.streamer.update({ object: 'profile', user: user._id }, request);
                    return reply({ status: 'ok' });
                });
            });
        });
    }
};


// Unlink other account

exports.unlink = {
    auth: {
        scope: 'login',
        entity: 'app'
    },
    handler: function (request, reply) {

        var self = this;

        if (['twitter', 'facebook', 'yahoo'].indexOf(request.params.network) === -1) {
            return reply(Boom.badRequest('Unknown network'));
        }

        exports.load(this.db, request.params.id, function (err, user) {

            if (err || !user) {
                return reply(err);
            }

            // Is set?

            if (!user[request.params.network]) {
                return reply(Boom.badRequest('Account not linked'));
            }

            // Is last (and no email)

            var linkCount = (user.facebook ? 1 : 0) + (user.twitter ? 1 : 0) + (user.yahoo ? 1 : 0);

            if ((!user.emails || !user.emails.length) &&
                linkCount <= 1) {

                return reply(Boom.badRequest('Cannot remove last linked account'));
            }

            var changes = { $unset: {} };
            changes.$unset[request.params.network] = 1;

            self.db.update('user', user._id, changes, function (err) {

                if (err) {
                    return reply(err);
                }

                self.streamer.update({ object: 'profile', user: user._id }, request);
                return reply({ status: 'ok' });
            });
        });
    }
};


// Set default view

exports.view = {
    auth: {
        scope: 'view',
        entity: 'app'
    },
    handler: function (request, reply) {

        var self = this;

        exports.load(this.db, request.params.id, function (err, user) {

            if (err || !user) {
                return reply(err);
            }

            self.db.update('user', user._id, { $set: { 'view': request.params.path } }, function (err) {

                return reply(err || { status: 'ok' });
            });
        });
    }
};


// Lookup user based on account and type

exports.lookup = {
    auth: false,
    handler: function (request, reply) {

        if (request.params.type === 'username') {
            internals.checkUsername(this.db, request.params.id, function (err, lookupUser) {

                if (!lookupUser) {
                    return reply(typeof err === 'string' ? Boom.badRequest(err) : err);
                }

                return reply({ user: lookupUser._id });
            });
        }
        else if (request.params.type === 'email') {
            if (!Email.checkAddress(request.params.id)) {
                return reply(Boom.badRequest('Invalid email address'));
            }

            this.db.queryUnique('user', { 'emails.address': request.params.id }, function (err, item) {

                if (err) {
                    return reply(err);
                }

                if (!item) {
                    return reply(Boom.notFound());
                }

                return reply({ user: item._id });
            });
        }
        else if (['twitter', 'facebook', 'yahoo'].indexOf(request.params.type) !== -1) {
            var criteria = {};
            criteria[request.params.type] = request.params.id;

            this.db.queryUnique('user', criteria, function (err, item) {

                if (err) {
                    return reply(err);
                }

                if (!item) {
                    return reply(Boom.notFound());
                }

                return reply({ user: item._id });
            });
        }
        else {
            return reply(Boom.badRequest('Unknown network type'));
        }
    }
};


// Send email reminder account based on email or username and take action

exports.reminder = {
    validate: {
        payload: {
            account: Joi.string().required()
        }
    },
    auth: {
        scope: 'reminder',
        entity: 'app'
    },
    handler: function (request, reply) {

        var self = this;

        var isEmail = request.payload.account.indexOf('@') !== -1;
        var account = request.payload.account.toLowerCase();

        if (isEmail &&
            !Email.checkAddress(account)) {

            return reply(Boom.badRequest());
        }

        var criteria = {};
        criteria[isEmail ? 'emails.address' : 'username'] = account;

        this.db.queryUnique('user', criteria, function (err, user) {

            if (err) {
                return reply(err);
            }

            if (!user) {
                return reply(Boom.notFound());
            }

            Email.sendReminder(self, user, function (err) {

                return reply(err || { result: 'ok' });
            });
        });
    }
};


// Delete account

exports.del = {
    auth: {
        scope: 'quit',
        tos: false
    },
    handler: function (request, reply) {

        var self = this;

        // Check if user has any projects

        var check = function () {

            Project.unsortedList(self.db, request.auth.credentials.user, function (err, projects, owner, notOwner) {

                if (err) {
                    return reply(err);
                }

                // Check if member of any projects

                if (notOwner.length) {
                    return reply(Boom.badRequest('Must first leave all projects'));
                }

                // Check if owner of any projects

                if (owner.length === 0) {               // No own projects
                    return deleteAccount(null);
                }

                if (owner.length > 1) {                 // Multiple own projects
                    return reply(Boom.badRequest('Must first delete all projects'));
                }

                // If only one project, check if it has other participants or any tasks (UX creates an empty project automatically)

                if (owner[0].participants.length !== 1) {
                    return reply(Boom.badRequest('Must first delete project (has participants)'));
                }

                Task.count(self.db, owner[0]._id, function (err, count) {

                    if (err) {
                        return reply(err);
                    }

                    if (count) {
                        return reply(Boom.badRequest('Must first delete project'));
                    }

                    return deleteAccount(owner[0]._id);
                });
            });
        };

        var deleteAccount = function (projectId) {

            var ignore = function () { };

            // Delete account first

            self.db.remove('user', request.auth.credentials.user, function (err) {

                if (err) {
                    return reply(err);
                }

                // Remove own empty project

                if (projectId) {
                    Project.delEmpty(self.db, projectId, ignore);
                }

                // Delete the projects sort list

                Sort.del(self.db, 'project', request.auth.credentials.user, ignore);

                // Remove grants

                Session.delUser(self.db, request.auth.credentials.user, ignore);

                // Remove excluded suggestions

                Suggestions.delUser(self.db, request.auth.credentials.user, ignore);

                // Remove last

                Last.delUser(self.db, request.auth.credentials.user, ignore);

                // Remove client storage

                Storage.delUser(self.db, request.auth.credentials.user, ignore);

                // Return result

                return reply({ result: 'ok' });
            });
        };

        check();
    }
};


// Load user

exports.load = function (db, userId, callback) {

    if (!userId) {
        return callback(Boom.internal('Missing user id'));
    }

    db.get('user', userId, function (err, item) {

        if (err) {
            return callback(err);
        }

        if (!item) {
            return callback(Boom.notFound());
        }

        return callback(null, item);
    });
};


// Get user quick info

exports.quick = function (db, id, callback) {

    db.get('user', id, function (err, user) {

        if (!user) {
            return callback(null);
        }

        var display = (user.name ? user.name
                                 : (user.username ? user.username
                                                  : (user.emails && user.emails[0] && user.emails[0].address ? user.emails[0].address : null)));

        return callback({ id: user._id, display: display });
    });
};


// Get user quick list

exports.expandIds = function (db, ids, callback) {

    db.getMany('user', ids, function (err, items, notFound) {

        if (err) {
            return callback([], {});
        }

        var records = [];
        var map = {};

        for (var i = 0, il = items.length; i < il; ++i) {
            var user = items[i];
            if (user) {
                var display = (user.name ? user.name
                                         : (user.username ? user.username
                                                          : (user.emails && user.emails[0] && user.emails[0].address ? user.emails[0].address
                                                                                                                     : null)));

                var record = { id: user._id, display: display };
                records.push(record);
                map[user._id] = record;
            }
        }

        return callback(records, map);
    });
};


// Check username

internals.checkUsername = function (db, username, callback) {

    // Defined

    if (!username) {
        return callback('Value is undefined');
    }

    // String

    if (typeof username !== 'string') {
        return callback('Value is not a string');
    }

    // Minimum length

    if (username.length < 2) {
        return callback('Value is too short (2 characters or more required)');
    }

    // Maximum length

    if (username.length > 20) {
        return callback('Value is too long (maximum 20 characters)');
    }

    // Begins with a letter

    if (username.search(/^[a-zA-Z]/) !== 0) {
        return callback('First character must be a letter');
    }

    // Includes only letters, numbers, and _

    if (username.search(/^\w*$/) !== 0) {
        return callback('Value must only contain letters, numbers and _');
    }

    // Not forbidden

    if (internals.forbiddenUsernames[username]) {
        return callback('Reserved keyword');
    }

    // Available

    db.queryUnique('user', { username: username.toLowerCase() }, function (err, item) {

        if (err) {
            return callback(err);
        }

        if (item) {
            return callback('Already taken', item);
        }

        // Valid

        return callback(Boom.notFound());
    });
};


// Lookup user by ID or email

exports.find = function (db, ids, callback) {

    var userIds = [];
    var emails = [];

    // Separate user Ids from emails, and verify emails have valid format

    for (var i = 0, il = ids.length; i < il; ++i) {
        if (ids[i].indexOf('@') === -1) {

            // ID

            userIds.push(ids[i]);
        }
        else {

            // Email

            if (!Email.checkAddress(ids[i])) {
                return callback(Boom.badRequest('Invalid email address'));
            }

            emails.push(ids[i].toLowerCase());
        }
    }

    // Get all users

    db.getMany('user', userIds, function (err, items, notFound) {

        if (err) {
            return callback(err);
        }

        var users = items;
        if (items.length !== userIds.length) {
            return callback(Boom.badRequest('Invalid user ID: ' + JSON.stringify(notFound)));
        }

        // Try getting all emails

        db.query('user', { 'emails.address': { '$in': emails } }, function (err, items) {

            if (err) {
                return callback(err);
            }

            var usersByEmail = items;

            // Add users to list

            var emailsFound = {};
            for (var i = 0, il = usersByEmail.length; i < il; ++i) {
                users.push(usersByEmail[i]);
                for (var e = 0, el = usersByEmail[i].emails.length; e < el; ++e) {
                    emailsFound[usersByEmail[i].emails[e].address] = true;
                }
            }

            // Remove potential duplicates between emails and across emails and users

            users = Hoek.unique(users, '_id');

            // Find which emails were not found

            var emailsNotFound = [];
            for (i = 0, il = emails.length; i < il; ++i) {
                if (emailsFound[emails[i]] !== true) {
                    emailsNotFound.push(emails[i]);
                }
            }

            // Return results

            return callback(null, users, emailsNotFound);
        });
    });
};


// Validate linked account

exports.validate = function (db, id, network, callback) {

    if (!id) {
        return callback(null, null);
    }

    var criteria = {};
    criteria[network] = id;
    db.queryUnique('user', criteria, function (err, user) {

        if (err) {
            return callback(err);
        }

        return callback(null, user);
    });
};


