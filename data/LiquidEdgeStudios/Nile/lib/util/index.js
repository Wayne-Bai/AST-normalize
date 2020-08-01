/**
 * @class Util
 * @module util
 * @constructor
 */
var Util = function() {};

/**
 *
 *
 * @method toCamelCase
 * @param {string} string
 * @return {string}
 */
Util.prototype.toCamelCase = function(string) {
    return string.replace(/(\-[a-z])/g, function($1){return $1.toUpperCase().replace('-','');});
};

/**
 * Given a string, return the string in TitleCase form.
 *
 * @method toTitleCase
 * @param {string} string
 * @return {string}
 */
Util.prototype.toTitleCase = function(string) {
    return string.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

module.exports = new Util;