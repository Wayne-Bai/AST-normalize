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

var base = require('cassandra-orm/lib/orm/base');
var sprintf = require('sprintf').sprintf;

/**
 * Object representing a ConfigurationValue.
 * @constructor
 * @param {Object} attributes Attributes to set in the resulting object.
 */
var ConfigurationValue = function(attributes) {
  base.DBBase.call(this, ConfigurationValue, attributes);
};

/**
 * Add properties that help map to cassandra
 * complex types
 */
ConfigurationValue.meta = {
  name: 'ConfigurationValue',
  cname: 'configuration_value',
  columnFamily: 'configuration_values',
  prefix: 'cv',
  dataPrefix: null,
  parents: []
};

ConfigurationValue.fields = {
  'value': null
};

ConfigurationValue.operationalVersion = 0;
base.inheritBase(ConfigurationValue, __filename);

ConfigurationValue.prototype.getKeyWithoutPrefix = function() {
  return this.getKey().replace(new RegExp('^' + ConfigurationValue.prefix()), '');
};

ConfigurationValue.prototype.getUrlPath = function() {
  return sprintf('/configuration/%s', this.getKeyWithoutPrefix());
};

exports.ConfigurationValue = ConfigurationValue;
