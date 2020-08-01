(function($) {
    /**
     * boxRandom effect
     *
     * @since 1.0.1
     */
    Coo.Effect.register('boxRandom', 'Coo.Effect.BoxRandom');

    Coo.Effect.BoxRandom = Coo.Effect._Grid.extend({
        _animate: function() {
            this._showCurrentItem();
            var that   = this,
                t      = 0,
                speed  = this._slider.getOption('animationSpeed'),
                $boxes = this._slider.$viewPort.find('.' + this._slider.getOption('classPrefix') + 'box');

            $boxes = this._shuffleArray($boxes);
            $boxes.each(function() {
                t += speed / that._numBoxes;
                $(this)
                    .delay(t)
                    .animate({
                        opacity: '1'
                    }, speed, function() {
                        that._checkComplete();
                    });
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
