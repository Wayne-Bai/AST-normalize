/**
 * Generate CSS Selector for an element
 *
 * Copyright (c) 2011 Ankit Ahuja
 * Dual licensed under GPL and MIT licenses.
 *
 * @requires jQuery
**/

/**
 * Generator of CSS selectors for an element
 * @constructor
 * @param {String} [level] Specificity level at which to generate CSS selector.
 * Valid values are low, high and medium. Default is medium
 */
var SelectorGenerator = function(level, excludedClasses) {
    this.specificityLevel = level ? level : 'medium';
    if (excludedClasses)
        this.excludedClasses = excludedClasses;
    else
        this.excludedClasses = [];

    var self = this;

    /**
     * Generate CSS selector for element
     * @param {Element} el Element
     * @return {String} CSS selector
     * @public
     */
     this.generate = function(el) {
        if (!el)
            return null;

        $el = $(el);

        if (self.specificityLevel === 'low')
            return inspectAtLowSpecificity($el);

        else if (self.specificityLevel === 'high')
            return inspectAtHighSpecificity($el, 0);

        else
            return inspect($el, 0);
    };

    /**
     * If element has class(es), returns them as the CSS selector. Else, looks for ID.
     * Else, traverses upto 2 levels up
     * @param {Element} el Element to inspect
     * @param {Integer} DOM Traversal Level. Root is at 0
     * @return {String} CSS Selector
     * @private
     */
    var inspect = function(el, level) {
        var elClass = el.attr('class');

        if (elClass != undefined) {
            var len = self.excludedClasses.length;
            for (var i = 0; i < len; i++)
                elClass = elClass.replace(excludedClasses[i], '');
            elClass = $.trim(elClass);

            if (elClass.length != 0) {
                var classes = elClass.split(' ');
                var len = classes.length;

                var selector = el.prop('tagName');
                selector = selector ? selector.toLowerCase() : '';

                for (var i = 0; i < len; i++)
                    selector += '.' + classes[i];

                return selector;
            }
        }

        var elId = el.attr('id');
        if (elId != undefined) {
            return '#' + elId;
        }

        var elTag = el.prop('tagName');
        elTag = elTag ? elTag.toLowerCase() : '';

        // don't go beyond 2 levels up
        if (level < 2)
            return inspect(el.parent(), level + 1) + ' ' + elTag;
        else
            return elTag;
    };

    /**
     * If element has an ID, returns #ID. Else, checks for classname and traverses upto 1 level up
     * @param {Element} el Element to inspect
     * @param {Integer} DOM Traversal Level. Root is at 0
     * @return {String} CSS Selector
     * @private
     */
    var inspectAtHighSpecificity = function(el, level) {
        var elId = el.attr('id');

        if (elId != undefined)
            return '#' + elId;

        var elClass = el.attr('class');

        if (elClass != undefined) {
            var len = self.excludedClasses.length;
            for (var i = 0; i < len; i++)
                elClass = elClass.replace(self.excludedClasses[i], '');
            elClass = $.trim(elClass);
        }
        else
            elClass = '';

        var elTag = el.prop('tagName');
        elTag = elTag ? elTag.toLowerCase : '';

        var selector;
        if (level < 1) {
            selector = inspectAtHighSpecificity(el.parent(), level + 1) + ' ' + elTag;

            if (elClass.length != 0)
                selector += '.' + elClass;
        }
        else {
            selector = elTag;

            if (elClass.length != 0)
                selector += '.' + elClass;
        }
        return selector;
    };

    /**
     * Returns element's tagName as CSS selector (Low Specificity Level)
     * @param {Element} el Element to inspect
     * @return {String} CSS Selector
     * @private
     */
    var inspectAtLowSpecificity = function(el) {
        var elTag = el.prop('tagName');
        return elTag ? elTag.toLowerCase() : '';
    };
};