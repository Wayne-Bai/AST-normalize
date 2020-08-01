var util = require("util");
var assert = require("assert");



var base = require('./JsContext');
module.exports = (function(target){
	util.inherits(target, base);

	target.prototype.index = -1;
	target.prototype.next = function(){
		this.index++;
		this.onToken = this.onTokenSteps[this.index];
		this.categories = this.categoriesSteps[this.index];
	};

	target.prototype.categoriesSteps = [
		base.prototype.categories.concat([
		])
		, base.prototype.categories.concat([
		])
		, [
			"default"
		]
	];//categoriesSteps

	target.prototype.onTokenSteps = [
		function(token){
			var JsGroupContext = require('./JsGroupContext');

			switch(token.category){
				case 'jsBeginGroup':
				this.next();
				return new JsGroupContext(this, token);
			}
			return base.prototype.onToken.apply(this, arguments);
		}
		
		, function(token){
			var JsBlockContext = require('./JsBlockContext');
			var TagContext = require('./TagContext');

			switch(token.category){
				case 'jsBeginBlock':
				this.next();
				return new JsBlockContext(this, token);

				case 'tagBeginOpen':
				this.next();
				return new TagContext(this, token);
			}
			return base.prototype.onToken.apply(this, arguments);
		}

		, function(token){
			switch(token.category){
				case 'default':
				return this.end(token);
			}

			token.redo = true;
			return this.end(null);
		}

	];//onTokenSteps


	return target;
})(function(parent, beginToken){
	assert.equal('switch', beginToken[2]);

	base.call(this, parent, beginToken);

	this.echo(beginToken[0]);

	this.next();
});



