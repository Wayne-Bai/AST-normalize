// Parts copied or inspired by MooTools (http://mootools.net)
// - MIT Licence
var Class = require('../class/Class'),
	Timer = require('./Timer'),
	dom = require('../dom'),
	Color = require('../utils/Color'),
	array = require('../utils/array'),
	object = require('../utils/object'),
	typeOf = require('../utils/type').typeOf;

var Parsers = {
	
	Number: {
		parse: parseFloat,
		compute: Timer.compute,
		serve: function(value, unit) {
			return (unit) ? value + unit : value;
		}
	},

	Color: {
		parse: function(value) {
			try {
				return new Color(value);
			} catch (notAColor) {
				return false;
			}
		},
		compute: function(from, to, delta) {
			return array.from(from).map(function(value, i) {
				return Math.round(Timer.compute(from[i], to[i], delta));
			});
		},
		serve: function(value) {
			return value.map(Number);
		}
	},

	String: {
		parse: function s() { return false; },
		compute: function s(zero, one) {
			return one;
		},
		serve: function s(zero) {
			return zero;
		}
	}

};

function computeOne(from, to, delta) {
	var computed = [];
	var times = Math.min(from.length, to.length);
	for (var i = 0; i < times; i++) {
		computed.push({
			value: from[i].parser.compute(from[i].value, to[i].value, delta),
			parser: from[i].parser
		});
	}
	computed.isComputed = true;
	return computed;
}

module.exports = new Class({

	Extends: Timer,

	initialize: function Animation(element, options) {
		this.element = this.subject = dom.$(element);
		this.parent(options);
	},

	set: function set(now) {
		if (typeOf(now) === 'object') {
			for (var p in now) {
				this.render(this.element, p, now[p], this.options.unit);
			}
		} else {
			var property = this.property || this.options.property;
			this.render(this.element, property, now, this.options.unit);
		}
		return this;
	},

	start: function start(properties, from, to) {
		if (!this.check(properties, from, to)) {
			return this;
		}
		var parsed;
		if (typeOf(properties) === 'object') {
			from = {};
			to = {};
			for (var p in properties) {
				parsed = this.prepare(this.element, p, properties[p]);
				from[p] = parsed.from;
				to[p] = parsed.to;
			}
		} else {
			var args = array.from(arguments);
			this.property = this.options.property || args.shift();
			parsed = this.prepare(this.element, this.property, args);
			from = parsed.from;
			to = parsed.to;
		}
		return this.parent(from, to);
	},

	// ** Private **

	prepare: function prepare(element, property, values) {
		//prepares the base from/to object

		values = array.from(values);

		if (values[1] == null) {
			values[1] = values[0];
			values[0] = element.getStyle(property);
		}
		var parsed = values.map(this.parse);
		return {from: parsed[0], to: parsed[1]};
	},


	parse: function parse(value) {
		//parses a value into an array

		if (typeof value === 'function') {
			value = value();
		}
		value = (typeof value === 'string') ? value.split(' ') : array.from(value);
		return value.map(function(val) {
			val = String(val);
			var found = false;
			object.some(Parsers, function(parser, key) {
				var parsed = parser.parse(val);
				if (parsed || parsed === 0) {
					found = {value: parsed, parser: parser};
					return true;
				}
			});
			found = found || {value: val, parser: Parsers.String};
			return found;
		});
	},

	compute: function compute(from, to, delta) {
		//computes by a from and to prepared objects, using their parsers.
		if (typeOf(from) === 'object') {
			var now = {};
			for (var p in from) {
				now[p] = computeOne(from[p], to[p], delta);
			}
			return now;
		} else {
			return computeOne(from, to, delta);
		}
	},

	serve: function(value, unit) {
		//serves the value as settable
		if (!value.isComputed) {
			value = this.parse(value);
		}
		var returned = [];
		value.forEach(function(bit) {
			returned = returned.concat(bit.parser.serve(bit.value, unit));
		});
		return returned;
	},

	render: function(element, property, value, unit) {
		//renders the change to an element
		element.setStyle(property, this.serve(value, unit));
	}

});
