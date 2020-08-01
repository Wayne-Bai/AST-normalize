var Class = require('../../class/Class'),
	Store = require('../../class/Store'),
	ObservableArray = require('../../class/ObservableArray'),
	Field = require('./Field'),
	array = require('../../utils/array'),
	typeOf = require('../../utils/type').of;

var ManyField = new Class({

	Extends: Field,

	Implements: Store,

	options: {
		key: 'pk',
		serialize: 'key',
		'default': []
	},

	initialize: function ManyField(model, options) {
		this.parent(options);
		this.store('model', model);
	},

	from: function from(value) {
		var arr;
		if (!value) {
			arr = [];
		} else {
			var model = this.retrieve('model'),
				values = array.from(value),
				key = this.getOption('key'),
				// super private, dont copy this elsewhere
				cache = model.__cache();
			arr = values.map(function(v) {
				if (v instanceof model) {
					return v;
				} else if (v in cache) {
					return cache[v];
				} else {
					var data = {};
					if (typeOf(v) === 'object') {
						data = v;
					} else {
						data[key] = v;
					}
					return new model(data);
				}
			});
		}
		return new ObservableArray(arr);
	},

	serialize: function serialize(values) {
		if (!values) {
			return [];
		}
		
		values = array.from(values);
		var _model = this.retrieve('model');
		var option = this.getOption('serialize');
		var key = this.getOption('key');
		return values.map(function(v) {
			if (option === 'key') {
				return v.get(key);
			} else if (option === 'all') {
				return v.toJSON();
			}
		});
	}

});

module.exports = function(model, options) {
	return new ManyField(model, options);
};
