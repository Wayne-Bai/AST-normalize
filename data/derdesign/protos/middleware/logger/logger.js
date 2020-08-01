
/**
  Logger
  
  Application logger. Also provides request logging functionality, supporting
  custom logging formats.
  
  The logging functions are exposed by the middleware object, and connected to the
  `info_log` and `error_log` events of the application.
  
  Error logs are conveniently printed with a stack trace, for proper inspection.
  
  The log events are emitted by `app.log`. If an `Error` instance is passed to it,
  the `error_log` event is automatically emitted with the error in question.
  
 */

var app = protos.app,
    fs = require('fs'),
    http = require('http'),
    util = require('util'),
    pathModule = require('path'),
    inflect = protos.require('./lib/support/inflect.js');

var slice = Array.prototype.slice;

var accessLog, Application = app.constructor;

function Logger(config, middleware) {
  
  // Attach to app singleton
  app[middleware] = this;
  
  // Set muted logs
  this.mutedLevels = {};
  
  // Define access log data in same closure (faster access)
  var accessLogConsole,
      domain = app.hostname,
      appDate = app.date;
  
  // Middleware config (levels are overridden)
  this.config = config = protos.configExtend({
    accessLog: {console: true},   // By default, print access log to the console
    levels: {
      info: {console: true},      // Set to {console: true, file: 'info.log'} to log on stdout + file
      error: {console: true}      // Set to {console: true, file: 'error.log'} to log on stdout + file
    }
  }, config);
  
  
  if (typeof config.accessLog == 'boolean') {
    if (config.accessLog) config.accessLog = {console: true};
  } else {
    if (config.accessLog && typeof config.accessLog != 'object') {
      config.accessLog = {console: true};
    }
  }
  
  // Enable access log
  if (config.accessLog) this.enableAccessLog(config.accessLog);
  
  // Create logging levels
  if (config.levels && typeof config.levels == 'object') createLoggingLevels.call(this, config.levels);
  
  // console.exit(this);
}

/* Transports */

var logTransports = {
  console: require('./transport-console.js'),
  file: require('./transport-file.js'),
  mongodb: require('./transport-mongodb.js'),
  redis: require('./transport-redis.js'),
  json: require('./transport-json.js')
}

/* Access Log Formats */

var accessLogFormats = {
  json: function(req, res, app) {
    var ms = Date.now() - req.startTime;
    var log = {
      host: app.hostname,
      date: new Date().toGMTString(),
      remote_address: req.ip,
      method: req.method,
      url: req.url,
      status_code: res.statusCode,
      response_time: this.timeDelta(ms)
    }
    return log;
  },
  "default": function(req, res, app) {
    var ms = Date.now() - req.startTime;
    return util.format('%s (%s) [%s] %s %s %s (%s)', app.hostname, app.date(), req.ip, req.method, 
    req.url, res.statusCode, this.timeDelta(ms));
  },
  detailed: function(req, res, app) {
    var ms = Date.now() - req.startTime;
    return util.format('%s (%s) [%s] %s %s %s (%s) - %s', app.hostname, app.date(), req.ip, req.method, 
    req.url, res.statusCode, this.timeDelta(ms), req.headers['user-agent']);
  }
}

/* Methods */

Logger.prototype.mute = function() {
  var args = slice.call(arguments, 0);
  for (var level,transports,logCb,evt,t,i=0,len=args.length; i < len; i++) {
    level = args[i];
    evt = level + '_log';
    logCb = getLogCallback(level);
    this.mutedLevels[level] = app[logCb];
    app[logCb] = mutedLogCallback;
    transports = this.transports[level];
    for (t in transports) {
      app.removeListener(evt, transports[t].write);
    }
  }
}

Logger.prototype.unmute = function() {
  var args = slice.call(arguments, 0);
  for (var level,transports,logCb,evt,t,i=0,len=args.length; i < len; i++) {
    level = args[i];
    if (level in this.mutedLevels) {
      evt = level + '_log';
      logCb = getLogCallback(level);
      app[logCb] = this.mutedLevels[level];
      delete this.mutedLevels[level];
      transports = this.transports[level];
      for (t in transports) {
        app.on(evt, transports[t].write);
      }
    }
  }
}

