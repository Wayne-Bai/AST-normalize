/*
 *  this module implements a Leaflet control which displays info about waypoints
 *  adapted from http://leafletjs.com/examples/choropleth.html
 */

Cat.define('info-control', function(context) {
	
	// create a new custom control
	var info = L.control();

	info.onAdd = function (map) {
	    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
	    this.update();
	    return this._div;
	};

	// method that we will use to update the control based on feature properties passed
	info.update = function (props) {
	    this._div.innerHTML = Template.details(props);
	};
	
	
	return {
		
		ready: function( map ){
			info.addTo(map);
		},
		show: function( feature ){
			info.update( feature.properties );
		},
		hide: function( ){
			info.update();
		}
		
	};
	
});