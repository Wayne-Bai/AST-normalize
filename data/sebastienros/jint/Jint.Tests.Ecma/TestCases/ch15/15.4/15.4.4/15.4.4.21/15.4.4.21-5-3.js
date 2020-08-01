/// Copyright (c) 2012 Ecma International.  All rights reserved. 
/**
 * @path ch15/15.4/15.4.4/15.4.4.21/15.4.4.21-5-3.js
 * @description Array.prototype.reduce throws TypeError if 'length' is 0 (subclassed Array, length overridden to false (type conversion)), no initVal
 */


function testcase() {
  foo.prototype = new Array(1, 2, 3);
  function foo() {}
  var f = new foo();
  f.length = false;
  
  function cb(){}
  try {
    f.reduce(cb);
  }
  catch (e) {
    if (e instanceof TypeError) {
      return true;
    }
  }
 }
runTestCase(testcase);
