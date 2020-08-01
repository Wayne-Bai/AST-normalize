/**
 * Simple JavaScript Inheritance. Inspired by base2 and Prototype
 *
 * @link http://ejohn.org/blog/simple-javascript-inheritance
 * @author John Resig (http://ejohn.org/)
 * @license MIT
 */
(function() {
    var initializing = false,
        fnTest       = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
    // The base Class implementation (does nothing)
    this.Class = function() {};

    // Create a new Class that inherits from this class
    Class.extend = function(prop) {
        var _super = this.prototype;

        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        initializing  = true;
        var prototype = new this();
        initializing  = false;

        // Copy the properties over onto the new prototype
        for (var name in prop) {
            // Check if we're overwriting an existing function
            prototype[name] = typeof prop[name] == "function" && typeof _super[name] == "function" && fnTest.test(prop[name])
                            ? (function(name, fn) {
                                return function() {
                                    var tmp = this._super;

                                    // Add a new ._super() method that is the same method
                                    // but on the super-class
                                    this._super = _super[name];

                                    // The method only need to be bound temporarily, so we
                                    // remove it when we're done executing
                                    var ret = fn.apply(this, arguments);
                                    this._super = tmp;

                                    return ret;
                                };
                            })(name, prop[name])
                            : prop[name];
        }

        // The dummy class constructor
        function Class() {
            // All construction is actually done in the init method
            if (!initializing && this.init) {
                this.init.apply(this, arguments);
            }
        }

        // Populate our constructed prototype object
        Class.prototype = prototype;

        // Enforce the constructor to be what we expect
        Class.prototype.constructor = Class;

        // And make this class extendable
        Class.extend = arguments.callee;

        return Class;
    };
})();
/**
 * -----
 * CooSlider, a responsive slider powered by jQuery
 *
 * @author Nguyen Huu Phuoc (thenextcms@gmail.com / @thenextcms)
 * @license MIT
 * -----
 */

// Namespace
window.Coo = {
    VERSION: '1.0.5'    // The current version of Coo Slider
};

// --- Slider ---

