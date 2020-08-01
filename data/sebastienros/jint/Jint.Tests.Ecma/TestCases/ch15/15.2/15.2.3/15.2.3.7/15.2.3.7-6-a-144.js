/// Copyright (c) 2012 Ecma International.  All rights reserved. 
/**
 * @path ch15/15.2/15.2.3/15.2.3.7/15.2.3.7-6-a-144.js
 * @description Object.defineProperties -  'O' is an Array, 'name' is the length property of 'O', test the [[Value]] field of 'desc' is an Object which has an own valueOf method that returns an object and toString method that returns a string (15.4.5.1 step 3.c)
 */


function testcase() {

        var arr = [];
        var toStringAccessed = false;
        var valueOfAccessed = false;

        Object.defineProperties(arr, {
            length: {
                value: {
                    toString: function () {
                        toStringAccessed = true;
                        return '2';
                    },

                    valueOf: function () {
                        valueOfAccessed = true;
                        return {};
                    }
                }
            }
        });
        return arr.length === 2 && toStringAccessed && valueOfAccessed;
    }
runTestCase(testcase);
