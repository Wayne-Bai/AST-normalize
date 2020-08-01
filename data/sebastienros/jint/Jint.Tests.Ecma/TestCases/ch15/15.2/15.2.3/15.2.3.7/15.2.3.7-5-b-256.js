/// Copyright (c) 2012 Ecma International.  All rights reserved. 
/**
 * @path ch15/15.2/15.2.3/15.2.3.7/15.2.3.7-5-b-256.js
 * @description Object.defineProperties - value of 'set' property of 'descObj' is primitive values string (8.10.5 step 8.b)
 */


function testcase() {

        var obj = {};

        try {
            Object.defineProperties(obj, {
                prop: {
                    set: "abcdef"
                }
            });
            return false;
        } catch (e) {
            return (e instanceof TypeError);
        }
    }
runTestCase(testcase);
