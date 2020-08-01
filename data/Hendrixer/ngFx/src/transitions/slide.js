angular.module('fx.transitions.slides', ['fx.transitions.create'])

.animation('.slide-in-left', ['SlideTransition', function (SlideTransition) {

  var effect = {
    from: { transform: 'translateZ(0) translateX(100%)'},
    duration: 2
  };

  return new SlideTransition(effect);
}])
.animation('.slide-out-left', ['SlideTransition', function (SlideTransition) {

  var effect = {
    to: { transform: 'translateZ(0) translateX(-100%)'},
    duration: 2
  };

  return new SlideTransition(effect);
}])
.animation('.slide-in-right', ['SlideTransition', function (SlideTransition) {

  var effect = {
    from: { transform: 'translateZ(0) translateX(-100%)'},
    duration: 2
  };

  return new SlideTransition(effect);

}])
.animation('.slide-out-right', ['SlideTransition', function (SlideTransition) {

  var effect = {
    to: { transform: 'translateZ(0) translateX(100%)'},
    duration: 2
  };

  return new SlideTransition(effect);
}])
.animation('.slide-in-down', ['SlideTransition', function (SlideTransition) {

  var effect = {
    from: { transform: 'translateZ(0) translateY(-100%)'},
    duration: 2
  };

  return new SlideTransition(effect);
}])
.animation('.slide-out-down', ['SlideTransition', function (SlideTransition) {

  var effect = {
    to: { transform: 'translateZ(0) translateY(100%)'},
    duration: 2
  };

  return new SlideTransition(effect);
}])
.animation('.slide-in-up', ['SlideTransition', function (SlideTransition) {

  var effect = {
    from: { transform: 'translateZ(0) translateY(100%)'},
    duration: 2
  };

  return new SlideTransition(effect);
}])
.animation('.slide-out-up', ['SlideTransition', function (SlideTransition) {

  var effect = {
    to: { transform: 'translateZ(0) translateY(-100%)'},
    duration: 2
  };

  return new SlideTransition(effect);
}])



.animation('.slide-in-left-fade', ['SlideTransition', function (SlideTransition) {

  var effect = {
    from: { opacity: '0.3', transform: 'translateZ(0) translateX(100%)'},
    duration: 2
  };

  return new SlideTransition(effect);
}])
.animation('.slide-out-left-fade', ['SlideTransition', function (SlideTransition) {

  var effect = {
    to: { opacity: '0.3', transform: 'translateZ(0) translateX(-100%)'},
    duration: 2
  };

  return new SlideTransition(effect);
}])
.animation('.slide-in-right-fade', ['SlideTransition', function (SlideTransition) {

  var effect = {
    from: { opacity: '0.3', transform: 'translateZ(0) translateX(-100%)'},
    duration: 2
  };

  return new SlideTransition(effect);

}])
.animation('.slide-out-right-fade', ['SlideTransition', function (SlideTransition) {

  var effect = {
    to: { opacity: '0.3', transform: 'translateZ(0) translateX(100%)'},
    duration: 2
  };

  return new SlideTransition(effect);
}])
.animation('.slide-in-down-fade', ['SlideTransition', function (SlideTransition) {

  var effect = {
    from: { opacity: '0.3', transform: 'translateZ(0) translateY(-100%)'},
    duration: 2
  };

  return new SlideTransition(effect);
}])
.animation('.slide-out-down-fade', ['SlideTransition', function (SlideTransition) {

  var effect = {
    to: { opacity: '0.3', transform: 'translateZ(0) translateY(100%)'},
    duration: 2
  };

  return new SlideTransition(effect);
}])
.animation('.slide-in-up-fade', ['SlideTransition', function (SlideTransition) {

  var effect = {
    from: { opacity: '0.3', transform: 'translateZ(0) translateY(100%)'},
    duration: 2
  };

  return new SlideTransition(effect);
}])
.animation('.slide-out-up-fade', ['SlideTransition', function (SlideTransition) {

  var effect = {
    to: { opacity: '0.3', transform: 'translateZ(0) translateY(-100%)'},
    duration: 2
  };

  return new SlideTransition(effect);
}]);

