'use strict';

angular.module('integrationApp')
  .controller('DraggableCtrl', function ($scope, $famous) {
    var EventHandler = $famous['famous/core/EventHandler'];

    var data = [];
    data.push( {id: 0, name: 'zero', position: [10, 100], handler: new EventHandler() } );
    data.push( {id: 1, name: 'one',  position: [10, 200], handler: new EventHandler() } );
    data.push( {id: 2, name: 'two',  position: [10, 300], handler: new EventHandler() } );

    $scope.nodes = data;
    console.log($scope.nodes);

    $scope.remove = function() {
      $scope.nodes.splice(0, 1);
      console.log($scope.nodes);
    }
  });
