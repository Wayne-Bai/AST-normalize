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

    var serviceId = 'practitionerService';

    angular.module('FHIRStarter').factory(serviceId, ['common', 'dataCache', 'fhirClient', 'fhirServers', practitionerService]);

    function practitionerService(common, dataCache, fhirClient, fhirServers) {
        var dataCacheKey = 'localPractitioners';
        var linksCacheKey = 'linksPractitioners';
        var itemCacheKey = 'contextPractitioner';
        var $q = common.$q;

        var service = {
            addPractitioner: addPractitioner,
            deleteCachedPractitioner: deleteCachedPractitioner,
            deletePractitioner: deletePractitioner,
            getCachedPractitioner: getCachedPractitioner,
            getCachedSearchResults: getCachedSearchResults,
            getPractitioner: getPractitioner,
            getPractitioners: getPractitioners,
            initializeNewPractitioner: initializeNewPractitioner,
            updatePractitioner: updatePractitioner
        };

        return service;

        function addPractitioner(resource) {
            _prepArrays(resource);
            var deferred = $q.defer();
            fhirServers.getActiveServer()
                .then(function (server) {
                    var url = server.baseUrl + "/Practitioner";
                    fhirClient.addResource(url, resource)
                        .then(function (results) {
                            deferred.resolve(results);
                        }, function (outcome) {
                            deferred.reject(outcome);
                        });
                });
            return deferred.promise
        }

        function deleteCachedPractitioner(hashKey, resourceId) {
            var deferred = $q.defer();
            deletePractitioner(resourceId)
                .then(getCachedSearchResults,
                function (error) {
                    deferred.reject(error);
                })
                .then(removeFromCache)
                .then(function () {
                    deferred.resolve()
                });
            return deferred.promise;

            function removeFromCache(searchResults) {
                var cachedPractitioners = searchResults.entry;
                searchResults.entry = _.remove(cachedPractitioners, function (item) {
                    return item.$$hashKey !== hashKey;
                });
                searchResults.totalResults = (searchResults.totalResults - 1);
                dataCache.addToCache(dataCacheKey, searchResults);

                deferred.resolve();
            }
        }

        function deletePractitioner(resourceId) {
            var deferred = $q.defer();
            fhirClient.deleteResource(resourceId)
                .then(function (results) {
                    deferred.resolve(results);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getCachedPractitioner(hashKey) {
            var deferred = $q.defer();
            getCachedSearchResults()
                .then(getPractitioner,
                function () {
                    deferred.reject('Practitioner search results not found in cache.');
                });
            return deferred.promise;

            function getPractitioner(searchResults) {
                var cachedPractitioner;
                var cachedPractitioners = searchResults.entry;
                for (var i = 0, len = cachedPractitioners.length; i < len; i++) {
                    if (cachedPractitioners[i].$$hashKey === hashKey) {
                        cachedPractitioner = cachedPractitioners[i];
                        cachedPractitioner.content.resourceId = cachedPractitioner.id;
                        cachedPractitioner.content.hashKey = cachedPractitioner.$$hashKey;
                        break;
                    }
                }
                if (cachedPractitioner) {
                    deferred.resolve(cachedPractitioner.content)
                } else {
                    deferred.reject('Practitioner not found in cache: ' + hashKey);
                }
            }
        }

        function getCachedSearchResults() {
            var deferred = $q.defer();
            var cachedSearchResults = dataCache.readFromCache(dataCacheKey);
            if (cachedSearchResults) {
                deferred.resolve(cachedSearchResults);
            } else {
                deferred.reject('Search results not cached.');
            }
            return deferred.promise;
        }

        function getPractitioner(resourceId) {
            var deferred = $q.defer();
            fhirClient.getResource(resourceId)
                .then(function (data) {
                    dataCache.addToCache(dataCacheKey, data);
                    deferred.resolve(data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getPractitioners(baseUrl, nameFilter, page, size) {
            var deferred = $q.defer();
            var params = '';
            var take = size || 20;
            var skip = page ? (page - 1) * take : 0;

            if (angular.isUndefined(nameFilter)) {
                deferred.reject('Invalid search input');
            }
            var names = nameFilter.split(' ');
            if (names.length === 1) {
                params = 'name=' + names[0];
            } else {
                params = 'given=' + names[0] + '&family=' + names[1];
            }
            params = params + '&_count=' + take;

            fhirClient.getResource(baseUrl + '/Practitioner/?' + params)
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function initializeNewPractitioner() {
            return {
                "active": true,
                "address": [],
                "birthDate": null,
                "communication": [],
                "gender": null,
                "identifier": [],
                "location": [],
                "name": null,
                "organization": null,
                "period": null,
                "photo": [],
                "qualification": [],
                "resourceType": "Practitioner",
                "role": [],
                "specialty": [],
                "telecom": []
            }
        }

        function updatePractitioner(resourceVersionId, resource) {
            _prepArrays(resource);
            var deferred = $q.defer();
            fhirClient.updateResource(resourceVersionId, resource)
                .then(function (results) {
                    deferred.resolve(results);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function _addToCache(practitioner) {
            var cachedPractitioners = searchResults.entry;
            _.remove(cachedPractitioners,function (item) {
                return item.$$hashKey !== hashKey;
            }).then(function (reducedItems) {
                    searchResults.entry = reducedItems;
                    searchResults.totalResults = (searchResults.totalResults - 1);
                    dataCache.addToCache(dataCacheKey, searchResults);
                });
            deferred.resolve();
        }

        function _prepArrays(resource) {
            if (resource.address.length === 0) {
                resource.address = null;
            }
            if (resource.communication.length === 0) {
                resource.communication = null;
            }
            if (resource.identifier.length === 0) {
                resource.identifier = null;
            }
            if (resource.location.length === 0) {
                resource.location = null;
            }
            if (resource.photo.length === 0) {
                resource.photo = null;
            }
            if (resource.qualification.length === 0) {
                resource.qualification = null;
            }
            if (resource.role.length === 0) {
                resource.role = null;
            }
            if (resource.specialty.length === 0) {
                resource.specialty = null;
            }
            if (resource.telecom.length === 0) {
                resource.telecom = null;
            }
            return $q.when(resource);
        }
    }
})();