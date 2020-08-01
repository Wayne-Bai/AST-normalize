var assert = require('assert');
var Domain = require('domain');
var Duplex = require('stream').Duplex;
var Connections = require('./connections');
var _Protocol = require('./protocol');
var log = require('./log')('dumb-client');

var reconnectErrorCodes = ['ECONNREFUSED', 'ECONNRESET'];
var riakReconnectErrorCodes = ['all_nodes_down', 'Unknown message code.'];

module.exports =
function Client(options) {
  var connections = options.connections || Connections(options);
  var Protocol = options.protocol || _Protocol;

  var s = new Duplex({objectMode: true, highWaterMark: 1});

  var destroyed = false;
  var connection;
  var parser;
  var lastCommand;
  var lastSerializedPayload;
  var callback;
  var response = {};
  var expectMultiple;

  var retries = 0;
  var maxRetries = options.maxRetries || 10;
  var maxDelay = options.maxDelay || 2000;

  /// Command

  var oldWrite = s.write;
  s.write = function(command) {
    assert(typeof command == 'object', 'command must be an object');
    return oldWrite.apply(s, arguments);
  }

  s._write =
  function (command, encoding, _callback) {
    assert(typeof command == 'object', 'command must be an object');
    if (callback) throw new Error('I\'m in the middle of a request');
    lastCommand = command;
    callback = _callback;
    log('serializing payload', command.payload);
    lastSerializedPayload = Protocol.serialize(command.payload);
    expectMultiple = command.expectMultiple;
    sendCommand();
    return false;
  };

  function sendCommand() {
    if (! connection) {
      log('connecting...');
      connection = connect();

      /// All this following code just to
      /// detect unsuccessful connection
      var domain = Domain.create();
      domain.on('error', onDomainError);
      domain.add(connection);
      connection.once('connect', function() {
        log('connected');
        domain.remove(connection);
        domain.dispose();
      });
    }
    parser.expectMultiple(expectMultiple);
    log('writing payload %j', lastSerializedPayload);
    connection.write(lastSerializedPayload);
  }

  s._read = function() {};


  /// Connect

  function connect() {
    if (destroyed) throw new Error('Destroyed');
    connection = connections.connect();
    connection.on('error', onConnectionError);
    parser = Protocol.parse();
    connection.pipe(parser);
    parser.on('readable', onParserReadable);
    return connection;
  }


  /// Error handling

  var lastError;
  function onDomainError(err) {
    log('domain error', err.stack || err);
    if (err == lastError) return;

    lastError = err;
    process.nextTick(function() {
      lastError = undefined;
    });
    if (err.code && ~reconnectErrorCodes.indexOf(err.code)) onConnectionError(err);
    else s.emit('error', err);
  }

  function onConnectionError(err) {
    log('connection error', err.stack || err);
    // throw away this connection so that
    // we get a new one when retrying

    s.emit('warning', err);
    s.emit('interrupted', err);

    if (connection) {
      connection.removeListener('error', onConnectionError);
      connection.unpipe(parser);
      connection.destroy();
      connection = undefined;
      parser.destroy();
      parser.removeListener('readable', onParserReadable);
      parser = undefined;
    }

    retry();
  }


  /// Read from parser

  function onParserReadable() {
    var reply;
    while (parser && (reply = parser.read())) {
      handleReply(reply);
    }
  }


  /// Handle response buffer

  function handleReply(reply) {
    log('parser reply is %j', reply);
    if (reply.errmsg) {
      if (~riakReconnectErrorCodes.indexOf(reply.errmsg)) {
        var error = new Error(reply.errmsg);
        /// HACK
        /// When shutting down a riak node
        // I've observed that pending connections get this error
        // Since I've never seen this error message
        // in any other situation, I'm going to assume that
        // this is the case where the node is shutting down.
        // *sigh*
        error.code = 'ECONNREFUSED'; // more HACK
        onConnectionError(new Error(reply.errmsg));

      }
      else respondError(new Error(reply.errmsg));
    } else {
      if (! expectMultiple) {
        log('not expecting multiple. pushing %j', reply);
        s.push(reply);
        response = reply;
        finishResponse();
      } else {
        log('expecting multiple');
        if (reply.done) {
          finishResponse();
          s.emit('done');
        } else {
          log('pushing out reply %j', reply)
          s.push(reply);
        }
      }
    }
  }


  /// Finish Response

  function finishResponse(err) {
    log('finishing response');
    if (err) log('with error', err.stack || err);
    var _response = response;
    var _callback = callback;
    cleanup();
    if (_callback) {
      log('I have a calback');
      if (err) {
        log('calling back with error', err.stack || err);
        _callback(err);
      } else {
        _callback(null);
      }
    } else {
      log('No callback');
    }
  }


  /// Retry

  function retry() {
    retries ++;
    if (retries > maxRetries)
      respondError(new Error('max retries reached'));
    else {
      log('retrying...');
      setTimeout(function() {
        if (lastCommand) sendCommand();
      }, Math.min(Math.exp(10, retries), maxDelay));
    }
  }


  /// Respond Error

  function respondError(err) {
    log('responding with error', err.stack || err);
    var _callback = callback;
    cleanup();
    if (_callback) _callback(err);
    else s.emit('error', err);
    s.emit('drain');
  }

  /// Cleanup

  function cleanup() {
    log('cleanup');
    response = {};
    callback = undefined;
    retries = 0;
    lastCommand = undefined;
    lastSerializedPayload = undefined;
    if (parser) parser.cleanup();
  }


  /// Destroy

  s.destroy =
  function destroy() {
    log('destroying...');
    destroyed = true;
    if (connection) connection.destroy();
  }

  return s;
};


//// Utils
