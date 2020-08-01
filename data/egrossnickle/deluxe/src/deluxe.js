/**
 * Deluxe is an off-canvas navigation plugin ideal for responsive websites.
 * @author  Eric Grossnickle
 * @license MIT
 */
;(function ($, window, document, undefined) {
    'use strict';

    var pluginName = 'deluxe',
        defaults = {
            namespace   : 'deluxe',          // base namespace, generated element's identifiers are prefixed with this
            attribute   : 'class',           // attribute to use for element identifiers ('id' or 'class')
            header      : null,              // identifier for the header element, if using a fixed header this option must be set for the header to remain fixed when invoked
            content     : null,              // identifier for content element
            contentEl   : 'div',             // type of element for content if content element is to be created
            handle      : null,              // identifier for the handle element
            handleEl    : 'span',            // type of element for handle if handle is to be created
            direction   : 'left',            // direction the content slides to reveal navigation
            breakpoint  : 1000,              // browser width (in pixels) at which the plugin is activated (a value of 0 activates immediately)
            distance    : 212,               // distance the content moves (a value of 0 will use a default distance)
            threshold   : 40,                // distance the content must move from its resting point to toggle an open or close action when released
            duration    : 300,               // the duration of the animation (in milliseconds)
            timingFunction: 'ease-out'       // the timing function to use for the animation
        },
        hasTouch = 'ontouchstart' in window;

    function Deluxe(element, options) {
        this.element = element;

        this.options = $.extend( {}, defaults, options );

        this._defaults = defaults;
        this._name = pluginName;

        // initialize animation library
        this.animate = new Animate;

        // store main nav element
        this.$nav = $(this.element);

        // change to 'y' coordinate for top/bottom directions
        if (this.options.direction == 'top' ||
            this.options.direction == 'bottom')
            this.coordinate = 'y';

        // 'right' and 'bottom' direction are a negative distance
        if (this.options.direction == 'right' ||
            this.options.direction == 'bottom')
            this.options.distance = this.options.distance / -1;

        // if a breakpoint is set, watch breakpoint to activate/deactivate
        if (this.options.breakpoint) {
            this.watch();
            $(window).on('resize.' + this.namespace, $.proxy(function() { this.watch(); }, this));
        }
        // otherwise, activate immediately
        else this.activate();
    }

    Deluxe.prototype = {
        $wrapper     : null,                 // the master wrapper
        $header      : null,                 // the header
        $nav         : null,                 // the original nav element (this.element)
        $navClone    : null,                 // the cloned nav element
        $content     : null,                 // the content element
        $handle      : null,                 // the handle element
        headerIsFixed: false,                // whether the header is fixed or not
        wrapperWasCreated: false,            // whether we created the wrapper element (if we did, we remove it on deactivation)
        contentWasCreated: false,            // whether we created the content element (if we did, we remove it on deactivation)
        handleWasCreated : false,            // whether we created the handle element (if we did, we remove it on deactivation)
        coordinate   : 'x',                  // the coordinate to use (based on the chosen direction)
        activated    : false,                // whether the plugin is activated
        active       : false,                // whether the plugin is currently active
        offset       : null,                 // how far the content has moved
        position     : 0,                    // the current position of the content
        css: {
            wrapper: {                       // required CSS for wrapper element
                overflow: 'hidden' },
            navClone: {                      // required CSS for cloned nav element
                zIndex  : 50 },
            content: {                       // required CSS for content element
                position: 'relative',
                zIndex  : 100 },

            x: {
                navClone: {
                    position: 'fixed',
                    top: 0,
                    height: '100%',
                    width: '' } // set with distance
            },
            y: {
                navClone: {
                    position: 'absolute',
                    left: 0,
                    height: '', // set with distance
                    width: '100%' }
            },

            left: {
                navClone: { left: 0 }
            },
            right: {
                navClone: { right: 0 }
            },

            top: {
                navClone: { top: 0 }
            },
            bottom: {
                navClone: { bottom: 0 }
            }
        },

        /**
         * Activates or deactivates the plugin based on the window width.
         */
        watch: function() {
            var wWidth = Util.windowDimensions('width');
            //console.log(wWidth);

            // if not activated and inside the breakpoint, activate
            if ( !this.activated && wWidth <= this.options.breakpoint )
                this.activate();
            // if activated and outside the breakpoint, deactivate
            else if ( this.activated && wWidth > this.options.breakpoint )
                this.deactivate();
        },

        /**
         * Activates the plugin.
         */
        activate: function() {
            console.log('activated');
            this.activated = true;

            // set height and width
            if (!this.options.distance)
                this.options.distance = (hasTouch) ? Util.windowDimensions('width') - 44 : 300;
            this.css.x.navClone.width = this.css.y.navClone.height = Math.abs(this.options.distance) + "px";

            // wrap content, if necessary
            if ( this.options.content && $(this.options.content).length )
                this.$content = $(this.options.content);
            else {
                this.$content = $('body > *').wrapAll('<' + this.options.contentEl + ' ' + this._formatAttribute(this.options.namespace + '-content', 'html') + '></' + this.options.contentEl + '>').parent();
                this.contentWasCreated = true;
            }

            // apply required CSS to content
            this.$content.css(this.css.content);

            // clone nav
            this.$content.after( this.$nav.clone() );
            this.$navClone = this.$content.next();
            this.$navClone
                .attr(this.options.attribute, this.options.namespace + '-nav')
                .css(this.css.navClone)
                .css(this.css[this.coordinate].navClone)
                .css(this.css[this.options.direction].navClone)
                .hide();

            // wrap the content and cloned nav
            if ( this.options.wrapper && $(this.options.wrapper).length )
                this.$wrapper = $(this.options.wrapper);
            else {
                this.$wrapper = $('body > *').wrapAll('<div ' + this._formatAttribute(this.options.namespace, 'html') + '></div>').parent();
                this.wrapperWasCreated = true;
            }

            // apply required CSS to wrapper
            this.$wrapper.css(this.css.wrapper);

            // create handle, if necessary
            if ( this.options.handle && $(this.options.handle).length )
                this.$handle = $(this._formatAttribute(this.options.handle, 'css'));
            else {
                this.$handle = this.$nav.after( '<' + this.options.handleEl + ' ' + this._formatAttribute(this.options.namespace + '-handle', 'html') + '></' + this.options.handleEl + '>' ).next();
                this.handleWasCreated = true;
            }

            // turn on handle events
            this._enableActionEvents(this.$handle);

            // store header
            if ( this.options.header && $(this.options.header).length ) {
                this.$header = $(this.options.header);
                if (this.$header.css('position') == 'fixed') this.headerIsFixed = true;
            }

            // apply directional specifics
            this.$wrapper.addClass(this.options.namespace + '-direction-' + this.options.direction);

            // hide original nav
            this.$nav.hide();

            this._fireEvent('activate');
        },

        /**
         * Deactivates the plugin.
         */
        deactivate: function() {
            console.log('deactivated');
            this.activated = false;
            this.active = false;

            if (this.contentWasCreated) this.$content.children().unwrap();
            else this.$content.removeAttr('style');
            this.$content = null;

            this.$navClone.remove();
            this.$navClone = null;

            if (this.wrapperWasCreated) this.$wrapper.children().unwrap();
            else
                this.$wrapper
                    .removeAttr('style')
                    .removeClass(this.options.namespace + '-direction-' + this.options.direction);
            this.$wrapper = null;

            if (this.handleWasCreated) this.$handle.remove();
            this.$handle = null;

            this.$nav.show();

            this._fireEvent('deactivate');
        },

        /**
         * Toggles the menu open/close.
         */
        toggle: function() {
            if (this.active) this.toggleClose();
            else this.toggleOpen();
        },

        /**
         * Closes the menu.
         */
        toggleClose: function() {
            console.log('closing');

            var statusChanged = (this.active) ? true : false;

            this.active = false;

            this._onClose();
            if (statusChanged) this._onToInactive(); // must disble content events immediately so they don't interfere with close transition

            // if it was dragged all the way closed, the transform won't fire a callback since it doesn't move
            // so the callbacks must be fired immediately
            if (this.position === 0) {
                this.$content.css(this.animate.properties.transform, 'none');
                this._onAfter();
            }
            else {
                this.animate.transition(this.$content, 'transform', this.options.duration + "ms", this.options.timingFunction, null, true);
                this.animate.transform(this.$content, 'translate', [0, 0], true,
                    $.proxy(function() {
                        this._onAfter();
                    }, this));
            }
        },

        /**
         * Opens the menu.
         */
        toggleOpen: function() {
            console.log('opening');

            var statusChanged = (this.active) ? false : true,
                x = (this.coordinate == 'x') ? this.options.distance + "px" : 0,
                y = (this.coordinate == 'y') ? this.options.distance + "px" : 0;

            this.active = true;

            this._onOpen();
            if (statusChanged) this._onToActive();

            // if it was dragged all the way open, the transform won't fire a callback since it doesn't move
            // so the callbacks must be fired immediately
            if (this.position == this.options.distance) {
                this._onAfter();
            }
            else {
                this.animate.transition(this.$content, 'transform', this.options.duration + "ms", this.options.timingFunction, null, true);
                this.animate.transform(this.$content, 'translate', [x, y], false,
                    $.proxy(function() {
                        this._onAfter();
                    }, this));
            }
        },

        /**
         * Enables touch events for the given element.
         * @param {element}
         */
        _enableActionEvents: function(elem) {
            elem.on('touchstart.' + this.options.namespace, $.proxy(this._onStart, this))
                .on('touchmove.' + this.options.namespace, $.proxy(this._onMove, this))
                .on('touchend.' + this.options.namespace, $.proxy(this._onEnd, this))
                .on('click.' + this.options.namespace, $.proxy(this._onClick, this));
        },

        /**
         * Disables touch events for the given element.
         * @param {element}
         */
        _disableActionEvents: function(elem) {
            elem.off('touchstart.' + this.options.namespace)
                .off('touchmove.' + this.options.namespace)
                .off('touchend.' + this.options.namespace)
                .off('click.' + this.options.namespace);
        },

        /**
         * Fixes the header to the top of the viewport.
         * This is considered a hack for a Webkit (and maybe
         * others) bug where the location of `position: fixed'
         * children of a parent with a `transform' applied is
         * not respected. These put it in position using
         * absolute positioning.
         */
        _fixHeader: function() {
            var top = $(window).scrollTop() - $(this.$header).parent().offset().top;
            top = (top < 0) ? 0 : top;
            this.$header.css('position', 'absolute');
            //this.animate.transform(this.$header, 'translate', [0, top + "px"]);
            this.$header.css('top', top + "px");
        },
        _unfixHeader: function() {
            this.$header.css('position', 'fixed');
            //this.$header.css(this.animate.properties.transform, 'none');
            this.$header.css('top', 0);
        },


        //-------------------------------------------------------------------------
        // Event Handlers
        //-------------------------------------------------------------------------

        /**
         * The very beginning (before anything happens).
         */
        _onBefore: function() {
            console.log('before');

            if (!this.active) {
                this.$navClone.show();

                if (this.headerIsFixed &&
                    this.coordinate == 'x') {
                    this._fixHeader();
                }
            }

            this._fireEvent('before');
        },

        /*
         * The very end (at the end of the open/close transition).
         */
        _onAfter: function() {
            console.log('after');

            if (this.active) {
                this.position = this.options.distance;
            }
            else {
                this.position = 0;
                this.$navClone.hide();

                if (this.headerIsFixed &&
                    this.coordinate == 'x') {
                    this._unfixHeader();
                }
            }

            this._fireEvent('after');
        },

        /*
         * When going from inactive to active state.
         */
        _onToActive: function() {
            console.log('enabling content events');
            this._enableActionEvents(this.$content);

            this.$wrapper.addClass(this.options.namespace + '-is-active');

            if (this.$navClone.children().first().height() < this.$navClone.height()) {
                this.$navClone
                    .data('scrolling-is-disabled', true)
                    .on('touchmove.' + this.options.namespace, $.proxy(function(e) {
                        e.preventDefault();
                    }, this));
            }

            this._fireEvent('toActive');
        },

        /*
         * When going from active to inactive state.
         */
        _onToInactive: function() {
            console.log('disabling content events');
            this._disableActionEvents(this.$content);

            this.$wrapper.removeClass(this.options.namespace + '-is-active');

            if (this.$navClone.data('scrolling-is-disabled'))
                this.$navClone.off('touchmove.' + this.options.namespace);

            this._fireEvent('toInactive');
        },

        _onOpen: function() {
            this._fireEvent('open');
        },

        _onClose: function() {
            this._fireEvent('close');
        },

        /**
         * Handler for the start event.
         * @param {object} e The event object.
         */
        _onStart: function(e) {
            e.preventDefault();
            e.stopPropagation();

            var orig = (typeof e.originalEvent == 'object') ? e.originalEvent : e,
                pos = this.$content.position();

            // helpful flag for end event
            this.touchMoved = false;

            this._onBefore();

            this.offset = {
                x: orig.changedTouches[0].pageX - pos.left,
                y: orig.changedTouches[0].pageY - pos.top
            };

            this._fireEvent('start');
        },

        /**
         * Handler for the move event.
         * @param {object} e The event object.
         */
        _onMove: function(e) {
            e.preventDefault();
            e.stopPropagation();

            var orig = (typeof e.originalEvent == 'object') ? e.originalEvent : e;

            this.position = orig.changedTouches[0]['page' + this.coordinate.toUpperCase()] - this.offset[this.coordinate];

            // constrain to bounds
            if (this.options.direction == 'left' || this.options.direction == 'top') {
                if (this.position < 0) this.position = 0;
                else if (this.position > this.options.distance) this.position = this.options.distance;
            }
            else if (this.options.direction == 'right' || this.options.direction == 'bottom') {
                if (this.position > 0) this.position = 0;
                else if (this.position < this.options.distance) this.position = this.options.distance;
            }

            // flag if moved from resting points
            if ((this.active && this.position != 0) ||
                (!this.active && this.position != this.options.distance))
               this.touchMoved = true;

            var x = (this.coordinate == 'x') ? this.position + "px" : 0,
                y = (this.coordinate == 'y') ? this.position + "px" : 0;

            this.animate.transform(this.$content, 'translate', [x, y]);

            this._fireEvent('move', e);
        },

        /**
         * Handler for the end event.
         * @param {object} e The event object.
         */
        _onEnd: function(e) {
            e.preventDefault();
            e.stopPropagation();

            // touch event inferred as 'click' if it did not move
            if (!this.touchMoved) {
                this._onClick(e, true);
            }
            // successful touch event ended
            else {
                if (this.active) {
                    if (Math.abs(this.position) < Math.abs(this.options.distance) - this.options.threshold) this.toggleClose();
                    else this.toggleOpen();
                }
                else {
                    if (Math.abs(this.position) > this.options.threshold) this.toggleOpen();
                    else this.toggleClose();
                }
            }

            this._fireEvent('end');
        },

        /**
         * Handler for the click event.
         * @param {object} e The event object.
         * @param {boolean} isPseudoClick Whether the event was event was triggered by a touch event that was determined to be a click event.
         */
        _onClick: function(e, isPseudoClick) {
            e.preventDefault();
            e.stopPropagation();

            isPseudoClick = Util.default(isPseudoClick, false);

            if (!isPseudoClick) this._onBefore();

            this.toggle();

            this._fireEvent('click', e);
        },

        /**
         * Fires a custom event.
         * @param {string} name The name of the event to fire.
         * @param {object} e An event object.
         */
        _fireEvent: function(name, e) {
            e = Util.default(e, null);

            e = $.Event(this.options.namespace + '-' + name, e);

            this.$nav.trigger(e, [this]);
        },

        /**
         * Returns a formatted attribute type.
         * @param  {string} value The value for the attribute.
         * @param  {string} style How to format the attribute+value (for HTML or CSS).
         * @return {string} The formatted attribute.
         */
        _formatAttribute: function(value, style) {
            value = Util.default(value, false);
            style = Util.default(style, false);

            var attributeIdentifier = (this.options.attribute == 'id') ? '#' : '.';

            if (value && style) {
                if (style == 'html')
                    return this.options.attribute + '="' + value + '"';
                else if (style == 'css')
                    return attributeIdentifier + value;
            }
            else return attributeIdentifier;
        },
    };

    function Animate() {
        this.support.transition      = this._propertyName('transition');
        this.support.transitionDelay = this._propertyName('transitionDelay');
        this.support.transform       = this._propertyName('transform');
        this.support.transformOrigin = this._propertyName('transformOrigin');
        this.support.transform3d     = this._checkTransform3dSupport();
        this.support.transitionEnd   = this.vendorTransitionEndEventNames[this.support.transition] || null;

        this._cssPropertyName('transition'); // adds vendor-prefixed property name to this.properties
        this._cssPropertyName('transform');
    }

    Animate.prototype = {

        vendorPrefixes: ['moz', 'webkit', 'o', 'ms'],

        vendorTransitionEndEventNames: {
            'mozTransition':    'transitionend',
            'oTransition':      'otransitionend',
            'webkitTransition': 'webkitTransitionEnd',
            'msTransition':     'MSTransitionEnd'
        },

        support: {},
        properties: {},

        transform3dFunctions: {
            'matrix':    'matrix3d',
            'rotate':    'rotate3d',
            'scale':     'scale3d',
            'translate': 'translate3d'
        },

        /**
         * Applies a CSS3 transition.
         * @param {element} elem The target element.
         * @param {string} property The property to transition (e.g. 'all', 'height', 'transform').
         * @param {string} duration The duration of the transition (e.g. '1s', '500ms').
         * @param {string} timingFunction The timing function to use (e.g. 'linear', 'ease', 'ease-in').
         * @param {string} delay The amount of time to delay the transition (e.g. '5s').
         * @param {bool} clearOnTransitionEnd Clear the property once transition ends.
         * @param {function} callback Function to execute when transition ends.
         */
        transition: function(elem, property, duration, timingFunction, delay, clearOnTransitionEnd, callback) {
            clearOnTransitionEnd = Util.default(clearOnTransitionEnd, false);
            callback = Util.default(callback, false);

            // see if property should be vendor-prefixed
            property = this._cssPropertyName(property);

            // generate value string
            var value = $.trim( [property, duration, timingFunction, delay].join(' ') );
            //console.log(this.support.transition, value);

            // when transition ends
            if (clearOnTransitionEnd || callback) {
                elem.one(this.support.transitionEnd, $.proxy(function() {
                    console.log('transition ended');
                    if (clearOnTransitionEnd) elem.css(this.properties.transition, '');
                    if (typeof(callback) == 'function') callback();
                }, this));
            }

            // apply property and value
            elem.css(this.properties.transition, value);
        },

        /**
         * Applies a CSS3 transform.
         * @param {element} elem The target element.
         * @param {string} transformFunction The transform function to use (e.g. 'translate', 'scale', 'rotate').
         * @param {array} values The values for the transform function.
         * @param {bool} clearOnTransitionEnd Clear the property once transition ends.
         * @param {function} callback Function to execute when transition ends.
         */
        transform: function(elem, transformFunction, values, clearOnTransitionEnd, callback) {
            clearOnTransitionEnd = Util.default(clearOnTransitionEnd, false);
            callback = Util.default(callback, false);

            // if 3d transforms are supported…
            if (this.support.transform3d) {
                // if timing function has a 3D counterpart
                if (transformFunction in this.transform3dFunctions) {
                    transformFunction = this.transform3dFunctions[transformFunction];

                    // if only 2 values were given (x and y, no z), push a zero on
                    if (values.length == 2) values.push(0);
                }
            }

            // generate value string
            var value = transformFunction + '(' + $.trim( values.join(',') ) + ')';
            //console.log(this.support.transform, value);

            // when transition ends
            if (clearOnTransitionEnd || callback) {
                elem.one(this.support.transitionEnd, $.proxy(function() {
                    console.log('transform ended');
                    if (clearOnTransitionEnd) elem.css(this.properties.transform, '');
                    if (typeof(callback) == 'function') callback();
                }, this));
            }

            // apply property and value
            elem.css(this.properties.transform, value);
        },

        /**
         * Tests for 3D transform support.
         * @return {bool} True if browser supports transform 3D functions.
         */
        _checkTransform3dSupport: function() {
            var div = document.createElement('div');

            div.style[this.support.transform] = '';
            div.style[this.support.transform] = 'rotateY(90deg)';

            var result = div.style[this.support.transform] !== ''; div = null;
            return result;
        },

        /**
         * Checks for vendor-specific property names.
         * @param  {string} prop The property name.
         * @return {string} The property name, possibly vendor-prefixed.
         */
        _propertyName: function(prop) {
            var prop_ = prop.charAt(0).toUpperCase() + prop.substr(1),
                div = document.createElement('div');

            if (prop in div.style) { div = null; return prop; }

            for (var i=0; i<this.vendorPrefixes.length; ++i) {
                var vendorProp = this.vendorPrefixes[i] + prop_;
                if (vendorProp in div.style) { div = null; return vendorProp; }
            }

            return false;
        },

        /**
         * Returns a CSS-style property name, vendor-prefixed if necessary.
         * @param  {string} prop The property name.
         * @return {string} The property name, possibly vendor-prefixed.
         */
        _cssPropertyName: function(prop) {
            if (this.properties[prop]) return this.properties[prop];
            else if (this.support[prop]) {
                var prop_ = '-' + Util.dasherize(this.support[prop]);
                this.properties[prop] = prop_;
                return prop_;
            }
            else {
                var prop_ = this._propertyName(prop);
                if (typeof(prop_) != 'undefined' && prop_ != prop) {
                    this.support[prop] = prop_;
                    prop_ = '-' + Util.dasherize(prop_);
                    this.properties[prop] = prop_;
                    return prop_;
                }
                else {
                    this.properties[prop] = prop;
                    return prop;
                }
            }
        }
    };

    var Util = {

        /**
         * Returns a camelCased string to lowercase with dashes before former capital letters.
         * @src    http://github.com/madrobby/zepto/blob/master/src/zepto.js
         * @param  {string} str The target string.
         * @return {string} The converted string.
         */
        dasherize: function(str) {
            if (typeof str == 'string')
                return str.replace(/::/g, '/')
                    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
                    .replace(/([a-z\d])([A-Z])/g, '$1_$2')
                    .replace(/_/g, '-')
                    .toLowerCase();
        },

        /**
         * Returns a default value for the target variable if it's undefined.
         * @param  {mixed} x The target variable.
         * @param  {mixed} val The default value.
         * @return {mixed} The default value.
         */
        default: function(x, val) {
            return typeof x !== 'undefined' ? x : val;
        },

        /**
         * Returns the window height and width or, if specified, just the height or width.
         * @param  {string} specific Use to return just the height or width.
         * @return {mixed} The window dimensions.
        */
        windowDimensions: function(specific) {
            var wHeight = (window.innerHeight) ? window.innerHeight : $(window).height(),
                wWidth = $(window).width();

            if ( typeof specific == 'string' ) {
                if (specific == 'height') return wHeight;
                else if (specific == 'width') return wWidth;
            }
            else {
                return {height: wHeight, width: wWidth};
            }
        }
    };

    $.fn[pluginName] = function (options) {
        return this.each(function () {
            var $this = $(this);
            if (!$this.data('plugin_' + pluginName)) {
                $this.data('plugin_' + pluginName,
                    new Deluxe(this, options));
            }
        });
    }

})(typeof Zepto == 'function' ? Zepto : jQuery, window, document);
