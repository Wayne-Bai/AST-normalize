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
    id: "15.2.3.6-4-588",

    path: "TestCases/chapter15/15.2/15.2.3/15.2.3.6/15.2.3.6-4-588.js",

    description: "ES5 Attributes - [[Get]] field of inherited property of [[Prototype]] internal property is correct (Object.create)",

    test: function testcase() {
        var appointment = {};

        var data1 = 1001;
        Object.defineProperty(appointment, "startTime", {
            get: function () {
                return data1;
            },
            enumerable: true,
            configurable: false
        });
        var data2 = "NAME";
        Object.defineProperty(appointment, "name", {
            get: function () {
                return data2;
            },
            set: function (value) {
                data2 = value;
            },
            enumerable: true,
            configurable: true
        });

        var meeting = Object.create(appointment);
        var data3 = "In-person meeting";
        Object.defineProperty(meeting, "conferenceCall", {
            get: function () {
                return data3;
            },
            enumerable: true,
            configurable: false
        });

        var teamMeeting = Object.create(meeting);

        var hasOwnProperty = !teamMeeting.hasOwnProperty("name") &&
            !teamMeeting.hasOwnProperty("startTime") &&
            !teamMeeting.hasOwnProperty('startTime');

        return hasOwnProperty && teamMeeting.name === "NAME" &&
            teamMeeting.startTime === 1001 &&
            teamMeeting.conferenceCall === "In-person meeting";
    },

    precondition: function prereq() {
        return fnExists(Object.defineProperty);
    }
});

