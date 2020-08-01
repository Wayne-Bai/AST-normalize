'use strict';

var eachModule = require('each-module');

exports.loadControllers = loadControllers;
exports.handleErrors = handleErrors;

function loadControllers (app) {
    eachModule(__dirname + '/../../controller', function (name, initController) {
        if (typeof initController !== 'function') {
            console.error('Controller "%s" does not export a function', name);
            process.exit(1);
        }
        initController(app);
    });
    return app;
}

function handleErrors (app) {
    app.express.all('*', function (req, res) {
        res.status(404);
        res.render('404');
    });
    app.express.use(function (err, req, res, next) {
        /* jshint unused: false */
        res.status(500);
        console.error(err.stack);
        if (app.opts.env !== 'production') {
            res.locals.errorStack = err.stack;
        }
        res.render('500');
    });
    return app;
}
