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
 * Date: 1/26/12
 */

"use strict";

var capsela = require('../../');
var Service = capsela.Service;
var mp = require('capsela-util').MonkeyPatcher;
var Log = require('capsela-util').Log;
var Q = require('q');

exports.basics = {

    "test init/start/stop": function(test) {

        var started = false;
        var stopped = false;

        var service = new Service('testing', function() {

            started = true;

            return Q.delay('ok', 10);

        }, function() {
            
            stopped = true;

            return Q.delay('ok', 10);
        });

        test.equal(service.name, 'testing');
        test.equal(service.isRunning(), false);

        Q.when(service.start(),
            function() {

                test.equal(service.isRunning(), true);
                test.ok(started);

                return service.stop();
            }
        ).then(
            function() {

                test.equal(service.isRunning(), false);
                test.ok(stopped);

                test.done();
            }
        ).done();
    },

    "test start/stop w/out functions": function(test) {

        var service = new Service('testing');

        return Q.when(service.start(), function() {
            return service.stop();
        });
    }
};