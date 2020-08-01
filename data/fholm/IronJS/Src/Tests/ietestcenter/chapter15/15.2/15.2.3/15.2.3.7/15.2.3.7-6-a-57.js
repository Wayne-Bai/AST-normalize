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
    id: "15.2.3.7-6-a-57",

    path: "TestCases/chapter15/15.2/15.2.3/15.2.3.7/15.2.3.7-6-a-57.js",

    description: "Object.defineProperties - both desc.[[Get]] and P.[[Get]] are two objects which refer to the same object (8.12.9 step 6)",

    test: function testcase() {

        var obj = {};

        function get_Func() {
            return 10;
        }

        Object.defineProperty(obj, "foo", {
            get: get_Func
        });

        Object.defineProperties(obj, {
            foo: {
                get: get_Func
            }
        });

        var verifyEnumerable = false;
        for (var p in obj) {
            if (p === "foo") {
                verifyEnumerable = true;
            }
        }

        var verifyValue = false;
        verifyValue = (obj.foo === 10);

        var verifyConfigurable = false;
        delete obj.foo;
        verifyConfigurable = obj.hasOwnProperty("foo");

        var desc = Object.getOwnPropertyDescriptor(obj, "foo");
        return verifyConfigurable && !verifyEnumerable && verifyValue && typeof (desc.set) === "undefined" && desc.get === get_Func;
    },

    precondition: function prereq() {
        return fnExists(Object.defineProperties) && fnExists(Object.defineProperty) && fnExists(Object.getOwnPropertyDescriptor);
    }
});
