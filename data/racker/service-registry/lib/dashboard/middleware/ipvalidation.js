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

var Cidr = require('swiz').Cidr;
var net = require('net');
var log = require('logmagic').local('ipvalidation');

var settings = require('../../util/settings');

var acceptCidrs = settings.DASHBOARD_IP_WHITELIST.map(function(cidr) {
  return new Cidr(cidr);
});

exports.isAccepted = function(ip) {
  var i = 0;
  for (i = 0; i < acceptCidrs.length; i++) {
    if (acceptCidrs[i].isInCIDR(ip)) {
      return true;
    }
  }
  return false;
};

exports.getIp = function(req) {
  var fwdStr = req.headers['x-forwarded-for'],
      ipAddr;
  if (fwdStr) {
    ipAddr = fwdStr.split(',')[0];
  } else {
    ipAddr = req.connection.remoteAddress;
  }
  return ipAddr;
};

exports.attachIPValidationMiddleware = function attachIPValidationMiddleware() {
  return function validateIP(req, res, next) {
    var ip = exports.getIp(req);
    if (!exports.isAccepted(ip)) {
      // 403 forbidden
      log.error('IP Exception for ' + ip);
      res.render('status.jade', {
        code:403,
        message: '403 Forbidden (bad IP)',
        title: '403 Forbidden'
      });
    } else {
      next();
    }
  };
};
