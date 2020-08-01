var util = require('./util'),
restify = require('restify'),
EventEmitter = require('events').EventEmitter,
io = require('socket.io'),
mongoose = require('mongoose');

function NodetronServer(options) {
  if (!(this instanceof NodetronServer)) return new NodetronServer(options);
  EventEmitter.call(this);

  // Server Options defaults; overwritten by passed in options if available
  this._options = util.extend({
    port: process.env.PORT || 80,
    debug: false,
    key: 'default',
    ipLimit: 5000,
    concurrentLimit: 5000,
    ssl: {},
    mongo: 'mongodb://localhost/nodetron',
    userSchema: {use: false, path: null},
    transports: ['websocket', 'htmlfile', 'xhr-polling', 'jsonp-polling'],
  }, options);

  util.debug = this._options.debug;

  //Determine to use auto schema or user defined schema
  if (!this._options.userSchema.use) {
    this.peerSchema = require('./models/Peer.js');
  }else {
    this.peerSchema = require(this._options.userSchema.path);
  }

  // Connect to user specified or automatic db
  mongoose.connect(this._options.mongo);
  var db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));

  // Set up HTTPS server if key and certificate are provided.
  var secure = this._options.ssl.key && this._options.ssl.certificate;
  // Print warning if only one of the two is given.
  if (Object.keys(this._options.ssl).length === 1) {
    util.prettyError('Warning: NodetronServer will not run on an HTTPS server'
        + ' because either the key or the certificate has not been provided.');
  }

  this._options.ssl['name'] = 'NodetronServer';
  this._app = restify.createServer(this._options.ssl);
  // Connected clients
  this._clients = {};

  // Messages waiting for another peer.
  this._outstanding = {};

  // Initailize WebSocket server handlers.
  this._initializeSIS();

  // Initialize HTTP routes. This is only used for the first few milliseconds
  // before a socket is opened for a Peer.
  this._initializeHTTP();
  // Mark concurrent users per ip
  this._ips = {};

  this._setCleanupIntervals();
}

util.inherits(NodetronServer, EventEmitter);

// Initialize Socket IO server.
NodetronServer.prototype._initializeSIS = function() {
  var self = this;

  this.sio = io.listen(this._app);
  this.sio.set('transports', this._options.transports);

  this.sio.sockets.on('connection', function(socket) {
    // Login socket event
    socket.on('login', function(data) {
      var id = data.id,
      token = data.token,
      key = data.key,
      ip = socket.manager.handshaken[socket.id].address.address,
      meta = data.metadata;
      util.log('Socket Open: ', id);

      if (!id || !token || !key) {
        socket.send(JSON.stringify({ type: 'ERROR', payload: { msg: 'No id, token, or key supplied to websocket server' } }));
        socket.disconnect();
        return;
      }

      // Insert client into client list
      if (!self._clients[key] || !self._clients[key][id]) {
        self._checkKey(key, ip, function(err) {
          if (!err) {
            if (!self._clients[key][id]) {
              self._clients[key][id] = { token: token, ip: ip };
              self._ips[ip]++;
              socket.send(JSON.stringify({ type: 'OPEN' }));
            }
            self._configureWS(socket, key, id, token);
          } else {
            socket.send(JSON.stringify({ type: 'ERROR', payload: { msg: err } }));
          }
        });
      } else {
        self._configureWS(socket, key, id, token);
      }

      // Insert metadata into db for user discovery
      self.dbHandler.insert(meta, id, self);

      // Send current client list to all peers on peer login
      self.sio.sockets.emit('users', JSON.stringify(self._clients, function(key, value) {
        if (key === 'res' || key === 'socket') {
          return;
        }
        return value;
      }));
    });
  });
};

NodetronServer.prototype._configureWS = function(socket, key, id, token) {
  var self = this,
  client = this._clients[key][id];

  if (token === client.token) {
    // res 'close' event will delete client.res for us
    client.socket = socket;
    // Client already exists
    if (client.res) {
      client.res.end();
    }
  } else {
    // ID-taken, invalid token
    socket.send(JSON.stringify({ type: 'ID-TAKEN', payload: { msg: 'ID is taken' } }));
    socket.disconnect();
    return;
  }

  this._processOutstanding(key, id);

  // Cleanup after a socket closes.
  socket.on('disconnect', function() {
    util.log('Socket closed:', id);
    if (client.socket === socket) {
      self._removePeer(key, id);
    }
    // Resend current client list to all peers on peer disconnect
    self.sio.sockets.emit('users', JSON.stringify(self._clients, function(key, value) {
      if (key === 'res' || key === 'socket') {
        return;
      }
      return value;
    }));
  });

  // User query sent from client
  socket.on('query_for_user', function(data) {
    self.dbHandler.query(data.queryParam, data.queryId, socket);
  });

  // User metadata update sent from client
  socket.on('update_metadata', function(data) {
    self.dbHandler.update(data.id, data.metadata);
  });

  // Handle messages from peers.
  socket.on('nodetron', function(message) {
    try {
      switch (message.type) {
        case 'LEAVE':
          // Clean up if a Peer sends a LEAVE.
          if (!message.dst) {
            self._removePeer(key, id);
            break;
          }
        // ICE candidates
        case 'CANDIDATE':
        // Offer or answer between peers.
        case 'OFFER':
        case 'ANSWER':
          // Use the ID we know to be correct to prevent spoofing.
          self._handleTransmission(key, {
            type: message.type,
            src: id,
            dst: message.dst,
            payload: message.payload
          });
          break;
        default:
          util.prettyError('Message unrecognized');
      }
    } catch(e) {
      util.log('Invalid message', data);
      util.prettyError(e);
    }
  });
};

