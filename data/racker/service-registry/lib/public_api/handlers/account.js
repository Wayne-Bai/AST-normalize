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

var log = require('logmagic').local('api.handlers.account');

var common = require('./common');

exports.limits = function(req, res) {
  var label, value, result = {'resource': {}, 'rate': {}}, rateLimits = req.body;

  log.debug('limits', {request: req});
  req.time('account.limits.http');

  result.resource = req.ctx.account.limits || {};

  rateLimits.forEach(function(limit) {
    var label = limit.path_regex, window = (limit.period / 3600).toFixed(1);
    result.rate[label] = {'limit': limit.limit, 'used': limit.used, 'window': window + ' hours'};
  });

  common.swizResponseCallback(req, res)(null, result);
};
