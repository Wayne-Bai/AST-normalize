
(function(jQuery){
	var ResponsiveTopScreen = function() {};
	ResponsiveTopScreen.prototype = {

		/**
		 *  Window element.
		 */
		windowElement: jQuery(window),

		/**
		 * this element will be frame.
		 */
		targetElement: undefined,

		/**
		 * this element will be fullscreen.
		 */
		targetMediaElement: undefined,

		/**
		 * gradient element.
		 */
		filmElement: undefined,

		/**
		 * options.
		 */
		options: undefined,

		/**
		 * run
		 * 
		 * @params targetElement this element will be fullscreen.
		 */
		run: function(targetElement){
			var _this = this;
			
			// Target element settings.
			this.setTarget(targetElement);
			
			// At first, call resize callback function 
			this.onWindowResize(undefined);

			// Set event listener
			this.windowElement.resize(function(event){
				_this.onWindowResize(event);
			});
		},

		/**
		 * onWindowResize
		 * 
		 * @params event callback event.
		 */
		onWindowResize: function(event){
			var windowWidth = this.windowElement.width();
			var windowHeight = this.windowElement.height();
			var mediaWidth = this.targetMediaElement.data('original-width');
			var mediaHeight = this.targetMediaElement.data('original-height');

			// set target element size.
			this.targetElement.width(windowWidth);
			this.targetElement.height(windowHeight);
			if (this.options.screenFilterImage != undefined){
				this.filmElement.width(windowWidth);
				this.filmElement.height(windowHeight);
			}

			// set media element size.
			var windowRatio = windowWidth / windowHeight;
			var mediaRatio = mediaWidth / mediaHeight;
			if (mediaRatio > windowRatio){
				this.targetMediaElement.height(windowHeight);
				this.targetMediaElement.width(mediaWidth * ( windowHeight / mediaHeight ));
				this.targetMediaElement.css({
					left: - ((this.targetMediaElement.width() - windowWidth)/2),
					top: 0
				});
			}else{
				this.targetMediaElement.width(windowWidth);
				this.targetMediaElement.height(mediaHeight * ( windowWidth / mediaWidth ));
				this.targetMediaElement.css({
					left: 0,
					top: - ((this.targetMediaElement.height() - windowHeight)/2)
				});
			}
			
		},

		/**
		 * setTarget
		 */
		setTarget: function(targetElement){
			this.targetElement = targetElement;
			targetElement.css({
				display: "block",
				overflow: "hidden",
				margin: 0,
				padding: 0,
				position: "relative"
			});

			var targetMediaElement = targetElement.children(":first-child");
			this.targetMediaElement = targetMediaElement;
			targetMediaElement.css({
				display: "block",
				margin: 0,
				padding: 0,
				position: "absolute",
				zIndex: -10
			});

			if (this.options.screenFilterImage != undefined){
				this.showGradientFilm();
			}
		},

		/**
		 * showGradientScreen
		 * show 
		 */
		showGradientFilm: function(){
			var filmElement = jQuery("<div>");
			var windowWidth = this.windowElement.width();
			var windowHeight = this.windowElement.height();

			filmElement.height(windowHeight);
			filmElement.width(windowWidth);
			filmElement.css({
				display: "block",
				margin: 0,
				padding: 0,
				position: "absolute",
				zIndex: -5,
				background: "url(" + this.options.screenFilterImage + ") repeat-x left bottom"
			});

			this.targetElement.append(filmElement);
			this.filmElement = filmElement;
		},

		/**
		 * set options.
		 */
		setOptions: function(options){
			this.options = options;
		}
	};
	
	/**
	 * Main stream
	 */
	jQuery.fn.responsiveTopScreen = function(options){
		var options = jQuery.extend(jQuery.fn.responsiveTopScreen.defaults, options);
		
		// set using objects.
		var targetElement = jQuery(this);
		
		// Event start
		topScreen = new ResponsiveTopScreen(options);
		topScreen.setOptions(options);
		topScreen.run(targetElement);
		
		return this;
	};
	
	/**
	 * default options.
	 * @property screenFilterImage string put on top-screen image using `repeat-x left bottom`.
	 */
	jQuery.fn.responsiveTopScreen.defaults = {
		screenFilterImage: undefined
	};
})(jQuery);