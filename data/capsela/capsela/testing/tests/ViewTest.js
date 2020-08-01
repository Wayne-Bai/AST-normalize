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
 * Date: 1/11/12
 */

"use strict";

var testbench = require(__dirname + '/../TestBench');

var capsela = require('../../');
var View = capsela.View;

module.exports["basics"] = {

    "test init/isComplete": function(test) {

        var view = new View('xyz');
        test.equal(view.isComplete(), false);

        view = new View('hithere! <!DOCTYPE html>');
        test.equal(view.isComplete(), false);

        view = new View('hithere! <!doctype html>');
        test.equal(view.isComplete(), false);

        view = new View('<html></html>');
        test.equal(view.isComplete(), true);

        view = new View('<!DOCTYPE html>');
        test.equal(view.isComplete(), true);

        test.done();
    },

    "test render": function(test) {

        var view = new View('hi there!');

        test.equal(view.render(), "hi there!");

        test.done();
    },

    "test set/get parent": function(test) {

        var view = new View();

        test.equal(view.getParent(), undefined);
        test.equal(view.setParent('sal'), view); // test fluency
        test.equal(view.getParent(), 'sal');

        test.done();
    }
};