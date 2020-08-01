/// Copyright (c) 2012 Ecma International.  All rights reserved. 
/**
 * @path ch15/15.4/15.4.4/15.4.4.22/15.4.4.22-9-b-25.js
 * @description Array.prototype.reduceRight - deleting own property with prototype property causes prototype index property to be visited on an Array-like object
 */


function testcase() {

        var testResult = false;

        function callbackfn(prevVal, curVal, idx, obj) {
            if (idx === 1 && curVal === 1) {
                testResult = true;
            }
        }

        var obj = { 0: 0, 1: 111, 4: 10, length: 10 };

        Object.defineProperty(obj, "4", {
            get: function () {
                delete obj[1];
                return 0;
            },
            configurable: true
        });

        try {
            Object.prototype[1] = 1;
            Array.prototype.reduceRight.call(obj, callbackfn, "initialValue");
            return testResult;
        } finally {
            delete Object.prototype[1];
        }
    }
runTestCase(testcase);