Logger.prototype.enableAccessLog = function(config) {

  // Create log directory if file transport used
  if (config.file) app.mkdir('log');
  
  // Cache access log format function
  var self = this, format, accessLogFormat;
  
  format = (accessLogFormat = config.format || 'default');
  
  // Delete format to leave only transports
  delete config.format;
  
  if (typeof accessLogFormat == 'string') {
    if (accessLogFormat in accessLogFormats) {
      accessLogFormat = accessLogFormats[accessLogFormat];
    } else {
      throw new Error("Logger: Unknown access log format: " + accessLogFormat);
    }
  } else if (typeof accessLogFormat != 'function') {
    throw new Error("Logger: Access log format accepts either a string or a function: " + accessLogFormat);
  }
  
  // Simulate an instance
  var instance = {
    config: { transports: config },
    otherTransports: {}
  };
  
  // Setup transports
  setAdditionalTransports.call(instance, 'access_log', 'access'); // noAttach
  
  var transports = instance.otherTransports;
  
  // Access Log Callback
  var accessLogCallback = function() {
    var data, json, log = accessLogFormat.call(self, this.request, this, app);
    if (format == 'json') {
      log = app.applyFilters('access_log_data', log, this.request, app);
      json = JSON.stringify(log);
      data = [log, json]; // msg (object), log (text)
      app.emit('access_log', json, data, log);
    } else {
      data = [log, log];
      app.emit('access_log', log, data);
    }
  }
  
  app.on('request', function(req, res) {
    res.on('finish', accessLogCallback);
  });
}

Logger.prototype.timeDelta = function(ms) {
  var s, m, h, p=2;
  if (ms >= 1000) {
    s = ms / 1000.0;
    if (s < 60) {
      // seconds
      return s.toFixed(p) + 's';
    } else if (s < 3600) {
      // minutes
      m = s / 60.0;
      return m.toFixed(p) + 'min';
    } else {
      // hours
      h = s / 3600.0;
      return h.toFixed(p) + 'hr';
    }
  } else {
    // Return miliseconds
    return ms + 'ms';
  }
}

Logger.prototype.getFileStream = function(file) {
  var path, stream;
  app.mkdir('log/');
  file = file.trim();
  path = (file.charAt(0) == '/') ? pathModule.resolve(file) : app.fullPath('log/' + file);
  stream = fs.createWriteStream(path, {flags: 'a'});
  return stream;
}

/* Private Functions */

function mutedLogCallback() {
  // Do nothing
}

function setAdditionalTransports(evt, level, noAttach) {
  var Ctor, t, transports = {};
  for (t in this.config.transports) {
    Ctor = logTransports[t];
    transports[t] = new Ctor(evt, this.config.transports[t], level, noAttach);
  }
  this.otherTransports = transports;
}

function getLogCallback(level) {
  return inflect.camelize(level, true) + 'Log';
}

function createLoggingLevels(config) {

  var level, options, transports, createDir;
  this.transports = {};

  for (level in config) {

    transports = config[level];

    if (!transports) continue;

    if (level == 'access') {
      throw new Error("The 'access' level is reserved for the access log. Please use 'accessLog' instead.");
    }

    this.transports[level] = {};

    for (var transport in transports) {

      if (!transports[transport]) continue; // Ignore if transport's config is false

      if (transport in logTransports) {
        
        if (transport == 'file') app.mkdir('log'); // Create log directory if using file transport
        
        var instance, evt = level + '_log',
        Ctor = logTransports[transport];

        instance = this.transports[level][transport] = new Ctor(evt, transports[transport], level);
        instance.otherTransports = {};

        // Set additional transports
        if (instance.config.transports) {
          if (transport == 'json') {
            setAdditionalTransports.call(instance, evt, level, true); // noAttach = true
          } else {
            setAdditionalTransports.call(instance, evt, level);
          }
        }

        // Extend application with {level}Log method

        (function(app, format) {

          var context = {level: level, event: evt, app: app}; // Reuse object

          // Do not attach to prototype, attach to instance instead (it's faster)
          app[getLogCallback(level)] = function() {
            app.log.apply(context, arguments);
          }

          }).call(this, app, util.format);

        } else {
          throw new Error("Logger: transport not found: " + transport);
        }
        
      }
      
    }

  }

module.exports = Logger;
