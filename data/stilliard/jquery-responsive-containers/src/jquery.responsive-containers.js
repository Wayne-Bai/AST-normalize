/*
 * jQuery Responsive Containers
 * https://github.com/stilliard/jquery-responsive-containers
 *
 */
(function ($) {
    "use strict";

    // setup some default / example settings
    var defaults = {
            feature: 'min-width',
            value: '800px',
            className: '',
            callback: null // function () { }
        },
        removeClasses = [];

    // Begin the plugin
    $.fn.responsiveContainer = function (options) {

        // we need a couple things to do anyhting of use
        if (typeof options.feature === 'undefined') {
            throw new Error('Responsive container error: No "feature" supplied, such as min-width.');
        }
        if (typeof options.value === 'undefined') {
            throw new Error('Responsive container error: No "value" supplied, such as 800px.');
        }
        if (typeof options.className === 'undefined' && typeof options.callback === 'undefined') {
            throw new Error('Responsive container error: No "className" or "callback" supplied, one or the other is needed, else theres no use.');
        }

        // extend the settings with the given options
        var settings = $.extend({}, defaults, options);

        // Loop over each of the selected items
        return this.each(function () {

            var self = $(this),
                resizeCallback = function () {

                    var matches = false,
                        width = self.width();

                    // remove the classname
                    if (settings.className !== '') {
                        self.removeClass(settings.className);
                    }

                    // detect if the max or min width condition is met
                    switch (settings.feature) {
                        case 'min-width':
                            if (settings.value.replace('px', '') < width) {
                                matches = true;
                            }
                            break;
                        case 'max-width':
                            if (settings.value.replace('px', '') > width) {
                                matches = true;
                            }
                            break;
                    }

                    // if condition met, add the class name or run the callback
                    if (matches) {
                        if (settings.className !== '') {
                            self.addClass(settings.className);
                        }
                        if (settings.callback !== null) {
                            settings.callback({
                                width: width
                            });
                        }
                    }

                };

            // Listen for resize event
            $(this).resize(resizeCallback);

            // Listen for resize event
            resizeCallback();

        });
    };

}(jQuery));