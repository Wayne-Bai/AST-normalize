/// Copyright (c) 2012 Ecma International.  All rights reserved. 
/**
 * @path ch15/15.2/15.2.3/15.2.3.3/15.2.3.3-4-144.js
 * @description Object.getOwnPropertyDescriptor returns data desc for functions on built-ins (Date.prototype.setMilliseconds)
 */


function testcase() {
  var desc = Object.getOwnPropertyDescriptor(Date.prototype, "setMilliseconds");
  if (desc.value === Date.prototype.setMilliseconds &&
      desc.writable === true &&
      desc.enumerable === false &&
      desc.configurable === true) {
    return true;
  }
 }
runTestCase(testcase);
