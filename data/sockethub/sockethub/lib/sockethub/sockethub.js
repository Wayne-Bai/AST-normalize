/**
 * This file is part of sockethub.
 *
 * copyright 2012-2013 Nick Jennings (https://github.com/silverbucket)
 *
 * sockethub is licensed under the AGPLv3.
 * See the LICENSE file for details.
 *
 * The latest version of sockethub can be found here:
 *   git://github.com/sockethub/sockethub.git
 *
 * For more information about sockethub visit http://sockethub.org/.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

//
// This is a bootstrap file, it handles loading config, setting default values,
// initializing the dispatcher and listener(s), and doing all the dirty checking
// and setup of the correct running environment.
//
require("consoleplusplus/console++");
var posix         = require('posix');
var Q             = require('q');
var fs            = require('fs');
var EventEmitter  = require('events').EventEmitter;
var redisPool     = require('redis-connection-pool')('sockethubRedisPool', {
  MAX_CLIENTS: 30
});

var config;
var sockethubId;
// http and websocket server objects
var server = {
  websocket: '',
  http: ''
};
var lcontrol,   // lcontrol - listener control thread
    dispatcher; // dispatcher module object


function generateSockethubId() {
  var randa = Math.floor((Math.random()*10)+1) + new Date().getTime();
  var randb = Math.floor((Math.random()*10)+2) *
            Math.floor((Math.random()*10)+3) /
            Math.floor((Math.random()*10)+4);
  return randa * randb / 1000;
}

/**
 * Function: Sockethub
 *
 * initial bootstrap controller for sockethub. loads config, logging, calls
 * functions for sanity checkes, and for initializing dispatcher and/or
 * listeners.
 *
 * Parameters:
 *
 *   p (object) - an object of parameters as set from the command-line
 *                sockethub executable.
 *
 *   initialize (boolean) - [optional] whether or not to initialize the
 *                          listeners and dispatchers automatically.
 *                          default: true
 *
 */
function Sockethub(p, initialize) {
  initialize = (typeof initialize === 'undefined') ? true : initialize;
  this.events = new EventEmitter();
  var self = this;
  //
  // root of codebase
  if (!p.root) {
    p.root = "./";
  }

  //
  // load config
  // - if p.config is an object, instead of string, config-loader will
  // use that instead of trying to load the config file. (same for secret)
  var _config = (p.config) ? p.config : p.root + '../../config.js';
  var _secrets = (p.secrets) ? p.secrets : p.root + '../../config.secrets.js';
  config = require('./config-loader').get(_config, _secrets, p);

  sockethubId = p.sockethubId || generateSockethubId();

  //
  // override console behavior
  console = require('./logging.js')({controller: 'sockethub',
                                     console: console,
                                     debug: config.DEBUG,
                                     logfile: config.LOG_FILE,
                                     verbose: config.VERBOSE});

  if (config.SHOW_INFO) {
    // command-line parameter received to show config information
    // and do not start up sockethub

    config.printSummary();
    process.exit(1);
  }

  check().then(function () {
      // prepExamples if needed
      return Sockethub.prototype.prepExamples(p.root);
  }).then(function() {
    if (initialize) {
      // automatic initialization of sockethub
      Sockethub.prototype.initListenerController().then(function (control) {
        lcontrol = control;
        return Sockethub.prototype.initDispatcher();
      }).then(function () {
        console.debug(' [sockethub] initialization dispatcher: '+typeof disp);
        console.always(' [*] finished loading');
        self.sessionManager = dispatcher.sessionManager;
        self.events.emit('initialized');
      }, function (err) {
        console.error(' [sockethub] ' + err);
        if (err.stack) {
          console.log(err.stack);
        }
        self.shutdown();
      });
    }
  }, function(err) {
    console.error(' [sockethub] check error: ' + err);
    self.shutdown().then(function () {
      process.exit(1);
    }, function () {
      process.exit(1);
    });
  });
}

