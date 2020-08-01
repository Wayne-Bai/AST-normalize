"use strict";

var Class; /// require class.js
/// target none
	Class = require('./class.js');
/// target

var Word = Class.extend(function Word(str)
{
	this.value = str;
})
.implement({
	type: 'word',
	toString: function()
	{
		return this.value;
	}
});

var Delim = Class.extend(function Delim(str)
{
	this.value = str;
})
.implement({
	type: 'delim',
	toString: function()
	{
		return this.value;
	}
});

function toString(escape, specialsRx)
{
	if (escape)
	{
		/* jshint validthis: true */
		var parts = this.slice(0),
			i = parts.length,
			replacement = escape + '$&';

		while (i--)
		{
			if (parts[i].type !== 'delim')
				parts[i] = parts[i].value.replace(specialsRx, replacement);
			else
				parts[i] = parts[i].value;
		}

		return parts.join('');
	}
	else
	{
		return this.join('');
	}
}

var Delimited = Class.extend(function Delimited(delimiters, options)
{
	this.parse = this.parse.bind(this);

	if (typeof options === 'string')
		options = { escape: options };

	if (options instanceof Object)
	{
		if (typeof options.escape === 'string' && options.escape.length <= 1)
			this._escape = options.escape;
	}

	var delim = delimiters.replace(this._escape, '').replace(/[\.\-\[\]]/g, '\\$&');
	if (delim.length === 0)
		throw new Error("At least one delimiter is required.");

	var escape = this._escape.replace(/[\\\.\-\[\]]/g, '\\$&');

	if (escape)
		this._splitRx = new RegExp(escape + '.?|[' + delim + ']|[^' + escape + delim + ']+', 'g');
	else
		this._splitRx = new RegExp('[' + delim + ']|[^' + delim + ']+', 'g');

	this._delimRx = new RegExp('[' + delim + ']');
	this._specialsRx = new RegExp('[' + escape + delim + ']');
})
.implement({
	_escape: '\\',
	parse: function(str)
	{
		var escape = this._escape,
			specialsRx = this._specialsRx,
			parts = [],
			matches = str.match(this._splitRx),
			i = 0,
			max = matches.length,
			lastWord = false,
			last = -1,
			part;

		parts.length = max;
		parts.toString = function()
		{
			return toString.call(this, escape, specialsRx);
		};

		for (; i < max; ++i)
		{
			part = matches[i];
			if (part.charAt(0) === this._escape)
			{
				// Escape Sequence

				if (part.length > 1)
					part = part.substr(1);

				if (lastWord === last)
					parts[last].value += part;
				else
					parts[lastWord = ++last] = new Word(part);
			}
			else
			{
				// Word or Delimiter

				if (this._delimRx.test(part))
					parts[++last] = new Delim(part);
				else if (lastWord === last)
					parts[last].value += part;
				else
					parts[lastWord = ++last] = new Word(part);
			}
		}

		parts.length = (last + 1);

		return parts;
	}
});

/// export Delimited
/// target none
	module.exports = Delimited;
/// target
