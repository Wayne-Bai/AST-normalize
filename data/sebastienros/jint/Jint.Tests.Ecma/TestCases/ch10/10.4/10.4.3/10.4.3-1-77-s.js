/// Copyright (c) 2012 Ecma International.  All rights reserved. 
/**
 * @path ch10/10.4/10.4.3/10.4.3-1-77-s.js
 * @description Strict Mode - checking 'this' (strict function declaration called by Function.prototype.bind(null)())
 * @onlyStrict
 */
    
function testcase() {
function f() { "use strict"; return this===null;};
return f.bind(null)();
}
runTestCase(testcase);