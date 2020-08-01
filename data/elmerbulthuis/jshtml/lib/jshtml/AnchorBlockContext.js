var util = require("util");
var assert = require("assert");



var base = require('./JsContext');
module.exports = (function(target){

	util.inherits(target, base);

	target.prototype.categories = base.prototype.categories.concat([
		"jsEndBlock"
	]);

	target.prototype.onToken = function(token){
		switch(token.category){
			case 'jsEndBlock':
			return this.end(token);

			default:
			return base.prototype.onToken.apply(this, arguments);
		}

	};//onToken


	return target;
})(function(parent, beginToken){
	assert.equal('jsBeginBlock', beginToken.category);

	base.call(this, parent, beginToken);
});



