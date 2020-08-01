var Doc, MicroEvent;

Doc = function(connection, name, version, type, snapshot) {
  var inflightCallbacks, inflightOp, k, otApply, pendingCallbacks, pendingOp, serverOps, v, xf, _ref,
    _this = this;
  this.name = name;
  this.version = version;
  this.type = type;
  this.snapshot = snapshot;
  if (this.type.compose == null) {
    throw new Error('Handling types without compose() defined is not currently implemented');
  }
  inflightOp = null;
  inflightCallbacks = [];
  pendingOp = null;
  pendingCallbacks = [];
  serverOps = {};
  xf = this.type.transformX || function(client, server) {
    var client_, server_;
    client_ = _this.type.transform(client, server, 'left');
    server_ = _this.type.transform(server, client, 'right');
    return [client_, server_];
  };
  otApply = function(docOp, isRemote) {
    var oldSnapshot;
    oldSnapshot = _this.snapshot;
    _this.snapshot = _this.type.apply(_this.snapshot, docOp);
    _this.emit('change', docOp, oldSnapshot);
    if (isRemote) return _this.emit('remoteop', docOp, oldSnapshot);
  };
  this.flush = function() {
    if (inflightOp === null && pendingOp !== null) {
      inflightOp = pendingOp;
      inflightCallbacks = pendingCallbacks;
      pendingOp = null;
      pendingCallbacks = [];
      return connection.send({
        'doc': _this.name,
        'op': inflightOp,
        'v': _this.version
      }, function(error, response) {
        var callback, oldInflightOp, undo, _i, _j, _len, _len2, _ref;
        oldInflightOp = inflightOp;
        inflightOp = null;
        if (error) {
          if (type.invert) {
            undo = _this.type.invert(oldInflightOp);
            if (pendingOp) {
              _ref = xf(pendingOp, undo), pendingOp = _ref[0], undo = _ref[1];
            }
            otApply(undo, true);
          } else {
            throw new Error("Op apply failed (" + response.error + ") and the OT type does not define an invert function.");
          }
          for (_i = 0, _len = inflightCallbacks.length; _i < _len; _i++) {
            callback = inflightCallbacks[_i];
            callback(error);
          }
        } else {
          if (response.v !== _this.version) {
            throw new Error('Invalid version from server');
          }
          serverOps[_this.version] = oldInflightOp;
          _this.version++;
          for (_j = 0, _len2 = inflightCallbacks.length; _j < _len2; _j++) {
            callback = inflightCallbacks[_j];
            callback(null, oldInflightOp);
          }
        }
        return _this.flush();
      });
    }
  };
  this._onOpReceived = function(msg) {
    var docOp, op, _ref, _ref2;
    if (msg.v < this.version) return;
    if (msg.doc !== this.name) {
      throw new Error("Expected docName '" + this.name + "' but got " + msg.doc);
    }
    if (msg.v !== this.version) {
      throw new Error("Expected version " + this.version + " but got " + msg.v);
    }
    op = msg.op;
    serverOps[this.version] = op;
    docOp = op;
    if (inflightOp !== null) {
      _ref = xf(inflightOp, docOp), inflightOp = _ref[0], docOp = _ref[1];
    }
    if (pendingOp !== null) {
      _ref2 = xf(pendingOp, docOp), pendingOp = _ref2[0], docOp = _ref2[1];
    }
    this.version++;
    return otApply(docOp, true);
  };
  this.submitOp = function(op, callback) {
    if (this.type.normalize != null) op = this.type.normalize(op);
    this.snapshot = this.type.apply(this.snapshot, op);
    if (pendingOp !== null) {
      pendingOp = this.type.compose(pendingOp, op);
    } else {
      pendingOp = op;
    }
    if (callback) pendingCallbacks.push(callback);
    this.emit('change', op);
    return setTimeout(this.flush, 0);
  };
  this.close = function(callback) {
    var _this = this;
    if (connection.socket === null) {
      return typeof callback === "function" ? callback() : void 0;
    }
    connection.send({
      'doc': this.name,
      open: false
    }, function() {
      if (typeof callback === "function") callback();
      _this.emit('closed');
    });
    return this.emit('closing');
  };
  if (this.type.api) {
    _ref = this.type.api;
    for (k in _ref) {
      v = _ref[k];
      this[k] = v;
    }
    if (typeof this._register === "function") this._register();
  } else {
    this.provides = {};
  }
  return this;
};

if (typeof WEB === "undefined" || WEB === null) {
  MicroEvent = require('./microevent');
}

MicroEvent.mixin(Doc);

exports.Doc = Doc;
