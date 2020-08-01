/// Copyright (c) 2012 Ecma International.  All rights reserved. 
/**
 * @path ch15/15.2/15.2.3/15.2.3.6/15.2.3.6-3-95.js
 * @description Object.defineProperty - 'Attributes' is an Error object that uses Object's [[Get]] method to access the 'configurable' property (8.10.5 step 4.a)
 */


function testcase() {
        var obj = { };

        var errObj = new Error();

        errObj.configurable = true;

        Object.defineProperty(obj, "property", errObj);

        var beforeDeleted = obj.hasOwnProperty("property");

        delete obj.property;

        var afterDeleted = obj.hasOwnProperty("property");

        return beforeDeleted === true && afterDeleted === false;
    }
runTestCase(testcase);
