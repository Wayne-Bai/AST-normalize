(function () {
    if (!jasmine) {
        throw new Exception("jasmine library does not exist in global namespace!");
    }

    /**
     * TAP (http://en.wikipedia.org/wiki/Test_Anything_Protocol) reporter.
     * outputs spec results to the console.
     *
     * Heavily inspired by ConsoleReporter found at:
     * https://github.com/larrymyers/jasmine-reporters/
     *
     * Usage:
     *
     * jasmine.getEnv().addReporter(new jasmine.TapReporter());
     * jasmine.getEnv().execute();
     */
    var TapReporter = function () {
        this.started = false;
        this.finished = false;
    };

    TapReporter.prototype = {

        reportRunnerStarting: function (runner) { },

        reportSpecStarting: function (spec) { },

        reportSpecResults: function (spec) { },

        reportRunnerResults: function (runner) { },

        reportSuiteResults: function (suite) {
            var results = suite.results();
            var path = [];
            while (suite) {
                path.unshift(suite.description);
                suite = suite.parentSuite;
            }
            var description = path.join(' ');

            // testSuiteStarted
            this.log("1.." + results.items_.length);

            var outerThis = this;
            var eachSpecFn = function (spec) {
                if (spec.description) {
                    var passed = "ok ",
                        specResultFn = function (result) {
                            if (!result.passed_) {
                                passed = "not ok ";
                            }
                        };

                    for (var j = 0, jlen = spec.items_.length; j < jlen; j++) {
                        specResultFn(spec.items_[j]);
                    }
                    outerThis.log(passed + (i + 1) + " - " + spec.description + ": " + description);
                    // testFinished
                }
            };
            for (var i = 0, ilen = results.items_.length; i < ilen; i++) {
                eachSpecFn(results.items_[i]);
            }

            // testSuiteFinished - act on this message in viewjazzle but do not output it
            console.log("testSuiteFinished");
        },

        log: function (str) {
            var console = jasmine.getGlobal().console;
            if (console && console.log) {
                console.log(str);
            }
        },

        hasGroupedConsole: function () {
            var console = jasmine.getGlobal().console;
            return console && console.info && console.warn && console.group && console.groupEnd && console.groupCollapsed;
        }
    };

    function suiteResults(suite) {
        console.group(suite.description);
        var specs = suite.specs();
        for (var i in specs) {
            if (specs.hasOwnProperty(i)) {
                specResults(specs[i]);
            }
        }
        var suites = suite.suites();
        for (var j in suites) {
            if (suites.hasOwnProperty(j)) {
                suiteResults(suites[j]);
            }
        }
        console.groupEnd();
    }

    function specResults(spec) {
        var results = spec.results();
        if (results.passed() && console.groupCollapsed) {
            console.groupCollapsed(spec.description);
        } else {
            console.group(spec.description);
        }
        var items = results.getItems();
        for (var k in items) {
            if (items.hasOwnProperty(k)) {
                itemResults(items[k]);
            }
        }
        console.groupEnd();
    }

    function itemResults(item) {
        if (item.passed && !item.passed()) {
            console.warn({ actual: item.actual, expected: item.expected });
            item.trace.message = item.matcherName;
            console.error(item.trace);
        } else {
            console.info('Passed');
        }
    }

    // export public
    jasmine.TapReporter = TapReporter;
})();