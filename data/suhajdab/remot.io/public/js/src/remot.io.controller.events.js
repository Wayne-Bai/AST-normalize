/**
 * TODO[future]: capture all touch events & gestures and pass them to client debounced
 * TODO: keep id in local storage
 * TODO: handle zoom, pinch gestures
 * TODO: error handling when not connected for long period
 */

( function ( $ ) {
	'use strict'


	function attachListeners() {

		//	listen for touch events to be sent to receiver
		$( document )
			.on( 'swipeLeft', 	onSwipe )
			.on( 'swipeRight', 	onSwipe )
			.on( 'swipeUp', 	onSwipe )
			.on( 'swipeDown', 	onSwipe )
			.on( 'tap', 	onTap )
			.on( 'longTap', 	onTap )
			.on( 'touchmove', 	onTouchMove );

		//	socket connection events
		remot.io.socket.on( 'connect', 	onConnect );
		remot.io.socket.on( 'status', 	onStatus );
	}

	function onSwipe ( e ) {
		emitControl( e.type );
		swipeFeedback( e.type );
	}

	function onTap ( e ) {
		emitControl( e.type );
	}

	function onTouchMove ( e ) {
		e.preventDefault();
	}

	function onConnect ( e ) {
		sendUid();
		statusFeedback( 'unlinked' );
	}

	function onStatus ( e ) {
		statusFeedback( e.status );
	}

	function emitControl ( type ) {
		remot.io.socket.emit( 'control', { type: type });
	}

	function swipeFeedback ( type ) {
		document.body.dataset.eventType = type;
	}

	function statusFeedback( status ) {
		document.body.dataset.status = status;
	}

	function sendUid() {
		console.log( remot.io );
		remot.io.socket.emit( 'uid', { uid: remot.io.uid });
	}

	attachListeners();

})( Zepto );