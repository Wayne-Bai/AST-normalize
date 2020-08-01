/*global window, jasmine, require, phantom, console */
(function () {
    'use strict';

    var system = require('system'),
        args = system.args,
        params = ['-spec', '-viewports', '-url', '-cookies', '-render', '-reporter'],
        config = require('./viewjazzle-config'),
        errorPrefix = 'ViewjazzleJS',
        index = 0,
        jsLibraryPath = config.jsLibraryPath,
        jasminePath = config.jasminePath,
        page,
        render = config.render,
        reporterPath = config.reporterPath,
        reporterName = config.reporterName,
        spec,
        testFailed = config.testMessages.testFailed,
        testSuiteFinished = config.testMessages.testSuiteFinished,
        timeout = config.timeout,
        url,
        cookies,
        viewports = config.viewports,
        ignoreMessages = config.ignoreMessages,
        i,
        arg,
        value;

    if (!phantom) {
        console.log('PhantomJS is required to run ' + errorPrefix);
        return;
    }

    if (reporterName === 'ConsoleReporter' || reporterName === 'TerminalReporter') {
        console.log(reporterName + ' is not compatible with ' + errorPrefix + '. The reporter must be capable of grouped output similar to the TeamCity Reporter.');
        console.log('Feel free to customise your own reporter!');
        phantom.exit();
    }

    function arrayStringToArrayViewportObject(arrayString) {
        var array = arrayString.substring(1, arrayString.length - 1).split(/\]\s*,\s*\[/),
            arrayObject = [],
            subarray,
            obj,
            k;

        for (k = 0; k < array.length; k += 1) {
            array[k] = array[k].replace(/[\[\]']+/g, '');
            subarray = array[k].split(/\s*,\s*/);
            obj = {
                width: subarray[0],
                height: subarray[1]
            };
            arrayObject.push(obj);
        }

        return arrayObject;
    }

    for (i = 0; i < args.length; i += 1) {
        arg = args[i];

        if (params.indexOf(arg) !== -1) {
            value = args[i + 1];
            switch (arg) {
            case '-url':
                url = value;
                break;
            case '-viewports':
                viewports = arrayStringToArrayViewportObject(value);
                break;
            case '-spec':
                spec = value;
                break;
            case '-render':
                render = (/^true$/i).test(value);
                break;
            case '-reporter':
                if (value === 'tap') {
                    reporterPath = 'jasmine.vj_tap_console_reporter.js';
                    reporterName = 'TapReporter';
                }
                break;
            case '-cookies':
                cookies = value.split(',');
                if (cookies.length % 2 !== 0) {
                    console.log(errorPrefix + ': Specify cookies as name-value pairs, seperated by commas.');
                    phantom.exit();
                }
                break;
            default:
                break;
            }
        }
    }

    if (undefined === viewports) {
        console.log(errorPrefix + ': Viewports array has not been defined - check the config.js file.');
        phantom.exit();
    }

    function getDomain(location) {
        var domain,
            domainStart,
            domainEnd;

        domainStart = location.indexOf('//') + 2;
        domain = location.substring(domainStart, location.length);
        domainEnd = domain.indexOf('/') !== -1 ? domain.indexOf('/') : domain.length;
        return domain.substring(0, domainEnd);
    }

    function isLoggable(msg) {
        var j;
        if (reporterName === 'TapReporter' && msg.indexOf(testSuiteFinished) !== -1) {
            return false; // exception - used in VJ Tap Reporter to track the test suite finished
        }

        for (j = 0; j < ignoreMessages.length; j += 1) {
            if (msg.indexOf(ignoreMessages[j]) !== -1) {
                // if this is a message we want to ignore from the array of defined messages
                return false;
            }
        }

        return true;
    }

    function closePage() {
        page.clearCookies();
        page.close();
    }

    function consoleMessage(msg) {
        var sPos, ePos, title;

        if (isLoggable(msg)) {
            console.log(msg);
        }

        // each test to run if not last
        if (index < viewports.length && msg.indexOf(testSuiteFinished) !== -1) {
            closePage();
            openPage();
        } else if (index === viewports.length && msg.indexOf(testSuiteFinished) !== -1) {
            closePage();
            phantom.exit();
        } else {
            if (msg.indexOf(testFailed) !== -1 && render) { // output for image capture
                if (reporterName === 'TeamcityReporter') {
                    sPos = msg.indexOf('name=') + 5;
                    ePos = msg.indexOf('message=') - 1;
                    msg = viewports[index - 1].width + 'x' + viewports[index - 1].height + msg.substring(sPos, ePos);
                }
                title = msg.replace(/\W/g, '-');
                page.render(errorPrefix + '-' + title + '-failed' + '.png');
            }
        }
    }

    function openPage() {
        var cookie,
            domain;

        page = require('webpage').create();

        if (cookies) {
            domain = getDomain(url);
            for (cookie = 0; cookie < cookies.length; cookie += 2) {
                phantom.addCookie({ 'name': cookies[cookie], 'value': cookies[cookie + 1], 'domain': domain });
            }
        }

        page.onConsoleMessage = consoleMessage;
        page.viewportSize = viewports[index];
        page.open(url, function (status) {
            page.injectJs(jasminePath + 'jasmine.js');
            page.injectJs(jasminePath + reporterPath);
            if (!!jsLibraryPath) {
                page.injectJs(jsLibraryPath);
            }
            page.injectJs(spec);
            page.evaluate(function (reporterName) {
                var jasmineEnv = jasmine.getEnv(),
                    jasmineReporter = jasmine[reporterName];
                jasmineEnv.addReporter(new jasmineReporter());
                jasmineEnv.execute();
            }, reporterName);

            if (status !== 'success') {
                console.log('Unable to load the address!');
                phantom.exit();
            } else {
                window.setTimeout(function () {
                    var details = 'The spec file exceeded the configured timeout. Increase the viewjazzle-config timeout value, and ensure you configured the correct path and parameters.',
                        message = errorPrefix + ': FAILED on ' + spec;

                    if (reporterName === 'TeamcityReporter') {
                        console.log("##teamcity[testStarted message='" + message + "' name='" + errorPrefix + "']");
                        console.log("##teamcity[" + testFailed + " message='" + message + "' name='" + errorPrefix + "' details='" + details + "']");
                        console.log("##teamcity[testFinished message='" + message + "' name='" + errorPrefix + "']");
                    } else if (reporterName === 'TapReporter') {
                        console.log(message + ' - ' + details);
                    }

                    phantom.exit();
                }, timeout);
            }

        });
        index += 1;
    }

    openPage();

}());