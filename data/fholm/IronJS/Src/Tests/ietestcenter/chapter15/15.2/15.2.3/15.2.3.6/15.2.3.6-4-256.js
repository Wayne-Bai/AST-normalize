/// Copyright (c) 2009 Microsoft Corporation 
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

ES5Harness.registerTest({
    id: "15.2.3.6-4-256",

    path: "TestCases/chapter15/15.2/15.2.3/15.2.3.6/15.2.3.6-4-256.js",

    description: "Object.defineProperty - 'O' is an Array, 'name' is an array index named property, 'name' is accessor property and 'desc' is accessor descriptor, and the [[Configurable]] attribute value of 'name' is false, test TypeError is thrown if the [[Get]] field of 'desc' is present, and the [[Get]] field of 'desc' is an object and the [[Get]] attribute value of 'name' is undefined (15.4.5.1 step 4.c)",

    test: function testcase() {
        var arrObj = [];
        function getFunc() {
            return 12;
        }

        Object.defineProperty(arrObj, "1", {
            get: getFunc
        });

        try {
            Object.defineProperty(arrObj, "1", {
                get: undefined
            });
            return false;
        } catch (e) {
            var hasProperty = arrObj.hasOwnProperty("1");
            var desc = Object.getOwnPropertyDescriptor(arrObj, "1");

            var verifyGet = arrObj[1] === getFunc();

            var verifySet = desc.hasOwnProperty("set") && typeof desc.set === "undefined";

            var verifyEnumerable = false;
            for (var p in arrObj) {
                if (p === "1") {
                    verifyEnumerable = true
                }
            }

            var verifyConfigurable = false;
            delete arrObj[1];
            verifyConfigurable = arrObj.hasOwnProperty("1");

            return e instanceof TypeError && hasProperty && verifyGet &&
                verifySet && !verifyEnumerable && verifyConfigurable;
        }
    },

    precondition: function prereq() {
        return fnExists(Object.defineProperty) && fnSupportsArrayIndexGettersOnArrays();
    }
});
