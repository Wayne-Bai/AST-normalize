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
 * Date: 4/6/11
 */

"use strict";

var testbench = require(__dirname + '/../TestBench');

var capsela = require('../../');
var Browser = capsela.Browser;
var Request = capsela.Request;
var Response = capsela.Response;
var HttpClientRig = capsela.rigs.HttpClientRig;
var Stage = capsela.Stage;

module.exports["basics"] = {

    setUp: function(cb) {
        HttpClientRig.setUp();

        HttpClientRig.addStage('http', 'www.example.com', 80, new Stage(
            function(request) {
            }
        ));

        cb();
    },

    tearDown: function(cb) {
        HttpClientRig.tearDown();
        cb();
    },

    "test dispatch": function(test) {

        var b = new Browser();
        var request = new Request();

        b.dispatch('www.example.com', request).then(
            function(response) {
                test.done();
            }
        ).done();

        request.bodyStream.end();
    }
};