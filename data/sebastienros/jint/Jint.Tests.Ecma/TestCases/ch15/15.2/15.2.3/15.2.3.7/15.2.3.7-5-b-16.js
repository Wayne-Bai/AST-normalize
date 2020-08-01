/// Copyright (c) 2012 Ecma International.  All rights reserved. 
/**
 * @path ch15/15.2/15.2.3/15.2.3.7/15.2.3.7-5-b-16.js
 * @description Object.defineProperties - 'enumerable' property of 'descObj' is own accessor property without a get function (8.10.5 step 3.a)
 */


function testcase() {

        var obj = {};
        var accessed = false;
        var descObj = {};

        Object.defineProperty(descObj, "enumerable", {
            set: function () { }
        });

        Object.defineProperties(obj, {
            prop: descObj
        });
        for (var property in obj) {
            if (property === "prop") {
                accessed = true;
            }
        }
        return !accessed;
    }
runTestCase(testcase);
