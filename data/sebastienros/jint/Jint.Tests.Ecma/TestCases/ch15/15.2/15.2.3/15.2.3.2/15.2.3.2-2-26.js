/// Copyright (c) 2012 Ecma International.  All rights reserved. 
/**
 * @path ch15/15.2/15.2.3/15.2.3.2/15.2.3.2-2-26.js
 * @description Object.getPrototypeOf returns the [[Prototype]] of its parameter (RegExp object)
 */


function testcase() {
        var obj = new RegExp();

        return Object.getPrototypeOf(obj) === RegExp.prototype;
    }
runTestCase(testcase);
