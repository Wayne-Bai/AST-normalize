/**
 *  Copyright 2013 Rackspace
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

var path = require('path');
var http = require('http');
var util = require('util');

var async = require('async');
var express = require('express');

var middlewareTracing = require('./middleware/tracing');
var middlewareAccessLogger = require('rackspace-shared-middleware/lib/middleware/access_logger');
var middlewareTransactionId = require('./middleware/transaction_id');
var middlewareBodySizeLimiter = require('rackspace-shared-middleware/lib/middleware/body_size_limiter');
var middlewareBodyParser = require('rackspace-shared-middleware/lib/middleware/body_parser');
var errHandlerFunc = require('../api/utils').errHandlerFunc;
var unknownErrHandlerFunc = require('../api/utils').unknownErrHandlerFunc;
var defs = require('./defs').defs;

var initialize = require('../init').initialize;
var APIServer = require('../api/server').APIServer;
var urls = require('./urls');
var settings = require('../util/settings');
var misc = require('../util/misc');

var SUPPORTED_CONTENT_TYPES = ['application/json'];

function PublicAPIServer(options) {
  APIServer.call(this, 'public', options);
}

util.inherits(PublicAPIServer, APIServer);

/**
 * Initialize the express app - add middleware and url handlers.
 */
PublicAPIServer.prototype._initializeApp = function(callback) {
  var staticRoot = path.join(__dirname, '../../static');

  express.logger.format('rackspace', settings.EXPRESS_LOG_FORMAT);

  if (settings.TRACING_ENABLED) {
    this._app.use(middlewareTracing.attach());
  }

  this._app.use(middlewareTransactionId.attach({'loggerName': 'api.middleware.transaction_id', 'version': '0.1'}));
  this._app.use(middlewareAccessLogger.attach({'loggerName': 'api.middleware.access_log', 'logOnIncoming': true}));
  this._app.use(middlewareBodySizeLimiter.attach({'loggerName': 'api.middleware.body_size_limiter',
                                                  'maxSize': settings.MAX_REQUEST_BODY_SIZE}));
  this._app.use(middlewareBodyParser.attach(defs, errHandlerFunc,
                                               {'loggerName': 'api.middleware.body_parser',
                                               'supportedContentTypes': SUPPORTED_CONTENT_TYPES}));

  this._app.get('/', function(req, res) {
    var userAgent = (req.headers['user-agent'] || '').toLowerCase(),
        file = 'index.html';

    res.setHeader('Cache-Control', 'max-age=259200');
    res.sendfile(path.join(staticRoot, file));
  });

  this._app.get('/favicon.png', function(req, res) {
    res.setHeader('Cache-Control', 'max-age=259200');
    res.sendfile('./static/images/favicon.png');
  });

  this._app.use('/static', express.static(staticRoot));
  this._app.use('/v1.0', urls.api_1_0_urls());
  this._app.use('/_dashboard', urls._dashboard());

  this._app.use(this._notFoundHandler.bind(this));
  this._app.use(unknownErrHandlerFunc);

  callback();
};

PublicAPIServer.prototype.run = function(callback) {
  var self = this;

  async.waterfall([
    initialize,
    PublicAPIServer.super_.prototype._initialize.bind(self),
    self._initializeApp.bind(self),
    self._listen.bind(self, self._options.host, self._options.port)
  ], callback);
};

exports.PublicAPIServer = PublicAPIServer;
