/*!
 * Copyright (C) 2011 by the Capsela contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * Author: Seth Purcell
 * Date: Feb 15, 2011
 */

"use strict";

/**
 * high-fidelity mock of a node HTTP response for both server and client purposes.
 * i.e. a response can be created to provide input to a client method or
 * to receive output from a server method
 */

var util = require('util');
var Pipe = require('capsela-util').Pipe;
var StreamUtil = require('capsela-util').StreamUtil;

var EventEmitter = require('events').EventEmitter;
var Stream = require('stream').Stream;

var MockResponse = Pipe.extend({
},
{
    ///////////////////////////////////////////////////////////////////////////////
    /**
     * 
     */
    init: function() {

        this._super();
        this.statusCode = 200;
        this.headers = {};

        this.headWritten = false;

        var t = this;
    },

    ///////////////////////////////////////////////////////////////////////////////
    /**
     * 
     * @param data
     * @param encoding
     */
    write: function(data, encoding) {
    
        if (!this.headWritten) {
            this.writeHead(this.statusCode, this.headers);
        }

        this._super(data, encoding);
    },

    ///////////////////////////////////////////////////////////////////////////////
    /**
     * 
     * @param data
     * @param encoding
     */
    end: function(data, encoding) {

        if (!this.headWritten) {
            this.writeHead(this.statusCode, this.headers);
        }

        this._super(data, encoding);
    },

    ///////////////////////////////////////////////////////////////////////////////
    /**
     * 
     * @param statusCode
     * @param headers
     */
    writeHead: function(statusCode, headers) {

        this.statusCode = statusCode;
        this.headers = headers;
        this.headWritten = true;
        this.emit('head');
    },

    ///////////////////////////////////////////////////////////////////////////////
    /**
     * Sets the given header to the given value.
     *
     * @param name
     * @param value
     */
    setHeader: function(name, value) {

        if (!name) {
            throw new Error("can't set header without name");
        }

        if (!value) {
            throw new Error("can't set header without value");
        }

        this.headers[name.toLowerCase()] = value;
    },

    ///////////////////////////////////////////////////////////////////////////////
    /**
     * Returns the value of the specified header.
     *
     * @param name
     */
    getHeader: function(name) {
        var header = this.headers[name.toLowerCase()];
        return header ? header.value : null;
    }
});

exports.Response = MockResponse;