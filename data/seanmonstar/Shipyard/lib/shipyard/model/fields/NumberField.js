var Class = require('../../class/Class'),
	Field = require('./Field');

var NumberField = new Class({
	
	Extends: Field,

	from: function(value) {
		var val = parseInt(value, 10);
		if (!isNaN(val)) return val;
		else if (value == null) return null;
		
		//throw new ValidationError('Value must be numeric');
	}

});

module.exports = function(options) {
	return new NumberField(options);
};
