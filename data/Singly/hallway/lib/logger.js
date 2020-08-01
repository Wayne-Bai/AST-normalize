/**
* Forked from Mikeal Rogers Stoopid project at http://github.com/mikeal/stoopid.
*/
var colors = require('colors');
var lconfig = require('lconfig');
var moment = require('moment');
var os = require('os');
var util = require('util');

var rlevels = {};

var levels = {
  debug: 100,
  info: 200,
  vital: 300,
  warn: 400,
  error: 500
};

colors.setTheme({
  debug: 'grey',
  info: 'white',
  vital: 'green',
  warn: 'yellow',
  error: 'red'
});

function Handler() {}

Handler.prototype.msg = function () {
  return util.format.apply(this, arguments);
};

function Console() {
  this.filter = levels[lconfig.logging.level];
  this.localFilter = levels[lconfig.logging.localLevel];
}

util.inherits(Console, Handler);

Console.prototype.prefix = function (logger, level) {
  return [
    moment().format('MM/DD/YYYY HH:mm:ss').grey,
    os.hostname().grey,
    logger.name.cyan,
    level.toUpperCase().grey
  ].join('|');
};

if (process.env.SUPPRESS_TIMESTAMPS) {
  Console.prototype.prefix = function (logger, level) {
    return [
      logger.name.cyan,
      level.toUpperCase().grey
    ].join('|');
  };
}

Console.prototype.onLog = function (logger, level, args) {
  if (level < this.filter) return;

  var msg = util.format.apply(this, args);

  var prefix = this.prefix(logger, rlevels[level]) + ' ';

  if (level < this.localFilter) {
    prefix = this.prefix(logger, 'LOGLOCAL') + ' ';
  }

  msg = msg.split('\n').map(function (line) {
    line = line[rlevels[level]] || line;

    return prefix + line;
  }).join('\n');

  if (logger.stripColors) msg = msg.stripColors;

  process.stdout.write(msg + '\n');
};

if (process.env.SUPPRESS_LOGS) {
  Console.prototype.onLog = function () {};
}

function Logger(name, parent) {
  var self = this;

  self.stripColors = false;

  if (process.env.SUPPRESS_COLORS) {
    self.stripColors = true;
  }

  self.name = name;
  self.parent = parent;
  self._l = false;

  if (parent) {
    self.handlers = parent.handlers;
  } else {
    self.handlers = [];
  }
}

Logger.prototype.logger = function (name) {
  return new Logger(name, this);
};

Logger.prototype._log = function () {
  var args = Array.prototype.slice.apply(arguments);
  var self = this;
  var level;

  if (!self._l) {
    level = args.shift();
  } else {
    level = self._l;
  }

  self.handlers.forEach(function (h) {
    h.onLog(self, level, args);
  });
};

function defineLevel(level) {
  Logger.prototype[level] = function () {
    this._l = levels[level];
    this._log.apply(this, arguments);
    this._l = false;
  };

  rlevels[levels[level]] = level;
}

for (var level in levels) {
  defineLevel(level);
}

Logger.prototype.log = Logger.prototype.info;
Logger.prototype.dir = Logger.prototype.log;

Logger.prototype.time = function (label) {
  this.times = {};
  this.times[label] = Date.now();
};

Logger.prototype.timeEnd = function (label) {
  var duration = Date.now() - this.times[label];

  this.log('%s: %dms', label, duration);
};

var realError = Logger.prototype.error;

Logger.prototype.error = function (err) {
  if (typeof(err) === 'string') this.trace(err);
  else realError.apply(this, [err.stack]);
};

Logger.prototype.trace = function (label) {
  // TODO probably can to do this better with V8's debug object once that is
  // exposed.
  var err = new Error();
  err.message = label || '';
  if (!label) err.name = 'Trace';

  Error.captureStackTrace(err, Logger.prototype.trace);

  realError.apply(this, [err.stack]);
};

Logger.prototype.assert = function (expression) {
  if (!expression) {
    var arr = Array.prototype.slice.call(arguments, 1);
    require('assert').ok(false, util.format.apply(this, arr));
  }
};

Logger.prototype.errorObject = function (err) {
  this.error(err);
  return err;
};

Logger.prototype.addHandler = function (handler) {
  this.handlers.push(handler);
};

module.exports = new Logger('process');

module.exports.addHandler(new Console());
