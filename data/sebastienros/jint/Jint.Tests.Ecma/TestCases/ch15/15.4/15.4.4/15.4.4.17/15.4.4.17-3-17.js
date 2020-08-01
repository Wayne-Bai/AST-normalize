/// Copyright (c) 2012 Ecma International.  All rights reserved. 
/**
 * @path ch15/15.4/15.4.4/15.4.4.17/15.4.4.17-3-17.js
 * @description Array.prototype.some - 'length' is a string containing a number with leading zeros
 */


function testcase() {
        function callbackfn1(val, idx, obj) {
            return val > 10;
        }

        function callbackfn2(val, idx, obj) {
            return val > 11;
        }

        var obj = { 0: 9, 1: 11, 2: 12, length: "0002.00" };

        return Array.prototype.some.call(obj, callbackfn1) &&
            !Array.prototype.some.call(obj, callbackfn2);
    }
runTestCase(testcase);
