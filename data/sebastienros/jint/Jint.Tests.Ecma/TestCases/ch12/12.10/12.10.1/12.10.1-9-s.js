/// Copyright (c) 2012 Ecma International.  All rights reserved. 
/**
 * @path ch12/12.10/12.10.1/12.10.1-9-s.js
 * @description with statement in strict mode throws SyntaxError (strict function expression)
 * @onlyStrict
 */


function testcase() {
  try {
    eval("\
          var f = function () {\
                \'use strict\';\
                var o = {}; \
                with (o) {}; \
              }\
        ");
    return false;
  }
  catch (e) {
    return (e instanceof SyntaxError) ;
  }
 }
runTestCase(testcase);
