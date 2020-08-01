Swapper._validate = function (isNode, transitions, easings) {
	return {
		'element'  : validateElement  ,
		'options'  : validateOptions  ,
		'callback' : validateCallback
	};



	function validateElement (elem) {
		if ( !isNode(elem) ) {
			throw TypeError('element must be a DOM node, got ' + elem);
		}
	}



	function validateOptions (options) {
		switch (typeof options) {
			case 'string':
				options = { transition: options };
				break;

			case 'undefined':
				options = {};
				break;

			case 'object':
				break;

			default:
				throw TypeError('options must be an object if defined, got ' + options);
		}

		switch (typeof options.transition) {
			case 'string':
				if (!(options.transition in transitions) && (options.transition !== 'instant')) {
					throw TypeError(options.transition + ' is not a valid transition');
				}
				break;

			case 'undefined':
				break;

			default:
				throw TypeError('transition must be a string if defined, got ' + options.transition);
		}

		switch (typeof options.duration) {
			case 'number':
				if (options.duration < 0) {
					throw TypeError('duration must be a non-negative integer, got ' + options.duration);
				}
				break;

			case 'undefined':
				break;

			default:
				throw TypeError('duration must be a number if defined, got ' + options.duration);
		}

		switch (typeof options.easing) {
			case 'string':
				if (!(options.easing in easings) && (options.easing.substr(0,13) !== 'cubic-bezier(')) {
					throw TypeError(options.easing + ' is not a valid easing');
				}
				break;

			case 'undefined':
				break;

			default:
				throw TypeError('easing must be a string if defined, got ' + options.easing);
		}

		return options;
	}



	function validateCallback (callback) {
		switch (typeof callback) {
			case 'undefined':
				callback = function () {};
				break;

			case 'function':
				break;

			default:
				throw TypeError('callback must be a function if defined, got ' + callback);
		}

		return callback;
	}
}(
	Swapper._isNode      , // from utils.js
	Swapper._transitions , // from transitions.js
	Swapper._easings       // from transitions.js
);
