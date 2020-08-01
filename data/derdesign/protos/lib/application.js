
/* lib/application.js */

/** [STATIC_VIEW_EXTENSIONS]

  Expected behavior for view extensions & raw:
  
  app.views.staticAssoc -> Contains association data for static views

  { '/another': 'another.raw.hbs',
    '/test': 'test.hbs',
    '/test.json': 'test[json].raw.hbs',
    '/without': 'without[].hbs',
    '/hello/test.xml': 'hello/test[xml].hbs',
    '/hello/world.html': 'hello/world[html].hbs' }

  app.views.staticRaw -> Contains raw option for static views
  
  { '/another': true, '/test.json': true }

  app.views.staticMime -> Contains mime type information for static views
  
  { '/test.json': 'application/json',
    '/hello/test.xml': 'application/xml',
    '/hello/world.html': 'text/html' }
 */

var app;
var _ = require('underscore');
var http = require('http');
var cluster = require('cluster');
var chokidar = require('chokidar');
var fileModule = require('file');
var pathModule = require('path');
var urlModule = require('url');
var crypto = require('crypto');
var qs = require('qs');
var fs = require('fs');
var vm = require('vm');
var cp = require('child_process');
var util = require('util');
var mime = require('mime');
var sanitizer = require('sanitizer');
var node_uuid = require('node-uuid');
var inflect = protos.inflect;
var slice = Array.prototype.slice;
var isEmpty = _.isEmpty;
var Multi = require('multi');
var EventEmitter = require('events').EventEmitter;
    
// Set to true when reloading code
var RELOADING = false;

// Token used for inter process communication (internally within the app)
var IPC_TOKEN = '::internal::';

var asyncTasks = [];

/**
  Application Class
  
  @class Application
  @constructor
  @param {string} domain
  @param {string} path
 */

 function Application(domain, path) {
   
   // Late instantiation. This is to make sure
   // the app singleton is created and referenced by others
   // before the object is properly instantiated.

   this.IPC_TOKEN = IPC_TOKEN;

   this.loadSelf = function() {
     
    app = this;

    this.inflect = protos.inflect;

    var self = this;
    
    // Set environment
    Object.defineProperty(this, 'environment', {
      value: protos.environment,
      writable: false,
      enumerable: true,
      configurable: false
    });
     
    // Cluster object
    this.cluster = cluster;

    // Application's Hostname
    this.hostname = domain;

    // Domain that will be used to generate cookies, instead
    // of the original application's domain name.
    this.cookieDomain = null;

    // Path where the application is located
    this.path = path;

    // Application's Classname
    this.className = this.constructor.name;

    // Boolean value indicating whether or not the application has initialized
    this.initialized = false;

    // Directory to store the models, views, controllers & helpers
    // Defaults to skeleton root. Must start/end with a slash.
    this.mvcpath = path + '/app/';

    // Application's API. Groups methods related to the application.
    // The API object gets its methods from the files in the api/ directory.
    this.api = {};

    // Application paths. These define where the several application files be stored
    // within the application directory structure.
    this.paths = {
      api: 'api/',
      data: 'data/',
      layout: '__layout/',
      restricted: '__restricted/',
      static: '__static/',
      public: 'public/',
      upload: 'upload/',
      environment: 'env/',
      extensions: 'ext/',
      templates: 'templates/'
    }

    /*
      Contains the view data for the application

      static: Static view paths
      buffers: Template sources
      callbacks: Rendered template functions
      partials: Rendered template partials
    */  

    this.views = {
      static: [],
      buffers: {},
      callbacks: {},
      partials: {}
    }

    // If set to true, the application will print log messages on stdout.
    this.logging = true;

    // If set to true, the application will print debug messages on stdout.
    this.debugLog = protos.config.bootstrap.debugLog ? true : false;

    // If set to true, the application will cache the rendered views, to optimize performance.
    this.viewCaching = false;

    // Login URL to use when redirecting unauthenticated users.
    this.loginUrl = '/login';

    // Debug color to use on the console
    this.debugColor = protos.config.bootstrap.debugColor || '0;37';

    // Application templates
    this.templates = {};

    // Application hooks. Callbacks to run on specific events
    this.hooks = {};

    // Driver instances
    this.drivers = {};

    // Storage instances
    this.storages = {};

    // Helper instances
    this.helpers = {};

    // Controller instances
    this.controllers = {};

    // Controller handlers
    this.handlers = {};

    // Model method aliases
    this.model = {}; // Contains model method aliases

    // Model instances
    this.models = {}; // Contains model instances

    // Engine instances
    this.engines = {};
    
    this.noop = protos.noop;

    this.defaultEngine = null;

    this.loadedEngines = [];

    this.config = {};

    this.locals = {};

    this.routes = {};

    this.httpMethods = protos.httpMethods;

    this.httpStatusCodes = http.STATUS_CODES;

    // Stores booleans with middleware support/availability information.
    // This property is manipulated by middleware.

    this.supports = {};

    // To be used by middleware to store objects
    this.resources = {};

    // Store filters
    this.__filters = {};

    // Store data
    this.__data = {};

    /*
      Execution state for tasks. Keys represent the
      task ID's and their respective values are booleans.

      The boolean values will determine if the task's
      callback will be executed (when the task's state
      is checked on a specific iteration)
    */

    this.__jobExecutionState = {};

    // Task Interval IDs. Can be passed to clearInterval to
    // disable the tasks permanently.

    this.__jobIntervalIDs = {};

    // Object containing each of the invalidation callbacks for each cache key
    this.__jobInvalidationCallbacks = {};

    /////////////////////////////

    // Attach configuration
    this.config = parseConfig.call(this);

    // Verify that regexes are valid

    if (!this.config.regex) this.config.regex = {};

    for (var r in this.config.regex) {

      if (r in protos.regex) {
        this.debug("Warning: regex has been overridden: %s", r);
      }

      var re = this.config.regex[r].toString();

      if (!protos.regex.validRegex.test(re)) {
        throw new Error(util.format("\
Bad regular expression in app.config.regex, where %s => %s\n\n\
%s\n", r, re, protos.i18n.badRegularExpression));
      }

    }

    /////////////////////////////

    this.regex = _.extend(this.config.regex, protos.regex);

    // Structure application's baseUrl
    
    var portSuffix = protos.config.bootstrap.server.portSuffix;
    var listenPort = protos.config.server.listenPort;
    var securePort = protos.config.bootstrap.server.useSSL ? protos.config.bootstrap.ssl.port : null;
    
    if (portSuffix || portSuffix === undefined) {
      // If portSuffix is undefined it means the boot.js file does not have it defined, therefore
      // it should be assumed as defined, since this is the default behavior.
      var portStr = (listenPort !== 80) ? util.format(':%s', listenPort) : '';
      var securePortStr = (securePort !== 443) ? util.format(':%s', securePort) : '';
    } else {
      portStr = securePortStr = '';
    }
    
    this.baseUrl = util.format('http://%s%s', this.hostname, portStr);
    this.baseUrlSecure = util.format('https://%s%s', this.hostname, securePortStr);

    var useSSL = protos.config.useSSL;
    var ssl = protos.config.bootstrap.ssl;

    var serverCallback = function(req, res) {
      req.startTime = Date.now();
      self.routeRequest(req, res);
    }

    this.server = http.createServer(serverCallback);

    if (useSSL && ssl) {
      var sslServerOpts = {
        key: fs.readFileSync(this.fullPath(ssl.key), 'utf8'),
        cert: fs.readFileSync(this.fullPath(ssl.cert), 'utf8')
      }
      this.secureServer = require('https').createServer(sslServerOpts, serverCallback);
    }

    // Load protos components
    var componentsCb = (protos.config.bootstrap.events && protos.config.bootstrap.events.components);
    if (componentsCb instanceof Function) {
      componentsCb.call(protos, protos);
    }

    // Emit protos bootstrap event
    protos.emit('bootstrap', this);

    // Set worker message listener (messages from workers to master)
    // Runs messages formatted as [method, arg1, arg2, ... argn],
    // assuming 'method' is an actual method existing in app
    // This is internal, not intended for use in apps (unless you really know what you're doing)

    this.on('worker_message', function(msg) {
      if (msg instanceof Array) {
        var token = msg[0];
        if (token === IPC_TOKEN) {
          var method = msg[1];
          if (app[method] instanceof Function) {
            try {
              app[method].apply(app, msg.slice(2));
            } catch(err) {
              (app.errorLog || app.log)(err);
            }
          }
        }
      }
    });
    
    // Set master message listener (messages from master to workers)
    // Runs messages formatted as [method, arg1, arg2, ... argn],
    // assuming 'method' is an actual method existing in app
    // This is internal, not intended for use in apps (unless you really know what you're doing)

    this.on('master_message', function(msg) {
      if (msg instanceof Array) {
        var token = msg[0];
        if (token === IPC_TOKEN) {
          var method = msg[1];
          if (app[method] instanceof Function) {
            try {
              app[method].apply(app, msg.slice(2));
            } catch(err) {
              (app.errorLog || app.log)(err);
            }
          }
        }
      }
    });
    
    // Load data
    loadData.call(this);

    // Load hooks
    loadHooks.call(this);
    
    // Emit env data hook
    this.emit('env_data_loaded', protos.__envData);
    
    // Emit app's pre_init event (needs to be called after loading hooks)
    // to be able to use hooks/pre_init.js on the app
    this.emit('pre_init', this);

    // Run initialization code
    this.initialize();

  }

}

