/// Copyright (c) 2012 Ecma International.  All rights reserved. 
/**
 * @path ch15/15.2/15.2.3/15.2.3.3/15.2.3.3-4-239.js
 * @description Object.getOwnPropertyDescriptor - ensure that 'get' property of returned object is data property with correct 'value' attribute
 */


function testcase() {
        var obj = {};
        var fun = function () {
            return "ownDataProperty";
        };
        Object.defineProperty(obj, "property", {
            get: fun,
            configurable: true
        });

        var desc = Object.getOwnPropertyDescriptor(obj, "property");

        return desc.get === fun;
    }
runTestCase(testcase);
