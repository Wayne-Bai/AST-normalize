'use strict';

var fs = require('fs');
var tgz = require('tar.gz');
var mkdirp = require('mkdirp');
var Path = require('path');
var glob = require('glob');
var async = require('async');
var rmrf = require('rmrf');
var _ = require('underscore');

var log = function () {
  console.log.apply(console, arguments);
};

var error = function () {
  console.error.apply(console, arguments);
};

var requireJSON = function (path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
};

var dir = function (rootPath) {
  var bowerConfig = Path.join(rootPath, '.bowerrc');
  var bowerDir = 'bower_components';
  var directory;
  if (fs.statSync(bowerConfig) && (directory = requireJSON(bowerConfig).directory)) {
    bowerDir = directory;
  }
  return Path.join(rootPath, bowerDir);
};

function BowerStrategy(options) {
  this.mode = options.mode || 'develop';
  this.verbose = options.verbose || false;
  this.cwd = options.cwd || process.cwd();
  this.modulePath = Path.join(this.cwd, '.modules');
  this.bowerComponentsPath = dir(this.cwd);

  var bowerjson = require(Path.join(this.cwd, 'bower.json'));
  this.dependencies = bowerjson.dependencies;
  this.devDependencies = bowerjson.devDependencies;
  this.allDependencies = _.extend({}, this.dependencies, this.devDependencies);

  // ensure that relevant directory exists
  mkdirp.sync(this.bowerComponentsPath);
}

BowerStrategy.prototype._install = function (type, destPath, callback) {
  var deps;
  if (type === '*') {
    deps = this.allDependencies;
  } else {
    deps = this[type];
  }
  var sep = '-v';
  var self = this;
  async.eachSeries(glob.sync('*.tgz', {
    cwd: this.modulePath
  }), function (file, cb) {
    var archive = Path.join(self.modulePath, file);
    file = file.replace(/\.tgz$/i, '');
    var name = file.substring(0, file.lastIndexOf(sep));
    var version = file.substring(file.lastIndexOf(sep) + sep.length);

    if (deps[name]) {
      // remove existing installed module
      if (fs.existsSync(Path.join(destPath, name))) {
        rmrf(Path.join(destPath, name));
      }

      // extract the module into node_modules
      new tgz().extract(archive, destPath, function (err) {
        if (!err) {
          log('Extracted', name + '@' + version);
        } else {
          error(err);
        }
        cb();
      });
    } else {
      cb();
    }
  }, function () {
    log('\nDone!');
    if (callback) {
      callback();
    }
  });
};

BowerStrategy.prototype._pack = function (name, version, callback) {
  var sep = '-v';

  log('Packing', name + sep + version);

  var source = Path.join(this.bowerComponentsPath, name);
  var dest = Path.join(this.modulePath, name + sep + version + '.tgz');

  new tgz().compress(source, dest, function (err) {
    if (err) {
      error('Failed to pack', name);
    } else {
      log('Packed', name);
    }
    if (callback) {
      callback();
    }
  });
};

BowerStrategy.prototype._packAll = function (srcList, curInst, callback) {
  var self = this;
  var sep = '-v';

  // retrieve all packed dependencies
  var curMods = glob.sync('*.tgz', {
    cwd: this.modulePath
  }).reduce(function (memo, file) {
    file = file.replace(/\.tgz$/i, '');
    var name = file.substring(0, file.lastIndexOf(sep));
    var version = file.substring(file.lastIndexOf(sep) + sep.length);
    memo[name] = version;
    return memo;
  }, {});

  // log any packed modules that are not in the source list
  _.difference(Object.keys(curMods), Object.keys(srcList)).forEach(function (name) {
    var fv = name + sep + curMods[name];
    if (self.verbose) {
      log('Module ', fv, 'is not specified in the bower.json');
    }
  });

  // warn about missing deps
  _.difference(Object.keys(srcList), Object.keys(curInst)).forEach(function (name) {
    error('WARNING:', name, 'is not installed!');
  });

  // Update any dependencies that have different versions
  // and pack any that are missing completely
  async.eachSeries(Object.keys(curInst), function (name, cb) {
    if (!srcList[name]) {
      return cb();
    }
    if (curInst[name] === curMods[name]) {
      return cb();
    }
    if (!curMods[name]) {
      log('Adding', name + sep + curInst[name]);
    }
    if (curMods[name] && curInst[name] !== curMods[name]) {
      log('Module', name, 'has changed from ', curMods[name], 'to', curInst[name]);
      fs.unlinkSync(Path.join(self.modulePath, name + sep + curMods[name] + '.tgz'));
    }
    return self._pack(name, curInst[name], cb);
  }, function () {
    if (callback) {
      callback();
    }
  });
};

BowerStrategy.prototype.install = function (callback) {
  if (this.mode === 'production') {
    this._install('dependencies', this.bowerComponentsPath, callback);
  } else {
    this._install('*', this.bowerComponentsPath, callback);
  }
};

BowerStrategy.prototype.pack = function (target, callback) {
  var sep = '-v';

  if (target && !callback) {
    if (_.isFunction(target)) {
      callback = target;
      target = null;
    }
  }

  if (target && !this.allDependencies[target]) {
    error(target + ' doesn\'t exist');
    process.exit(1);
  } else if (target && this.allDependencies[target]) {
    var name = target;
    var file, version;
    try {
      file = require(Path.join(this.bowerComponentsPath, name, '.bower.json'));
      version = file.version || '*';
    } catch (e) {
      error(e);
      process.exit(1);
    }
    log('Adding', name + sep + file.version);
    this._pack(name, version, callback);
  } else {
    // get a list of currently installed bower components - rely on the module folder name since
    // 'name' specified within bower.json may be different than the folder name
    var curInst = glob.sync(this.bowerComponentsPath + '/*')
      .reduce(function (memo, modulePath) {
        var moduleName = Path.basename(modulePath);
        var pkg = require(Path.resolve(modulePath, '.bower.json'));
        memo[moduleName] = pkg.version || '*'; // if version is not found, use *
        return memo;
      }, {});

    if (this.mode === 'production') {
      this._packAll(this.dependencies, curInst, callback);
    } else {
      this._packAll(this.allDependencies, curInst, callback);
    }
  }
};

module.exports = BowerStrategy;