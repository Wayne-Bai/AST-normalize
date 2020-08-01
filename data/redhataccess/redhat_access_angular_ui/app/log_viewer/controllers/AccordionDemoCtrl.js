'use strict';
angular.module('RedhatAccess.logViewer').controller('AccordionDemoCtrl', [
    '$scope',
    'accordian',
    function ($scope, accordian) {
        $scope.oneAtATime = true;
        $scope.groups = accordian.getGroups();
    }
]);