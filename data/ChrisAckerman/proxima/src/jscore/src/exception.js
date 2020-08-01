"use strict";

var Class; /// require class.js
/// target none
	Class = require('./class.js');
/// target

var Exception = Class(Error).extend(function Exception(message)
{
	Exception.parent.call(this);
	if (Exception.parent.captureStackTrace)
		Exception.parent.captureStackTrace(this, Exception);

	this.message = message;
});

/// export Exception
/// target none
	module.exports = Exception;
/// target
