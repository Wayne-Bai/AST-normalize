	/**
	Represents the current available area in the browser

	@class Screen
	@static
	**/
	var Screen = {};

	/**
	Object holding dimension information for the screen

	@@field
	@static
	@type Object
	**/
	Screen.dimension = {};

	/**
	Checks if the screen dimension information has changed

	@method hasChanged
	@static
	@return boolean
	**/
	Screen.hasChanged = function() {
	    return ($window.width() !== this.dimension.width) ||
	        ($window.height() !== this.dimension.height);
	};

	/**
	Updates the dimension information for the screen 

	@method updateInfo
	@static
	**/
	Screen.updateInfo = function() {
	    this.dimension.width = $window.width();
	    this.dimension.height = $window.height();
	};  