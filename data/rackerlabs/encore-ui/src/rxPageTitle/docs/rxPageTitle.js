/*jshint unused:false*/

// This file is used to help build the 'demo' documentation page and should be updated with example code
function rxPageTitleCtrl ($scope, rxPageTitle) {
    $scope.changeTitle = function () {
        rxPageTitle.setTitle($scope.newTitle);
    };

    $scope.refreshTitle = function () {
        $scope.pageTitle = rxPageTitle.getTitle();
    };

    $scope.refreshTitle();
}
