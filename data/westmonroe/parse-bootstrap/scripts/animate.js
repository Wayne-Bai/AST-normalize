//Filename: animate.js

define([
  // These are path alias that we configured in our bootstrap
  'jquery'
], function($){

  var slideIn = function (container, element) {
    $(container).addClass('animated fadeInUpBig');
    $(container).empty().append(element);
  }

  return {
    slideIn: slideIn
  };
  // What we return here will be used by other modules
});
