'use strict';

angular.module('integrationApp')
  .controller('NestedScrollViewCtrl', function ($scope, $famous) {
    
    var EventHandler = $famous['famous/core/EventHandler'];
    $scope.eventHandler = new EventHandler();
    $scope.list = [{content: "famous"}, {content: "angular"}, {content: "rocks!"}];
    
    $scope.options = {
      scrollViewOuter: {
        direction: 0,
        paginated: true
      },
      scrollViewInner :{
        direction: 1
      }
    };

  });
