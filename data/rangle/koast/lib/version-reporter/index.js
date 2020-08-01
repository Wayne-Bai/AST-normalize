/** @module koast/versionReporter */
'use strict';
var fs = require('fs');
var localVersion = require('../../package.json').version;
var globalPath = process.env['NODE_PATH'] + '/koast/package.json';
var globalVersion;
if (fs.existsSync(globalPath)) {
    globalVersion = require(globalPath).version;
}

var log = require('../log');

/**
 * Create a middleware to add koast version headers to the response
 * @return {function}
 */
var getMiddleware = function()
{
  return function(req,res,next)
  {
        res.header('X-Powered-By', 'Koast');
        res.header('X-Koast-Version', localVersion);
        next();
  };
};

var globalVersionWarning = function() {
  if(globalVersion && (localVersion && localVersion !== globalVersion)) {
    log.warn('Local koast [' + localVersion +
        '] does not match global [' + globalVersion + ']')
  }
  else
    {
      log.verbose('koast is not globally installed');
    }
};

module.exports = exports = {
  getMiddleware: getMiddleware,
  localVersion: localVersion,
  globalVersion: globalVersion,
  globalVersionWarning: globalVersionWarning
};
