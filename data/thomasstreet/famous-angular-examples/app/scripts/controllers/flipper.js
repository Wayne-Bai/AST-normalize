'use strict';
//adapted from @continuata's code at https://github.com/Famous/famous-angular/issues/72 
angular.module('integrationApp')
  .controller('FlipperCtrl', function ($scope, $famous) {
    var EventHandler = $famous['famous/core/EventHandler'];

    $scope.evt = new EventHandler();
    
    $scope.flip = function(){
      $famous.find('#flipper')[0].flip();
    }

  }
);
