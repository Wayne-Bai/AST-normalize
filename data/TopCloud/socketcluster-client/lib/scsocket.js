/**
 * Module dependencies.
 */

var Emitter = require('emitter');
var Socket = require('engine.io-client');
var SCChannel = require('./scchannel');

/**
 * Module exports.
 */

if (!Object.create) {
  Object.create = require('./objectcreate');
}

var Response = function (socket, id) {
  this.socket = socket;
  this.id = id;
};

Response.prototype._respond = function (responseData) {
  this.socket.send(this.socket.JSON.stringify(responseData));
};

Response.prototype.end = function (data) {
  if (this.id) {
    var responseData = {
      rid: this.id
    };
    if (data !== undefined) {
      responseData.data = data;
    }
    this._respond(responseData);
  }
};

Response.prototype.error = function (error, data) {
  if (this.id) {
    var err;
    if (error instanceof Error) {
      err = {name: error.name, message: error.message, stack: error.stack};      
    } else {
      err = error;
    }
    
    var responseData = {
      rid: this.id,
      error: err
    };
    if (data !== undefined) {
      responseData.data = data;
    }
    
    this._respond(responseData);
  }
};

Response.prototype.callback = function (error, data) {
  if (error) {
    this.error(error, data);
  } else {
    this.end(data);
  }
};


var SCSocket = function (options) {
  var self = this;
  
  Emitter.call(this);
  
  var opts = {
    autoReconnect: true,
    ackTimeout: 10000
  };
  for (var i in options) {
    opts[i] = options[i];
  }
  opts.path = (opts.path || '/socketcluster').replace(/\/$/, '') + '/';
  
  this.id = null;
  
  this._localEvents = {
    'connect': 1,
    'disconnect': 1,
    'pingTimeout': 1,
    'upgrading': 1,
    'upgrade': 1,
    'upgradeError': 1,
    'open': 1,
    'error': 1,
    'packet': 1,
    'heartbeat': 1,
    'data': 1,
    'raw': 1,
    'message': 1,
    'handshake': 1,
    'drain': 1,
    'flush': 1,
    'packetCreate': 1,
    'close': 1,
    'fail': 1,
    'kickOut': 1,
    'setAuthToken': 1,
    'removeAuthToken': 1,
    'ready': 1
  };
  
  this._persistentEvents = {
    'subscribe': 1,
    'unsubscribe': 1
  };
  
  this._connectAttempts = 0;
  
  this._cid = 1;
  this._callbackMap = {};
  this._destId = null;
  this._emitBuffer = [];
  this._channels = {};
  this._enableAutoReconnect = true;
  this._base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  this._tokenData = null;
  
  this.options = opts;
  
  if (this.options.autoReconnect && this.options.autoReconnectOptions == null) {
    this.options.autoReconnectOptions = {
      delay: 10000,
      randomness: 10000
    };
  }
  
  if (this.options.url == null) {
    Socket.call(this, this.options);
  } else {
    Socket.call(this, this.options.url, this.options);
  }
  
  this.connected = false;
  this.connecting = true;
  
  this._channelEmitter = new Emitter();
};

SCSocket.prototype = Object.create(Socket.prototype);

SCSocket.CONNECTING = SCSocket.prototype.CONNECTING = 'connecting';
SCSocket.OPEN = SCSocket.prototype.OPEN = 'open';
SCSocket.CLOSING = SCSocket.prototype.CLOSING = 'closing';
SCSocket.CLOSED = SCSocket.prototype.CLOSED = 'closed';

SCSocket.prototype.getState = function () {
  if (this.connecting) {
    return this.CONNECTING;
  } else if (this.connected) {
    return this.OPEN;
  }
  return this.CLOSED;
};

SCSocket.prototype._setCookie = function (name, value, expirySeconds) {
  var exdate = null;
  if (expirySeconds) {
    exdate = new Date();
    exdate.setTime(exdate.getTime() + Math.round(expirySeconds * 1000));
  }
  var value = escape(value) + '; path=/;' + ((exdate == null) ? '' : ' expires=' + exdate.toUTCString() + ';');
  document.cookie = name + '=' + value;
};

SCSocket.prototype._getCookie = function (name) {
  var i, x, y, ARRcookies = document.cookie.split(';');
  for (i = 0; i < ARRcookies.length; i++) {
    x = ARRcookies[i].substr(0, ARRcookies[i].indexOf('='));
    y = ARRcookies[i].substr(ARRcookies[i].indexOf('=') + 1);
    x = x.replace(/^\s+|\s+$/g, '');
    if (x == name) {
      return unescape(y);
    }
  }
};

SCSocket.prototype.connect = SCSocket.prototype.open = function () {
  var self = this;
  
  if (!this.connected && !this.connecting) {
    this.connected = false;
    this.connecting = true;
    Socket.prototype.open.apply(this, arguments);
    this._resubscribe();
  }
};

