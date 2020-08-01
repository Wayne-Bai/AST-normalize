/*
 * CUBICstate breakdance
 * http://cubicstate.com
 *
 * Date: 28/02/2014
 * Version 1.0.1
 */


/**
* container object for our breakdance namespace
* 
* @return object
*/
var breakdance = function(window, document, $){

	// =========================
	// instance variables
	var _breakpoints = {}; // contains all script based breakpoints
	var _domHelper = null; // dom element used to help with testing sizes
	var _fontTestInterval = 500; // interval between testing for changes in font size
	var _fontTimer = null; // interval timer object used to test for changes in font size
	var _fontBase = null; // this stores our current font size reference
	var _currentBreakpoint = null; // the currently active breakpoint name
	var _prevBreakpoint = null; // the previously active breakpont name

	var _bpTags = ["mobile","tablet","default","large"]; // default css based tag values
	

	// =========================
	// CONTRUCTOR

	/**
	* initiates all our tests once the document is ready
	* 
	* @method init
	* @return Void
	*/
	var init = function () {
		$(function(){
			createDOMHelper();
			
			// window resize events
			$(window).on("resize", function(){
				testBreakPoints();
				draw();
			});

			// start watching for change in font size
			_fontBase = getDOMHelperHeight();
			startFontWatch();

			// get an initial breakpoint value
			testBreakPoints();

			// call to draw now we are initiated
			draw();
		});
	};

	// =========================
	// METHODS
	
	/**
	* Triggers a 'draw' event
	* 
	* @method draw
	* @return Void
	*/
	var draw = function(){
		$(window).trigger("draw");
	};

	/**
	* Performs tests against any script based breakpoints
	* 
	* @method testScriptBreakPoints
	* @return Void
	*/
	var testScriptBreakPoints = function(){
		// test our scripted breakpoints
		var bp = null;
		for(var bpName in _breakpoints){
			if(testBP(bpName)){
				bp = bpName;
				break;
			}
		}

		// we only fire an event if we have changed brekpoint
		if(_currentBreakpoint != bp){
			_prevBreakpoint = _currentBreakpoint;
			_currentBreakpoint = bp;
			setBodyClass();
			triggerBreakpoint();
		}
	};

	/**
	* Performs tests against any css based breakpoints
	* 
	* @method testCSSBreakPoints
	* @return Void
	*/
	var testCSSBreakPoints = function(){
		// test our css breakpoints
		var tag = getResponsiveTag();
		if(tag.length && (tag != _currentBreakpoint)){
			//console.log(_currentBreakpoint + " - " + tag);
			_prevBreakpoint = _currentBreakpoint;
			_currentBreakpoint = tag;
			setBodyClass();
			triggerBreakpoint();
		}
	};

	/**
	* Triggers our breakpoint change events
	* 
	* @method triggerBreakpoint
	* @return Void
	*/
	var triggerBreakpoint = function(){
		$(window).trigger(_currentBreakpoint + "On");
		$(window).trigger(_prevBreakpoint + "Off");
		$(window).trigger("breakpoint", [_currentBreakpoint, _prevBreakpoint]);
	};

	/**
	* This is the method that gets called to test our breakpoints. 
	* If we have script based breakpoints defined we use those in preference to any css based ones
	* 
	* @method triggerBreakpoint
	* @return Void
	*/
	var testBreakPoints = function(){
		if(countBreakpoints()){
			// if we have scripted breakpoints, we use those
			testScriptBreakPoints();
		}else{
			// otherwise, we use our css breakpoints
			testCSSBreakPoints();
		}
	};

	/**
	* Removes any existing breakpoint classes from the 'body' element and applies the current breakpoint name as a class
	* 
	* @method setBodyClass
	* @return Void
	*/
	var setBodyClass = function(){
		var classes = "";
		// are we useing scripted breakpoints or css breakpoints??
		if(countBreakpoints()){
			for(var bpName in _breakpoints){
				classes += bpName + " ";
			}
		}else{
			for(var i in _bpTags){
				classes += _bpTags[i] + " ";
			}
		}
		$("body").removeClass(classes);
		$("body").addClass(_currentBreakpoint);
	};

	/**
	* Defines the interval timer object that tests for changes in font size
	* 
	* @method startFontWatch
	* @return Void
	*/
	var startFontWatch = function(){
		_fontTimer = setInterval(testFontSize, _fontTestInterval);
	};

	/**
	* Clears the interval timer object used to test for changes in font size
	* 
	* @method stopFontWatch
	* @return Void
	*/
	var stopFontWatch = function(){
		clearTimeout(_fontTimer);
	};

	/**
	* Tests for a change in font size by comparing the height of our DOM helper element against a previously stored value
	* 
	* @method testFontSize
	* @return Void
	*/
	var testFontSize = function(){
		var h = getDOMHelperHeight();
		if(h != _fontBase){
			testBreakPoints();
			_fontBase = h;
		}
	};

	/**
	* Returns our current breakpoint name
	* 
	* @method currentBreakpoint
	* @return string
	*/
	var currentBreakpoint = function(){
		return _currentBreakpoint;
	};

	/**
	* Adds a div element to the DOM which is used to test font size and width
	* 
	* @method createDOMHelper
	* @return Void
	*/
	var createDOMHelper = function(){
		_domHelper = $('<div> </div>');
		_domHelper.css({
			position: "absolute",
			visibility: "hidden",
			fontSize: "1em",
			height: "1em",
			width: "1em",
			padding: 0,
			margin: 0,
			top: 0,
			left: -200
		});
		$("body").append(_domHelper);
	};

	/**
	* Sets our DOM helper elements width to 'auto'
	* 
	* @method resetDOMHelper
	* @return Void
	*/
	var resetDOMHelper = function(){
		_domHelper.css({
			width: "auto"
		});
	};

	/**
	* Determines the width of our DOM helper element when it is set to a given value - this can be either px, em, %, etc
	* 
	* @method getDOMHelperWidth
	* @param string - css width value
	* @return integer
	*/
	var getDOMHelperWidth = function(w){
		_domHelper.css({
			width: w
		});
		var width = _domHelper.outerWidth();
		resetDOMHelper();
		return width;
	};

	/**
	* Determines the height of our DOM helper element
	* 
	* @method getDOMHelperHeight
	* @return integer
	*/
	var getDOMHelperHeight = function(){
		return _domHelper.outerHeight();
	};

	/**
	* Returns the current value of our media query defined css tag.
	* The default return value is 'default'
	* 
	* @method getResponsiveTag
	* @return string
	*/
	var getResponsiveTag = function() {
		// http://tech.particulate.me/javascript/2013/10/10/how-to-conveniently-check-for-responsive-breakpoints-in-javascript/
		try{
			var tag = window.getComputedStyle(document.body,':after').getPropertyValue('content');
			tag = tag.replace( /"/g,'');   // Firefox bugfix
			return tag;
		}catch(e){
			return "default";
		}
	};

	/**
	* Sets our array of css defined tag names
	* 
	* @method setResponsiveTags
	* @param array - array of css defined tag names
	* @return Void
	*/
	var setResponsiveTags = function(pTags){
		_bpTags = pTags;
	};

	/**
	* Returns our window height
	* 
	* @method height
	* @return integer
	*/
	var height = function(){
		return $(window).height();
	};

	/**
	* Returns our window width
	* 
	* @method width
	* @return integer
	*/
	var width = function(){
		return $(window).width();
	};

	/**
	* Removes all script defined breakpoints
	* 
	* @method clearBreakpoints
	* @return void
	*/
	var clearBreakpoints = function(){
		_breakpoints = {};
	};

	/**
	* Adds a script defined breakpoint
	* 
	* @method addBreakpoint
	* @param string - the name of the breakpoint
	* @param [string] - optional minimum width for the breakpoint. eg. 600, 600px, 30em
	* @param [string] - optional maximum width for the breakpoint. eg. 800, 800px, 40em
	* @return void
	*/
	var addBreakpoint = function(name, minWidth, maxWidth){
		if(minWidth == undefined) minWidth = 0;
		if(maxWidth == undefined) maxWidth = 99999999;
		_breakpoints[name] = {
			min: minWidth,
			max: maxWidth
		};
	};

	/**
	* Removes a scripted breakpoint matched on a given name
	* 
	* @method removeBreakpoint
	* @param string - the name of the breakpoint to remove
	* @return void
	*/
	var removeBreakpoint = function(name){
		delete _breakpoints[name];
	};

	/**
	* Returns the current number of scripted breakpoints
	* 
	* @method countBreakpoints
	* @return integer
	*/
	var countBreakpoints = function(){
		var count = 0;
		for(var bpName in _breakpoints){
			count++;
		}
		return count;
	};

	
	/**
	* Tests a given scripted breakpoint by getting min and max widths from our DOM helper and then testing those against our window width.
	* If the window width is between the min/max values a positive result is returned
	* 
	* @method testBP
	* @param string - the name of the scripted breakpoint to test
	* @return boolean
	*/
	var testBP = function(name){
		var bp = _breakpoints[name];
		if(bp){
			var min = getDOMHelperWidth(bp.min);
			var max = getDOMHelperWidth(bp.max);
			var w = width();
			if((w>=min) && (w<=max)){
				return true;
			}
		}
		return false;
	};

	/**
	* Returns an object continain the width and height of the viewport. This is more reliable than wind width and height values.
	* 
	* @method getViewport
	* @return object
	*/
	// http://stackoverflow.com/questions/1766861/find-the-exact-height-and-width-of-the-viewport-in-a-cross-browser-way-no-proto
	var getViewport = function(){
		var w;
		var h;

		// the more standards compliant browsers (mozilla/netscape/opera/IE7) use window.innerWidth and window.innerHeight
		if (typeof window.innerWidth != 'undefined') {
			w = window.innerWidth,
			h = window.innerHeight
		}else if(typeof document.documentElement != 'undefined'
			&& typeof document.documentElement.clientWidth !=
			'undefined' && document.documentElement.clientWidth != 0) {
			// IE6 in standards compliant mode (i.e. with a valid doctype as the first line in the document)
				w = document.documentElement.clientWidth,
				h = document.documentElement.clientHeight
		}else{
			// older versions of IE
			w = document.getElementsByTagName('body')[0].clientWidth,
			h = document.getElementsByTagName('body')[0].clientHeight
		}
		return {width:w, height:h};
	};


	

	// =========================
	// public method declarations
	var pub = {
		testBreakPoints: testBreakPoints,
		setResponsiveTags: setResponsiveTags,
		addBreakpoint: addBreakpoint,
		removeBreakpoint: removeBreakpoint,
		currentBreakpoint: currentBreakpoint,
		height:height,
		width:width,
		getViewport:getViewport
	}
	
	// =========================
	init();
	return pub;
}(this, this.document, this.jQuery);

