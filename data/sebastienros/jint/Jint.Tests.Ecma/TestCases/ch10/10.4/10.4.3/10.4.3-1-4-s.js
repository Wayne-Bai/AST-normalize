/// Copyright (c) 2012 Ecma International.  All rights reserved. 
/**
 * @path ch10/10.4/10.4.3/10.4.3-1-4-s.js
 * @description this is not coerced to an object in strict mode (boolean)
 * @noStrict
 */


function testcase() {

  function foo()
  {
    'use strict';
    return typeof(this);
  }

  function bar()
  {
    return typeof(this);
  }


  return foo.call(true) === 'boolean' && bar.call(true) === 'object';
 }
runTestCase(testcase);
