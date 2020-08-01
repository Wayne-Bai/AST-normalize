
/* Logger » Redis Transport */

var app = protos.app,
    fs = require('fs');
    
try {
  var redis = require('redis');
} catch(e) {
  app.debug('Logger middleware: redis is required for redis-transport');
  return;
}    

function RedisTransport(evt, config, level, noAttach) {
  
  var self = this;
  
  this.className = this.constructor.name;
  
  if (typeof config == 'boolean') {
    if (config) config = {};
    else return;
  } else if (config.constructor !== Object) {
    return;
  }
  
  config = protos.extend({
    host: 'localhost',
    port: 6379,
    db: 0,
    logKey: evt,
    password: null,
    logLimit: 3
  }, config);
  
  // Set config
  this.config = config;
  
  // Log messages queue
  var queue = [];
  
  // Set ready state
  var ready = false;
  
  // Log messages queue: handle logs while acquiring redis client
  var preCallback = function(log) { // log, data, native
    if (self.client) postCallback.apply(null, arguments);
    else queue.push(arguments);
  }
  
  // Callback to run when client is ready
  var postCallback = function() {  // log, data, native
    self.pushLog.apply(self, arguments);
  }
  
  // Set write method
  this.write = function() { // log, data, native
    ready ? postCallback.apply(null, arguments) : preCallback.apply(null, arguments);
  }
  
  initRedis.call(this, config, function(err) {
    if (err) {
      
      app.log(err);
      
    } else {
      
      // Set ready
      ready = true;
      
      // Flush log queue
      queue.forEach(function(args) {
        postCallback.apply(null, args);
      });
      
      queue = [];
    }
  });
  
  if (!noAttach) app.on(evt, this.write);

}

/**
  Write interface
  
  @param {string} log
  @public
 */
 
RedisTransport.prototype.write = function(log) {
  // Interface
}

/**
  Pushes a log into redis
  
  @param {string} log
  @private
 */

RedisTransport.prototype.pushLog = function(log) {
  var self = this,
      config = this.config,
      logKey = config.logKey;
  this.client.lpush(logKey, log, function(err, count) {
    if (err) app.log(err);
    else if (count > config.logLimit) {
      self.client.ltrim(logKey, 0, config.logLimit-1, function(err) {
        if (err) app.log(err);
      });
    }
  });
}

/**
  Initializes the redis client
  
  @param {object} config
  @param {function} callback
  @private
 */

function initRedis(config, callback) {

  var self = this;

  protos.util.checkLocalPort(config.port, function(err) {

    if (err) {
      app.log("RedisTransport [%s:%s] %s", config.host, config.port, err.code);
    } else {

      // Set redis client
      self.client = redis.createClient(config.port, config.host, self.options);

      // Handle error event
      self.client.on('error', function(err) {
        callback.call(self, err);
      });

      // Authenticate if password provided
      if (typeof config.password == 'string') {
        self.client.auth(config.password, function(err, res) {
          if (err) {
            app.log("RedisTransport: [%s:%s] %s", config.host, config.port, err.code);
          } else if (typeof config.db == 'number' && config.db !== 0) {
            self.client.select(config.db, function(err, res) {
              if (err) callback.call(self, err);
              else callback.call(self, null);
            });
          } else {
            callback.call(self, null);
          }
        });
      } else if (typeof config.db == 'number' && config.db !== 0) {
        self.client.select(config.db, function(err, res) {
          callback.call(self, err);
        });
      } else {
        callback.call(self, null);
      }

    }
  });

}

module.exports = RedisTransport;