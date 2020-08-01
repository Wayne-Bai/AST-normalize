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

var util = require('util');

var cass = require('cassandra-client');
var trace = require('tryfer').trace;
var instruments = require('rackspace-shared-utils/lib/instruments');
var profiling = require('rackspace-shared-utils/lib/profiling');
var genCassError = require('cassandra-orm/lib/orm/utils').genCassError;

function InstrumentedPooledConnection(config) {
  cass.PooledConnection.call(this, config);
}

util.inherits(InstrumentedPooledConnection, cass.PooledConnection);

/**
 * Override parent execute and instrument it.
 * @param {DbOperationContext} ctx you know it.
 * @param {String} query parameterized query.
 * @param {Array} args list of parameters.
 * @param {Function} callback expects (err, results).
 */
InstrumentedPooledConnection.prototype.execute = function(ctx, query, args, callback) {
  var work = new instruments.Work('cassandra_execute'), parameterizedQuery, queryType, clientSendTrace;
  work.start();

  queryType = profiling.getQueryType(query).toUpperCase();
  parameterizedQuery = cass.bindQuery(query, args.slice()).toString();

  if (ctx.tracing) {
    clientSendTrace = ctx.tracing.serverRecvTrace.child(queryType);
    clientSendTrace.record(trace.Annotation.clientSend());
    clientSendTrace.record(trace.Annotation.string('txnId', ctx.txnId));
    clientSendTrace.record(trace.Annotation.string('cassandra.query', parameterizedQuery));
  }

  cass.PooledConnection.prototype.execute.call(this, query, args, function(err, results, metadata) {
    var connectionInfo = (metadata) ? metadata.connectionInfo : {'host': '', 'port': ''}, ep;
    work.stop(err);

    if (ctx.tracing) {
      ep = new trace.Endpoint(connectionInfo.host, connectionInfo.port.toString(),
                              'rsr:rproxy:backend:cassandra');
      clientSendTrace.setEndpoint(ep);

      if (err) {
        clientSendTrace.record(trace.Annotation.string('cassandra.error', err.toString()));
      }

      clientSendTrace.record(trace.Annotation.string('cassandra.keyspace', connectionInfo.keyspace));
      clientSendTrace.record(trace.Annotation.string('cassandra.host', connectionInfo.host));
      clientSendTrace.record(trace.Annotation.string('cassandra.port', connectionInfo.port.toString()));
      clientSendTrace.record(trace.Annotation.clientRecv());
    }

    if (err) {
      callback(genCassError(err, results));
      return;
    }

    callback(null, results);
  });
};

exports.InstrumentedPooledConnection = InstrumentedPooledConnection;
