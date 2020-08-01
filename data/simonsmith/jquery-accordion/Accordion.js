
/*
    Simple accordion, suitable for responsive design
    https://github.com/simonsmith/jQuery-Accordion
    @blinkdesign
*/

!function(global) {

    var wrap = function($) {

        var Accordion = function(container, options) {
            if (!(this instanceof Accordion)) {
                return new Accordion(container, options);
            }

            this.options = $.extend(true, {
                openClass: 'is-open-pane',
                activeClass: 'js-accordion-active',
                animSpeed: 'fast',
                touchEvents: true,	
    	        touchEventType: 'touchstart',
                openPane: 0,
                selectors: {
                    item: '.accordion-item',
                    header: '.accordion-header',
                    content: '.accordion-content'
                }
            }, options);

            this.container = $(container);
            this.panes = this.container.find(this.options.selectors.item);

            this.attachEvents();

            if (typeof this.options.openPane === 'number') {
                this.panes.eq(this.options.openPane)
                    .addClass(this.options.openClass)
                    .find(this.options.selectors.content)
                    .css('display', 'block');
            }

            this.container.addClass(this.options.activeClass);
        };

        Accordion.prototype = {

            attachEvents: function() {
                var self = this, eventType;

                if (self.options.touchEvents) {
                    // Still check for touch support
                    eventType = ('ontouchstart' in document.documentElement ? self.options.touchEventType : 'click');
                } else {
                    eventType = 'click';
                }

                this.container.on(eventType + '.accordion', this.options.selectors.header, function(event) {
                    var $this = $(this);
                    var paneParent = $this.parents(self.options.selectors.item);

                    if (paneParent.find(self.options.selectors.content).is(':visible')) {
                        self._slideUp($this.parents(self.options.selectors.item).find(self.options.selectors.content));
                    } else {
                        self.openPane(paneParent);
                    }

                    event.preventDefault();
                });
            },

            openPane: function(element) {
                var self = this;
                var paneContent = element.find(self.options.selectors.content);

                this.closePane(element);
                paneContent.slideDown(self.options.animSpeed, function() {
                    element.addClass(self.options.openClass);
                });

                return this;
            },

            closePane: function(element) {
                var paneContent = element.find(this.options.selectors.content);
                var filteredPanes = this.panes.find(this.options.selectors.content).not(paneContent);

                this._slideUp(filteredPanes);
                return this;
            },

            openAllPanes: function() {
                this._toggleAll('slideDown', 'addClass');
                return this;
            },

            closeAllPanes: function() {
                this._toggleAll('slideUp', 'removeClass');
                return this;
            },

            _toggleAll: function(animMethod, classMethod) {
                var self = this;

                this.panes.find(self.options.selectors.content)[animMethod](function() {
                    $(this).parents(self.options.selectors.item)[classMethod](self.options.openClass);
                });
            },

            _slideUp: function(element) {
                var self = this;
                element.slideUp(self.options.animSpeed, function() {
                    self.panes.removeClass(self.options.openClass);
                });
            }
        };

        return Accordion;

    };

    if (typeof define === 'function' && define.amd) {
        define(['jquery'], wrap);
    } else {
        global.jQuery.accordion = wrap(global.jQuery);
    }

}(this);
