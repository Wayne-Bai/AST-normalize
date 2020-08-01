/// Copyright (c) 2012 Ecma International.  All rights reserved. 
/**
 * Refer 11.1.5; 
 *   The production
 *      PropertyNameAndValueList :  PropertyNameAndValueList , PropertyAssignment
 *    4. If previous is not undefined then throw a SyntaxError exception if any of the following conditions are true
 *      c.IsAccessorDescriptor(previous) is true and IsDataDescriptor(propId.descriptor) is true.
 *
 * @path ch11/11.1/11.1.5/11.1.5_4-4-c-2.js
 * @description Object literal - SyntaxError if a set accessor property definition is followed by a data property definition with the same name
 */


function testcase() {
  try
  {
    eval("({set foo(x){}, foo : 1});");
    return false;
  }
  catch(e)
  {
    return e instanceof SyntaxError;
  }
 }
runTestCase(testcase);
