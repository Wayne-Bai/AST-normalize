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

var async = require('async');
var BatchInsert = require('cassandra-orm/lib/orm/batch_insert').BatchInsert;
var uuidFromTimestamp = require('rackspace-shared-utils/lib/uuid').uuidFromTimestamp;
var zkUtil = require('zookeeper-client/lib/util');
var END_TOKEN = require('cassandra-orm/lib/orm/constants').END_TOKEN;

var getOne = require('./utils').getOne;
var getAll = require('./utils').getAll;
var settings = require('../../util/settings');
var errors = require('../../util/errors');
var misc = require('../../util/misc');
var ConfigurationValue = require('../models/configuration_value').ConfigurationValue;
var Event = require('../models/event').Event;
var accountOps = require('./account');

exports.getLockName = misc.getLockName.bind(null, 'configuration-value');

exports.getOne = function(ctx, configurationId, options, callback) {
  var key = ConfigurationValue.prefix() + configurationId;
  options.stripKeyPrefix = true;
  options.includeChildren = false;

  getOne(ConfigurationValue)(ctx, ctx.account.getKey(), key, options, callback);
};

exports.getForNamespace = function(ctx, namespace, options, callback) {
  var starting, ending;

  starting = ConfigurationValue.prefix() + namespace;
  ending = starting + END_TOKEN;

  options = options || {};
  options.usePaginationParams = true;
  options.includeChildren = false;

  getAll(ConfigurationValue)(ctx, ctx.account.getKey(), starting, ending, options, function(err, results, metadata) {
    if (err) {
      callback(err);
      return;
    }

    callback(null, results, metadata);
  });
};

exports.getAll = function(ctx, options, callback) {
  options = options || {};
  options.usePaginationParams = true;
  options.includeChildren = false;
  getAll(ConfigurationValue)(ctx, ctx.account.getKey(), ConfigurationValue.prefix(), null, options, function(err, results, metadata) {
    if (err) {
      callback(err);
      return;
    }

    callback(null, results, metadata);
  });
};

exports.update = function(ctx, id, params, callback) {
  var zkClient = zkUtil.getClient(settings.ZOOKEEPER_CLUSTER),
      lockName = exports.getLockName(ctx, id),
      newValue = params.value,
      newCv, eventPayload, eventParams, updatedEvent;

  async.waterfall([
    zkClient.acquireLock.bind(zkClient, ctx, lockName, ctx.txnId),

    function getOldValue(callback) {
      exports.getOne(ctx, id, {}, function(err, cv) {
        if (err && !(err instanceof errors.ObjectDoesNotExistError)) {
          callback(err);
          return;
        }

        callback(null, cv);
      });
    },

    function checkLimitIfCreate(cv, callback) {
      // Not an initial create, skip the check
      if (cv) {
        callback(null, cv);
        return;
      }

      accountOps.checkLimit(ctx, ConfigurationValue.meta.cname, function(err) {
        callback(err, cv);
      });
    },

    function(cv, callback) {
      var oldValue = null, bi;

      if (cv) {
        // Old value only exists if it's not an initial update.
        oldValue = cv.value;
      }

      if (newValue === oldValue) {
        callback(null, cv);
        return;
      }

      bi = new BatchInsert(ctx, ctx.account.getKey());
      if (!params.hasOwnProperty('_key')) {
        params._key = ConfigurationValue.prefix() + id;
      }
      newCv = new ConfigurationValue(params);
      eventPayload = {'old_value': oldValue,
                      'new_value': newValue,
                      'configuration_value_id': id};
      eventParams = {'timestamp': Date.now(),
                     'type': 'configuration_value.update',
                     'payload': eventPayload,
                     '_key': uuidFromTimestamp(Date.now()).toString()};
      updatedEvent = new Event(eventParams);

      bi.save(newCv);
      bi.save(updatedEvent);
      bi.commit(function(err) {
        callback(err, newCv);
      });
    }
  ],

  function(err, cv) {
    callback = zkUtil.wrapCallbackWithUnlock(ctx, zkClient, lockName, callback);
    callback(err, cv);
  });
};

exports.remove = function(ctx, id, params, callback) {
  var zkClient = new zkUtil.getClient(settings.ZOOKEEPER_CLUSTER),
      lockName = exports.getLockName(ctx, id),
      eventPayload, eventParams, removedEvent;

  async.waterfall([
    zkClient.acquireLock.bind(zkClient, ctx, lockName, ctx.txnId),
    exports.getOne.bind(null, ctx, id, {}),

    function(cv, callback) {
      var oldValue = cv.value, bi;

      bi = new BatchInsert(ctx, ctx.account.getKey());
      eventPayload = {'old_value': oldValue,
                      'configuration_value_id': id};
      eventParams = {'timestamp': Date.now(),
                     'type': 'configuration_value.remove',
                     'payload': eventPayload,
                     '_key': uuidFromTimestamp(Date.now()).toString()};
      removedEvent = new Event(eventParams);

      bi.removeObject(cv);
      bi.save(removedEvent);
      bi.commit(function(err) {
        callback(err, cv);
      });
    }
  ],

  function(err, cv) {
    callback = zkUtil.wrapCallbackWithUnlock(ctx, zkClient, lockName, callback);
    callback(err, cv);
  });
};
