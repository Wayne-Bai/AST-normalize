/// Copyright (c) 2012 Ecma International.  All rights reserved. 
/**
 * @path ch13/13.1/13.1-1-2.js
 * @description Duplicate identifier allowed in non-strict function expression parameter list
 */


function testcase()
{
  try 
  {
    eval('(function foo(a,a){})');
    return true;
  }
  catch (e) { return false }
  }
runTestCase(testcase);
