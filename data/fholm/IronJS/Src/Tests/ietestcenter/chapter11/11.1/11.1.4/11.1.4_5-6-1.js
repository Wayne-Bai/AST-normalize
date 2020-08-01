﻿/// Copyright (c) 2009 Microsoft Corporation 
/// 
/// Redistribution and use in source and binary forms, with or without modification, are permitted provided
/// that the following conditions are met: 
///    * Redistributions of source code must retain the above copyright notice, this list of conditions and
///      the following disclaimer. 
///    * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and 
///      the following disclaimer in the documentation and/or other materials provided with the distribution.  
///    * Neither the name of Microsoft nor the names of its contributors may be used to
///      endorse or promote products derived from this software without specific prior written permission.
/// 
/// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR
/// IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
/// FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE
/// FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
/// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
/// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
/// OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
/// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

/*
Refer 11.1.4; 
The production
ElementList : ElementList , Elisionopt AssignmentExpression
6.Call the [[DefineOwnProperty]] internal method of array with arguments ToString(ToUint32((pad+len)) and the Property Descriptor { [[Value]]: initValue
    , [[Writable]]: true, [[Enumerable]]: true, [[Configurable]]: true}, and false.
*/

ES5Harness.registerTest({
    id: "11.1.4_5-6-1",

    path: "TestCases/chapter11/11.1/11.1.4/11.1.4_5-6-1.js",

    description: "Initialize array using ElementList (ElementList , Elisionopt AssignmentExpression) when index property (read-only) exists in Array.prototype (step 6)",
   
    test: function testcase() {
        try {
            Object.defineProperty(Array.prototype, "1", {
                value: 100,
                writable: false,
                configurable: true
            });
            var arr = [101, 12];

            return arr.hasOwnProperty("1") && arr[1] === 12;
        } finally {
            delete Array.prototype[1];
        }
    },

    precondition: function prereq() {
        return fnExists(Object.defineProperty);
    }
});
