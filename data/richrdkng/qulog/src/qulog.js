(function (root, factory) {
    // For Node.js or CommonJS compatible loaders
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();

    // AMD - Anonymous module for RequireJS and compatible
    } else if (typeof define === 'function' && define.amd) {
        define(factory);

    // For using in the browser directly
    } else {
        root.qulog = factory();
    }
}(this, function factory() {
    "use strict";

    var logFunc,
        isDebug = true,
        dummyArray = [0],   // Use, when "non-modern" browser (IE8 and lower) is in use
        isModern = false;

    // For modern browsers (and IE 9+) and Node.js
    if(typeof console.log.apply === "function") {
        isModern = true;
        logFunc = function qulog() {
            if(isDebug) {
                console.log.apply(console, arguments);
            }
        };
    // For IE8 and lower
    } else {
        logFunc = function qulog() {
            if(isDebug) {
                // In IE8 a dummy array is used along with Function.prototype to implement
                // proper console.log functionality
                Function.prototype.call.apply(
                    console.log,
                    dummyArray.concat(Array.prototype.slice.call(arguments, 0))
                );
            }
        };
    }

    // Traditional getters and setters to turn output to the console on/off
    logFunc.getOn = logFunc.getDebug = function() {
        return isDebug;
    };
    logFunc.setOn = logFunc.setDebug = function(value) {
        if(typeof value === "boolean") {
            isDebug = value;
        }
    };
    logFunc.getOff = logFunc.getProduction = function() {
        return !isDebug;
    };
    logFunc.setOff = logFunc.setProduction = function(value) {
        if(typeof value === "boolean") {
            isDebug = value === false;
        }
    };

    // In IE8, Object.defineProperty is only applicable for DOM objects, therefore
    // this feature is only available for "modern" browsers and turned off for
    // "non-modern" browsers (IE8 and lower)
    if(isModern) {
        // Define getters and setters,
        Object.defineProperties(logFunc, {
            on: {
                get: logFunc.getOn,
                set: logFunc.setOn,
                enumerable: true,
                configurable: false
            },
            debug: {
                get: logFunc.getOn,
                set: logFunc.setOn,
                enumerable: true,
                configurable: false
            },
            off: {
                get: logFunc.getOff,
                set: logFunc.setOff,
                enumerable: true,
                configurable: false
            },
            production: {
                get: logFunc.getOff,
                set: logFunc.setOff,
                enumerable: true,
                configurable: false
            }
        });
    }
    return logFunc;
}));