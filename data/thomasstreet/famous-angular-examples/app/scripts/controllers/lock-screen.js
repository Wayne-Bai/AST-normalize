'use strict';

angular.module('integrationApp')
  .controller('LockScreenCtrl', function ($scope, $famous) {
    var EventHandler = $famous['famous/core/EventHandler'];
    var Transitionable = $famous['famous/transitions/Transitionable'];
    var Engine = $famous['famous/core/Engine'];
    $scope.enginePipe = new EventHandler();
    Engine.pipe($scope.enginePipe);


    //TODO:  either set the scrollview's initial position to the second page,
    //       or make it double-wide and offset it x: -1 * screenWidth



    var _width = 320;
    var _height = 568;
    $scope.options = {
      mainScrollView: {
        paginated: true,
        direction: 0, //horizontal
        speedLimit: 5,
        margin: 10000
      },
      numberPadGridLayout: {
        dimensions: [3, 4],
        cellSize: [.3 * _width, .1 * _height]
      },
      inputDotsGridLayout: {
        dimensions: [4, 1],
        cellSize: [.12 * _width, 20]
      }
    }

    $scope.sizes = {
      numberButton: [77, 77],
      bgImage: [_width, _height],
      enterPasscodeSurface: [undefined, 100],
      numberPadGridLayout: [.9 * _width, .7 * _height - 20],
      inputDotsGridLayout: [.478 * _width, 20],
      inputDot: [15, 15],
      slideToUnlockText: [.45 * _width, 24],
      calendar: [undefined, 30],
      clock: [undefined, 200],
      emergencyText: [75, 50],
      topCapsule: [40, 8]
    }

    $scope.positions = {
      numberPadGridLayout: [.085 * _width, 150, 500],
      emergencyText: [.085 * _width, _height - 36, 2],
      deleteText: [-(.085 * _width), _height - 36, 2],
      enterPasscodeText: [0, 45, 2],
      inputDotsGridLayout: [.3 * _width, 85, 2],
      slideToUnlockText: [0, _height - 100, 2],
      clock: [0, 28, 2],
      calendar: [0, 130, 2],
      topCapsule: [143, 0, 2]
    }

    $scope.numberButtons = [
      { number: 1, letters: "", opacity: new Transitionable(0)},
      { number: 2, letters: "ABC", opacity: new Transitionable(0)},
      { number: 3, letters: "DEF", opacity: new Transitionable(0)},
      { number: 4, letters: "GHI", opacity: new Transitionable(0)},
      { number: 5, letters: "JKL", opacity: new Transitionable(0)},
      { number: 6, letters: "MNO", opacity: new Transitionable(0)},
      { number: 7, letters: "PQRS", opacity: new Transitionable(0)},
      { number: 8, letters: "TUV", opacity: new Transitionable(0)},
      { number: 9, letters: "WXYZ", opacity: new Transitionable(0)},
      { number: "",letters: "", opacity: new Transitionable(0)},
      { number: 0, letters: "", opacity: new Transitionable(0)}
    ];

    $scope.buttonTap = function(numberButton){
      if(!_inputLocked){
        $scope.shiftInputDots();
        numberButton.opacity.set(1);
        numberButton.opacity.set(0, {duration: 400, curve: 'linear'});
      }
    };


    $scope.inputDots = [
      {val: false},
      {val: false},
      {val: false},
      {val: false}
    ];

    $scope.testLog = function(arg) {
      console.log('test', arg);
    }

    var _inputLocked = false;
    var _dotIndex = 0;
    var DOTS = 4;
    $scope.shiftInputDots = function(){
      _dotIndex = (_dotIndex + 1);
      for(var i = 0; i < DOTS; i++){
        $scope.inputDots[i].val = i < _dotIndex;
      }
      if(_dotIndex >= DOTS){
        _inputLocked = true;
        $scope.fireDotShakeAnimation(function(){
          _dotIndex = -1;
          $scope.shiftInputDots();
          _inputLocked = false;
          if(!$scope.$$phase)
            $scope.$apply();
        })
      }
    }

    var val = [0,0,200]
    $scope.move = function(){
      return val;
    }

    $scope.unshiftInputDots = function(){
      _dotIndex = Math.max(-1,(_dotIndex - 2));
      $scope.shiftInputDots();
    }

    var _scrollView = undefined;
    $scope.bgOpacity = function(){
      _scrollView = _scrollView || $famous.find('#main-scroll-view')[0].renderNode;
      if(_scrollView){
        var perPosition = $scope.scrollXPosition();
        return perPosition;
      } else
        return 0;
    };

    $scope.scrollXPosition = function(){
      window.$f = $famous;
      _scrollView = _scrollView || $famous.find('#main-scroll-view')[0].renderNode;
      if(_scrollView && _scrollView._node){
        var page = _scrollView._node.index;
        var absPosition = _width * page + _scrollView.getPosition();
        var perPosition = Math.max(0, Math.min(1, absPosition / (_width)));
        return 1 - perPosition;
      }
    };


    $scope.fireButtonAnimation = function(index){
      $famous.find('#number-button-animation-' + index)[0].replay();
    }

    $scope.fireDotShakeAnimation = function(callback){
      $famous.find('#dot-shake-animation')[0].replay(callback);
    }

  });
