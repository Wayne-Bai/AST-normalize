// Copyright Lee Harvey Oswald
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var debug;
if (process.env.NODE_DEBUG && /fastcgi/.test(process.env.NODE_DEBUG)) {
    debug = function (x) { console.error('FASTCGI: %s', x); }
} else {
    debug = function () {}
}

function Header() {
    this.version = 0;
    this.type = 0;
    this.recordId = 0;
    this.contentLength = 0;
    this.paddingLength = 0;
};

function Record() {
    this.header = new Header();
    this.body = {};
};

function Parser(socket) {

    const STATE_HEADER = 0;
    const STATE_BODY = 1;
    const STATE_PADDING = 2;

    const FCGI_MAX_BODY = 8;
    const FCGI_HEADER_LEN = 8;

    const FCGI_BEGIN = 1;
    const FCGI_ABORT = 2;
    const FCGI_END = 3;
    const FCGI_PARAMS = 4;
    const FCGI_STDIN = 5;
    const FCGI_STDOUT = 6;
    const FCGI_STDERR = 7;
    const FCGI_DATA = 8;
    const FCGI_GET_VALUES = 9;
    const FCGI_GET_VALUES_RESULT = 10;
    const FCGI_UNKNOWN_TYPE = 11;

    this.state = STATE_HEADER;
    this.records = {};

    this._record = new Record();

    this._loc = 0;
    this._header = [];
    this._body;
    this.socket = socket;
    this.encoding = 'utf8';

    this.pushRecord = function (record) {
        var id = record.header.recordId;
        if (this.records[id] === undefined) {
            this.records[id] = [];
        }
        this.records[id].push(record);
    }

    this.getRecords = function (id) {
        return this.records[id];
    }

    this.execute = function (buffer, offset, length) {
        var bytesRead = 0;
        for (var i = offset; i < length; i++, bytesRead++) {
            switch(this.state) {
                case STATE_HEADER:
                    if(this._header.length == FCGI_HEADER_LEN - 1) {
                        var header = this._record.header;

                        header.version = this._header.shift();
                        header.type = this._header.shift();
                        header.recordId = (this._header.shift() << 8) + this._header.shift();
                        header.contentLength = (this._header.shift() << 8) + this._header.shift();
                        header.paddingLength = this._header.shift();

                        if(this._record.header.contentLength > 0) {
                            this.state = STATE_BODY;
                            this._body = new Buffer(this._record.header.contentLength);
                        } else {
                            this.pushRecord(this._record);
                            if (this._record.header.type == FCGI_STDIN) {
                                this.onHeadersComplete(this._record.header.recordId, this.getRecords(this._record.header.recordId));
                            }
                            this._record = new Record();
                        }
                    } else {
                        this._header.push(buffer[i]);
                    }
                    break;
                case STATE_BODY:
                    if(this._loc == this._record.header.contentLength - 1) {
                        var j = 0;
                        this._body[this._loc] = buffer[i];
                        switch(this._record.header.type) {
                            case FCGI_BEGIN:
                                this._record.body = {
                                    'role': (this._body[j++] << 8) + this._body[j++],
                                    'flags': this._body[j++]
                                };
                                break;
                            case FCGI_ABORT:
                                break;
                            case FCGI_END:
                                this._record.body = {
                                    'status': (this._body[j++] << 24) + (this._body[j++] << 16) + (this._body[j++] << 8) + this._body[j++],
                                    'protocolStatus': this._body[j++]
                                };
                                break;
                            case FCGI_PARAMS:
                            case FCGI_GET_VALUES:
                            case FCGI_GET_VALUES_RESULT:
                                var name = '', value = '', vlen = 0, nlen = 0;
                                this._record.body = {
                                    'params': {}
                                };
                                var rlen = this._record.header.contentLength;
                                while(j < rlen) {
                                    nlen = this._body[j];
                                    if(nlen >> 7 == 1) {
                                        nlen = ((this._body[j++] << 24) + (this._body[j++] << 16) + (this._body[j++] << 8) + this._body[j++]) & 0x7fffffff;
                                    } else {
                                        j++;
                                    }
                                    vlen = this._body[j];
                                    if(vlen >> 7 == 1) {
                                        vlen = ((this._body[j++] << 24) + (this._body[j++] << 16) + (this._body[j++] << 8) + this._body[j++]) & 0x7fffffff;
                                    } else {
                                        j++;
                                    }

                                    if((j + nlen + vlen) <= rlen) {
                                        var nv = this._body.asciiSlice(j, j + nlen + vlen);
                                        j += (nlen + vlen);
                                        name = nv.substring(0, nlen);
                                        value = nv.substring(nlen);
                                        this._record.body.params[name] = value;
                                    } else {
                                        this.onError(new Error('Buffer overflow'));
                                        break;
                                    }
                                }
                                break;
                            case FCGI_STDIN:
                            case FCGI_STDOUT:
                            case FCGI_STDERR:
                            case FCGI_DATA:
                                this._record.body = this._body.toString(this.encoding, 0, this._record.header.contentLength);
                                break;
                            case FCGI_UNKNOWN_TYPE:
                            default:
                                this._record.body = {
                                    'type': this._body[0]
                                }
                                break;
                        }
                        this._loc = 0;
                        if(this._record.header.paddingLength > 0) {
                            this.state = STATE_PADDING;
                        } else {
                            this.pushRecord(this._record);
                            this._record = new Record();
                            this.state = STATE_HEADER;
                        }
                    } else {
                        this._body[this._loc++] = buffer[i];
                    }
                    break;
                case STATE_PADDING:
                    if(this._loc++ == this._record.header.paddingLength - 1) {
                        this.state = STATE_HEADER;
                        this._loc = 0;
                        this.pushRecord(this._record);
                        this._record = new Record();
                    }
                    break;
            }
        }

        return bytesRead;
    }
}

exports.Parser = Parser;

