(function( win, undefined ) {
	var doc = win.document,
		docElem = doc.documentElement,
		ctx = [
			{
				name: 'basic',
				positions: 3,
				breakpoint: [1,480],
				hides: []
			},
			{
				name: 'median',
				positions: 3,
				breakpoint: [481,640],
				hides: ['ARTICLE']
			},
			{
				name: 'large',
				positions: 5,
				breakpoint: [641,960],
				hides: ['ARTICLE']
			}
		],
		oas_positions = doc.getElementById( 'oas-positions' ).getAttribute( 'content' ).split( ',' ),
		oas_context = '',
		ctxLen = ctx.length-1,
		defaultContext = ctx[ctxLen].breakpoint[1],
		
		// Get context: 'defaultContext' if >960 or min. screen dimension otherwise
		//screenSize = matchMedia('only screen and (min-width: '+ defaultContext +'px)').matches ? defaultContext : Math.min(win.screen.availWidth, win.screen.availHeight);
		screenSize = docElem.clientWidth > defaultContext ? defaultContext :  Math.min(win.screen.availWidth, win.screen.availHeight);
				
		// loop through configuration options, pick one that matches current screen size range
		for (var i = ctxLen; i >= 0; i--){            
         
			if( screenSize >= ctx[i].breakpoint[0] && screenSize < ctx[i].breakpoint[1]){
				var pos_count = ctx[i].positions,
					offset = (i === 0 ? 0 : ctx[i-1].positions),
					pos_end = pos_count + offset;
                            
				oas.currentContext = oas_positions.slice( offset, pos_end );
				oas_context = ctx[i].name;
				break;
			} else {
                // this is the 'default' context, which lists ALL OF THE active positions            
				var offset = ctx[ctxLen].positions,
					pos_end = oas_positions.length;

				oas.currentContext = oas_positions.slice( offset, pos_end );
				oas_context = 'default';
			}
		}
		
	oas.listpos  = oas.currentContext;
	//oas.listpos = 'EXTRA,TOP,INTRO,CENTRAL,FOOTER,MICRO1,MICRO2,MICRO3,SPONSOR,TILE1,HEADLINE1,HEADLINE2,LOGO1,LOGO2,LOGO3,LOGO4,LOGO5,LOGO6,LOGO10,LOGO8,LOGO14,BILLBOARD,LOGO9,MISC1,MISC2,MISC3,MISC4,MISC5';
	oas.query	= 'oas_context='+oas_context;
	oas.url	= 'http://rmedia.boston.com/RealMedia/ads/';
	//oas.url 	= 'http://delivery.uat.247realmedia.com/'
	oas.target	= '_top';
	oas.rn		= '001234567890';
	oas.rns		= '1234567890';
	oas.r		= Math.random() + "";
	oas.rns		= oas.rn.substring(2, 11);
	oas.version = 11;
	
	// allow ad disabling for layout development
	if( oas.dev ) {
		window.OAS_RICH = function(pos) {
			console.log(pos);
			return false;
		};
	} else{
		document.writeln('<script src="'+ oas.url +'adstream_mjx.ads/'+ oas.sitepage +'/1'+ oas.rns +'@'+ oas.listpos +'?'+ oas.query +'"> <\/script>');
	}







	/*
		The code below is ONLY a CONCEPT to show how async loadable ads might work with this responsive ad packaging
		- Obviously NOT with OAS due to indiscriminate use of document.write
	*/
	oas.setReflows = function( els ) {
		var reflowPositions = [];
		// find ads that can reflow and build a position list for OAS
		for (var i = 0, l = els.length; i<l; ++i){
			if ( els[i].getAttribute('data-reflow') ){
				reflowPositions.push( els[i].getAttribute('data-reflow') );
			}
		}
		reflowPositions = reflowPositions.join(',');

		// do some throttled async ad loading, perhaps using matchMedia to constrain choices?		
		/*
		addEvent( win, 'resize', debounce(function() {
			console.log('New ads for positions '+ reflowPositions +' are speeding through the interwebs as we speak ...');				
			//document.writeln('<script src="'+ oas.url +'adstream_mjx.ads/'+ oas.sitepage +'/1'+ oas.rns +'@'+ oas.listpos +'?'+ oas.query +'"> <\/script>');
			
		}) );
		*/
	};
	
	// Hand-rolled cross-browser 'resize' event for use with async reflowed ads
	addEvent = (function () {
		var setListener;

		return function (el, ev, fn) {
			if (!setListener) {
				if (el.addEventListener) {
					
					setListener = function (el, ev, fn) {
						el.addEventListener(ev, fn, false);						
					};
				} else if (el.attachEvent) {
					setListener = function (el, ev, fn) {
						el.attachEvent('on' + ev, fn);
					};
				} else {
					setListener = function (el, ev, fn) {
						el['on' + ev] =  fn;
					};
				}
			}
			setListener(el, ev, fn);
		};
	}());
	
	// http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
	// Controls spasmodic 'resize' event firing
	var debounce = function (func, threshold, execAsap) {
		var timeout;
		return function debounced () {
		    var obj = this, args = arguments;
		    function delayed () {
		        if (!execAsap)
		            func.apply(obj, args);
		        timeout = null; 
		    };

		    if (timeout)
		        clearTimeout(timeout);
		    else if (execAsap)
		        func.apply(obj, args);

		    timeout = setTimeout(delayed, threshold || 200); 
		};
	};

	/*
		Put all general debugging consoles below, please
	*/

	//console.log('Screen lesser dimension is: '+screenSize);
	//console.log('Current context is: '+oas.currentContext);
	

	
})( this );
