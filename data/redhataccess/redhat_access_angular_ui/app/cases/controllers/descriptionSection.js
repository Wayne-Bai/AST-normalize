'use strict';
angular.module('RedhatAccess.cases').controller('DescriptionSection', [
    '$scope',
    'CaseService',
    function ($scope, CaseService) {
        $scope.CaseService = CaseService;
    }
]);