util.inherits(Application, EventEmitter);

/**
  Initializes the application

  @private
 */

Application.prototype.initialize = function() {

  // Set initialized state
  this.initialized = true;

  // Handle async tasks
  this.once('init', function(self) {
    if (asyncTasks.length === 0) {
      this.ready = true;
      this.emit('ready', this);
    } else {
      var intID = setInterval(function() {
        if (asyncTasks.length === 0) {
          clearInterval(intID);
          self.ready = true;
          self.emit('ready', self);
        }
      }, 50);
    }
  });
  
  // Parse Drivers & Storages
  parseDriverConfig.call(this);
  parseStorageConfig.call(this);
  
  // Load engines
  loadEngines.call(this);

  // Setup static views
  setupStaticViews.call(this);
  
  // Load Extensions in ext/
  loadExtensions.call(this);
  
  // Load Properties in include/
  loadIncludeProperties.call(this);
  
  // Load API methods in api/
  loadAPI.call(this);
  
  // Load Models in app/models
  loadModels.call(this);
  
  // Load View Helpers in app/helpers
  loadHelpers.call(this);
  
  // Load middleware via event
  this.emit('middleware', this);

  // Setup View Partials. Requires helpers
  setupViewPartials.call(this);
  
  // Setup templates. Requires helpers
  setupTemplates.call(this);
  
  // Load controller handlers in app/handlers
  processControllerHandlers.call(this);
  
  // Load controllers in app/controllers. Requires handlers
  loadControllers.call(this);
  
  // Emit the 'init' event. Here, the middleware is initialized. 
  // Some modules make use of storages (for caching or other purposes),
  // which is why Drivers/Storages need to be available at this point.
  this.emit('init', this);

}

var mtDefinedFuns = {};

// Sends to workers or runs in self
Application.prototype.multiThreaded = function(id, callback) {
  
  if (callback == null) {
    throw new Error('Function expects [id, callback]');
  } else {
    
    if (id in mtDefinedFuns) {
      throw new Error(util.format("The multi threaded task [%s] has already been defined", id));
    } else {
      mtDefinedFuns[id] = true;
    }
    
    var isMessageForMe = function(msg) {
      return (msg instanceof Array && msg[0] === IPC_TOKEN && msg[1] === '::run_multi_threaded::' && msg[2] === id);
    }
    
    var taskMessage = [IPC_TOKEN, '::run_multi_threaded::', id];
    
    var getArgs = function(msg) {
      // This is to avoid the original task message from being mutated by returning
      // a new copy of the array, only with the passed arguments, if available
      return msg.slice(taskMessage.length);
    }
    
    if (protos.config.server.multiProcess && cluster.isMaster) {
      
      // Master
      // 1. Listen for worker messages and send task to all workers on receive
      
      // Sends a message to all workers to run the task
      var sendToWorkers = function() {
        var args = [].slice.call(arguments, 0);
        var workerMessage, done = 0;
        var workerKeys = Object.keys(cluster.workers);
        var nextWorker = function() {
          if (workerKeys.length) {
            done++;
            cluster.workers[workerKeys.shift()].send(taskMessage.concat([args]));
          } else {
            app.log("Executed [%s] on %d workers", id, done);
            app.removeListener('worker_message', workerMessage);
          }
        }
        app.on('worker_message', workerMessage = function(msg) {
          if (isMessageForMe(msg) && msg[3] === 'done') {
            nextWorker()
          }
        });
        nextWorker();
      }
      
      // If a message is received from workers, send to all and run
      app.on('worker_message', function(msg) {
        if (isMessageForMe(msg) && msg[3] === 'run') {
          sendToWorkers.apply(null, getArgs(msg).pop() || []);
        }
      });
      
      // Return send to workers function. Each time the app runs the
      // returned function, it is actually calling sendToWorkers, and
      // behind the scenes, the magic happens.
      return sendToWorkers;
        
    } else if (cluster.isWorker) {
      
      // Worker stuff
      // 1. Tell master to run task on all worker processes
      // 2. Listen for master messages and on run on receive
      
      // Tell master to run task on all worker processes
      var runCallback = function() {
        var args = [].slice.call(arguments, 0);
        process.send(taskMessage.concat(['run', args]));
      }
      
      // Listen for master messages and on run on receive
      app.on('master_message', function(msg) {
        if (isMessageForMe(msg)) {
          callback.apply(null, getArgs(msg).pop() || []);
          process.send(taskMessage.concat(['done']));
        }
      });
      
      // Runs the callback
      return runCallback;

    } else {
      
      // Normal process, no cluster
      
      return callback;
      
    }

  }
}

// Reload specific components of the application on runtime (on 
// all workers if running in a clustered environment), without
// having to restart the app (hot code loading).

Application.prototype.reload = function(spec) {
  
  if (!spec) return;
  
  var defaults = {
    
    // Assets will only be reloaded when reloading all if the asset compiler
    // is loaded and if the allowReloadAll option is set to true. Such option
    // is disabled by default, because reloading assets is a very expensive
    // operation which may require lots of disk IO.
    assets: (app.supports.asset_compiler && app.asset_compiler.config.allowReloadAll) || false,
    
    data: spec.all,
    hooks: spec.all,
    env: spec.all,
    includes: spec.all,
    exts: spec.all,
    models: spec.all,
    helpers: spec.all,
    views: spec.all,
    partials: spec.all,
    templates: spec.all,
    static: spec.all,
    handlers: spec.all,
    controllers: spec.all,
    api: spec.all

  }
  
  var components = spec.all ? ['all'] : Object.keys(defaults).filter(function(key) {
    return spec[key] && key in defaults;
  });
  
  if (protos.config.server.multiProcess && cluster.isMaster) {
    
    var workers = cluster.workers;
    var workerKeys = Object.keys(workers);
    var done = 0;
    
    var workerMessage = function(msg) {
      if (msg[0] === IPC_TOKEN && msg[1] == 'reload_next_worker') {
        if (workerKeys.length > 0) {
          reloadWorker();
        } else {
          app.log("Reloaded [%s] on %d workers", components.join(), done);
          app.removeListener('worker_message', workerMessage);
        }
      }
    }
    
    var reloadWorker = function() {
      done++;
      workers[workerKeys.shift()].send([IPC_TOKEN, 'reload', spec]);
    }
    
    this.on('worker_message', workerMessage);
    
    reloadWorker();
    
  } else {
    
    spec = _.extend(defaults, spec);
    
    app.emit('before_reload', spec);
    
     RELOADING = true;
    
    // The following order serves as a dependency reference
    
    if (spec.assets && app.supports.asset_compiler) app.emit('asset_compiler_reload_assets');
    
    if (spec.data) loadData.call(this);
    
    if (spec.hooks) loadHooks.call(this);
    
    if (spec.env) protos.emit('refresh_env_data');
    
    if (spec.static) setupStaticViews.call(this);
    
    if (spec.exts) loadExtensions.call(this);

    if (spec.includes) loadIncludeProperties.call(this);
    
    if (spec.api) loadAPI.call(this);

    if (spec.models) loadModels.call(this);

    if (spec.helpers) loadHelpers.call(this);
    
    if (spec.partials) setupViewPartials.call(this);
    
    if (spec.templates) setupTemplates.call(this);

    if (spec.views) {
      app.views.callbacks = {}; // Empty view callbacks
    }

    if (spec.handlers) processControllerHandlers.call(this);

    if (spec.controllers) {
      app.routes = []; // Empty routes to regenerate again
      loadControllers.call(this);
    }

    RELOADING = false;
    
    app.emit('after_reload', spec);

    if (cluster.isMaster) {
      
      app.log("Reloaded [%s] on master process", components.join());
      
    } else {
      
      process.send([IPC_TOKEN, 'reload_next_worker']); // Tell master to reload next worker
      
    }
    
  }
  
}

/**
  Renders a template from app/templates

  Example:

  app.renderTemplate('mail/registration', {
    user: "John Doe",
    package: "Premium",
  });

  @param {string} template path without extension
  @return {string} rendered template
 */

Application.prototype.renderTemplate = function(name, data) {
  
  name = name.replace(this.regex.multipleSlashes, '/');
  name = name.replace(this.regex.startOrEndSlash, '');
  
  var partial = this.templates[name];
  
  if (partial instanceof Function) {

    var engine = partial.engine;
    
    // Create locals proto
    var proto = Object.create(engine.returnPartials());
    
    // Extend proto with locals
    _.extend(proto, app.locals);
    
    if (data) {
      // Set proto to data
      data.__proto__ = proto;
    } else {
      // Set data as proto
      data = proto;
    }
    
    // Extend data with globals
    data = _.extend(data, {
      protos: protos,
      app: app
    });
    
    // Circular reference to data as locals
    data.locals = data;
    
    // Get rendered buffer 
    var buf = partial(data);

    // Apply shortcodes
    if (this.config.shortcodeFilter) {
      buf = this.shortcode.parse(buf, data, this.__shortcodeContext);
    }

    // Return buffer
    return buf;

  } else {
    
    return '';

  }

}

