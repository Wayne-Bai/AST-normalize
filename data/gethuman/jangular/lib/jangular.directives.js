/**
 * Author: Jeff Whelpley
 * Date: 10/27/14
 *
 * This module is in charge of loading new directives. This includes the default
 * ones that are included with this library (i.e. everything under /lib/directives)
 * as well as any custom directives registered by the user.
 */
var fs          = require('fs');
var jyt         = require('jyt');
var utils       = require('./jangular.utils');
var runtime     = require('./jangular.runtime');

/**
 * Initialize the directives that we have in this lib
 */
function init() {
    var directiveNames = fs.readdirSync(__dirname + '/directives');
    var name;

    for (var i = 0; i < directiveNames.length; i++) {
        name = directiveNames[i];
        name = name.substring(0, name.length - 3);
        runtime.transforms[utils.camelCaseToDash(name)] = require('./directives/' + name);
    }
}

/**
 * Add a new custom directive to the transforms list
 * @param name The name of the directive in dash form (i.e. gh-my-directive)
 * @param cb Essentially the link function of a directive with signature fn(scope, element, attrs)
 */
function addDirective(name, cb) {
    runtime.transforms[name] = function angularizeDirective(scope, element, attrs) {
        //var startTime, endTime, totalTime;
        var updatedElement = cb(scope, element, attrs);

        // if registered fn returns an element, we use that to replace the current element
        if (updatedElement) {

            //startTime = (new Date()).getTime();
            //var counters = {};
            var angularizedElement = runtime.angularize(updatedElement, scope, false);

            //endTime = (new Date()).getTime();
            //totalTime = endTime - startTime;
            //if (totalTime > 1) {
            //    console.log('***' + totalTime + 'ms ' + name + ' angularize || ' + JSON.stringify(counters));
            //}

            angularizedElement.attributes = angularizedElement.attributes || {};
            if (scope && scope[runtime.JNG_STRIP] !== true) {
                angularizedElement.attributes[name] = null;
            }

            //TODO: all directives returning updatedElement will replace; support non-replace in future
            element.remove();
            element.text(jyt.render(angularizedElement));
        }
    };
}

// expose functions
module.exports = {
    transforms: runtime.transforms,

    init: init,
    addDirective: addDirective
};