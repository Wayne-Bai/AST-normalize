// Parts copied or inspired by MooTools (http://mootools.net)
// - MIT Licence
var Class = require('./Class'),
	merge = require('../utils/object').merge,
	func = require('../utils/function'),
	overloadGetter = func.overloadGetter,
	overloadSetter = func.overloadSetter;

var onEventRE = /^on[A-Z]/;

function getOption(name) {
	if (!this.options) {
		return null;
	}
	return this.options[name];
}

function setOption(name, value) {
	if (!this.options) {
		this.options = {};
	}
	if (this.addListener && onEventRE.test(name) && typeof value === 'function') {
		this.addListener(name, value);
	} else {
		merge(this.options, name, value);
	}
	return this;
}

module.exports = new Class({

	getOption: getOption,

	getOptions: overloadGetter(getOption),

	setOption: setOption,
	
	setOptions: overloadSetter(setOption)

});