/**
  Gets or sets application data with options

  The following options are available: 
    
    * strict  : If true, data is only set when the components within the path are objects.
    * replace : If true, replaces any non-object values with objects to satisfy the path to be set.

  The method behaves differently depending on the amount of parameters provided:

    * app.data(key, value)          => Sets key with value. Returns boolean
    * app.data(key, value, options) => Sets key with value using additional options. Returns boolean
    * app.data()                    => Returns the internal data object. Returns object

  When setting values, a boolean is returned, which determines if the data was set.

  @public
  @param {string} Key to set
  @param {mixed} Value to set
  @param {options} Options to pass (optional)
  @return {mixed|boolean}
  */

Application.prototype.data = function() {
  
  var args = slice.call(arguments, 0);
  var key = args[0], val = args[1], opts = args[2];
  
  opts = opts || {
    strict: true,
    replace: false
  }
  
  // If replace is enabled, strict must be false
  if (opts.replace) opts.strict = false;
  
  switch (args.length) {
    
    case 2:
    case 3:
      
      // Set key
      
      if (key.indexOf('.') > 0) {
        key = key.split('.');
        var oldParent, parent = this.__data, len = key.length, last = (len-1);
        for (var k,i=0; i < len; i++) {
          k = key[i];
          if (i === last) {
            parent[k] = val;
            return true;
          } else {
            oldParent = parent;
            parent = parent[k] || (parent[k] = (opts.strict ? undefined : {}));
            if (parent && typeof parent == 'object') {
              continue;
            } else if (opts.strict){
              if (parent) {
                oldParent[k] = parent;
              } else {
                delete oldParent[k];
              }
              return false;
            } else if (opts.replace) {
              parent = oldParent[k] = {};
              continue;
            } else {
              return false;
            }
          }
        }
      } else {
        this.__data[key] = val;
        return true;
      }
      break;

    case 1:
      
      // Get key(s)

      if (key.indexOf('.') > 0) {
        key = key.split('.');
        len = key.length, last = (len-1);
        var out = this.__data;
        for (k,i=0; i < len; i++) {
          k = key[i];
          if (i === last) {
            return out[k];
          } else {
            out = out[k];
            if (out && typeof out == 'object') {
              continue;
            } else {
              return undefined;
            }
          }
        }
      } else {
        return this.__data[key]
      }
      break;

    case 0:
      
      // Get all keys
      return this.__data;

  }

}

/**
  Adds a job to be executed periodically after a specified interval
  
  @public
  @param {string} job Job ID
  @param {function} callback Callback to run on each interval
  @param {integer} interval Amount of miliseconds to wait
  @param {boolean} runImmed Run callback immediately after adding job
  @return {object} self
  */
  
Application.prototype.addJob = function(job, callback, interval, runImmed) {
  
  if (cluster.isMaster) {
  
    // Jobs are only added on the master process
    
    var self = this;
    var state = this.__jobExecutionState;

    if (job in state) {
      throw new Error(util.format("Job already added: %s", job));
    } else {
      state[job] = false;
      this.__jobIntervalIDs[job] = setInterval(function(job) {
        if (state[job]) {
          self.debug("Running Job: %s", job);
          callback.call(self);
          state[job] = false;
        } else {
          self.debug("Idle Job: %s", job);
        }
      }, interval, job);
      if (runImmed) callback.call(self);
    }

  }
  
  return this;

}

/**
  Adds a job to the job queue, which will make the job
  callback to be executed on the next iteration.
  
  @public
  @param {string} job Job ID to add
  @return {object} instance
 */

Application.prototype.queueJob = function(job) {
  
  if (cluster.isMaster) {
    
    // Jobs are only queued in the master process
    
    var state = this.__jobExecutionState;
    if (job in state) {
      this.__jobExecutionState[job] = true;
      this.emit('queue_job', job);
      this.debug('Queuing job [%s]', job);
    }
    
  } else {
    
    process.send([IPC_TOKEN, 'queueJob', job]);

  }

  return this;

}

/**
  Removes a job
  
  @public
  @param {string} job Job ID to remove
  @return {object} self
 */

Application.prototype.removeJob = function(job) {
  
  if (cluster.isMaster) {
    
    // Jobs are only removed in the master process
    
    var state = this.__jobExecutionState;
    if (job in state) {
      this.debug("Removing Job: %s", job);
      clearInterval(this.__jobIntervalIDs[job]);
      delete this.__jobIntervalIDs[job];
      delete this.__jobExecutionState[job];
      this.emit('remove_job', job);
    }
    
  } else {
    
    process.send([IPC_TOKEN, 'removeJob', job]);
    
  }
  
  return this;

}

/**
  Invalidates a cache key (which contains one or multiple cacheIDs)
  at a specific interval, as long as the cache key is invalidated
  during the interval.
  
  The cache key can be invalidated using Application::invalidateCacheKey.
  
  The spec object for configuration consists of the following:

  @spec
    key {string} Cache Key
    cacheID {string|Array} Cache ID(s) to invalidate
    interval {integer} Amount of time between each check
    storage {object} Storage instance to delete the cache
    runImmed {boolean} Whether or not to invalidate immediately
    nowarn {boolean} Whether or not to supress job log message (if set to false, a debug message will be used instead)
    
  @public
  @param {object} spec
  @return {object} Application instance
 */

Application.prototype.invalidateCacheInterval = function(spec) {
  
  if (cluster.isMaster) {
    
    // Caches are only invalidated on the master process
    
    var self = this;
    var storage = spec.storage;
    var cacheKey = spec.key;

    var job = spec.key;

    this.addJob(job, self.__jobInvalidationCallbacks[job] = function(callback) {

      storage.delete(spec.cacheID, function(err) { // Accepts both string & array, uses transactions for the latter
        if (err) {
          var logMethod = (self.errorLog || self.log);
          logMethod.call(self, err);
        } else {
          self.debug("Invalidated Cache Key: %s", cacheKey);
          self.emit('cache_key_invalidate_success', job);
          if (callback instanceof Function) callback(); // Callback used when running the job function manually
        }
      });

    }, spec.interval, spec.runImmed);

    // Log msg
    this[spec.nowarn ? 'debug' : 'log']("Invalidating Cache Key [%s] every %ds", cacheKey, spec.interval/1000);
    
  }
  
  return this;
  
}

/**
  Invalidate cache key. Will force regeneration on the next
  check interval.
  
  @public
  @param {string} Cache Key
 */

Application.prototype.invalidateCacheKey = function(cacheKey) {
  
  if (cluster.isMaster) {
    
    this.queueJob(cacheKey);
    this.emit('invalidate_cache_key', cacheKey);
    this.debug("Marked cache key [%s] for invalidation", cacheKey);

  } else {
    
    process.send([IPC_TOKEN, 'invalidateCacheKey', cacheKey]);

  }

  return this;

}

/**
  Clears the cache key interval.
  
  @public
  @param {string} Cache Key
 */

Application.prototype.clearCacheKeyInterval = function(cacheKey) {
  
  if (cluster.isMaster) {
    
    this.removeJob(cacheKey);
    this.emit('clear_cache_key_interval', cacheKey);
    this.debug("Cleared cache key interval for [%s]", cacheKey);
    
  } else {
    
    process.send([IPC_TOKEN, 'clearCacheKeyInterval', cacheKey]);
    
  }
  
  return this;

}

/**
  Purges the cache key immediately
  
  @public
  @param {string} cacheKey
  @param {function} callback
 */

Application.prototype.purgeCacheKey = function(cacheKey, callback) {
  
  if (cluster.isMaster) {
    
    this.__jobInvalidationCallbacks[cacheKey].call(this, callback);
    
  } else {
    
    process.send([IPC_TOKEN, 'purgeCacheKey', cacheKey]);
    
  }
  
  return this;
}

/**
  Creates a new Validator Instance passing options. A Validator factory.
  
  @public
  @param {object} config Configuration object to pass to the Validator constructor
  @returns {object} Validator instance
 */

Application.prototype.validator = function(config) {
  return new protos.lib.validator(config);
}

/**
  Adds an async task, which should finish before emitting the 'ready' event.

  @private
 */

Application.prototype.addReadyTask = function() {
  this.debug('Adding task to async queue');
  asyncTasks.push(1);
}

/**
  Removes an async task. When all async tasks are done, the 'ready' event is fired.

  @private
  @method flushReadyTask
 */

Application.prototype.flushReadyTask = function() {
  this.debug('Removing task from async queue');
  asyncTasks.pop();
}

/**
  Routes a request based on the application`s controllers, routes & static views
  
  @private
  @param {object} req
  @param {object} res
 */

