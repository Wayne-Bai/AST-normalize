'use strict';


angular.module('integrationApp')
  .controller('AnimateCtrl', function ($scope, $famous) {
    //This route tests fa-animate functionality
    //As of authoring (6/22,) fa-animate is not yet
    //supported in the core library

    var Transitionable = $famous['famous/transitions/Transitionable'];
    var EventHandler = $famous['famous/core/EventHandler'];
    var STARTING_NUMBER = 1;


    $scope.handler = new EventHandler();

    
    var _width = 568;
    var _names = ["Lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipisicing", "elit"];
    // http://www.colourlovers.com/palette/629637/(%E2%97%95%E3%80%9D%E2%97%95)
    var _bgcolors = ["#FC9D9A", "#F9CDAD", "#C8C8A9"];
    var _colors = ["#FE4365", "#83AF9B"]
    var _generateItem = function(){
      return {
        id: Math.random(),
        name: _.sample(_names),
        bgcolor: _.sample(_bgcolors),
        color: _.sample(_colors),
        opacity: new Transitionable(0),
        transX: new Transitionable(-_width)
      }
    }

    $scope.remove = function(i){
      $scope.items.splice(i, 1);
    }

    $scope.add = function(){
      $scope.items.push(_generateItem())
    }


    $scope.items = _.map(_.range(STARTING_NUMBER), function(){
      return _generateItem();
    })

    $scope.enterAnimation = function(item){
      item.opacity.set(1, {duration: 1000, curve: "easeIn"})
      item.transX.set(0, {duration: 1000, curve: "easeIn"})
      return 1000;
    };

    $scope.leaveAnimation = function(item){
      item.opacity.set(0, {duration: 1000, curve: "easeIn"})
      item.transX.set(_width, {duration: 1000, curve: "easeIn"})
      return 1000;
    };

    setInterval(function(){
      $scope.add();
      if(!$scope.$$phase)
        $scope.$apply();
    }, 1000)

  });
