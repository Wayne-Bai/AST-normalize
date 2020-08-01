/// Copyright (c) 2012 Ecma International.  All rights reserved. 
/**
 * @path ch15/15.2/15.2.3/15.2.3.7/15.2.3.7-5-b-86.js
 * @description Object.defineProperties - value of 'configurable' property of 'descObj' is null (8.10.5 step 4.b)
 */


function testcase() {
        var obj = {};

        Object.defineProperties(obj, {
            property: {
                configurable: null
            }
        });

        var hadOwnProperty = obj.hasOwnProperty("property");

        delete obj.property;

        return obj.hasOwnProperty("property") && hadOwnProperty;

    }
runTestCase(testcase);
