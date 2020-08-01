// Site.images.js

// Check if base namespace is defined so it isn't overwritten
var Site = Site || {};

// Create child namespace
Site.images = (function ($) {
  "use strict";

  ///////////////
  // Variables //
  ///////////////

  var defaults = { },
      lazyImageSel = $('[data-image-load]'),

  //////////////////
  // Constructors //
  //////////////////

      /**
       * Creates a LazyImage object to manage a lazy-loaded image component
       * @constructor
       */
      LazyImage = function (elem) {
        var $thisSprite = $(elem),
            $placeholderImage = $thisSprite.find('img.placeholder').eq(0),
            loadingMethod = $thisSprite.data('image-load'),
            imageType = $thisSprite.data('image-type') || 'inline',
            imageLoaded = false,
            imageToAdd = new Image(),

            // Display a pre-loaded lazy image, adding atrributes set on
            // the sprite container
            displaySpriteImageInContainer = function (image) {
              var $thisImage = $(image),
                  imageAlt = $thisSprite.data('alt') || 'image';

              $thisImage.attr('alt', imageAlt);

              if($placeholderImage.length > 0) {
                $placeholderImage.attr('src', $thisImage.attr('src')).removeClass('placeholder').removeAttr('width').removeAttr('height');
              } else {
                $thisSprite.prepend($thisImage);
              }

              $thisSprite.addClass('imageLoaded');
              // Need to allow browser a moment to process the addition of the image before displaying it
              window.setTimeout(function () {$thisSprite.addClass('imageDisplayed');}, 100);
              imageLoaded = true;
            },

            /**
             * Display a lazy-loading image as a CSS background image
             * @function
             * @parameter path (String)
             */
            displaySpriteImageAsBackground = function (path) {
              var spriteImage = 'url(' + path + ')',
                  spriteBackgroundPos = $thisSprite.data('position'),
                  spriteBackgroundColor = $thisSprite.data('background-color');

              $thisSprite.addClass('imageLoaded').css('background-image', spriteImage).addClass('flexImage').addClass(spriteBackgroundPos).css('background-color', spriteBackgroundColor) ;
              Site.utils.cl('image loaded in background');
              imageLoaded = true;
            },

            /**
             * Create and preload a new image based on a sprite src
             * then call a function once the image is loaded into memory
             * @function
             */
            getSpriteImageFile = function () {
              var thisImageData = 'src-' + Site.layout.getResponsiveSize(),
                  thisImageUrl = $thisSprite.data(thisImageData);

                  imageToAdd.src = thisImageUrl;

                if(imageType === 'inline') {
                  $(imageToAdd).imagesLoaded(displaySpriteImageInContainer(imageToAdd));
                } else if (imageType === 'background') {
                  $(imageToAdd).imagesLoaded(displaySpriteImageAsBackground(thisImageUrl));
                }
            },

            /**
             * Check if a sprite is in view, and if so load and display it
             * @function
             */
            loadSpriteImageIfInView = function () {
              if(imageType === 'inline') {
                if(Site.utils.isElementInView($thisSprite) && imageLoaded === false){
                  getSpriteImageFile($thisSprite);
                }
              } else if (imageType === 'background') {
                if(Site.utils.isElementInView($thisSprite.parent()) && imageLoaded === false){
                  getSpriteImageFile($thisSprite);
                }
              }
            },

            /**
             * Bind custom message events for this object
             * @function
             */
            bindCustomMessageEvents = function () {
              // Load lazy images
              $thisSprite.on('loadLazyImage', function (e) {
                e.preventDefault();
                if(imageLoaded === false){
                  loadSpriteImageIfInView($thisSprite);
                }
              });
            },

            /**
             * Subscribe object to Global Messages
             * @function
             */
            subscribeToEvents = function () {

              Site.utils.cl(loadingMethod);

              if(loadingMethod !== 'click') {
                $.subscribe('page/scroll', function () {$(this).trigger('loadLazyImage');},$thisSprite);
                $.subscribe('page/resize', function () {$(this).trigger('loadLazyImage');},$thisSprite);
                $.subscribe('layout/change', function () {$(this).trigger('loadLazyImage');},$thisSprite);
                $.subscribe('page/load', function () {$(this).trigger('loadLazyImage');},$thisSprite);
              }
            };

        /**
         * Initialise this object
         * @function
         */
        this.init = function () {

          if(loadingMethod === 'click') {
            // Do nothing
          }
          // If image is set to display when container is in view
          else if (loadingMethod === 'view') {

            loadSpriteImageIfInView($thisSprite);

            // Do nothing - message on pageload will handle these
            // if(Modernizr.touch){
            //   getSpriteImageFile($thisSprite);
            // } else {
            //   getSpriteImageFile($thisSprite);
            // }

          }
          // Otherwise load the image on page load
          else if (loadingMethod === 'pageload') {
            getSpriteImageFile($thisSprite);
          }

          bindCustomMessageEvents();
          subscribeToEvents();
        };
      },

  ///////////////
  // Functions //
  ///////////////

      /**
       * Create delegate event listeners for this module
       * @function
       */
      delegateEvents = function () {
        Site.events.createDelegatedEventListener('click', '.lazyLoader[data-image-load=click]', 'loadLazyImage');
      },

      /**
       * init function for this module
       * @function
       */
      init = function () {
        Site.utils.cl("Site.images initialised");

        $(lazyImageSel).each(function () {
          var thisLazyImage = new LazyImage(this);
          thisLazyImage.init();
        });

        delegateEvents();
      };

  ///////////////////////
  // Return Public API //
  ///////////////////////

  return {
    init: init
  };

}(jQuery));