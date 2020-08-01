// Enable double-clicking title bar to minimize
(function(){
	var $header = $('#header');
	$header.dblclick(function(ev){
	if(ev.pageY <= 30){
		Spaz.Windows.windowMinimize();
		ev.preventDefault();
	}
	});
})();



// Make #entryform resizable
// TODO: Remember height in prefs
(function(){
	var $body				= $('body'),
		$timeline			= $('#timeline-tabs-content, .TabbedPanelsContentGroup'),
		$entryForm		= $('#entryform'),
		entryFormBottom	= parseInt($entryForm.css('bottom'), 10),
		$entryBoxPopup	= $('#entrybox-popup'),
		$resize			= $('<div id="leopaz-entryform-resize"></div>'),
		resizing			= false,
		maxEntryFormHeight = function(){
		return Titanium.UI.getCurrentWindow().getHeight() - 96;
		},
		setEntryFormHeight = function(newHeight){
		$timeline.css('bottom', newHeight + 28);
		$entryForm.height(newHeight);
		$entryBoxPopup.css('bottom', newHeight - 1);
		},
		onMouseMove = function(ev){
		if(!resizing){ return; }

		var newHeight = Titanium.UI.getCurrentWindow().getHeight() - ev.pageY - entryFormBottom;

		// Set max height: don't overlap header
		newHeight = Math.min(maxEntryFormHeight(), newHeight);

		// Set min height: fit at least one line of text
		newHeight = Math.max(35, newHeight);

		setEntryFormHeight(newHeight);
		},
		onMouseUp		= function(ev){ resizing = false; },
		onMouseEnter	= function(ev){ resizing = false; },
		onMouseOut	= function(ev){
		if(resizing && $(ev.target).is('body')){
			resizing = false;
		}
		};

	$resize.prependTo($entryForm)
	.mousedown(function(ev){
		resizing = true;
		$body
		.mouseout(onMouseOut)		// Must bind this first so it runs first
		.mouseenter(onMouseEnter) // Backup for when body mouseout isn't caught
		.mouseup(onMouseUp)
		.mousemove(onMouseMove);
	}).mouseup(onMouseUp);

	Titanium.API.addEventListener(
		Titanium.RESIZED, 
		function(e) {
			var max = maxEntryFormHeight();
			$entryForm.height();
			if ($entryForm.height() > max) {
				setEntryFormHeight(max);
			}
		}
	);

})();



// Add the following to your user.js file to customize the interface:

// Single scrollbar arrows at both the start and the end
// $('body').addClass('scrollbar-single-both');

// Double scrollbar arrows at both the start and the end
// $('body').addClass('scrollbar-double-both');
