/// Copyright (c) 2012 Ecma International.  All rights reserved. 
/**
 * @path ch15/15.3/15.3.4/15.3.4.5.2/15.3.4.5.2-4-4.js
 * @description [[Construct]] - length of parameters of 'target' is 0, length of 'boundArgs' is 0, length of 'ExtraArgs' is 1, and without 'boundThis'
 */


function testcase() {
        var func = function () {
            return new Boolean(arguments[0] === 1 && arguments.length === 1);
        };

        var NewFunc = Function.prototype.bind.call(func);

        var newInstance = new NewFunc(1);

        return newInstance.valueOf() === true;
    }
runTestCase(testcase);
