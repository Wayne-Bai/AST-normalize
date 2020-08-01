var Class = require('../../class/Class'),
	Field = require('./Field'),
	typeOf = require('../../utils/type').typeOf;

var BooleanField = new Class({

	Extends: Field,

	from: function(value) {
		// this captures 1 & 0 also
		if (value == true) return true;
		if (value == false) return false;

		if (typeOf(value) == 'string') {
			var lower = value.toLowerCase();
			if (lower == 'true') return true;
			else if (lower == 'false') return false;
		}

		if (value === null) return null;

		//throw new ValidationError('Value must be either true or false')
	}

});

module.exports = function(options) {
	return new BooleanField(options);
};
