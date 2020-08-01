/// Copyright (c) 2012 Ecma International.  All rights reserved. 
/**
 * @path ch15/15.2/15.2.3/15.2.3.7/15.2.3.7-0-2.js
 * @description Object.defineProperties must exist as a function taking 2 parameters
 */


function testcase() {
  if (Object.defineProperties.length === 2) {
    return true;
  }
 }
runTestCase(testcase);
