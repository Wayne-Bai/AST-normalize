/// Copyright (c) 2012 Ecma International.  All rights reserved. 
/**
 * @path ch15/15.2/15.2.3/15.2.3.5/15.2.3.5-4-237.js
 * @description Object.create - 'get' property of one property in 'Properties' is own accessor property (8.10.5 step 7.a)
 */


function testcase() {

        var descObj = {};

        Object.defineProperty(descObj, "get", {
            get: function () {
                return function () {
                    return "ownAccessorProperty";
                };
            }
        });

        var newObj = Object.create({}, {
            prop: descObj 
        });

        return newObj.prop === "ownAccessorProperty";
    }
runTestCase(testcase);
