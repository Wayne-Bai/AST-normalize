// Parts copied or inspired by MooTools (http://mootools.net)
// - MIT Licence
var type = require('./type'),
	isFunction = type.isFunction,
	typeOf = type.of;

exports.extend = function extend(child, parent) {
	for(var i in parent) {
		child[i] = parent[i];
	}
	return child;
};

var mergeOne = function(source, key, current){
	switch (typeOf(current)){
		case 'object':
			if (typeOf(source[key]) === 'object') {
				mergeObject(source[key], current);
			} else {
				source[key] = cloneObject(current);
			}
		break;
		case 'array': source[key] = cloneArray(current); break;
		default: source[key] = current;
	}
	return source;
};

var mergeObject = exports.merge = function merge(source, k, v) {
	if (typeOf(k) === 'string') {
		return mergeOne(source, k, v);
	}
	for (var i = 1, len = arguments.length; i < len; i++) {
		var object = arguments[i];
		for (var key in object) {
			mergeOne(source, key, object[key]);
		}
	}
	return source;
};

var cloneOf = exports.clone = function clone(item) {
	switch (typeOf(item)){
		case 'array': return cloneArray(item);
		case 'object': return cloneObject(item);
		default: return item;
	}
};

var cloneArray = function(arr) {
	var i = arr.length, clone = [];
	while (i--) {
		clone[i] = cloneOf(arr[i]);
	}
	return clone;
};

var cloneObject = function(obj) {
	var clone = {};
	for (var key in obj) {
		clone[key] = cloneOf(obj[key]);
	}
	return clone;
};

exports.forEach = function forEach(obj, fn, bind) {
	for (var key in obj) {
		if (obj.hasOwnProperty(key)) {
			fn.call(bind || obj, obj[key], key, obj);
		}
	}
};

exports.map = function map(obj, fn, bind) {
	var results = {};
	for (var key in obj) {
		results[key] = fn.call(bind || obj, obj[key], key, obj);
	}
	return results;
};

exports.some = function some(obj, fn, bind) {
	for (var key in obj) {
		if (obj.hasOwnProperty(key)) {
			if (fn.call(bind || obj, obj[key], key)) {
				return true;
			}
		}
	}
	return false;
};

exports.every = function every(obj, fn, bind) {
	for (var key in obj) {
		if (obj.hasOwnProperty(key)) {
			if (!fn.call(bind || obj, obj[key], key)) {
				return false;
			}
		}
	}
	return true;
};

exports.create = Object.create || function create(obj) {
	function F(){}
	F.prototype = obj;
	return new F();
};

exports.toQueryString = function toQueryString(obj, base) {
	var queryString = [];
	
	exports.forEach(obj, function(value, key) {
		if (value == null) {
			return;
		}
		if (base) {
			key = base + '[' + key + ']';
		}
		var result;
		switch (typeOf(value)) {
			case 'object':
				result = exports.toQueryString(value, key);
				break;
			case 'array':
				var obj = {};
				for (var i = 0; i < value.length; i++) {
					obj[i] = value[i];
				}
				result = exports.toQueryString(obj, key);
				break;
			default:
				result = key + '=' + encodeURIComponent(value);
		}
		queryString.push(result);
	});

	return queryString.join('&');
};

function get(obj, key) {
	if (isFunction(obj.get)) {
		return obj.get(key);
	} else {
		return obj[key];
	}
}

function set(obj, key, val) {
	if (isFunction(obj.set)) {
		obj.set(key, val);
	} else {
		obj[key] = val;
	}
}

exports.getPath = function getPath(obj, path) {
	var parts = path.split('.');
	for (var i = 0, len = parts.length; i < len; i++) {
		obj = get(obj, parts[i]);
		if (obj == null) {
			return obj;
		}
	}
	return obj;
};

exports.setPath = function setPath(obj, path, value) {
	var parts = path.split('.');
	var parent;
	for (var i = 0, len = parts.length - 1; i < len; i++) {
		parent = obj;
		obj = get(obj, parts[i]);
		if (obj == null) {
			obj = {};
			set(parent, parts[i], obj);
		}
	}
	set(obj, parts[parts.length - 1], value);
};