Application.prototype.routeRequest = function(req, res) {

  // Prevent malformed HTTP Requests
  if (req.url[0] != '/') {
    res.writeHead(400, {Connection: 'close', Status: '400 Bad Request'});
    res.end('');
    return;
  }

  var urlData = urlModule.parse(req.url),
      url = urlData.pathname,
      controller;
      
  // Encode referer
  var referer;
  
  if ((referer = req.headers.referer)) { // NOTE: It's an assignment, not equality
    req.headers.referer = encodeURI(referer);
  }
      
  // Set request properties
  res.request = req;
  req.response = res;
  req.route = {};
  req.urlData = urlData;
  req.params = {};
  req.isStatic = false;
  res.__context = null;
  res.__setCookie = [];
  req.__handled = false;
  res.__headers = _.extend({}, this.config.headers);
  req.__metadata = {};
  req.__skipFilters = false;
  
  // Override res.end with method supporting sessions
  if (this.supports.session) res.end = app.session.endResponse;

  // On HEAD requests, redirect to request url (should be processed before the `request` event)
  if (req.method == 'HEAD') {
    this.emit('head_request', req, res);
    if (req.__stopRoute === true) return;
    res.redirect(req.url, 301);
    return;
  }

  // Load query data (should be made available before the `request` event)
  req.queryData = qs.parse(req.urlData.query);
  
  // Emit  the `request` event
  this.emit('request', req, res);
  
  if (req.__stopRoute === true) return;

  if (url == '/' || this.regex.singleParam.test(url)) {

    req.__isMainRequest = true;

    controller = (url !== '/')
    ? (this.controller.getControllerByAlias(url) || this.controller)
    : this.controller;

    controller.processRoute.call(controller, urlData, req, res, this);

  } else {

    req.__isMainRequest = null;
    this.controller.exec.call(this.controller, urlData, req, res, this);

  }

  // If route has been handled, return
  if (req.__handled) return;

  // Static file requests

  if ( this.supports.static_server && this._isStaticFileRequest(req, res) ) {
    var filePath = (this.path + '/' + this.paths.public + url).trim();
    this._serveStaticFile(filePath, req, res);
  }

}

/**
  Requires an application`s module, relative to the application`s path
  
    app.require('node_modules/multi');
  
  @param {string} module
  @return {object} required module
 */

Application.prototype.require = function(module) {
  try {
    return require(this.path + "/node_modules/" + module);
  } catch (e) {
    module = module.replace(this.regex.relPath, '');
    return require(this.path + "/" + module);
  }
}

/**
  Loads middleware
  
    app.use('session', {
      guestSessions: true,
      salt: 'abc1234'
    });
  
  @param {string} middleware  Middleware to load
  @param {object} options  Options to pass to the middleware constructor
  @return {object} instance of the component`s function
 */

Application.prototype.use = function(middleware, options) {
  var Ctor, p, path = this.path + '/middleware/' + middleware;

  if ( fs.existsSync(path + '.js') ) {
    // Load application middleware: js file
    Ctor = require(path + '.js');
  } else if ( fs.existsSync(path + '/' + middleware + '.js') ) {
    // Load application middleware: middleware.js
    Ctor = require(path + '/' + middleware + '.js');
  } else if ( fs.existsSync(path + '.coffee') ) {
    // Load application middleware: cs file
    Ctor = require(path + '.coffee');
  } else if ( fs.existsSync(path + '/' + middleware + '.coffee') ) {
    // Load application middleware: middleware.coffee
    Ctor = require(path + '/' + middleware + '.coffee');
  } else if ( fs.existsSync(path) ) {
    // Load application middleware: directory
    Ctor = require(path);
  } else {
    path = protos.path + '/middleware/' + middleware;
    if ( fs.existsSync(path + '.js') ) {
      // Load protos middleware: js file
      Ctor = require(path + '.js');
    } else if ( fs.existsSync(path + '/' + middleware + '.js') ) {
      // Load protos middleware: middleware.js
      Ctor = require(path + '/' + middleware + '.js');
    } else if ( fs.existsSync(path + '.coffee') ) {
      // Load protos middleware: cs file
      Ctor = require(path + '.coffee');
    } else if ( fs.existsSync(path + '/' + middleware + '.coffee') ) {
      // Load protos middleware: middleware.coffee
      Ctor = require(path + '/' + middleware + '.coffee');
    } else if ( fs.existsSync(path) ) {
      // Load protos middleware: directory
      Ctor = require(path);
    } else {
      throw new Error(util.format("Middleware not found: '%s'", middleware));
    }
  }

  // Register middleware support
  this.supports[middleware] = true;

  // Show debug message on load
  this.debug("Middleware: %s", middleware);

  if (Ctor instanceof Function) {
    // Middlewares attach themselves into the app singleton
    try {
      return new Ctor(options || {}, middleware);
    } catch(e) {
      console.exit(e.stack || e);
    }
  }

}

/**
  Registers a view helper

  @private
  @param {string} alias View helper alias to use
  @param {function} func Function to use as helper
  @param {object} context Object to use as `this`
 */

Application.prototype.registerViewHelper = function(alias, func, context) {
  if (!context) context = null;
  this.views.partials['$' + alias] = function() {
    return func.apply(context, arguments);
  }
}

/**
  Returns the web application`s URL of a relative path
  
    app.url('hello-world');
    app.url('user/add');
  
  @param {string} path Path to build the URL from
  @param {string} secure If set to true, will return an https URL
  @return {string}
 */

Application.prototype.url = function(path, secure) {
  var regex = this.regex;
  var url = (secure ? this.baseUrlSecure : this.baseUrl) + '/' + (path || '')
    .replace(regex.startsWithSlashes, '')
    .replace(regex.multipleSlashes, '/');
  return url.replace(regex.endingSlash, '');
}

/**
  Returns an HTTP Secure URL
  
  @param {string} path
  @return {string}
 */
 
Application.prototype.secureUrl = function(path) {
  return this.url(path, true);
}

/**
  Redirects to the login location, specified in app.loginUrl
  
    app.login(res);
  
  @param {object} res
 */

Application.prototype.login = function(res) {
  res.redirect(this.loginUrl);
}

/**
  Redirects to the web application`s home url
  
    app.home(res);
  
  @param {object} res
 */
 
Application.prototype.home = function(res) {
  res.redirect('/');
}

/**
  Creates a directory within the application's path
  
  @param {string} path
 */
 
Application.prototype.mkdir = function(path) {
  path = this.fullPath(path);
  if (!fs.existsSync(path)) fs.mkdirSync(path);
}

/**
  Logging facility for the application with timestamp.

  Can be disabled by setting `app.logging` to false.
  
    app.log("Hello World");
  
  @param {string} context
  @param {string} msg
 */

Application.prototype.log = function() {
  
  var local = (this instanceof Application); // Whether or not we're running from app.log
  
  // Process log using default logFormat. Method can be overridden
  var data = app.logFormat.apply(this, [local, app, arguments]);
  
  if (!data) return; // Exit if no log data provided
  
  var msg = data[0]; // Formatted message
  var log = data[1]; // Formatted log string
  
  // If logger middleware disabled and logging enabled, just output to console
  if (!app.supports.logger && app.logging) console.log(log);
  
  if (!local && this.event && this.level) {
    
    // Running on logger middleware context. The event/level properties are set
    app.emit(this.event, log, data);

  } else {
    
    // Running out of context, either by app or global process (errors caught by uncaughtException)
    
    if (msg instanceof Error || typeof msg == 'object') {
      app.emit('error_log', log, data);
    } else {
      app.emit('info_log', log, data);
    }

  }
  
}

/**
  Log Formatting method

  @param {boolean} local
  @param {object} self
  @param {string} args*  
 */

Application.prototype.logFormat = function(local, self, args) {
  
  var level, msg;
  
  args = slice.call(args, 0);
  msg = args[0];

  switch (typeof msg) {
    case 'string':
      if (args.length > 0) msg = util.format.apply(null, args); // printf-like args
      break;
    case 'undefined': return;
  }

  if ( this.event && this.level && !(this instanceof Application) ) { // If run from logger middleware
    
    level = this.level;
    if (level == 'error' && typeof msg == 'string') msg = new Error(msg);

  } else { // Running normally or by process
    
    if (msg instanceof Error) {
      level = 'error';
      msg = msg.toString() + '\n' + (msg.stack || util.inspect(msg));
    } else if (typeof msg == 'object') {
      level = 'error';
      msg = new Error(util.inspect(msg));
    } else {
      level = 'info';
    }
    
  }
  
  var log = util.format('%s (%s) [%s] %s', self.hostname, self.date(), level, (msg.stack || msg));

  return [msg, log];
}

/**
  Prints debugging messages when on Debug Mode.

  Debug Mode can be enabled by setting `app.debugLog` to true.

    app.debug("Something just happened at %s!!!", Date());

  @param {string} msg
  @param {string} repls*
 */

Application.prototype.debug = function() {
  if (this.debugLog) {
    var msg = util.format.apply(this, arguments);
    msg = util.format('\u001b[%sm%s (%s) - %s\u001b[0m', this.debugColor, this.hostname, this.date(), msg);
    console.log(msg);
  }
}

