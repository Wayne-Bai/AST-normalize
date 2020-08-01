"use strict";

var overload; /// require function.overload.js
/// target none
	overload = require('./function.overload.js');
/// target

function on(event, callback)
{
	/* jshint validthis: true */
	if (!this.handlers.hasOwnProperty(event))
		this.handlers[event] = [];

	this.handlers[event].push(callback);

	return this.self;
}

function off(event, callback)
{
	/* jshint validthis: true */
	if (!this.handlers.hasOwnProperty(event))
		return this.self;

	var callbacks = this.handlers[event];

	if (callback != null)
	{
		var i = callbacks.length;
		while (i--)
		{
			if (callbacks[i] !== callback)
				continue;

			callbacks.splice(i, 1);
			break;
		}
	}
	else
	{
		callbacks.pop();
	}

	if (callbacks.length === 0)
		delete this.handlers[event];

	return this.self;
}

function emit(event)
{
	/* jshint validthis: true */
	if (!this.handlers.hasOwnProperty(event))
		return true;

	var args = Array.prototype.slice.call(arguments, 1),
		callbacks = this.handlers[event].slice(),
		i = 0,
		max = callbacks.length,
		cancelled = false;

	for (; i < max; ++i)
		cancelled = callbacks[i].apply(this.self, args) === false || cancelled;

	return !cancelled;
}

function evented(target)
{
	var context = {
		self: target,
		handlers: {}
	};

	target.on = on.bind(context);
	target.off = off.bind(context);
	target.emit = emit.bind(context);
}

/// export evented
/// target none
	module.exports = evented;
/// target
