'use strict';

var connectToDatabase = require('./database').connectToDatabase;
var initialiseExpress = require('./express').initialiseExpress;
var sanitizeOptions = require('./options').sanitizeOptions;

module.exports = bootApplication;

function bootApplication (opts, done) {
    var app = {};
    app.opts = sanitizeOptions(opts);
    connectToDatabase(app.opts, function (err) {
        if (err) {
            return done(err);
        }
        initialiseExpress(app);
        app.start = startApplication.bind(null, app);
        app.refreshFeeds = refreshFeeds.bind(null, app);
        app.collectGarbage = collectGarbage.bind(null, app);
        done(null, app);
    });
}

function startApplication (app, done) {
    app.express.listen(app.opts.port, function (err) {
        if (!err) {
            console.log('Application started');
        }
        if (done) {
            done(err, app);
        }
    });
}

function refreshFeeds (app, done) {
    require('../model/feed').refreshAll(done);
}

function collectGarbage (app, done) {
    require('../model/post').removeExpired(function (err, count) {
        if (!err) {
            console.log('Deleted %d old posts', count);
        }
        done(err);
    });
}
