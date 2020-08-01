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

    var controllerId = 'practitionerDetail';

    angular.module('FHIRStarter').controller(controllerId,
        ['$location', '$routeParams', '$window', 'addressService', 'attachmentService', 'bootstrap.dialog', 'common', 'demographicsService', 'fhirServers', 'humanNameService', 'identifierService', 'organizationService', 'practitionerService', 'qualificationService', 'telecomService', 'valuesetService', practitionerDetail]);

    function practitionerDetail($location, $routeParams, $window, addressService, attachmentService, bsDialog, common, demographicsService, fhirServers, humanNameService, identifierService, organizationService, practitionerService, qualificationService, telecomService, valuesetService) {
        var vm = this;
        var logError = common.logger.getLogFn(controllerId, 'error');
        var logSuccess = common.logger.getLogFn(controllerId, 'success');
        var logWarning = common.logger.getLogFn(controllerId, 'warning');
        var $q = common.$q;

        vm.activeServer = null;
        vm.calculateAge = calculateAge;
        vm.cancel = cancel;
        vm.activate = activate;
        vm.delete = deletePractitioner;
        vm.edit = edit;
        vm.getOrganizationReference = getOrganizationReference;
        vm.getTitle = getTitle;
        vm.goBack = goBack;
        vm.isBusy = false;
        vm.isSaving = false;
        vm.isEditing = true;
        vm.loadingOrganizations = false;
        vm.practitioner = undefined;
        vm.removeRole = removeRole;
        vm.removeSpecialty = removeSpecialty;
        vm.save = save;
        vm.selectedRole = null;
        vm.selectRole = selectRole;
        vm.selectedSpecialty = null;
        vm.selectSpecialty = selectSpecialty;
        vm.title = 'practitionerDetail';

        Object.defineProperty(vm, 'canSave', {
            get: canSave
        });

        Object.defineProperty(vm, 'canDelete', {
            get: canDelete
        });

        activate();

        function activate() {
            common.activateController([getActiveServer()], controllerId)
                .then(function () {
                    getPractitionerRoles();
                    getPractitionerSpecialties();
                    getRequestedPractitioner();
                });
        }

        function calculateAge(birthDate) {
            if (birthDate) {
                var ageDifMs = Date.now() - birthDate.getTime();
                var ageDate = new Date(ageDifMs); // miliseconds from epoch
                return Math.abs(ageDate.getUTCFullYear() - 1970);
            } else {
                return undefined;
            }
        }

        function cancel() {

        }

        function canDelete() {
            return !vm.isEditing;
        }

        function canSave() {
            return !vm.isSaving;
        }

        function deletePractitioner(practitioner) {
            return bsDialog.deleteDialog(practitioner.fullName)
                .then(confirmDelete);

            function confirmDelete() {
                if (practitioner && practitioner.resourceId && practitioner.hashKey) {
                    practitionerService.deleteCachedPractitioner(practitioner.hashKey, practitioner.resourceId)
                        .then(function () {
                            logSuccess("Deleted practitioner " + practitioner.resourceId);
                            $location.path('/practitioners');
                        },
                        function (error) {
                            logError(common.unexpectedOutcome(error));
                        }
                    );
                }
            }
        }

        function edit(practitioner) {
            if (practitioner && practitioner.hashKey) {
                $location.path('/practitioner/' + practitioner.hashKey);
            }
        }

        function getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    return vm.activeServer = server;
                });
        }

        function getPractitionerRoles() {
            valuesetService.getExpansion(vm.activeServer.baseUrl, "http://hl7.org/fhir/vs/practitioner-role")
                .then(function (expansions) {
                    return vm.practitionerRoles = expansions;
                }, function (error) {
                    logError(common.unexpectedOutcome(error));
                });
        }

        function getPractitionerSpecialties() {
            valuesetService.getExpansion(vm.activeServer.baseUrl, "http://hl7.org/fhir/vs/practitioner-specialty")
                .then(function (expansions) {
                    return vm.practitionerSpecialties = expansions;
                }, function (error) {
                    logError(common.unexpectedOutcome(error));
                });
        }

        function getOrganizationReference(input) {
            var deferred = $q.defer();
            vm.loadingOrganizations = true;
            organizationService.getOrganizationReference(vm.activeServer.baseUrl, input)
                .then(function (data) {
                    vm.loadingOrganizations = false;
                    deferred.resolve(data);
                }, function (error) {
                    vm.loadingOrganizations = false;
                    logError(common.unexpectedOutcome(error));
                    deferred.reject();
                });
            return deferred.promise;
        }

        function getRequestedPractitioner() {
            if ($routeParams.hashKey === 'new') {
                var data = practitionerService.initializeNewPractitioner();
                intitializeRelatedData(data);
                vm.title = 'Add New Practitioner';
                vm.isEditing = false;
            } else {
                if ($routeParams.hashKey) {
                    practitionerService.getCachedPractitioner($routeParams.hashKey)
                        .then(intitializeRelatedData, function (error) {
                            logError(common.unexpectedOutcome(error));
                        });
                } else if ($routeParams.id) {
                    var resourceId = vm.activeServer.baseUrl + '/Practitioner/' + $routeParams.id;
                    practitionerService.getPractitioner(resourceId)
                        .then(intitializeRelatedData, function (error) {
                            logError(common.unexpectedOutcome(error));
                        });
                }
            }
        }

        function getTitle() {
            var title = '';
            if (vm.practitioner) {
                title = 'Edit ' + (vm.practitioner.fullName || 'Unknown');
            } else {
                title = 'Add New Practitioner';
            }
            return title;
        }

        function goBack() {
            $window.history.back();
        }

        function intitializeRelatedData(data) {
            vm.practitioner = data;
            humanNameService.init([vm.practitioner.name], 'single');
            demographicsService.init(vm.practitioner.gender, vm.practitioner.maritalStatus);
            demographicsService.setBirthDate(vm.practitioner.birthDate);
            attachmentService.init(vm.practitioner.photo, "Photos");
            identifierService.init(vm.practitioner.identifier);
            addressService.init(vm.practitioner.address, true, 'multi');
            telecomService.init(vm.practitioner.telecom, true, true);
            qualificationService.init(vm.practitioner.qualification);
            vm.practitioner.fullName = humanNameService.getFullName();
            vm.practitioner.role = vm.practitioner.role || [];
            vm.practitioner.specialty = vm.practitioner.specialty || [];
            if (vm.practitioner.organization && vm.practitioner.organization.reference) {
                var reference = vm.practitioner.organization.reference;
                if (common.isAbsoluteUri(reference) === false) {
                    vm.practitioner.organization.reference = vm.activeServer.baseUrl + '/' + reference;
                }
                if (angular.isUndefined(vm.practitioner.organization.display)) {
                    vm.practitioner.organization.display = reference;
                }
            }
            vm.title = getTitle();
        }

        function processResult(results) {
            var resourceVersionId = results.headers.location || results.headers["content-location"];
            if (angular.isUndefined(resourceVersionId)) {
                logWarning("Practitioner saved, but location is unavailable. CORS not implemented correctly at remote host.");
            } else {
                vm.practitioner.resourceId = common.setResourceId(vm.practitioner.resourceId, resourceVersionId);
                logSuccess("Practitioner saved at " + resourceVersionId);
            }
            vm.practitioner.fullName = humanNameService.getFullName();
            vm.isEditing = true;
            vm.title = getTitle();
            toggleSpinner(false);
        }

        function removeRole(item) {
            _.remove(vm.practitioner.role, function (removedItem) {
                return removedItem.$$hashKey === item.$$hashKey;
            });
        }

        function removeSpecialty(item) {
            _.remove(vm.practitioner.specialty, function (removedItem) {
                return removedItem.$$hashKey === item.$$hashKey;
            });
        }

        function save() {
            var practitioner = practitionerService.initializeNewPractitioner();
            if (humanNameService.getAll().length === 0) {
                logError("Practitioner must have at least one name entry.");
                return;
            }
            toggleSpinner(true);
            practitioner.name = humanNameService.mapFromViewModel()[0];
            practitioner.photo = attachmentService.getAll();
            //         practitioner.birthDate = demographicsService.getBirthDate();
            //       practitioner.gender = demographicsService.getGender();
            practitioner.address = addressService.mapFromViewModel();
            practitioner.telecom = telecomService.mapFromViewModel();
            practitioner.identifier = identifierService.getAll();
            practitioner.qualification = qualificationService.getAll();
            practitioner.organization = vm.practitioner.organization;
            practitioner.role = vm.practitioner.role;
            practitioner.specialty = vm.practitioner.specialty;
            practitioner.active = vm.practitioner.active;
            if (vm.isEditing) {
                practitionerService.updatePractitioner(vm.practitioner.resourceId, practitioner)
                    .then(processResult,
                    function (error) {
                        logError(common.unexpectedOutcome(error));
                        toggleSpinner(false);
                    });
            } else {
                practitionerService.addPractitioner(practitioner)
                    .then(processResult,
                    function (error) {
                        logError(common.unexpectedOutcome(error));
                        toggleSpinner(false);
                    });
            }
        }

        function selectRole() {
            var parsedItem = JSON.parse(vm.selectedRole);
            if (parsedItem !== null) {
                var coding = { "coding": [parsedItem], "text": parsedItem.display };
                if (_.first(vm.practitioner.role, coding).length === 0) {
                    vm.practitioner.role.push(coding);
                }
            }
        }

        function selectSpecialty() {
            var parsedItem = JSON.parse(vm.selectedSpecialty);
            if (parsedItem !== null) {
                var coding = { "coding": [parsedItem], "text": parsedItem.display };
                if (_.first(vm.practitioner.specialty, coding).length === 0) {
                    vm.practitioner.specialty.push(coding);
                }
            }
        }

        function toggleSpinner(on) {
            vm.isBusy = on;
        }
    }
})();