SCSocket.prototype.disconnect = function () {
  this._enableAutoReconnect = false;
  return Socket.prototype.close.apply(this);
};

SCSocket.prototype.onSCOpen = function () {
  this._connectAttempts = 0;
  this._enableAutoReconnect = true;
  
  this.connected = true;
  this.connecting = false;
  
  Emitter.prototype.emit.call(this, 'connect');
  this._flushEmitBuffer();
};

SCSocket.prototype._tryReconnect = function (initialDelay) {
  var self = this;
  
  if (!this.connected && !this.connecting &&
    this.options.autoReconnect && this._enableAutoReconnect) {
    
    this._emitBuffer = [];
    
    var exponent = this._connectAttempts++;
    if (exponent > 5) {
      exponent = 5;
    }

    var timeout;
    if (initialDelay == null || exponent > 0) {
      var reconnectOptions = this.options.autoReconnectOptions;
      var initialTimeout = Math.round(reconnectOptions.delay + (reconnectOptions.randomness || 0) * Math.random());
      timeout = Math.round(initialTimeout * Math.pow(1.5, exponent));
    } else {
      timeout = initialDelay;
    }
    
    clearTimeout(this._reconnectTimeout);
    
    this._reconnectTimeout = setTimeout(function () {
      if (!self.connected && !self.connecting) {
        self.connect();
      }
    }, timeout);
  }
};

SCSocket.prototype.onSCError = function (err) {
  this.connecting = false;
  if (!this.connected) {
    this._tryReconnect();
  }
  if (this.listeners('error').length < 1) {
    setTimeout(function () {
      throw err;
    }, 0);
  }
};

SCSocket.prototype.onSCClose = function (reason) {
  this.id = null;

  this.connected = false;
  this.connecting = false;
  
  var channel, newState;
  for (var channelName in this._channels) {
    channel = this._channels[channelName];
    if (channel.state == channel.SUBSCRIBED ||
      channel.state == channel.PENDING) {
      
      newState = channel.PENDING;
    } else {
      newState = channel.UNSUBSCRIBED;
    }
    this._triggerChannelUnsubscribe(channel, newState);
  }
  if (!this._connectAttempts) {
    if (reason == 'ping timeout') {
      this._tryReconnect(0);
    } else {
      this._tryReconnect();
    }
    Emitter.prototype.emit.call(this, 'disconnect');
  }
};

SCSocket.prototype.onSCMessage = function (message) {
  var obj;
  try {
    obj = this.JSON.parse(message);
  } catch (err) {
    obj = message;
  }
  
  if (obj.event) {
    if (obj.event == 'disconnect') {
      this.connected = false;
      this.connecting = false;
      Emitter.prototype.emit.call(this, 'disconnect');
      
    } else if (obj.event == 'fail') {
      this.connected = false;
      this.connecting = false;
      this.emit('error', obj.data);
      
    } else if (obj.event == 'kickOut') {
      var kickData = obj.data || {};
      var channelName = kickData.channel;
      var channel = this._channels[channelName];
      if (channel) {
        Emitter.prototype.emit.call(this, obj.event, kickData.message, channelName);
        channel.emit(obj.event, kickData.message, channelName);
        this._triggerChannelUnsubscribe(channel);
      }
    } else if (obj.event == 'setAuthToken') {
      var tokenData = obj.data;
      var response = new Response(this, obj.cid);
      
      if (tokenData) {
        this._tokenData = tokenData;
        
        if (tokenData.persistent && tokenData.expiresInMinutes != null) {
          this._setCookie(tokenData.cookieName, tokenData.token, tokenData.expiresInMinutes * 60);
        } else {
          this._setCookie(tokenData.cookieName, tokenData.token);
        }
        Emitter.prototype.emit.call(this, obj.event, tokenData.token);
        response.end();
      } else {
        response.error('No token data provided with setAuthToken event');
      }
    } else if (obj.event == 'removeAuthToken') {
      if (this._tokenData) {
        this._setCookie(this._tokenData.cookieName, null, -1);
        Emitter.prototype.emit.call(this, obj.event);
      }
      var response = new Response(this, obj.cid);
      response.end();
    } else if (obj.event == 'ready') {
      if (obj.data) {
        this.id = obj.data.id;
      }
      Emitter.prototype.emit.call(this, obj.event, obj.data);
    } else if (obj.event == 'pingTimeout') {
      this.onSCClose('ping timeout');
    } else {
      var response = new Response(this, obj.cid);
      Emitter.prototype.emit.call(this, obj.event, obj.data, function (error, data) {
        response.callback(error, data);
      });
    }
  } else if (obj.channel) {
    this._channelEmitter.emit(obj.channel, obj.data);
  } else if (obj.rid != null) {
    var ret = this._callbackMap[obj.rid];
    if (ret) {
      clearTimeout(ret.timeout);
      delete this._callbackMap[obj.rid];
      ret.callback(obj.error, obj.data);
    }
    if (obj.error) {
      this.emit('error', obj.error);
    }
  } else {
    Emitter.prototype.emit.call(this, 'raw', obj);
  }
};

