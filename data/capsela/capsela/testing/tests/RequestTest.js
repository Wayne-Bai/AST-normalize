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
 * Date: Mar 4, 2011
 */

"use strict";

var testbench = require('../TestBench');
var querystring = require('querystring');
var Pipe = require('capsela-util').Pipe;
var fs = require('fs');

var capsela = require('../../');
var Request = capsela.Request;
var Form = capsela.Form;
var Log = require('capsela-util').Log;
var MonkeyPatcher = require('capsela-util').MonkeyPatcher;

var mp = new MonkeyPatcher();

var now = new Date(1980, 1, 22).getTime();

module.exports["methods"] = {

    "test get": function(test) {
        
        var request = new Request();
        test.ok(request.isGet());

        request = new Request('GET');
        test.ok(request.isGet());

        request = new Request('get');
        test.ok(request.isGet());

        test.done();
    },

    "test post": function(test) {
        var request = new Request('POST');
        test.ok(request.isPost());
        test.done();
    },

    "test put": function(test) {
        var request = new Request('PUT');
        test.ok(request.isPut());
        test.done();
    },

    "test delete": function(test) {
        var request = new Request('DELETE');
        test.ok(request.isDelete());
        test.done();
    },

    "test head": function(test) {
        var request = new Request('HEAD');
        test.ok(request.isHead());
        test.done();
    }
};

