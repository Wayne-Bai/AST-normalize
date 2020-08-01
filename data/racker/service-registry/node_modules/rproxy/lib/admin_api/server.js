/**
 *  Copyright 2012 Tomaz Muraus
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */


var express = require('express');
var async = require('async');
var log = require('logmagic').local('lib.admin_api.server');

var authenticationMiddleware = require('./middleware/authentication');


function AdminAPIServer(proxyServer, options) {
  this._proxyServer = proxyServer;
  this._options = options;
  this._server = express.createServer();
}


AdminAPIServer.prototype.run = function(callback) {
  var host = this._options.admin_api.host, port = this._options.admin_api.port;
  async.waterfall([
    this._initializeUrls.bind(this),
    this._listen.bind(this, host, port)
  ],

  function(err) {
    if (err) {
      log.errorf('Failed to start the admin api server: ${err}', {'err': err});
    }
    else {
      log.infof('Admin API listening on ${host}:${port}', {'host': host, 'port': port});
    }

    callback(err);
  });
};


AdminAPIServer.prototype._initializeUrls = function(callback) {
  var app, requestMiddleware = this._proxyServer._middleware.request,
           responseMiddleware = this._proxyServer._middleware.response;

  app = express.createServer();
  app.use(authenticationMiddleware.attach(this._options.admin_api.key));

  this._registerMiddlewareEndpoints('request', app);
  this._registerMiddlewareEndpoints('response', app);

  this._server.use('/v1.0', app);
  callback();
};


AdminAPIServer.prototype._registerMiddlewareEndpoints = function(type, app) {
  var modules = this._proxyServer._middleware[type], module, registerAdminEndpointsFunc, key;

  for (key in modules) {
    if (modules.hasOwnProperty(key)) {
      module = modules[key];
      registerAdminEndpointsFunc = module.registerAdminEndpoints;

      if (registerAdminEndpointsFunc) {
        log.debugf('Registering admin api handlers for middleware ${middleware}', {'middleware': key});
        registerAdminEndpointsFunc(app);
      }
    }
  }
};


AdminAPIServer.prototype._listen = function(host, port, callback) {
  this._server.listen(port, host, callback || function() {});
};


exports.AdminAPIServer = AdminAPIServer;