SCSocket.prototype._nextCallId = function () {
  return this._cid++;
};

SCSocket.prototype._isOwnDescendant = function (object, ancestors) {
  for (var i in ancestors) {
    if (ancestors[i] === object) {
      return true;
    }
  }
  return false;
};

SCSocket.prototype._arrayBufferToBase64 = function (arraybuffer) {
  var chars = this._base64Chars;
  var bytes = new Uint8Array(arraybuffer);
  var len = bytes.length;
  var base64 = '';

  for (var i = 0; i < len; i += 3) {
    base64 += chars[bytes[i] >> 2];
    base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
    base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
    base64 += chars[bytes[i + 2] & 63];
  }

  if ((len % 3) === 2) {
    base64 = base64.substring(0, base64.length - 1) + '=';
  } else if (len % 3 === 1) {
    base64 = base64.substring(0, base64.length - 2) + '==';
  }

  return base64;
};

SCSocket.prototype._convertBuffersToBase64 = function (object, ancestors) {
  if (!ancestors) {
    ancestors = [];
  }
  if (this._isOwnDescendant(object, ancestors)) {
    throw new Error('Cannot traverse circular structure');
  }
  var newAncestors = ancestors.concat([object]);
  
  if (typeof ArrayBuffer != 'undefined' && object instanceof ArrayBuffer) {
    return {
      base64: true,
      data: this._arrayBufferToBase64(object)
    };
  }
  
  if (object instanceof Array) {
    var base64Array = [];
    for (var i in object) {
      base64Array[i] = this._convertBuffersToBase64(object[i], newAncestors);
    }
    return base64Array;
  }
  if (object instanceof Object) {
    var base64Object = {};
    for (var j in object) {
      base64Object[j] = this._convertBuffersToBase64(object[j], newAncestors);
    }
    return base64Object;
  }
  
  return object;
};

SCSocket.prototype.parse = function (message) {
  return this.JSON.parse(message);
};

SCSocket.prototype.stringify = function (object) {
  return this.JSON.stringify(this._convertBuffersToBase64(object));
};

SCSocket.prototype._emit = function (eventObject) {
  eventObject.cid = this._nextCallId();
  
  if (eventObject.callback) {
    this._callbackMap[eventObject.cid] = eventObject;
  }
  
  var simpleEventObject = {
    event: eventObject.event,
    data: eventObject.data,
    cid: eventObject.cid
  };
  
  Socket.prototype.send.call(this, this.stringify(simpleEventObject));
};

SCSocket.prototype._flushEmitBuffer = function () {
  var len = this._emitBuffer.length;
  
  for (var i = 0; i < len; i++) {
    this._emit(this._emitBuffer[i]);
  }
  this._emitBuffer = [];
};

SCSocket.prototype.emit = function (event, data, callback) {
  var self = this;
  
  if (this._localEvents[event] == null) {
    if (!this.connected && !this.connecting) {
      this.connect();
    }
    var eventObject = {
      event: event,
      data: data,
      callback: callback
    };
    
    // Persistent events should never timeout.
    // Also, only set timeout if there is a callback.
    if (!this._persistentEvents[event] && callback) {
      eventObject.timeout = setTimeout(function () {
        var error = new Error("Event response for '" + event + "' timed out", eventObject);
        if (eventObject.cid) {
          delete self._callbackMap[eventObject.cid];
        }
        delete eventObject.callback;
        callback(error, eventObject);
        self.emit('error', error);
      }, this.options.ackTimeout);
    }
    this._emitBuffer.push(eventObject);
    if (this.connected) {
      this._flushEmitBuffer();
    }
  } else {
    switch (event) {
      case 'message':
        this.onSCMessage(data);
        break;
        
      case 'open':
        this.onSCOpen();
        break;
        
      case 'close':
        this.onSCClose(data);
        break;

      case 'error':
        this.onSCError(data);
        break;
    }
    Emitter.prototype.emit.call(this, event, data);
  }
};

SCSocket.prototype.publish = function (channelName, data, callback) {
  var self = this;
  
  var pubData = {
    channel: channelName,
    data: data
  };
  this.emit('publish', pubData, function (err) {
    callback && callback(err);
  });
};