module.exports["basics"] = {

    setUp: function(cb) {
        mp.patch(Date, 'now', function() {
            return now;
        });
        
        cb();
    },

    tearDown: function(cb) {
        mp.tearDown();
        cb();
    },

    "test init secure": function(test) {
        
        var request = new Request(null, null, null, null, 'https');

        test.ok(request.isSecure());
        test.equal(request.getPskId(), undefined);
        test.equal(request.psk, undefined);

        test.done();
    },

    "test init with PSK": function(test) {

        var request = new Request(null, null, null, null, null, 'sam', 'iam');

        test.equal(request.getPskId(), 'sam');
        test.equal(request.psk, 'iam');

        test.done();
    },

    "test create/elapsed": function(test) {

        var r = new Request();

        test.equal(r.inception, now);
        test.equal(r.getElapsedTime(), 0);

        now += 100;

        test.equal(r.getElapsedTime(), 100);

        now += 900;

        test.equal(r.getElapsedTime(), 1000);

        now += 85400;

        test.equal(r.getElapsedTime(), 86400);

        test.done();
    },

    "test getBaseUrl": function(test) {

        var request = new Request('GET', null, {host: 'www.example.com'});

        test.equal(request.getBaseUrl(), 'http://www.example.com');

        test.done();
    },

    "test getBaseUrl secure": function(test) {

        var request = new Request('GET', null, {host: 'www.example.com'}, null, 'https');

        test.equal(request.getBaseUrl(), 'https://www.example.com');

        test.done();
    },

    "test getRelativeUrl": function(test) {

        var request = new Request('GET', null, {host: 'www.example.com'});

        test.equal(request.getRelativeUrl(), 'http://www.example.com/');
        test.equal(request.getRelativeUrl('who/where'), 'http://www.example.com/who/where');
        test.equal(request.getRelativeUrl('/what'), 'http://www.example.com/what');

        request = new Request('GET', '/why/when', {host: 'www.example.com'});

        test.equal(request.getRelativeUrl(), 'http://www.example.com/why/when');
        test.equal(request.getRelativeUrl('who/where'), 'http://www.example.com/why/who/where');
        test.equal(request.getRelativeUrl('/what'), 'http://www.example.com/what');

        request = new Request('GET', '/why/when/', {host: 'www.example.com'});

        test.equal(request.getRelativeUrl(), 'http://www.example.com/why/when/');
        test.equal(request.getRelativeUrl('who/where'), 'http://www.example.com/why/when/who/where');
        test.equal(request.getRelativeUrl('/what'), 'http://www.example.com/what');

        test.done();
    },

    "test create no headers": function(test) {

        Request.nextId = 47;

        var params = {login: 'testing27@example.com', password: "chin chilla"};
        var request = new Request(
                'GET',
                '/%E0%A4%B5%E0%A4%BE%E0%A4%B0%E0%A4%BE%E0%A4%A3%E0%A4%B8%E0%A5%80?' + querystring.stringify(params),
                null, null);

        test.equal(request.id, 47);
        test.equal(Request.nextId, 48);

        test.ok(!request.isSecure());
        
        // path should NOT be decoded because it needs to be done at the component level
        test.equal(request.path, '/%E0%A4%B5%E0%A4%BE%E0%A4%B0%E0%A4%BE%E0%A4%A3%E0%A4%B8%E0%A5%80');

        // params should be decoded
        test.deepEqual(request.getParams(), params);

        // url should NOT be decoded
        test.equal('/%E0%A4%B5%E0%A4%BE%E0%A4%B0%E0%A4%BE%E0%A4%A3%E0%A4%B8%E0%A5%80?login=testing27%40example.com&password=chin%20chilla', request.url);
        
        test.deepEqual(request.headers, {});

        test.done();
    },

    "test get header(s)": function(test) {

        Request.nextId = 11;
        var bodyStream = new Pipe();

        bodyStream.connection = {
            remoteAddress: '10.20.247.127'
        };

        var headers = {
            'Content-Type': 'image/png',
            'Content-Length': 16877,
            'Host': 'www.example.com',
            'User-Agent': 'Mozilla',
            'Referer': 'http://www.sitelier.com/',
            'Cookie': 'session=7232; flight=747'
        };

//        Request.log = {
//
//            log: function(priority, message, params) {
//                test.equal(priority, 6);
//                test.equal(message, 'BEGIN');
//                test.deepEqual(params, {
//                    req: 11,
//                    c: '10.20.247.127',
//                    m: 'GET',
//                    u: '/yomama',
//                    h: 'www.example.com',
//                    a: 'Mozilla',
//                    r: 'http://www.sitelier.com/'
//                });
//            }
//        }

        var request = new Request('GET', '/yomama', headers, bodyStream);

        test.deepEqual(request.getHeaders(), headers);
        test.equal(request.connection.remoteAddress, '10.20.247.127');
        test.equal( request.getHeader('content-type'), 'image/png');
        test.equal( request.getHeader('Content-type'), 'image/png');
        test.equal( request.getHeader('Content-Type'), 'image/png');

        test.equal(request.getCookie('session'), '7232');
        test.equal(request.getCookie('flight'), '747');

        // cookie names are case sensitive!
        test.equal(request.getCookie('Flight'), null);

        test.done();
    },

    "test log": function(test) {

        Request.nextId = 42;

        test.expect(5);

        var request = new Request('GET', '/yomama');

        test.equal(request.id, 42);

        request.once('log', function(priority, message) {
            test.equal(priority, Log.INFO);
            test.equal(message, 'starting request');
        });

        request.log(Log.INFO, 'starting request');

        request.once('log', function(priority, message) {
            test.equal(priority, Log.ERROR);
            test.equal(message, 'an error occurred');
        });

        request.log(Log.ERROR, 'an error occurred');

        test.done();
    },

    "test getBodyObject success": function(test) {

        var bodyObj = {};

        var request = new Request('POST', '/yomama', {});

        request.getBodyObject().then(
            function(obj) {
                test.deepEqual(obj, bodyObj);
                test.done();
            }).done();

        // stream the request body
        request.getBodyStream().end(JSON.stringify(bodyObj), 'utf8');
    },

    "test getBodyObject bad JSON": function(test) {

        var request = new Request('POST', '/yomama', {});

        request.getBodyObject().then(null,
            function(err) {
                test.equal(err.message, 'request body is not valid JSON');
                test.done();
            }).done();

        // stream the request body
        request.getBodyStream().end('yo, what gives?', 'utf8');
    }
};