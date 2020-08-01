
(function ( w ) {

	w.srcsetfill = function () {
		var images = document.getElementsByTagName('img'),
			srcsets = {},
			winWidth = w.document.documentElement.clientWidth,
			infinityThreshold = 200;

		var buildSet = function (sets) {
			for (var si=0; si<sets.length; si++) {
				var set = sets[si].replace(/^[\s]/, '').split(' ');
				var setw = parseInt(set[1],10);
				if (!set[1]) { setw = 'infinity'; }
				srcsets[setw] = set[0];
			}
		};

		var getLargestSize = function (set) {
			var largest = 0;
			for (var size in srcsets) {
				largest = ( srcsets.hasOwnProperty(size) && parseInt(size,10) > largest ) ? size : largest;
			}
			return parseInt(largest,10);
		};

		for ( var i=0; i<images.length; i++ ){
			if ( images[i].getAttribute('srcset') ) {
				var sets = images[i].getAttribute('srcset').split(',');
				buildSet(sets);

				var largestSize = getLargestSize(srcsets);
				var imgsrc = '';
				for (var size in srcsets) {
					if ( srcsets.hasOwnProperty(size) ) {
						if (winWidth >= size && size !== 'infinity') {
							imgsrc = srcsets[size];
						} else if ( size === 'infinity' && winWidth > (largestSize+infinityThreshold) ) {
							imgsrc = srcsets[size];
						}
					}
				}
				images[i].src = imgsrc;
			}
		}
	};
	

	// Run on resize and domready (w.load as a fallback)
	if( w.addEventListener ){
		w.addEventListener( "resize", w.srcsetfill, false );
		w.addEventListener( "DOMContentLoaded", function(){
			w.srcsetfill();
			// Run once only
			w.removeEventListener( "load", w.srcsetfill, false );
		}, false );
		w.addEventListener( "load", w.srcsetfill, false );
	}
	else if( w.attachEvent ){
		w.attachEvent( "onload", w.srcsetfill );
	}

})(this);