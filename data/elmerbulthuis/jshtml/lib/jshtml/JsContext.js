var util = require("util");
var assert = require("assert");



var base = require('./ContextBase');
module.exports = (function(target){

	util.inherits(target, base);

	target.prototype.categories = base.prototype.categories.concat([
		'jsCommentLine'
		, 'jsCommentBlock'
		, 'jsDoubleQuote'
		, 'jsSingleQuote'
		, 'jsRegExp'
		, 'jsBeginBlock'
		, 'jsBeginGroup'
		, 'jsBeginArray'
		, 'jsEndBlock'
		, 'jsEndGroup'
		, 'jsEndArray'
		, 'tagBeginOpen'
		, 'anchor'
	]);


	target.prototype.onToken = function(token){
		
		var JsBlockContext = require('./JsBlockContext');
		var JsGroupContext = require('./JsGroupContext');
		var JsArrayContext = require('./JsArrayContext');
		var TagContext = require('./TagContext');
		var AnchorContext = require('./AnchorContext');

		switch(token.category){
			case 'jsCommentLine':
			this.echo('/*' + token[1] + '*/\n');
			return this;

			case 'jsCommentBlock':
			case 'jsDoubleQuote':
			case 'jsSingleQuote':
			case 'jsRegExp':
			this.echo(token[0]);
			return this;
		
			case 'jsBeginBlock':
			return new JsBlockContext(this, token);

			case 'jsBeginGroup':
			return new JsGroupContext(this, token);

			case 'jsBeginArray':
			return new JsArrayContext(this, token);

			case 'tagBeginOpen':
			return new TagContext(this, token);

			case 'anchor':
			return new AnchorContext(this, token);
		}

	};//onToken


	return target;

})(function(parent, beginToken){
	base.call(this, parent, beginToken);
});



