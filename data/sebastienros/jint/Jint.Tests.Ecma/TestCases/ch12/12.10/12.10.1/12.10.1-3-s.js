/// Copyright (c) 2012 Ecma International.  All rights reserved. 
/**
 * @path ch12/12.10/12.10.1/12.10.1-3-s.js
 * @description with statement in strict mode throws SyntaxError (nested strict function)
 * @onlyStrict
 */


function testcase() {
  try {
    // wrapping it in eval since this needs to be a syntax error. The
    // exception thrown must be a SyntaxError exception.
    eval("\
            function foo() {\
                function f() {\
                  \'use strict\'; \
                  var o = {}; \
                  with (o) {};\
                }\
              }\
        ");
    return false;
  }
  catch (e) {
    return (e instanceof SyntaxError);
  }
 }
runTestCase(testcase);