SCSocket.prototype.subscribe = function (channelName) {
  var self = this;
  
  var channel = this._channels[channelName];
  
  if (!channel) {
    channel = new SCChannel(channelName, this);
    this._channels[channelName] = channel;
  }

  if (channel.state == channel.UNSUBSCRIBED) {
    channel.state = channel.PENDING;
    this.emit('subscribe', channelName, function (err) {
      if (err) {
        self._triggerChannelSubscribeFail(err, channel);
      } else {
        self._triggerChannelSubscribe(channel);
      }
    });
  }
  
  return channel;
};

SCSocket.prototype.unsubscribe = function (channelName) {

  var channel = this._channels[channelName];
  
  if (channel) {
    if (channel.state != channel.UNSUBSCRIBED) {
    
      this._triggerChannelUnsubscribe(channel);
      
      // The only case in which unsubscribe can fail is if the connection is closed or dies.
      // If that's the case, the server will automatically unsubscribe the client so
      // we don't need to check for failure since this operation can never really fail.
      
      this.emit('unsubscribe', channelName);
    }
  }
};

SCSocket.prototype.channel = function (channelName) {
  var currentChannel = this._channels[channelName];
  
  if (!currentChannel) {
    currentChannel = new SCChannel(channelName, this);
    this._channels[channelName] = currentChannel;
  }
  return currentChannel;
};

SCSocket.prototype.destroyChannel = function (channelName) {
  var channel = this._channels[channelName];
  channel.unwatch();
  channel.unsubscribe();
  delete this._channels[channelName];
};

SCSocket.prototype.subscriptions = function (includePending) {
  var subs = [];
  var channel, includeChannel;
  for (var channelName in this._channels) {
    channel = this._channels[channelName];
    
    if (includePending) {
      includeChannel = channel && (channel.state == channel.SUBSCRIBED || 
        channel.state == channel.PENDING);
    } else {
      includeChannel = channel && channel.state == channel.SUBSCRIBED;
    }
    
    if (includeChannel) {
      subs.push(channelName);
    }
  }
  return subs;
};

SCSocket.prototype.isSubscribed = function (channel, includePending) {
  var channel = this._channels[channel];
  if (includePending) {
    return !!channel && (channel.state == channel.SUBSCRIBED ||
      channel.state == channel.PENDING);
  }
  return !!channel && channel.state == channel.SUBSCRIBED;
};

SCSocket.prototype._triggerChannelSubscribe = function (channel) {
  var channelName = channel.name;
  
  channel.state = channel.SUBSCRIBED;
  
  channel.emit('subscribe', channelName);
  Emitter.prototype.emit.call(this, 'subscribe', channelName);
};

SCSocket.prototype._triggerChannelSubscribeFail = function (err, channel) {
  var channelName = channel.name;
  
  channel.state = channel.UNSUBSCRIBED;
  
  channel.emit('subscribeFail', err, channelName);
  Emitter.prototype.emit.call(this, 'subscribeFail', err, channelName);
};

SCSocket.prototype._triggerChannelUnsubscribe = function (channel, newState) {
  var channelName = channel.name;
  var oldState = channel.state;
  
  if (newState) {
    channel.state = newState;
  } else {
    channel.state = channel.UNSUBSCRIBED;
  }
  if (oldState == channel.SUBSCRIBED) {
    channel.emit('unsubscribe', channelName);
    Emitter.prototype.emit.call(this, 'unsubscribe', channelName);
  }
};

SCSocket.prototype._resubscribe = function (callback) {
  var self = this;
  
  var channels = [];
  for (var channelName in this._channels) {
    channels.push(channelName);
  }
  var error;
  var ackCount = 0;
  
  var ackHandler = function (err, channel) {
    ackCount++;
    
    if (err) {
      self._triggerChannelSubscribeFail(err, channel);
    } else {
      self._triggerChannelSubscribe(channel);
    }
    if (!error) {
      if (err) {
        error = err;
        callback && callback(err);
      } else if (ackCount >= channels.length) {
        callback && callback();
      }
    }
  };
  for (var i in this._channels) {
    (function (channel) {
      if (channel.state == channel.PENDING) {
        self.emit('subscribe', channel.name, function (err) {
          ackHandler(err, channel);
        });
      }
    })(this._channels[i]);
  }
};

SCSocket.prototype.watch = function (channelName, handler) {
  this._channelEmitter.on(channelName, handler);
};

SCSocket.prototype.unwatch = function (channelName, handler) {
  if (handler) {
    this._channelEmitter.removeListener(channelName, handler);
  } else {
    this._channelEmitter.removeAllListeners(channelName);
  }
};

SCSocket.prototype.watchers = function (channelName) {
  return this._channelEmitter.listeners(channelName);
};

if (typeof JSON != 'undefined') {
  SCSocket.prototype.JSON = JSON;
} else {
  SCSocket.prototype.JSON = require('./json').JSON;
}
SCSocket.JSON = SCSocket.prototype.JSON;

module.exports = SCSocket;