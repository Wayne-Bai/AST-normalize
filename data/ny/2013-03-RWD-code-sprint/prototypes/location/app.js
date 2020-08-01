/*global Modernizr:false */

// Google API key: AIzaSyCgz5MUhOPerkL5AJl7u7dJnRrmKelzZJA

$(document).ready(function(){
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      // Success:
      show_map,
      // Failure:
      showDefaultMap('Could not find your location.')
    );
  }
  else {
    showDefaultMap();
  }

  function show_map(position) {
    var latlng, myOptions, map, marker;

    latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    myOptions = {
      zoom: 15,
      center: latlng,
      mapTypeControl: false,
      navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL},
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("mapcanvas"), myOptions);
    marker = new google.maps.Marker({
      position: latlng,
      map: map,
      title:"You are here! (at least within a "+position.coords.accuracy+" meter radius)"
    });

    $('.status').html('You are at ' + position.coords.latitude + ', ' + position.coords.longitude);
  }

  function showDefaultMap(msg) {
    msg = msg || 'Your device does not support geolocation.';
    $('.status').html(msg);
  }

});
