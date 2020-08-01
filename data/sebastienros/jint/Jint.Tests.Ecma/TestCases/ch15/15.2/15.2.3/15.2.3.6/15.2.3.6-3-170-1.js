/// Copyright (c) 2012 Ecma International.  All rights reserved. 
/**
 * @path ch15/15.2/15.2.3/15.2.3.6/15.2.3.6-3-170-1.js
 * @description Object.defineProperty - 'Attributes' is the Math object that uses Object's [[Get]] method to access the 'writable' property of prototype object (8.10.5 step 6.b)
 */


function testcase() {
        var obj = {};

        try {
            Object.prototype.writable = true;

            Object.defineProperty(obj, "property", Math);

            var beforeWrite = obj.hasOwnProperty("property");

            obj.property = "isWritable";

            var afterWrite = (obj.property === "isWritable");

            return beforeWrite === true && afterWrite === true;
        } finally {
            delete Object.prototype.writable;
        }
    }
runTestCase(testcase);
