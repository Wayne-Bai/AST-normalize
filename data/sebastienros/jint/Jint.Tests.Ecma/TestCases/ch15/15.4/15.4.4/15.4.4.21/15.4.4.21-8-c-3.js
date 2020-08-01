/// Copyright (c) 2012 Ecma International.  All rights reserved. 
/**
 * @path ch15/15.4/15.4.4/15.4.4.21/15.4.4.21-8-c-3.js
 * @description Array.prototype.reduce throws TypeError when elements assigned values are deleted and initialValue is not present
 */


function testcase() { 
 
  function callbackfn(prevVal, curVal, idx, obj)
  {
  }

  var arr = [1,2,3,4,5];
  delete arr[0];
  delete arr[1];
  delete arr[2];
  delete arr[3];
  delete arr[4];
  try {
    arr.reduce(callbackfn);
  } 
  catch(e) {
    if(e instanceof TypeError)
      return true;  
  }
 }
runTestCase(testcase);
