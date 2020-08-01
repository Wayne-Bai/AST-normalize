'use strict';

/**
 * Module dependencies
 */

var isValidSelectorInComponent = require('./is-valid-selector');

/**
 * Module exports
 */

module.exports = validateSelectors;

/**
 * @param {Array} rules
 * @param {String} componentName
 */

function validateSelectors(rules, componentName, strict) {
  rules.forEach(function (rule) {
    var column = rule.position.start.column;
    var line = rule.position.start.line;
    var selectors = rule.selectors;

    selectors.forEach(function (selector) {
      // selectors must start with the componentName class, or be `:root`
      if (!isValidSelectorInComponent(selector, componentName, strict)) {
        throw new Error(
          'Invalid selector "' + selector + '" near line ' + line + ':' + column + '. ' +
          'Please refer to the SUIT CSS naming conventions: github.com/suitcss/suit.'
        );
      }
    });
  });
}
