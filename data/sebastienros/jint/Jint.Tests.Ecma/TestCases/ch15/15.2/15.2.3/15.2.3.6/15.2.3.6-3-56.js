/// Copyright (c) 2012 Ecma International.  All rights reserved. 
/**
 * @path ch15/15.2/15.2.3/15.2.3.6/15.2.3.6-3-56.js
 * @description Object.defineProperty - value of 'enumerable' property in 'Attributes' is an empty string (8.10.5 step 3.b)
 */


function testcase() {
        var obj = {};
        var accessed = false;

        Object.defineProperty(obj, "property", { enumerable: "" });

        for (var prop in obj) {
            if (prop === "property") {
                accessed = true;
            }
        }
        return !accessed;
    }
runTestCase(testcase);