/**
  Returns a cryptographic hash

  Notes:
  
  - Hashing Algorithms: 'md5', 'sha1', 'sha256', 'sha512', etc...
  - Input Encodings: 'utf8', 'ascii', 'binary'
  - Digest Encodings: 'hex', 'binary', 'base64'

  For a full list of hash algorithms, run `$ openssl list-message-digest-algorithms`

  The base64 digest of hashes is performed against the actual binary hash data, not the hex string.

  References:
  
  - http://nodejs.org/docs/v0.6.14/api/crypto.html#crypto_crypto_createhash_algorithm
  - http://nodejs.org/docs/v0.6.14/api/crypto.html#crypto_hash_update_data_input_encoding
  - http://nodejs.org/docs/v0.6.14/api/crypto.html#crypto_hash_digest_encoding

  Examples:

    var md5 = app.createHash('md5', "Hello World");
    var sha256 = app.createHash('sha256:hex', "Hello World");
    var sha512 = app.createHash('sha512:base64', "Hello World", 'utf8');

  @param {string} format  Hash format:  algorithm:[digest='hex']
  @param {string} str  String to calculate the hash against
  @param {encoding} Encoding to use. Defaults to node's default ('binary')
  @return {string} generated hash
 */

Application.prototype.createHash = function(format, str, encoding) {
  var algorithm, digest;
  format = format.split(':');
  algorithm = format[0];
  digest = format[1] || 'hex';
  return crypto.createHash(algorithm).update(str, encoding || 'binary').digest(digest);
}

/**
  Returns an md5 hash (hex)

    app.md5('Hello World');

  @param {string} str
  @param {string} encoding
  @return {string}
 */

Application.prototype.md5 = function(str, encoding) {
  return this.createHash('md5', str, encoding);
}

/**
  Returns a Universally Unique Identifier
  
  http://en.wikipedia.org/wiki/Universally_unique_identifier

  @return {string} Universally unique identifier
 */
 
Application.prototype.uuid = function() {
  return node_uuid();
}

/**
  Converts an object to an HTML-Escaped JSON string
  
  @param {object} ob Object to convert
  @return {string} Escaped JSON string
 */

var escapeRegex = /(\/)/g;

Application.prototype.escapeJson = function(ob) {
  var json = JSON.stringify(ob).replace(escapeRegex, '\\$1');
  return sanitizer.escape(json);
}

/**
  Returns a path relative to the application`s path

    var path = app.relPath('app/views/main/main-index.html');

  @param {string} path
  @param {string} offset Offset path to add to the original path
  @return {string} relative path without offset
 */

Application.prototype.relPath = function(path, offset) {
  var p = this.path + '/';
  if (offset != null) {
    p += offset.replace(this.regex.startOrEndSlash, '') + '/';
  }
  return path.replace(p, '');
}

/**
  Returns the absolute path for an application`s relative path
  
    var fullPath = app.fullPath('boot.js');
  
  @param {string} path
  @return {string}
 */

Application.prototype.fullPath = function(path) {
  path = path.replace(this.regex.startsWithSlash, '');
  return this.path + "/" + path;
}

/**
  Returns the current date without extra timezone information
  
  @private
  @return {string}
 */

var dateRepl = / [0-9]{4} /;

Application.prototype.date = function() {
  // Wed Feb 29 08:55:56
  return Date().slice(0, 24).replace(dateRepl, ' ');
}

/**
  Returns an HTTP/404 Response

    app.notFound(res);

  @param {object} res
 */

Application.prototype.notFound = function(res) {
  this.emit('transient_view', res.request, res);
  res.statusCode = 404;
  if (res.getViewPath('#404')) {
    res.render('#404', {}, app.config.transientRaw || app.config.rawViews);
  } else {
    res.sendHeaders({
      'Content-Type': 'text/plain;charset=' + this.config.encoding
    });
    res.end(this.httpStatusCodes[404]);
  }
}

/**
  Returns an HTTP/500 Response, using the template
  
    app.serverError(res, new Error('Something just happened'));
  
  @param {object} res
  @param {array} logData
 */

Application.prototype.serverError = function(res, err) {
  this.emit('transient_view', res.request, res);
  res.statusCode = 500;
  if (res.getViewPath('#500')) {
    res.render('#500', {}, app.config.transientRaw || app.config.rawViews);
  } else {
    res.sendHeaders({
      'Content-Type': 'text/plain;charset=' + this.config.encoding
    });
    res.end(this.httpStatusCodes[500]);
  }
  if (err) {
    err = new Error(err.stack || err); // This provides a more detailed stack trace
    this.emit('server_error', err);
    (this.errorLog || this.log).call(this, err);
  }
}

/**
  Performs a curl request for an application`s resource

  Provides [err, buffer]

    app.curl('-X PUT /hello', function(err, buffer) {
      console.log([err, buffer]);
    });

  @param {string} cmd
  @param {function} callback
 */

Application.prototype.curl = function(cmd, callback) {
  cmd = cmd.trim();
  var leftStr, requestUrl,
      self = this,
      wsIndex = cmd.lastIndexOf(' ');
  if (wsIndex >= 0) {
    leftStr = cmd.slice(0, wsIndex);
    requestUrl = cmd.slice(wsIndex).trim();
    cmd = (requestUrl.indexOf('http://') === 0)
    ? leftStr + ' ' + requestUrl
    : leftStr + ' ' + this.baseUrl + requestUrl;
  } else {
    if (cmd.indexOf('http://') == -1) cmd = this.baseUrl + cmd;
  }
  cmd = 'curl ' + cmd;
  cp.exec(cmd, function(err, stdout, stderr) {
    var buf = err ? stderr : stdout;
    callback.call(self, err, buf);
  });
}

/**
  Calls a function after application has initialized

    app.onInitialize(function() {
      console.log('App initialized...');
    });

  @param {function} callback
 */

Application.prototype.onInitialize = function(callback) {
  if (this.initialized) callback(this);
  else this.once('init', callback);
}

/**
  Calls a function after application is ready

    app.onReady(function() {
      console.log('App is ready...');
    });

  @param {function} callback
 */

Application.prototype.onReady = function(callback) {
  if (this.ready) callback(this);
  else this.once('ready', callback);
}

/**
  Gets a resource (driver or storage), using the config schema

  @private
  @param {string} driver
  @return {object} driver in app.drivers
 */

Application.prototype.getResource = function(schemeStr) {
  
  var db, section, source, generator, out,
      self = this,
      scheme = schemeStr.split('/');

  // If a resource is provided, return
  if (scheme.length == 1) {
    return this.getResource('resources/' + schemeStr);
  }

  // Get source & scheme
  source = scheme[0].trim();
  scheme = scheme[1].trim();
  
  // Process default scheme
  if (scheme == 'default' && scheme in this.config[source]) scheme = this.config[source].default;
  
  // Define resource generator
  switch (source) {
    case 'drivers':
      generator = getDriverInstance;
      break;
    case 'storages':
      generator = getStorageInstance;
      break;
  }
  
  if (scheme.indexOf(':') > 0) {
    scheme = scheme.split(':');
    db = scheme[0].trim();
    section = scheme[1].trim();
    out = this[source][db][section];
    if (out instanceof Array) {
      out = generator.apply(this, out);
      this[source][db][section] = out;
      this.debug("Loading resource: " + schemeStr);
    }
  } else {
    out = this[source][scheme];
    if (out instanceof Array) {
      out = generator.apply(this, out);
      this[source][scheme] = out;
      this.debug("Loading resource: " + schemeStr);
    }
  }
  
  if (out == null) {
    throw new Error(util.format("Unable to find resource: '%s'", schemeStr));
  } else {
    return out;
  }
}

/**
  Adds a filter. A filter is an event that is run and modifies the data passed
  to it. Usually an object is passed, so the modification happens in place.
  
    app.addFilter('counter', function(data) {
      data.counter++;
      return data
    });
    
  The filter callback **should** return the modified object, in order for the filter
  to have any effect on the passed data.

  @param {string} filter
  @param {function} callback
 */

Application.prototype.addFilter = function(filter, callback) {
  var arr = this.__filters[filter];
  if (arr instanceof Array) {
    arr.push(callback);
  } else {
    this.__filters[filter] = [callback];
  }
  return this; // Enable chaining
}

/**
  Helper method to add a context filter

  @param {string} context
  @param {function} callback with signature (buffer, locals)
 */

Application.prototype.filterContext = function(context, callback) {
  this.addFilter(context + '_context', callback);
}

/**
  Removes a filter callback
  
  If no callback specified, removes all filters
  
  @param {string} filter
  @param {function} callback (optional)
 */

Application.prototype.removeFilter = function(filter, callback) {
  var filters = this.__filters;
  if (filter in filters) {
    if (typeof callback == 'undefined') {
      delete filters[filter];
    } else if (callback instanceof Function) {
      filters[filter] = _.without(filters[filter], callback);
    }
  }
  return this;
}

/**
  Applies filters to specific data. Any functions added to the filter in question,
  can modify the filter input.
  
    var data = app.applyFilters('counter', {counter: 0});
    
  @param {string} filter
  @param {mixed} value
  @return {object} Modified object 
 */

