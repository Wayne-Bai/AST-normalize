/// Copyright (c) 2012 Ecma International.  All rights reserved. 
/**
 * @path ch13/13.2/13.2-6-s.js
 * @description StrictMode - writing a property named 'caller' of function objects is not allowed outside the function
 * @onlyStrict
 */



function testcase() {
        var foo = new Function("'use strict';");
        try {
            foo.caller = 41;
            return false;
        }
        catch (e) {
            return e instanceof TypeError;
        }
}
runTestCase(testcase);