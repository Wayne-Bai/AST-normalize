'use strict';

var async = require('async');
var moduleManager = require('./backend/module-manager');
var core = require('./backend/core');
var logger = core.logger;
var config = core.config('default');

var modules = config.modules;

moduleManager.setupServerEnvironment();

function fireESNState(state) {
  return function fireESN(callback) {
    moduleManager.manager.fire(state, modules).then(function() {
      callback(null);
    }, function(err) {
      callback(err);
    });
  };
}

function initCore(callback) {
  core.init(function(err) {
    if (!err) {
      logger.info('OpenPaaS Core bootstraped, configured in %s mode', process.env.NODE_ENV);
    }
    callback(err);
  });

}

async.series([core.templates.inject, fireESNState('lib'), initCore, fireESNState('start')], function(err) {
  if (err) {
    logger.error('Fatal error:', err);
    if (err.stack) {
      logger.error(err.stack);
    }
    process.exit(1);
  }
  logger.info('OpenPaas ESN is now started on node %s', process.version);
});
