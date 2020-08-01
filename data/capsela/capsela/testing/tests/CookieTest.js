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

var Cookie = require('../../').Cookie;

module.exports["parsing"] = {

    "test parse no header": function(test) {

        test.expect(2);
        
        var mockReq = {
            getHeader: function(name) {
                test.equal(name.toLowerCase(), 'cookie');
                return null;
            }
        };

        test.deepEqual(Cookie.getCookies(mockReq), {});
        test.done();
    },
    
    "test parse one cookie": function(test) {

        var mockReq = {
            getHeader: function(name) {
                return 'name=value';
            }
        };

        test.deepEqual(Cookie.getCookies(mockReq), {name: 'value'});
        test.done();
    },

    "test parse several cookies": function(test) {

        var mockReq = {
            getHeader: function(name) {
                return 'chrome=good; firefox=good;ie=blows';
            }
        };

        test.deepEqual(Cookie.getCookies(mockReq), {
            firefox: 'good',
            chrome: 'good',
            ie: 'blows'
        });
        test.done();
    },

    "test parse extra semicolon": function(test) {

        var mockReq = {
            getHeader: function(name) {
                return 'chrome=good; firefox=good;ie=blows;';
            }
        };

        test.deepEqual(Cookie.getCookies(mockReq), {
            firefox: 'good',
            chrome: 'good',
            ie: 'blows'
        });
        test.done();
    },

    "test getCookies": function(test) {

        var name = 'test-cookie';
        var value = 'kajoigau489ht9w48';

        var cookies;
        var header;

        var mockRequest = {
            getHeader: function(name) {
                return header;
            }
        };

        header = name + "=" + value;
        cookies = Cookie.getCookies(mockRequest);
        test.equal(value, cookies[name]);

        header = "$VERSION=1.17; " + name + "=" + value;
        cookies = Cookie.getCookies(mockRequest);
        test.equal(value, cookies[name]);
        test.equal('1.17', cookies['$version']);

        header = "$VERSION= hello there; " + name + "=" + value+ "; hi=there; /yo/baby;monkeys.testing.example.com";
        cookies = Cookie.getCookies(mockRequest);
        test.equal(value, cookies[name]);
        test.equal(' hello there', cookies['$version']);
        test.equal('there', cookies['hi']);
        test.ok(cookies['/yo/baby'] === true);

        test.done();
    }
};

