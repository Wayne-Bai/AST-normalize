/*
 * Object.create polyfill by Mozilla
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
*/

if(typeof Object.create !== 'function') {
	Object.create = (function() {
		var Object = function() {};
		
		return function (prototype) {
			if(arguments.length > 1) {
				throw Error('Second argument not supported');
			}
			
			if(typeof prototype !== 'object') {
				throw TypeError('Argument must be an object');
			}
			
			Object.prototype = prototype;
			
			var result = new Object();
			Object.prototype = null;
			
			return result;
		};
	})();
}

var RCSS = {};