//
// shutdown
Sockethub.prototype.shutdown = function () {
  console.log('shutting down sockethub...');
  var q = Q.defer();
  Sockethub.prototype.shutdownDispatcher(dispatcher).then(function () {
    if (lcontrol) {
      console.debug(' [sockethub] verifying listener shutdown...');
      lcontrol.kill('SIGINT'); // sends signal to listener-control thread
    }

    if (server.http) {
      console.debug(' [sockethub] shutting down http server... ');
      server.http.close();
    }

    if (server.websocket) {
     console.debug(' [sockethub] shutting down websocket server... ');
     server.websocket.close();
    }
    q.resolve();
  }, function (err) {
    q.reject(err);
  });
  return q.promise;
};

//
// perform config sanity checks, redis version and connectivity
function check() {
  if (!config) {
    console.error(' [sockethub] nothing found in config, exiting');
    throw new Error('nothing found in config, exiting');
    //process.exit(1);
  }

  // set session ulimit
  var limits = posix.getrlimit('nofile');
  console.debug('CURRENT SYSTEM RESOURCE limits: soft=' + limits.soft + ', max=' + limits.hard);
  try {
    posix.setrlimit('nofile', {soft: '4096', hard: '4096'});
    limits = posix.getrlimit('nofile');
    console.debug('ADJUSTED RESOURCES limits: soft=' + limits.soft + ', max=' + limits.hard);
  } catch (e) {
    console.error('unable to set ulimit, resource issues could arise. skipping');
  }

  return check_redis();
}

function check_redis() {
  var q = Q.defer();
  // test redis service
  console.debug(" [sockethub] verifying redis connection");

  redisPool.check().then(function (redis_version) {
    config.REDIS_VERSION = redis_version;
    if (redisPool.VERSION_ARRAY[0] < 2) {
      q.reject("Sockethub requires redis version 2.x or above for the brpop command. " +
         "Current redis version "+ redisPool.VERSION_STRING);
    } else {
      config.REDIS_VERSION = redisPool.VERSION_STRING;
      console.info(' [sockethub] redis check successful (version ' + config.REDIS_VERSION + ')');
      q.resolve(config.REDIS_VERSION);
    }
  }, function (err) {
    console.error(' [sockethub] redis error: ' + err);
    //throw new Error('redis error:',err);
    q.reject(err);
  });


  return q.promise;
}

//
// prep the examples config.js
Sockethub.prototype.prepExamples = function (root) {
  var q = Q.defer();
  if (!config.EXAMPLES.ENABLE) {
    q.resolve();
    return q.promise;
  }

  /**
   *  write examples/connect-config.js
   */
  var fileContents;
  var TLS = false;
  var secret = '1234567890';
  if ((config.PUBLIC) &&
      (config.PUBLIC.DOMAIN) &&
      (config.PUBLIC.PORT) &&
      (config.PUBLIC.WEBSOCKET_PATH)) {
    TLS = (config.PUBLIC.TLS) ? 'true' : 'false';
    fileContents = 'var CONNECT = {};' +
                   'CONNECT.TLS=' + TLS + ';' +
                   'CONNECT.HOST="' + config.PUBLIC.DOMAIN + '";' +
                   'CONNECT.PORT=' + config.PUBLIC.PORT + ';' +
                   'CONNECT.PATH="' + config.PUBLIC.WEBSOCKET_PATH + '";';
  } else {
    TLS = (config.HOST.ENABLE_TLS) ? 'true' : 'false';
    fileContents = 'var CONNECT = {};' +
                   'CONNECT.TLS=' + TLS + ';' +
                   'CONNECT.HOST="localhost";' +
                   'CONNECT.PORT=' + config.HOST.PORT + ';' +
                   'CONNECT.PATH="/sockethub";';
  }
  if ((config.EXAMPLES) && (config.EXAMPLES.SECRET)) {
    secret = config.EXAMPLES.SECRET;
  }
  fileContents = fileContents + 'CONNECT.SECRET="'+secret+'";';

  fs.writeFile(config.EXAMPLES.DIRECTORY + "/connect-config.js", fileContents, function (err) {
    if (err) {
      console.warn(' [sockethub] failed to write to '+ config.EXAMPLES.DIRECTORY +
                      '/connect-config.js - examples may not work ', err);
      config.EXAMPLES.ENABLE = false;
      //q.reject('failed to write to '+ config.EXAMPLES.DIRECTORY + '/connect-config.js');
      q.resolve();
    } else {
      console.debug(' [sockethub] wrote to '+ config.EXAMPLES.DIRECTORY + '/connect-config.js');
      q.resolve();
    }
  });
  return q.promise;
};

