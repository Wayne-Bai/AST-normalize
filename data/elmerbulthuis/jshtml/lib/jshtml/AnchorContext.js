var util = require("util");
var assert = require("assert");



var base = require('./ContextBase');
module.exports = (function(target){

	util.inherits(target, base);

	target.prototype.categories = base.prototype.categories.concat([
		"jsIdentifier"
		, "jsBeginBlock"
		, "jsBeginGroup"
		, "anchor"
		, "default"
	]);

	target.prototype.onToken = function(token){
		var AnchorEscapeContext = require('./AnchorEscapeContext');
		var AnchorInlineContext = require('./AnchorInlineContext');
		var AnchorBlockContext = require('./AnchorBlockContext');
		var AnchorGroupContext = require('./AnchorGroupContext');

		var JsWhileContext = require('./JsWhileContext');
		var JsIfContext = require('./JsIfContext');
		var JsForContext = require('./JsForContext');
		var JsWithContext = require('./JsWithContext');
		var JsFunctionContext = require('./JsFunctionContext');
		var JsDoContext = require('./JsDoContext');
		var JsSwitchContext = require('./JsSwitchContext');

		if(token.index == 0)
		switch(token.category){
			case "anchor":
			return new AnchorEscapeContext(this.end(), token);

			case "default":
			this.echo('write(' + JSON.stringify(this.beginToken[0]) + ');');
			return this.end();

			case "jsIdentifier":
			if(token[0] != token[2]) break;
			switch(token[2]){
				case 'while':
				return new JsWhileContext(this.end(), token);

				case 'if':
				return new JsIfContext(this.end(), token);

				case 'for':
				return new JsForContext(this.end(), token);

				case 'do':
				return new JsDoContext(this.end(), token);
				
				case 'switch':
				return new JsSwitchContext(this.end(), token);

				case 'function':
				return new JsFunctionContext(this.end(), token);

				case 'with':
				return new JsWithContext(this.end(), token);

			}
			return new AnchorInlineContext(this.end(), token);

			case "jsBeginBlock":
			return new AnchorBlockContext(this.end(), token);

			case "jsBeginGroup":
			return new AnchorGroupContext(this.end(), token);
		}

		return base.prototype.onToken.apply(this, arguments);
	};//onToken


	return target;

})(function(parent, beginToken){
	base.call(this, parent, beginToken);

	if(this.parent.content && /\w+$/.test(this.parent.content)) {
		this.categories = base.prototype.categories.concat([
			"anchor"
			, "default"
		]);
	}

	this.beginToken = beginToken;
});



