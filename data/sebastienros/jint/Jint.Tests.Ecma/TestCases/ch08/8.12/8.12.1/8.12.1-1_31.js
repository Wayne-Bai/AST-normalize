/// Copyright (c) 2012 Ecma International.  All rights reserved. 
/**
 * @path ch08/8.12/8.12.1/8.12.1-1_31.js
 * @description Properties - [[HasOwnProperty]] (non-configurable, enumerable own setter property)
 */

function testcase() {

    var o = {};
    Object.defineProperty(o, "foo", {set: function() {;}, enumerable:true});
    return o.hasOwnProperty("foo");

}
runTestCase(testcase);
