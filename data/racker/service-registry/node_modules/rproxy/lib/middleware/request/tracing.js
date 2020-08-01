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

var sprintf = require('sprintf').sprintf;
var misc = require('rackspace-shared-utils/lib/misc');
var KeystoneClient = require('keystone-client').KeystoneClient;
var tryfer = require('tryfer');
var trace = require('tryfer').trace;
var tracers = require('tryfer').tracers;
var nodeTracers = require('tryfer').node_tracers;

var config = require('../../util/config').config;
var settings = config.middleware.tracing || {};

var prefix = settings.service_name_prefix || '';
var ignoredHeaders = settings.ignored_headers || [];
var client = new KeystoneClient(settings.authentication.url, {'username': settings.authentication.username,
                                                              'apiKey': settings.authentication.apiKey});
var options = {'maxTraces': settings.max_traces, 'sendInterval': settings.send_interval};
tracers.pushTracer(new nodeTracers.RESTkinHTTPTracer(settings.restkin.url, client, options));

exports.dependencies = ['identity_provider'];


/**
 * Sanitize the headers before storing them in a trace.
 */
function sanitizeHeaders(headers) {
  var key;

  headers = misc.merge(headers, {});

  for (key in headers) {
    headers[key.toLowerCase()] = headers[key];
  }

  ignoredHeaders.forEach(function(key) {
    if (headers.hasOwnProperty(key)) {
      delete headers[key];
    }
  });

  return headers;
}

exports.processRequest = function(req, res, callback) {
  var headers = sanitizeHeaders(req.headers), serverRecvTrace;

  req.tracing = {'tryfer': tryfer, 'prefix': prefix};
  req.tracing.serverRecvTrace = trace.Trace.fromRequest(req, sprintf('%s:rproxy:general', prefix));

  callback();

  // Asynchronously record that we have received a client request
  serverRecvTrace = req.tracing.serverRecvTrace;

  serverRecvTrace.record(trace.Annotation.serverRecv());
  serverRecvTrace.record(trace.Annotation.string('http.uri', req.url));
  serverRecvTrace.record(trace.Annotation.string('http.request.headers',
                         JSON.stringify(headers)));
  serverRecvTrace.record(trace.Annotation.string('http.request.remote_address',
                         req.socket.remoteAddress));
  serverRecvTrace.record(trace.Annotation.string('rax.tenant_id', req.userId));
};
