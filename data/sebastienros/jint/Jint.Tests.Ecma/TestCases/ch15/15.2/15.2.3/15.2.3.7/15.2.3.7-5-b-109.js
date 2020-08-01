/// Copyright (c) 2012 Ecma International.  All rights reserved. 
/**
 * @path ch15/15.2/15.2.3/15.2.3.7/15.2.3.7-5-b-109.js
 * @description Object.defineProperties - value of 'configurable' property of 'descObj' is  the global object (8.10.5 step 4.b)
 */


function testcase() {
        var obj = {};

        Object.defineProperties(obj, {
            property: {
                configurable: fnGlobalObject()
            }
        });
        var preCheck = obj.hasOwnProperty("property");
        delete obj.property;

        return preCheck && !obj.hasOwnProperty("property");
    }
runTestCase(testcase);
