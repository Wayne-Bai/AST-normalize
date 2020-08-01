"use strict";

var trimRx = /^\s+|\s+$/g;
var ltrimRx = /^\s+/;
var rtrimRx = /\s+$/;

function trim(str)
{
	return str.replace(trimRx, '');
}

function ltrim(str)
{
	return str.replace(ltrimRx, '');
}

function rtrim(str)
{
	return str.replace(rtrimRx, '');
}

function escapeHtml(str)
{
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

/// export trim as trim
/// export ltrim as ltrim
/// export rtrim as rtrim
/// export escapeHtml as escapeHtml
/// target none
	exports.trim = trim;
	exports.ltrim = ltrim;
	exports.rtrim = rtrim;
	exports.escapeHtml = escapeHtml;
