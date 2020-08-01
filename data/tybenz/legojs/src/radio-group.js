/* vim: set tabstop=4 softtabstop=4 shiftwidth=4 expandtab: */

define( 'radio-group', [ 'lego' ],
function ( Lego ) {
    var RadioGroup = Lego.extend({
        defaultOptions: {
            activeClass: 'active',
            activeEvent: 'click'
        },

        init: function ( el, options ) {
            this._super( el, options );

            var self = this,
                $el = this.$el,
                opts = this.options;

            $el.on( opts.activeEvent, function activate( evt ) {
                evt.preventDefault();

                self._handleActiveEvent( $( this ) );
            });
        },

        _handleActiveEvent: function ( $item ) {
            this.deactivate();

            this.activate( $item );

            this.trigger( 'lego-radio-activate', $item[0] );
        },

        deactivate: function ( $item ) {
            $item = $item || this.$el;

            $item.removeClass( this.options.activeClass );
        },

        activate: function ( $item ) {
            $item.addClass( this.options.activeClass );
        }
    });

    return RadioGroup;
});
