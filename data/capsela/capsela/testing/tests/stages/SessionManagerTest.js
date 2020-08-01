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
 * Date: Feb 10, 2011
 */

"use strict";
/*global require: false, __dirname: false, global: false, process: false, exports: true, Buffer: false, module: false, setInterval: true */

var testbench = require('../../TestBench');

var capsela = require('../../../');
var SessionManager = capsela.stages.SessionManager;
var SessionStore = capsela.SessionStore;
var Session = capsela.Session;
var Request = capsela.Request;
var Response = capsela.Response;
var Cookie = capsela.Cookie;

var Q = require('q');

module.exports["basics"] = {

    "test init without store": function(test) {

        var sm = new SessionManager();

        test.ok(sm.store instanceof SessionStore);

        test.done();
    },

    "test pass returns nothing": function(test) {

        var session = new Session();

        var mockStore = {

            createSession: function() {
                return session;
            },

            save: function(saved, cb) {
                test.equal(saved, session);
                cb();
            }
        };

        var sm = new SessionManager(mockStore);

        sm.pass = function(request) {};

        // add session to request
        var request = new Request();

        Q.when(sm.service(request),
            function(response) {
                test.equal(response, undefined);
                test.done();
            });
    }
};

module.exports["establishing"] = {
    
    "test establish with no id": function(test) {

        var sm = new SessionManager();
        var result = {};

        sm.establish(undefined, result).then(
            function(session) {
                test.ok(result.created);
                test.ok(session instanceof Session);
                test.done();
            });
    },

    "test establish w/valid session ID": function(test) {

        test.expect(4);

        var mockSession = {
            stillValid: function() {
                test.ok(true);
                return true;
            }
        };

        var mockStore = {

            load: function(id) {
                test.equal(id, 'the-xx');
                return Q.resolve(mockSession);
            }
        };
        
        var sm = new SessionManager(mockStore, 'the-xx');
        var result = {};
        
        sm.establish('the-xx', result).then(
            function(session) {
                test.ok(!result.created);
                test.equal(session, mockSession);
                test.done();
            });
    },

    "test establish w/expired session ID": function(test) {

        test.expect(5);

        var mockSession = {
            stillValid: function() {
                test.ok(true);
                return false;
            }
        };

        var mockStore = {

            load: function(id) {
                test.equal(id, 'the-xx');
                return Q.resolve(mockSession);
            }
        };

        var sm = new SessionManager(mockStore, 'the-xx');
        var result = {};
        
        sm.establish('the-xx', result).then(
            function(session) {
                test.ok(result.created);
                test.ok(session instanceof Session);
                test.notEqual(session, mockSession);
                test.done();
            });
    }
};

module.exports["servicing"] = {

    "test save non-ended session": function(test) {

        test.expect(1);

        var session = new Session();

        var mockStore = {

            save: function(saved) {
                test.equal(saved, session);
                return Q.resolve();
            },

            load: function(sid) {
                return Q.resolve(session);
            }
        };

        var sm = new SessionManager(mockStore);
        var response = new Response();
        
        sm.pass = function(request) {
            return response;
        }

        response.setHeader = function(name, value) {

            // make sure header was NOT set
            test.ok(false, "set header called for some reason");
        };

        // add session to request
        var request = new Request('GET', '/', {
            'cookie': '_sid=' + session.getId()
        });

        Q.when(sm.service(request), function() {
            test.done();
        });
    },

    "test reestablish from query param": function(test) {

        test.expect(2);

        var session = new Session();

        var mockStore = {

            save: function(saved) {
                test.equal(saved, session);
                return Q.resolve();
            },

            load: function(sid) {
                test.equal(sid, session.getId());
                return Q.resolve(session);
            }
        };

        var sm = new SessionManager(mockStore);
        var response = new Response();

        sm.pass = function(request) {
            return response;
        }

        response.setHeader = function(name, value) {

            // make sure header was NOT set
            test.ok(false, "set header called for some reason");
        };

        // add session to request *as query string param*
        var request = new Request('GET', '/?_sid=' + session.getId());

        Q.when(sm.service(request), function() {
            test.done();
        });
    },

    "test service kills ended session": function(test) {

        test.expect(3);

        var session = new Session();

        var mockStore = {

            save: function(saved) {
                test.equal(saved, session);
                return Q.resolve();
            },

            load: function(sid) {
                return Q.resolve(session);
            },

            destroy: function(destroyed) {
                test.equal(destroyed, session);
                return Q.resolve();
            }
        };

        var sm = new SessionManager(mockStore);
        var response = new Response();

        sm.pass = function(request) {
            request.session.end();
            return response;
        };

        var request = new Request('GET', '/', {
            'cookie': '_sid=' + session.getId()
        });

        response.setHeader = function(name, value) {
            // make sure header was set
            test.equal('Set-Cookie', name);
            test.equal('_sid=aloha; Expires=Thu, 01 Jan 1970 05:30:00 GMT', value);
        };
        
        Q.when(sm.service(request), function() {
            test.done();
        });
    },

    "test service waits for promise": function(test) {

        test.expect(1);

        var session = new Session();
        var sm = new SessionManager();
        var response = new Response();

        sm.pass = function(request) {
            return Q.resolve(response);
        };

        response.setHeader = function(name, value) {
            test.ok(true);
        };
        
        var request = new Request();
        
        Q.when(sm.service(request), function() {
            test.done();
        });
    },

    "test service ignores empty response": function(test) {

        var session = new Session();
        var sm = new SessionManager();
        var response = new Response();

        sm.pass = function(request) {
            return Q.resolve();
        };

        var request = new Request();

        Q.when(sm.service(request), function() {
            test.done();
        });
    }
};