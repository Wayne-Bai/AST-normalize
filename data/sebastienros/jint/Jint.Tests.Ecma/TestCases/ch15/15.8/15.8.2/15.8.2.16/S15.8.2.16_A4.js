// Copyright 2009 the Sputnik authors.  All rights reserved.
/**
 * If x is +Infinity, Math.sin(x) is NaN
 *
 * @path ch15/15.8/15.8.2/15.8.2.16/S15.8.2.16_A4.js
 * @description Checking if Math.sin(+Infinity) is NaN
 */

// CHECK#1
var x = +Infinity;
if (!isNaN(Math.sin(x)))
{
	$ERROR("#1: 'var x = +Infinity; isNaN(Math.sin(x)) === false'");
}

