(function($) {
    /**
     * slideLeft, slideRight, slideDown, slideUp effects
     *
     * @since 1.0.1
     */
    Coo.Effect.register(['slideDown', 'slideLeft', 'slideRight', 'slideUp'], 'Coo.Effect.Slide');

    Coo.Effect.Slide = Coo.Effect._Grid.extend({
        _setup: function() {
            this._slider.$viewPort.find('.' + this._slider.getOption('classPrefix') + 'clone').remove();
            this._createBoxes(1, 1);
        },

        _animate: function() {
            this._showCurrentItem();
            var that   = this,
                $box   = this._slider.$viewPort.find('.' + this._slider.getOption('classPrefix') + 'box:first'),
                speed  = this._slider.getOption('animationSpeed') * 2,
                width  = this._slider.$viewPort.width(),
                height = this._slider.$viewPort.height();

            switch (this._effect){
                case 'slideDown':
                    $box.css({
                        opacity: '1',
                        top: -height,
                        width: width
                    }).animate({
                        top: 0,
                        width: width
                    }, speed, function() {
                        that._complete();
                    });
                    break;

                case 'slideUp':
                    $box.css({
                        opacity: '1',
                        top: height,
                        width: width
                    }).animate({
                        top: 0,
                        width: width
                    }, speed, function() {
                        that._complete();
                    });
                    break;

                case 'slideRight':
                    $box.css({
                        width: '0px',
                        opacity: '1'
                    }).animate({
                        width: width
                    }, speed, function() {
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
                    }).animate({
                        width: width
                    }, speed, function() {
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
