/* vim: set tabstop=4 softtabstop=4 shiftwidth=4 expandtab: */

define( 'flyout', [ 'lego' ],
function ( Lego ) {
    var Flyout = Lego.extend({
        defaultOptions: {
            trigger: null,
            flyoutClass: "show",
            hiddenClass: "hide",
            triggerActiveClass: "active",
            toggle: true,
            autoFocus: false,
            flyoutEvent: 'click',
            hideEvent: null,
            positionAround: {
                position: 'below',
                positionOffset: 10,
                align: 'right'
            },
        },

        init: function ( el, options ) {
            this._super( el, options );

            var self = this,
                opts = this.options;

            opts.hideEvent = opts.hideEvent || opts.flyoutEvent;
            this.show = opts.flyoutClass;
            this.hide = opts.hideClass;
            this.$flyout = this.$el;

            opts.trigger = opts.trigger || 'body';
            this.$trigger = $( opts.trigger );

            this.$trigger.on( opts.flyoutEvent, function ( evt ) {
                self._handleEvent( evt );
            });
        },

        _handleEvent: function( evt ) {
            evt.preventDefault();

            var self = this,
                opts = this.options;

            if ( this._flyoutIsHidden() ) {
                this._showFlyout();
                this._handleGlobalEvent = function( evt ) {
                    var $target = $( evt.target );
                    if ( !self._flyoutIsHidden() && ( !$target.closest( self.$trigger ).length && !$target.closest( self.$flyout ).length ) ) {
                        self._hideFlyout();
                    }
                };
                $( document ).on( opts.hideEvent, self._handleGlobalEvent );
            } else {
                if ( opts.toggle ) {
                    this._hideFlyout();
                }
            }
        },

        _hideFlyout: function() {
            this.$flyout.removeClass( this.show ).addClass( this.hide );
            $( document ).off( this.options.hideEvent, this._handleGlobalEvent );
            this.$flyout.trigger( 'wp-flyout-hide' );
            this.$trigger.removeClass( this.options.triggerActiveClass );
        },

        _showFlyout: function() {
            this.$flyout.removeClass( this.hide ).addClass( this.show );
            if ( this.options.positionAround ) {
                pos = this.positionElementAroundAnother( this.$trigger, this.$flyout, this.options.positionAround );
                this.$flyout.css({ left: pos.x + 'px', top: pos.y + 'px' });
            }
            this.$flyout.trigger( 'wp-flyout-show' );
            this.$trigger.addClass( this.options.triggerActiveClass );
            if ( this.options.autoFocus ) {
                this.$flyout.find( 'input[type=text]:first' ).focus();
            }
        },

        _flyoutIsHidden: function() {
            return !this.$flyout.hasClass( this.show );
        },

        positionElementAroundAnother: function( refElement, posElement, options ) {
            options = $.extend({
                // Where to position the posElement relative to the
                // refElement. Possible values are:
                //
                //            'right', 'left', 'above', or 'below'
                //
                // The default value is 'right'.

                position: 'right',

                // The amount of offset to add to the calculated position
                // of the posElement. If position is 'right' or 'left'
                // a positive value moves the posElement away from the
                // refElement in the horizontal direction. If position is
                // 'above' or 'below' a positive value moves the refElement
                // away from the refElement in the vertical direction.
                //
                // The default value is zero, which means the posElement
                // will be touching the refElement.

                positionOffset: 0,

                // Decide how to align the side of the refElement that is
                // closest to the refElement. The allowed value of this
                // property depends on the value of the position property.
                // If position is 'right' or 'left', then allowed values
                // for the align property are 'top', 'bottom' or 'center'.
                // If position is 'above' or 'below', then allowed values
                // are 'left', 'right' or 'center'.

                align: 'center',

                // The amount of offset to apply to the calculated
                // alignment. If the align attribute adjusts the
                // horizontal direction, a positive value shifts
                // the posElement to the left. If the align attribute
                // adjusts the vertical direction, a positive value
                // shifts the posElement down.

                alignOffset: 0
            }, options );

            var $ref = $( refElement ), // reference-element
                $ele = $( posElement ), // the element to position
                $offsetParent = $ele.offsetParent();

            $ele.removeClass( 'above below left right' );

            var rOffset = $ref.offset(),
                rWidth = $ref.outerWidth(),
                rHeight = $ref.outerHeight(),
                pOffset = $offsetParent.offset(),
                wWidth = $ele.outerWidth(),
                wHeight = $ele.outerHeight(),

                positionOffset = options.positionOffset,
                align = options.align,
                alignOffset = options.alignOffset,

                // Calculate an initial position where the top-left corner of
                // the posElement is the same as the refElement.

                x = rOffset.left - pOffset.left,
                y = rOffset.top - pOffset.top;


            // Calculate the position based on the specified
            // position value.

            switch( options.position ) {
                case 'above':
                    x = x + this.getAlignmentAdjustment( align, rWidth, wWidth ) + alignOffset;
                y = y - wHeight - positionOffset;
                break;
                case 'below':
                    x = x + this.getAlignmentAdjustment( align, rWidth, wWidth ) + alignOffset;
                y = y + rHeight + positionOffset;
                break;
                case 'left':
                    x = x - wWidth - positionOffset;
                y = y + this.getAlignmentAdjustment( align, rHeight, wHeight ) + alignOffset;
                break;
                case 'right':
                    default:
                    x = x + rWidth + positionOffset;
                y = y + this.getAlignmentAdjustment( align, rHeight, wHeight ) + alignOffset;
                break;
            }

            return { x: x, y: y };
        },

        getAlignmentAdjustment: function ( align, refDim, posDim ) {
            var value = 0;
            switch( align ) {
                case 'left':
                    case 'top':
                    value = 0;
                break;
                case 'right':
                    case 'bottom':
                    value = refDim - posDim;
                break;
                case 'center':
                    default:
                    value = ( refDim - posDim ) / 2;
                break;
            }
            return value;
        }
    });

    return Flyout;
});
