(function (controllers) {
  'use strict';

  controllers.controller('DeletePageDialogCtrl', ['$rootScope', '$scope', 'ngDialog', function ($rootScope, $scope, ngDialog) {
    $scope.question = 'Are you sure that you want to delete the page: ' + $rootScope.pageName;

    $scope.confirmDialog = function () {
      ngDialog.close();
      $rootScope.$broadcast('delete', { pageName: $rootScope.pageName });
    };
    $scope.cancelDialog = function () {
      ngDialog.close();
    };
  }]);
})(angular.module('mdwiki.controllers'));

