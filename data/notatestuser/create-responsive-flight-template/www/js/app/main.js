// Defines the main app module. This one does the top level app wiring.

define(
  [
    'jquery',
    'es5-shim'
  ],

  function ($) {
    'use strict';

    // Wait for the DOM to be ready before showing the network and appCache
    // state.
    $(function () {

      // Import our Button component class.
      require(['app/components/button'], function (Button) {
        // Attach our button components to the DOM.
        Button.attachTo('.button-box', {
          buttonName: 'me'
        });
      });

    });
  }
);
