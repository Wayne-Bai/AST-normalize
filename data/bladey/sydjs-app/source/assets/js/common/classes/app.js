// App
// -------------

// This is the main class for managing the application. It contains logic to
// do with managing views, events, and loading.
// 
// It is instantiated as `app`, and can be extended with logic specific to the
// application (state, models, events, etc.)

var App = function() {
	_.extend(this, {
		data: {},
		
		_views: {}, // all views that have been registered
		_viewZ: 10, // the highest z-index for any view
		_currentView: null,
		_previousView: null,
		
		_inTransition: false,
		
		_preloaded: {},
		_transitions: {},
		_local: false,
		_device: false
	});
};

_.extend(App.prototype, Backbone.Events, {
	
	touchSupport: 'ontouchstart' in document.documentElement,
	touchEventEquivalents: {
		'touchstart': 'mousedown',
		'touchend': 'mouseup',
		'touchmove': 'mousemove',
		'tap': 'click'
	},
	
	init: function() {
		
		this.initDevice();
		this.initResize();
		
		this.trigger('init');
		
	},
	
	_transitionTimeout: null,
	
	inTransition: function() {
		if (this._inTransition) {
			return true;
		}
		// console.log('app:inTransition() setting _inTransition = true');
		this._inTransition = true;
		var app = this;
		this._transitionTimeout = setTimeout(function() {
			// console.log('app:inTransition() timed out in 1250ms... ending transition state.');
			app.doneTransition();
		}, 1250);
		return false;
	},
	
	doneTransition: function() {
		clearTimeout(this._transitionTimeout);
		// console.log('app:doneTransition() setting _inTransition = false');
		this._inTransition = false;
	},
	
	// handle resize events
	initResize: function() {
		var resize = function() {
			app.viewportSize = {
				width: $(window).width(),
				height: $(window).height()
			};
			// determine if a status bar should take up real estate
			if (!app._device.system || app._device.system == 'ios') {
				$('.statusbar').css('height', 21);
				app._device.system == 'ios' && $('.statusbar').addClass('native');
			}
			// assume we're on a desktop if we have no system and set
			// the viewport size appropriately
			if (!app._device.system) {
				app.viewportSize = {
					width: $('#viewport').width(),
					height: $('#viewport').height()
				};
			}
			if (app._currentView) {
				app._currentView.trigger('layout');
			}
		}
		resize();
		$(window).on('resize', resize);
	},
	
	currentViewZ: function() {
		return app._viewZ * 100;
	},
	
	lastViewZ: function() {
		app._viewZ--;
		return app._viewZ * 100;
	},
	
	nextViewZ: function() {
		app._viewZ++;
		return app._viewZ * 100;
	},
	
	view: function(key) {
		var view = this._views[key];
		if (view) {
			return view;
		} else {
			app.showNotification('Alert', 'Invalid view (' + key + ') requested.');
		}
	},
	
	currentView: function(view, hidePrevious) {
		if (view) {
			// console.log('app:currentView() Setting current view to ' + view.id);
			var previousView = (hidePrevious) ? this.currentView() : false;
			this._previousView = previousView;
			this._currentView = view;
			// hide the previous view if there was one
			if (previousView) {
				// console.log('app:currentView() hiding previous view: ' + previousView.id);
				previousView.hide();
			}
			this.doneTransition();
		}
		return this._currentView;
	},
	
	showNotification: function(title, message, label, callback) {
	
		callback = callback || function() {};
		
		// Use native Cordova alert dialogs
		if (navigator.notification && navigator.notification.alert) {
			navigator.notification.alert(message, callback, title || 'Alert', label || 'OK');
		// Fallback to browser alerts
		} else {
			alert(message);
			if (callback) return callback();
		}
	
	},
	
	showConfirm: function(title, message, labels, callback) {
	
		callback = callback || function() {};
		
		// Use native Cordova confirm dialogs
		if (navigator.notification && navigator.notification.confirm) {
			navigator.notification.confirm(message, callback, title || 'Confirm', labels || ['OK', 'Cancel']);
		// Fallback to browser confirms (1 = OK, 2 = Cancel)
		} else {
			if (!confirm(message)) {
				return callback(1);
			} else {
				return callback(2);
			}
		}
	
	},
	
	showLoadingSpinner: function(label, then) {
		
		var self = this;
		
		// cater for native spinner (if it exists)
		// NOTE: disable until a more consistant style can be achieved
		/*
		if (window.plugins && window.plugins.spinnerDialog) {
			window.plugins.spinnerDialog.show();
			if (then) {
				// console.log( "[showLoadingSpinner] - Has then() callback." );
				then();
			}
			return;
		}
		*/
		
		console.log( "[showLoadingSpinner] - Showing loading spinner." );
		
		if (this._hidingSpinner) {
			$('#app-loading').velocity('stop');
			this._hidingSpinner = false;
			$('#app-loading').velocity({ opacity: 1 }, {
				duration: 300,
				easing: 'easeInOutSine'
			});
			return;
		}
		
		if (this._showingSpinner) return;
		if (this._spinnerVisible) return;
		
		this._showingSpinner = true;
		this._spinnerVisible = true;
		
		$('#app-loading').css({
			'z-index': this.currentViewZ() + 99,
			'opacity': 0,
			'display': 'block'
		}).velocity({
			opacity: 1
		}, {
			duration: 300,
			easing: 'easeInOutSine',
			complete: function() {
				
				self._showingSpinner = false;
				
				if (then) {
					// console.log( "[showLoadingSpinner] - Has then() callback." );
					then();
				}
			
			}
		});
		
		if (label) {
			$('#app-loading').addClass( 'with-label' ).find( '.label' ).text(label);
		} else {
			$('#app-loading').removeClass( 'with-label' );
		}
		
		$('#app-loading .spinner').spinner('start');
		
	},
	
	hideLoadingSpinner: function(then) {
		
		var self = this;
		
		// cater for native spinner (if it exists)
		// NOTE: disable until a more consistant style can be achieved
		/*
		if (window.plugins && window.plugins.spinnerDialog) {
			window.plugins.spinnerDialog.hide();
			if (then) {
				console.log( "[hideLoadingSpinner] - Has then() callback." );
				then();
			}
			return;
		}
		*/
		
		console.log( "[hideLoadingSpinner] - Hiding loading spinner." );
		
		if (this._hidingSpinner) return;
		if (!this._spinnerVisible) return;
		
		this._hidingSpinner = true;
		
		$('#app-loading').velocity({
			opacity: 0
		}, {
			duration: 300,
			easing: 'easeInOutSine',
			complete: function() {
			
				if (!self._hidingSpinner) return;
				
				self._hidingSpinner = false;
				self._spinnerVisible = false;
				
				$('#app-loading').hide();
				$('#app-loading .spinner').spinner('stop');
				
				if (then) {
					// console.log( "[hideLoadingSpinner] - Has then() callback." );
					then();
				}
			
			}
		});
	},
	
	// iOS/Desktop: changes the colour of the transparent statusbar
	// not relevant to Android, there are more methods available but
	// they have no visible change so have been left out, using a
	// basic black and white theme
	changeStatusBarStyle: function(style, delay) {
		if (!style) return;
		setTimeout(function() {
			if (app._device.system == 'ios') {
				switch(style) {
					case 'black': StatusBar.styleDefault(); break;
					case 'white': StatusBar.styleLightContent(); break;
				}
			}
			if (!app._device.system) {
				switch(style) {
					case 'black': $('.statusbar').removeClass('white').addClass('black'); break;
					case 'white': $('.statusbar').removeClass('black').addClass('white'); break;
				}
			}
		}, delay || 0);
	},
	
	// scrolls any containers back up to the top when leaving a view
	scrollContainer: function(view) {
		if (view.disableAutoScroll) return;
		var scrollingContainers = view.$el.find('.container');
		_.each(scrollingContainers, function($el) {
			$el.scrollTop = 0;
		});
	},
	
	// hide the keyboard when hiding a screen (blur active element)
	hideKeyboard: function() {
		if (document.activeElement.tagName.toLowerCase().match(/input|textarea|select/)) {
			document.activeElement.blur();
		}
	},
	
	// iOS: prevent auto focusing the last field, for some reason
	// this happens intermittently 
	disableFields: function() {
		if (app._device.system == 'ios') {
			var fields = app.currentView().$el.find('input,textarea,select');
				fields.prop( 'disabled', true );
				setTimeout( function() { fields.prop( 'disabled', false ); }, 1000 );
		}
	},
	
	getAPIEndpoint: function(api) {
		return config.baseURL + '/api/app/' + api + '?version=' + app.data.version;
	},
	
	initDevice: function() {
	
		var userAgent = navigator.userAgent.toLowerCase();
		
		app._device = {
			mobile: (/iphone|ipad|ipod|android/i.test(userAgent)),
			
			system: false,
			tablet: false,
			
			browser: false,
			
			model: false, // iOS specific
			size: false // iOS specific
		};
		
		// Detect iOS devices
		if (userAgent.match(/iphone|ipad|ipod/)) {
			app._device.system = 'ios';
			if (userAgent.match('iphone')) {
				app._device.model = 'iphone';
			} else if (userAgent.match('ipad')) {
				app._device.model = 'ipad';
			} else if (userAgent.match('ipad')) {
				app._device.model = 'ipad';
				app._device.tablet = true;
			}
			if (app._device.model == 'iphone' || app._device.model == 'ipod') {
				if ($(window).height() <= 480) {
					app._device.size = 'short';
				} else {
					app._device.size = 'tall';
				}
			}
		}
		
		// Detect Android devices
		if (userAgent.match('android')) {
			app._device.system = 'android';
			if (!userAgent.match('mobile')) {
				app._device.tablet = true;
			}
		}
		
		/* Device Specific Code */
		
		// Android: In some cases, Android doesn't include the Roboto font, add it via Google Web Fonts,
		// it would be better if we detected if it didn't exist but this looks a bit tricky
		if (app._device.system == 'android') {
			WebFontConfig = {
				google: {
					families: ['Roboto']
				}
			};
			(function() {
				var wf = document.createElement('script');
				wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
					'://ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js';
				wf.type = 'text/javascript';
				wf.async = 'true';
				var s = document.getElementsByTagName('script')[0];
				s.parentNode.insertBefore(wf, s);
			})();
		}
		
		// Add desktop class if we have no system set (so we can emulate dimensions in the browser)
		if (!app._device.system) {
			$('#viewport').addClass( 'device-desktop' );
		}
	
	}
	
});

app = new App();
