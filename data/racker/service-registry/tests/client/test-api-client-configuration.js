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

var common = require('../common');
var initialize = require('../../lib/init').initialize;
var accountOps = require('../../lib/db/ops/account');
var Account = require('../../lib/db/models/account').Account;
var client = common.getClient('joe2');

exports.setUp = common.setUp;
exports.tearDown = common.tearDown;

exports['test_configuration_simple_keys_crud'] = function(test, assert) {
  async.waterfall([
    function testListEmpty(callback) {
      client.configuration.list(null, function(err, data, nextMarker) {
        assert.ifError(err);
        assert.equal(data.length, 0);
        callback();
      });
    },

    function testGetMalformedUri(callback) {
      client.configuration.get('inexistent-value%80', function(err, data) {
        assert.ok(err);
        assert.equal(err.statusCode, 400);
        assert.match(err.response.body.message, /URI malformed/);
        callback();
      });
    },

    function testGetDoesntExist(callback) {
      client.configuration.get('inexistent-value', function(err, data) {
        assert.ok(err);
        assert.equal(err.statusCode, 404);
        callback();
      });
    },

    function testGetInvalidIdProvided1(callback) {
      client.configuration.get('ab', function(err, data) {
        assert.ok(err);
        assert.match(err.response.body.message, /Invalid value for 'configurationId' query string parameter/);
        assert.equal(err.statusCode, 400);
        callback();
      });
    },

    function testSetInvalidIdProvided1(callback) {
      client.configuration.set(new Array(200).join('a'), 'value', function(err, data) {
        assert.ok(err);
        assert.match(err.response.body.message, /Invalid value for 'configurationId' query string parameter/);
        assert.equal(err.statusCode, 400);
        callback();
      });
    },

    function testRemoveInvalidIdProvided1(callback) {
      client.configuration.remove(new Array(200).join('a'), function(err, data) {
        assert.ok(err);
        assert.match(err.response.body.message, /Invalid value for 'configurationId' query string parameter/);
        assert.equal(err.statusCode, 400);
        callback();
      });
    },

    function testSetIdWithDot(callback) {
      client.configuration.set('test.value.two', 'value', function(err, data) {
        assert.ifError(err);
        callback();
      });
    },

    function testInitialUpdateKey1(callback) {
      client.configuration.set('my-value-1', 'test value 123456', function(err) {
        assert.ifError(err);
        callback();
      });
    },

    function testInitialUpdateCreatesEvent(callback) {
      var updatedEvent;
      client.events.list(null, {}, function(err, data, nextMarker) {
        assert.ifError(err);
        assert.equal(data.length, 2);
        updatedEvent = data.pop();
        assert.equal(updatedEvent.payload.old_value, null);
        assert.equal(updatedEvent.payload.new_value, 'test value 123456');
        assert.equal(updatedEvent.payload.configuration_value_id, 'my-value-1');
        assert.equal(updatedEvent.type, 'configuration_value.update');
        callback();
      });
    },

    function testInitialUpdateKey2(callback) {
      client.configuration.set('my-value-2', 'test value 54321', function(err) {
        assert.ifError(err);
        callback();
      });
    },

    function testGet(callback) {
      client.configuration.get('my-value-1', function(err, value) {
        assert.ifError(err);
        assert.equal(value, 'test value 123456');
        callback();
      });
    },

    function testGetPartialKeyMatchDoesntExist(callback) {
      client.configuration.get('my-va', function(err, value) {
        assert.ok(err);
        assert.equal(err.statusCode, 404);
        callback();
      });
    },

    function testUpdate(callback) {
      client.configuration.set('my-value-1', 'ponies 123456', function(err) {
        assert.ifError(err);
        callback();
      });
    },

    function testUpdateCreatesEvent(callback) {
      var updatedEvent;
      client.events.list(null, {}, function(err, data, nextMarker) {
        assert.ifError(err);
        assert.equal(data.length, 4);
        updatedEvent = data.pop();
        assert.equal(updatedEvent.payload.old_value, 'test value 123456');
        assert.equal(updatedEvent.payload.new_value, 'ponies 123456');
        assert.equal(updatedEvent.payload.configuration_value_id, 'my-value-1');
        assert.equal(updatedEvent.type, 'configuration_value.update');
        callback(null, updatedEvent.id);
      });
    },

    function testListWithMarker(lastId, callback) {
      client.configuration.list({'marker': 'my-value-2'}, function(err, data, nextMarker) {
        assert.ifError(err);
        assert.equal(data.length, 2);
        callback();
      });
    },

    function testListWithoutLimit(callback) {
      client.configuration.list({}, function(err, data, nextMarker) {
        assert.ifError(err);
        assert.equal(data.length, 3);
        callback();
      });
    },

    function testListWithLimit(callback) {
      client.configuration.list({'limit': 1}, function(err, data, nextMarker) {
        assert.ifError(err);
        assert.equal(data.length, 1);
        callback();
      });
    },

    function testGet(callback) {
      client.configuration.get('my-value-1', function(err, value) {
        assert.ifError(err);
        assert.equal(value, 'ponies 123456');
        callback();
      });
    },

    function testRemove(callback) {
      client.configuration.remove('my-value-1', function(err) {
        assert.ifError(err);
        callback();
      });
    },

    function testRemoveCreatesEvent(callback) {
      var removedEvent;
      client.events.list(null, {}, function(err, data, nextMarker) {
        assert.ifError(err);
        assert.equal(data.length, 5);
        removedEvent = data.pop();
        assert.equal(removedEvent.payload.old_value, 'ponies 123456');
        assert.equal(removedEvent.payload.configuration_value_id, 'my-value-1');
        assert.equal(removedEvent.type, 'configuration_value.remove');
        callback();
      });
    },

    function testGetDoesntExist(callback) {
      client.configuration.get('my-value-1', function(err, data) {
        assert.ok(err);
        assert.equal(err.statusCode, 404);
        callback();
      });
    },

    function testErrPrefixIsStrippedFromObjectKey(callback) {
      client.configuration.get('nonExistentConfig', function(err, data) {
        assert.equal(err.response.body.details,
                     'Object "ConfigurationValue" with key "nonExistentConfig" does not exist');
        callback();
      });
    },

    function testPrefixWithinIdDoesNotGetRemovedInLocationHeader(callback) {
      client.configuration._options.raw = true;
      client.configuration.set('cvfoobarcvfoo', 'someValue', function(err, data) {
        assert.equal(data.headers.location.split('/')[6], 'cvfoobarcvfoo');
        client.configuration._options.raw = false;
        callback();
      });
    }
  ],

  function(err) {
    assert.ifError(err);
    test.finish();
  });
};

