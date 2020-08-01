/*global exlsr: false */
$(function(){
  $("#page, footer").find("a[href='#']").on(exlsr.activateEventName, function(e){
    e.preventDefault(); // stop all the empty links from bringing you back to the header and ruining the awesome experience of the responsive site.
  });

  $("#demoBar").on(exlsr.activateEventName, function(e){
    e.preventDefault();
    $.getScript("../../js/app/demo-bar.js"); // we're loading in the demo bar from the sub-navigation. we don't want to load it automatically on page load like we do for the rest of the other demos.
  });

  // Map
  if ($('.map-canvas').length) {
    var latlng, myOptions, map, marker;
    latlng = new google.maps.LatLng(42.65163, -73.7595);
    myOptions = {
      zoom: 15,
      center: latlng,
      mapTypeControl: false,
      navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL},
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map($('.map-canvas').get(0), myOptions);
    marker = new google.maps.Marker({
      position: latlng,
      map: map,
      title:"Agency Building 1, Empire State Plaza, Albany, NY 12203"
    });
  }
});
