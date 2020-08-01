'use strict';

var path            = require('path');
var Promise               = require('bluebird');
var ViewHelper      = require('./helper');
var events          = require('events');
// var logger          = require('winston');
var jobQueue        = require('../job-queue');
var inherits        = require('inherits');
var allowUnsafeEval = require('loophole').allowUnsafeEval;
var util            = require('../util').instance;
var fs              = require('fs-extra');
var _               = require('lodash');
var swig            = require('swig');
var up              = require('underscore-plus');

var bodyParser      = allowUnsafeEval(function() {
  return require('body-parser');
});

function UIServer(client) {
  this.client = client;
}

inherits(UIServer, events.EventEmitter);

UIServer.prototype.httpServer = null;

UIServer.prototype.start = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    if (self.client.serverPort) {
      self.port = self.client.serverPort;
      self.startServer(self.port);
      return resolve(self.port);
    } else {
      self.getPort(resolve, reject);  
    }
  });
};

UIServer.prototype.stop = function() {
  // logger.debug('stopping server running on: '+this.port);
  if (this.httpServer !== null) {
    return this.httpServer.close();
  }
};

UIServer.prototype.destroy = function() {
  if (this.httpServer !== null) {
    return this.httpServer.close();
  }
};

UIServer.prototype.getPort = function(resolve, reject) {
  var self = this;
  var portfinder = require('portfinder');
  portfinder.getPort(function (err, port) {
    if (err) {
      reject(err);
    } else {
      self.port = port;
      self.startServer(port);
      resolve(port);
    }
  });
};

UIServer.prototype.enableCors = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', ['Content-Type', 'X-Requested-With', 'mm_plugin_client']);
  return next();
};

UIServer.prototype.statusRequest = function(req, res) {
  var jobId;
  var jobQueue = req.app.get('jobQueue');
  jobId = req.query.id;
  if (jobQueue.isJobComplete(jobId)) {
    res.send(jobQueue.getResultForId(jobId));
  } else {
    return res.send({
      'status': 'pending',
      'id': jobId
    });
  }
};

UIServer.prototype.executeSyncPostHandler = function(req, res) {
  var client = req.app.get('client');
  client.executeCommand(req.body.command, req.body, function(err, response) {
    if (err) {
      // logger.debug('sync post request finished with error');
      // logger.debug(err.message);
      return res.send(err);
    } else {
      // logger.debug('sync post request finished successfully');
      // logger.debug(response);
      return res.send(response);
    }
  });
};

UIServer.prototype.executeSyncGetHandler = function(req, res) {
  var jobQueue = req.app.get('jobQueue');
  var client = req.app.get('client');
  var jobId = jobQueue.addJob();

  // logger.debug('received request to handle sync get request: ');
  // logger.debug(req.query);

  client.executeCommand(req.query.command, req.query, function(err, result) {
    if (err) {
      // logger.debug('sync request finished with error');
      // logger.debug(err.message);
      jobQueue.finish(jobId, err, null);  
      res.send(jobQueue.getResultForId(jobId));
    } else {
      // logger.debug('sync request finished successfully');
      // logger.debug(result);
      jobQueue.finish(jobId, null, result);  
      res.send(jobQueue.getResultForId(jobId));
    }
  });
};

UIServer.prototype.executeAsyncPostHandler = function(req, res) {
  var jobQueue = req.app.get('jobQueue');
  var client = req.app.get('client');
  var jobId = jobQueue.addJob();

  // logger.debug('received request to handle async post request: ');
  // logger.debug(req.body);

  client.executeCommand(req.body.command, req.body, function(err, res) {
    if (err) {
      // logger.debug('async request finished with error');
      // logger.debug(err.message);
      jobQueue.finish(jobId, err, null);  
    } else {
      // logger.debug('async request finished successfully');
      // logger.debug(res);
      jobQueue.finish(jobId, null, res);  
    }
  });
  return res.send({
    'status': 'pending',
    'id': jobId
  });
};

