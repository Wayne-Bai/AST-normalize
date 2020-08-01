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

/**
 * Object representing a Account.
 * @constructor
 * @param {Object} attributes Attributes to set in the resulting object.
 */
var Account = function(attributes) {
  base.DBBase.call(this, Account, attributes);
};

/**
 * Add properties that help map to cassandra
 * complex types
 */
Account.meta = {
  name: 'Account',
  cname: 'account',
  columnFamily: 'accounts',
  prefix: 'ac',
  dataPrefix: null,
  parents: []
};

/**
 * Fields on the Account
 */
Account.fields = {
  'metadata': {'default_value': {}},
  'status': {'default_value': 'active'},

  // account object limits
  'limits': {'default_value': { 'service': 200, 'configuration_value': 1000 }}
};

Account.operationalVersion = 4;
base.inheritBase(Account, __filename);

exports.Account = Account;
