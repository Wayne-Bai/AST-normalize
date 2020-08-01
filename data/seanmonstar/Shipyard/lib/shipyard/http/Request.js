var Class = require('../class/Class'),
	Events = require('../class/Events'),
	Options = require('../class/Options'),
	dom = require('../dom'),
	object = require('../utils/object'),
	logging = require('../logging');

var log = logging.getLogger('shipyard.http.Request');

var XHR;
function setXHR(xhr) {
	XHR = xhr;
}
setXHR(dom.window.get('XMLHttpRequest'));

var FormData = dom.window.get('FormData');

var Request = module.exports = exports = new Class({

	Implements: [Events, Options],

	options: {
		url: '',
		data: {},
		async: true,
		method: 'POST',
		headers: {
			'X-Requested-With': 'XMLHttpRequest',
			'Content-type': 'application/x-www-form-urlencoded',
			'Accept': 'text/javascript, text/html, application/xml, text/xml, application/json, */*'
		}
	},

	initialize: function initialize(options) {
		this.xhr = new XHR();
		this.setOptions(options);
	},

	send: function send(extraData) {
		if (this.running) {
			return this;
		}
		this.running = true;

		var url = this.getOption('url'),
			data = this.prepareData(extraData),
			method = this.getOption('method').toUpperCase(),
			headers = this.getOption('headers'),
			async = this.getOption('async');

		if (method === 'GET' && data) {
			url += (~url.indexOf('?') ? '&' : '?') + data;
			data = null;
		}
		var xhr = this.xhr;
		xhr.open(method, url, async);
		xhr.onreadystatechange = this.onStateChange.bind(this);
		for (var key in headers) {
			try {
				xhr.setRequestHeader(key, headers[key]);
			} catch (e) {
				log.warn('Exception adding request header "%s"', key);
			}
		}

		this.emit('request');
		xhr.send(data);
		if (!async) {
			this.onStateChage();
		}

		return this;
	},

	cancel: function cancel() {
		if (!this.running) {
			return this;
		}
		this.running = false;
		this.xhr.abort();
		this.xhr = new XHR();
		this.emit('cancel');
		return this;
	},

	isRunning: function isRunning() {
		return this.running;
	},

	prepareData: function(extra) {
		var obj = object.merge({}, this.getOption('data'), extra),
			method = this.getOption('method').toUpperCase();

		if (this.getOption('emulation') && ~['GET', 'POST'].indexOf(method)) {
			obj._method = method;
			this.setOption('method', 'POST');
		}
		return this.serializeData(obj);
	},

	serializeData: function serializeData(obj) {
		var data;
		if (this.getOption('method').toUpperCase() !== 'GET' && FormData) {
			data = new FormData();
			object.forEach(obj, function(val, key) {
				data.append(key, val);
			});
		} else {
			data = object.toQueryString(obj);
		}

		return data;
	},

	isSuccess: function isSuccess() {
		return (this.status >= 200) && (this.status < 300);
	},

	onStateChange: function onStateChange() {
		if (this.xhr.readyState !== XHR.DONE || !this.running) {
			return;
		}
		this.running = false;
		this.status = 0;

		try {
			this.status = this.xhr.status;
		} catch(dontCare) {}

		var response = this.response = {
			text: this.xhr.responseText,
			xml: this.xhr.responseXML
		};
		if (this.isSuccess()) {
			this.emit('success', response.text, response.xml);
		} else {
			this.emit('failure', response.text, response.xml);
		}
		this.emit('complete', response.text, response.xml);
	}

});

// expose setXHR to allow tests to inject a Mock XHR
exports.setXHR = setXHR;
