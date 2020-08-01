var Parser = require("./fastcgi_parser");
var STATUS_CODES = require('http').STATUS_CODES;

var FCGI_BEGIN = Parser.constants.record.FCGI_BEGIN;
var FCGI_PARAMS = Parser.constants.record.FCGI_PARAMS;
var FCGI_STDIN = Parser.constants.record.FCGI_STDIN;
var FCGI_END = Parser.constants.record.FCGI_END;
var FCGI_STDOUT = Parser.constants.record.FCGI_STDOUT;
var FCGI_MAX_BODY = Parser.constants.general.FCGI_MAX_BODY - 16;

var requests = 0;
var writer = new Parser.writer();
writer.encoding = "binary";

var msgHeader = {
    "version": Parser.constants.version,
    "type": Parser.constants.record.FCGI_STDOUT,
    "recordId": 0,
    "contentLength": 0,
    "paddingLength": 0
};

var msgStatus = {
    "status": 0,
    "protocolStatus": 200
};

function ServerResponse(so, rId) {
    this.socket = so;
    this.recordId = rId;
    this.statusCode = 0;
    this.closed = false;
}

ServerResponse.prototype._writeRaw = function(buffer) {
    if(this.socket.writable) {
        this.socket.write(buffer);
    } else {
        this.closed = true;
    }
};

ServerResponse.prototype.writeHead = function(statusCode) {
    if(this.closed) return false;
    
    this.statusCode = statusCode;
    var reasonPhrase = STATUS_CODES[statusCode] || 'unknown';
    var body = 'HTTP/1.1 ' + statusCode +  ' ' + reasonPhrase + '\r\nConnection: close\r\nContent-Type: text/plain\r\n\r\n';
    
    msgHeader.type = FCGI_STDOUT;
    msgHeader.recordId = this.recordId;
    msgHeader.contentLength = body.length;
    writer.writeHeader(msgHeader);
    writer.writeBody(new Buffer(body));
    this._writeRaw(writer.tobuffer());
};

ServerResponse.prototype.write = function(chunk) {
    if(this.closed) return false;

    if(typeof chunk === 'string') {
        chunk = new Buffer(chunk);
    } else {
        if(!Buffer.isBuffer(chunk)) {
            return false;
        }
    }
    if(chunk.length === 0) return false;

    msgHeader.type = FCGI_STDOUT;
    msgHeader.recordId = this.recordId;

    if(chunk.length > FCGI_MAX_BODY) {
        var length = chunk.length;
        var len = 0;
        var pos = 0;
        var body;
        while(length > 0) {
            if(length > FCGI_MAX_BODY) {
                len = FCGI_MAX_BODY;
            } else {
                len = length;
            }
            body = chunk.slice(pos, pos+len);
            pos += len;
            length -= len;

            msgHeader.contentLength = len;
            writer.writeHeader(msgHeader);
            writer.writeBody(body);
            this._writeRaw(writer.tobuffer());
        }
    } else {
        msgHeader.contentLength = chunk.length;
        writer.writeHeader(msgHeader);
        writer.writeBody(chunk);
        this._writeRaw(writer.tobuffer());
    }
};

ServerResponse.prototype.end = function() {
    if(this.closed) return false;

    msgHeader.type = FCGI_STDOUT;
    msgHeader.recordId = this.recordId;
    msgHeader.contentLength = 0;
    writer.writeHeader(msgHeader);
    this._writeRaw(writer.tobuffer());

    msgStatus.protocolStatus = this.statusCode;
    msgHeader.type = FCGI_END;
    msgHeader.contentLength = 8;
    writer.writeHeader(msgHeader);
    writer.writeEnd(msgStatus);
    this._writeRaw(writer.tobuffer());

    this.socket.end();
};

function connectionListener(socket) {
    var self = this;

    socket.setTimeout(2 * 60 * 1000);
    socket.setNoDelay(false);

    var req = null;
    var parser = new Parser.parser();
    parser.encoding = "binary";

    parser.onError = function(exception) {
        console.log(JSON.stringify(exception, null, "\t"));
    };

    parser.onRecord = function(record) {
        switch(record.header.type) {
        case FCGI_BEGIN:
            req = {};
            req.headers = {};
            req.connection = {};
            break;
        case FCGI_PARAMS:
            if(record.header.contentLength !== 0) {
                var params = record.body.params;
                if(params.REQUEST_METHOD) {
                    req.method = params.REQUEST_METHOD;
                }
                if(params.SERVER_PROTOCOL) {
                    var version = params.SERVER_PROTOCOL.split('/');
                    if(version.length == 2) {
                        version = version[1].split('.');
                        if(version.length == 2) {
                            req.httpVersionMajor = parseInt(version[0]);
                            req.httpVersionMinor = parseInt(version[1]);
                            req.httpVersion = version[0] + '.' + version[1];
                        }
                    }
                }
                if(params.DOCUMENT_URI) {
                    req.url = params.DOCUMENT_URI;
                } else {
                    req.url = '/';
                }
                if(params.QUERY_STRING) {
                    req.url += '?';
                    req.url += params.QUERY_STRING;
                }
                if(params.HTTP_COOKIE) {
                    req.headers.cookie = params.HTTP_COOKIE;
                }
                if(params.REMOTE_ADDR) {
                    req.connection.remoteAddress = params.REMOTE_ADDR; 
                }
            }
            break;
        case FCGI_STDIN:
            if(record.header.contentLength == 0) {
                requests++;
                var res = new ServerResponse(socket, record.header.recordId);
                self.emit('request', req, res);
            }
            break;
        }
    };
		
    socket.ondata = function (buffer, start, end) {
        parser.execute(buffer, start, end);
    };

    socket.onend = function () {
    }

    socket.addListener('timeout', function () {
        socket.destroy();
    });

    socket.addListener('error', function (e) {
        console.error("fastcgi:" + e.stack);
    });

    socket.addListener('close', function () {
    });
}

function Server(requestListener) {
    if (!(this instanceof Server)) {
        return new Server(requestListener);
    }

    if (requestListener) {
        this.addListener('request', requestListener);
    }

    this.addListener('connection', connectionListener);
}
require('util').inherits(Server, require('net').Server);

exports.createServer = function (requestListener) {
    return new Server(requestListener);
}

