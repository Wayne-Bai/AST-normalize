define(
	function () {

		"use strict";

		if (!Array.isArray) {
			Array.isArray = function (vArg) {
				return Object.prototype.toString.call(vArg) === "[object Array]";
			};
		}

		return Array.isArray;
	}
);
