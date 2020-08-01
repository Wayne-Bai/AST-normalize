/*
 * Mash Global Object
 * Contains helper functions and some device detection
 */
 

/* Constructor
 * -------------------------------------------------------------- */
var Mash = (function($) {
	
	var pub = {};
	

	/* Console - Set up if not present
 	 * -------------------------------------------------------------- */
	if( !window.console ) {
		(function() {
			var names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml",
			"group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];
			window.console = {};
			for( var i = 0; i < names.length; ++i ) {
				window.console[names[i]] = function() {};
			}
		}());
	}
	

	/* Device data
 	 * -------------------------------------------------------------- */
	
	// device.mobile = boolean                  - if true, additional properties present
	// device.mobile.touch = boolean            - check for a touch screen device
	// device.mobile.touchType = null/string    - touch screen device type

	pub.device = (function() {
		var uagent = navigator.userAgent.toLowerCase();
		var devices = ["iphone", "ipod", "ipad", "android", "blackberry", "symbian", "series60"];
		var mobile = false; 
		var touch = false;
		var touchType = null;
		
		var i = 0;
		var x = devices.length;
		for (i; i < x; i++) {
			if (uagent.match(devices[i])) {
				touch = true;
				touchType = devices[i];
				break;
			}
		}
		
		if (touch) {
			mobile = {
				touchType: touchType,
				type: type
			};
		}
		
		return { 
			mobile: mobile
		};
	}() );
	
	
	/* Flash data
 	 * -------------------------------------------------------------- */
	
	// flash = boolean          - if true, additional properties present
	// flash.minor = number     - flash minor version build
	// flash.major = number     - flash major version build
	// flash.release = numeric  - flash release number

	pub.flash = (function() {
		var flash = false;
		
		// Check that swfobject is available 
		if (typeof swfobject === "undefined") {
			console.log("Failed to detect Flash player due to swfobject library missing");
		} else {
			if (swfobject.getFlashPlayerVersion) {
				var v = swfobject.getFlashPlayerVersion();
				
				if (v.major > 0) {
					flash = {
						minor: v.minor,
						major: v.major,
						release: v.release
					};
				}
			}
		}
		
		return flash;
	}() );
	
	
	/* Helpers
 	 * -------------------------------------------------------------- */
	
	// utils.printProps( object, string )      - view properties and methods of object
	// utils.newWindow( string, boolean )      - creates new window, set argument for focus
	// utils.preloadImages( array )            - preloads array of images, either jQuery object or native array

	pub.helpers = (function() {
		var printProps = function(obj, objName) {
			var prop, output = "";

			for (prop in obj) {
				if (obj.hasOwnProperty(prop)) {
					output += objName + "." + prop + " = " + obj[prop] + "\n" ;
				}
			}
			return output;
		};
		
		var newWindow = function(url, focus) {
			var w = window.open(url, "_blank");
			if (focus) {
				w.focus();
			}
			return w;
		};
		
		var createImage = function(src) {
			var img = document.createElement("img");
			img.setAttribute("src", src);
			return img;
		};
		
		var preloadImages = function(imgs) {
			var i = 0;
			var x = img.length;
			for (i; i < x; i++) {
				createImage(imgs[i]);
			}
			return;
		};
			
		return {
			printProps: printProps,
			newWindow: newWindow,
			preloadImages: preloadImages
		};
	}() );
	
	
	// Return public methods / properties
	// --------------------------------------------------------------
	
	return pub;

}(jQuery));