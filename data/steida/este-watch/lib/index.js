var colors = require('colors');
var fs = require('fs');
var glob = require('glob');
var path = require('path');
var semver = require('semver');

/**
 * Factory for EsteWatch.
 * @param {Array.<string>} dirs
 * @param {Function} onChange
 * @return {EsteWatch}
 */
module.exports = function(dirs, onChange, options) {
  if (semver.lt(process.versions.node, '0.9.2')) {
    console.log('Use node 0.9.2+, due to buggy fs.watch.');
    return;
  }

  return new EsteWatch(dirs, onChange, fs, path, glob, options || {});
};


/**
 * Fast and reliable files watcher.
 * It's fast, because it wraps fs.watch which does not use pooling.
 * It's reliable, because it supports only that behavior that works reliable
 * across all OS's.
 *
 * fs.watch limitations:
 *  - Does not watch nested directories.
 *  - Windows does not report deleted file name.
 *  - Windows fires two events for one file change by design.
 *  - Windows sometimes block file to read after change for short time.
 *  - Mac fs.watch default limit is 256 (can be increased via ulimit).
 *
 * Api forces user to watch only directories, and detects only files changes.
 * It's trade-off, it works and does not burn CPU.
 *
 * @param {Array.<string>} dirs
 * @param {Function} onChange Callback argument props: fileName, fileExtension.
 * @param {Object} fs
 * @param {Object} path
 * @param {Object} glob
 * @constructor
 */
function EsteWatch(dirs, onChange, fs, path, glob, options) {
  this.dirs = dirs;
  this.onChange = onChange;
  this.fs = fs;
  this.path = path;
  this.glob = glob;
  this.watchers = [];
  this.filter = options.filter;
  this.ignoreFiles = options.ignoreFiles;
  this.ignoreDirectories = options.ignoreDirectories;
  this.validateDirs();
}

// Options
EsteWatch.prototype.debug = false;
EsteWatch.prototype.onFileChangeDebounce = 1;
EsteWatch.prototype.restartWatchersDebounce = 10;
EsteWatch.prototype.waitForUnlockInterval = 10;
EsteWatch.prototype.waitForUnlockTryLimit = 50;

/**
 * @type {Array.<Function>}
 */
EsteWatch.prototype.watchers = null;

/**
 * @type {?number}
 */
EsteWatch.prototype.restartWatchersTimer = null;

/**
 * @type {?number}
 */
EsteWatch.prototype.onFileChangeTimer = null;

/**
 * @type {?number}
 */
EsteWatch.prototype.waitForFileUnlockTimer = null;

/**
 * Start watching.
 */
EsteWatch.prototype.start = function() {
  this.restartWatchers();
};

/**
 * Clear unlockTimer and close all watchers.
 */
EsteWatch.prototype.dispose = function() {
  clearTimeout(this.waitForFileUnlockTimer);
  this.closeWatchers();
};

/**
 * @protected
 */
EsteWatch.prototype.validateDirs = function() {
  this.dirs.forEach(function(dir) {
    var dirExists = this.dirExists(dir);
    if (dirExists) return;
    this.throwError("Directory '" + dir + "' does not exits.");
  }, this);
};

/**
 * @param {string} path
 * @return {boolean}
 * @protected
 */
EsteWatch.prototype.dirExists = function(path) {
  var fileExists = this.fs.existsSync(path);
  if (!fileExists) return false;
  return this.fs.statSync(path).isDirectory();
};

/**
 * Restart on subdir change to track new dirs.
 * @protected
 */
EsteWatch.prototype.restartWatchers = function() {
  this.closeWatchers();
  this.watchDirs();
};

/**
 * @protected
 */
EsteWatch.prototype.closeWatchers = function() {
  this.watchers.forEach(function(watcher) {
    watcher.close();
  });
  this.watchers = [];
};

/**
 * @protected
 */
