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

ES5Harness.registerTest({
    id: "15.2.3.6-4-531-4",

    path: "TestCases/chapter15/15.2/15.2.3/15.2.3.6/15.2.3.6-4-531-4.js",

    description: "Object.defineProperty will update [[Get]] and [[Set]] attributes of named accessor property 'P' successfully when [[Configurable]] attribute is true, 'O' is the global object (8.12.9 step 11)",

    test: function testcase() {

        var obj = fnGlobalObject();
        try {
            obj.verifySetFunction = "data";
            Object.defineProperty(obj, "property", {
                get: function () {
                    return obj.verifySetFunction;
                },
                set: function (value) {
                    obj.verifySetFunction = value;
                },
                configurable: true
            });

            obj.verifySetFunction1 = "data1";
            var getFunc = function () {
                return obj.verifySetFunction1;
            };
            var setFunc = function (value) {
                obj.verifySetFunction1 = value;
            };

            Object.defineProperty(obj, "property", {
                get: getFunc,
                set: setFunc
            });

            return accessorPropertyAttributesAreCorrect(obj, "property", getFunc, setFunc, "verifySetFunction1", false, true);
        } finally {
            delete obj.property;
            delete obj.verifySetFunction;
            delete obj.verifySetFunction1;
        }
    },

    precondition: function prereq() {
        return fnExists(Object.defineProperty) && fnExists(Object.getOwnPropertyDescriptor);
    }
});