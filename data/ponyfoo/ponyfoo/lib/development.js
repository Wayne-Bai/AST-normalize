'use strict';

var winston = require('winston');
var passport = require('passport');
var env = require('./env');
var patch = require('./patch');
var port = env('PORT');
var hosted = env('NODE_ENV') !== 'development';
var rtext = /[ a-z]+/i;
var api;

function statics (app) {
  if (hosted) {
    return;
  }
  var serveFavicon = require('serve-favicon');
  var serveStatic = require('serve-static');
  app.use(serveFavicon('.bin/public/favicon.ico'));
  app.use(serveStatic('.bin/public'));
  app.use('/img/uploads', serveStatic('tmp/images'));
}

function logging (app) {
  var morgan = require('morgan');
  var stream = winston.createWriteStream('debug');
  var fmt = ':status :method :url :response-time\\ms'; // trick: '\\' allows to omit a space

  app.use(morgan(fmt, {
    skip: skip,
    stream: stream
  }));
}

function sync () {
  if (hosted) {
    return;
  }
  var browserSync = require('browser-sync');
  var config = {
    open: false,
    notify: false,
    logLevel: 'silent',
    proxy: 'localhost:' + port,
    port: parseInt(port) + 1,
    files: ['.bin/**/*.js', '.bin/**/*.css']
  };
  browserSync(config, syncUp);
}

function syncUp () {
  winston.info('browser-sync proxying app on port %s', this.options.port);
}

function errors (app) {
  if (hosted) {
    return;
  }
  var errorHandler = require('errorhandler');
  app.use(errorHandler());
}

function skip (req, res) {
  return res.statusCode === 304;
}

function patchThings (app) {
  if (hosted) {
    return;
  }
  logging(app);

  app.set('json spaces', 2);
  app.locals.pretty = true;

  patchPassport();
  patchExpress(app);
}

function patchExpress (app) {
  patch(app, 'app', ['use', 'get', 'post', 'put', 'delete', 'patch'], filter);

  function filter (key, args) {
    return args.length !== 1 || typeof args[0] !== 'string' || !rtext.test(args[0]);
  }
}

function patchPassport () {
  patch(passport, 'passport', ['use']);
}

module.exports = {
  patch: patchThings,
  statics: statics,
  errors: errors,
  browserSync: sync
};
