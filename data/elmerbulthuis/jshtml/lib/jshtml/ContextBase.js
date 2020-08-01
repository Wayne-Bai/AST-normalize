var util = require("util");
var assert = require("assert");



var base = Object;
module.exports = (function(target){

	util.inherits(target, base);

	target.prototype.categories = [];

	target.prototype.onToken = function(token){
		throw new SyntaxError('jshtml - unexpected token ' + token.category + ' line ' + this.line + '');
	};//onToken

	target.prototype.echo = function(data, state){
		this.parent && this.parent.echo(data, {});
	};//echo

	target.prototype.end = function(endToken){
		this.echo(this.suffix, {});
		endToken && (this.content += endToken[0]);
		!this.isRoot && (this.parent.content += this.content);
		return this.parent;
	};//end

	return target;

})(function(parent, beginToken){

	base.call(this);

	this.parent = parent;
	this.suffix = '';

	this.content = '';
	beginToken && (this.content += beginToken[0]);
});


