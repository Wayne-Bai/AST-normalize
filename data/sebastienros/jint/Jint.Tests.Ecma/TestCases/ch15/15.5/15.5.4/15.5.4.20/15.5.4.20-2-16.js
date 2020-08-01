/// Copyright (c) 2012 Ecma International.  All rights reserved. 
/**
 * @path ch15/15.5/15.5.4/15.5.4.20/15.5.4.20-2-16.js
 * @description String.prototype.trim - argument 'this' is a number that converts to string (value is 1e+21)
 */


function testcase() {
        return String.prototype.trim.call(1e+21) === "1e+21";
    }
runTestCase(testcase);
