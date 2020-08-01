var Writable = require('stream').Writable;
var inherits = require('util').inherits;

inherits(Response, Writable);
module.exports = Response;

var STATUS_CODES = {
    200: 'OK'
    // ...etc...
};

var ZEROCRLFx2 = Buffer('0\r\n\r\n');
var CRLF = Buffer('\r\n');
var CRLFx2 = Buffer('\r\n\r\n');

function Response (req) {
    Writable.call(this);
    this.statusCode = 200;
    this._request = req;
    this._headers = {};
    this._headerKeys = {};
    
    this.setHeader('Date', new Date().toGMTString());
    
    // todo: check the req.headers and req.httpVersion first
    this.setHeader('Connection', 'keep-alive');
    this.setHeader('Transfer-Encoding', 'chunked');
    
    this.on('finish', this._finishEncode);
}

Response.prototype.setHeader = function (key, value) {
    var lkey = key.toLowerCase();
    this._headers[lkey] = value;
    this._headerKeys[lkey] = key;
};

Response.prototype.removeHeader = function (key) {
    var lkey = key.toLowerCase();
    delete this._headers[lkey];
    delete this._headerKeys[lkey];
};

Response.prototype.writeHead = function (code, msg, headers) {
    this.statusCode = code;
    
    if (typeof msg === 'string') {
        this.statusMessage = msg;
    }
    else headers = msg;
    
    if (headers && typeof headers === 'object') {
        var keys = Object.keys(headers);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            this.setHeader(key, headers[key]);
        }
    }
};

Response.prototype._getHeader = function (key) {
    var lkey = key.toLowerCase();
    return this._headers[lkey];
};

Response.prototype._getHeaderBuffer = function () {
    var req = this._request;
    var keys = Object.keys(this._headers);
    var code = this.statusCode;
    
    var lines = [
        'HTTP/' + req.httpVersion + ' ' + code + ' '
        + (this.statusMessage || STATUS_CODES[code])
    ];
    
    for (var i = 0, len = keys.length; i < len; i++) {
        var key = keys[i];
        lines.push(this._headerKeys[key] + ': ' + this._headers[key]);
    }
    
    return Buffer(lines.join('\r\n') + '\r\n\r\n');
}

Response.prototype._write = function (buf, enc, next) {
    this._buffer = this._encode(buf);
    this._next = next;
    
    if (this._ondata) {
        this._ondata();
        this._ondata = null;
    }
};

Response.prototype._encode = function (buf) {
    var enc = this._getHeader('transfer-encoding');
    if (enc === 'chunked') {
        var pre = buf.length.toString(16) + '\r\n';
        return [ Buffer(pre), buf, CRLF ];
    }
    return buf;
};

Response.prototype._finishEncode = function () {
    var enc = this._getHeader('transfer-encoding');
    this._finished = true;
    
    if (enc !== 'chunked') return;
    
    if (this._buffer) {
        // does this case ever happen?
        if (Array.isArray(this._buffer)) {
            this._buffer.push(ZEROCRLFx2);
        }
        else {
            this._buffer = [ this._buffer, ZEROCRLFx2 ];
        }
    }
    else {
        this._buffer = ZEROCRLFx2;
    }
    if (this._ondata) this._ondata();
    
    if (this._onfinish) this._onfinish();
};
