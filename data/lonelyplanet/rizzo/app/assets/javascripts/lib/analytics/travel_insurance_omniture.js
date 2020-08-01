require([ "jquery", "lib/analytics/analytics" ], function($, Analytics) {

  "use strict";

  var analytics = new Analytics();

  analytics.trackView();

  // Set up Omniture event handlers

  var windowUnloadedFromSubmitClick = false;

  // If the user clicks anywhere else on the page, reset the click tracker
  $(document).on("click", function() {
    windowUnloadedFromSubmitClick = false;
  });

  // When the user clicks on the submit button, track that it's what
  // is causing the onbeforeunload event to fire (below)
  $(document).on("click", "button.cta-button-primary", function(e) {
    windowUnloadedFromSubmitClick = true;
    e.stopPropagation();
  });

  // Before redirection (which the WN widget does, it's not a form submit)
  // if the user clicked on the submit button, track click with Omniture
  window.onbeforeunload = function() {
    if (windowUnloadedFromSubmitClick) {
      window.s.events = "event42";
      window.s.t();
    }
  };
});
