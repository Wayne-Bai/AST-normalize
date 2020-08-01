/** @module lib/util */
/* global require, exports, process */
'use strict';

var path = require('path');
var os = require('os');
var fs = require('fs');
var Module = require('module');

var log = require('../log');

/**
 * Requires a module based on a path relative to current working directory.
 * Adapted https://github.com/kamicane/require-relative/.
 */
exports.requireRelative = function (requestedPath) {
  var rootPath = process.cwd();
  if (requestedPath[0] !== '.') {
    requestedPath = './' + requestedPath;
  }

  var rootName = path.join(rootPath, '@root');
  var root = new Module(rootName);
  root.filename = rootName;
  root.paths = Module._nodeModulePaths(rootPath);
  return root.require(requestedPath);
};

// Makes an error handler that we can log an error message and then send an
// HTTP response.
exports.makeErrorResponder = function (res, message) {
  return function (error) {
    log.error(error);
    log.error(error.stack);
    res.status(500).send(message || 'Internal error.');
  };
};

exports.getTempFileName = function() {
  var result = '';
  do {
    result = path.join(os.tmpdir(), 'tmp.' + process.pid + new Date().getTime())
  } while(fs.existsSync(result));
  return result;
};
