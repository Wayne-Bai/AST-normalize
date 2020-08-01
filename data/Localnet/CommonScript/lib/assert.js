/**
 * @author Alejandro Ojeda Gutierrez.
 * @copyright Copyright (c) 2012, Alejandro Ojeda Gutierrez.
 * @license http://www.gnu.org/licenses/gpl.html - GNU Public License.
 * @link http://www.localnet.org.es
 * @package CommonScript
 */

"use strict";

/**
 * CommonJS AssertionError object.
 * @param {Object} Error information.
 */
exports.AssertionError = function(info) {
	Object.defineProperties(this, {
		message: {
			value: info.message,
			enumerable: true
		},
		actual: {
			value: info.actual,
			enumerable: true
		},
		expected: {
			value: info.expected,
			enumerable: true
		}
	});
};
(exports.AssertionError.prototype = Object.create(Error.prototype))
	.constructor = exports.AssertionError;

/**
 * Pure assertion tests whether a value is truthy.
 * @param {Mixed} Value to assertion test.
 * @param {String} Error message to assertion fail.
 */
exports.ok = function(guard, message) {
	if(!guard)
		throw factoryError(message, false, true);
};

/**
 * Equality assertion tests a shallow equality relation.
 * @param {Mixed} Actual value to assertion test.
 * @param {Mixed} Expected value to assertion test.
 * @param {String} Error message to assertion fail.
 */
exports.equal = function(actual, expected, message) {
	if(actual != expected)
		throw factoryError(message, actual, expected);
};

/**
 * Non equivalence assertion tests a shallow inequality relation.
 * @param {Mixed} Actual value to assertion test.
 * @param {Mixed} Expected value to assertion test.
 * @param {String} Error message to assertion fail.
 */
exports.notEqual = function(actual, expected, message) {
	if(actual == expected)
		throw factoryError(message, actual, expected);
};

/**
 * Equivalence assertion tests a deep equality relation.
 * @param {Mixed} Actual value to assertion test.
 * @param {Mixed} Expected value to assertion test.
 * @param {String} Error message to assertion fail.
 */
exports.deepEqual = function(actual, expected, message) {
	if(!isDeepEqual(actual, expected))
		throw factoryError(message, actual, expected);
};

/**
 * Non equivalence assertion tests a deep inequality relation.
 * @param {Mixed} Actual value to assertion test.
 * @param {Mixed} Expected value to assertion test.
 * @param {String} Error message to assertion fail.
 */
exports.notDeepEqual = function(actual, expected, message) {
	if(isDeepEqual(actual, expected))
		throw factoryError(message, actual, expected);
};

/**
 * Strict equality assertion tests a strict equality relation.
 * @param {Mixed} Actual value to assertion test.
 * @param {Mixed} Expected value to assertion test.
 * @param {String} Error message to assertion fail.
 */
exports.strictEqual = function(actual, expected, message) {
	if(actual !== expected)
		throw factoryError(message, actual, expected);
};

/**
 * Strict non equality assertion tests a strict inequality relation.
 * @param {Mixed} Actual value to assertion test.
 * @param {Mixed} Expected value to assertion test.
 * @param {String} Error message to assertion fail.
 */
exports.notStrictEqual = function(actual, expected, message) {
	if(actual === expected)
		throw factoryError(message, actual, expected);
};

/**
 * Expected to throw an error.
 * @param {Function} Block expecting fail.
 * @param {Error} Expected error type.
 * @param {String} Error message to assertion fail.
 */
exports.error = function(block, error, message) {
	var exception;

	try {
		block.call(null);
	} catch(e) {
		exception = e;
		if(error && !(exception instanceof error))
			throw exception;
	}

	if(!exception)
		throw factoryError(message, exception, error);
};

/**
 * Factory for AssertionError.
 * @param {String} Error message.
 * @param {Mixed} Actual value.
 * @param {Mixed} Expected value.
 * @returns {AssertionError} New object.
 */
function factoryError(message, actual, expected) {
	return new exports.AssertionError({
			message: message,
			actual: actual,
			expected: expected
		});
}

/**
 * Tests a deep equality relation.
 * @param {Mixed} Actual value.
 * @param {Mixed} Expected value.
 * @returns {Boolean} Test result.
 */
function isDeepEqual(actual, expected) {
	var key = {}, result = (actual === expected);

	if(!result)
		if(typeof actual == "object" && typeof expected == "object") {
			if(actual instanceof Date && expected instanceof Date) {
				result = (actual.getTime() == expected.getTime());
			} else if(actual.prototype == expected.prototype) {
				key.actual = Object.keys(actual).sort();
				key.expected = Object.keys(expected).sort();
				result = (key.actual.length == key.expected.length);
				for(var i = 0, l = key.actual.length; i < l && result; i++)
					if(key.actual[i] == key.expected[i])
						result = isDeepEqual(
								actual[key.actual[i]],
								expected[key.expected[i]]
							);
			}
		} else if(typeof actual != "object" && typeof expected != "object") {
			result = (actual == expected);
		}

	return result;
}
