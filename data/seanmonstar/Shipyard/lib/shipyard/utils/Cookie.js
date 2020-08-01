// Parts copied or inspired by MooTools (http://mootools.net)
// - MIT Licence
var Class = require('../class/Class'),
	Options = require('../class/Options'),
	object = require('./object'),
	string = require('./string'),
	dom = require('../dom');

var Cookie = module.exports = new Class({

	Implements: Options,

	options: {
		path: '/',
		domain: false,
		duration: false,
		secure: false,
		encode: true
	},

	initialize: function(key, options){
		this.key = key;
		this.setOptions(options);
	},

	write: function(value){
		if (this.options.encode) {
			value = encodeURIComponent(value);
		}
		if (this.options.domain) {
			value += '; domain=' + this.options.domain;
		}
		if (this.options.path) {
			value += '; path=' + this.options.path;
		}
		if (this.options.duration) {
			var date = new Date();
			date.setTime(date.getTime() + this.options.duration * 24 * 60 * 60 * 1000);
			value += '; expires=' + date.toGMTString();
		}
		if (this.options.secure) {
			value += '; secure';
		}
		dom.document.set('cookie', this.key + '=' + value);
		return this;
	},

	read: function(){
		var cookie = dom.document.get('cookie');
		var value = cookie.match('(?:^|;)\\s*' + string.escapeRegExp(this.key) + '=([^;]*)');
		return (value) ? decodeURIComponent(value[1]) : null;
	},

	dispose: function(){
		new Cookie(this.key, object.merge({}, this.options, {duration: -1})).write('');
		return this;
	}

});

Cookie.write = function(key, value, options){
	return new Cookie(key, options).write(value);
};

Cookie.read = function(key){
	return new Cookie(key).read();
};

Cookie.dispose = function(key, options){
	return new Cookie(key, options).dispose();
};
