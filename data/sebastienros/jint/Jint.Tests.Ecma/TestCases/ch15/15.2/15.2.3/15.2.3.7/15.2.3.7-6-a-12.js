/// Copyright (c) 2012 Ecma International.  All rights reserved. 
/**
 * @path ch15/15.2/15.2.3/15.2.3.7/15.2.3.7-6-a-12.js
 * @description Object.defineProperties - 'O' is a Function object which implements its own [[GetOwnProperty]] method to get 'P' (8.12.9 step 1 ) 
 */


function testcase() {
        var fun = function () { };

        Object.defineProperty(fun, "prop", {
            value: 11,
            configurable: false
        });

        try {
            Object.defineProperties(fun, {
                prop: {
                    value: 12,
                    configurable: true
                }
            });
            return false;
        } catch (e) {
            return e instanceof TypeError && dataPropertyAttributesAreCorrect(fun, "prop", 11, false, false, false);
        }
    }
runTestCase(testcase);