// checks that proper api key is provided, initializes and updates the cache of client/outstanding keys
// stores ips
NodetronServer.prototype._checkKey = function(key, ip, cb) {
  if (key === this._options.key) {
    if (!this._clients[key]) {
      this._clients[key] = {};
    }
    if (!this._outstanding[key]) {
      this._outstanding[key] = {};
    }
    if (!this._ips[ip]) {
      this._ips[ip] = 0;
    }
    // Check concurrent limit
    if (Object.keys(this._clients[key]).length >= this._options.concurrentLimit) {
      cb('Server has reached its concurrent user limit');
      return;
    }
    if (this._ips[ip] >= this._options.ipLimit) {
      cb(ip + ' has reached its concurrent user limit');
      return;
    }
    cb(null);
  } else {
    cb('Invalid key provided');
  }
};

// Initialize HTTP server routes.
NodetronServer.prototype._initializeHTTP = function() {
  var self = this;

  // maps posted data to req.body instead of req.params
  this._app.use(restify.bodyParser({ mapParams: false }));
  this._app.use(restify.queryParser());
  this._app.use(util.allowCrossDomain);

  // Server sets up HTTP streaming when you get post an ID.
  this._app.post('/:key/:id/:token/id', function(req, res, next) {
    var id = req.params.id,
    token = req.params.token,
    key = req.params.key,
    ip = req.connection.remoteAddress;

    if (!self._clients[key] || !self._clients[key][id]) {
      self._checkKey(key, ip, function(err) {
        if (!err && !self._clients[key][id]) {
          self._clients[key][id] = { token: token, ip: ip };
          self._ips[ip]++;
          self._startStreaming(res, key, id, token, true);
        } else {
          res.send(JSON.stringify({ type: 'HTTP-ERROR' }));
        }
      });
    } else {
      self._startStreaming(res, key, id, token);
    }
    return next();
  });

  var handle = function(req, res, next) {
    var key = req.params.key,
    id = req.params.id,
    client;

    if (!self._clients[key] || !(client = self._clients[key][id])) {
      if (req.params.retry) {
        res.send(401);
      } else {
        // Retry this request
        req.params.retry = true;
        setTimeout(handle, 25, req, res);
      }
      return;
    }

    // Auth the req
    if (req.params.token !== client.token) {
      res.send(401);
      return;
    } else {
      self._handleTransmission(key, {
        type: req.body.type,
        src: id,
        dst: req.body.dst,
        payload: req.body.payload
      });
      res.send(200);
    }
    return next();
  };

  this._app.post('/:key/:id/:token/offer', handle);

  this._app.post('/:key/:id/:token/candidate', handle);

  this._app.post('/:key/:id/:token/answer', handle);

  this._app.post('/:key/:id/:token/leave', handle);

  // Listen on user-specified port.
  this._app.listen(this._options.port);
};

// Saves a streaming response and takes care of timeouts and headers.
NodetronServer.prototype._startStreaming = function(res, key, id, token, open) {
  var self = this;

  res.writeHead(200, {'Content-Type': 'application/octet-stream'});

  var pad = '00';
  for (var i = 0; i < 10; i++) {
    pad += pad;
  }
  res.write(pad + '\n');

  if (open) {
    res.write(JSON.stringify({ type: 'OPEN' }) + '\n');
  }

  var client = this._clients[key][id];

  if (token === client.token) {
    // Client already exists
    res.on('close', function() {
      if (client.res === res) {
        if (!client.socket) {
          // No new request yet, peer dead
          self._removePeer(key, id);
          return;
        }
        delete client.res;
      }
    });
    client.res = res;
    this._processOutstanding(key, id);
  } else {
    // ID-taken, invalid token
    res.end(JSON.stringify({ type: 'HTTP-ERROR' }));
  }
};

