(function (angular) {
  'use strict';

  angular.module('DemoApp', ['pickadate']).controller('DemoAppCtrl', function ($scope) {
    $scope.curDate = new Date();

    $scope.curTime = new Date();

    $scope.optionsDate = new Date();
    $scope.options = {
      format: 'dd/mm/yy', selectYears: true
    };

    $scope.validationDate = undefined;

  });
})(angular);
