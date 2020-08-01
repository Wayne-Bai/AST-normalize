(function($) {
	$(document).ready(function(){
		
		// Specify the unit widths of unevenly-sized columns. The number of inputs must equal the number of rows. The inputs must add up to 12, as Mitosis.js is based on a 12 column grid.
		$('.container#example1 .row').unevenSized(3,9);
		
		// Equally-sized columns are simple to size.
		$('.container#example2 .row, .container#example3 .row').evenSized();
		
		// Multiple rows can be sized with the same syntax.
		$('.container#example4 .row').unevenSized(3,4,5);
	})
}(jQuery));
