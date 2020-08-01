/* ========================================================================
 * light-responsive.js v1.0.0
 * http://phatly27.github.io/light-responsive-js
 * ========================================================================
 * Copyright 2015 by Phat Ly
 * Licensed under MIT (https://github.com/phatly27/light-responsive-js/master/LICENSE)
 * ======================================================================== */

/**
 * Check the required jQuery library.
 * @param  {String} typeof jQuery        type name of jQuery object
 * @return {avoid}                       return nothing 
 */
if (typeof jQuery === 'undefined') {
  throw new Error('LightResponsive\'s JavaScript requires jQuery')
}

+function ($) {
  'use strict';

  /**
   * Create a new namespace if it hasn't existed yet.
   * @param  {Object} !window.LightResponsive check the namespace
   * @return {avoid}                          return nothing
   */
  if(!window.LightResponsive) {
    window.LightResponsive = {};
  }

  /**
   * Create a new class to handle the responsive.
   * @param {Object} options an object containing 3 properties: ele, autoRun and transition.
   */
  window.LightResponsive = function (options) {

    // FIELDS DEFINITION
    // =====================================================================
    /**
     * Define an object containing all variables.
     * @type {Object}
     */
    var variable = {};

    /**
     * Define an object containing all private functions.
     * @type {Object}
     */
    var local = {};

    /**
     * Define an instance of the class
     * @type {Object}
     */
    var pub = this;
    
    /**
     * Set up the default settings
     * @type {Object}
     */
    variable['settings'] = $.extend({ ele: $('*'), autoRun: true, transition: 'all 0.3s ease-in' }, options);

    /**
     * Define the media query attribute names by regex.
     * @type {Array}
     */
    variable['mq-attributes'] = [/^mq-min-width-(\d+)+(\w*)*-add-class$/, /^mq-min-width-(\d+)+(\w*)*-remove-class$/, /^mq-max-width-(\d+)+(\w*)*-add-class$/, /^mq-max-width-(\d+)+(\w*)*-remove-class$/, /^mq-range-width-(\d+)+(\w*)*-(\d+)+(\w*)*-add-class$/, /^mq-range-width-(\d+)+(\w*)*-(\d+)+(\w*)*-remove-class$/];

    /**
     * Define a set of all function names.
     * @type {Array}
     */
    variable['mq-func-names'] = ['should-responsive-min-width', 'should-responsive-max-width', 'should-responsive-range-width', 'responsive-add-class', 'responsive-remove-class', 'responsive-reset-add-class', 'responsive-reset-remove-class'];

    /**
     * Define the should responsive function name indexes that refer to the 'mq-func-names'.
     * @type {Array}
     */
    variable['mq-should-responsive-func-indexes'] = [0, 0, 1, 1, 2, 2];

    /**
     * Define the responsive function name indexes that refer to the 'mq-func-names'.
     * @type {Array}
     */
    variable['mq-responsive-func-indexes'] = [3, 4, 3, 4, 3, 4];

    /**
     * Define the responsive reset function name indexes that refer to the 'mq-func-names'.
     * @type {Array}
     */
    variable['mq-responsive-reset-func-indexes'] = [5, 6, 5, 6, 5, 6];

    // PRIVATE FUNCTIONS DEFINITION
    // =====================================================================
    /**
     * Init automatically when the instance is created.
     * @return {avoid} return nothing
     */
    local['init'] = function () {
      if(variable['settings'].autoRun) {
        pub['responsive']();
        $(window).resize(pub['responsive']);
      }
    };

    /**
     * Split the separate string into an array.
     * @param  {String} s a separate string
     * @return {Array}    return an splited array
     */
    local['split-by-separate-string'] = function (s) {
      var arr = [];
      if (s) {
        arr = s.split(',');
      }
      return arr;
    };

    /**
     * Transition CSS3 on the specified element.
     * @param  {Object} $ele  a jQuery element
     * @param  {String} value a string value of transition to animate
     * @return {avoid}        return nothing
     */
    local['transition'] = function ($ele, value) {
      $ele.css({
          'transition': value,
          '-ms-transition': value,
          '-o-transition': value,
          '-moz-transition': value,
          '-webkit-transition': value
        });
    };

    /**
     * Should responsive for min width.
     * @param  {Number} widthWindow width of window
     * @param  {Number} minWidth    min width px
     * @return {Boolean}            return the allowance of responsive
     */
    local['should-responsive-min-width'] = function (widthWindow, minWidth) {
      return widthWindow >= minWidth;
    };

    /**
     * Should responsive for max width.
     * @param  {Number} widthWindow width of window
     * @param  {Number} maxWidth    max width px
     * @return {Boolean}            return the allowance of responsive
     */
    local['should-responsive-max-width'] = function (widthWindow, maxWidth) {
      return widthWindow <= maxWidth;
    };    

    /**
     * Should responsive for range width.
     * @param  {Number} widthWindow width of window
     * @param  {Number} minWidth    min width px
     * @param  {Number} maxWidth    max width px
     * @return {Boolean}            return the allowance of responsive
     */
    local['should-responsive-range-width'] = function (widthWindow, minWidth, maxWidth) {
      return widthWindow >= minWidth && widthWindow <= maxWidth;
    };

    /**
     * Responsive by adding class(es) into the specified element.
     * @param  {Object} $ele  a jQuery element
     * @param  {String} value the css classes string
     * @return {avoid}        return nothing
     */
    local['responsive-add-class'] = local['responsive-reset-remove-class'] = function ($ele, value) {
      $.each(local['split-by-separate-string'](value), function (i, cssClass) {
        local['transition']($ele, variable['settings'].transition);
        $ele.addClass(cssClass);
      });
    };

    /**
     * Responsive by removing class(es) in the specified element.
     * @param  {Object} $ele  a jQuery element
     * @param  {String} value the css classes string
     * @return {avoid}        return nothing
     */
    local['responsive-reset-add-class'] = local['responsive-remove-class'] = function ($ele, value) {
      $.each(local['split-by-separate-string'](value), function (i, cssClass) {
        local['transition']($ele, variable['settings'].transition);
        $ele.removeClass(cssClass);
      });
    };

    // PUBLIC METHODS DEFINITION
    // =====================================================================
    /**
     * Responsive all defined elements.
     * @return {avoid} return nothing
     */
    pub['responsive'] = function () {

      // Go through one or many the specified elements.
      variable['settings'].ele.each(function () {

        // Get the jQuery element
        var $ele = $(this);

        // Get the current width of windows
        var widthWindow = $(window).outerWidth();

        // Go through all attributes of the element.
        // Then find the suitable media query attributes.
        $.each(this.attributes, function(i, attr) {

          // Loop the media query attributes to check
          $.each(variable['mq-attributes'], function (j, mqRegex) {

            var attrName = attr.name;

            // Test whether the attribute name is media query attribute or not
            if(new RegExp(mqRegex).test(attrName)) {

              // Parse the media query regex into value and unit
              var mq = attrName.match(mqRegex);

              if(mq) {
                var shouldResponsive = -1;
                var funcName = variable['mq-func-names'][variable['mq-should-responsive-func-indexes'][j]];
                switch(funcName) {
                  case 'should-responsive-min-width':
                  case 'should-responsive-max-width':
                    var width = mq[1];
                    shouldResponsive = local[funcName](widthWindow, width);
                    break;
                  case 'should-responsive-range-width':
                    var minWidth = mq[1];
                    var maxWidth = mq[3];
                    shouldResponsive = local[funcName](widthWindow, minWidth, maxWidth);
                    break;
                  default:
                    break;
                }
                if(shouldResponsive !== -1) {
                  if(shouldResponsive === true) {
                    local[variable['mq-func-names'][variable['mq-responsive-func-indexes'][j]]]($ele, $ele.attr(attrName));
                  } else {
                    local[variable['mq-func-names'][variable['mq-responsive-reset-func-indexes'][j]]]($ele, $ele.attr(attrName));
                  }
                }
              }

            }

          });

        });

      });
    };

    local['init']();
  };

  /**
   * Export the module to the jQuery.
   * @return {Object} return an instance of the LightResponsive class to implement chain
   */
  $.fn.responsive = function (options) {
    if(!options) {
      options = {};
    }
    options.ele = $(this) ? $(this) : $('*');
    return new window.LightResponsive(options);
  };

  /**
   * Export module to the Nodejs.
   * @example e.g: require('light-responsive-js')
   * @return {avoid} return nothing
   */
  if (typeof module !== 'undefined') {
    module.exports = $;
  }

}(jQuery);