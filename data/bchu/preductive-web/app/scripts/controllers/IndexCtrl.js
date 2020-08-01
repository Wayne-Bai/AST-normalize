'use strict';

angular.module('todoWebApp')
  .controller('IndexCtrl', function ($scope, Tasks) {
    $scope.keyup = function($event) {
      if ($event.keyCode === 27) {
        $scope.$broadcast('outerClicked');
      }
    };
    $scope.click = function() {
      $scope.$broadcast('outerClicked');
    };

    $scope.$watch(
      function () { return Tasks.activeTask; },
      function (activeTask) {
        if (activeTask) {
          $scope.activeTaskTitle = 'TODO: ' + activeTask.name;
        }
        else {
          $scope.activeTaskTitle = 'Create a task!';
        }
      });
  });
