var wrench  = require('wrench')
  , fs      = require('fs')
  , path    = require('path')
  , _       = require('lodash')
  , Promise = require('bluebird')
  , smooth  = require('../')
  , config  = require('../../tasks/config')



/**
 * Fork theme
 *
 * @param {object} customConfig
 * @param {string} themeName
 * @param {string} destination
 */
exports.fork = function(customConfig, themeName, destination) {

  return new Promise(function(resolve, reject) {

    if("undefined" === typeof(destination)) {
      reject(new Error('You must introduce a destination path'));
    }

    var customConfig = _.merge(customConfig, {
      theme: themeName,
      path: {
        themes: destination
      }
    });

    // Create subdirectories recursively
    wrench.mkdirSyncRecursive(path.dirname(destination), 0755);

    // Copy all theme files
    wrench.copyDirRecursive(
      config.path.themes + '/' + themeName,
      destination,
      { forceDelete: false },
      function(err) {

        if(err) {
          reject(new Error('Error when trying copying theme files: '  + err));
        }

        // Update configuration
        fs.writeFileSync(
          process.cwd() + '/' + smooth.defaultConfigFileName,
          JSON.stringify(customConfig, null, 2)
        );

        resolve()

    });

  });

};



/**
 * Create theme from scratch
 *
 * @param {object} customConfig
 * @param {string} dest
 */
exports.new = function(customConfig, dest) {

  exports.fork(customConfig, smooth.defaultThemeName, dest);

};