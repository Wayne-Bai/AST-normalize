/**
 * This is a hacky way to get unit tests passing
 * HTMLDivElement.getBoundingClientRect for some reason
 * didn't seem to be defined in the unit testing framework
 * So in true haxx0r fashion we have the following override....
 **/

HTMLDivElement.prototype.getBoundingClientRect = function() {
  return {
    "height": 1.0,
    "width": 1.0,
    "left": 0.0,
    "right": 1.0,
    "top": 0.0,
    "bottom": 1.0,
  };
};

/**
 * Another hack so that I can control the width of the window
 * for unit testing purposes
 **/
HTMLHtmlElement.prototype.clientWidth = 1200;
