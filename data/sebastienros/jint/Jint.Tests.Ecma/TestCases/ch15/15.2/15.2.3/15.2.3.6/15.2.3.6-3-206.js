/// Copyright (c) 2012 Ecma International.  All rights reserved. 
/**
 * @path ch15/15.2/15.2.3/15.2.3.6/15.2.3.6-3-206.js
 * @description Object.defineProperty - 'get' property in 'Attributes' is not present (8.10.5 step 7)
 */


function testcase() {
        var obj = {};

        Object.defineProperty(obj, "property", {
            set: function () {}
        });

        return typeof obj.property === "undefined" && obj.hasOwnProperty("property");
    }
runTestCase(testcase);
