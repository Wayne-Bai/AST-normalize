/// Copyright (c) 2012 Ecma International.  All rights reserved. 
/**
 * @path ch07/7.6/7.6.1/7.6.1-3-2.js
 * @description Allow reserved words as property names by index assignment,verified with hasOwnProperty: break, case, do
 */


function testcase() {
        var tokenCodes  = {};
        tokenCodes['break'] = 0;
        tokenCodes['case'] = 1;
        tokenCodes['do'] = 2;
        var arr = [
            'break',
            'case',
            'do'
            ];
        for(var p in tokenCodes) {       
            for(var p1 in arr) {                
                if(arr[p1] === p) {
                    if(!tokenCodes.hasOwnProperty(arr[p1])) {
                        return false;
                    };
                }
            }
        }
        return true;
    }
runTestCase(testcase);
