/// Copyright (c) 2012 Ecma International.  All rights reserved. 
/**
 * @path ch15/15.4/15.4.4/15.4.4.19/15.4.4.19-5-13.js
 * @description Array.prototype.map - Number object can be used as thisArg
 */


function testcase() {

        var objNumber = new Number();

        function callbackfn(val, idx, obj) {
            return this === objNumber;
        }

        var testResult = [11].map(callbackfn, objNumber);
        return testResult[0] === true;
    }
runTestCase(testcase);
