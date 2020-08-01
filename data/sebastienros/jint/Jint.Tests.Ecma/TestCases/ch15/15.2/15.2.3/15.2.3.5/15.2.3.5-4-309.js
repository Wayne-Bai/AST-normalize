/// Copyright (c) 2012 Ecma International.  All rights reserved. 
/**
 * @path ch15/15.2/15.2.3/15.2.3.5/15.2.3.5-4-309.js
 * @description Object.create - [[Configurable]] is set as false if it is absent in data descriptor of one property in 'Properties' (8.12.9 step 4.a.i)
 */


function testcase() {
        var isNotConfigurable = false;

        try {
            var newObj = Object.create({}, {
                prop: {
                    value: 1001,
                    writable: true,
                    enumerable: true
                }
            });
            var hasProperty = newObj.hasOwnProperty("prop");
            delete newObj.prop;
            isNotConfigurable = newObj.hasOwnProperty("prop");
            return hasProperty && isNotConfigurable;
        } catch (e) {
            return false;
        }
    }
runTestCase(testcase);
