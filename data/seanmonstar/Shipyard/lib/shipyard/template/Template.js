var Class = require('../class/Class'),
	object = require('../utils/object');

module.exports = new Class({
	
	initialize: function(text) {
		this.text = text;
	},

	compile: function compile() {
		// stub - to be overridden
		// but be sure to call this.parent()
		var text = this.text;
		this.compiled = function () { return text; };
	},

	render: function render(view, helpers) {
		if (!this.compiled) {
			this.compile();
		}

		return this.compiled(view, helpers || {});
	}

});
