// Parts copied or inspired by MooTools (http://mootools.net)
// - MIT Licence
var Class = require('../class/Class'),
	Element = require('./Element'),
	object = require('../utils/object'),
	typeOf = require('../utils/type').typeOf,
	overloadSetter = require('../utils/function').overloadSetter;

var slice = Array.prototype.slice;

function Elements() {
	this.uids = {};
	if (arguments.length) {
		this.push.apply(this, arguments);
	}
}

Elements.prototype = object.create(Array.prototype);

Elements.implement = overloadSetter(function implement(key, value) {
	this.prototype[key] = value;
});

Elements.implement({
	
	length: 0,

	push: function push() {
		for (var i = 0, len = arguments.length; i < len; i++) {
			var arg = arguments[i];
			if (typeOf(arg) === 'array' || arg instanceof Elements) {
				this.push.apply(this, slice.call(arg, 0));
			} else {
				this[this.length++] = Element.wrap(arguments[i]);
			}
		}
		return this.length;
	},

	toString: function toString() {
		return String(slice.call(this, 0));
	}

});

// all Element methods should be available on Elements as well
var implementOnElements = function(key, fn) {
	if (!Elements.prototype[key]) {
		Elements.prototype[key] = function(){
			var elements = new Elements(), results = [];
			for (var i = 0; i < this.length; i++){
				var node = this[i], result = node[key].apply(node, arguments);
				if (elements && !(result instanceof Element)) {
					elements = false;
				}
				results[i] = result;
			}

			if (elements){
				elements.push.apply(elements, results);
				return elements;
			}
			
			return results;
		};
	}
};


// suck in all current methods
var dontEnum = {};
['toString', 'initialize', 'appendChild', 'match'].forEach(function(val) { dontEnum[val] = 1; });
for (var k in Element.prototype) {
	var prop = Element.prototype[k];
	if (!dontEnum[k] && !Elements.prototype[k] && (typeof prop === 'function')) {
		implementOnElements(k, Element.prototype[k]);
	}

}

// grab all future methods
var elementImplement = Element.implement;

Element.implement = function(key, fn){
	if (typeof key !== 'string') {
		for (var k in key) {
			this.implement(k, key[k]);
		}
	} else {
		implementOnElements(key, fn);
		elementImplement.call(Element, key, fn);
	}
};


module.exports = Elements;
