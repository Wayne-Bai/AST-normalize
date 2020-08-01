var vows = require('vows'),
    assert = require('assert');

var util = require('util');
var events = require('events');

var Settings = require('../lib/settings').Settings;
var Node = require('../lib/node').Node;
var Peer = require('../lib/peer').Peer;
var Util = require('../lib/util');
var Step = require('step');
var encodeHex = Util.encodeHex;

vows.describe('Network Simulation').addBatch({
  'A simulated Bitcoin network': {
    topic: function () {
      var net = {};
      Step(
        function createServerStep() {
          var settings = getSettings('server');
          createNode(settings, this);
        },
        function indexServerStep(err, server) {
          if (err) throw err;
          net.server = server;
          this(null);
        },
        function createClientStep(err) {
          if (err) throw err;
          var settings = getSettings('client');
          createNode(settings, this);
        },
        function indexClientStep(err, client) {
          if (err) throw err;
          net.client = client;
          this(null);
        },
        function connectNodesStep(err) {
          if (err) throw err;
          var callback = this;
          connectNodes(net.server, net.client);
          net.client.getPeerManager().once('connect', function () {
            callback(null);
          });
        },
        function finalStep(err) {
          if (err) throw err;
          this(null, net);
        },
        this.callback
      );
      return;
    },
    'has a server node': function (topic) {
      assert.instanceOf(topic.server, Node);
    },
    'has a client node': function (topic) {
      assert.instanceOf(topic.client, Node);
    }
  }
}).export(module);

function getSettings(prefix) {
  var settings = new Settings();
  settings.setUnitnetDefaults();
  settings.storage.uri = 'leveldb:///tmp/unittest_simnet_'+prefix;
  settings.jsonrpc.enable = false;
  settings.network.noListen = true;
  return settings;
};

function createNode(settings, callback) {
  try {
    var node = new Node(settings);
    node.on('stateChange', function (e) {
      if (e.newState == 'netConnect') {
        node.removeListener('stateChange', arguments.callee);
        callback(null, node);
      }
    });
    node.start();
  } catch (err) {
    callback(err);
  }
};

function connectNodes(a, b) {
  var conn = new MockConnection();
  a.getPeerManager().addConnection(conn.getServerSocket(), new Peer('1.0.0.1'));
  b.getPeerManager().addConnection(conn.getClientSocket(), new Peer('1.0.0.2'));
  conn.connect();
};

var MockConnection = function () {
  this.server = new MockSocket();
  this.client = new MockSocket();
  this.server.setPeer(this.client);
  this.client.setPeer(this.server);
  this.server.server = true;
};

MockConnection.prototype.getServerSocket = function getServerSocket() {
  return this.server;
};

MockConnection.prototype.getClientSocket = function getServerSocket() {
  return this.client;
};

MockConnection.prototype.connect = function connect() {
  this.server.emit('connect');
  this.client.emit('connect');
};

var MockSocket = function () {
  events.EventEmitter.call(this);

  this.server = false;
  this.peer = null;
};

util.inherits(MockSocket, events.EventEmitter);

MockSocket.prototype.setPeer = function setPeer(peer) {
  this.peer = peer;
};

MockSocket.prototype.write = function write(data) {
  var self = this;
  process.nextTick(function () {
    // TODO: Add some wonky splitting and mixing of data packets.
    self.peer.emit('data', data);
  });
};

MockSocket.prototype.end = function end() {
  this.emit('end');
  this.peer.emit('end');
};

MockSocket.prototype.destroy = function destroy() {
  this.write = function () {};
  this.peer.write = function () {};
  this.end();
};