UIServer.prototype.executeAsyncGetHandler = function(req, res) {
  var jobQueue = req.app.get('jobQueue');
  var client = req.app.get('client');
  var jobId = jobQueue.addJob();

  // logger.debug('received request to handle async get request: ');
  // logger.debug(req.body);

  client.executeCommand(req.query.command, req.query, function(err, res) {
    if (err) {
      // logger.debug('async request finished with error');
      // logger.debug(err.message);
      jobQueue.finish(jobId, err, null);  
    } else {
      // logger.debug('async request finished successfully');
      // logger.debug(res);
      jobQueue.finish(jobId, null, res);  
    }
  });
  return res.send({
    'status': 'pending',
    'id': jobId
  });
};

/**
 * Renders UI for requested command, e.g. localhost:8000/app/new-project
 */
UIServer.prototype.appRequestHandler = function(req, res) {
  // logger.debug('appRequestHandler');
  var controller = req.params.controller;
  var action = req.params.action || 'new';
  action = up.camelize(action);
  
  // we have to set the swig loader path on each request because it seems to be intermittently not persisting
  var swig = req.app.get('swig');
  swig.setDefaults({ runInVm: true, loader: swig.loaders.fs(path.dirname(__dirname)) });
  
  var Controller = req.app.get('controllers.'+controller);
  new Controller(req)[action](req, res);
};

/**
 * Enables support for preflight requests, when needed
 */
UIServer.prototype.options = function(req, res) {
  return res.send(200);
};

UIServer.prototype.startServer = function(port) {
  var app, express;
  express = allowUnsafeEval(function() {
    return require('express');
  });
  app = express();
  app.use(bodyParser.json());
  app.use(this.enableCors);

  var viewHelper = new ViewHelper({
    client: this.client,
    port: port
  });

  swig.setDefaults({
    runInVm: true,
    locals: {
      mavensmate : {
        ui : viewHelper
      }
    },
    loader: swig.loaders.fs(path.dirname(__dirname))
  });

  app.engine('html', swig.renderFile);
  app.set('swig', swig);
  app.set('view engine', 'html');
  app.set('views', path.join(__dirname,'templates'));
  app.set('view cache', false);

  app.set('helper', viewHelper); // TODO: do we need this?

  /**
   * Setup path for static resources
   */
  app.use('/app/static', express.static(path.join(util.getAppRoot(), 'lib', 'mavensmate', 'ui', 'resources')));
  
  app.set('jobQueue', jobQueue);
  app.set('client', this.client);

  /** 
   * Load controllers
   */
  var controllersPath = path.join(__dirname, 'controllers');
  var controllers = {};
  fs.readdirSync(controllersPath).forEach(function(filename) {
    var baseFilename = filename.split('.')[0];
    var filepath = path.join(controllersPath,filename);
    controllers[baseFilename] = require(filepath);
  }); 
  _.forOwn(controllers, function(controller, baseFilename) {
    app.set('controllers.'+baseFilename, controller);
  });

  /**
   * Renders UI
   */
  app.get('/app/:controller/:action', this.appRequestHandler);
  app.post('/app/:controller/:action', this.appRequestHandler);
    
  /**
   * These endpoints allow a command execution to happen remotely by passing a "command" parameter
   * example: POST /execute { "command": "new-project", "username": "foo@foo.com" ... etc. }
   *
   * Asynchronous endpoints submit a request for a long running process, which will return a job id
   * The client should then poll the /status endpoint with the job id (/status?id=<job_id>)
   */
  
  /**
   * Synchronous command endpoints
   */
  app.options('/execute', this.options);
  app.get('/execute', this.executeSyncGetHandler);
  app.post('/execute', this.executeSyncPostHandler);

  /**
   * Async command endpoints
   */
  app.get('/status', this.statusRequest);

  app.options('/execute/async', this.options);
  app.get('/execute/async', this.executeAsyncGetHandler);
  app.post('/execute/async', this.executeAsyncPostHandler);
  
  /**
   * Start the server on the provided port
   */
  this.httpServer = require('http').createServer(app);
  this.httpServer.listen(port);
};

module.exports = UIServer;