exports['test_configuration_namespaces_keys_crud'] = function(test, assert) {
  var validKeys, invalidKeys, valuePrefix;

  validKeys = [
    '/production/cassandra',
    '/production/cassandra/listen_port',
    '/production/cassandra/listen_ip',
    '/production/zookeeper/listen_ip',
    '/production/zookeeper/listen_port',
    '/production/zookeeper/settings/max_clients',
    '/production/zookeeper/settings/max_threads',
    '/production/agent_endpoint/fb303.port',
    '/production/max_instances',
    '/production/test_key_1',
    'no-namespace'
  ];

  invalidKeys = [
    '/production.foo/test', // Invalid namespace
    '/production/test.x/', // Invalid namespace
    '/',
    '/'
  ];

  // TODO: What to do is both /production namespace and /production key exists.

  valuePrefix = 'test value . ';

  async.waterfall([
    function testSetSuccess(callback) {
      async.forEach(validKeys, function(key, callback) {
        var value = valuePrefix + key;

        client.configuration.set(key, value, function(err) {
          assert.ifError(err);
          callback();
        });
      }, callback);
    },

    function testListAllValuesSuccess(callback) {
      client.configuration.list(null, function(err, data) {
        assert.ifError(err);
        assert.equal(data.length, validKeys.length);
        callback();
      });
    },

    function testListForNamespace1Success(callback) {
      var namespace = '/production/cassandra';

      client.configuration.listForNamespace(namespace, null, function(err, data) {
        assert.ifError(err);
        assert.equal(data.length, 3);

        data.forEach(function(cv) {
          assert.ok(cv.id.indexOf(namespace) === 0);
        });

        callback();
      });
    },

    function testListForNamespace2Success(callback) {
      var namespace = '/production/agent_endpoint';

      client.configuration.listForNamespace(namespace, null, function(err, data) {
        assert.ifError(err);
        assert.equal(data.length, 1);

        data.forEach(function(cv) {
          assert.ok(cv.id.indexOf(namespace) === 0);
        });

        callback();
      });
    },

    function testListForNamespace3Success(callback) {
      var namespace = '/production';

      // Should return all the values under /production namespace, including
      // other sub namespaces

      client.configuration.listForNamespace(namespace, null, function(err, data) {
        assert.ifError(err);
        assert.equal(data.length, 3 + 2 + 2 + 1 + 2);

        data.forEach(function(cv) {
          assert.ok(cv.id.indexOf(namespace) === 0);
        });

        callback();
      });
    },

    function testGetSingleValueSuccess(callback) {
      async.forEach(validKeys, function(key, callback) {
        var value = valuePrefix + key;

        client.configuration.get(key, function(err, actualValue) {
          assert.ifError(err);
          assert.equal(value, actualValue);
          callback();
        });
      }, callback);
    },

    function testSetInvalidKey(callback) {
      async.forEach(invalidKeys, function(key, callback) {
        var value = valuePrefix + key;

        client.configuration.set(key, value, function(err) {
          assert.ok(err);
          assert.equal(err.statusCode, 400);
          callback();
        });
      }, callback);
    },

    function testGetNamespaceShouldReturnError(callback) {
      client.configuration.get('/production/zookeeper', function(err) {
        assert.ok(err);
        assert.equal(err.statusCode, 404);
        callback();
      });
    },

    function testGetSimpleKeyWithSameNameAsExistingNamespace(callback) {
      var key = '/production/cassandra', expectedValue = valuePrefix + key;

      client.configuration.get(key, function(err, value) {
        assert.ifError(err);
        assert.equal(value, expectedValue);
        callback();
      });
    },

    function testCantDeleteNamespace(callback) {
      client.configuration.remove('/production/zookeeper', function(err) {
        assert.ok(err);
        assert.equal(err.statusCode, 404);
        callback();
      });
    },

    function testPaginationWithNamespace1(callback) {
      var namespace = '/production/cassandra';

      client.configuration.listForNamespace(namespace, {'limit': 1}, function(err, data, nextMarker) {
        assert.ifError(err);
        assert.equal(data.length, 1);
        assert.equal(nextMarker, '/production/cassandra/listen_ip');
        callback(null, nextMarker);
      });
    },

    function testPaginationWithNamespace2(nextMarker, callback) {
      var namespace = '/production/cassandra';

      client.configuration.listForNamespace(namespace, {'marker': nextMarker}, function(err, data, nextMarker) {
        assert.ifError(err);
        assert.equal(data.length, 2);
        assert.ok(!nextMarker);
        callback();
      });
    }
  ],

  function(err) {
    assert.ifError(err);
    test.finish();
  });
};
