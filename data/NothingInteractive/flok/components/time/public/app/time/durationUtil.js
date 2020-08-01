angular.module('flokTimeModule').factory('durationUtil', [function() {
    'use strict';

    /**
     * durationUtil functions
     * @copyright  Nothing Interactive 2014
     * @author     Patrick Fiaux <nodz@nothing.ch>
     * @constructor
     * @exports flokTimeModule/durationUtil
     */
    var DurationUtil = function() {
    };

    /**
     * RegExp function to parse time input string into minutes.
     * TODO: add examples of understood formats
     * @param str
     * @param group1
     * @param group2
     * @param group3
     * @param group4
     * @param group5
     * @returns {number}
     */
    var stringToMinutesRegExp = function(str, group1, group2, group3, group4, group5) {
        // backref 1 is optional + or -
        var isAddition = true;
        if (group1 !== undefined) {
            if (group1 === '+') {
                isAddition = true;
            }
            else if (group1 === '-') {
                isAddition = false;
            }
        }
        // backref 2 is first time value
        var value1 = group2 !== undefined ? group2 : undefined;
        // backref 3 is time unit (m or h) if first value is the only one
        var unit = group3 !== undefined ? group3.toLowerCase() : undefined;
        // backref 4 is the divider
        var divider = group4 !== undefined ? group4 : undefined;
        // backref 5 is the second time value
        var value2 = group5 !== undefined ? group5 : undefined;

        var hours = 0;
        var minutes = 0;
        var result = 0;
        var temp = 0;

        // Both hours and minutes have been entered:
        if (value1 && value2) {
            hours = parseInt(value1, 10);
            minutes = parseInt(value2, 10);
        }
        // If first value and divider was entered, recognize the values as hours:
        else if (value1 && divider) {
            hours = parseInt(value1, 10);
        }
        // Only the first value  has been entered:
        else if (value1 && !value2) {
            if (unit) {
                if (unit === 'h') {
                    hours = parseInt(value1, 10);
                }
                else if (unit === 'm') {
                    minutes = parseInt(value1, 10);
                }
                else {
                    minutes = parseInt(value1, 10);
                }
            }
            else {
                // Defaults to minutes if no unit was specified:
                minutes = parseInt(value1, 10);
            }
        }
        // Only the second value has been entered (after divider):
        else if (!value1 && value2) {
            minutes = parseInt(value2, 10);
        }

        // Convert hours to minutes
        if (hours > 0) {
            temp = 60 * hours;
            if (isAddition) {
                result += temp;
            }
            else {
                result -= temp;
            }
        }

        if (minutes > 0) {
            temp = minutes;
            if (isAddition) {
                result += temp;
            }
            else {
                result -= temp;
            }
        }

        return result;
    };

    /**
     * Parses a time/duration string into a minutes number.
     * @param {string}input
     * @returns {number}
     */
    DurationUtil.prototype.parseStringToMinutes = function(input) {
        var minutes = 0;
        if (input) {
            minutes = input.replace(/^([-+]?)(\d{1,6})([mh]?)([:]?)(\d{1,2})?$/m, stringToMinutesRegExp);
            if (isNaN(minutes)) {
                minutes = 0;
            }
        }
        return minutes;
    };

    return new DurationUtil();
}]);
