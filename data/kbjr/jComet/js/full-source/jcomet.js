/*
 * jcomet.js
 *
 * Software: jComet HTTP Pushing Library
 * Author: James Brumond
 * Version: 0.1.1
 *
 * Copyright 2010 James Brumond
 * Dual licensed under MIT and GPL
 */

(function(window, $) {

var  _defaultSettings = {
	url: '',
	onreceive: function() { },
	error: function() { },
	refreshInterval: 0
};

window.jComet = function(options) {

	var self = this,
	s = $.extend(true, { }, _defaultSettings, options),
	poller, callback = s.onreceive;
	
	s.onreceive = function(response) {
		var returned = unserialize(response);
		if (returned) {
			callback(returned);
		} else {
			s.error(response);
		}
	};
	
	poller = new $.PushPoller(s);
	
	self.start = function() {
		poller.initialize();
		return self;
	};
	
	self.stop = function() {
		poller.abort();
		return self;
	};
	
	self.isOpen = function() {
		return poller.isOpen();
	};
	
	self.state = function() {
		return poller.state();
	};
	
	self._poller = function() {
		return poller;
	};

}

}(window, $));
