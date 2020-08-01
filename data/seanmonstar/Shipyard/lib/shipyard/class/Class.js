// Parts copied or inspired by MooTools (http://mootools.net)
// - MIT Licence
var Accessor = require('../utils/Accessor'),
	object = require('../utils/object'),
	string = require('../utils/string'),
	typeOf = require('../utils/type').typeOf,
	func = require('../utils/function'),
	noop = func.noop,
	overloadSetter = func.overloadSetter,
	merge = object.merge,
	extend = object.extend;

function Class(params) {
	function klass() {
		reset(this);
		return this.initialize ? this.initialize.apply(this, arguments) : this;
	}
	if (typeOf(params) === 'function') {
		params = { initialize: params };
	}
	params = params || { initialize: noop };
	
	//Extends "embedded" mutator
	var parent = 'Extends' in params ? params.Extends : Class;
	delete params.Extends;
	if (!parent || (parent !== Class && !(isClass(parent)))) {
		throw new Error('Class must extend from another Class.');
	}
	var proto = reset(object.create(parent.prototype));
	merge(klass, parent); //inherit "static" properties
	klass.prototype = proto;
	klass.prototype.constructor = klass;
	klass.implement = implement;
	mutate(klass, params);
	klass.parent = parent;
	// every class gets a unique ID
	klass.__uid = string.uniqueID();
	return klass;
}

Class.prototype.parent = function parent() {
	if (!this.__caller) {
		throw new Error('The method "parent" cannot be called.');
	}
	var name = this.__caller.__name,
		parent_ = this.__caller.__owner.parent,
		previous = parent_ ? parent_.prototype[name] : null;
	if (!previous) {
		throw new Error('The method "' + name + '" has no parent.');
	}
	return previous.apply(this, arguments);
};

Class.prototype.toString = function toString() {
	return '[object Class]';
};

var dontMerge = ['constructor', 'parent'];
var dontMutate = ['toString', 'valueOf', 'constructor'];
function mutate(child, parent, nowrap) {
	for (var key in parent) {
		var val = parent[key];
		var mutator = child.lookupMutator(key);
		if (mutator && dontMutate.indexOf(key) === -1) {
			val = mutator.call(child, val, key);
			if (val == null) {
				continue;
			}
		}
		
		if (dontMerge.indexOf(key) !== -1) {
			continue;
		}

		if (!nowrap && typeOf(val) === 'function' && !isClass(val)) {
			val = wrap(child, key, val);
		}

		merge(child.prototype, key, val);
	}
}

var parentPattern = /a/.test(function(){a;}) ?
	/\.(parent|call|apply)[\(\.\[]/ :
	null;
function wrap(me, key, fn) {
	if (fn.__origin) {
		fn = fn.__origin;
	}
	if (parentPattern && !parentPattern.test(fn)) {
		return fn;
	}
	var wrapper = extend(function method() {
		var caller = this.caller,
			current = this.__caller;
		this.caller = current;
		this.__caller = wrapper;
		var result = fn.apply(this, arguments);
		this.__caller = current;
		this.caller = caller;
		return result;
	}, { __name: key, __origin: fn, __owner: me });
	return wrapper;
}



var implement = overloadSetter(function implement(key, value) {
	var params = {};
	params[key] = value;
	mutate(this, params);
	return this;
});


function reset(obj) {
	// If someone specifies an object or array in the prototype
	// definition, they probably want each instance to not actually
	// share that object or array. If it is left on the prototype, it
	// would use only one object (yay memory), but would also mean if
	// one instance altered it, it would be altered for all instances
	// (boo confusing).
	for (var key in obj) {
		var value = obj[key];
		switch (typeOf(value)) {
			case 'object':
				obj[key] = reset(object.create(value));
				break;
			case 'array':
				obj[key] = object.clone(value);
				break;
		}
	}
	return obj;
}

function isArray(obj) {
	return obj.length !== null && !~['function', 'string'].indexOf(typeof obj);
}

function isClass(fn) {
	return fn.prototype instanceof Class;
}

Accessor.call(Class, 'Mutator');
Class.defineMutator('Implements', function Implements(mixins) {
	mixins = isArray(mixins) ? mixins : [mixins];
	for (var i = 0, len = mixins.length; i < len; i++) {
		merge(this, mixins[i]);
		mutate(this, object.create(mixins[i].prototype), true);
	}
});

module.exports = Class;
