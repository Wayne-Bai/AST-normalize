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

    var controllerId = 'personDetail';

    angular.module('FHIRStarter').controller(controllerId,
        ['$location', '$routeParams', '$window', 'addressService', 'attachmentService', 'bootstrap.dialog', 'common', 'fhirServers', 'humanNameService', 'identifierService', 'patientService', 'personService', 'telecomService', 'valuesetService', personDetail]);

    function personDetail($location, $routeParams, $window, addressService, attachmentService, bsDialog, common, fhirServers, humanNameService, identifierService, patientService, personService, telecomService, valuesetService) {
        var vm = this;
        var logError = common.logger.getLogFn(controllerId, 'error');
        var logSuccess = common.logger.getLogFn(controllerId, 'success');
        var logWarning = common.logger.getLogFn(controllerId, 'warning');
        var $q = common.$q;

        vm.activeServer = null;
        vm.cancel = cancel;
        vm.activate = activate;
        vm.delete = deletePerson;
        vm.edit = edit;
        vm.getPatientReference = getPatientReference;
        vm.getRelationshipCodes = getRelationshipCodes;
        vm.getTitle = getTitle;
        vm.goBack = goBack;
        vm.isBusy = false;
        vm.isSaving = false;
        vm.isEditing = true;
        vm.loadingPatients = false;
        vm.person = undefined;
        vm.relationshipCodes = null;
        vm.save = save;
        vm.title = 'personDetail';

        Object.defineProperty(vm, 'canSave', {
            get: canSave
        });

        Object.defineProperty(vm, 'canDelete', {
            get: canDelete
        });

        activate();

        function activate() {
            common.activateController([getActiveServer()], controllerId).then(function () {
                getRelationshipCodes();
                getRequestedPerson();
            });
        }

        function cancel() {

        }

        function canDelete() {
            return !vm.isEditing;
        }

        function canSave() {
            return !vm.isSaving;
        }

        function deletePerson(person) {
            return bsDialog.deleteDialog(person.fullName)
                .then(confirmDelete);

            function confirmDelete() {
                if (person && person.resourceId && person.hashKey) {
                    personService.deleteCachedPerson(person.hashKey, person.resourceId)
                        .then(function () {
                            logSuccess("Deleted person " + person.fullName);
                            $location.path('/persons');
                        },
                        function (error) {
                            logError(common.unexpectedOutcome(error));
                        }
                    );
                }
            }
        }

        function edit(person) {
            if (person && person.hashKey) {
                $location.path('/person/' + person.hashKey);
            }
        }

        function getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    return vm.activeServer = server;
                });
        }

        function getPatientReference(input) {
            var deferred = $q.defer();
            vm.loadingPatients = true;
            patientService.getPatientReference(vm.activeServer.baseUrl, input)
                .then(function (data) {
                    vm.loadingPatients = false;
                    deferred.resolve(data);
                }, function (error) {
                    vm.loadingPatients = false;
                    logError(common.unexpectedOutcome(error));
                    deferred.reject();
                });
            return deferred.promise;
        }

        function getRelationshipCodes() {
            valuesetService.getExpansion(vm.activeServer.baseUrl, "http://hl7.org/fhir/vs/relatedperson-relationshiptype")
                .then(function (expansions) {
                    return vm.relationshipCodes = expansions;
                }, function (error) {
                    logError(error);
                });
        }

        function getRequestedPerson() {
            if ($routeParams.hashKey === 'new') {
                var data = personService.initializeNewPerson();
                intitializeRelatedData(data);
                vm.title = "Add Related Person";
                vm.isEditing = false;
            } else {
                if ($routeParams.hashKey) {
                    personService.getCachedPerson($routeParams.hashKey)
                        .then(intitializeRelatedData, function (error) {
                            logError(common.unexpectedOutcome(error));
                        });
                } else if ($routeParams.id) {
                    var resourceId = vm.activeServer.baseUrl + '/RelatedPerson/' + $routeParams.id;
                    personService.getPerson(resourceId)
                        .then(intitializeRelatedData, function (error) {
                            logError(common.unexpectedOutcome(error));
                        });
                }
            }

            function intitializeRelatedData(data) {
                vm.person = data;
                addressService.init([vm.person.address], true, 'single');
                attachmentService.init(vm.person.photo, "Photos");
                identifierService.init(vm.person.identifier);
                humanNameService.init([vm.person.name], 'single');
                vm.person.fullName = humanNameService.getFullName();
                if (vm.person.patient && vm.person.patient.reference) {
                    var reference = vm.person.patient.reference;
                    if (common.isAbsoluteUri(reference) === false) {
                        vm.person.patient.reference = vm.activeServer.baseUrl + '/' + reference;
                    }
                    if (angular.isUndefined(vm.person.patient.display)) {
                        vm.person.patient.display = reference;
                    }
                }
                if (vm.person.relationship) {
                    if (angular.isUndefined(vm.person.relationship.coding) || !angular.isArray(vm.person.relationship.coding))
                    {
                        vm.person.relationship = { "coding": []};
                    }
                } else {
                    vm.person.relationship = { "coding": []};
                }
                telecomService.init(vm.person.telecom, true, true);
                vm.title = getTitle();
            }
        }

        function getTitle() {
            var title = '';
            if (vm.person) {
                title = 'Edit ' + (vm.person.fullName || 'Unknown');
            }
            return title;

        }

        function goBack() {
            $window.history.back();
        }

        function save() {
            var person = personService.initializeNewPerson();
            if (humanNameService.getAll().length === 0) {
                logError("Person must have at least one name entry.");
                return;
            }
            toggleSpinner(true);
            person.address = addressService.mapFromViewModel()[0];
            //person.gender = demographicsService.getGender();
            person.identifier = identifierService.getAll();
            person.name = humanNameService.mapFromViewModel()[0];
            person.patient = vm.person.patient;
            person.photo = attachmentService.getAll();
            person.relationship = vm.person.relationship;
            person.telecom = telecomService.mapFromViewModel();
            if (vm.isEditing) {
                personService.updatePerson(vm.person.resourceId, person)
                    .then(processResult,
                    function (error) {
                        logError(common.unexpectedOutcome(error));
                        toggleSpinner(false);
                    });
            } else {
                personService.addPerson(person)
                    .then(processResult,
                    function (error) {
                        logError(common.unexpectedOutcome(error));
                        toggleSpinner(false);
                    });
            }

            function processResult(results) {
                var resourceVersionId = results.headers.location || results.headers["content-location"];
                if (angular.isUndefined(resourceVersionId)) {
                    logWarning("Person saved, but location is unavailable. CORS not implemented correctly at remote host.");
                } else {
                    vm.person.resourceId = common.setResourceId(vm.person.resourceId, resourceVersionId);
                    logSuccess("Person saved at " + resourceVersionId);
                }
                vm.person.fullName = humanNameService.getFullName();
                vm.isEditing = true;
                vm.title = getTitle();
                toggleSpinner(false);
            }
        }

        function toggleSpinner(on) {
            vm.isBusy = on;
        }
    }
})();