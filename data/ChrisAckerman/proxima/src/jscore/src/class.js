"use strict";

function extend(child)
{
	if (!(child instanceof Function))
		child = function fn() {};

	var parent = this instanceof ClassProxy ? this.fn : this;

	child.parent = parent;
	child.prototype = Object.create(parent.prototype);
	child.prototype.constructor = child;

	return Class.init(child);
}

function implement(proto, value)
{
	var self = this instanceof ClassProxy ? this.fn : this;

	if (/^(string|number)$/.test(typeof proto))
	{
		if (typeof value !== 'undefined')
			self.prototype[proto] = value;
	}
	else
	{
		for (var i in proto)
		{
			if (proto[i] == null)
				continue;

			self.prototype[i] = proto[i];
		}
	}

	return this;
}

function implementStatic(proto, value)
{
	var self = this instanceof ClassProxy ? this.fn : this;

	if (/^(string|number)$/.test(typeof proto))
	{
		if (typeof value !== 'undefined')
			self.prototype[proto] = value;
	}
	for (var i in proto)
	{
		if (proto[i] == null)
			continue;

		self[i] = proto[i];
	}

	return this;
}

function create()
{
	var self = this instanceof ClassProxy ? this.fn : this;
	var instance = Object.create(self.prototype);
	var retval = self.apply(instance, Array.prototype.slice.call(arguments, 0));

	return retval == null ? instance : retval;
}

function Class(fn)
{
	if (this instanceof Class || !(fn instanceof Function))
		return;

	return new ClassProxy(fn);
}

Class.init = function(fn)
{
	if (!(fn instanceof Function))
		fn = function fn() {};

	fn.extend = extend;
	fn.implement = implement;
	fn.implementStatic = implementStatic;
	fn.create = create;

	return fn;
};

Class.deinit = function(fn)
{
	if (fn.hasOwnProperty('extend') && fn.extend === extend)
		delete fn.extend;
	if (fn.hasOwnProperty('implement') && fn.implement === implement)
		delete fn.implement;
	if (fn.hasOwnProperty('implementStatic') && fn.implementStatic === implementStatic)
		delete fn.implementStatic;
	if (fn.hasOwnProperty('create') && fn.create === create)
		delete fn.create;
};

Class.init(Class);

function ClassProxy(fn)
{
	this.fn = fn;
}

Class.init(ClassProxy).implement({
	extend: extend,
	implement: implement,
	implementStatic: implementStatic,
	create: create
});

/// export Class
/// target none
	module.exports = Class;
/// target
