'use strict';

angular.module('integrationApp')
  .controller('DemoCtrl', function ($scope, $famous) {
    var GenericSync = $famous['famous/inputs/GenericSync'];
    var Transitionable = $famous['famous/transitions/Transitionable']
    var EventHandler = $famous['famous/core/EventHandler']

    var colors = [
      '#869B40',
      '#C2B02E',
      '#629286',
      '#B58963',
      '#9E9B8C'
    ];

    var strings = [
      'famo.us',
      'angular',
      'javascript',
      'web',
      'wow',
      'such',
      'great'
    ];

    var ELEMENTS = 150;
    var START_HUE = 320;
    var HUE_RANGE = 100;
    var SATURATION = 50;
    var LIGHTNESS = 50;
    var getHSL = function(index){
      var hue = (START_HUE + (HUE_RANGE * (index / ELEMENTS)));
      return "hsl(" +
        hue + "," +
        SATURATION + "%,"+
        LIGHTNESS + "%)";
    }

    $scope.surfs = _.map(_.range(ELEMENTS), function(i){
      return {
        content: _.sample(strings),
        bgColor: getHSL(i)
      }
    });

    $scope.scrollListener = new EventHandler();

    $scope.scrollListener.on('update', function(evt){
      console.log('scroll started');
    })

    setInterval(function(){
      for(var i = 0; i < ELEMENTS; i++){
        $scope.surfs[i].content = _.sample(strings);
      }
      if(!$scope.$$phase)
        $scope.$apply();
    }, 500);

    $scope.enginePipe = new EventHandler();
  });
