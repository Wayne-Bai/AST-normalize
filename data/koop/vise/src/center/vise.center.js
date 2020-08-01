(function( $ ) {
	$.extend( $.fn.vise.fn, {
		_center: function( e, vise ) {
			var difference = vise.element.height() - vise.height;

			difference = difference > 0 ? difference : 0;
			vise.clamp.css( 'marginTop', difference / 2 );
		},
		center: function() {
			this.on( 'resize', this._center );
			this.trigger('resize');
		},

		uncenter: function() {
			this.clamp.css( 'marginTop', 0 );
			this.off( 'resize', this._center );
		}
	});
}( jQuery ));