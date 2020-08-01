//	Index
//	=====
//
//	This is the main init script, which configures the application.
//	It should be the last script included.

_.extend(app.data, {
	
	version: '1.0.0', // Current app version, compared against config we get back from the server
	
	config: {}, // Stores the config settings we get back from every status request
	
	user: {}, // Stores a user key we generate on startup that allows consistant analytics tracking, also stores the push notification preference
	
	session: {}, // Stores user related data when signed in
	
	meetups: {} // Stores the next and last meetup data including talks
	
});

_.extend(app, {
	
	/* Performance Conditions */
	
	setPerformanceConditions: function() {
	
		// TBC
	
	},
	
	/* Config */
	
	checkConfig: function() {
	
		var config = app.data.config;
		
		// Check kill switch
		if (config.killSwitch) return app.showConfigNotification('killSwitch');
		
		var versions = {
			current: app.data.version.split('.'),
			compatibility: config.versions.compatibility.split('.'),
			production: config.versions.production.split('.')
		}
		
		// Check if major current version is behind major compatibility version
		if ( Number(versions.current[0]) < Number(versions.compatibility[0]) ) {
			// console.log('[checkConfig] - Users current major version is behind compatibility major version.');
			return app.showConfigNotification('versionIncompatibility');
		}
		
		// Check if major current version is behind major production version
		if ( Number(versions.current[0]) < Number(versions.production[0]) ) {
			// console.log('[checkConfig] - Users current major version is behind production major version.');
			return app.showConfigNotification('versionIncompatibility');
		}
	
	},
	
	showConfigNotification: function(type) {
	
		var $configNotice = $('#config-notice');
		
		var html = false;
		
		switch(type) {
		
			case 'killSwitch':
				html = '<div class="text">' +
					'<div>SydJS is currently unavailable.</div>' +
					'<div>Please check back soon!</div>' +
				'</div>';
			break;
			
			case 'versionIncompatibility':
				var via = 'GitHub';
				switch(app._device.system) {
					case 'ios':
						via = 'the App Store';
					break;
					case 'android':
						via = 'the Google Play Store';
					break;
				}
				html = '<div class="text">' +
					'<div>A new version of the SydJS app is now available.</div>' +
					'<div>Please update the app via ' + via + '.</div>' +
				'</div>';
			break;
			
			case 'noResponse':
				html = '<div class="text">' +
					'<div>Please check your internet connection.</div>' +
				'</div>';
			break;
		
		}
		
		if (!html) return;
		
		$configNotice.find('.box').html(html);
		
		$configNotice.addClass('show');
		
		$configNotice.find('.box').css( 'margin-top', -( $configNotice.find('.box').height() / 2 ) );
	
	},
	
	hidePingNotification: function() {
	
		var $configNotice = $('#config-notice');
		
		$configNotice.removeClass('show');
		
		$configNotice.find('.box').html('').css( 'margin-top', 0 );
		
	},
	
	/* User Data */
	
	storeUser: function() {
		
		var userKey = app.generateUser();
		
		localStorage.setItem( 'user_key', userKey );
		
		return userKey;
		
	},
	
	generateUser: function() {
		
		var key = '',
			possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
			
		for(var i = 0; i < 24; i++) {
			key += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		
		return key;
		
	},
	
	populateUser: function() {
	
		var userKey = localStorage.getItem('user_key'),
			userPushNotifications = localStorage.getItem('user_pushNotifications') == 'true' ? true : false;
		
		app.data.user.key = userKey || app.storeUser();
		app.data.user.pushNotifications = userPushNotifications;
		
		app.setIdentity(app.data.user.key);
		
		// console.log('[populateUser] - Set user key as [' + app.data.user.key + '], push notifications as [' + app.data.user.pushNotifications + '].');
	
	},
	
	preloadUser: function(callback) {
		
		var $image = $(new Image());
		
		$image.on({
			load: function() { callback() },
			error: function() { callback() }
		});
		
		$image.prop('src', app.data.session.avatar);
		
	},
	
	/* Session Data */
	
	storeSessionInfo: function(data) {
		
		// console.log('[storeSessionInfo] - Storing session info into local storage.');
		
		// populate local storage with date and user date
		localStorage.setItem( 'session_date', data.date );
		localStorage.setItem( 'session_userId', JSON.stringify( data.userId ) );
		
		this.populateSessionInfo(data);
		
	},
	
	populateSessionInfo: function(data) {
		
		// console.log('[populateSessionInfo] - Populating session info into app.');
		
		_.extend(app.data.session, _.pick(data, 'date', 'userId'));
		
	},
	
	resumeSession: function() {
		
		// console.log('[resumeSession] - Resuming session...');
		
		// Check local storage for session data
		// console.log('[resumeSession] - Checking local storage...');
		
		var date = localStorage.getItem('session_date'),
			user = localStorage.getItem('session_userId');
		
		// Function to handle retries
		var retry = function() {
			app.showNotification('Oops!', 'There was an error communicating with SydJS, please wait while we attempt to re-connect in 5 seconds.', false, function() {
				app.showLoadingSpinner('Retrying');
				setTimeout(function() {
					app.resumeSession();
				}, 5000);
			});
			return;
		}
		
		var outcome = function(err) {
			if (err) return retry();
			app.view('home').show();
		}
		
		// Check for timestamp and valid code
		if ( date && user)
		{
			// console.log('[resumeSession] - Existing data found, populating data from local storage...');
			
			app.populateSessionInfo({
				date: localStorage.getItem( 'session_date' ),
				userId: JSON.parse( localStorage.getItem( 'session_userId' ) )
			});
			
			// console.log('[resumeSession] - Session info retrieved from [' + moment( parseInt( date ) ).format('DD/MM/YYYY h:mm:ssa') + ']...');
			
			app.getStatus(function(err) {
				return outcome(err);
			});
		}
		// If we don't have any data, just show the home screen (default behaviour)
		else
		{
			// console.log('[resumeSession] - No existing data found...');
			// console.log('[resumeSession] - Showing [signin] screen.');
			
			app.getStatus(function(err) {
				return outcome(err);
			});
		}
		
	},
	
	/* Status Data */
	
	getStatus: function(callback) {
	
		// console.log('[getStatus] - Retrieving status data from server...');
		
		var apiData = {};
		
		if (app.data.session.userId) apiData.user = app.data.session.userId;
		
		var success = function(data) {
			
			// console.log('[getStatus] - Successfully retrieved status.');
			
			// Set config data
			if (data.config) app.data.config = data.config;
			app.checkConfig();
			
			// Set meetup data
			if (data.meetups) app.data.meetups = data.meetups;
			
			// Set RSVP data
			if (!_.isEmpty(app.data.rsvp) && data.rsvp) {
				if (moment(app.data.rsvp.date).isSame(moment(data.rsvp.date))) {
					// console.log('[getStatus] - Client-side RSVP matches server RSVP, ignoring.');
				} else if (moment(app.data.rsvp.date).isAfter(moment(data.rsvp.date))) {
					// console.log('[getStatus] - Client-side RSVP is AFTER server RSVP, ignoring.');
				} else {
					// console.log('[getStatus] - Client-side RSVP is BEFORE server RSVP, overwritten.');
					app.data.rsvp = data.rsvp;
					app.view('home').setState();
				}
			} else {
				// console.log('[getStatus] - No client-side RSVP set, setting.');
				app.data.rsvp = data.rsvp;
			}
			
			// Set user data
			if (apiData.user && data.user) app.data.session = data.user;
			
			// Determine if meetup data has changed (if it changes)
			var meetup = app.parseMeetup();
			
			if (app._lastHash && meetup.data.hash != app._lastHash) {
				// console.log('[getStatus] - Meetup data changed!');
				app.preloadMeetup();
				app.view('talks').renderTalks();
				app.view('home').setMeetup();
				app.view('home').setState();
				app._lastHash = meetup.data.hash;
			} else {
				// console.log('[getStatus] - Meetup data has not changed.');
				app._lastHash = meetup.data.hash;
			}
			
			// Add timeout for next status call
			app._statusInterval = setTimeout(function() {
				app.getStatus();
			}, 10000);
			
			if (callback) return callback(false);
			
		}
		
		var error = function() {
			
			// console.log('[getStatus] - Failed getting status, aborting');
			
			if (callback) return callback(true);
			
		}
		
		$.ajax({
			url: app.getAPIEndpoint('status'),
			type: 'post',
			data: apiData,
			dataType: 'json',
			cache: false,
			success: function(data) {
				return success(data);
			},
			error: function() {
				return error();
			}
		});
	
	},
	
	parseMeetup: function() {
	
		return {
			next: app.data.meetups.next ? true : false,
			data: app.data.meetups.next || app.data.meetups.last,
			inProgress: app.data.meetups.next && app.data.meetups.next.starts && app.data.meetups.next.ends ? moment().isAfter(moment(app.data.meetups.next.starts)) && moment().isBefore(moment(app.data.meetups.next.ends)) : false
		}
	
	},
	
	preloadMeetup: function() {
		
		var self = this;
		
		// console.log('[preloadMeetup] - Preload requested...');
		
		if (!app.data.meetups.next) return;
		
		async.each(app.data.meetups.next.talks, function(talk, loadedTalk) {
			
			async.each(talk.who, function(person, loadedPerson) {
			
				if (!person.avatarUrl) return loadedPerson();
				
				var $image = $(new Image());
				
				$image.on({
					load: function() { loadedPerson() },
					error: function() { loadedPerson() }
				});
				
				$image.prop('src', person.avatarUrl);
				
				// console.log('[preloadMeetup] - Loading [' + person.avatarUrl + '].');
			
			}, function(err) {
				// console.log('[preloadMeetup] - Preloaded talk.');
				return loadedTalk();
			});
			
		}, function(err) {
			// console.log('[preloadMeetup] - Preloaded meetup.');
		});
	
	},
	
	/* Sign Out */
	
	signOut: function() {
	
		app.data.session = {};
		
		if (app.data.meetups.next) {
			app.data.rsvp.responded = false;
			app.data.rsvp.attending = false;
		}
		
		localStorage.clear();
		
		app.view('signout').show('slide-up');
	
	},
	
	/* Notifications */
	
	enableNotifications: function(callback) {
		
		console.log('[enableNotifications] - Enabling notifications...');
		
		var user = app.data.session;
		
		Notificare.enableNotifications();
		
		Notificare.once('registration', function(deviceId) {
			
			console.log('[enableNotifications] - Notification response...');
			
			var userId = (user && user.userId ? user.userId : app.data.user.key),
				userName = (user && user.name && user.name.full ? user.name.full : 'Unknown');
			
			Notificare.registerDevice(deviceId, userId, userName, function() {
				
				console.log('[enableNotifications] - Registered for notifications with device id: [' + deviceId + '], user id: [' + userId + '], name: [' + userName + '].');
				
				app.setNotifications(true, callback);
			
			}, function(err) {
			
				console.log('[enableNotifications] - Failed enabling notifications.', err );
				
				app.showNotification('Alert', 'Sorry, there was an issue registering you for notifications. Please try again.');
				
				if (callback) return callback(true);
			
			});
			
		});
	
	},
	
	disableNotifications: function(callback) {
	
		console.log('[disableNotifications] - Disabling notifications...');
		
		Notificare.disableNotifications(function() {
			app.setNotifications(false, callback);
		});
	
	},
	
	setNotifications: function(enable, callback) {
	
		console.log('[setNotifications] - enable: [' + enable + '].');
		
		app.data.user.pushNotifications = enable;
		
		localStorage.setItem('user_pushNotifications', enable);
		
		if (callback) return callback();
	
	},
	
	/* Analytics */
	
	initAnalytics: function() {
	
		ga('create', 'UA-52640025-1', {
			'storage' : 'none',
			'clientId': app.data.user.key
		});
		ga('set', 'checkProtocolTask', function() {});
		ga('send', 'pageview');
	
	},
	
	setIdentity: function(key) {
	
		if (!window.mixpanel) return;
		
		try {
			mixpanel.identify(key);
		} catch(e) {}
	
	},
	
	trackIdentity: function(options) {
		
		if (!window.mixpanel) return;
		
		try {
			mixpanel.people.set(options);
			mixpanel.name_tag(app.data.session.name.full + ( app.data.session.email ? ' (' + app.data.session.email + ')' : '' ) );
		} catch(e) {}
		
	},
	
	trackEvent: function(options) {
		
		if (window.mixpanel) {
			
			// console.log('[trackEvent] - Logging event to Mixpanel with the following data:', options.label, options.properties);
			
			try {
				mixpanel.track('Viewing ' + options.label, options.properties);
			} catch(e) {
				// console.log('[trackEvent] - Encountered an issue while logging an event to Mixpanel...', e);
			}
			
		}
		
		if (window.ga) {
			
			if (!options.category || !options.action) return;
			
			var data = {
				category: options.category, // required
				action: options.action, // required
				label: options.label || '',
				value: options.value || 0
			}
			
			// console.log('[trackEvent] - Logging event to Google Analytics with the following data:', data);
			
			try {
				ga('send', 'event', data.category, data.action, data.label, data.value);
			} catch(e) {
				// console.log('[trackEvent] - Encountered an issue while logging an event to Google Analytics...', e);
			}
			
		}
		
	}
	
});

app.on('init', function() {
	
	// Logging
	// console.log('[init] - App init started...');
	
	// Set specific flags based on what device we're using, which will enable/disable certain
	// effects around the app to improve performance, this must happen before any views are shown
	app.setPerformanceConditions();
	
	// Make sure we have a user set for analytics tracking
	app.populateUser();
	
	// Init analytics
	app.initAnalytics();
	
	// Show the loading view immeidately, which is a clone of the home view with the SydJS logo
	// in the starting position
	app.view('loading').show();
	
	// set the home background so it's inited before we reach the view
	app.view('home').setBackground();
	
	// Logging
	// console.log('[init] - App init finished, resuming session...');
	
	// Resume the session
	app.resumeSession();
	
});
