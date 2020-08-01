"use strict";

/**!
 * RED
 * @copyright (c) 2012 observe.it (observe.it) <opensource@observe.it>
 * MIT Licensed
 */

var EventEmitter = require('events').EventEmitter
  , EventReactor = require('eventreactor')
  , _ = require('lodash');

/**
 * Transportation base class.
 *
 * @constructor
 * @param {Engine} engine
 * @param {HTTP.ServerResponse} response
 * @param {Object}
 * @api public
 */

function Transport (engine, response, options) {
  // defaults
  this.sessionid = 0;
  this.connectionid = 0;

  this.count = 0;
  this.name = 'Transport base';
  this.specification = 0;

  // does this transport needs to receive custom heartbeats
  this.heartbeats = true;
  this.heartbeatInterval = 20;
  this.inactivity = 20;

  // restrictions
  this.maxiumBuffer = 38400;

  // protocol parser
  this.protocol = null;

  _.extend(this, options || {});

  this.engine = engine;
  this.response = response;
  this.socket = this.response.socket;

  // don't buffer anything
  this.socket.setTimeout(0);
  this.socket.setNoDelay(true);
  this.socket.setEncoding('utf8');

  // add default finish event listener
  this.response.on('finish', this.destroy);
}

Transport.prototype.__proto__ = EventEmitter.prototype;

/**
 * Send a message, which is send to the engine under the hood because we have no
 * idea if this user was still online
 *
 * @param {String} message
 * @api public
 */

Transport.prototype.send = function send (message) {
  this.count++;

  var self = this;
  this.engine.push(this.connectionid, message, function backlog (err, messages) {
    self.engine.publish(self.connectionid, message);
  });
};

/**
 * Write to the actual established connection.
 *
 * @param {String} message
 * @returns {Boolean} successfull write
 * @api private
 */

Transport.prototype.write = function write (message) {
  var state = this.socket.readyState;

  if (state === 'open' || state === 'readyState') {
    return this.response.write(message);
  }

  // the socket is actually closed, so we should return false to prevent thrown
  // errors
  return false;
};

/**
 * Initialize the transport.
 *
 * @param {HTTP.ServerRequest} request
 * @param {HTTP.ServerResponse} response
 * @param {Buffer} head
 * @api public
 */

Transport.prototype.initialize = function initialize (request, response, head) {
  this.backlog();
};

/**
 * Accepts POST requests
 *
 * @param {HTTP.ServerRequest} request
 * @param {HTTP.ServerResponse} response optional
 * @api private
 */

Transport.prototype.receive = function receive (request, response) {
  if (request.method !== 'POST') return false;

  // make sure we have a response, as we need to answer the pull request, so
  // this is either a new transport with
  response = response || this.response;

  var parser = this.protocol.createStream(this.maxiumBuffer)
    , self = this;

  /**
   * Handle completed posts.
   *
   * @api private
   */

  function done () {
    if (response) {
      response.writeHead(200, {
          'Content-Type': 'application/json; charset=UTF-8'
        , 'Connection': 'Keep-Alive'
        , 'Cache-Control': 'no-cache, no-store'
      });
      response.end('"OK"');
    }
  }

  parser.on('end', done);

  // set the correct encoding to prevent that our protocol parser chops UTF8 in
  // to different parts
  request.setEncoding('utf8');
  request.pipe(parser);

  return true;
};

/**
 * Process the message backlog.
 *
 * @api private
 */

Transport.prototype.backlog = function backlog () {
  var self = this;

  this.engine.pull(this.sessionid, function history (err, messages) {
    if (err) return;
    if (!messages || !messages.length) return;

    self.write(messages);
  });
};

/**
 * Check if all messages have been flushed and destroys the transport once this
 * done.
 *
 * @api public
 */

Transport.prototype.end = function end () {
  if (this.socket._pendingWriteReqs === 0) return this.destroy();

  var self = this;
  this.socket.either('drain', 'end', 'close', function either () {
    self.destroy();
  });
};

/**
 * Destory the connection.
 *
 * @api private
 */

Transport.prototype.destroy = function destory () {
  // check if we need to answer the response, if the request is answered there
  // will be a finished flag set, @see node http:
  // https://github.com/joyent/node/blob/master/lib/http.js#L764
  if (!this.response.finished) {
    // did we set the statusCode already?
    if (!this.response.statusCode) {
      this.response.statusCode = 200;
    }

    // do we need to add a content-type
    if (!this.response.getHeader('content-type')) {
      this.response.setHeader('Content-Type', 'application/json');
    }

    try { this.response.end(); }
    catch (e) {}
  }

  // clean up eventlisteners
  this.removeAllListeners();
  this.response.removeAllListeners();
  this.socket.removeAllListeners();

  // expire the data instantly if don't need to support heartbeats
  this.engine.expire(this.id, this.heartbeats ? this.inactivity : 0);
};

/**
 * Invalid response, close this response.
 *
 * @TODO make sure that .destory is also called so everything gets cleaned up
 * nicely.
 *
 * @param {String} error error message
 * @param {Error} err optional err that caused this issue
 * @api private
 */

Transport.errors = {
    'error': 500
  , 'bad request': 400
};

Transport.prototype.error = function (error, err) {
  var data = Transport.errors[error.toLowerCase()];

  try {
    this.response.end([
        'HTTP/1.1 ' + data + ' ' + error
      , 'Content-Type: text/html'
      , ''
      , ''
    ].join('\r\n'));
  } catch (e) {}
};

/**
 * Simple helper function for answering requests with HTTP access control.
 *
 * @SEE https://developer.mozilla.org/En/HTTP_Access_Control
 *
 * @param {HTTP.ServerRequest} requests
 * @param {Object} headers
 * @api private
 */

Transport.accessControl = function accessControl (request, headers) {
  headers['Access-Control-Allow-Origin'] = request.headers.origin;
  headers['Access-Control-Allow-Credentials'] = 'true';
};

/**
 * Expose the transport.
 */

module.exports = Transport;
