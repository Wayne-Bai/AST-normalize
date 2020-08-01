/// Copyright (c) 2012 Ecma International.  All rights reserved. 
/**
 * @path ch07/7.6/7.6.1/7.6.1.2/7.6.1.2-10-s.js
 * @description Strict Mode - SyntaxError isn't thrown when 'IMPLEMENTS' occurs in strict mode code
 * @onlyStrict
 */


function testcase() {
        "use strict";
        var IMPLEMENTS = 1;
        return IMPLEMENTS === 1;
    }
runTestCase(testcase);
