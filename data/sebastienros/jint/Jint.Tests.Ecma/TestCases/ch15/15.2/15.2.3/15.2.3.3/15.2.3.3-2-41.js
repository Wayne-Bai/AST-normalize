/// Copyright (c) 2012 Ecma International.  All rights reserved. 
/**
 * @path ch15/15.2/15.2.3/15.2.3.3/15.2.3.3-2-41.js
 * @description Object.getOwnPropertyDescriptor - argument 'P' is a Number Object that converts to a string
 */


function testcase() {
        var obj = { "123": 1 };

        var desc = Object.getOwnPropertyDescriptor(obj, new Number(123));

        return desc.value === 1;
    }
runTestCase(testcase);
