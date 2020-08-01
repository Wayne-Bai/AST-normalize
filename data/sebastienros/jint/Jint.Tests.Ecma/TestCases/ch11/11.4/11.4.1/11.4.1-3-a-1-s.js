/// Copyright (c) 2012 Ecma International.  All rights reserved. 
/**
 * @path ch11/11.4/11.4.1/11.4.1-3-a-1-s.js
 * @description Strict Mode - SyntaxError is thrown when deleting an un-resolvable reference
 * @onlyStrict
 */


function testcase() {
        "use strict";

        try {
            eval("delete obj");
            return false;
        } catch (e) {
            return e instanceof SyntaxError;
        }
    }
runTestCase(testcase);
