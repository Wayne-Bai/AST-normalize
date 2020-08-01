
// ********** Fire this when a page has finished loading **********
jQuery(document).ready(function () {
	
	/**
	 * Orientation Change Handlers
	 * EG iPad portrait or landscape switches
	 */
	
	function myOrientResizeFunction(){
		
		
		
	    /**
		 * Responsive Images
		 * ========================================================================
		 * Determine the actual width of a container via CSS on page load and resizing
		 * once we know what size the main container is, we know the size of the device they're on
		 * and can go through and find any img src with class="responsive" and change these to
		 * appropriate device versions: eg: images/steve-en.jpg could then be changed to
		 * images/steve-en-tablet.jpg in tablet mode.
		 * .container-12 960 or 720 else mobile
		 * 
		 */
	
		var responsiveSize = jQuery(".container-12").width();
		var deviceType;
		if (responsiveSize == 960 ){
			//Don't do anything for desktop names, no image changes
			deviceType = "_desktop";
		} 
		
		else if (responsiveSize == 720) {
			//Add suffix _tablet
			deviceType = "_tablet";
		} 
		
		else {
			//Mobile, add suffix _mobile
			deviceType = "_mobile";
		}
		
		/**
		 * Find all images with class responsive and change them in real time to swap for viewing device.
		 * Replace steve_desktop.jpg with steve_tablet.jpg
		 */
		jQuery(".responsive").each(function () {
			
			var imgName = jQuery(this).attr("src");
			var extFull = imgName.split('.');
			var ext = imgName.split('.').pop();
			
			//Based on device change images loaded
			switch (deviceType) {
				case "_desktop":
				//Try to find _table or _mobile and remove from image, rebuild string.
				//we dont have images with _desktop in them.
					if (searchStr("_tablet", extFull[0])) {
						var imgType = extFull[0].split('_tablet');
						var imgResponsive = imgType[0] + "." + extFull[1];
						jQuery(this).attr({ src: imgResponsive });
					} 
					
					else if (searchStr("_mobile", extFull[0])) {
						
						var imgType = extFull[0].split('_mobile');
						var imgResponsive = imgType[0] + "." + extFull[1];
						jQuery(this).attr({ src: imgResponsive });
					}
				
				break;
				
				//Don't do anything if tablet already exists, remove mobile if needed.
				case "_tablet":
					//console.log("tablet");
					if (searchStr(deviceType, extFull[0])) {
						//console.log(deviceType + " Found in array");
					} 
					
					else if (searchStr("_mobile", extFull[0])) {
						
						var imgType = extFull[0].split('_mobile');
						var imgResponsive = imgType[0] + "." + extFull[1];
						jQuery(this).attr({ src: imgResponsive });
					}
					//Initial device load
					else {
						var imgResponsive = extFull[0] + deviceType + "." + extFull[1];
						jQuery(this).attr({ src: imgResponsive });
					}
					
				break;
				
				case "_mobile":
					if (searchStr(deviceType, extFull[0])) {
						//console.log(deviceType + " Found in array");
					} 
					
					else if (searchStr("_tablet", extFull[0])) {
						/**
						 * Determine specific addon classes
						 */
						if (jQuery(this).hasClass("hide-mobile")) {
							//CSS Hides the image
						}				
						
						else {
							var imgType = extFull[0].split('_tablet');
							var imgResponsive = imgType[0] + "." + extFull[1];
							jQuery(this).attr({ src: imgResponsive });
						}
						
					}
					//Initial device load
					else {
						
						/**
						 * Determine specific addon classes
						 */
						if (jQuery(this).hasClass("hide-mobile")) {
							//CSS Hides the image
						}
									
						else {
							var imgResponsive = extFull[0] + deviceType + "." + extFull[1];
							jQuery(this).attr({ src: imgResponsive });
						}	
					}
				
				
				break;
			} //end switch
			
		});
		
	} //end orintation change
	
	//bind to resize
	jQuery(window).resize( function() {
	      myOrientResizeFunction()
	});
	
	//if you need to call it at page load to resize elements etc.
	jQuery(window).load( function() {
	      myOrientResizeFunction()
	});
	
	//check for the orientation event and bind accordingly
	if (window.DeviceOrientationEvent) {
	  window.addEventListener('orientationchange', myOrientResizeFunction, false);
	}
	
	
});	