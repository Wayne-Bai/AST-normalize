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

    var controllerId = 'compositions';

    angular.module('FHIRStarter').controller(controllerId,
        ['$location', 'common', 'config', 'fhirServers', 'compositionService', compositions]);

    function compositions($location, common, config, fhirServers, compositionService) {
        var vm = this;
        var applyFilter = function () {
        };
        var getLogFn = common.logger.getLogFn;
        var keyCodes = config.keyCodes;
        var log = getLogFn(controllerId);

        vm.activeServer = null;
        vm.busyMessage = "Contacting remote server ...";
        vm.filteredCompositions = [];
        vm.compositionsFilteredCount = 0;
        vm.isBusy = false;
        vm.goToComposition = goToComposition;
        vm.compositions = [];
        vm.compositionsCount = 0;
        vm.compositionsFilter = compositionFilter;
        vm.compositionsSearch = '';
        vm.pageChanged = pageChanged;
        vm.paging = {
            currentPage: 1,
            links: null,
            maxPagesToShow: 10,
            pageSize: 20,
            totalResults: 0
        };
        vm.refresh = refresh;
        vm.search = search;
        vm.title = 'Compositions';

        Object.defineProperty(vm.paging, 'pageCount', {
            get: function () {
                return Math.floor(vm.compositionsFilteredCount / vm.paging.pageSize) + 1;
            }
        });

        activate();

        function activate() {
            common.activateController([getActiveServer()], controllerId)
                .then(function () {
                    getCompositions(false);
                }, function (error) {
                    log('Error ' + error);
                })
                .then(function () {
                    applyFilter = common.createSearchThrottle(vm, 'compositions');
                    if (vm.compositionsSearch) {
                        applyFilter(true);
                    }
                });
        }

        function getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    return vm.activeServer = server;
                });
        }

        function getCompositionsFilteredCount() {
            return compositionService.getFilteredCount(vm.compositionsFilter)
                .then(function (data) {
                    vm.compositionsFilteredCount = data;
                });
        }

        function getCompositionsCount() {
            return compositionService.getCompositionsCount()
                .then(function (data) {
                    return vm.compositionsCount = data;
                });
        }

        function getCompositions(forceRefresh) {
            toggleSpinner(true);
            return compositionService.getCompositions(forceRefresh, vm.activeServer.baseUrl, vm.paging.currentPage, vm.paging.pageSize, vm.compositionsFilter)
                .then(function (data) {
                    vm.compositions = data;
                    getCompositionsFilteredCount();
                    if (!vm.compositionsCount || forceRefresh) {
                        getCompositionsCount();
                    }
                    toggleSpinner(false);
                    return data;
                }, function (error) {
                    toggleSpinner(false);
                    return error;
                });
        }

        function goToComposition(composition) {
            if (composition && composition.$$hashKey) {
                $location.path('/composition/' + composition.$$hashKey);
            }
        }

        function compositionFilter(composition) {
            var textContains = common.textContains;
            var searchText = vm.compositionsSearch;
            var isMatch = searchText ?
                textContains(composition.title, searchText)
                : true;
            return isMatch;
        }

        function pageChanged() {
            getCompositions(false);
        }

        function refresh() {
            getCompositions(true);
        }

        function search($event) {
            if ($event.keyCode === keyCodes.esc) {
                vm.compositionsSearch = '';
            }
            getCompositions();
        }

        function toggleSpinner(on) {
            vm.isBusy = on;
        }
    }
})();
