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

/** node.js driver for Cassandra-CQL. */

var util = require('util');
var constants = require('constants');
var EventEmitter = require('events').EventEmitter;

var thrift = require('thrift');
var async = require('async');
var Cassandra = require('./gen-nodejs/Cassandra');
var ttypes = require('./gen-nodejs/cassandra_types');
var utils = require('./utils');

var Decoder = require('./decoder').Decoder;

var bufferToString = module.exports.bufferToString = require('./decoder').bufferToString;


// used to parse the CF name out of a select statement.
var selectRe = /\s*SELECT\s+.+\s+FROM\s+[\']?(\w+)/im;
var selectCountRe = /\s*SELECT\s+.*COUNT\(.+\)\s+FROM\s+[\']?(\w+)/im;

var appExceptions = ['InvalidRequestException', 'UnavailableException', 'SchemaDisagreementException'];

function BindError(message) {
  this.message = message;
  Error.call(this, message);
}

util.inherits(BindError, Error);

//  how long we wait for a connection to time out.
var DEFAULT_CONNECTION_TIMEOUT = 4000;

// how long we wait for a query to finish.
var DEFAULT_QUERY_TIMEOUT = 5000;

/** Default timeout for each of the steps (login, learn, use) which are performed
* when the Connection to the Cassandra server has been established. */
var DEFAULT_STEP_TIMEOUTS = {
  'login': 1000,
  'learn': 2000,
  'use': 1000
};

/**
 * Maximum number used for a query id. When this number is reach query id
 * counter re-restarts from zero.
 * @type {Number}
 */
var MAX_QUERY_ID = 500000;


/** converts object to a string using toString() method if it exists. */
function stringify(x) {
  // node buffers should be hex encoded
  if (x instanceof Buffer) {
    return x.toString('hex');
  }
  if (x.toString) {
    return x.toString();
  }
  return x;
}

/** wraps in quotes */
function quote(x) {
  return '\'' + x + '\'';
}

/** replaces single quotes with double quotes */
function fixQuotes(x) {
  return x.replace(/\'/img, '\'\'');
}

function encodeParam(x) {
  if((typeof x == 'number') || (typeof x == 'boolean')) {
    return x.toString();
  } else if(x instanceof Date) {
    return x.getTime().toString();
  } else {
    return quote(fixQuotes(stringify(x)));
  }
}

/**
 * binds arguments to a query. e.g: bind('select ?, ? from MyCf where key=?', ['arg0', 'arg1', 'arg2']);
 * quoting is handled for you.  so is converting the parameters to a string, preparatory to being sent up to cassandra.
 * @param query
 * @param args array of arguments. falsy values are never acceptable.
 * @return a buffer suitable for cassandra.execute_cql_query().
 */
exports.bindQuery = function(query, args) {
  if (args.length === 0) {
    return query;
  }

  var q = 0;
  var a = 0;
  var str = '';

  try {
    while (q >= 0) {
      var oldq = q;
      q = query.indexOf('?', q);
      if (q >= 0) {
        str += query.substr(oldq, q-oldq);
        if (args[a] === null || args[a] === undefined) {
          throw new BindError('null/undefined query parameter');
        }
        str += encodeParam(args[a++]);
        q += 1;
      } else {
        str += query.substr(oldq);
      }
    }

    return new Buffer(str);
  }
  catch (e) {
    throw new BindError(e.message);
  }
};

/** returns true if obj is in the array */
function contains(a, obj) {
  var i = a.length;
  while (i > 0) {
    if (a[i-1] === obj) {
      return true;
    }
    i--;
  }
  return false;
}


var System = module.exports.System = require('./system').System;
var KsDef = module.exports.KsDef = require('./system').KsDef;
var CfDef = module.exports.CfDef = require('./system').CfDef;
var ColumnDef = module.exports.ColumnDef = require('./system').ColumnDef;
var BigInteger = module.exports.BigInteger = require('./bigint').BigInteger;
var UUID = module.exports.UUID = require('./uuid');


/**
 * Make sure that err.message is set to something that makes sense.
 *
 * @param {Object} err Error object.
 * @param {Object} connectionInfo Optional connection info object which is
 * attached to the error.
 */
function amendError(err, connectionInfo) {
  if (!err.message || err.message.length === 0) {
    if (err.name === "NotFoundException") {
      err.message = "ColumnFamily or Keyspace does not exist";
    } else if (err.why) {
      err.message = err.why;
    }
  }

  err.connectionInfo = connectionInfo;
  return err;
}

/** abstraction of a single row. */
var Row = module.exports.Row = function(row, decoder) {
  // decoded key.
  this.key = decoder.decode(row.key, 'key');

  // cols, all names and values are decoded.
  this.cols = []; // list of hashes of {name, value};
  this.colHash = {}; // hash of  name->value

  var count = 0;
  for (var i = 0; i < row.columns.length; i++) {
    if (row.columns[i].value && row.columns[i].name != 'KEY') {
      // avoid 'KEY' in column[name:value] as it is neat. Also it breaks specificValidators.
      var decodedName = decoder.decode(row.columns[i].name, 'comparator');
      var decodedValue = decoder.decode(row.columns[i].value, 'validator', row.columns[i].name);
      this.cols[count] = {
        name: decodedName,
        value: decodedValue
      };
      this.colHash[decodedName] = decodedValue;
      count += 1;
    }
  }

  this._colCount = count;
};

/** @returns the number of columns in this row. */
Row.prototype.colCount = function() {
  return this._colCount;
};

var CON_COUNTER = 0;

/**
 * @param options: valid parts are:
 *  user, pass, host, port, keyspace, use_bigints, timeout, log_time
 */
var Connection = module.exports.Connection = function(options) {
  options = options || {};
  this.validators = {};
  this.client = null;
  this.connectionInfo = options;
  this.timeout = options.timeout || DEFAULT_CONNECTION_TIMEOUT;
  this.query_timeout = options.query_timeout || DEFAULT_QUERY_TIMEOUT;
  this.cql_version = options.cql_version;

  this._id = ++CON_COUNTER;

  this._pendingQueryCallbacks = {};
  this._queryIdCounter = 0;

  EventEmitter.call(this);
};
util.inherits(Connection, EventEmitter);


/**
 * Call a callback for any of the pending / outgoing queries with the
 * provided error.
 *
 * @param {Error} err error object to call the callback with.
 */
Connection.prototype._killPendingQueries = function(err) {
  var queryId, callback;

  for (queryId in this._pendingQueryCallbacks) {
    if (this._pendingQueryCallbacks.hasOwnProperty(queryId)) {
      callback = this._pendingQueryCallbacks[queryId];
      this._deletePendingQueryCallback(queryId);

      callback(err);
    }
  }
};


/**
 * Delete a pending callback for a query with the provided id.
 *
 * @param {Number} queryId Query ID.
 */
Connection.prototype._deletePendingQueryCallback = function(queryId) {
  if (this._pendingQueryCallbacks.hasOwnProperty(queryId)) {
    delete this._pendingQueryCallbacks[queryId];
  }
};

Connection.prototype._getQueryId = function() {
  // If there are more than MAX_QUERY_ID outgoing queries at any point in time
  // we have different issues :)
  this._queryIdCounter++;

  if (this._queryIdCounter > MAX_QUERY_ID) {
    this._queryIdCounter = 0;
  }

  return this._queryIdCounter;
};

/**
 * makes the connection.
 * @param callback called when connection is successful or ultimately fails (err will be present).
 */
Connection.prototype.connect = function(callback) {
  var self = this,
      timeoutId,
      ops,
      cbAlreadyReturned = false,
      callbackWrapper = function(err) {
        if (!cbAlreadyReturned) {
          cbAlreadyReturned = true;
          callback(err);
        } else {
          // log what would have been a double-callback.  This is almost certainly a case of a connection erroring out.
          if (err) {
            self.emit('log', 'error', 'Connection error for: ' + self.connectionInfo.host + ':' + self.connectionInfo.port,
                    {'connectionInfo': self.connectionInfo});
          }
        }
      };

  self.emit('log', 'info', 'connecting ' + self.connectionInfo.host + ':' + self.connectionInfo.port + '(' + this._id + ')',
            {'connectionInfo': self.connectionInfo});

  // build connection here, so that timeouts on bad hosts happen now and not in the constructor.
  this.con = thrift.createConnection(self.connectionInfo.host, self.connectionInfo.port);
  this.con.on('error', function(err) {
    clearTimeout(timeoutId);
    self.emit('log', 'error', self.connectionInfo.host + ':' + self.connectionInfo.port + ' connection emitted an error.',
              {'connectionInfo': self.connectionInfo, 'err': err});
    amendError(err, self.connectionInfo);
    callbackWrapper(err);

    self._killPendingQueries(err);
  });

  this.con.on('close', function() {
    clearTimeout(timeoutId);
    self.emit('log', 'info', self.connectionInfo.host + ':' + self.connectionInfo.port + ' is closed (' + self._id + ')',
              {'connectionInfo': self.connectionInfo});
  });

  this.con.on('connect', function() {
    clearTimeout(timeoutId);

    function decorateErrWithErrno(err, errno) {
      err.errno = errno;
      return err;
    }

    // preparing the conneciton is a 3-step process.

    // 1) login
    var login = function(cb) {
      if (self.connectionInfo.user || self.connectionInfo.pass) {
        var creds = new ttypes.AuthenticationRequest({user: self.connectionInfo.user, password: self.connectionInfo.pass});
        var timeoutId = setTimeout(function() {
          if (timeoutId) {
            timeoutId = null;
            cb(decorateErrWithErrno(new Error('login timed out'), constants.ETIMEDOUT));
          }
        }, DEFAULT_STEP_TIMEOUTS.login);
        self.client.login(creds, function(err) {
          if (timeoutId) {
            timeoutId = clearTimeout(timeoutId);
            if (err) { amendError(err, self.connectionInfo); }
            cb(err);
          }
        });
      } else {
        cb(null);
      }
    };

    // 2) learn.
    var learn = function(cb) {
      var timeoutId = setTimeout(function() {
        if (timeoutId) {
          timeoutId = null;
          cb(decorateErrWithErrno(new Error('learn timed out'), constants.ETIMEDOUT));
        }
      }, DEFAULT_STEP_TIMEOUTS.learn);
      self.client.describe_keyspace(self.connectionInfo.keyspace, function(err, def) {
        if (timeoutId) {
          timeoutId = clearTimeout(timeoutId);
          if (err) {
            amendError(err, self.connectionInfo);
            cb(err);
          } else {
            for (var i = 0; i < def.cf_defs.length; i++) {
              var validators = {
                key: def.cf_defs[i].key_validation_class,
                comparator: def.cf_defs[i].comparator_type,
                defaultValidator: def.cf_defs[i].default_validation_class,
                specificValidators: {}
              };
              for (var j = 0; j < def.cf_defs[i].column_metadata.length; j++) {
                // todo: verify that the name we use as the key represents the raw-bytes version of the column name, not
                // the stringified version.
                validators.specificValidators[def.cf_defs[i].column_metadata[j].name] = def.cf_defs[i].column_metadata[j].validation_class;
              }
              self.validators[def.cf_defs[i].name] = validators;
            }
            cb(null); // no errors.
          }
        }
      });
    };

    // 3) set the keyspace on the server.
    var use = function(cb) {
      var timeoutId = setTimeout(function() {
        timeoutId = null;
        cb(decorateErrWithErrno(new Error('use timed out'), constants.ETIMEDOUT));
      }, DEFAULT_STEP_TIMEOUTS.use);

      self.client.set_keyspace(self.connectionInfo.keyspace, function(err) {
        if (timeoutId) {
          timeoutId = clearTimeout(timeoutId);
          if (err) { amendError(err, self.connectionInfo); }
          cb(err);
        }
      });
    };

    // 4) set CQL version (optional)
    var setCqlVersion = function(callback) {
      self.emit('log', 'info', 'Explicitly specifying CQL version: ' + self.cql_version);

      // Note: set_cql_version has been added in 1.1
      self.client.set_cql_version(self.cql_version, function(err) {
        if (err) {
          amendError(err, self.connectionInfo);
        }

        callback(err);
      });
    };

    ops = [login, learn, use];

    if (self.cql_version) {
      ops.push(setCqlVersion);
    }

    async.series(ops, function(err) {
      if (err) {
        self.emit('log', 'error', 'Error while connecting: ' + err.toString(),
                  {'connectionInfo': self.connectionInfo, 'err': err});
        self.close();
      }
      callbackWrapper(err);
    });
  });

  function connectTimeout() {
    var err = new Error('ETIMEDOUT, Operation timed out');
    err.errno = constants.ETIMEDOUT;

    try {
      self.con.connection.destroy(err);
    }
    catch (e) {}

    self.con = null;
  }

  // kicks off the connection process.
  this.client = thrift.createClient(Cassandra, this.con);

  // set a connection timeout handler
  timeoutId = setTimeout(connectTimeout, this.timeout);
};

/**
 * Closes the current connection
 *
 * `this.con` is a socket connection. For failed socket connections
 * `this.con.end()` may not trigger a `close` event. So in the cases where we
 * are experiencing problems with the connection, we can just `end()` it
 * without waiting for the `close` event.
 *
 * Note that the callback is only called, if the `close` event is fired. Also
 * we only wait for the `close` event if a callback is given.
 *
 * @param {function} callback
 */
Connection.prototype.close = function(callback) {
  var self = this;
  if (!callback) {
    self.con.end();
    self.con = null;
    self.client = null;
    return;
  }
  self.con.on('close', function(err) {
    self.con = null;
    self.client = null;
    callback();
  });
  self.con.end();
};

/**
 * executes any query
 * @param query any cql statement with '?' placeholders.
 * @param args array of arguments that will be bound to the query.
 * @param callback executed when the query returns. the callback takes a different number of arguments depending on the
 * type of query:
 *    SELECT (single row): callback(err, row, metadata)
 *    SELECT (mult rows) : callback(err, rows, metadata)
 *    SELECT (count)     : callback(err, count, metadata)
 *    UPDATE             : callback(err, undefined, metadata)
 *    DELETE             : callback(err, undefined, metadata)
 */
Connection.prototype.execute = function(query, args, callback) {
  var cql,
      metadata = {'connectionInfo': this.connectionInfo},
      queryWatchTimeout = (this.query_timeout / 1.5);

  try {
    cql = exports.bindQuery(query, args);
  }
  catch (err) {
    callback(err);
    return;
  }

  var self = this,
      cqlString = cql.toString(),
      start, end, diff, queryId;

  callback = utils.fireOnce(callback);

  start = new Date().getTime();
  queryId = this._getQueryId();
  self.emit('log', 'cql', cqlString, {
    'query': query,
    'parameterized_query': cqlString,
    'args': args,
    'connectionInfo': self.connectionInfo
  });

  // if a connection dies at the right place, execute_cql_query never returns. make sure the callback gets called.
  var longQueryWatch = setTimeout(function() {
    self.emit('log', 'trace', 'query is taking long: ' + cqlString, {
      'query': cqlString,
      'timeout': queryWatchTimeout,
      'connectionInfo': self.connectionInfo
    });
  }, queryWatchTimeout);
  var timeoutId = setTimeout(function() {
    callback(new Error('Query timed out'), null, metadata);
    timeoutId = null;
  }, self.query_timeout);

  this._pendingQueryCallbacks[queryId] = callback;

  self.client.execute_cql_query(cql, ttypes.Compression.NONE, function(err, res) {
    clearTimeout(longQueryWatch);
    self._deletePendingQueryCallback(queryId);

    if (!timeoutId) {
      self.emit('log', 'warn', 'query returned after timeout: ' + cqlString, {
        'query': cqlString,
        'timeout': self.query_timeout,
        'connectionInfo': self.connectionInfo
      });
      return;
    } else {
      clearTimeout(timeoutId);
    }

    end = new Date().getTime();
    diff = (end - start);
    if (self.connectionInfo.log_time) {
      self.emit('log', 'timing', cqlString, {
        'query': query,
        'parameterized_query': cqlString,
        'args': args,
        'time': diff,
        'connectionInfo': self.connectionInfo
      });
    }

    if (err) {
      amendError(err, self.connectionInfo);
      callback(err, null, metadata);
    } else if (!res) {
      err = new Error('No results');
      amendError(err, self.connectionInfo);
      callback(err, null, metadata);
    } else {
      if (res.type === ttypes.CqlResultType.ROWS) {
        var cfName = selectRe.exec(cqlString)[1];

        if (!self.validators[cfName]) {
          callback(new Error('Missing validators for column family: ' + cfName));
          return;
        }

        var decoder = new Decoder(self.validators[cfName], {use_bigints: self.connectionInfo.use_bigints,
                                                            select_count: selectCountRe.test(cqlString)});
        // for now, return results.
        var rows = [];
        for (var i = 0; i < res.rows.length; i++) {
          var row = new Row(res.rows[i], decoder);
          rows.push(row);
        }
        rows.rowCount = function() {
          return res.rows.length;
        };

        callback(null, rows, metadata);
      } else if (res.type === ttypes.CqlResultType.INT) {
        callback(null, res.num, metadata);
      } else if (res.type === ttypes.CqlResultType.VOID) {
        callback(null, undefined, metadata);
      } else {
        callback(new Error('Execution unexpectedly got here. Result type is ' + res.type));
      }
    }
  });
};


/**
 * pooled connection behave a bit different but offer the same service interface as regular connections.
 * This constructor behaves differently from the normal Connection since Connection() does some socket work.
 * that work is delayed to connect() here.
 */
var ConnectionInPool = module.exports.ConnectionInPool = function(options) {
  options.staleThreshold = options.staleThreshold || 10000;
  // cache options so that thrift setup can happen later.
  this._options = options;
  this.connected = false; // true when connected.
  this.unhealthyAt = 0; // timestamp this connection went bad.
};

util.inherits(ConnectionInPool, Connection);

/**
 * connects to the remote endpoint.
 * @param callback
 */
ConnectionInPool.prototype.connect = function(callback) {
  var self = this;

  // pooled connections can be reestablished. track this and make sure the previous transport is torn down.
  // it occupies a fair amount of resources. the callback doesn't need to depend on this since the new transport
  // can be repointed before the old transport goes away.
  if (self._id !== undefined && self.con && self.client) {
    self.emit('log', 'debug', 'initiating proactive transport close', {});
    // ghetto close.
    var _con = self.con;
    _con.on('close', function(err) {
      self.emit('log', 'debug', 'proactive transport close finished', {});
    });
    _con.end();
  }
  Connection.call(this, this._options);
  Connection.prototype.connect.call(this, function(err) {
    if (err) {
      self.connected = false;
    }
    else {
      self.setConnected();
    }

    self.unhealthyAt = err ? new Date().getTime() : 0;
    callback(err);
  });
};

ConnectionInPool.prototype.setConnected = function() {
  this.connected = true;
  this.emit('connected');
};

ConnectionInPool.prototype.setDisconnected = function() {
  this.connected = false;
  this.emit('disconnected');
};

ConnectionInPool.prototype.isHealthy = function() {
  return this.unhealthyAt === 0;
};

/**
 * a 'stale unhealthy' node is a node that has been bad for some period of time. After that
 * period, it is safe to retry the connection.
 */
ConnectionInPool.prototype.isStaleUnhealthy = function() {
  return !this.isHealthy() && new Date().getTime() - this.unhealthyAt > this._options.staleThreshold;
};

/**
 * Perform queries against a pool of open connections.
 *
 * Accepts a single argument of an object used to configure the new PooledConnection
 * instance.  The config object supports the following attributes:
 *
 *         hosts    : List of strings in host:port format.
 *      keyspace    : Keyspace name.
 *          user    : User for authentication (optional).
 *          pass    : Password for authentication (optional).
 *       maxSize    : Maximum number of connection to pool (optional).
 *    idleMillis    : Idle connection timeout in milliseconds (optional).
 *    timeout       : Connection timeout (optional).
 *    query_timeout : Query execution timeout (optional).
 *
 * Example:
 *
 *   var pool = new PooledConnection({
 *     hosts      : ['host1:9160', 'host2:9170', 'host3', 'host4'],
 *     keyspace   : 'database',
 *     user       : 'mary',
 *     pass       : 'qwerty',
 *     maxSize    : 25,
 *     idleMillis : 30000
 *   });
 *
 * @param config an object used to control the creation of new instances.
 */
var PooledConnection = module.exports.PooledConnection = function(config) {
  var self = this;
  config = config || {};
  this.connections = [];
  this.current_node = 0;
  this.use_bigints = config.use_bigints ? true : false;
  this.timeout = config.timeout || DEFAULT_CONNECTION_TIMEOUT;
  this.query_timeout = config.query_timeout || DEFAULT_QUERY_TIMEOUT;
  this.log_time = config.log_time || false;
  this.cql_version = config.cql_version || null;

  // Number of currently running queries
  this.running = 0;

  // Shutdown mode
  this.shuttingDown = false;

  // Construct a list of nodes from hosts in <host>:<port> form
  for (var i = 0; i < config.hosts.length; i++) {
    var hostSpec = config.hosts[i];
    if (!hostSpec) { continue; }
    var host = hostSpec.split(':');

    if (host.length > 2) {
      throw new Error('malformed host entry "' + hostSpec + '" (skipping)');
    }

    var connection = new ConnectionInPool({
      host: host[0],
      port: (isNaN(host[1])) ? 9160 : host[1],
      keyspace: config.keyspace,
      user: config.user,
      pass: config.pass,
      use_bigints: self.use_bigints,
      timeout: self.timeout,
      query_timeout: self.query_timeout,
      log_time: self.log_time,
      cql_version: self.cql_version
    });

    connection.on('log', this._emitLogMessage.bind(this));
    this.connections.push(connection);
  }

  EventEmitter.call(this);
};

util.inherits(PooledConnection, EventEmitter);

PooledConnection.prototype._emitLogMessage = function(level, message, obj) {
  this.emit('log', level, message, obj);
};

/**
 * increment the current node pointer, skipping over any bad nodes.  has a side-effect of resetting
 * unhealthy nodes that are stale (but not reconnecting them).
 * @return boolean indicating if all nodes are unhealthy.
 */
PooledConnection.prototype._incr = function() {
  var incrCount = 0;
  while (incrCount < this.connections.length) {
    incrCount += 1;
    this.current_node = (this.current_node + 1) % this.connections.length;
    if (this.connections[this.current_node]) {
      if (this.connections[this.current_node].isHealthy()) {
        break;
      } else if (this.connections[this.current_node].isStaleUnhealthy()) {
        // unhealthy and stale, so let reset the node (appears as if unconnected).
        this.emit('log', 'debug', 'connection ' + this.current_node + ' is stale and not healthy. marking it as disconnected and resetting the state', {
          'connectionInfo': this.connections[this.current_node].connectionInfo
        });
        this.connections[this.current_node].setDisconnected();
        this.connections[this.current_node].unhealthyAt = 0;
        break;
      } else {
        this.emit('log', 'debug', 'connection ' + this.current_node + 'is not healthy', {});
      }
    }
  }
  // all nodes are unhealthy if we looped around and no healthy nodes were found.
  return incrCount >= this.connections.length && !this.connections[this.current_node].isHealthy();
};


/**
 * Establishes connections to all hosts in the pool.
 * @return callback expects err (if all the connect()s failed.
 */
PooledConnection.prototype.connect = function(callback) {
  var self = this;
  var errors = [];
  async.forEach(self.connections, function doConnect(con, callback) {
    con.connect(function(err) {
      if (err) {
        errors.push(err);
      }
      callback();
    });
  }, function() {
    if (errors.length === self.connections.length) {
      var error = new Error('There were errors connecting to every connection');
      error._individualErrors = errors;
      callback(error);
    } else {
      callback();
    }
  });
};


/**
 * executes any query
 * @param query any CQL statement with '?' placeholders.
 * @param args array of arguments that will be bound to the query.
 * @param callback executed when the query returns. the callback takes a different number of arguments depending on the
 * type of query:
 *    SELECT (single row): callback(err, row, metadata)
 *    SELECT (mult rows) : callback(err, rows, metadata)
 *    SELECT (count)     : callback(err, count, metadata)
 *    UPDATE             : callback(err, undefined, metadata)
 *    DELETE             : callback(err, undefined, metadata)
 */
PooledConnection.prototype.execute = function(query, args, executeCallback) {
  var self = this;

  if (self.shuttingDown) {
    executeCallback(new Error('Unable to execute query, connection pool is shutting down.'));
    return;
  }

  self.running++;
  var callback = function(err, results, metadata) {
    self.running--;
    executeCallback(err, results, metadata);
    if (self.running === 0) {
      self.emit('drain');
    }
  };

  self._getNextCon(function(err, con) {
    if (err) {
      callback(err, null);
      return;
    }

    try {
      con.execute(query, args, function(err, result, metadata) {
        if (err) {
          if ((err instanceof BindError) || (err.hasOwnProperty('name') && contains(appExceptions, err.name))) {
            callback(err, null, metadata);
          } else {
            con.unhealthyAt = new Date().getTime();

            amendError(err, con.connectionInfo);
            self.emit('log', 'warn', 'setting unhealthy from execute ' + con.connectionInfo.host + ':' + con.connectionInfo.port + ',' + err.message,
                      {'connectionInfo': con.connectionInfo, 'err': err});
            // try again.
            PooledConnection.prototype.execute.call(self, query, args, callback);
          }

          return;
        }

        callback(null, result, metadata);
      });
    } catch (e) {
      // individual connection has failed.
      con.unhealthyAt = new Date().getTime();

      self.emit('log', 'error', 'Error while executing a query: ' + e.toString(), {'err': e});
      self.emit('log', 'warn', 'setting unhealthy from catch outside execute ' + con.connectionInfo.host + ':' + con.connectionInfo.port,
                {'connectionInfo': con.connectionInfo});
      // try again.
      PooledConnection.prototype.execute.call(self, query, args, callback);
    }
  });
};

/** gets the next connection. errors when all connections are bad, or loop times out. */
PooledConnection.prototype._getNextCon = function(callback) {
  var self = this;
  var tryStart = new Date().getTime();
  var con = null;
  var allBad = false;
  var timedOut = false;
  var connectionInfo;

  async.whilst(function truthTest() {
    var now = Date.now();

    // should the timeout of getting a single connection be the sum of all connections?  Think of a scenario where the
    // timeout is N, but the first X nodes are unresponsive.  You still want to allow access to the subsequent good
    // nodes.
    timedOut = (now - tryStart) >= (self.timeout * self.connections.length);
    return (!allBad && con === null && !timedOut);
  },

  function tryConnect(callback) {
    var c = self.connections[self.current_node];
    connectionInfo = c.connectionInfo;
    allBad = self._incr();

    if (c.unhealthyAt > 0) {
      // This connection is unhealthy, try the next one
      callback();
      return;
    }

    if (!c.connected) {
      c.connect(function(err) {
        // some errors we pass back. some we swallow and iterate over.
        if (err && err.name === 'NotFoundException') {
          callback(err, null);
          return;
        }

        if (c.connected) {
          con = c;
        }

        callback();
      });

      return;
    }

    con = c;
    callback();
  },

  function whenDone(err) {
    if (err) {
      amendError(err, connectionInfo);
    }
    else {
      if (timedOut) {
        err = new Error('Timed out waiting for connection ' + (self.timeout * self.connections.length));
      } else if (allBad) {
        err = new Error('All connections are unhealthy.');
      } else if (!con) {
        err = new Error('Connection was not set');
      }
    }

    callback(err, con);
  });
};

/**
 * Signal the pool to shutdown.  Once called, no new requests (read: execute())
 * can be made. When all pending requests have terminated, the callback is run.
 *
 * @param callback called when the pool is fully shutdown
 */
PooledConnection.prototype.shutdown = function(callback) {
  var self = this;

  callback = callback || function() {};

  // Start shutdown mode, causes no new execute()'s to be accepted
  if (self.shuttingDown) {
    var err = new Error('Already shutting down.');
    return callback(err);
  }
  self.shuttingDown = true;

  // Close all open connections as soon as the pool has drained
  self.once('drain', function() {
    self._closeConnections(function() {
      self.shuttingDown = false;
      callback();
    });
  });

  // If no queries were running, emit the drain event immediately
  if (self.running === 0) {
    self.emit('drain');
  }
};

/**
 * Close all connected connections.
 *
 * @param {function} closeCallback that is fired once all connections are closed
 */
PooledConnection.prototype._closeConnections = function(closeCallback) {
  async.forEach(this.connections, function(con, cb) {
    if (con.connected) {
      con.close(cb);
    } else {
      con.on('connected', function() {
        con.close(null);
      });
      cb(null);
    }
  }, function(err) {
    closeCallback(err);
  });
};
