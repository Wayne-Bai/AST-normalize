/// Copyright (c) 2012 Ecma International.  All rights reserved. 
/**
 * @path ch15/15.2/15.2.3/15.2.3.7/15.2.3.7-5-b-202.js
 * @description Object.defineProperties - 'get' property of 'descObj' is own accessor property without a get function that overrides an inherited accessor property (8.10.5 step 7.a)
 */


function testcase() {
        var obj = {};

        var proto = {};

        Object.defineProperty(proto, "get", {
            get: function () {
                return function () {
                    return "inheritedAccessorProperty";
                };
            }
        });

        var Con = function () { };
        Con.prototype = proto;

        var descObj = new Con();

        Object.defineProperty(descObj, "get", {
            set: function () { }
        });

        Object.defineProperties(obj, {
            property: descObj
        });

        return typeof (obj.property) === "undefined";
    }
runTestCase(testcase);