Application.prototype.applyFilters = function() {
  var filters = this.__filters[arguments[0]];
  if (filters instanceof Array) {
    var temp = arguments[1];
    var args = slice.call(arguments, 2); // Remove filter & key arg
    for (var i=0; i < filters.length; i++) {
      // Performance note: need to use concat every time, since temp changes on each loop
      temp = filters[i].apply(this, [temp].concat(args));
    }
    return temp;
  } else {
    return arguments[1];
  }
}

/**
  Alias to the request module
  https://github.com/mikeal/request
 */

Application.prototype.request = protos.require('request');

/**
  Alias to the shortcode parser module
  http://github.com/derdesign/shortcode-parser
 */

Application.prototype.shortcode = protos.require('shortcode-parser');

/**
  Alias of the moment.js module
  http://momentjs.com
 */

Application.prototype.moment = protos.require('moment');

// Builds a partial view and caches its function

function buildPartialView(path) {

  var self = this;
  var layoutPrefix = /^layout_/;
  var p = pathModule.basename(path);
  var pos = p.indexOf('.');
  var ext = p.slice(pos+1);
  
  if (ext in this.enginesByExtension) {
        
    var engine = this.enginesByExtension[ext];
    var func = engine.renderPartial(path);

    var id = path
      .replace(this.mvcpath + 'views/', '')
      .replace('/partials/', '/')
      .replace(/\/+/g, '_')
      .replace(/[_\-]+/g, '_')
      .replace(/^_+/g, '');

    // Note: the layout_ prefix needs to be removed from the name because
    // the slash from the path has been replaced with an underscore.

    id = id.slice(0, id.indexOf('.')).toLowerCase().replace(layoutPrefix, '');

    // Normalize views to remove duplicate chunks within the filename
    // For example: dashboard/dashboard-test will be accessed as {{> dashboard_test}}
    // The added benefit of this method is that it will remove all duplicate subsequent
    // occurrences of the same chunk, regardless.
    id = id.split('_').reduce(function(prev, current) {
      if (prev[0] !== current) prev.unshift(current);
      return prev;
    }, []).reverse().join('_');
    
    func.id = id;

    this.views.partials[id] = func;
    
  } else {
    
    throw new Error(util.format("Unable to render %s: engine not loaded",  this.relPath(path)));
    
  }

}

// Returns a new driver instance

function getDriverInstance(driver, config) {
  if (!(driver in protos.drivers)) throw new Error(util.format("The '%s' driver is not loaded. Load it with app.loadDrivers('%s')", driver, driver));
  return new protos.drivers[driver](config || {});
}

// Returns a new storage instance

function getStorageInstance(storage, config) {
  if (!(storage in protos.storages)) throw new Error(util.format("The '%s' storage is not loaded. Load it with app.loadStorages('%s')", storage, storage));
  return new protos.storages[storage](config || {});
}

// Loads controllers & routes

function loadControllers() {
  
  // Note: runs on app context
  
  // Get controllers/
  var cpath = this.mvcpath + 'controllers/',
      files = protos.util.getFiles(cpath);

  // Create controllers and attach to app
  var controllerCtor = protos.lib.controller;
  for (var controller, key, file, instance, className, Ctor, i=0; i < files.length; i++) {
    file = files[i];
    key = file.replace(this.regex.jsFile, '');
    className = file.replace(this.regex.jsFile, '');
    Ctor = protos.require(cpath + className, true); // Don't use module cache (allow reloading)
    Ctor = createControllerFunction.call(this, Ctor);
    instance = new Ctor(this);
    instance.className = instance.constructor.name;
    this.controllers[key.replace(/_controller$/, '')] = instance;
  }

  this.controller = this.controllers.main;
  
  this.emit('controllers_loaded', this.controllers);

}

// Processes controller handlers

function processControllerHandlers() {
  var self = this;
  var jsFile = this.regex.jsFile;
  var handlersPath = this.mvcpath + 'handlers';
  var relPath = self.relPath(this.mvcpath) + 'handlers';
  
  if (fs.existsSync(handlersPath)) {
    
    fs.readdirSync(handlersPath).forEach(function(dirname) {
      var dir = handlersPath + '/' + dirname;
      var stat = fs.statSync(dir);
      
      if (stat.isDirectory(dir)) {
        
        var handlers = self.handlers[dirname] = {};
        
        fileModule.walkSync(dir, function(dirPath, dirs, files) {
          for (var path,hkey,callback,file,i=0; i < files.length; i++) {
            file = files[i];
            path = dirPath + '/' + file;
            hkey = self.relPath(path, pathModule.basename(self.mvcpath) + '/handlers/' + dirname);
            if (jsFile.test(file)) {
              callback = protos.require(path, true); // Don't use module cache (allow reloading)
              if (callback instanceof Function) {
                handlers[hkey] = callback;
              } else {
                throw new Error(util.format("Expected a function for handler: %s/%s", dirname, file));
              }
            }
          }
        });
        
      }
      
    });
    
  }
  
  this.emit('handlers_loaded', self.handlers); // Emit regardless
  
}

// Parses the application configuration

function parseConfig() {
  
  // Get main config
  var p = this.path + '/config/',
      files = protos.util.getFiles(p),
      mainPos = files.indexOf('base.js'),
      jsExt = protos.regex.jsFile,
      configFile = this.path + '/config.js';

  // If config.js is not present, use the one from skeleton to provide defaults.
  var config = (fs.existsSync(configFile)) ? require(configFile) : protos.require('skeleton/config.js');
      
  var baseConfig = (mainPos !== -1) ? require(this.path + '/config/base.js') : {};

  _.extend(config, baseConfig);
  
  // Extend with config files
  for (var file,key,cfg,i=0; i < files.length; i++) {
    if (i==mainPos) continue;
    file = files[i];
    key = file.replace(jsExt, '');
    cfg = require(this.path + '/config/' + file);
    if (typeof config[key] == 'object') _.extend(config[key], cfg);
    else config[key] = cfg;
  }
  
  // Return merged configuration object
  return config;

}

// Watches a view Partial for changes

function watchPartial(path, callback) {
  
  // Don't watch partials again when reloading
  
  if (this.watchPartials && RELOADING === false) {
    
    var self = this;
    self.debug('Watching Partial for changes: %s', self.relPath(path, 'app/views'));
    
    var watcher = chokidar.watch(path, {interval: self.config.watchInterval || 100});
    
    watcher.on('change', function() {
      self.debug("Regeneraging view partial", self.relPath(path));
      callback.call(self, path);
    });
    
    watcher.on('unlink', function() {
      self.log(util.format("Stopped watching partial '%s' (renamed)", self.relPath(path)));
      watcher.close();
    });
    
    watcher.on('error', function(err) {
      self.log(util.format("Stopped watching partial '%s' (error)", self.relPath(path)));
      self.log(err.stack);
      watcher.close();
    });

  }

}

// Parses database drivers from config

function parseDriverConfig() {
  var cfg, def, x, y, z,
      config = this.config.drivers,
      drivers = this.drivers;
  
  if (!config) config = this.config.drivers = {};
  
  if (Object.keys(config).length === 0) return;

  for (x in config) {
    cfg = config[x];
    if (x == 'default') { def = cfg; continue; }
    for (y in cfg) {
      if (typeof cfg[y] == 'object') {
        if (typeof drivers[x] == 'undefined') drivers[x] = {};
        drivers[x][y] = [x, cfg[y]];
      } else {
        drivers[x] = [x, cfg];
        break;
      }
    }
  }

}

// Parses storages from config

function parseStorageConfig() {
  var cfg, x, y, z,
      config = this.config.storages,
      storages = this.storages;
      
  if (!config) config = this.config.storages = {};

  if (Object.keys(config).length === 0) return;

  for (x in config) {
    cfg = config[x];
    for (y in cfg) {
      if (typeof cfg[y] == 'object') {
        if (typeof storages[x] == 'undefined') storages[x] = {};
        storages[x][y] = [x, cfg[y]];
      } else {
        storages[x] = [x, cfg];
        break;
      }
    }
  }
}

// Loads Data

function loadData() {
  var dir = app.fullPath(app.paths.data);
  var jsonExt = /\.json$/;
  var self = this;
  if (fs.existsSync(dir)) {
    protos.util.ls(dir, jsonExt).forEach(function(file) {
      var key = file.replace(jsonExt, '');
      var data = protos.require(dir + file, true); // Do not use cache when reading, ensures updated contents
      app.data(key, data);
    });
  }
}

// Loads Helpers

function loadHelpers() {

  var requireCb;
  var self = this;

  // Get instances from helpers/
  protos.util.requireAllTo(this.mvcpath + "helpers", this.helpers, function(Ctor) {
    // Pseudo-inheritance: Copy helper prototype methods into MainHelper`s prototype.
    // If util.inherits is used, it will replace any additions to the original prototype.
    if (Ctor.name == 'MainHelper') protos.extend(Ctor.prototype, protos.lib.helper.prototype);
    var instance = new Ctor(self);
    instance.className = instance.constructor.name;
    return instance;
  });

  for (var helper in this.helpers) {
    if (typeof this.helpers[helper] == 'undefined') {
      // Remove `undefined` helpers
      delete this.helpers[helper];
    } else {
      // Make helpers more accessible. E.g.: app.mainHelper => app.helpers.main
      this[inflect.camelize(helper+'-helper', true)] = this.helpers[helper];
    }
  }
  
  // Emit the 'helpers_loaded' event
  this.emit('helpers_loaded', this.helpers);

}

