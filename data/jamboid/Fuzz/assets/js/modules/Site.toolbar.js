// Site.toolbar.js

// Check if base namespace is defined so it isn't overwritten
var Site = Site || {};

// Create child toolbar
Site.toolbar = (function ($) {
    "use strict";

  ///////////////
  // Variables //
  ///////////////

    var selTool = ".cpTool",
        selToolToggle = ".cpTool .ttComp",

  //////////////////
  // Constructors //
  //////////////////

        // Toolbar Menu Object
        Tool = function (elem) {
          var $thisTool = $(elem),

              toggleTool = function () {
                if ($thisTool.hasClass("isOpen") === true) {
                  $thisTool.removeClass("isOpen");
                } else {
                  $.publish('showTool');
                  $('.cpTool.isOpen').removeClass('isOpen');
                  $thisTool.addClass('isOpen');
                }
              },

              closeTool = function () {
                $thisTool.removeClass("isOpen");
              },

              // Subscribe object to Global Messages
              subscribeToEvents = function () {
                $.subscribe('layout/showmainnav', function () {$(this).trigger('closeTool');}, $thisTool);
              },

              // Add event handler for main toolbar toggle
              bindCustomMessageEvents = function () {
                $thisTool.on('toggleTool', function (e) {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleTool();
                });

                $thisTool.on('closeTool', function (e) {
                  e.preventDefault();
                  closeTool();
                });
              };

          // Initialise Object
          this.init = function () {
            bindCustomMessageEvents();
            subscribeToEvents();
          };
        },

  ///////////////
  // Functions //
  ///////////////

        // Delegate events to an event listener on the <body> tag
        delegateEvents = function () {
          Site.events.createDelegatedEventListener('click', selToolToggle, 'toggleTool');
        },

        init = function () {
          Site.utils.cl("Site.toolbar initialised");
          $(selTool).each(function () {
            var newTool = new Tool(this);
            newTool.init();
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