/// Copyright (c) 2012 Ecma International.  All rights reserved. 
/**
 * @path ch15/15.2/15.2.3/15.2.3.5/15.2.3.5-4-175.js
 * @description Object.create - one property in 'Properties' is an Arguments object which implements its own [[Get]] method to access the 'value' property (8.10.5 step 5.a)
 */


function testcase() {

        var argObj = (function () { return arguments; })();

        argObj.value = "ArgValue";

        var newObj = Object.create({}, {
            prop: argObj
        });

        return newObj.prop === "ArgValue";
    }
runTestCase(testcase);