NodetronServer.prototype._pruneOutstanding = function() {
  var keys = Object.keys(this._outstanding);
  for (var k = 0, kk = keys.length; k < kk; k += 1) {
    var key = keys[k];
    var dsts = Object.keys(this._outstanding[key]);
    for (var i = 0, ii = dsts.length; i < ii; i += 1) {
      var offers = this._outstanding[key][dsts[i]];
      var seen = {};
      for (var j = 0, jj = offers.length; j < jj; j += 1) {
        var message = offers[j];
        if (!seen[message.src]) {
          this._handleTransmission(key, { type: 'EXPIRE', src: message.dst, dst: message.src });
          seen[message.src] = true;
        }
      }
    }
    this._outstanding[key] = {};
  }
};

// Cleanup
NodetronServer.prototype._setCleanupIntervals = function() {
  var self = this;

  // Clean up ips every 10 minutes
  setInterval(function() {
    var keys = Object.keys(self._ips);
    for (var i = 0, ii = keys.length; i < ii; i += 1) {
      var key = keys[i];
      if (self._ips[key] === 0) {
        delete self._ips[key];
      }
    }
  }, 600000);

  // Clean up outstanding messages every 5 seconds
  setInterval(function() {
    self._pruneOutstanding();
  }, 5000);
};

// Process outstanding peer offers.
NodetronServer.prototype._processOutstanding = function(key, id) {
  var offers = this._outstanding[key][id];
  if (!offers) {
    return;
  }
  for (var j = 0, jj = offers.length; j < jj; j += 1) {
    this._handleTransmission(key, offers[j]);
  }
  delete this._outstanding[key][id];
};

// Remove peer from client list
NodetronServer.prototype._removePeer = function(key, id) {
  if (this._clients[key] && this._clients[key][id]) {
    this._ips[this._clients[key][id].ip]--;
    delete this._clients[key][id];
  }
};

// Handles passing on a message.
NodetronServer.prototype._handleTransmission = function(key, message) {
  var type = message.type,
  src = message.src,
  dst = message.dst,
  data = JSON.stringify(message),
  destination = this._clients[key][dst];

  // User is already connected!
  if (destination) {
    try {
      util.log(type, 'from', src, 'to', dst);
      if (destination.socket) {
        // WARNING: data must be a string
        destination.socket.send(data);
      } else if (destination.res) {
        data += '\n';
        destination.res.write(data);
      } else {
        // Neither socket nor res available. Peer dead?
        util.prettyError('Peer dead!'); //previously was a throw
      }
    } catch (e) {
      // This happens when a peer disconnects without closing connections and
      // the associated WebSocket has not closed.
      util.prettyError(e);
      // Tell other side to stop trying.
      this._removePeer(key, dst);
      this._handleTransmission(key, {
        type: 'LEAVE',
        src: dst,
        dst: src
      });
    }
  } else {
    // Wait for this client to connect/reconnect (XHR) for important
    // messages.
    if (type !== 'LEAVE' && type !== 'EXPIRE' && !!dst) {
      if (!this._outstanding[key][dst]) {
        this._outstanding[key][dst] = [];
      }
      this._outstanding[key][dst].push(message);
    } else if (type === 'LEAVE' && !dst) {
      this._removePeer(key, src);
    } else {
      // Unavailable destination specified with message LEAVE or EXPIRE
      // Ignore
    }
  }
};

NodetronServer.prototype.dbHandler = {
  // Insert metadata into db
  insert: function(meta, id, self) {
    // Automated Schema
    if (!self._options.userSchema.use) {
      meta.clientId = id;
      var schemaObject = {};

      // Check if value is an array
      Array.prototype.isArray = true;
      // Set up schema paths to add
      for(var key in meta) {
        if (meta[key].isArray) {
          schemaObject[key] = 'array';
        }else {
          schemaObject[key] = typeof(meta[key]);
        }
      }

      // Add to schema based on metadata passed up
      self.peerSchema.add(schemaObject);
      Peer = mongoose.model('Peer', self.peerSchema);

      Peer.findOneAndUpdate({clientId: meta.clientId}, meta, {upsert: true}, function(err, data) {
        if (err) console.log(err);
      });
    // Pre defined Schema
    }else {
      Peer = mongoose.model('Peer', self.peerSchema);
      meta.clientId = id;
      Peer.findOneAndUpdate({clientId: meta.clientId}, meta, {upsert: true}, function(err, data) {
        if (err) console.log(err);
      });
    }
  },

  // Query for other connected peers based on metadata
  query: function(param, id, socket) {
    var response = {};
    response.queryId = id;
    Peer.find(param, function(err, users) {
      if (err) {
        console.log(err);
      } else {
        response.users = users;
        socket.emit('query_response', response);
      }
    });
  },

  // Update user metadata
  update: function(id, meta) {
    Peer.findOneAndUpdate({'clientId': id}, meta, function(err, data) {
      if (err) console.log(err);
    });
  }
};

exports.NodetronServer = NodetronServer;
