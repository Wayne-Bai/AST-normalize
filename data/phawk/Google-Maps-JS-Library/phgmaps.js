function phawkGmap()
{
	/* Public return api */
	var api = {};
	
	/* ID of the map container in DOM */
	api.container = 'mapcontainer';
	
	/* Map Object */
	api.mymap = null;
	
	/* LatLng Object */
	api.latlng = null;
	
	/* Array of markers */
	api.markers = [];
	
	
	/* Will initiate a map and create a central marker given a latlng value */
	api.createMap = function(latlng) {
		/* Setup map options */
		var myOptions = {
			zoom: 15,
			center: latlng,
			mapTypeId: google.maps.MapTypeId.ROADMAP, 
			streetViewControl: true
		};
		
		api.mymap = new google.maps.Map(document.getElementById(api.container), myOptions);
		
		$(document).trigger('mapLoaded', true);
	};
	
	
	/* Adds a marker to the map */
	api.addMarker = function(latlng) {
		var marker = new google.maps.Marker({
			map: api.mymap, 
			position: latlng
		});
		
		api.markers.push(marker);
	};
	
	
	/* Pass an address and it will try to geocode */
	api.geocodeAddress = function(address) {
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode({ address: address }, api.geocodeCallback);
	};
	
	
	/* Check if geocoding was a success and if so create a map */
	api.geocodeCallback = function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			api.latlng = results[0].geometry.location;
			api.createMap(api.latlng);
		}
		else {
			alert('The Address could not be Geocoded');
		}
	};
	
	
	/* Return the public stuff */
	return api;
	
}