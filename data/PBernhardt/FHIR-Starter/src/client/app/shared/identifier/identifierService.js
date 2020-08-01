/**
 * Copyright 2014 Peter Bernhardt, et. al.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use
 * this file except in compliance with the License. You may obtain a copy of the
 * License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed
 * under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */
(function () {
    'use strict';

    var serviceId = 'identifierService';

    angular.module('FHIRStarter').factory(serviceId, ['common', identifierService]);

    function identifierService(common) {
        var identifiers = [];
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(serviceId);
        var _mode = 'multi';
        var _identifier = undefined;

        var service = {
            add: add,
            remove: remove,
            getAll: getAll,
            getMode: getMode,
            getSingle: getSingle,
            init: init,
            reset: reset,
            setSingle: setSingle
        }

        return service;

        function add(item) {
            var index = getIndex(item.$$hashKey);
            if (index > -1) {
                identifiers[index] = item;
            } else {
                identifiers.push(item);
            }
        }

        function getAll() {
            return _.compact(identifiers);
        }

        function getIndex(hashKey) {
            if (angular.isUndefined(hashKey) === false) {
                for (var i = 0, len = identifiers.length; i < len; i++) {
                    if (identifiers[i].$$hashKey === hashKey) {
                        return i;
                    }
                }
            }
            return -1;
        }

        function getMode() {
            return _mode;
        }

        function getSingle() {
            return _identifier;
        }

        function init(items, mode) {
            _mode = mode ? mode: 'multi';
            if (angular.isArray(items)) {
                identifiers = items;
            } else if (angular.isObject(items)){
                identifiers = [];
                identifiers.push(items);
            }
            else {
                identifiers = [];
                var defaultId = {"use": "usual", "system": "urn:fhir-starter:id", "value": common.generateUUID(), "label": "Auto-generated FHIR Starter identifier"};
                identifiers.push(defaultId);
            }
            _identifier = identifiers[0];
            return identifiers;
        }

        function remove(item) {
            var index = getIndex(item.$$hashKey);
            identifiers.splice(index, 1);
        }

        function reset() {
            while (identifiers.length > 0) {
                identifiers.pop();
            }
        }

        function setSingle(item) {
            _identifier = item;
        }
    }
})();