// Site.animate.js

/*

This module is used to add simple animations to sprites (elements contained either inline or background images) within panel elements on a page.

The animation parameters are set in a Site.data.animate JSON object

*/

// Check if base namespace is defined so it isn't overwritten
var Site = Site || {};

// Create child namespace
Site.animate = (function ($) {
  "use strict";

  var $window = $(window),
      panelSel = "[data-type=panel]",
      spriteSel = "[data-type=sprite]",
      $panels = $(panelSel),
      animateSprites = false,

      // Set initial offsets of sprites
      // - These are margins (negative or positive) applied as inline styles
      setSpritePositions = function (sprites) {
        var $theseSprites = $(sprites);

        $theseSprites.each(function (){
          var $thisSprite = $(this),

              spriteID = $thisSprite.attr('id');

          if(spriteID && Site.data.animate.panels[spriteID]){
            var spriteData = Site.data.animate.panels[spriteID],
                startX = spriteData.startX,
                endX = spriteData.endX,
                deltaX = endX - startX,
                staticX = spriteData.staticX,
                originX = spriteData.originX,
                startY = spriteData.startY,
                endY = spriteData.endY,
                deltaY = endY - startY,
                staticY = spriteData.staticY,
                originY = spriteData.originY;

            // If starting X position is greater than end position
            // i.e. sprite is moving from right to left
            spriteData.deltaXVal = deltaX;

            //Site.utils.cl(deltaX);

            if(deltaX < 0){
              spriteData.deltaX = -1;
            }
            // else if starting X position is less than end position
            // i.e. sprite is moving from left to right
            else if (deltaX > 0) {
              spriteData.deltaX = 1;
            }
            // else if start and end X positions are equal
            // i.e. sprite is not moving horizontally
            else {
              spriteData.deltaX = 0;
            }

            spriteData.deltaYVal = deltaY;

            // If starting Y position is greater than end position
            // i.e. sprite is moving upwards
            if(deltaY < 0){
              spriteData.deltaY = -1;
            }
            // else if sprite is moving downwards
            else if (deltaY > 0) {
              spriteData.deltaY = 1;
            // else if sprite is not moving in this direction
            } else {
              spriteData.deltaY = 0;
            }


            //Site.utils.cl(animateSprites);

            if(animateSprites === true){

              if (originX === "right") {
                $thisSprite.css('right', startX).css('top', startY);
              } else {
                $thisSprite.css('left', startX).css('top', startY);
              }

            } else {
              if (originX === "right") {
                $thisSprite.css('right', staticX).css('top', staticY);
              } else {
                $thisSprite.css('left', staticX).css('top', staticY);
              }
            }
          }
        });
      },

      setPanels = function () {
        $panels.each(function() {

          var $panel = $(this),
              $panelSprites = $(spriteSel, $panel),
              offsetCoords = $panel.offset(),
              topOffset = offsetCoords.top,
              panelViewed = false;

          if($('html').hasClass('no-touch')){
            animateSprites = true;
          }

          //Site.utils.cl($panel.attr('id') + " has topOffset of " + topOffset);

          setSpritePositions($panelSprites);

          $window.scroll(function() {
            // If this section is in view

            var windowHeight = $window.height(),
                scrollTop = $window.scrollTop();

            // If panel is within viewport...
            if ( (scrollTop + windowHeight) > (topOffset) && (topOffset + $panel.height()) > scrollTop && animateSprites === true ) {

              // Fire analytics event to show user has scrolled to this point
              // - check of panelViewed var means this only fires once
              if (panelViewed === false) {
                var panelID = $panel.attr('id');
                Site.analytics.trackPageEvent('Homepage Scroll','Panel Viewed',panelID);
                panelViewed = true;
              }

              // Distance of top of panel from bottom of window.
              // This is a positive number we'll use to control the animation of elements within the panel
              var panelTopOffsetFromBottomOfViewport = (parseInt(scrollTop + windowHeight, 10) - topOffset);

              // Distance of top of panel above top of window
              // This is a positive number we'll use to control the animation of elements within the panel
              var panelTopOffsetAboveTopOfViewport = parseInt(topOffset - scrollTop, 10);
              // Make this a positive number
              panelTopOffsetAboveTopOfViewport = -panelTopOffsetAboveTopOfViewport;

              // Animate each sprite within the panel
              $panelSprites.each(function() {

                var $sprite = $(this),
                    spriteID = $sprite.attr('id');


                if(spriteID && Site.data.animate.panels[spriteID]){
                  var spriteData = Site.data.animate.panels[spriteID],
                      startX = spriteData.startX,
                      endX = spriteData.endX,
                      originX = spriteData.originX,
                      deltaX = spriteData.deltaX,
                      deltaXVal = spriteData.deltaXVal,
                      delayX = spriteData.delayX || 0,
                      startY = spriteData.startY,
                      endY = spriteData.endY,
                      originY = spriteData.originY,
                      deltaY = spriteData.deltaY,
                      deltaYVal = spriteData.deltaYVal,
                      delayY = spriteData.delayY || 0,
                      origin = spriteData.origin,
                      endPoint = spriteData.endpoint || 100,
                      offset,endPointFactor, percentOffset, offsetX, offsetY;

                  if (origin === 'top') {
                    offset = panelTopOffsetAboveTopOfViewport;
                  } else {
                    offset = panelTopOffsetFromBottomOfViewport;
                  }

                  // If sprite is moving horizontally (deltaX is not 0)
                  // and the panel offset is greater than the delay
                  if (deltaX !== 0 && offset > delayX) {

                    endPointFactor = endPoint / 100;
                    percentOffset = offset / (windowHeight * endPointFactor);

                    offsetX = startX + (deltaXVal * percentOffset);

                     if (deltaX > 0 && offsetX > endX){
                       offsetX = endX;
                     } else if (deltaX < 0 && offsetX < endX) {
                       offsetX = endX;
                     }

                     if (originX === "right") {
                       $sprite.css('right', offsetX);
                     } else {
                       $sprite.css('left', offsetX);
                     }
                  }

                  // If sprite is moving vertically (deltaY is not 0)
                  // and the panel offset is greater than the delay
                  if (deltaY !== 0 && offset > delayY){

                    endPointFactor = endPoint / 100;
                    percentOffset = offset / (windowHeight * endPointFactor);
                    offsetY = startY + (deltaYVal * percentOffset);

                     if (deltaY > 0 && offsetY > endY){
                       offsetY = endY;
                     } else if (deltaY < 0 && offsetY < endY) {
                       offsetY = endY;
                     }

                     $sprite.css('top', offsetY);
                  }
                }
              });
            } else {

            }
          });
          $panel.addClass('isSet');

          $(window).trigger('scroll');
        });
      },

      // Variables
      init = function () {
        Site.utils.cl("Site.animate initialised");
        setPanels();
      };

  // Return Public API
  return {
    init: init
  };

}(jQuery));
