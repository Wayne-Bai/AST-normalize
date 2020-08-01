'use strict';

angular.module('integrationApp')
  .controller('CuboidCtrl', function ($scope, $famous) {
    var Timer = $famous['famous/utilities/Timer'];

    var _colors = ["#b58900","#cb4b16","#dc322f","#6c71c4","#268bd2","#2aa198","#859900"];


    var SPEED = [.03, -.03, .01];
    //var _rotate = [Math.PI / 4,0,0];
    var _rotate = [0,0,0];
    Timer.every(function(){
      _rotate[0] += SPEED[0];
      _rotate[1] += SPEED[1];
      _rotate[2] += SPEED[2];
    });

    $scope.getRotate = function(){
      return _rotate;
    }

    $scope.surfaces = _.map(_.range(6), function(i){
      return {bgColor: _colors[i]};
    });

  });
