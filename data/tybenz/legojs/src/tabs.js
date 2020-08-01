/* vim: set tabstop=4 softtabstop=4 shiftwidth=4 expandtab: */

define( 'tabs', [ 'radio-group' ],
function ( RadioGroup ) {
    var Tabs = RadioGroup.extend({
        defaultOptions: {
            activeClass: 'active',
            activePanelClass: 'active',
            activeEvent: 'click',
            panelSelector: '.panel',
            panelGroups: []
        },

        init: function ( el, options ) {
            this._super( el, options );

            this.$panels = $( this.options.panelSelector );
        },

        deactivate: function ( $item ) {
            this._super( $item );

            this.$panels.removeClass( this.options.activePanelClass );
        },

        activate: function ( $item ) {
            this._super( $item );

            $( $item.attr( 'href' ) ).addClass( this.options.activePanelClass );
        }
    });

    return Tabs;
});
