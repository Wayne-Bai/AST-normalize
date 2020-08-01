/**
 * Author: Jeff Whelpley
 * Date: 10/27/14
 *
 * Simple module to manage filters. Filters are added here
 * and our savedFilters object keeps track of all the filters
 * in memory.
 */
var jyt = require('jyt');
var savedFilters = {};

/**
 * Simple function for adding more filters
 * @param moreFilters
 */
function addFilters(moreFilters) {
    jyt.utils.extend(savedFilters, moreFilters);
}

// expose function
module.exports = {
    savedFilters: savedFilters,
    addFilters: addFilters
};