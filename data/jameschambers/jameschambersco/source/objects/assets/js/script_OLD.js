

/* function vimeoShade - resizes the iframes to cover the div.image section
 ------------------------------------------------- */

function vimeoShade() {
	
	$('ul#projects li div.image').each(function () {
		
		var imageHeight		= $('span.image', this).outerHeight();
		var imageWidth		= $('span.image', this).outerWidth();
		
		$('iframe', this).css({
			'height': imageHeight, 
			'width': imageWidth
		});
		
	});
}

$(document).ready(function () {
	
	/* Grid show/hide
	 ------------------------------------------------- */
	
	$(document).bind('keydown', function(e) {
		
		if (e.keyCode === 27) {
			
			$('#grid').hide();

			return false;
			
		}
	});
	
	/* info section toggling
	 ------------------------------------------------- */
	
	$('a.info').click(function () {
		
		$('#main-content').animate({ 
		 	'margin-left': '-320px'
		}, 200);
		
		return false;
		
	});
	
	$('a.close').click(function () {
		
		$('#main-content').animate({ 
		 	'margin-left': '0px'
		}, 200);
		
		return false;
	});
	
	
	/* Image fadin
	 ------------------------------------------------- */
	
	$('#gesundheit-radio span.image').stop().animate({ 
		'opacity': 1,
		'left': '0px'
	}, 300, 'easeInOutSine', function () {
		
		$('a.play').stop().animate({ 
			'opacity': 0.5
		}, 300, 'easeInOutSine');
		
	});
	
	$('#floppy-legs span.image, #antitouch-lamp span.image').stop().animate({ 
		'opacity': 1,
		'right': '0px'
	}, 300, 'easeInOutSine', function () {
		
		$('a.play').stop().animate({ 
			'opacity': 0.5
		}, 300, 'easeInOutSine');
		
	});
	
	
	
	/* Vimeo
	 ------------------------------------------------- */
	
	// PLAY 
	 
	$('a.play').click(function () {
		
		// hide span.image and a.play 
		$(this).siblings('span.image').hide();
		$(this).hide();
		
		// show iframe
		$(this).siblings('iframe').show(0);
		
		// trigger cliop to play with vimeo API
		$f($(this).siblings('iframe')[0]).api('play');
		
		return false;
		
	});
		
	// Listen for the ready event for any vimeo video players on the page
	var vimeoPlayers = document.querySelectorAll('iframe'),
	player;

	for (var i = 0, length = vimeoPlayers.length; i < length; i++) {
		player = vimeoPlayers[i];
		$f(player).addEvent('ready', ready);
	}

	function addEvent(element, eventName, callback) {
		if (element.addEventListener) {
			element.addEventListener(eventName, callback, false);
		} else {
	 		element.attachEvent(eventName, callback, false);
		}
	}

	function ready(player_id) {
		
		// Keep a reference to Froogaloop for this player
		var container = document.getElementById(player_id).parentNode.parentNode,
		froogaloop = $f(player_id);

		function setupEventListeners() {

			function onPlay() {
				froogaloop.addEvent('play', function(data) {
				});
		 	}

		 	function onPause() {
				froogaloop.addEvent('pause', function(data) {
					// hide the player
					$('#' + data).hide();
					// show the images etc
					$('#' + data).siblings().fadeIn(250);
				});
		 	}

		 	function onFinish() {
				froogaloop.addEvent('finish', function(data) {
		       		// hide the player
					$('#' + data).hide();
					// show the images etc
					$('#' + data).siblings().fadeIn(250);
				});
	   		}

			onPlay();
			onPause();
			onFinish();
		}
	
		setupEventListeners();
	}
	
});























