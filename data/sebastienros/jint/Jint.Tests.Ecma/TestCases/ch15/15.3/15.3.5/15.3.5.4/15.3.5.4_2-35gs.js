/// Copyright (c) 2012 Ecma International.  All rights reserved. 
/**
 * @path ch15/15.3/15.3.5/15.3.5.4/15.3.5.4_2-35gs.js
 * @description Strict mode - checking access to strict function caller from non-strict function (Anonymous FunctionExpression defined within a FunctionExpression with a strict directive prologue)
 * @noStrict
 * @negative TypeError
 */


var f1 = function () {
    "use strict";
    return (function () {
        return gNonStrict();
    })();
}
f1();


function gNonStrict() {
    return gNonStrict.caller || gNonStrict.caller.throwTypeError;
}

