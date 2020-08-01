/// Copyright (c) 2012 Ecma International.  All rights reserved. 
/**
 * @path ch13/13.1/13.1-3-1.js
 * @description eval allowed as function identifier in non-strict function declaration
 */


function testcase()
{
  try 
  {
    eval("function eval(){};");
    return true;
  }
  catch (e) {  }  
 }
runTestCase(testcase);
