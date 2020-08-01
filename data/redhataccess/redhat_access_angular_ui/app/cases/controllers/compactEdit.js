'use strict';
angular.module('RedhatAccess.cases').controller('CompactEdit', [
    '$scope',
    'strataService',
    '$stateParams',
    'CaseService',
    'AttachmentsService',
    '$rootScope',
    'AUTH_EVENTS',
    'CASE_EVENTS',
    'securityService',
    'AlertService',
    function ($scope, strataService, $stateParams, CaseService, AttachmentsService, $rootScope, AUTH_EVENTS, CASE_EVENTS, securityService, AlertService) {
        $scope.securityService = securityService;
        $scope.caseLoading = true;
        $scope.domReady = false;
        $scope.init = function () {
            strataService.cases.get($stateParams.id).then(function (resp) {
                var caseJSON = resp[0];
                var cacheHit = resp[1];
                if (!cacheHit) {
                    CaseService.defineCase(caseJSON);
                } else {
                    CaseService.kase = caseJSON;
                }
                $rootScope.$broadcast(CASE_EVENTS.received);
                $scope.caseLoading = false;
                if (caseJSON.product !== undefined && caseJSON.product.name !== undefined) {
                    strataService.products.versions(caseJSON.product.name).then(function (versions) {
                        CaseService.versions = versions;
                    }, function (error) {
                        AlertService.addStrataErrorMessage(error);
                    });
                }
                $scope.domReady = true;
            });
            strataService.cases.attachments.list($stateParams.id).then(function (attachmentsJSON) {
                AttachmentsService.defineOriginalAttachments(attachmentsJSON);
            }, function (error) {
                AlertService.addStrataErrorMessage(error);
            });
        };
        if (securityService.loginStatus.isLoggedIn) {
            $scope.init();
        }
        $rootScope.$on(AUTH_EVENTS.loginSuccess, function () {
            $scope.init();
            AlertService.clearAlerts();
        });
    }
]);