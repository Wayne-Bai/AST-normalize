// Part of OpenPhantomScripts
// http://github.com/mark-rushakoff/OpenPhantomScripts

// Copyright (c) 2012 Mark Rushakoff

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
// IN THE SOFTWARE.

var fs = require("fs");
var args, url, lengthOkay, appName, system;
try {
    system = require("system");
    // if we got here, we are on PhantomJS 1.5+
    args = system.args;
    lengthOkay = (args.length === 2);
    appName = args[0];
    url = args[1];
} catch (e) {
    // otherwise, assume PhantomJS 1.4
    args = phantom.args;
    lengthOkay = (args.length === 1);
    appName = 'phantom-qunit.js'
    url = args[0];
}

if (!lengthOkay) {
    printError("Usage: " + appName + " URL");
    phantom.exit(1);
}

function printError(message) {
    fs.write("/dev/stderr", message + "\n", "w");
}

var page = require("webpage").create();

var attachedDoneCallback = false;
page.onResourceReceived = function() {
    // Without this guard, I was occasionally seeing the done handler
    // pushed onto the array multiple times -- it looks like the
    // function was queued up several times, depending on the server.
    if (!attachedDoneCallback) {
        attachedDoneCallback = page.evaluate(function() {
            if (window.mocha) {
                // Unfortunately, there's no easy hook into Mocha's results
                // like there is in QUnit or Jasmine.  But, since mocha.run
                // returns the runner (after it's been started), we can wrap
                // the original mocha.run and tap into the runner to set up our
                // hooks.  This has the side effect of making this script
                // useless if the test doesn't use mocha.run to start the
                // tests.
                var oldRun = window.mocha.run;
                window.mocha.run = function(fn) {
                    var runner = oldRun(fn);

                    // runner has already started by the time we get here...
                    // but only barely, so just store the current time
                    var start = (new Date()).getTime();
                    var passes = 0;
                    var failures = 0;
                    runner.on("pass", function() { passes++; });
                    runner.on("fail", function() { failures++; });
                    runner.on("end", function() {
                        var duration = (new Date()).getTime() - start;
                        console.log("Tests passed: " + passes);
                        console.log("Tests failed: " + failures);
                        console.log("Total tests:  " + (passes + failures));
                        console.log("Runtime (ms): " + duration);
                        window.phantomComplete = true;
                        window.phantomResults = {
                            failed: failures
                        };
                    });
                }

                return true;
            }

            return false;
        });
    }
}

page.onConsoleMessage = function(message) {
    console.log(message);
}

page.open(url, function(success) {
    if (success === "success") {
        if (!attachedDoneCallback) {
            printError("Phantom callbacks not attached in time.  See http://github.com/mark-rushakoff/OpenPhantomScripts/issues/1");
            phantom.exit(1);
        }

        setInterval(function() {
            if (page.evaluate(function() {return window.phantomComplete;})) {
                var failures = page.evaluate(function() {return window.phantomResults.failed;});
                phantom.exit(failures);
            }
        }, 250);
    } else {
        printError("Failure opening " + url);
        phantom.exit(1);
    }
});
