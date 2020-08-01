/// Copyright (c) 2012 Ecma International.  All rights reserved. 
/**
 * @path ch15/15.2/15.2.3/15.2.3.6/15.2.3.6-4-375.js
 * @description ES5 Attributes - property ([[Writable]] is false, [[Enumerable]] is false, [[Configurable]] is false) is unwritable
 */


function testcase() {
        var obj = {};

        Object.defineProperty(obj, "prop", {
            value: 2010,
            writable: false,
            enumerable: false,
            configurable: false
        });
        var propertyDefineCorrect = (obj.prop === 2010);
        obj.prop = 1001;

        return propertyDefineCorrect && obj.prop === 2010;
    }
runTestCase(testcase);
