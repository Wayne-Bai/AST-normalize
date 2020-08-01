/**
 * Author: Jeff Whelpley
 * Date: 10/27/14
 *
 *
 */
module.exports = function (scope, element, attrs, val) {
    if (!val) {
        element.remove();
    }
};
