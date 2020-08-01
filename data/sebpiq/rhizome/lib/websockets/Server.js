/*
 * Copyright 2014, Sébastien Piquemal <sebpiq@gmail.com>
 *
 * rhizome is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * rhizome is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with rhizome.  If not, see <http://www.gnu.org/licenses/>.
 */

var parseUrl = require('url').parse
  , _ = require('underscore')
  , debug = require('debug')('rhizome.server.websocket')
  , WSServer = require('ws').Server
  , expect = require('chai').expect
  , oscMin = require('osc-min')
  , coreServer = require('../core/server')
  , connections = require('../connections')
  , coreUtils = require('../core/utils')
  , coreValidation = require('../core/validation')
  , coreMessages = require('../core/messages')


var WebSocketServer = module.exports = function(config) {
  coreServer.Server.call(this, config)
  this._wsServer = null
  this._config = config
}


_.extend(WebSocketServer.prototype, coreServer.Server.prototype, coreValidation.ValidateConfigMixin, {

  // This method starts the websocket server, and calls `done(err)` when complete.
  start: function(done) {
    var serverOpts = { path: this._config.rootUrl }
      , self = this

    this._validateConfig(function(err) {
      if (err) return done(err)
      coreServer.Server.prototype.start.apply(self)
      self._queuedSockets = new coreUtils.Queue()

      // Create the `node-ws` web socket server.
      if (self._config.serverInstance) serverOpts.server = self._config.serverInstance
      else serverOpts.port = self._config.port
      self._wsServer = new WSServer(serverOpts)
      self._wsServer.on('listening', function() { done() })
      self._wsServer.on('connection', self._connectIfSpace.bind(self))
      self.on('connection', self._onConnection.bind(self))
    })
  },

  stop: function(done) {
    coreServer.Server.prototype.stop.apply(this)
    // `node-ws` has a bug when calling twice `.close()` on server.
    // So we need to remove all event handlers before, calling 'close' on the server
    // because this will trigger 'close' on each of the sockets.
    if (this._wsServer) {
      this._wsServer.clients.forEach(function(s) { s.removeAllListeners() })
      this._wsServer.close()
      this._wsServer = null
      this._queuedSockets = null
    }
    if (done) done()
  },

  configValidator: new coreValidation.ChaiValidator({
    rootUrl: function(val) {
      expect(val).to.be.a('string')
    },
    port: function(val) {
      if (this.serverInstance) return
      expect(val).to.be.a('number')
      expect(val).to.be.within(0, 65535)
    },
    usersLimit: function(val) {
      expect(val).to.be.a('number')
    },
    serverInstance: function(val) {
      if (val)
        expect(val).to.be.an('object')
    }
  }),

  configDefaults: {
    usersLimit: 1000,
    rootUrl: '/'
  },

  _onConnection: function(connection) {
    var self = this

    // Send acknowledgement and connection id to the client
    connection.send(coreMessages.connectionStatusAddress, [ 0, connection.id ])

    // When a connection closes, we start queued connections
    connection.on('close', function() {
      self._queuedSockets.remove(connection._socket)
      var socket = self._queuedSockets.pop()
      if (socket) self._connectIfSpace(socket)
    })
  },

  _connectIfSpace: function(socket) {
    // Parsing the config from the update request
    var socketConfig = parseUrl(socket.upgradeReq.url, true).query
      , queueIfFull = socketConfig.hasOwnProperty('queueIfFull') ? JSON.parse(socketConfig.queueIfFull) : false
      , id = socketConfig.id
      , self = this

    // If there is space on the server, we open the connection.
    if (this.connections.length < this._config.usersLimit) {
      var newConnection = new WebSocketServer.Connection(socket)
      
      // Save os and browser infos
      if (socketConfig.os) {
        newConnection.infos.os = socketConfig.os
        newConnection.infos.browser = socketConfig.browser
      }

      if (_.isString(id))
        newConnection.id = id
      this.open(newConnection)

    // If the server is full, we send a message to the client signaling this.
    } else {
      buf = oscMin.toBuffer({
        address: coreMessages.connectionStatusAddress,
        args: [ 1, 'the server is full' ]
      })
      socket.send(buf)

      if (queueIfFull) {
        debug('queueing - max of ' + this.connections.length + ' connections reached')
        this._queuedSockets.add(socket)
      } else {
        debug('server full - max of ' + this.connections.length + ' connections reached')
        socket.close()
      }
    }
  },

  // Debug function for WebSocketServer
  debug: debug
})



// Class to handle connections from websocket clients.
var WebSocketConnection = function(socket) {
  coreServer.Connection.apply(this)
  this._socket = socket
  this._socket.on('message', this._onMessage.bind(this))
  this._socket.once('close', this.close.bind(this))
}
WebSocketServer.Connection = WebSocketConnection

_.extend(WebSocketConnection.prototype, coreServer.Connection.prototype, {

  namespace: 'websockets',

  autoId: true,

  // Sends a message to the web page.
  // If there is an error, for example the socket is closed, it fails silently.
  send: function(address, args) {
    var buf = oscMin.toBuffer({ address: address, args: args || [] })
    try {
      this._socket.send(buf)
    } catch (err) {
      if (this._socket.readyState !== 'OPEN')
        console.error('web socket not opened, send failed : ' + err)
      else throw err
    }
  },

  // Immediately closes the connection, cleans event handlers, etc ...
  // NB: we don't need to remove the socket from `this.server.clients`, as `node-ws` is handling this.
  close: function() {
    coreServer.Connection.prototype.close.apply(this)
    this._socket.removeAllListeners()
    this._socket.close()
  },

  _onMessage: function(msg, flags) {
    if (flags.binary) {
      msg = oscMin.fromBuffer(msg)
      var address = msg.address, args = _.pluck(msg.args, 'value')
      if (coreMessages.sysAddressRe.exec(address)) this.onSysMessage(address, args)
      else {
        var err = connections.manager.send(address, args)
        if (err) this.send(coreMessages.errorAddress, err)
      }

    } else console.error('expects binary data')
  }

})