// Loads Models

function loadModels() {
  // Get models/
  var self = this,
      modelCtor = protos.lib.model,
      dbConfigAvailable = Object.keys(this.config.drivers).length > 0;

  protos.util.requireAllTo(this.mvcpath + "models", this.models, function(Ctor, file) {
    
    var name, model;
    
    if (Ctor instanceof Function) {
      
      // Protos model constructor
      if (dbConfigAvailable) {
        var origProto = Ctor.prototype;
        util.inherits(Ctor, modelCtor);
        protos.extend(Ctor.prototype, origProto);
        model = new Ctor(self);
        model.prepare(self);
        name = model.className[0].toLowerCase() + model.className.slice(1);
      } else {
        // No db config available, ignore
        return null;
      }
      
    } else {
      
      // Ctor is assumed to be an object
      model = Ctor;
      name = protos.inflect.camelize(file + '-model', true);

    }
    
    self[name] = model;
    
    self[name.replace(/Model$/, 'Driver')] = model.driver;
    
    return model;

  });
  
  this.emit('models_loaded', this.models);

}

// Load properties in lib/

function loadIncludeProperties() {
  var libPath = this.fullPath('/include');
  if (fs.existsSync(libPath) && fs.statSync(libPath).isDirectory()) {
    var files = protos.util.ls(libPath, this.regex.jsFile);
    files.forEach(function(file) {
      var key = inflect.camelize(file.replace(this.regex.jsFile, ''), true);
      var data = protos.require(libPath + "/" + file, true); // Don't use module cache (allow reloading)
      if (this[key] && typeof this[key] == 'object') {
         _.extend(this[key], data);
      } else {
        this[key] = data;
      }
    }, this);
  }
  this.emit('includes_loaded');
}

// Loads extensions
 
function loadExtensions() {
  var extsPath = this.fullPath(this.paths.extensions);
  if (fs.existsSync(extsPath) && fs.statSync(extsPath).isDirectory()) {
    var files = protos.util.ls(extsPath, this.regex.jsFile);
    files.forEach(function(file) {
      protos.require(extsPath + "/" + file, true); // Don't use module cache (allow reloading)
    }, this);
  }
  this.emit('exts_loaded');
}

// Loads the Application API

function loadAPI() {
  var apiPath = this.fullPath(this.paths.api);
  if (fs.existsSync(apiPath) && fs.statSync(apiPath).isDirectory()) {
    var files = protos.util.ls(apiPath, this.regex.jsFile);
    files.forEach(function(file) {
      var methods = protos.require(apiPath + "/" + file, true); // Don't use module cache (allow reloading)
      _.extend(this.api, methods);
    }, this);
  }
  this.emit('api_loaded', this.api);
}

// Loads application hooks

function loadHooks() {
  var events = this._events;
  var jsFile = /\.js$/i;
  var hooksPath = this.fullPath('hook');
  var loadedHooks = [];
  if (fs.existsSync(hooksPath)) {
    var files = protos.util.ls(hooksPath, jsFile);
    for (var cb,idx,evt,file,len=files.length,i=0; i < len; i++) {
      file = files[i];
      evt = file.replace(jsFile, '');
      loadedHooks.push(evt);
      cb = protos.require(hooksPath + '/' + file, true);
      if (cb instanceof Function) {
        if (RELOADING) {
          var origCb = this.hooks[evt];
          if (origCb instanceof Function) {
            // Hook was added previously
            if (events[evt] instanceof Array) {
              idx = events[evt].indexOf(origCb);
              if (idx >= 0) {
                // If old function is in events array, replace it
                events[evt][idx] = this.hooks[evt] = cb;
              } else {
                // Otherwise, append to events array (add a new event handler)
                events[evt].push(cb);
                this.hooks[evt] = cb;
              }
            } else if (events[evt] instanceof Function) {
              if (events[evt] === origCb) {
                // If evt has only one callback, replace it
                events[evt] = this.hooks[evt] = cb;
              } else {
                // Otherwise, create an array with the old and new events
                events[evt] = [origCb, cb];
              }
            } // No else clause is needed here, it's either Function or Array
          } else {
            // This is a new event handler
            this.hooks[evt] = cb;
            this.on(evt, cb);
          }
        } else {
          // Add the event handler normally
          this.hooks[evt] = cb;
          this.on(evt, cb);
        }
      }
    }
  }

  // Remove any inexisting hooks
  for (evt in this.hooks) {
    if (loadedHooks.indexOf(evt) === -1) {
      app.removeListener(evt, this.hooks[evt]);
      delete this.hooks[evt];
    }
  }

}

// Loads view engines

function loadEngines() {
  
  // Initialize engine properties
  this.enginesByExtension = {};
  
  // Engine local variables
  var exts = [];
  var loadedEngines = this.loadedEngines = Object.keys(protos.engines);
  
  if (loadedEngines.length > 0) {
    
    // Get view engines
    var engine, instance, engineProps = ['className', 'extensions'];
    for (engine in protos.engines) {
      instance = new protos.engines[engine]();
      instance.className = instance.constructor.name;
      protos.util.onlySetEnumerable(instance, engineProps);
      this.engines[engine] = instance;
    }

    // Register engine extensions
    for (var key in this.engines) {
      engine = this.engines[key];
      exts = exts.concat(engine.extensions);
      for (var i=0; i < engine.extensions.length; i++) {
        key = engine.extensions[i];
        this.enginesByExtension[key] = engine;
      }
    }
    
    // Set default view extension if not set
    if (typeof this.config.viewExtensions.html == 'undefined') {
      this.config.viewExtensions.html = 'ejs';
    }

    // Override engine extensions (from config)
    var ext, extOverrides = this.config.viewExtensions;
    
    for (ext in extOverrides) {
      if (exts.indexOf(ext) == -1) exts.push(ext); // Register extension on `exts`
      engine = this.engines[extOverrides[ext]]; // Get engine object
      if (engine) {
        engine.extensions.push(ext); // Add ext to engine extensions
        this.enginesByExtension[ext] = engine; // Override engine extension
      } else {
        this.debug(util.format("Ignoring '%s' extension: the '%s' engine is not loaded"), ext, extOverrides[ext]);
      }
    }

    // Set default template engine
    this.defaultEngine = (this.engines.ejs || this.engines[loadedEngines[0]]);

    // Add the engines regular expression
    this.engineRegex = new RegExp('^(' + Object.keys(this.engines).join('|').replace(/\-/, '\\-') + ')$');

  }
  
  // Generate template file regex from registered template extensions
  this.regex.templateFile = new RegExp('\\.(' + exts.join('|') + ')$');
  this.templateExtensions = exts;

  this.emit('engines_loaded', this.engines); // Emit regardless
  
}

// Configures static views

function setupStaticViews() {
  
  var self = this;
  
  var staticPath = this.mvcpath + 'views/' + this.paths.static;
  var staticConfig = app.config.staticViews;
  var staticViewExt = staticConfig && staticConfig.defaultExtension && ('.' + staticConfig.defaultExtension.replace(/^\./, ''));
  var setEncoding = staticConfig && staticConfig.setEncoding;
  
  // Note: supports hot code reloading out of the box, because the internal
  // static view state is reset each time this function is called.
  
  this.views.static = [];
  
  this.views.staticAssoc = {};
  this.views.staticRaw = {};
  this.views.staticMime = {};
  this.views.staticExtOverride = {};
  
  var staticExtRaw = /\[(.*)\]\.raw$/;
  var staticExt = /\[(.*)\]$/;
  var staticRaw = /\.raw$/;
  
  if (fs.existsSync(staticPath)) {
    
    fileModule.walkSync(staticPath, function(dirPath, dirs, files) {
      for (var path,file,i=0; i < files.length; i++) {
        file = files[i];
        path = (dirPath + '/' + file).replace(/\/+/g, '/');
        path = self.relPath(path, 'app/views/' + self.paths.static.slice(0, -1));
        if (self.regex.templateFile.test(path)) self.views.static.push(path);
      }
    });
    
    // Associate static paths with their respective templates
    // For reference, see [STATIC_VIEW_EXTENSIONS]
    for (var ext, file, url, matches, i=0; i < this.views.static.length; i++) {
      ext = null;
      file = this.views.static[i];
      url = '/' + file.replace(this.regex.templateFile, '');
      if (staticExtRaw.test(url)) {
        matches = url.match(staticExtRaw); ext = matches[1];
        url = url.replace(staticExtRaw, '');
        if (ext) { // Ext can be empty because of file[].hbs
          url += ('.' + ext); // Add extension override
          this.views.staticMime[url] = mime.lookup(ext); // Use changed url (also set custom mime due to override)
          this.views.staticExtOverride[url] = ext; // Set static extension override
          this.views.staticRaw[url] = true; // Set to raw because of both extension override and .raw extension suffix
        }
      } else if (staticExt.test(url)) {
        matches = url.match(staticExt); ext = matches[1];
        url = url.replace(staticExt, '');
        if (ext) { // Ext can be empty because of file[].hbs
          url += ('.' + ext); // Add extension override
          this.views.staticMime[url] = mime.lookup(ext); // Use changed url (also set custom mime due to override)
          this.views.staticExtOverride[url] = ext; // Set static extension override
          this.views.staticRaw[url] = true; // Set to raw because of extension override in filename
        }
      } else if (staticRaw.test(url)) { // View doesnt' have extension
        url = url.replace(staticRaw, '');
        if (staticViewExt) {
          url += staticViewExt; // View has no ext, staticViewExt applies
          this.views.staticMime[url] = mime.lookup(staticViewExt);
        }
        this.views.staticRaw[url] = true; // Set to raw because of filename
      } else if (staticViewExt) {
        // NOTE: View is not set to raw, it uses the default content type and raw settings in config
        url += staticViewExt; // View has no ext, staticViewExt applies
        this.views.staticMime[url] = mime.lookup(staticViewExt); // Use changed url
      }
      // If url is not modified at this stage, use default content type
      this.views.staticAssoc[url] = file;
    }
    
  }
  
  // Emit static views init event
  this.emit('static_views_loaded', this.views); // Emit regardless
  
}

