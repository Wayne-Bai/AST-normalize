(function($) {
    /**
     * slab effect
     *
     * @since 1.0.2
     */
    Coo.Effect.register('slab', 'Coo.Effect.Slab');

    Coo.Effect.Slab = Coo.Effect._Slice.extend({
        _animate: function() {
            this._showCurrentItem();

            var that    = this,
                t       = 0,
                speed   = this._slider.getOption('animationSpeed'),
                width   = this._slider.$viewPort.width(),
                $slices = this._slider.$viewPort.find('.' + this._slider.getOption('classPrefix') + 'box');

            $slices = $($slices.css('left', -width).get().reverse());
            $slices.each(function(i) {
                t += speed / that._numBoxes;
                $(this)
                    .delay(t)
                    .animate({
                        left: Math.ceil((that._numBoxes - i - 1) * width / that._numBoxes),
                        opacity: 1
                    }, speed, function() {
                        that._checkComplete();
                    });
            });
        },

        getClass: function() {
            return 'Coo.Effect.Slab';
        }
    });
})(window.jQuery);
