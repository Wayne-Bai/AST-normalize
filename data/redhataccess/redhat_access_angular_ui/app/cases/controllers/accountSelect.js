'use strict';
angular.module('RedhatAccess.cases').controller('AccountSelect', [
    '$scope',
    'strataService',
    'AlertService',
    'CaseService',
    'RHAUtils',
    'translate',
    function ($scope, strataService, AlertService, CaseService, RHAUtils, translate) {
        $scope.CaseService = CaseService;
        $scope.selectUserAccount = function () {
            $scope.loadingAccountNumber = true;
            strataService.accounts.list().then(function (response) {
                $scope.loadingAccountNumber = false;
                CaseService.account.number = response;
                $scope.populateAccountSpecificFields();
            }, function (error) {
                $scope.loadingAccountNumber = false;
                AlertService.addStrataErrorMessage(error);
            });
        };
        $scope.alertInstance = null;
        $scope.populateAccountSpecificFields = function () {
            if (RHAUtils.isNotEmpty(CaseService.account.number)) {
                strataService.accounts.get(CaseService.account.number).then(function () {
                    if (RHAUtils.isNotEmpty($scope.alertInstance)) {
                        AlertService.removeAlert($scope.alertInstance);
                    }
                    CaseService.populateUsers();
                }, function () {
                    if (RHAUtils.isNotEmpty($scope.alertInstance)) {
                        AlertService.removeAlert($scope.alertInstance);
                    }
                    $scope.alertInstance = AlertService.addWarningMessage(translate('Account not found.'));
                    CaseService.users = [];
                });
            }
        };
    }
]);