/*
 *  Responsive Prototype Tool v1.0
 *  Tool for test and edit responsive design prototypes in the browser.
 *  http://git.io/mqhP-w
 *
 *  Michael Lancaster
 *  MIT LICENSE
 */

// Adding content editable and highlighting
 (function($) {
	$.fn.editableText = function(element) {
		return this.each(function() {
			$(this).each(function() {
				$(this).attr('contenteditable', 'true');
				$(this).css('border', '1px solid rgba(0, 0, 0, 0.3)');
			});
		});
	};
})(jQuery);

// drag and drop image upload
 (function($) {
	$.fn.dragNdropImage = function(element) {
		return this.each(function() {
			$(this).each(function() {
				// Required for drag and drop file access
				jQuery.event.props.push('dataTransfer');

				$(this).on('drop', function(event) {
					// Or else the browser will open the file
					event.preventDefault();
					// Do something with the file(s)
					var elImg = event.dataTransfer.files,
					imgURL = window.URL.createObjectURL(elImg[0]);

					$(this).attr('src', imgURL);

				});

				$(this).on('dragover', function(event) {
					$(this).css('opacity', '0.5');
					return false;
				});

				$(this).on('dragleave', function(event) {
					$(this).css('opacity', '1');
					return false;
				});
			});
		});
	};
})(jQuery);

//document ready
$(function() {
	
	// call and add content editable
	$('p, h4').editableText();

	// call Drag and Drop image upload
	$('img').dragNdropImage();
})