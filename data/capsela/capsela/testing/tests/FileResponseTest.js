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
 * Date: 11/8/11
 */

"use strict";

var testbench = require(__dirname + '/../TestBench');
var MonkeyPatcher = require('capsela-util').MonkeyPatcher;
var Pipe = require('capsela-util').Pipe;
var fs = require('fs');
var qfs = require('q-io/fs');
var mp = new MonkeyPatcher();
var Q = require('q');

var FileResponse = require('../../').FileResponse;

var fileStats = {
    size: 527,
    isFile: function() { return true; }
};

fileStats.lastModified = function () {
    return new Date(72000);
};

var dirStats = {
    size: 527,
    isFile: function() { return false; }
};

dirStats.lastModified = function () {
    return new Date(72000);
};

module.exports["basics"] = {

    tearDown: function(cb) {
        mp.tearDown();
        cb();
    },

    "test create non-file": function(test) {


        mp.patch(qfs, 'stat', function(path) {
            test.equal(path, '/images/sunrise.jpg');
            return Q.resolve(dirStats);
        });

        FileResponse.create('/images/sunrise.jpg').then(null,
            function(err) {

                test.equal(err.message, "file not found or something, man");
                test.done();
            }).done();
    },

    "test create success": function(test) {
        
        mp.patch(qfs, 'stat', function(path) {
            test.equal(path, '/images/sunrise.jpg');
            return Q.resolve(fileStats);
        });

        FileResponse.create('/images/sunrise.jpg').then(
            function(response) {

                test.equal(response.getContentType(), 'image/jpeg');
                test.equal(response.getHeader('content-length'), 527);
                test.equal(response.getLastModified().getTime(), 72000);

                test.done();
            }).done();
    },

    "test write body": function(test) {

        var pipe = new Pipe();
        var bodyBuffer = new Pipe(true);

        mp.patch(qfs, 'stat', function(path) {
            test.equal(path, '/images/sunrise.jpg');
            return Q.resolve(fileStats);
        });

        mp.patch(fs, 'createReadStream', function(path) {
            test.equal(path, '/images/sunrise.jpg');
            return pipe;
        });

        FileResponse.create('/images/sunrise.jpg').then(
            function(r) {

                test.equal(r.getContentType(), 'image/jpeg');
                test.equal(r.getHeader('content-length'), 527);
                test.equal(r.getLastModified().getTime(), 72000);

                r.sendBody(bodyBuffer);

                pipe.end('oh my goodness!');

                return bodyBuffer.getData();
            }
        ).then(
            function(data) {

                test.equal(data.toString(), 'oh my goodness!');
                test.done();
            }).done();
    }
};