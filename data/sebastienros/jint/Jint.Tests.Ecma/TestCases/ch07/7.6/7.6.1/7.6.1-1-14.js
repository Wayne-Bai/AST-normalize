/// Copyright (c) 2012 Ecma International.  All rights reserved. 
/**
 * @path ch07/7.6/7.6.1/7.6.1-1-14.js
 * @description Allow reserved words as property names at object initialization, verified with hasOwnProperty: public, yield, interface
 */


function testcase(){      
        var tokenCodes  = { 
            public: 0,
            yield: 1,
            interface: 2
        };
        var arr = [
            'public',
            'yield',
            'interface'
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
