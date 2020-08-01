/*
 *  Copyright 2013 Intel Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var t = require('ripple/platform/tizen/2.0/typecast'),
    SimpleCoordinates;

SimpleCoordinates = function (latitude, longitude) {
    var simpleCoordinates = {};

    t.SimpleCoordinates(arguments, this);

    this.__defineGetter__("latitude", function () {
        return simpleCoordinates.latitude;
    });
    this.__defineSetter__("latitude", function (val) {
        try {
            simpleCoordinates.latitude = t.double(val);
        } catch (e) {
        }
    });

    this.__defineGetter__("longitude", function () {
        return simpleCoordinates.longitude;
    });
    this.__defineSetter__("longitude", function (val) {
        try {
            simpleCoordinates.longitude = t.double(val);
        } catch (e) {
        }
    });

    simpleCoordinates.latitude  = latitude;
    simpleCoordinates.longitude = longitude;
};

module.exports = SimpleCoordinates;
