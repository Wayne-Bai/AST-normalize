var {%= name %} = require('./{%= name %}.page').{%= name %};

/**
   {%= name %} exercises.
   @exports encore.exercise.{%= name %}
   @param {Object} [options=] - Test options. Used to build valid tests.
   @param {string} [options.cssSelector=] - Fallback selector string to initialize widget with.
   @example
   ```js
   describe('default exercises', encore.exercise.{%= name %}({
       cssSelector: '.secondary-info rx-paginate', // select one of many widgets on page
   }));
   ```
 */
exports.{%= name %} = function (options) {
    if (options === undefined) {
        options = {};
    }

    options = _.defaults(options, { /* defaults go here */ });

    return function () {
        var component;

        before(function () {
            if (options.cssSelector === undefined) {
                component = {%= name %}.main;
            } else {
                component = {%= name %}.initialize($(options.cssSelector));
            }
        });

        it('should start exercising defaults now');

    };
};
