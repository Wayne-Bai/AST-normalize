/* vim: set tabstop=4 softtabstop=4 shiftwidth=4 expandtab: */

define( 'colorpicker', [ 'lego', 'slider' ],
function ( Lego, Slider ) {
    var Colorpicker = Lego.extend({
        defaultOptions: {
            gridSelector: '.grid',
            hueSelector: '.hue'
        },

        init: function ( el, options ) {
            this._super( el, options );

            var self = this,
                opts = this.options;

            this.$hue = this.$el.find( opts.hueSelector );
            this.$grid = this.$el.find( opts.gridSelector );

            this.hueSlider = new Slider( this.$hue, { type: 'vertical' } );
            this.gridSlider = new Slider( this.$grid, { type: '2d' } );

            this.h = 0;
            this.s = 100;
            this.l = 50;

            this.hueSlider.on( 'slider-update-value', function ( evt, data ) {
                self.h = Math.round( data.y * 365 ) ;
                self.trigger( 'colorpicker-update-value', { h: self.h, s: self.s, l: self.l } );
                self.$grid.css( 'background-color', 'hsl(' + self.h + ', 100%, 50%)' );
            });

            this.gridSlider.on( 'slider-update-value', function ( evt, data ) {
                self.s = Math.round( data.x * 100 );
                self.l = Math.round( ( 1 - data.y ) * 50 );
                self.trigger( 'colorpicker-update-value', { h: self.h, s: self.s, l: self.l } );
            });
        }
    });

    return Colorpicker;
});
