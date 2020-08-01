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
                $(this._nextItem)
                    .stop(true)
                    .fadeIn('slow', function() {
                        $(this)
                            .stop(true, true)
                            .animate({
                                opacity: 1,
                                marginLeft: '0px'
                            }, that._slider.getOption('animationSpeed'), function() {
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
