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

var fs = require('fs');
var os = require('os');

var log = require('logmagic').local('lib.util.config');
var misc = require('rackspace-shared-utils/lib/misc');


var txnPrefix = '.rh-' + misc.randstr(4) + '.h-' + os.hostname();
var txnCount = 0;


function generateTxnId(version) {
  var t = new Date().getTime(),
      i = txnCount;

  txnCount += 1;
  return txnPrefix + '.r-' + misc.randstr(8) + '.c-' + i + '.ts-' + t.toString() + '.v-' + version;
}


var DEFAULTS = {
  'server': {
    'version': 'UNSET'
  }
};

exports.config = {};


exports.loadConfig = function loadConfig(configPath) {
  var content = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  exports.config = misc.merge(DEFAULTS, content);
  return exports.config;
};

exports.generateTxnId = generateTxnId;
