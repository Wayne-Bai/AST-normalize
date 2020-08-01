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

var path = require('path');

var sprintf = require('sprintf').sprintf;
var async = require('async');
var KeystoneClient = require('keystone-client').KeystoneClient;
var tryfer = require('tryfer');
var trace = require('tryfer').trace;
var tracers = require('tryfer').tracers;
var nodeTracers = require('tryfer').node_tracers;
var trace = require('tryfer').trace;
var statsDLog = require('logmagic').local('api.server.instruments.statsD');
var instruments = require('rackspace-shared-utils/lib/instruments');
var cassInitialize = require('cassandra-orm/lib/init').initialize;
var ormUtils = require('cassandra-orm/lib/orm/utils');
var ZkClient = require('zookeeper-client/lib/client').ZkClient;

var settings = require('./util/settings');
var dbUtil = require('./util/db');
var misc = require('./util/misc');

exports.initializeCassandraOrm = function(callback) {
  var options = {}, i;

  options.hosts = [];
  options.keyspace = settings.CASSANDRA_KEYSPACE;
  options.timeout = settings.CASSANDRA_CONNECTION_TIMEOUT;
  options.queryTimeout = settings.CASSANDRA_QUERY_TIMEOUT;
  options.modelsPath = path.join(__dirname, './db/models');
  options.accountingCf = settings.ACCOUNTING_CF;
  options.trackedModels = ['service', 'configuration_value'];
  options.migrationsPath = path.join(__dirname, '../migrations');
  options.readConsistency = settings.CASSANDRA_READ_CONSISTENCY;
  options.writeConsistency = settings.CASSANDRA_WRITE_CONSISTENCY;
  options.logFunc = misc.logCassEvent;
  options.logRewriterFunc = settings.logmagicRewriter;
  options.pooledConnectionCls = dbUtil.InstrumentedPooledConnection;
  options.hosts = settings.CASSANDRA_CLUSTER;
  options.cqlVersion = '2.0.0';

  cassInitialize(options, callback);
};

exports.establishDbConnections = function(callback) {
  // Establish a connection to all the servers in a pool. This way
  // problematic nodes and fail-over can be performed faster
  ormUtils.getConnPool();
  setTimeout(callback, 500);
};

exports.initializeStatsd = function(callback) {
  function logStatsDError(err) {
    statsDLog.error('error sending to statsd', {'err': err});
  }

  instruments.configureStatsD(settings.STATSD_PORT, settings.STATSD_HOST).on('error', logStatsDError);
  callback();
};

exports.instrumentZkOperationsWithTracing = function(callback) {
  var oldAcquireLock = ZkClient.prototype.acquireLock,
      oldUnlock = ZkClient.prototype.unlock,
      ep = new trace.Endpoint('127.0.0.1', '1234', 'rsr:rproxy:backend:zookeeper');

  ZkClient.prototype.acquireLock = function(ctx, node, txnId, callback) {
    oldAcquireLock.call(this, node, txnId, callback);
  };

  if (!settings.TRACING_ENABLED) {
    callback();
    return;
  }

  ZkClient.prototype.acquireLock = function(ctx, node, txnId, callback) {
    var clientSendTrace, ep;

    // TODO: We don't know which host was actually used for the operation
    clientSendTrace = ctx.tracing.serverRecvTrace.child('acquireLock');
    clientSendTrace.setEndpoint(ep);
    clientSendTrace.record(trace.Annotation.clientSend());
    clientSendTrace.record(trace.Annotation.string('lockName', node));
    clientSendTrace.record(trace.Annotation.string('txnId', txnId));

    function wrappedCallback() {
      clientSendTrace.record(trace.Annotation.clientRecv());
      callback.apply(this, arguments);
    }

    oldAcquireLock.call(this, node, txnId, wrappedCallback);
  };

  // TODO: Also instrument unlock
  /*ZkClient.prototype.unlock = function(node, callback) {
    oldUnlock.apply(this, arguments);
  };*/

  callback();
};

exports.setUpTracer = function(callback) {
  var client, options, key, value;
  // Make sure that all the required settings are set
  for (key in settings) {
    if (settings.hasOwnProperty(key) && key.indexOf('TRACING_') === 0) {
      value = settings[key];

      if (!value) {
        throw new Error(sprintf('%s setting value is not set!', key));
      }
    }
  }

  client = new KeystoneClient(settings.TRACING_AUTH_URL, {'username': settings.TRACING_AUTH_USERNAME,
                                                          'apiKey': settings.TRACING_AUTH_API_KEY});
  options = {'maxTraces': settings.TRACING_MAX_TRACES, 'sendInterval': settings.TRACING_SEND_INTERVAL};
  tracers.pushTracer(new nodeTracers.RESTkinHTTPTracer(settings.TRACING_RESTKIN_URL, client, options));
  callback();
};

/**
 * Initialize the the Cassandra ORM and statsd sink.
 *
 * @param {Function} callback Callback called with (err).
 */
exports.initialize = function(callback) {
  var ops = [];

  ops.push(exports.initializeCassandraOrm);
  ops.push(exports.establishDbConnections);
  ops.push(exports.instrumentZkOperationsWithTracing);

  if (settings.STATSD_HOST) {
    ops.push(exports.initializeStatsd);
  }

  if (settings.TRACING_ENABLED && settings.ENVIRONMENT !== 'dev') {
    ops.push(exports.setUpTracer);
  }

  async.series(ops, function(err) {
    if (err) {
      throw err;
    }

    callback();
  });
};
