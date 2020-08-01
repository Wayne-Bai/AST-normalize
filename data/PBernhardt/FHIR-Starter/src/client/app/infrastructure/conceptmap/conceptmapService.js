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

    var serviceId = 'conceptmapService';

    angular.module('FHIRStarter').factory(serviceId, ['common', 'dataCache', 'fhirClient', conceptmapService]);

    function conceptmapService(common, dataCache, fhirClient) {

        var dataCacheKey = 'localConceptmaps';
        var linksCacheKey = 'linksConceptmaps';
        var isLoaded = false;
        var $q = common.$q;


        var service = {
            addConceptmap: addConceptmap,
            deleteConceptmap: deleteConceptmap,
            getCachedConceptmap: getCachedConceptmap,
            getFilteredCount: getFilteredCount,
            getRemoteConceptmap: getRemoteConceptmap,
            getConceptmapsCount: getConceptmapsCount,
            getConceptmaps: getConceptmaps,
            updateConceptmap: updateConceptmap
        };

        return service;

        function addConceptmap(baseUrl) {
            var deferred = $q.defer();
            var id = common.generateUUID();

            fhirClient.addResource(baseUrl + '/Conceptmap/' + id)
                .then(function (results) {
                    deferred.resolve(results);
                },
                function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function deleteConceptmap(resourceId) {
            var deferred = $q.defer();
            fhirClient.deleteResource(resourceId)
                .then(function (results) {
                    deferred.resolve(results);
                },
                function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getFilteredCount(filter) {
            var deferred = $q.defer();
            var filterCount = 0;
            _getAllLocal().then(function (data) {
                for (var i = 0, len = data.length; i < len; i++) {
                    if (filter(data[i])) {
                        filterCount = (filterCount + 1);
                    }
                }
                deferred.resolve(filterCount);
            });
            return deferred.promise;
        }

        function getRemoteConceptmap(resourceId) {
            var deferred = $q.defer();
            fhirClient.getResource(resourceId)
                .then(function (data) {
                    deferred.resolve(data);
                },
                function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getCachedConceptmap(hashKey) {
            var deferred = $q.defer();
            _getAllLocal()
                .then(getConceptmap,
                function () {
                    deferred.reject('Conceptmap search results not found in cache.');
                });
            return deferred.promise;

            function getConceptmap(cachedEntries) {
                var cachedConceptmap;
                for (var i = 0, len = cachedEntries.length; i < len; i++) {
                    if (cachedEntries[i].$$hashKey === hashKey) {
                        cachedConceptmap = cachedEntries[i];
                        break;
                    }
                }
                if (cachedConceptmap) {
                    deferred.resolve(cachedConceptmap)
                } else {
                    deferred.reject('Conceptmap not found in cache: ' + hashKey);
                }
            }
        }

        function getConceptmapsCount() {
            var deferred = $q.defer();
            if (_areConceptmapsLoaded()) {
                _getAllLocal().then(function (data) {
                    deferred.resolve(data.length);
                });
            } else {
                return deferred.resolve(0);
            }
            return deferred.promise;
        }

        function getConceptmaps(forceRemote, baseUrl, page, size, filter) {
            var deferred = $q.defer();
            var take = size || 20;
            var skip = page ? (page - 1) * take : 0;

            if (_areConceptmapsLoaded() && !forceRemote) {
                _getAllLocal().then(getByPage);
            } else {
                fhirClient.getResource(baseUrl + '/ConceptMap?_count=200')
                    .then(querySucceeded,
                    function (outcome) {
                        deferred.reject(outcome);
                    }).then(getByPage);
            }

            function getByPage(entries) {
                var pagedConceptmaps;
                var filteredEntries = [];

                if (filter) {
                    for (var i = 0, len = entries.length; i < len; i++) {
                        if (filter(entries[i])) {
                            filteredEntries.push(entries[i]);
                        }
                    }
                } else {
                    filteredEntries = entries;
                }

                if (filteredEntries.length < size) {
                    pagedConceptmaps = filteredEntries;
                } else {
                    var start = (skip < filteredEntries.length) ? skip : (filteredEntries - size);
                    var items = ((start + size) >= filteredEntries.length) ? (filteredEntries.length) : (start + size);
                    pagedConceptmaps = filteredEntries.slice(start, items);
                }
                deferred.resolve(pagedConceptmaps);
            }

            function querySucceeded(results) {
                _areConceptmapsLoaded(true);
                dataCache.addToCache(dataCacheKey, results.data);
                return results.data.entry;
            }

            return deferred.promise;
        }

        function updateConceptmap(resourceId, resource) {
            var deferred = $q.defer();

            fhirClient.addResource(resourceId, resource)
                .then(function (results) {
                    deferred.resolve(results);
                },
                function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function _getAllLocal() {
            var cachedConceptmaps = dataCache.readFromCache(dataCacheKey);
            return $q.when(cachedConceptmaps.entry);
        }

        function _areConceptmapsLoaded(value) {
            if (value === undefined) {
                return isLoaded;
            }
            return isLoaded = true;
        }
    }
})();