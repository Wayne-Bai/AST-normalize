/* vim: set tabstop=4 softtabstop=4 shiftwidth=4 expandtab: */

define( 'draggable', [ 'drag-tracker' ],
function ( DragTracker ) {
    var Draggable = DragTracker.extend({
        defaultOptions: {
            dragThreshold:  5,
            ignoreX: false,
            ignoreY: false,
            dragStart: null,
            dragUpdate: null,
            dragStop: null,
            startEvent: 'mousedown',
            updateEvent: 'mousemove',
            stopEvent: 'mouseup',
            useTransforms: false
        },

        init: function ( el, options ) {
            this._super( el, options );
        },

        dragStart: function ( dx, dy ) {
            var opts = this.options;

            this.startTop = parseInt( this.$el.css( 'top' ) );
            this.startLeft = parseInt( this.$el.css( 'left' ) );

            this._setPosition( opts.ignoreX ? null : this.startLeft + dx, opts.ignoreY ? null : this.startTop + dy );
        },

        dragUpdate: function ( dx, dy ) {
            var opts = this.options;
            this._setPosition( opts.ignoreX ? null : this.startLeft + dx, opts.ignoreY ? null : this.startTop + dy );
        },

        dragStop: function ( dx, dy ) {
            this.dragUpdate( dx, dy );
        },

        _setPosition: function ( x, y ) {
            this.setPosition( x, y );
            this.trigger( 'draggable-set-position', { x: x, y: y } );
        },

        setPosition: function ( x, y ) {
            var $el = this.$el;

            if ( this.options.useTransforms ) {
                transform = ( x ? 'translateX(' + x + ') ' : '' ) + ( y ? 'translateY(' + y + ')' : '');
                $el.css({
                    '-webkit-transform': transform,
                    '-moz-transform': transform,
                    '-ms-transform': transform,
                    '-o-transform': transform,
                    'transform': transform
                });
            } else {
                $el.css({
                    'left': x,
                    'top': y
                });
            }
        }
    });

    return Draggable;
});
