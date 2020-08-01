/*
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  Using Angular's '.animate', all fade animations are created with javaScript.

  @FadeAnimation
    Constructor function that returns a new animation object that has all
    required methods for ngAnimate ex: this.enter(), this.leave(), etc

  @effect
    The actual animation that will be applied to the element
     enter: style to be applied when angular triggers the enter event
     leave: style to be applied when angular triggers the leave event
     inverse: style to be appiled to offset the enter event
     animation: the name of the animtion for the eventing system
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

*/

angular.module('fx.animations.fades', ['fx.animations.fades.factory'])

.animation('.fx-fade-normal', ['FadeAnimation', function (FadeAnimation){
  var effect = {
    enter: {opacity: 1},
    leave: {opacity: 0},
    animation: 'fade-normal'
  };
  return new FadeAnimation(effect);
}])


.animation('.fx-fade-down', ['FadeAnimation', function (FadeAnimation){
  var effect = {
    enter: {opacity: 1, transform: 'translateY(0)'},
    leave: {opacity: 0, transform: 'translateY(-20px)'},
    inverse: {opacity: 0, transform: 'translateY(20px)'},
    animation: 'fade-down'
  };
  return new FadeAnimation(effect);
}])

.animation('.fx-fade-down-big', ['FadeAnimation', function (FadeAnimation){
  var effect = {
    enter: {opacity: 1, transform: 'translateY(0)'},
    leave: {opacity: 0, transform: 'translateY(-2000px)'},
    inverse: {opacity: 0, transform: 'translateY(2000px)'},
    animation: 'fade-down-big'
  };
  return new FadeAnimation(effect);
}])

.animation('.fx-fade-left', ['FadeAnimation', function (FadeAnimation){
  var effect = {
    enter: {opacity: 1, transform: 'translateX(0)'},
    leave: {opacity: 0, transform: 'translateX(-20px)'},
    inverse: {opacity: 0, transform: 'translateX(20px)'},
    animation: 'fade-left'
  };
  return new FadeAnimation(effect);
}])

.animation('.fx-fade-left-big', ['FadeAnimation', function (FadeAnimation){
  var effect = {
    enter: {opacity: 1, transform: 'translateX(0)'},
    leave: {opacity: 0, transform: 'translateX(-2000px)'},
    inverse: {opacity: 0, transform: 'translateX(2000px)'},
    animation: 'fade-left-big'
  };

  return new FadeAnimation(effect);
}])

.animation('.fx-fade-right', ['FadeAnimation', function (FadeAnimation){
  var effect = {
    enter: {opacity: 1, transform: 'translateX(0)'},
    leave: {opacity: 0, transform:'translateX(20px)'},
    inverse: {opacity: 0, transform: 'translateX(-20px)'},
    animation: 'fade-right'
  };

  return new FadeAnimation(effect);
}])

.animation('.fx-fade-right-big', ['FadeAnimation', function (FadeAnimation){
  var effect = {
    enter: {opacity: 1, transform: 'translateX(0)'},
    leave: {opacity: 0, transform:'translateX(2000px)'},
    inverse: {opacity: 0, transform: 'translateX(-2000px)'},
    animation: 'fade-right-big'
  };

  return new FadeAnimation(effect);
}])

.animation('.fx-fade-up', ['FadeAnimation', function (FadeAnimation){
  var effect = {
    enter: {opacity: 1, transform: 'translateY(0)'},
    leave: {opacity: 0, transform:'translateY(20px)'},
    inverse: {opacity: 0, transform: 'translateY(-20px)'},
    animation: 'fade-up'
  };

  return new FadeAnimation(effect);
}])

.animation('.fx-fade-up-big', ['FadeAnimation', function (FadeAnimation){
  var effect = {
    enter: {opacity: 1, transform: 'translateY(0)'},
    leave: {opacity: 0, transform:'translateY(2000px)'},
    inverse: {opacity: 0, transform: 'translateY(-2000px)'},
    animation: 'fade-up-big'
  };

  return new FadeAnimation(effect);
}])

.animation('.fx-fade-overlay', ['FadeAnimation', function(FadeAnimation) {
  var effect = {
    enter: {opacity: 0.7},
    leave: {opacity: 0},
    inverse: {opacity: 0},
    animation: 'fade-overlay'
  };

  return new FadeAnimation(effect);
}]);