module.exports["basics"] = {

    "test minimal": function(test) {

        var cookie = new Cookie('sks-session-id', 'jackrabbitslims');

        test.equal(cookie.getName(), 'sks-session-id');
        test.equal(cookie.getValue(), 'jackrabbitslims');
        test.equal(cookie.getDomain(), null);
        test.equal(cookie.getPath(), null);

        test.equal(cookie.toString(), 'sks-session-id=jackrabbitslims');
        test.deepEqual(Cookie.fromString(cookie.toString()), cookie);

        test.done();
    },
    
    "test with domain": function(test) {

        var cookie = new Cookie('sks-session-id', 'jackrabbitslims', undefined, undefined, 'www.example1.com');

        test.equal(cookie.getName(), 'sks-session-id');
        test.equal(cookie.getValue(), 'jackrabbitslims');
        test.equal(cookie.getDomain(), 'www.example1.com');

        test.equal(cookie.toString(), 'sks-session-id=jackrabbitslims; Domain=www.example1.com');
        test.deepEqual(Cookie.fromString(cookie.toString()), cookie);

        test.done();
    },

    "test with path": function(test) {

        var cookie = new Cookie('sks-session-id', 'jackrabbitslims', undefined, undefined, undefined, '/accounts');

        test.equal(cookie.getName(), 'sks-session-id');
        test.equal(cookie.getValue(), 'jackrabbitslims');
        test.equal(cookie.getPath(), '/accounts');

        test.equal(cookie.toString(), 'sks-session-id=jackrabbitslims; Path=/accounts');
        test.deepEqual(Cookie.fromString(cookie.toString()), cookie);

        test.done();
    },

    "test with domain and path": function(test) {

        var cookie = new Cookie('sks-session-id', 'jackrabbitslims', undefined, undefined, 'www.example.com', '/accounts');

        test.equal(cookie.getName(), 'sks-session-id');
        test.equal(cookie.getValue(), 'jackrabbitslims');
        test.equal(cookie.getDomain(), 'www.example.com');
        test.equal(cookie.getPath(), '/accounts');

        test.equal(cookie.toString(), 'sks-session-id=jackrabbitslims; Domain=www.example.com; Path=/accounts');
        test.deepEqual(Cookie.fromString(cookie.toString()), cookie);

        test.done();
    },

    "test secure": function(test) {

        var cookie = new Cookie('sks-session-id', 'jackrabbitslims', undefined, undefined, undefined, undefined, true);

        test.equal(cookie.getName(), 'sks-session-id');
        test.equal(cookie.getValue(), 'jackrabbitslims');
        test.equal(cookie.getDomain(), null);
        test.equal(cookie.getPath(), null);
        test.ok(cookie.isSecure());

        test.equal(cookie.toString(), 'sks-session-id=jackrabbitslims; Secure');
        test.deepEqual(Cookie.fromString(cookie.toString()), cookie);

        test.done();
    },

    "test httponly": function(test) {

        var cookie = new Cookie('sks-session-id', 'jackrabbitslims', undefined, undefined, undefined, undefined, undefined, true);

        test.equal(cookie.getName(), 'sks-session-id');
        test.equal(cookie.getValue(), 'jackrabbitslims');
        test.equal(cookie.getDomain(), null);
        test.equal(cookie.getPath(), null);
        test.ok(!cookie.isSecure());
        test.ok(cookie.isHttpOnly());

        test.equal(cookie.toString(), 'sks-session-id=jackrabbitslims; HttpOnly');
        test.deepEqual(Cookie.fromString(cookie.toString()), cookie);

        test.done();
    },

    "test with expires": function(test) {

        var exp = new Date(Date.now() + 86400 * 1000); // one day hence

        var cookie = new Cookie('sks-session-id', 'jackrabbitslims', exp);

        test.equal(cookie.getName(), 'sks-session-id');
        test.equal(cookie.getValue(), 'jackrabbitslims');
        test.equal(cookie.getDomain(), null);
        test.equal(cookie.getPath(), null);
        test.ok(!cookie.isSecure());
        test.ok(!cookie.isHttpOnly());
        test.ok(cookie.getExpires(), exp);

        test.equal(cookie.toString(), 'sks-session-id=jackrabbitslims; Expires=' + exp.toUTCString());
        test.equal(Cookie.fromString(cookie.toString()).toString(), cookie.toString());

        test.done();
    },

    "test maxAge": function(test) {

        var cookie = new Cookie('sks-session-id', 'jackrabbitslims', undefined, 86400);

        test.equal(cookie.getName(), 'sks-session-id');
        test.equal(cookie.getValue(), 'jackrabbitslims');
        test.equal(cookie.getDomain(), null);
        test.equal(cookie.getPath(), null);
        test.ok(!cookie.isSecure());
        test.ok(!cookie.isHttpOnly());
        test.ok(cookie.getMaxAge(), 86400);

        test.equal(cookie.toString(), 'sks-session-id=jackrabbitslims; Max-Age=86400');
        test.deepEqual(Cookie.fromString(cookie.toString()), cookie);

        test.done();
    },

    "test setIn": function(test) {

        test.expect(2);

        var cookie = new Cookie('sks-session-id', 'jackrabbitslims');

        var mockResponse = {
            setHeader: function(name, value) {
                test.equal(name, 'Set-Cookie');
                test.equal(value, cookie.toString());
            }
        }

        cookie.setIn(mockResponse);

        test.done();
    },

    "test unsetIn": function(test) {

        test.expect(2);

        var cookie = new Cookie('session-id', 'howdy', new Date(), null, 'www.monkeys.com', '/out-there');

        var expected = new Cookie('session-id', 'aloha', new Date(19800222), null, 'www.monkeys.com', '/out-there');

        var mockResponse = {
            setHeader: function(name, value) {
                test.equal(name, 'Set-Cookie');
                test.equal(value, expected.toString());
            }
        }

        cookie.unsetIn(mockResponse);

        test.done();
    }
};