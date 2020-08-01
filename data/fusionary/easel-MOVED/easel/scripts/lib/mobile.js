/* Fixes scale bug on orientation change in Mobile Safari */
/*! Credits:
 * http://www.blog.highub.com/mobile-2/a-fix-for-iphone-viewport-scale-bug/
 ** https://github.com/mathiasbynens (https://gist.github.com/901295)
 ***> https://github.com/jdalton (https://gist.github.com/903131)
*/
// 1) won't restrict viewport if JS is disabled
// 2) uses capture phase
// 3) assumes last viewport meta is the one to edit (incase for some odd reason there is more than one)
// 4) feature inference (no sniffs, behavior should be ignored on other enviros)
// 5) removes event handler after fired
!function(doc) {
  var addEvent = 'addEventListener',
      type = 'gesturestart',
      qsa = 'querySelectorAll',
      scales = [1, 1],
      meta = qsa in doc ? doc[qsa]('meta[name=viewport]') : [];

  if (meta.length && addEvent in doc) {
    meta = meta[meta.length - 1];
    fix();
    scales = [0.25, 1.6];
    doc[addEvent](type, fix, !0);
  }
  function fix() {
    meta.content = 'width=device-width,minimum-scale=' + scales[0] + ',maximum-scale=' + scales[1];
    doc.removeEventListener(type, fix, !0);
  }

}(document);

// Update viewport orientation
// http://menacingcloud.com/?c=orientationScreenWidth
//-----------------------------
$.getOrientation = function() {

    var orientation = window.orientation;

    if (orientation === undefined) {
      // No JavaScript orientation support. Work it out.
      if ( document.documentElement.clientWidth > document.documentElement.clientHeight ) {
        orientation = 'landscape';
      } else {
        orientation = 'portrait';
      }
    } else if (orientation === 0 || orientation === 180) {
       orientation = 'portrait';
    } else {
      orientation = 'landscape';
    }
    return orientation;
    

};

// Get current scale
// http://menacingcloud.com/?c=viewportScale
//-------------------
$.getScale = function() {
  // Get viewport width
  var screenWidth, viewportScale,
      viewportWidth = document.documentElement.clientWidth,
      orientation = $.getOrientation();

  // Abort. Screen width is greater than the viewport width (not fullscreen).
  if(screen.width > viewportWidth) {
    // console.log('Aborted viewport scale measurement. Screen width > viewport width');
    return;
  }

  // Get the orientation corrected screen width
  screenWidth = screen.width;

  if (orientation === 'portrait') {
    // Take smaller of the two dimensions
    if (screen.width > screen.height) {
      screenWidth = screen.height;
    }

  } else if (screen.width < screen.height) {
    // Take larger of the two dimensions
      screenWidth = screen.height;
    }

  }

  // Calculate viewport scale
  var pageScale = viewportWidth / window.innerWidth;
  var scaleRatio = viewportWidth / screenWidth;

  return pageScale / scaleRatio;

};
/*
 * jSwipe - jQuery Plugin
 * http://plugins.jquery.com/project/swipe
 * http://ryanscherf.com/demos/swipe/
 *
 * Copyright (c) 2009 Ryan Scherf <http://ryanscherf.com/>
 * Modified by Mathias Bynens <http://mathiasbynens.be/>
 * Licensed under the MIT license
 *
 * $Date: 2011-04-20 (Fri, 22 Apr 2011) $
 * $version: 0.2.0
 *
 * This jQuery plugin will work on any device that supports touch events,
 * while degrading gracefully (without throwing errors) on others.
 */
(function($) {

  $.fn.swipe = function(options) {

    // Default thresholds & swipe functions
    options = $.extend(true, {}, $.fn.swipe.options, options);

    return this.each(function() {
      var self = this;
      var originalCoord = { 'x': 0, 'y': 0 },
          finalCoord = { 'x': 0, 'y': 0 };

      // Screen touched, store the initial coordinates
      function touchStart(event) {
        var touch = event.originalEvent.targetTouches[0];
        originalCoord.x = touch.pageX;
        originalCoord.y = touch.pageY;
      }

      // Store coordinates as finger is swiping
      function touchMove(event) {
        var touch = event.originalEvent.targetTouches[0];
        finalCoord.x = touch.pageX; // Updated X,Y coordinates
        finalCoord.y = touch.pageY;
        event.preventDefault();
      }

      // Done swiping
      // Swipe should only be on X axis, ignore if swipe on Y axis
      // Calculate if the swipe was left or right
      function touchEnd() {
        var changeY = originalCoord.y - finalCoord.y,
            changeX,
            threshold = options.threshold,
            y = threshold.y,
            x = threshold.x;
        if (changeY < y && changeY > (- y)) {
          changeX = originalCoord.x - finalCoord.x;
          if (changeX > x) {
            options.swipeLeft.call(self);
          } else if (changeX < (- x)) {
            options.swipeRight.call(self);
          }
        }
      }

      // Swipe was canceled
      function touchCancel() {
        //console.log('Canceling swipe gesture…')
      }

      // Add gestures to all swipable areas
      $(self).bind({
        'touchstart.swipe': touchStart,
        'touchmove.swipe': touchMove,
        'touchend.swipe': touchEnd,
        'touchcancel.swipe': touchCancel
      });

    });

  };

  $.fn.swipe.options = {
    'threshold': {
      'x': 30,
      'y': 30
    },
    'swipeLeft': function() {
      // alert('swiped left');
    },
    'swipeRight': function() {
      // alert('swiped right');
    }
  };

}(jQuery));