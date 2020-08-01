/*global Modernizr: false, ewf: false */

$(document).ready(function() {
  var $html = $('html');

  // Show appropriate messages and check the right box
  if (Modernizr.touch) {
    // Touch is supported
    $('#mobile').attr('checked', true);
    $('.custom-show-for-touch').show();
  }
  else {
    // Touch not supported
    $('#desktop').attr('checked', true);
    $('.custom-show-for-no-touch').show();
  }

  $('.toggle-section').on(ewf.activateEventName, function (evt) {
    // Cannot determine which check box is checked because that doesn't change until after this event
    if ($(evt.target).closest('.mobile-label').length) {
      $html
        .addClass('touch')
        .removeClass('no-touch');
    }
    else {
      $html
        .removeClass('touch')
        .addClass('no-touch');
    }
  });
});