// Configures Templates

function setupTemplates() {
  
  // Reset templates before proceeding
  // NOTE: This is needed for templates to be copatible with hot code loading
  this.templates = {};

  var self = this;
  var tplDir = app.mvcpath + app.paths.templates;
  var multiSlashes = this.regex.multipleSlashes;
  
  if (fs.existsSync(tplDir) && fs.statSync(tplDir).isDirectory()) {
    
    var files = protos.util.walkDir(tplDir, this.regex.templateFile);
  
    files.forEach(function(path) {
      buildTemplatePartial.call(this, path);
      watchPartial.call(this, path, buildTemplatePartial);
    }, this);
    
  }
  
  this.emit('templates_loaded', this.templates);
  
}

// Builds a template partial

function buildTemplatePartial(path) {
  
  var tplDir = app.mvcpath + app.paths.templates;
  var p = path.replace(tplDir, '');
  var pos = p.indexOf('.');
  var ext = p.slice(pos+1);
  var tpl = p.slice(0,pos);

  if (ext in this.enginesByExtension) {
    
    var engine = this.enginesByExtension[ext];
    var func = engine.renderPartial(path);
    
    func.engine = engine;
    func.ext = ext;
    
    this.templates[tpl] = func;
    
  } else {
    
    throw new Error(util.format("Unable to render %s: engine not loaded",  this.relPath(path)));
    
  }
  
}

// Configures View Partials

function setupViewPartials() {
  
  // Set view path association object
  this.views.pathAsoc = {};

  // Partial & template regexes
  var self = this;
  var exts = this.templateExtensions;
  var partialRegex = new RegExp('\/views\/(.+)\/partials\/[a-zA-Z0-9-_]+\\.(' + exts.join('|') + ')$');
  var templateRegex = new RegExp('\\.(' + exts.join('|') + ')$');
  var layoutPath = this.mvcpath + 'views/' + this.paths.layout;

  var viewsPath = this.mvcpath + 'views';
  
  var partialPaths = [];
  
  if (fs.existsSync(viewsPath)) {
    
    fileModule.walkSync(viewsPath, function(dirPath, dirs, files) {
      
      for (var path,file,i=0; i < files.length; i++) {

        file = files[i];
        path = dirPath + "/" + file;

        if (partialRegex.test(path)) {

          // Only build valid partial views
          partialPaths.push(path);
          buildPartialView.call(self, path);
          watchPartial.call(self, path, buildPartialView);

        } else if (templateRegex.test(file)) {

          // Build partial views for everything inside app.paths.layout

          if (path.indexOf(layoutPath) === 0) {
            partialPaths.push(path);
            buildPartialView.call(self, path);
            watchPartial.call(self, path, buildPartialView);
          }

          // Only add valid templates to view associations
          self.views.pathAsoc[self.relPath(path.replace(self.regex.templateFile, ''))] = path;

        }
      }
    });
    
  }
  
  // Add Builtin Partials
  
  var Helper = protos.lib.helper;
  var builtinHelper = new Helper();
  
  for (var m in builtinHelper) {
    if (builtinHelper[m] instanceof Function) {
      this.registerViewHelper(m, builtinHelper[m], builtinHelper);
    }
  }
  
  // Helper Partials
  
  Object.keys(this.helpers).forEach(function(alias) {
    var m, method, hkey, helper = self.helpers[alias];
    for (m in helper) {
      if (helper[m] instanceof Function) {
        method = helper[m];
        hkey = (alias == 'main')
          ? util.format('%s', m)
          : util.format('%s_%s', alias, m);
        self.registerViewHelper(hkey, method, helper);
      }
    }
  });
  
  // Event when view partials are loaded

  this.emit('view_partials_loaded', this.views.partials);
  
  // Set shortcode context
  // NOTE: Automatically resets on hot code loading, so it's good.
  
  var shortcodeContext = this.__shortcodeContext = {};
  
  // Only add shortcode filter to context if enabled on config
  
  if (this.config.shortcodeFilter) {
    
    // Register shortcodes from partials
  
    var shortcode = self.shortcode;
    var partials = self.views.partials;
  
    Object.keys(this.views.partials).forEach(function(partial) {
      if (partial[0] === '$') {
        shortcodeContext[partial.replace(/^\$/, '#')] = self.views.partials[partial];
      } else {
        shortcodeContext[partial] = function(buf, params, locals) {
          if (buf) params.content = buf; // Provide wrapped content in params.content
          params.__proto__ = locals; // Set locals as prototype of params
          return partials[partial].call(null, params); // Provide params to partial, which is passed as locals
        }
      }
    });

    this.addFilter('context', function(buf, locals) {
      buf = this.shortcode.parse(buf, locals, shortcodeContext);
      return buf;
    });
    
  }
  
  // Event when view shortcodes are loaded

  this.emit('view_shortcodes_loaded', shortcodeContext);

}

// Converts a regular function into a controller constructor

function createControllerFunction(func) {

  var Handlebars = protos.require('handlebars');
  var context, newFunc, compile, source,
      funcSrc = func.toString();
  var code = funcSrc
      .trim()
      .replace(/^function\s+(.*?)(\s+)?\{(\s+)?/, '')
      .replace(/(\s+)?\}$/, '');

  // Get source file path
  var alias = protos.lib.controller.prototype.getAlias(func.name),
      srcFile = this.mvcpath + 'controllers/' + alias + '.js';

  try {
    source = fs.readFileSync(srcFile, 'utf-8');
  } catch(e){
    source = fs.readFileSync(srcFile.replace(/\.js$/, '_controller.js'), 'utf-8');
  }

  // Detect pre & post function code
  var si = source.indexOf(funcSrc),
      preFuncSrc = source.slice(0, si).trim(),
      postFuncSrc = source.slice(si + funcSrc.length).trim();

  // Controller code

  var template = Handlebars.compile('\n\
with (locals) {\n\n\
function {{{name}}}(app) {\n\
  this.filters = this.filters["{{{name}}}"] || [];\n\
}\n\n\
require("util").inherits({{{name}}}, protos.lib.controller);\n\n\
protos.extend({{{name}}}, protos.lib.controller);\n\n\
{{{name}}}.filter = {{{name}}}.prototype.filter;\n\
{{{name}}}.handler = {{{name}}}.prototype.handler;\n\n\
var __funKeys__ = Object.keys({{{name}}});\n\
\n\
(function() { \n\
{{{preFuncSrc}}}\n\n\
with(this) {\n\n\
  {{{code}}}\n\
}\n\n\
{{{postFuncSrc}}}\n\n\
}).call({{{name}}});\n\n\
for (var key in {{{name}}}) {\n\
  if (__funKeys__.indexOf(key) === -1) { \n\
    {{{name}}}.prototype[key] = {{{name}}}[key];\n\
    delete {{{name}}}[key];\n\
  }\n\
}\n\
\n\
if (!{{{name}}}.prototype.authRequired) {\n\
  {{{name}}}.prototype.authRequired = protos.lib.controller.prototype.authRequired;\n\
} else {\n\
  {{{name}}}.prototype.authRequired = true; \n\
}\n\n\
return {{{name}}};\n\n\
}');

  var fnCode = template({
    name: func.name,
    code: code,
    preFuncSrc: preFuncSrc,
    postFuncSrc: postFuncSrc,
  });

  // console.exit(fnCode);

  /*jshint evil:true */
  compile = new Function('locals', fnCode);

  newFunc = compile({
    app: this,
    protos: protos,
    module: {},
    require: require,
    console: console,
    __dirname: this.mvcpath + 'controllers',
    __filename: srcFile,
    process: process
  });

  return newFunc;

}

module.exports = Application;
