/// Copyright (c) 2012 Ecma International.  All rights reserved. 
/**
 * @path ch15/15.2/15.2.3/15.2.3.6/15.2.3.6-2-41.js
 * @description Object.defineProperty - argument 'P' is a Boolean Object that converts to a string
 */


function testcase() {
        var obj = {};
        Object.defineProperty(obj, new Boolean(false), {});

        return obj.hasOwnProperty("false");

    }
runTestCase(testcase);
