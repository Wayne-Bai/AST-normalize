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

var testbench = require('../TestBench');

var capsela = require('../../');
var Session = capsela.Session;
var crypto = require('crypto');

// save the originals
var mp = require('capsela-util').MonkeyPatcher;

var SessionStore = capsela.SessionStore;

module.exports = {

    setUp: mp.setUp,
    tearDown: mp.tearDown,

    "test makeId": function(test) {

        test.expect(5);

        mp.patch(Math, 'random', function() {
            test.ok(true);
            return 'random';
        });

        mp.patch(Date, 'now', function(){
            return 'now'
        });

        mp.patch(crypto, 'createHash', function(alg) {

            test.equal(alg, 'md5');

            return {

                update: function(data) {
                    test.equal(data, process.pid + '.nowrandom')
                },

                digest: function(encoding) {
                    test.equal(encoding, 'hex');
                    return 'mock id';
                }
            }
        });

        test.equal(Session.makeId(), 'mock id');
        test.done();
    },

    "test initialize": function(test) {

        test.expect(4);

        mp.patch(Date, 'now', function() {
            test.ok(true);
            return 72000;
        });

        mp.patch(Session, 'makeId', function() {
            test.ok(true);
            return 'session-id';
        });

        var session = new Session();

        test.equal(session.getLastSaveTime(), 72000);
        test.equal(session.getId(), 'session-id');

        test.done();
    },

    "test touch": function(test) {

        var now = 72000;
        
        mp.patch(Date, 'now', function() {
            return now;
        });

        var session = new Session();

        test.equal(72000, session.getLastSaveTime());
        
        now = 73000;
        session.touch();
        test.equal(73000, session.getLastSaveTime());

        test.done();
    },

    "test stillValid": function(test) {

        var now = 72000;
        
        mp.patch(Date, 'now', function() {
            return now;
        });

        var session = new Session();
        test.ok(session.stillValid(86400));

        now += (86400 * 1000) - 1;
        test.ok(session.stillValid(86400));

        now += (86400 * 1000);
        test.ok(!session.stillValid(86400));

        test.done();
    },

    "test stillValid after end": function(test) {

        var now = 72000;

        mp.patch(Date, 'now', function() {
            return now;
        });

        var session = new Session();
        test.ok(session.stillValid(86400));

        session.end();
        test.ok(!session.stillValid(86400));
        test.done();
    },

    "test end": function(test) {

        var session = new Session();
        
        test.equal(false, session.isEnded());

        session.end();
        test.ok(session.isEnded());
        test.ok(!session.stillValid());
        test.done();
    }

};