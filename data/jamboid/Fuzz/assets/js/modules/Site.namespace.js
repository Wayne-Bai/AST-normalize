// Site.namespace.js

// Check if base namespace is defined so it isn't overwritten
var Site = Site || {};

// Create child namespace
Site.namespace = (function ($) {
    "use strict";

  ///////////////
  // Variables //
  ///////////////

    var objectSel = "",

  //////////////////
  // Constructors //
  //////////////////

        /**
         * Creates an Object object
         * @constructor
         */
        Object = function () {

          var

          /**
           * Bind custom message events for this object
           * @function
           */
          bindCustomMessageEvents = function () {
            // $thisMainNav.on('', function (e) {
            //   e.preventDefault();
            // });
          },

          /**
           * Subscribe object to Global Messages
           * @function
           */
          subscribeToEvents = function () {

          };

          /**
           * Initialise this object
           * @function
           */
          this.init = function () {
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
          //Site.events.createDelegatedEventListener('click', sel, 'toggleMainNav');

        },

        /**
         * init function for this module
         * @function
         */
        init = function () {
          Site.utils.cl("Site.namespace initialised");

          // Initialise Objects objects based on DOM objects
          $(objectSel).each(function () {
            var thisObject = new Object(this);
            thisObject.init();
          });

          // Add delegate event listeners for this module
          delegateEvents();
        };

  ///////////////////////
  // Return Public API //
  ///////////////////////

    return {
      init: init
    };

}(jQuery));