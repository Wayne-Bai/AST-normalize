/// Copyright (c) 2012 Ecma International.  All rights reserved. 
/**
 * @path ch15/15.2/15.2.3/15.2.3.7/15.2.3.7-6-a-95.js
 * @description Object.defineProperties - 'P' is data property, P.value is present and properties.value is undefined (8.12.9 step 12)
 */


function testcase() {

        var obj = {};

        Object.defineProperty(obj, "foo", {
            value: 200,
            enumerable: true,
            writable: true,
            configurable: true 
        });

        Object.defineProperties(obj, {
            foo: {
                value: undefined
            }
        });
        return dataPropertyAttributesAreCorrect(obj, "foo", undefined, true, true, true);
    }
runTestCase(testcase);
