//Molten Leading
(function($) {
	$.fn.moltenLeading = function( config ) {
		var o = $.extend( {
			minline: 1.2,
			maxline: 1.6,
			minwidth: 320,
			maxwidth: 1024
		}, config ),
		hotlead = function( el ) {
			var $el = $( this !== window ? this : el ),
			widthperc = parseInt( ( $el.width() - o.minwidth ) / ( o.maxwidth - o.minwidth ) * 100, 10 ),
			linecalc = o.minline + ( o.maxline - o.minline ) * widthperc / 100;

			if ( widthperc <= 0 || linecalc < o.minline ) {
				linecalc = o.minline;
			} else if ( widthperc >= 100 || linecalc > o.maxline ) {
				linecalc = o.maxline;
			}

			$el.css( "lineHeight", linecalc );

			$( window ).one( "resize", function() {
				hotlead( $el );
			});
		};

		return this.each( hotlead );
	};
})(jQuery);


/*
* throttledresize: special jQuery event that happens at a reduced rate compared to "resize"
*
* latest version and complete README available on Github:
* https://github.com/louisremi/jquery-smartresize
*
* Copyright 2012 @louis_remi
* Licensed under the MIT license.
*
* This saved you an hour of work?
* Send me music http://www.amazon.co.uk/wishlist/HNTU0468LQON
*/

(function($) {

	var $event = $.event,
	$special,
	dummy = {_:0},
	frame = 0,
	wasResized, animRunning;

	$special = $event.special.throttledresize = {
		setup: function() {
			$( this ).on( "resize", $special.handler );
		},
		teardown: function() {
			$( this ).off( "resize", $special.handler );
		},
		handler: function( event, execAsap ) {
			// Save the context
			var context = this,
			args = arguments;

			wasResized = true;

			if ( !animRunning ) {
				setInterval(function(){
					frame++;

					if ( frame > $special.threshold && wasResized || execAsap ) {
			// set correct event type
			event.type = "throttledresize";
			$event.dispatch.apply( context, args );
			wasResized = false;
			frame = 0;
		}
		if ( frame > 9 ) {
			$(dummy).stop();
			animRunning = false;
			frame = 0;
		}
	}, 30);
				animRunning = true;
			}
		},
		threshold: 0
	};
})(jQuery);

$.event.special.throttledresize.threshold = 3;


function scrollbarWidth() {
    var $inner = jQuery('<div style="width: 100%; height:200px;">test</div>'),
        $outer = jQuery('<div style="width:200px;height:150px; position: absolute; top: 0; left: 0; visibility: hidden; overflow:hidden;"></div>').append($inner),
        inner = $inner[0],
        outer = $outer[0];
     
    jQuery('body').append(outer);
    var width1 = inner.offsetWidth;
    $outer.css('overflow', 'scroll');
    var width2 = outer.clientWidth;
    $outer.remove();
 
    return (width1 - width2);
}


