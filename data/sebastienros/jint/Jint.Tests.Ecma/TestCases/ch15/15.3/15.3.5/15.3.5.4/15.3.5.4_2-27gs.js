/// Copyright (c) 2012 Ecma International.  All rights reserved. 
/**
 * @path ch15/15.3/15.3.5/15.3.5.4/15.3.5.4_2-27gs.js
 * @description Strict mode - checking access to strict function caller from strict function (FunctionDeclaration defined within an Anonymous FunctionExpression inside strict mode)
 * @onlyStrict
 * @negative TypeError
 */


"use strict";
(function () {
    function f() {
        return gNonStrict();
    }
    return f();
})();


function gNonStrict() {
    return gNonStrict.caller;
}

