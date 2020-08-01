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

var instruments = require('../../util/instruments');
var httpUtil = require('../../util/http');
var config = require('../../util/config').config;

exports.dependencies = [];

if (config.target.middleware_run_list.response.indexOf('tracing') !== -1) {
  exports.dependencies.push('tracing');
}

exports.registerAdminEndpoints = function(app) {
  app.get('/stats', function(req, res) {
    var data = instruments.getEventMetrics();
    httpUtil.returnJson(res, 200, data);
  });
};

exports.processResponse = function(req, res, callback) {
  instruments.recordEvent('backend_response_' + res.statusCode);
  callback();
};
