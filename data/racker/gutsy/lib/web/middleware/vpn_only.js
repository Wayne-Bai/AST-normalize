/*
 *  Copyright 2011 Rackspace
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

var basic_auth = require('./basic_auth');

module.exports = function(req, res, next) {
  var remote_ip = req.socket.remoteAddress;
  if (remote_ip.slice(0, 3) === '10.') {
    return next();
  }
  else if (remote_ip.slice(0,4) === '127.') {
    return next();
  }

  basic_auth(req, res, next);
};
