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

    var controllerId = 'dashboard';

    angular.module('FHIRStarter').controller(controllerId, ['common', 'conformanceService', 'fhirServers', 'organizationService', 'patientService', 'profileService', dashboard]);

    function dashboard(common, conformanceService, fhirServers, organizationService, patientService, profileService) {
        var getLogFn = common.logger.getLogFn;
        var logError = getLogFn(controllerId, "error");
        var logSuccess = getLogFn(controllerId, "success");
        var vm = this;

        vm.activeServer = null;
        vm.busyMessage = "Contacting remote server ...";
        vm.cacheInfo = null;
        vm.changeServer = changeServer;
        vm.conformance = null;
        vm.isBusy = false;
        vm.servers = [];
        vm.title = 'Dashboard';

        activate();

        function activate() {
            var promises = [getServers(), getActiveServer()];
            common.activateController(promises, controllerId)
                .then(function () {
                    if (vm.activeServer) {
                        fetchConformance(vm.activeServer);
                    }
                });
        }

        function changeServer(id) {
            conformanceService.clearCache();
            organizationService.clearCache();
            patientService.clearCache();
            fhirServers.getServerById(id)
                .then(function (selectedServer) {
                    return vm.activeServer = selectedServer;
                }, function (error) {
                    logError('Error ' + error);
                    toggleSpinner(false);
                })
                .then(setActiveServer)
                .then(fetchConformance)
                .then(fetchProfiles);
        }

        function fetchConformance(server) {
            if (server) {
                conformanceService.getConformance(vm.activeServer.baseUrl)
                    .then(function (conformance) {
                        logSuccess('Loaded conformance statement for ' + vm.activeServer.name);
                        return vm.conformance = conformance;
                    }, function (error) {
                        logError(error);
                    });
            }
        }

        function fetchProfiles() {
            profileService.clearCache();
            profileService.getProfiles(true, vm.activeServer.baseUrl, 0, 20, '')
                .then(function (data) {
                    logSuccess('Loaded profiles for ' + vm.activeServer.name);
                }, function (error) {
                    logError('Failed retrieving Profiles from remote server. Error code: ' + error.status + '\n' + error.outcome);
                });
        }

        function getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    return vm.activeServer = server;
                });
        }

        function getServers() {
            fhirServers.getAllServers()
                .then(function (servers) {
                    return vm.servers = servers;
                });
        }

        function setActiveServer(server) {
            fhirServers.setActiveServer(server);
            return server;
        }

        function toggleSpinner(on) {
            vm.isBusy = on;
        }
    }
})();