EsteWatch.prototype.watchDirs = function() {
  var ignore = this.ignoreDirectories;
  this.dirs.forEach(function(dir) {
    var path = this.path.join(dir, '/**/');
    this.glob.sync(path).forEach(function(dir) {
      if (ignore && ignore instanceof RegExp && ignore.test(dir)) {
        return;
      }
      var watcher = this.fs.watch(dir, this.onDirChange.bind(this, dir));
      this.watchers.push(watcher);
    }, this);
  }, this);
};

/**
 * @param {string} dir
 * @param {string} action
 * @param {string} watchPath
 * @protected
 */
EsteWatch.prototype.onDirChange = function(dir, action, watchPath) {
  // Windows dispatches empty watchPath on deleted files. Ignore it.
  if (!watchPath) return;
  var path = this.path.join(dir, watchPath);

  // Normalize '\\' to '/' for Windows.
  path = path.replace(/\\/g, '/');

  var pathExists = this.fs.existsSync(path);

  // Don't propagate deletes files. Also, fs.statSync fails on deleted symlink
  // dir with "Abort trap: 6".
  // https://github.com/bevry/watchr/issues/42
  // https://github.com/joyent/node/issues/4261
  if (!pathExists) return;

  // If a filter option is defined, apply to this file
  if (this.filter && this.filter instanceof RegExp && !this.filter.test(path)) {
    return;
  }

  // If an ignoreFiles option is defined, check for this file
  if (this.ignoreFiles && this.ignoreFiles instanceof RegExp && this.ignoreFiles.test(path)) {
    return;
  }

  //https://github.com/steida/este-watch/issues/2
  try{
    if (this.fs.statSync(path).isDirectory()) {
      // Restart watching to track new dirs.
      this.debugLog('Dir changed: ' + path);
      clearTimeout(this.restartWatchersTimer);
      this.restartWatchersTimer = setTimeout(
        this.restartWatchers.bind(this), this.restartWatchersDebounce);
      return;
    }
  } catch(ex) {
    this.debugLog('Error: ' + ex);
    return;
  }

  this.onFileChange(path);
};

/**
 * @param {string} filepath
 * @protected
 */
EsteWatch.prototype.onFileChange = function(filepath) {
  // Windows fires two events per one file change by design.
  // Fix is 1ms debounce. No platform check to ensure "consistency".
  // https://github.com/joyent/node/issues/2126
  clearTimeout(this.onFileChangeTimer);
  this.onFileChangeTimer = setTimeout((function() {
    this.tryDispatchOnChange(filepath);
  }).bind(this), this.onFileChangeDebounce);
};

/**
 * @param {string} filepath
 * @protected
 */
EsteWatch.prototype.tryDispatchOnChange = function(filepath) {
  // Ensure file is readable before dispatch event.
  // Fix from: https://github.com/steida/grunt-este-watch/pull/12
  var waitTryCount = 0;
  var waitForFileUnlock = (function() {
    var isLocked = false;
    waitTryCount++;
    try {
      this.fs.readFileSync(filepath);
    }
    catch (e) {
      // File is probably locked somehow.
      isLocked = true;
    }
    if (!isLocked || waitTryCount > this.waitForUnlockTryLimit) {
      var e = this.createEvent(filepath);
      this.onChange(e);
      return;
    }
    this.debugLog('Waiting for file to unlock (' + waitTryCount + '): ' + filepath);
    clearTimeout(this.waitForFileUnlockTimer);
    this.waitForFileUnlockTimer = setTimeout(
      waitForFileUnlock, this.waitForUnlockInterval);
  }).bind(this);
  waitForFileUnlock();
};

/**
 * @param {string} filepath
 * @return {Object}
 * @protected
 */
EsteWatch.prototype.createEvent = function(filepath) {
  return {
    filepath: filepath,
    extension: this.path.extname(filepath).substring(1)
  };
};

/**
 * @param {string} msg
 * @protected
 */
EsteWatch.prototype.debugLog = function(msg) {
  if (!this.debug) return;
  console.log('[este-watch]'.cyan + ' ' + msg);
};

/**
 * @param {string} msg
 * @protected
 */
EsteWatch.prototype.throwError = function(msg) {
  throw Error('[este-watch] ' + msg);
};