(function($) {
    Coo.Slider = Class.extend({
        /**
         * The constructor
         *
         * @param {HTMLElement} element The root slider element
         * @param {Array} options The options
         */
        init: function(element, options) {
            // The default options
            this._defaultOptions = {
                selector: '*',                  // {String} The CSS selector to retrieve all slide items
                                                // By default, it will get all children of the slider node
                                                // User interface options
                classPrefix: 'coo-slider-',     // {String} The prefix that will be appended at the top to CSS class of
                                                // prev, next, pager, and slide items
                pagination: true,               // {Boolean} Show the pagination or not
                controls: true,                 // {Boolean} Show the prev/next controls or not
                width: null,                    // {Number} The width of slider
                height: null,                   // {Number} The height of slider

                // Play options
                randomize: false,               // {Boolean} Show the slide randomly
                autoplay: true,                 // {Boolean} Setting it to TRUE will start the slider automatically
                interval: 4000,                 // {Number} The number of milliseconds to show each slide
                startAt: 0,                     // {Number|String} The index of starting slide
                                                // Set to:
                                                // - 'first' to run the first slide
                                                // - 'last' to run the last slide
                                                // - 'random' to run random slide
                pauseOnHover: true,             // {Boolean} Pause the slider when hovering on current slide item.
                                                // Resume when user moving the mouse out of the slide

                // Control options
                touch: true,                    // {Boolean} Support touch devices
                keyboard: true,                 // {Boolean} Use the shortcut keys (<-/->) to go to the previous/next slide
                mousewheel: false,              // {Boolean} Use mouse wheel to navigate the slider
                                                // Requires {@link https://github.com/brandonaaron/jquery-mousewheel} library

                // Responsive options
                responsive: true,               // {Boolean} Support responsive or not
                minWidth: 480,                  // {Number} The text elements will be hidden if the width of slide is smaller than this value

                // Effect options
                effect: 'auto',                 // {String} The effect name.
                                                // Set to:
                                                // - 'random' if you want the effect method is chosen randomly
                                                // - 'auto' to get the effect from the data-effect attribute
                                                // - 'none' to disable
                sameRandomEffectForText: false, // {Boolean} Set it to TRUE if you want to all the text elements use the same random effect as the first one
                animationSpeed: 500,            // {Number} The animation duration in ms
                delay: 400,                     // {Number} The delay time (in ms) between two effects in the same slide
                columns: 10,                    // {Number} The number of columns
                rows: 5,                        // {Number} The number of rows
                circles: 10                     // {Number} The number of circles
            };

            this.$element          = $(element);                                        // The jQuery object represents the root slider element
            this._options          = $.extend({}, this._defaultOptions, options);       // The slide options
            this.$items            = this.$element.children(this._options.selector);    // The array of slide items
            this._numItems         = this.$items.length;                                // The total number of items

            this.$pagination       = null;                                              // Represents the pager
            this.$prevButton       = null;                                              // The Previous button
            this.$nextButton       = null;                                              // The Next button

            this._currentItemIndex = null;                                              // The index of current slide
            this._isPlaying        = false;                                             // Flag to indicate the slider is running
            this._timer            = null;                                              // The timer that shows the slide if it is set for running automatically
            this.width             = options.width;
            this.height            = options.height;

            // Support touch device
            // this._isTouchDevice    = 'ontouchstart' in window || window.DocumentTouch && document instanceof DocumentTouch;
            this._isTouchDevice    = 'ontouchstart' in document.documentElement;
            this._mouseStartX      = null;
            this._deltaX           = null;
            this._isMouseDown      = false;     // Is mouse down/touched?

            // The effect instance
            this._effectInstance   = null;

            this._init();
        },

        /**
         * Initializes the slider
         */
        _init: function() {
            var that = this;
            this.$element.addClass(this._options.classPrefix + 'slide');

            // Retrieve all items
            if (this._options.randomize) {
                this.$items.sort(function() {
                    return Math.round(Math.random()) - 0.5;
                });
                this.$element.empty().append(this.$items);
            }
            this.$items.addClass(this._options.classPrefix + 'item');

            // Wrap all items in an inner node
            this.$element.wrapInner($('<div/>').addClass(this._options.classPrefix + 'inner').addClass(this._options.classPrefix + 'loading'));

            // Wait for all images loaded
            var $images      = this.$element.find('img'),
                imagesLoaded = 0;
            $images.each(function() {
                var img = new Image();
                // This is safe way to get the size of image
                img.onload = function() {
                    imagesLoaded++;
                    that.width  = that.width  || this.width;
                    that.height = that.height || this.height;
                    if (imagesLoaded >= $images.length) {
                        that._completeLoading();
                    }
                }
                img.src = $(this).attr('src');
            });

            // Called when the animation completes
            this.$element.off('animationCompleted.CooSlider').on('animationCompleted.CooSlider', function() {
                that._isPlaying = false;
                // Re-create the timer
                that._createPlayTimer();
            });
        },

        /**
         * Called when all images are loaded. At that time, the width of height are already determined
         */
        _completeLoading: function() {
            var that = this;
            this.$element.height(this.height * this.$element.width() / this.width);
            this._ratio = $(document).width() / this.$element.width();

            // Create the effect instance
            switch (true) {
                case ('random' == this._options.effect):
                    this.$items.each(function() {
                        var effect = Coo.Effect.randomize(this);
                        $(this).attr('data-effect', effect.getName());
                    });
                    this._effectInstance = new Coo.Effect.Markup('random');
                    break;

                case ('auto' == this._options.effect):
                    this._effectInstance = new Coo.Effect.Markup('auto');
                    break;

                case (Coo.Effect.isAvailable(this._options.effect)):
                    this.$items.attr('data-effect', this._options.effect);
                    this._effectInstance = new Coo.Effect.Markup('auto');
                    break;

                case ('none' == this._options.effect):
                default:
                    this._effectInstance = new Coo.Effect.Default('none');
                    break;
            }
            this._effectInstance.setSlider(this);

            // Remove the loading
            this.$element.find('.' + this._options.classPrefix + 'inner').removeClass(this._options.classPrefix + 'loading');

            // Create the pagination
            if (this._options.pagination) {
                this.$pagination = $('<ol/>').addClass(this._options.classPrefix + 'pagination').hide().appendTo(this.$element);
                this.$items.each(function(index) {
                    var $li = $('<li/>').appendTo(that.$pagination);
                    if (index == that._currentItemIndex) {
                        $li.addClass(that._options.classPrefix + 'active');
                    }
                    $('<a/>').attr('href', 'javascript: void(0)').html(index).data('index', index).on('click', function() {
                        that._isPlaying = false;    // Force to go to the selected slide
                        that.show($(this).data('index'));
                    }).appendTo($li);
                });
            }

            // Create the prev and next buttons
            if (this._options.controls) {
                this.$prevButton = $('<a/>').attr('href', 'javascript: void(0)').addClass(this._options.classPrefix + 'control ' + this._options.classPrefix + 'prev').hide().on('click', function() {
                    that.prev();
                }).appendTo(this.$element);

                this.$nextButton = $('<a/>').attr('href', 'javascript: void(0)').addClass(this._options.classPrefix + 'control ' + this._options.classPrefix + 'next').hide().on('click', function() {
                    that.next();
                }).appendTo(this.$element);
            }

            // Create the timer only when all items are loaded completely
            this._createPlayTimer();

            // Allow to use the keyboard
            if (this._options.keyboard) {
                $(document).on('keyup', function(e) {
                    switch (e.keyCode) {
                        case 37:    // left arrow key (<-)
                            that.prev();
                            // Prevent the page scrolling horizontally
                            return false;
                            break;
                        case 39:    // right arrow key (->)
                        case 32:    // Space bar
                            that.next();
                            return false;
                            break;
                        default:
                            break;
                    }
                });
            }

            // Support touch device
            if (this._options.touch && this._isTouchDevice) {
                this.$element.on({
                    'touchstart': function(e) {
                        var pageX = (e.originalEvent.touches[0] || e.originalEvent.changedTouches[0]).pageX;
                        if (that._isMouseDown == false) {
                            that._isMouseDown = true;
                            that._mouseStartX = pageX;
                        }

                        // Show the pager and nav buttons
                        that._showButtons(true);
                        that._showPagination(true);
                    },
                    'touchmove': function(e) {
                        var pageX = (e.originalEvent.touches[0] || e.originalEvent.changedTouches[0]).pageX;
                        if (that._isMouseDown) {
                            // Calculate the distance moved by user's finger
                            that._deltaX = pageX - that._mouseStartX;
                            that.pause();
                        }
                        return false;
                    },
                    'touchend': function(e) {
                        that._isMouseDown = false;
                        // var width = that.$element.width() || that.width;
                        // if (Math.abs(that._deltaX) >= (width / 2 - width * 0.25)) {
                        if (Math.abs(that._deltaX) >= 20) {
                            if (that._deltaX < 0) {
                                // User move/drop the slider to the right
                                that.next();
                            } else {
                                // User move/drop the slider to the left
                                that.prev();
                            }
                        }
                        that._deltaX = 0;

                        // Hide the pager and nav buttons
                        that._showButtons(false);
                        that._showPagination(false);
                        return false;
                    }
                });
            }

            // Use mouse wheel
            if (this._options.mousewheel) {
                this.$element.on('mousewheel', function(e, delta, deltaX, deltaY) {
                    // I shouldn't go to the prev/next slide because in most case this handler is called many times
                    // when mousewheel is fired quickly
                    if (that._isPlaying) {
                        return false;
                    }
                    clearInterval(that._timer);
                    if (delta < 0) {
                        that.next();
                    } else {
                        that.prev();
                    }
                    return false;
                });
            }

            // Show the nav buttons and pager when hover the mouse on the slider element
            this.$element.hover(function() {
                that._showButtons(true);
                that._showPagination(true);
                if (that._options.pauseOnHover) {
                    that.pause();
                }
            }, function() {
                that._showButtons(false);
                that._showPagination(false);
                if (that._options.pauseOnHover && that._options.interval > 0) {
                    that._createPlayTimer();
                }
            });

            // Support responsive
            if (this._options.responsive) {
                $(window).on('load resize', function(e) {
                    that._onResize(e);
                });
            }

            if (that._options.autoplay) {
                that.start();
            }
        },

        /**
         * Shows/Hides prev/next buttons
         *
         * @param {Boolean} showing TRUE if you want to show buttons
         */
        _showButtons: function(showing) {
            if (this._options.controls) {
                if (showing == false) {
                    this.$prevButton.fadeOut();
                    this.$nextButton.fadeOut();
                } else if (showing && (!this._options.responsive || this.$element.width() > this._options.minWidth)) {
                    this.$prevButton.fadeIn();
                    this.$nextButton.fadeIn();
                }
            }
        },

        /**
         * Shows/Hides pagination
         *
         * @param {Boolean} showing TRUE if you want to show pagination
         */
        _showPagination: function(showing) {
            if (this._options.pagination) {
                showing ? this.$pagination.fadeIn() : this.$pagination.fadeOut();
            }
        },

        /**
         * Creates the timer that show the next slide after given delay time
         */
        _createPlayTimer: function() {
            var that = this;
            if (this._options.interval > 0 && this._numItems > 1) {
                this._timer = setInterval(function() {
                    that.next();
                }, this._options.interval);
            }
        },

        /**
         * Called when resizing the browser.
         * To support responsive design, this method:
         * - Resize the slide items with the same ratio
         * - Hide the text elements when the width of element is smaller than predefined one
         * - Wrap video element into another one
         *
         * @param {Event} e
         */
        _onResize: function(e) {
            var that          = this,
                currentWidth  = this.$element.width(),
                currentHeight = that.height * currentWidth / that.width;

            this.$element.height(currentHeight);
            this.$items.each(function() {
                $(this).height(currentHeight);

                // Hide the text element if the current width is smaller than minWidth
                $(this).children().each(function() {
                    if (!$(this).is('img') && ($(this).find('img').length == 0) && currentWidth < that._options.minWidth) {
                        $(this).hide();
                    } else {
                        $(this).show();
                    }
                });
            });

            // Hide the prev/next buttons when the width of slider is smaller than minWidth
            if (currentWidth < this._options.minWidth) {
                this._showButtons(false);
            }

            // Place the position of prev/next buttons at the middle
            if (this._options.controls) {
                var top = (currentHeight - $(this.$prevButton).height()) / 2;
                this.$prevButton.css('top', top);
                this.$nextButton.css('top', top);
            }

            // Support video elements
            // Inspired from https://github.com/davatron5000/FitVids.js
            var videoSelectors = [
                "iframe[src*='player.vimeo.com']",
                "iframe[src*='www.youtube.com']",
                "iframe[src*='www.dailymotion.com']",
                "iframe[src*='blip.tv']",
                "object",
                "embed"
            ];
            this.$element.find(videoSelectors.join(',')).each(function() {
                // Check if it is contained in wrapper element
                if ('embed' == this.tagName.toLowerCase() && $(this).parent('object').length || $(this).parent('.' + that._options.classPrefix + 'video-wrapper').length) {
                    return;
                }

                var height = ('object' === this.tagName.toLowerCase() || ($(this).attr('height') && !isNaN(parseInt($(this).attr('height'), 10))))
                            ? parseInt($(this).attr('height'), 10)
                            : $(this).height(),
                    width  = !isNaN(parseInt($(this).attr('width'), 10))
                            ? parseInt($(this).attr('width'), 10)
                            : $(this).width();

                var $wrapper = $('<div/>').addClass(that._options.classPrefix + 'video-wrapper').css('padding-top', ((height / width) * 100) + "%");
                $(this).wrap($wrapper).removeAttr('height').removeAttr('width');
            });
        },

        // --- APIs ---

        /**
         * Shows the previous slide
         */
        prev: function() {
            var index = (this._currentItemIndex == 0) ? (this._numItems - 1) : (this._currentItemIndex - 1);
            this._isPlaying = false;    // Force to go to the previous slide, no matter what the current effect completes or not
            this.show(index);
        },

        /**
         * Shows the next slide
         */
        next: function() {
            var index = (this._currentItemIndex == this._numItems - 1) ? 0 : (this._currentItemIndex + 1);
            this._isPlaying = false;
            this.show(index);
        },

        /**
         * Starts playing the slider at predefined position
         */
        start: function() {
            var that    = this,
                startAt = this._options.startAt;
            switch (startAt) {
                case 0:
                case 'first':
                    startAt = 0;
                    break;
                case 'last':
                    startAt = this._numItems - 1;
                    break;
                case 'random':
                    startAt = Math.floor(Math.random() * this._numItems);
                    break;
                default:
                    break;
            }
            this.show(startAt);
        },

        /**
         * Pauses the slider
         */
        pause: function() {
            clearInterval(this._timer);
            this._timer     = null;
            this._isPlaying = false;
            return this;
        },

        /**
         * Shows slide item at given index, starting from 0
         *
         * @param {Number} index The slide index
         */
        show: function(index) {
            if (this._isPlaying) {
                return;
            }
            this._isPlaying = true;
            clearInterval(this._timer);
            this._timer = null;

            if (this._currentItemIndex == null) {
                // Run the first time
                this._currentItemIndex = index;
                this.$items.eq(index).addClass(this._options.classPrefix + 'active').show();
                this.$element.trigger('animationCompleted.CooSlider');
            } else {
                var currSlide = this.$items.eq(this._currentItemIndex).removeClass(this._options.classPrefix + 'active'),
                    nextSlide = this.$items.eq(index).addClass(this._options.classPrefix + 'active');

                // Play the animation
                this._effectInstance.setCurrentItem(currSlide)
                                    .setNextItem(nextSlide)
                                    .setTarget(nextSlide)
                                    .play();

                this._currentItemIndex = index;
            }

            // Active the pager
            if (this._options.pagination) {
                this.$pagination.find('li').removeClass(this._options.classPrefix + 'active').eq(index).addClass(this._options.classPrefix + 'active');
            }
        },

        /**
         * Gets the option
         *
         * @param {String} name The option's name
         * @return {String|Object}
         */
        getOption: function(name) {
            return name ? this._options[name] : this._options;
        },

        /**
         * Gets the index of current slide
         *
         * @return {Number}
         */
        getCurrentIndex: function() {
            return this._currentItemIndex || 0;
        },

        /**
         * Gets the effect instance
         *
         * @return {Coo.Effect._Base}
         */
        getEffect: function() {
            return this._effectInstance;
        }
    });

    // Plugin definition
    $.fn.cooslider = function(options) {
        return this.each(function() {
            new Coo.Slider(this, options);
        });
    };
})(window.jQuery);
(function($) {
    Coo.Browser = {
        /**
         * Checks the current browser is IE or not
         * jQuery 1.9 remove jQuery.browser
         * @return {Number} returns undefined if the current browser is not IE, otherwise returns the version of IE
         * @see http://james.padolsey.com/javascript/detect-ie-in-js-using-conditional-comments
         */
        ie: function() {
            var undef,
                v   = 3,
                div = document.createElement('div'),
                all = div.getElementsByTagName('i');
            while (
                div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
                    all[0]
                );
            return v > 4 ? v : undef;
        }
    };
})(window.jQuery);
(function($) {
    Coo.Effect = {
        /**
         * Built-in effects. Maps the name with the class
         */
        _effects: {
            // Since 1.0.0
            bounce:             'Coo.Effect.Css3Animate',
            bounceIn:           'Coo.Effect.Css3Animate',
            bounceInDown:       'Coo.Effect.Css3Animate',
            bounceInLeft:       'Coo.Effect.Css3Animate',
            bounceInRight:      'Coo.Effect.Css3Animate',
            bounceInUp:         'Coo.Effect.Css3Animate',
            fadeIn:             'Coo.Effect.Css3Animate',
            fadeInDown:         'Coo.Effect.Css3Animate',
            fadeInDownBig:      'Coo.Effect.Css3Animate',
            fadeInLeft:         'Coo.Effect.Css3Animate',
            fadeInLeftBig:      'Coo.Effect.Css3Animate',
            fadeInRight:        'Coo.Effect.Css3Animate',
            fadeInRightBig:     'Coo.Effect.Css3Animate',
            fadeInUp:           'Coo.Effect.Css3Animate',
            fadeInUpBig:        'Coo.Effect.Css3Animate',
            flash:              'Coo.Effect.Css3Animate',
            flip:               'Coo.Effect.Css3Animate',
            flipInX:            'Coo.Effect.Css3Animate',
            flipInY:            'Coo.Effect.Css3Animate',
            lightSpeedIn:       'Coo.Effect.Css3Animate',
            pulse:              'Coo.Effect.Css3Animate',
            rollIn:             'Coo.Effect.Css3Animate',
            rotateIn:           'Coo.Effect.Css3Animate',
            rotateInDownLeft:   'Coo.Effect.Css3Animate',
            rotateInDownRight:  'Coo.Effect.Css3Animate',
            rotateInUpLeft:     'Coo.Effect.Css3Animate',
            rotateInUpRight:    'Coo.Effect.Css3Animate',
            shake:              'Coo.Effect.Css3Animate',
            swing:              'Coo.Effect.Css3Animate',
            tada:               'Coo.Effect.Css3Animate',
            wiggle:             'Coo.Effect.Css3Animate',
            wobble:             'Coo.Effect.Css3Animate',

            // Since 1.0.1
            blind:              'Coo.Effect.Blind',
            boxRain:            'Coo.Effect.BoxRain',
            boxRainReverse:     'Coo.Effect.BoxRain',
            boxRainGrow:        'Coo.Effect.BoxRain',
            boxRainGrowReverse: 'Coo.Effect.BoxRain',
            boxRandom:          'Coo.Effect.BoxRandom',
            circleFadeIn:       'Coo.Effect.CircleFadeIn',
            circleFadeOut:      'Coo.Effect.CircleFadeOut',
            slideLeft:          'Coo.Effect.Slide',
            slideRight:         'Coo.Effect.Slide',

            // Since 1.0.2
            barDown:            'Coo.Effect.BarUpDown',
            barDownReverse:     'Coo.Effect.BarUpDown',
            barUp:              'Coo.Effect.BarUpDown',
            barUpDown:          'Coo.Effect.BarUpDown',
            barUpDownSymmetry:  'Coo.Effect.BarUpDownSymmetry',
            blindHorizontal:    'Coo.Effect.BlindHorizontal',
            boxInOut:           'Coo.Effect.BoxInOut',
            boxSpiral:          'Coo.Effect.BoxSpiral',
            boxSpiralReverse:   'Coo.Effect.BoxSpiral',
            boxTopBottom:       'Coo.Effect.BoxTopBottom',
            cut:                'Coo.Effect.Cut',
            slab:               'Coo.Effect.Slab',
            slideDown:          'Coo.Effect.Slide',
            slideUp:            'Coo.Effect.Slide',
            swap:               'Coo.Effect.Swap',

            // Since 1.0.3
            barDownSymmetry:    'Coo.Effect.BarDownSymmetry',
            boxFadeIn:          'Coo.Effect.BoxFadeIn',
            glass:              'Coo.Effect.Glass',
            glassReverse:       'Coo.Effect.Glass'
        },

        /**
         * Gets a random effect
         *
         * @param {HTMLElement} target The target that the effect plays on
         * @return {Coo.Effect._Base}
         */
        randomize: function(target) {
            var instance = null,
                effects  = Coo.Effect.getEffects(),
                random   = null;
            while (instance == null && effects.length > 0) {
                // Reset
                if ($(target).data('effectInstance')) {
                    $(target).data('effectInstance').reset();
                }

                random   = effects[Math.floor(Math.random() * effects.length)];
                instance = Coo.Effect.factory(random, target);
                instance.setTarget(target);
                if (instance.support()) {
                    return instance;
                } else {
                    instance = null;
                    effects.splice(effects.indexOf(random), 1);
                }
            }
            return new Coo.Effect.Default('none');
        },

        /**
         * Get the effects name
         *
         * @return {Array}
         */
        getEffects: function() {
            var names = [];
            for (var i in Coo.Effect._effects) {
                names.push(i);
            }
            return names;
        },

        /**
         * Checks if an effect is available or not
         *
         * @param {String} effect The effect name
         * @return {Boolean}
         */
        isAvailable: function(effect) {
            return effect && Coo.Effect._effects[effect] != undefined;
        },

        /**
         * Gets an effect instance by on given name
         *
         * @param {String} effect The effect name
         * @param {HTMLElement} target The target that the effect is played on. It is required when generating a random
         * effect and I need to check the target supports the effect
         * @return {Coo.Effect._Base}
         */
        factory: function(effect, target) {
            switch (true) {
                case ('auto' == effect):
                    return new Coo.Effect.Markup();

                case ('none' == effect):
                    return new Coo.Effect.Default('none');

                case ('random' == effect):
                    return Coo.Effect.randomize(target);

                case (!Coo.Effect.isAvailable(effect)):
                    return new Coo.Effect._Base();

                default:
                    var clazz = Coo.Effect._effects[effect].split('.');
                    if (clazz.length == 1) {
                        return new window[clazz]();
                    } else {
                        var obj = window;
                        for (var i = 0; i < clazz.length; i++) {
                            obj = obj[clazz[i]];
                        }
                        return new obj(effect);
                    }
            }
        }
    };
})(window.jQuery);
(function($) {
    /**
     * Base effect class
     */
    Coo.Effect._Base = Class.extend({
        _effect: null,          // {String} The effect name
        _slider: null,          // {Coo.Slider} The slider instance
        _currentItem: null,     // {HTMLElement} The current slide item
        _nextItem: null,        // {HTMLElement} The next slide item
        _target: null,          // {HTMLElement} The target of animation
        _done: 0,               // {Number} The number of clone elements which complete the animation
        _timers: [],            // {Array} Array of timers which are generated by animation

        _callbacks: {
            onCompleted: null
        },

        init: function(effect) {
            this._effect = effect;
        },

        setSlider: function(slider) {
            this._slider = slider;
            return this;
        },

        setCurrentItem: function(item) {
            this._currentItem = item;
            return this;
        },

        setNextItem: function(item) {
            this._nextItem = item;
            if (this._target == null) {
                this._target = item;
            }
            return this;
        },

        setTarget: function(element) {
            this._target = element;
            $(this._target).data('effectInstance', this);
            return this;
        },

        setCallbacks: function(callbacks) {
            this._callbacks = $.extend(this._callbacks, callbacks);
            return this;
        },

        getName: function() {
            return this._effect;
        },

        /**
         * Plays the transition
         */
        play: function() {
            this._setup();
            this._animate();
        },

        /**
         * Cleans the effect after the effect animation completes. The timeouts should be removed here
         */
        clean: function() {
            // Overridden by the sub-class
        },

        /**
         * Does the things that the animation need. Creating dynamic elements should be done here
         */
        _setup: function() {
            // Overridden by the sub-class
        },

        /**
         * Does the animation
         */
        _animate: function() {
            // Overridden by the sub-class
        },

        /**
         * Should be called when all animations complete
         */
        _complete: function() {
            this.clean();
            // Remove the timers
            for (var i in this._timers) {
                clearTimeout(this._timers[i]);
            }
            this._timers = [];

            $(this._currentItem).hide();
            $(this._target).show();

            if (this._callbacks['onCompleted']) {
                this._callbacks['onCompleted'].call(this);
            } else {
                this._slider.$element.trigger('animationCompleted.CooSlider', this);
            }
        },

        /**
         * Adds timer
         *
         * @param {Function} timer
         */
        _addTimer: function(timer) {
            this._timers.push(timer);
        },

        /**
         * Shows the current item.
         * If I show the current item using $(this._currentItem).show(), maybe
         * the child element will show its animation (CSS3 animation, for example).
         * So, I have to reset all animations in current element first.
         *
         * @param {String} selector The selector to define the child elements going to be shown
         */
        _showCurrentItem: function(selector) {
            $(this._currentItem).find('[data-effect]').addBack().each(function() {
                var effect = $(this).data('effectInstance');
                if (effect instanceof Coo.Effect._Base) {
                    effect.reset();
                }
            });
            if (null == selector) {
                $(this._currentItem).show();
            } else {
                $(this._currentItem).children().hide().end()
                    .find(selector).addBack().show();
            }
        },

        /**
         * Resets the effect
         */
        reset: function() {
            // Overridden by the sub-class
        },

        /**
         * Reset all effects created by the slider on all elements.
         * Currently, it is used for the demo when user switch to other effect
         */
        resetAll: function() {
            this._slider.$element.find('[data-effect]').each(function() {
                var effect = $(this).data('effectInstance');
                if (effect instanceof Coo.Effect._Base) {
                    effect.reset();
                }
            });
        },

        /**
         * Gets the class of effect. Useful for debugging
         *
         * @return {String}
         */
        getClass: function() {
            // Overridden by the sub-class
            return 'Coo.Effect._Base';
        },

        /**
         * Gets features that indicate that the effect uses CSS3 or normal Js
         *
         * @return {Array}
         */
        getFeatures: function() {
            // Overridden by the sub-class
            return [];
        },

        /**
         * Checks if it is possible to play the animation or not
         *
         * @return {Boolean}
         */
        support: function() {
            return (this._supportByBrowser() && this._supportByTarget());
        },

        /**
         * Checks if the current browser supports the effect or not
         *
         * @return {Boolean}
         */
        _supportByBrowser: function() {
            // Overridden by the sub-class
            return true;
        },

        /**
         * Checks if the current target supports the effect or not
         *
         * @return {Boolean}
         */
        _supportByTarget: function() {
            // Overridden by the sub-class
            // Most effects requires the target element has to contain at least one image
            if (this._target) {
                return !!($(this._target).find('img').length > 0);
            }
            return true;
        }
    });
})(window.jQuery);
(function($) {
    /**
     * Base class for effects creating circles
     */
    Coo.Effect._Circle = Coo.Effect._Base.extend({
        _numCircles: 10,        // {Number} The number of circles
        _minDiameter: null,

        _createCircles: function(element) {
            this._slider.$element.find('.' + this._slider.getOption('classPrefix') + 'clone').remove();

            this._numCircles = this._slider.getOption('circles') || 10;
            if (Math.round(this._slider.$element.width()) % 2 == 0) {
                this._numCircles--;
            }
            this._minDiameter = this._slider.$element.width() / this._numCircles;

            var $img   = $(element).is('img') ? $(element) : $(element).find('img:first'),
                zIndex = 100;
            for (var i = 0; i < this._numCircles; i++) {
                var width = (i + 1) * this._minDiameter;
                // Use backgroundSize property to set the size of background image
                $('<div/>').css({
                    backgroundImage: 'url(' + $img.attr('src') + ')',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: this._slider.$element.width() + 'px ' + this._slider.$element.height() + 'px',
                    height: width + 'px',
                    width: width + 'px',
                    opacity: 0,
                    overflow: 'hidden',
                    position: 'absolute',
                    left: (this._slider.$element.width() / 2) - (width / 2),
                    top: (this._slider.$element.height() / 2) - (width / 2),
                    zIndex: zIndex--
                }).addClass(this._slider.getOption('classPrefix') + 'circle').addClass(this._slider.getOption('classPrefix') + 'clone').attr('data-circle', i).appendTo(this._slider.$element);
            }
        },

        clean: function() {
            this._slider.$element.find('.' + this._slider.getOption('classPrefix') + 'clone').remove();
        },

        getFeatures: function() {
            return ['css3'];
        },

        getClass: function() {
            return 'Coo.Effect._Circle';
        },

        _supportByBrowser: function() {
            // backgroundSize is not supported in IE8 and earlier
            var ie = Coo.Browser.ie();
            return (ie == undefined || ie >= 9);
        }
    });
})(window.jQuery);
(function($) {
    /**
     * Base class for effects that will split the slide into boxes
     */
    Coo.Effect._Grid = Coo.Effect._Base.extend({
        _numBoxes: 0,       // {Number} The number of boxes
        _numRows: 1,        // {Number} The number of rows
        _numColumns: 1,     // {Number} The number of columns

        _createBoxes: function(rows, columns, element) {
            element = element || this._nextItem;
            this._numRows    = rows;
            this._numColumns = columns;
            var boxWidth     = Math.round(this._slider.$element.width() / columns),
                boxHeight    = Math.round(this._slider.$element.height() / rows),
                $img         = $(element).is('img') ? $(element) : $(element).find('img:first');

            this._numBoxes   = rows * columns;

            for (var r = 0; r < rows; r++) {
                for (var c = 0; c < columns; c++) {
                    var $box = $('<div/>').attr('data-row', r).attr('data-column', c).addClass(this._slider.getOption('classPrefix') + 'box').addClass(this._slider.getOption('classPrefix') + 'clone').css({
                        display: 'block',
                        height: ((r == rows - 1) ? (this._slider.$element.height() - (boxHeight * r)) : boxHeight) + 'px',
                        width: ((c == columns - 1) ? (this._slider.$element.width() - (boxWidth * c)) : boxWidth) + 'px',
                        opacity: 0,
                        overflow: 'hidden',
                        position: 'absolute',
                        left: (boxWidth * c) + 'px',
                        top: (boxHeight * r) + 'px',
                        zIndex: 1000
                    }).appendTo(this._slider.$element);

                    $('<img/>').attr('src', $img.attr('src')).css({
                        display: 'block',
                        height: 'auto',
                        width: this._slider.$element.width() + 'px',
                        position: 'absolute',
                        left: '-' + (boxWidth * c) +'px',
                        top: '-' + (boxHeight * r) +'px'
                    }).appendTo($box);
                }
            }
        },

        _setup: function() {
            var numRows    = this._slider.getOption('rows')    || 5,
                numColumns = this._slider.getOption('columns') || 10;
            this._slider.$element.find('.' + this._slider.getOption('classPrefix') + 'clone').remove();
            this._createBoxes(numRows, numColumns);
        },

        /**
         * Checks if all the animations are done. It might be called by sub-classes
         */
        _checkComplete: function() {
            this._done++;
            if (this._done == this._numBoxes - 1) {
                this._complete();
            }
        },

        clean: function() {
            this._slider.$element.find('.' + this._slider.getOption('classPrefix') + 'clone').remove();
        },

        getClass: function() {
            return 'Coo.Effect._Grid';
        },

        getFeatures: function() {
            return ['js'];
        }
    });
})(window.jQuery);
(function($) {
    /**
     * Base class for slice effects
     */
    Coo.Effect._Slice = Coo.Effect._Grid.extend({
        _setup: function() {
            this._slider.$element.find('.' + this._slider.getOption('classPrefix') + 'clone').remove();
            // Always create 1-row boxes
            this._createBoxes(1, this._slider.getOption('columns') || 10);
        },

        getClass: function() {
            return 'Coo.Effect._Slice';
        }
    });
})(window.jQuery);
(function($) {
    /**
     * barDownSymmetry effect
     *
     * @since 1.0.3
     */
    Coo.Effect.BarDownSymmetry = Coo.Effect._Slice.extend({
        _animate: function() {
            var that    = this,
                t       = 0,
                speed   = this._slider.getOption('animationSpeed'),
                $slices = this._slider.$element.find('.' + this._slider.getOption('classPrefix') + 'box'),
                middle  = Math.floor(this._numBoxes / 2),
                total   = (this._numBoxes % 2 == 0) ? (this._numBoxes - 1) : this._numBoxes;

            this._showCurrentItem();
            $slices.css('top', -this._slider.$element.height());
            for (var index = middle - 1; index >= 0; index--) {
                (function(i) {
                    that._addTimer(setTimeout(function() {
                        $slices.eq(i).animate({ top: 0, opacity: 1 }, speed, function() {
                            that._checkComplete();
                        });
                        $slices.eq(total - i).animate({ top: 0, opacity: 1 }, speed, function() {
                            that._checkComplete();
                        });
                    }, t * 1.5));
                    t += speed / that._numBoxes;
                })(index);
            }
        },

        getClass: function() {
            return 'Coo.Effect.BarDownSymmetry';
        }
    });
})(window.jQuery);
(function($) {
    /**
     * barDown, barDownReverse, barUp, barUpDown effects
     *
     * @since 1.0.2
     */
    Coo.Effect.BarUpDown = Coo.Effect._Grid.extend({
        _setup: function() {
            this._slider.$element.find('.' + this._slider.getOption('classPrefix') + 'clone').remove();
            // Always create 1-row boxes
            this._createBoxes(1, this._slider.getOption('columns') || 10, ('barDownReverse' == this._effect) ? this._currentItem : this._nextItem);
        },

        _animate: function() {
            var that      = this,
                t         = 0,
                speed     = this._slider.getOption('animationSpeed'),
                height    = this._slider.$element.height(),
                $slices   = this._slider.$element.find('.' + this._slider.getOption('classPrefix') + 'box'),
                beforeTop = 0,
                afterTop  = 0;

            switch (this._effect) {
                case 'barDownReverse':
                    // Clone next image
                    var $img = $(this._nextItem).is('img') ? $(this._nextItem) : $(this._nextItem).find('img');
                    $('<img/>').attr('src', $img.attr('src')).addClass(this._slider.getOption('classPrefix') + 'clone').css({
                        height: '100%',
                        width: '100%',
                        opacity: 1,
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        zIndex: 0
                    }).appendTo(this._slider.$element);
                    $slices.css('opacity', 1);
                    beforeTop = 0;
                    afterTop  = -height;
                    break;

                case 'barUp':
                    beforeTop = height;
                    afterTop  = 0;
                    this._showCurrentItem();
                    break;

                case 'barUpDown':
                    this._showCurrentItem();
                    break;

                case 'barDown':
                default:
                    this._showCurrentItem();
                    beforeTop = -height;
                    afterTop  = 0;
                    break;
            }

            $slices.each(function(index) {
                $(this).css('top', ('barUpDown' == that._effect) ? (index % 2 == 0 ? height : -height) : beforeTop);
            }).each(function(index, node) {
                    that._addTimer(setTimeout(function() {
                        $(node).animate({ top: afterTop, opacity: 1 }, speed, function() {
                            if (index == that._numBoxes - 1) {
                                that._complete();
                            }
                        });
                    }, t * 1.5));
                    t += speed / that._numBoxes;
                });
        },

        getClass: function() {
            return 'Coo.Effect.BarUpDown';
        }
    });
})(window.jQuery);
(function($) {
    /**
     * barUpDownSymmetry effect
     *
     * @since 1.0.2
     */
    Coo.Effect.BarUpDownSymmetry = Coo.Effect._Slice.extend({
        _animate: function() {
            var that    = this,
                t       = 0,
                speed   = this._slider.getOption('animationSpeed'),
                height  = this._slider.$element.height(),
                $slices = this._slider.$element.find('.' + this._slider.getOption('classPrefix') + 'box');

            this._showCurrentItem();
            $slices.each(function(index) {
                $(this).css('top', index % 2 == 0 ? height : -height);
            }).each(function(index) {
                    that._addTimer(setTimeout(function() {
                        $slices.eq(index).animate({ top: 0, opacity: 1 }, speed, function() {
                            that._checkComplete();
                        });
                        $slices.eq(that._numBoxes - index - 1).animate({ top: 0, opacity: 1 }, speed, function() {
                            that._checkComplete();
                        });
                    }, t * 1.5));
                    t += speed / that._numBoxes;
                });
        },

        getClass: function() {
            return 'Coo.Effect.BarUpDownSymmetry';
        }
    });
})(window.jQuery);
(function($) {
    /**
     * blind effect
     *
     * @since 1.0.1
     */
    Coo.Effect.Blind = Coo.Effect._Slice.extend({
        _animate: function() {
            this._showCurrentItem();
            var that    = this,
                t       = 0,
                speed   = this._slider.getOption('animationSpeed'),
                $slices = this._slider.$element.find('.' + this._slider.getOption('classPrefix') + 'box');
            $slices.each(function(index) {
                var $slice = $(this),
                    w      = $(this).width();
                $slice.css({ top: '0px', width: '0px' });
                that._addTimer(setTimeout(function() {
                    $slice.animate({ opacity: '1.0', width: w }, speed, function() {
                        if (index == that._numBoxes - 1) {
                            that._complete();
                        }
                    });
                }, t));
                t += speed / this._numBoxes;
            });
        },

        getClass: function() {
            return 'Coo.Effect.Blind';
        }
    });
})(window.jQuery);
(function($) {
    /**
     * blindHorizontal effect
     *
     * @since 1.0.2
     */
    Coo.Effect.BlindHorizontal = Coo.Effect._Grid.extend({
        _setup: function() {
            this._slider.$element.find('.' + this._slider.getOption('classPrefix') + 'clone').remove();
            // Always create 1-column boxes
            this._createBoxes(this._slider.getOption('rows') || 5, 1);
        },

        _animate: function() {
            this._showCurrentItem();
            var that      = this,
                t         = 0,
                boxHeight = this._slider.$element.height() / this._numBoxes,
                speed     = this._slider.getOption('animationSpeed'),
                $slices   = this._slider.$element.find('.' + this._slider.getOption('classPrefix') + 'box');

            $slices.each(function(index) {
                var $slice = $(this);
                $slice.css({ top: index * boxHeight, height: '0px' });
                that._addTimer(setTimeout(function() {
                    $slice.animate({
                        opacity: '1.0',
                        height: (index < that._numBoxes - 1) ? boxHeight : (that._slider.$element.height() - boxHeight * index)
                    }, speed, function() {
                        if (index == that._numBoxes - 1) {
                            that._complete();
                        }
                    });
                }, t));
                t += speed / that._numBoxes;
            });
        },

        getClass: function() {
            return 'Coo.Effect.BlindHorizontal';
        }
    });
})(window.jQuery);
(function($) {
    /**
     * boxFadeIn effect
     *
     * @since 1.0.3
     */
    Coo.Effect.BoxFadeIn = Coo.Effect._Base.extend({
        _numBoxes: 10,        // {Number} The number of boxes
        _minDiameter: null,

        _setup: function() {
            this._slider.$element.find('.' + this._slider.getOption('classPrefix') + 'clone').remove();

            this._numBoxes = this._slider.getOption('circles') || 10;
            if (Math.round(this._slider.$element.width()) % 2 == 0) {
                this._numBoxes--;
            }
            this._minDiameter = this._slider.$element.width() / this._numBoxes;

            var $img   = $(this._nextItem).is('img') ? $(this._nextItem) : $(this._nextItem).find('img:first'),
                zIndex = 100;
            for (var i = 0; i < this._numBoxes; i++) {
                var width = (i + 1) * this._minDiameter;
                // I can use the background image approach
                /*
                 $('<div/>').css({
                 backgroundImage: 'url(' + $img.attr('src') + ')',
                 backgroundPosition: 'center',
                 backgroundRepeat: 'no-repeat',
                 height: width + 'px',
                 width: width + 'px',
                 opacity: 0,
                 overflow: 'hidden',
                 position: 'absolute',
                 left: (this._slider.$element.width() / 2) - (width / 2),
                 top: (this._slider.$element.height() / 2) - (width / 2),
                 zIndex: zIndex--
                 }).addClass(this._slider.getOption('classPrefix') + 'box').addClass(this._slider.getOption('classPrefix') + 'clone').attr('data-box', i).appendTo(this._slider.$element);
                 */
                var $box = $('<div/>').attr('data-box', i).addClass(this._slider.getOption('classPrefix') + 'box').addClass(this._slider.getOption('classPrefix') + 'clone').css({
                    display: 'block',
                    height: width + 'px',
                    width: width + 'px',
                    opacity: 0,
                    overflow: 'hidden',
                    position: 'absolute',
                    left: (this._slider.$element.width() / 2) - (width / 2),
                    top: (this._slider.$element.height() / 2) - (width / 2),
                    zIndex: zIndex--
                }).appendTo(this._slider.$element);

                $('<img/>').attr('src', $img.attr('src')).css({
                    display: 'block',
                    height: 'auto',
                    width: this._slider.$element.width() + 'px',
                    position: 'absolute',
                    left: -(this._slider.$element.width() / 2) + (width / 2),
                    top: -(this._slider.$element.height() / 2) + (width / 2)
                }).appendTo($box);
            }
        },

        _animate: function() {
            var that   = this,
                t      = 0,
                speed  = this._slider.getOption('animationSpeed'),
                $boxes = this._slider.$element.find('.' + this._slider.getOption('classPrefix') + 'box');
            this._showCurrentItem();
            $boxes.each(function() {
                var $box = $(this);
                that._addTimer(setTimeout(function() {
                    $box.animate({ opacity: 1 }, speed, function() {
                        that._done++;
                        if (that._done == that._numBoxes) {
                            that._complete();
                        }
                    });
                }, t));
                t += speed / that._numBoxes;
            });
        },

        clean: function() {
            this._slider.$element.find('.' + this._slider.getOption('classPrefix') + 'clone').remove();
        },

        getClass: function() {
            return 'Coo.Effect.BoxFade';
        },

        getFeatures: function() {
            return ['js'];
        }
    });
})(window.jQuery);
(function($) {
    /**
     * boxInOut effect.
     * Shows the boxes from inside to outside
     *
     * @since 1.0.2
     */
    Coo.Effect.BoxInOut = Coo.Effect._Grid.extend({
        _animate: function() {
            this._showCurrentItem();
            var that      = this,
                t         = 0,
                speed     = this._slider.getOption('animationSpeed'),
                $boxes    = this._slider.$element.find('.' + this._slider.getOption('classPrefix') + 'box'),
                boxWidth  = Math.round(this._slider.$element.width() / this._numColumns),
                boxHeight = Math.round(this._slider.$element.height() / this._numRows);
            $boxes.css({
                // Place boxes at the center
                left: (this._slider.$element.width() - boxWidth) / 2,
                top: (this._slider.$element.height() - boxHeight) / 2
            }).each(function(index) {
                    $(this).animate({
                        left: boxWidth * $(this).attr('data-column'),
                        top: boxHeight * $(this).attr('data-row'),
                        opacity: 1
                    }, speed, function() {
                        if (index == that._numBoxes - 1) {
                            that._complete();
                        }
                    });
                });
        },

        getClass: function() {
            return 'Coo.Effect.BoxInOut';
        }
    });
})(window.jQuery);
(function($) {
    /**
     * boxRain, boxRainGrowReverse, boxRainReverse effects
     *
     * @since 1.0.1
     */
    Coo.Effect.BoxRain = Coo.Effect._Grid.extend({
        _animate: function() {
            var that     = this,
                t        = 0,
                speed    = this._slider.getOption('animationSpeed') / 1.3,
                $boxes   = this._slider.$element.find('.' + this._slider.getOption('classPrefix') + 'box'),
                row      = 0,
                column   = 0,
                i        = 0,
                boxes2D  = [];   // Store the boxes in two dimensions array

            boxes2D[row] = [];
            if(['boxRainReverse', 'boxRainGrowReverse'].indexOf(this._effect) != -1) {
                $boxes = $($boxes.get().reverse());
            }
            $boxes.each(function() {
                boxes2D[row][column] = $(this);
                column++;
                if (column == that._slider.getOption('columns')) {
                    row++;
                    column = 0;
                    boxes2D[row] = [];
                }
            });

            this._showCurrentItem();

            for (column = 0; column < this._slider.getOption('columns') * 2; column++) {
                var prevCol = column;
                for (row = 0; row < this._slider.getOption('rows'); row++) {
                    if (prevCol >= 0 && prevCol < this._slider.getOption('columns')) {
                        (function(row, col, t, i) {
                            var $box = $(boxes2D[row][col]),
                                w    = $box.width(),
                                h    = $box.height();
                            if (['boxRainGrow', 'boxRainGrowReverse'].indexOf(that._effect) != -1) {
                                $box.width(0).height(0);
                            }
                            that._addTimer(setTimeout(function() {
                                $box.animate({
                                    opacity: '1',
                                    width: w,
                                    height: h
                                }, speed, function() {
                                    if (i === that._numBoxes - 1) {
                                        that._complete();
                                    }
                                });
                            }, t + 100));
                        })(row, prevCol, t, i);
                        i++;
                    }
                    prevCol--;
                }
                t += 100;
            }
        },

        getClass: function() {
            return 'Coo.Effect.BoxRain';
        }
    });
})(window.jQuery);
(function($) {
    /**
     * boxRandom effect
     *
     * @since 1.0.1
     */
    Coo.Effect.BoxRandom = Coo.Effect._Grid.extend({
        _animate: function() {
            this._showCurrentItem();
            var that   = this,
                t      = 0,
                speed  = this._slider.getOption('animationSpeed'),
                $boxes = this._slider.$element.find('.' + this._slider.getOption('classPrefix') + 'box');

            $boxes = this._shuffleArray($boxes);
            $boxes.each(function(index) {
                var $box = $(this);
                that._addTimer(setTimeout(function() {
                    $box.animate({ opacity: '1' }, speed, function() {
                        if (index == that._numBoxes - 1) {
                            that._complete();
                        }
                    });
                }, t + 100));
                t += 20;
            });
        },

        /**
         * Shuffles an array using Fisher-Yates algorithm
         *
         * @see http://en.wikipedia.org/wiki/Fisher-Yates_shuffle#The_modern_algorithm
         * @param {Array} array The given array
         * @return {Array}
         */
        _shuffleArray: function(array) {
            var n = array.length;
            for (var i = n - 1; i > 0; i--) {
                var j    = Math.floor(Math.random() * (i + 1));
                var temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            }
            return array;
        },

        getClass: function() {
            return 'Coo.Effect.BoxRandom';
        }
    });
})(window.jQuery);
(function($) {
    /**
     * boxSpiral effect
     *
     * @since 1.0.2
     */
    Coo.Effect.BoxSpiral = Coo.Effect._Grid.extend({
        _animate: function() {
            // Store the indeces
            var indeces = [],
                index   = 0;
            for (var r = 0; r < this._numRows; r++) {
                var a = [];
                for (var c = 0; c < this._numColumns; c++) {
                    a.push(index);
                    index++;
                }
                indeces.push(a);
            }
            indeces = this._spiralify(indeces);
            if ('boxSpiralReverse' == this._effect) {
                // Reverse the indeces
                indeces = indeces.reverse();
            }

            this._showCurrentItem();
            var that      = this,
                t         = 0,
                speed     = this._slider.getOption('animationSpeed'),
                $boxes    = this._slider.$element.find('.' + this._slider.getOption('classPrefix') + 'box');
            $boxes.each(function(index) {
                var $box = $(this);
                that._addTimer(setTimeout(function() {
                    $boxes.eq(indeces[index]).animate({ opacity: 1 }, speed * 0.3, function() {
                        if (index == that._numBoxes - 1) {
                            that._complete();
                        }
                    });
                }, t * 2));
                t += speed / that._numBoxes;
            });
        },

        /**
         * Gets an array in spiral order from given two-dimensions array
         *
         * @see http://codereview.stackexchange.com/questions/8207/rearrange-elements-in-two-dimensional-array-spiral-order
         * @param {Array} matrix The given array
         * @return {Array}
         */
        _spiralify: function(matrix) {
            if (matrix.length == 1) {
                return matrix[0];
            }

            var firstRow   = matrix[0],
                numRows    = matrix.length,
                nextMatrix = [],
                newRow,
                row,
                column     = matrix[1].length - 1;

            // Take each column starting with the last and working backwards
            for (column; column >= 0; column--) {
                // An array to store the rotated row we'll make from this column
                newRow = [];

                // Take each row starting with 1 (the second)
                for (row = 1; row < numRows; row++) {
                    // ...and add the item at colIdx to newRow
                    newRow.push(matrix[row][column]);
                }
                nextMatrix.push(newRow);
            }

            // Pass nextMatrix to spiralify and join the result to firstRow
            firstRow.push.apply(firstRow, this._spiralify(nextMatrix));

            return firstRow;
        },

        getClass: function() {
            return 'Coo.Effect.BoxSpiral';
        }
    });
})(window.jQuery);
(function($) {
    /**
     * boxTopBottom effect: Showing the boxes from top to bottom
     *
     * @since 1.0.2
     */
    Coo.Effect.BoxTopBottom = Coo.Effect._Grid.extend({
        _animate: function() {
            this._showCurrentItem();
            var that      = this,
                speed     = this._slider.getOption('animationSpeed'),
                t         = speed / this._numBoxes,
                $boxes    = this._slider.$element.find('.' + this._slider.getOption('classPrefix') + 'box'),
                boxWidth  = Math.round(this._slider.$element.width() / this._numColumns),
                boxHeight = Math.round(this._slider.$element.height() / this._numRows);
            $boxes.each(function() {
                // Backup the dimensions
                $(this).data('width', $(this).width()).data('height', $(this).height());
            }).css({
                // Place boxes at the center
                left: (this._slider.$element.width() - boxWidth) / 2,
                top: (this._slider.$element.height() - boxHeight) / 2,
                // Reset the dimensions
                height: 0,
                width: 0
            }).each(function(index) {
                var $box = $(this);
                that._addTimer(setTimeout(function() {
                    $box.animate({
                        left: boxWidth * $box.attr('data-column'),
                        top: boxHeight * $box.attr('data-row'),
                        opacity: 1,
                        height: $box.data('height'),
                        width: $box.data('width')
                    }, speed, function() {
                        if (index == that._numBoxes - 1) {
                            that._complete();
                        }
                    });
                }, t * 2));
                t += speed / that._numBoxes;
            });
        },

        getClass: function() {
            return 'Coo.Effect.BoxTopBottom';
        }
    });
})(window.jQuery);
(function($) {
    /**
     * circleFadeIn effect
     *
     * @since 1.0.1
     */
    Coo.Effect.CircleFadeIn = Coo.Effect._Circle.extend({
        _setup: function() {
            this._createCircles(this._nextItem);
        },

        _animate: function() {
            var that        = this,
                radiusArray = [],
                t           = 0,
                speed       = this._slider.getOption('animationSpeed'),
                $circles    = this._slider.$element.find('.' + this._slider.getOption('classPrefix') + 'circle');
            $circles.each(function(index) {
                radiusArray.push((index + 1) * that._minDiameter);
            });
            radiusArray[radiusArray.length - 1] = 0;
            this._showCurrentItem();

            $circles.each(function(index) {
                var $circle = $(this);
                that._addTimer(setTimeout(function() {
                    $circle.css('border-radius', radiusArray[index]).animate({ opacity: 1, zIndex: 0 }, speed, function() {
                        that._done++;
                        if (that._done == that._numCircles) {
                            that._complete();
                        }
                    });
                }, t + 10));
                t += 50;
            });
        },

        getClass: function() {
            return 'Coo.Effect.CircleFadeIn';
        }
    });
})(window.jQuery);
(function($) {
    /**
     * circleFadeOut effect
     *
     * @since 1.0.1
     */
    Coo.Effect.CircleFadeOut = Coo.Effect._Circle.extend({
        _setup: function() {
            this._createCircles(this._currentItem);
        },

        _animate: function() {
            // Clone next image
            var $img = $(this._nextItem).is('img') ? $(this._nextItem) : $(this._nextItem).find('img');
            $('<img/>').attr('src', $img.attr('src')).addClass(this._slider.getOption('classPrefix') + 'clone').css({
                height: '100%',
                width: '100%',
                opacity: 1,
                position: 'absolute',
                left: 0,
                top: 0,
                zIndex: 0
            }).appendTo(this._slider.$element);

            var that     = this,
                $circles = this._slider.$element.find('.' + this._slider.getOption('classPrefix') + 'circle');
            $circles.css({ opacity: 1, zIndex: 2 }).each(function(index) {
                $(this).css('border-radius', (index == that._minDiameter - 1) ? 0 : that._minDiameter * (index + 1));
            });

            this._hideCircle(1);
        },

        _hideCircle: function(i) {
            var that     = this,
                index    = this._numCircles - i,
                speed    = this._slider.getOption('animationSpeed'),
                $circles = this._slider.$element.find('.' + this._slider.getOption('classPrefix') + 'circle'),
                opacity  = (1 - (index + 1) / this._numCircles).toFixed(2);

            $circles.eq(index).animate({ opacity: opacity }, 50, function() {
                if (i < that._numCircles - 1) {
                    that._hideCircle(i + 1);
                } else {
                    $circles.animate({ opacity: 1, zIndex: 0 }, speed);
                    that._complete();
                }
            });
        },

        getClass: function() {
            return 'Coo.Effect.CircleFadeOut';
        }
    });
})(window.jQuery);
(function($) {
    /**
     * CSS3 animation powered by https://github.com/daneden/animate.css
     *
     * @since 1.0.0
     */
    Coo.Effect.Css3Animate = Coo.Effect._Base.extend({
        _animate: function() {
            this.reset();
            $(this._target).data('effect', this._effect).addClass('animated ' + this._effect).show();
            this._complete();
        },

        reset: function() {
            var effect = $(this._target).data('effect');
            if (effect) {
                $(this._target).removeClass('animated ' + effect);
            }
        },

        getClass: function() {
            return 'Coo.Effect.Css3Animate';
        },

        getFeatures: function() {
            return ['css3'];
        },

        _supportByBrowser: function() {
            // See http://caniuse.com/css-animation
            // CSS3 animation is not supported on IE7/8/9
            var ie = Coo.Browser.ie();
            return (ie == undefined || ie > 9);
        },

        _supportByTarget: function() {
            return true;
        }
    });
})(window.jQuery);
(function($) {
    /**
     * cut effect
     *
     * @since 1.0.2
     */
    Coo.Effect.Cut = Coo.Effect._Grid.extend({
        _setup: function() {
            this._slider.$element.find('.' + this._slider.getOption('classPrefix') + 'clone').remove();
            this._createBoxes(2, 1, this._currentItem);
            this._createBoxes(2, 1, this._nextItem);
        },

        _animate: function() {
            var that   = this,
                width  = this._slider.$element.width(),
                $boxes = this._slider.$element.find('.' + this._slider.getOption('classPrefix') + 'box'),
                speed  = that._slider.getOption('animationSpeed');

            $boxes.eq(0).animate({ left: -width, opacity: 1 }, speed);
            $boxes.eq(1).animate({ left: width, opacity: 1 }, speed);
            $boxes.eq(2).css('left', width + 'px').animate({ left: 0, opacity: 1 }, speed);
            $boxes.eq(3).css('left', -width + 'px').animate({ left: 0, opacity: 1 }, speed, function() {
                that._complete();
            });
        },

        getClass: function() {
            return 'Coo.Effect.Cut';
        }
    });
})(window.jQuery);
(function($) {
    /**
     * The instance of this class is used when the effect is not found.
     * It just hides the current slide and display the next slide
     */
    Coo.Effect.Default = Coo.Effect._Base.extend({
        play: function() {
            var that = this;
            $(this._currentItem).hide();
            if (this._slider.getOption('mousewheel') == false) {
                $(this._nextItem).show();
                this._complete();
            } else {
                // The mouse wheel is fired very quick. I have to wait for a long-enough time to set sliding to false
                $(this._nextItem).stop(true).fadeIn('slow', function() {
                    $(this).stop(true, true).animate({ opacity: 1, marginLeft: '0px' }, that._slider.getOption('animationSpeed'), function() {
                        that._complete();
                    });
                });
            }
        },

        getClass: function() {
            return 'Coo.Effect.Default';
        }
    });
})(window.jQuery);
(function($) {
    /**
     * glass effect
     *
     * @since 1.0.3
     */
    Coo.Effect.Glass = Coo.Effect._Grid.extend({
        _setup: function() {
            this._slider.$element.find('.' + this._slider.getOption('classPrefix') + 'clone').remove();
            this._createBoxes(2, this._slider.getOption('columns') || 10);
        },

        _animate: function() {
            var that   = this,
                t      = 0,
                speed  = this._slider.getOption('animationSpeed'),
                height = this._slider.$element.height(),
                $boxes = this._slider.$element.find('.' + this._slider.getOption('classPrefix') + 'box'),
                half   = this._numBoxes / 2,
                start  = ('glass' == this._effect) ? 0 : (half - 1),
                step   = ('glass' == this._effect) ? 1 : -1;

            this._showCurrentItem();
            $boxes.each(function(index) {
                $(this).css('top', index < half ? (-height / 2) : height);
            });

            for (var index = start; index != half - start + step - 1; index = index + step) {
                (function(i) {
                    that._addTimer(setTimeout(function() {
                        $boxes.eq(i).animate({ top: 0, opacity: 1 }, speed, function() {
                            that._checkComplete();
                        });
                        $boxes.eq(half + i).animate({ top: height / 2, opacity: 1 }, speed, function() {
                            that._checkComplete();
                        });
                    }, t * 1.5));
                    t += speed / that._numBoxes;
                })(index);
            }
        },

        getClass: function() {
            return 'Coo.Effect.Glass';
        }
    });
})(window.jQuery);
(function($) {
    /**
     * Use the effect defined in the markup (data-effect attribute)
     */
    Coo.Effect.Markup = Coo.Effect.Default.extend({
        _effects: [],   // {Array} Array of effects created by children elements

        play: function() {
            var that      = this,
                $items    = $(this._nextItem).find('*').addBack().filter('[data-effect]');
            this._effects = [];
            this._done    = 0;

            if ($items.length == 0) {
                // If there are not any elements, just hide the current element and show the next one
                // as Coo.Effect.Default.play() does
                this._super.call(this);
            } else {
                var sameRandomForText = this._slider.getOption('sameRandomEffectForText'),
                    randomEffect      = null;
                $items.each(function() {
                    var effectName = $(this).attr('data-effect');
                    if (sameRandomForText && 'random' == effectName
                        && !$(this).is('img') && ($(this).find('img').length == 0))     // To ensure the element does not contain any image
                    {
                        if (randomEffect == null) {
                            randomEffect = Coo.Effect.factory('random', $(this)).getName();
                        }
                        effectName = randomEffect;
                    }
                    $(this).hide();
                    that._effects.push(Coo.Effect.factory(effectName, $(this))
                        .setSlider(that._slider)
                        .setCurrentItem(that._currentItem)
                        .setNextItem(that._nextItem)
                        .setTarget(this));
                });

                var numEffects = this._effects.length,
                    delay      = this._slider.getOption('delay');
                for (var i = 0; i < numEffects; i++) {
                    that._effects[i].setCallbacks({
                        onCompleted: function() {
                            that._done++;
                            if (that._done <= that._effects.length - 1) {
                                that._slider.$element.stop(true, true).delay(delay).queue(function() {
                                    that._effects[that._done].play();
                                });
                            }
                            if (that._done == $items.length) {
                                $(that._currentItem).hide();
                                that._complete();
                                //$(that._nextItem).show();
                            }
                        }
                    });
                }
                $(that._currentItem).hide();
                $(that._nextItem).show();
                this._effects[0].play();
            }
        },

        clean: function() {
            var numEffects = this._effects.length;
            for (var i = 0; i < numEffects; i++) {
                this._effects[i].clean();
            }
            // Don't forget to reset
            this._done    = 0;
            // Get the issue of "Uncaught RangeError: Maximum call stack size exceeded" if I do not reset the array of effects
            this._effects = [];
        },

        getClass: function() {
            return 'Coo.Effect.Markup';
        }
    });
})(window.jQuery);
(function($) {
    /**
     * slab effect
     *
     * @since 1.0.2
     */
    Coo.Effect.Slab = Coo.Effect._Slice.extend({
        _animate: function() {
            this._showCurrentItem();

            var that    = this,
                t       = 0,
                speed   = this._slider.getOption('animationSpeed'),
                width   = this._slider.$element.width(),
                $slices = this._slider.$element.find('.' + this._slider.getOption('classPrefix') + 'box');

            $slices = $($slices.css('left', -width).get().reverse());
            $slices.each(function(index) {
                var $slice = $(this);
                that._addTimer(setTimeout(function() {
                    $slice.animate({ left: Math.ceil((that._numBoxes - index - 1) * width / that._numBoxes), opacity: 1 }, speed, function() {
                        if (index == that._numBoxes - 1) {
                            that._complete();
                        }
                    });
                }, t));
                t += speed / that._numBoxes;
            });
        },

        getClass: function() {
            return 'Coo.Effect.Slab';
        }
    });
})(window.jQuery);
(function($) {
    /**
     * slideLeft, slideRight, slideDown, slideUp effects
     *
     * @since 1.0.1
     */
    Coo.Effect.Slide = Coo.Effect._Grid.extend({
        _setup: function() {
            this._slider.$element.find('.' + this._slider.getOption('classPrefix') + 'clone').remove();
            this._createBoxes(1, 1);
        },

        _animate: function() {
            this._showCurrentItem();
            var that   = this,
                $box   = this._slider.$element.find('.' + this._slider.getOption('classPrefix') + 'box:first'),
                speed  = this._slider.getOption('animationSpeed') * 2,
                width  = this._slider.$element.width(),
                height = this._slider.$element.height();

            switch (this._effect){
                case 'slideDown':
                    $box.css({
                        opacity: '1',
                        top: -height,
                        width: width
                    }).animate({ top: 0, width: width }, speed, function() {
                            that._complete();
                        });
                    break;

                case 'slideUp':
                    $box.css({
                        opacity: '1',
                        top: height,
                        width: width
                    }).animate({ top: 0, width: width }, speed, function() {
                            that._complete();
                        });
                    break;

                case 'slideRight':
                    $box.css({ width: '0px', opacity: '1' }).animate({ width: width }, speed, function() {
                        that._complete();
                    });
                    break;

                case 'slideLeft':
                default:
                    $box.css({
                        opacity: '1',
                        left: '',
                        right: '0px',
                        width: '0px'
                    }).animate({ width: width }, speed, function() {
                            that._complete();
                        });
                    break;
            }
        },

        getClass: function() {
            return 'Coo.Effect.Slide';
        }
    });
})(window.jQuery);
(function($) {
    /**
     * swap effect
     *
     * @since 1.0.2
     */
    Coo.Effect.Swap = Coo.Effect._Grid.extend({
        _setup: function() {
            this._slider.$element.find('.' + this._slider.getOption('classPrefix') + 'clone').remove();
            this._createBoxes(2, 1, this._currentItem);
            this._createBoxes(2, 1, this._nextItem);
        },

        _animate: function() {
            var that   = this,
                height = this._slider.$element.height(),
                $boxes = this._slider.$element.find('.' + this._slider.getOption('classPrefix') + 'box'),
                speed  = that._slider.getOption('animationSpeed');

            $boxes.eq(0).css('height', height / 2).animate({ top: height, opacity: 1 }, speed);
            $boxes.eq(1).css({ height: height / 2, top: height / 2 }).animate({ top: -height / 2, opacity: 1 }, speed);
            $boxes.eq(2).css('top', height / 2).animate({ top: 0, opacity: 1 }, speed);
            $boxes.eq(3).css('top', 0).animate({ top: height / 2, opacity: 1 }, speed, function() {
                that._complete();
            });
        },

        getClass: function() {
            return 'Coo.Effect.Swap';
        }
    });
})(window.jQuery);