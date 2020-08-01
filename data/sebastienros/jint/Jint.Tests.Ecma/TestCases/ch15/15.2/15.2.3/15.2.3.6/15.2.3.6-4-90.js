/// Copyright (c) 2012 Ecma International.  All rights reserved. 
/**
 * @path ch15/15.2/15.2.3/15.2.3.6/15.2.3.6-4-90.js
 * @description Object.defineProperty will not throw TypeError when name.configurable = false, name.writable = false, desc.value and name.value are two strings with the same value (8.12.9 step 10.a.ii.1)
 */


function testcase() {

        var obj = {};

        Object.defineProperty(obj, "foo", {
            value: "abcd",
            writable: false,
            configurable: false 
        });

        try {
            Object.defineProperty(obj, "foo", { value: "abcd" });
            return dataPropertyAttributesAreCorrect(obj, "foo", "abcd", false, false, false);
        } catch (e) {
            return false;
        }
    }
runTestCase(testcase);