//
// shutdown dispatcher
Sockethub.prototype.shutdownDispatcher = function (dispatcher) {
  var q = Q.defer();
  if (!dispatcher) {
    q.resolve();
    return q.promise;
  }

  dispatcher.shutdown();
  redisPool.clean('sockethub:'+sockethubId+':*', function () {
    q.resolve();
  });
  return q.promise;
};

//
// initialize dispatcher
Sockethub.prototype.initDispatcher = function () {
  if (!config.HOST.INIT_DISPATCHER) {
    var q = Q.defer();
    q.resolve(null);
    return q.promise;
  }

  console.debug(' [sockethub] initializing dispatcher');

  var proto;
  //
  // load in protocol.js (all the schemas) and perform validation
  try {
    proto = require("./protocol.js");
  } catch (e) {
    throw new Error(' [sockethub] unable to load lib/sockethub/protocol.js ' + e);
  }

  //try {
    dispatcher = require('./dispatcher.js');
  // } catch (e) {
  //   console.error(' [sockethub] unable to load lib/sockethub/dispatcher.js : ',e);
  //   throw new Error('[sockethub] unable to load lib/sockethub/dispatcher.js : ' + e);
  // }

  return dispatcher.init(config.HOST.MY_PLATFORMS, sockethubId, proto).then(function () {
    try {
      // initialize http server
      server.http = require('./../servers/http').init(config);
    } catch (e) {
      //console.error(' [sockethub] unable to load lib/servers/http ' + e);
      throw new Error(' [sockethub] unable to load lib/servers/http ' + e);
    }

    try {
      // initialize websocket server
      server.websocket = require('./../servers/websocket').init(config, server.http, dispatcher);
    } catch (e) {
      //console.error(' [sockethub] unable to load lib/servers/websocket ' + e);
      throw new Error(' [sockethub] unable to load lib/servers/websocket ' + e);
    }
  });
};

//
// initialize listener controller
Sockethub.prototype.initListenerController = function () {
  var q = Q.defer();
  if (!config.HOST.INIT_LISTENER) {
    q.resolve();
    return q.promise;
  }

  console.debug(' [sockethub] spawning listener control');

  var args = ['-i', sockethubId];
  if (config.CONFIG_FILE) {
    args.push('-c');
    args.push(config.CONFIG_FILE);
  } else {
    // if we didn't get a config file during initialization, we can pass the
    // config object as a string to the listener control.
    args.push('-o');
    args.push(JSON.stringify(config));
  }

  if (config.DEBUG) {
    args.push('-d');
  }
  if (config.VERBOSE) {
    args.push('--verbose');
  }
  if (config.LOG_FILE) {
    args.push('-l');
    args.push(config.LOG_FILE);
  }
  var path = require('path');
  var spawn    = require('child_process').spawn;
  var listener_path = path.resolve(config.BASE_PATH, './bin/sockethub-listener-control.js');
  var control  = spawn(listener_path, args);

  control.stdout.on('data', function (data) {
    console.log(__strip(''+data));
  });
  control.stderr.on('data', function (data) {
    console.log(__strip(''+data));
  });
  control.on('close', function () {
    console.debug(' [sockethub] close event received from listener-controller...');
  });
  q.resolve(control);
  return q.promise;
};

function __strip(string) {
  return string.replace(/^[\r\n]+|[\r\n]+$/g, "");
}

module.exports = function (a, b, c) {
  return new Sockethub(a, b, c);
};