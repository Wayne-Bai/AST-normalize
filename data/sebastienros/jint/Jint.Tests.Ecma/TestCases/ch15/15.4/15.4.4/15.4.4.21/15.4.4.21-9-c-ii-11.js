/// Copyright (c) 2012 Ecma International.  All rights reserved. 
/**
 * @path ch15/15.4/15.4.4/15.4.4.21/15.4.4.21-9-c-ii-11.js
 * @description Array.prototype.reduce - callbackfn is called with 2 formal parameter
 */


function testcase() {

        var result = false;
        function callbackfn(prevVal, curVal) {
            result = (curVal > 10 && 1 === prevVal);
        }

        [11].reduce(callbackfn, 1);
        return result;
    }
runTestCase(testcase);
