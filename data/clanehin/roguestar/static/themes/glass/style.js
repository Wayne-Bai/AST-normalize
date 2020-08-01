var roguestar_preferences = {
    animation_thread_interval : 100,
    magic_colors : ['999933', '339999', 'CC44CC'],
    molten_colors : ['993333', 'FF0000', '993333', 'FF8800'],
    water_colors : ['0055FF', '1155FF', '2255FF', '3355FF', '4455FF', '5555FF', '4455FF', '3355FF', '2255FF', '1155FF' ]
  }

$('document').ready(function() {
  //Let the server know we have javascript
  $.cookie('javascript', 'enabled', { expires: 1, path: '/play' });

  //There's some reason for this, but I don't remember what.
  $("img").mousedown(function(){
    return false;
  });

  //Some action types can only be used in the four cardinal directions.
  //If that action type is selected, disable all the other movement directions.
  $("input[name=mode]").change( function() {
    $(".diagonal-direction-button").prop("disabled", $(".four-directions:checked").size() > 0 );
  });;

  //Set up user interface elements.
  $('.roguestar-accordion').accordion( { heightStyle: "content", collapsible:true } );
  $('.roguestar-tabs').tabs();
  $("label, button, input, a, div").tooltip( {
    position: { my: "right center", at: "left-2 center", collision: "flipfit" },
      hide: 0.25,
      tooltipClass: "tooltip-box"
    });

  //Form buttons that need to be automatically submitted, possibly after a pause while we do an animation.
  $('.autosubmit').hide();
  $('.autosubmit-after-pause').hide();

  setTimeout(
    function() {
      $('.autosubmit').submit();
    },
    100);
  setTimeout(
    function() {
      $('.autosubmit-after-pause').submit();
    },
    calculateDelayTime());

  runAnimationThread();
});

function calculateDelayTime() {
  if( $('.warpin').length )
    return 1500;

  return 500;
}

function animateViaCSS( css_class, css_property, color_gradient, date ) {
  var n = date.getSeconds() + date.getMinutes()*60 + date.getHours()*24;
  var color_1 = color_gradient[n%color_gradient.length];
  var color_2 = color_gradient[(n+1)%color_gradient.length];
  $(css_class).css(css_property,
                   $.xcolor.gradientlevel(color_1, color_2, date.getMilliseconds(), 1000));
}

function runAnimationThread() {
  var date = new Date();

  animateViaCSS( '.a', 'color', roguestar_preferences.magic_colors, date );
  animateViaCSS( '.w', 'color', roguestar_preferences.water_colors, date );
  animateViaCSS( '.m', 'color', roguestar_preferences.molten_colors, date );

  setTimeout( runAnimationThread, roguestar_preferences.animation_thread_interval );
}

