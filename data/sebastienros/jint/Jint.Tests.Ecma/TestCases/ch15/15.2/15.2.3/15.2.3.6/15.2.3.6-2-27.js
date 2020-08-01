/// Copyright (c) 2012 Ecma International.  All rights reserved. 
/**
 * @path ch15/15.2/15.2.3/15.2.3.6/15.2.3.6-2-27.js
 * @description Object.defineProperty - argument 'P' is a decimal that converts to a string (value is 123.456)
 */


function testcase() {
        var obj = {};
        Object.defineProperty(obj, 123.456, {});

        return obj.hasOwnProperty("123.456");

    }
runTestCase(testcase);
