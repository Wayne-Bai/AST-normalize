nitch.debug = {

/**
 * @name nitch.debug.performance
 * @class
 * @description Measures the performance of your game
 * @example new nitch.debug.performance();
 * @see <a href="examples/debug.performance.html">Simple example</a>
**/	
	performance: function(opts) {
		
		var defaults = {
			fps: 58,
			top: 0,
			left: 0
		};
		
		options = nitch.util.apply(defaults, opts);
		
		this.frames = 0;
		this.time = Date.now();
		this.timeLastFrame = this.time;
		this.timeLastSecond = this.time;
		this.fps = 0;
		this.fpsMin = 1000;
		this.fpsMax = 0;
		this.ms = 0;
		this.msMin = 1000;
		this.msMax = 0;
		
		var infoPanel = '<div id="performance" style="top:'+options.top+'px;left:'+options.left+'px">';
		infoPanel += '<p><strong>FPS:</strong> <span id="per-fps"></span></p>';
		infoPanel += '<p><strong>MS:</strong> <span id="per-ms"></span></p>';
		infoPanel += '</div>';
		nitch.dom("body").append(infoPanel);
		
		nitch.debug.performance.prototype.update = function() {
			nitch.dom("#per-ms").text(this.msInfo());
			nitch.dom("#per-fps").text(this.fpsInfo());
		},
		
		nitch.debug.performance.prototype.msInfo = function() {
			this.time = Date.now();
			this.ms = this.time - this.timeLastFrame;
			this.msMin = Math.min(this.msMin, this.ms);
			this.msMax = Math.max(this.msMax, this.ms);
			this.timeLastFrame = this.time;
			this.frames++;
			return this.ms + " (min: " + this.msMin + ", max: " + this.msMax + ")";
		},
		
		nitch.debug.performance.prototype.fpsInfo = function() {
			this.fps = Math.round((this.frames * 1000) / (this.time - this.timeLastSecond));
			this.fpsMin = Math.min(this.fpsMin, this.fps);
			this.fpsMax = Math.max(this.fpsMax, this.fps);
			this.timeLastSecond = this.time;
			this.frames = 0;
			return this.fps + " (min: " + this.fpsMin + ", max: " + this.fpsMax + ")";
		};
		
		var that = this;
		setInterval(function () { that.update(); }, 1000 / options.fps);
	},


/**
 * @name nitch.debug.timing
 * @class
 * @description Wrapper for the <a href="https://developer.mozilla.org/en/Navigation_timing">Navigation timing API</a> to help you debug your game
 * @param {Object} opts
 * @param {Boolean} opts.list List print out the performance timing and navigation results in a definition list at the end of the &lt;body&gt;
 * @param {String} opts.timeline Generate a timeline like Firebug's network tab or <a href="https://developers.google.com/chrome-developer-tools/docs/timeline">Chrome's timeline panel</a> <strong>after</strong> the element specified
 * @example nitch.debug.timing({list:true}); // prints it out
 * nitch.debug.timing({timeline:"#game"}); // prints timeline
 * @see <a href="examples/debug.timing.html">Simple example</a>
**/
	timing: function(opts) {
		window.performance = window.performance || window.mozPerformance || window.msPerformance || window.webkitPerformance || {};
		var timing = performance.timing || {};
		var navigation = performance.navigation || {};
		timing.legacyNavigationStart = new Date().getTime();
		
		var sectionText = {
			unloadEventEnd: "Last page unloaded ",
			legacyNavigationStart: "Legacy navigation started ~",
			loadEventEnd: "Page loaded "
		};
		
		var barText = {
			redirectStart: "Redirects",
			fetchStart: "Fetch",
			domainLookupStart: "DNS",
			connectStart: "Connect",
			requestStart: "Request",
			responseStart: "Response",
			loadEventStart: "Load event"
		};
	
		if(!timing.navigationStart) { return false; }
		// Check that it's not called twice and throw a TypeError
	
		percentage = function(event) {
			var begin = timing.navigationStart;
			var end = timing.loadEventEnd;
			var thisTiming = timing[event];
			var totalDuration = end - begin;
			var thisDuration = thisTiming - begin;
			return Math.round(100.0 * thisDuration / totalDuration);
		};
		
		milliseconds = function(startEvent, endEvent) {
			var begin = timing[startEvent];
			var end = timing[endEvent];
			if (!begin || !end) return "n/a";
			return (end - begin) + "ms";
		};
		
		loadSection = function(section) {
			return '<div class="navSection" id="nitch-'+section+'" style="width:'+percentage(section)+'%">'+sectionText[section] + milliseconds('navigationStart',section)+'</div>';
		};
		
		loadBar = function(startEvent,endEvent) {
			var startPercent = percentage(startEvent);
			var endPercent = percentage(endEvent);
			var calulatedWidth = endPercent - startPercent;
			var width = calulatedWidth > 0 ? calulatedWidth+"%": "1px";
			var leftMargin = startPercent > 0 ? startPercent : 0;
			return '<div class="navBar" id="nitch-' + startEvent + '" style="width:' + width + '; margin-left:' + leftMargin + '%">'+ barText[startEvent] + " "+ milliseconds(startEvent,endEvent) + '</div>';
		};
	
		if(opts.list === true) {
			var list = '<div id="nitch-timing-list"><dl><dt>Navigation</dt>';
			var nav_type = ['TYPE_NAVIGATE', 'TYPE_RELOAD', 'TYPE_BACK_FORWARD'];
			
			for (var i = 0; i < nav_type.length; i++) {
				list += "<dd><strong>"+ nav_type[i] +"</strong>: " + navigation[nav_type[i]] + "</dd>";
			}
	
			list += "<dt>Timing</dt>";
			for (var prop in timing) {
				list += "<dd><strong>"+ prop +"</strong>: " + timing[prop] + "</dd>";
			}
			
			list += "</dl></div>";
			nitch.dom("body").after(list);
		}
	
		if(opts.timeline) {
			var timeline = '<div id="nitch-timeline"><div class="navSection" id="nitch-navigationStart">Navigation started 0ms</div>';
			timeline += loadSection('unloadEventEnd');
			timeline += loadSection('legacyNavigationStart');
			timeline += loadSection('loadEventEnd');
	
			timeline += loadBar('redirectStart', 'redirectEnd');
			timeline += loadBar('fetchStart', 'responseEnd');
			timeline += loadBar('domainLookupStart', 'domainLookupEnd');
			timeline += loadBar('connectStart', 'connectEnd');
			timeline += loadBar('requestStart', 'responseStart');
			timeline += loadBar('responseStart', 'responseEnd');
			timeline += loadBar('loadEventStart', 'loadEventEnd');
			timeline += "</div>";
			
			nitch.dom(opts.timeline).append(timeline);
		}
	  
	},

/**
 * @name nitch.debug.screensafe
 * @class
 * @description Applies screensafe area to your game area
 * @todo see <a href="https://github.com/recursivelymade/nitch.js/issues/4">issue 4</a>
**/
	screensafe: function() {
		return;
	}
}