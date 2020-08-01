module('Gradient Animation Plugin');

test('Linear Gradient', 2, function() {
	
	//console.log( $.Color('orange').toString() );
	
	$(document).ready(function() {
		
		//Give it an inital gradient	
		$('#test').css('background-image', 'linear-gradient(top left, red, blue)');
		
		stop();
		
		$('#test').animateGradient('linear-gradient(top left, purple, orange)', 1000, function(){
			var newCss = $('#test').css('background-image');
			ok(true, 'Complete event fires');
			ok( /linear-gradient\((.*), rgb\(128, 0, 128\), rgb\(255, 165, 0\)\)/.test(newCss), 'New Css value has "taken"' );
			start();
		});
			
	});	
});

test('Radial Gradient', 2, function() {
		
	$(document).ready(function() {
		
		//Give it an inital gradient	
		$('#test').css('background-image', 'radial-gradient(50% 50%, circle, red, blue)');

		stop();

		$('#test').animateGradient('radial-gradient(50% 50%, circle, purple, orange)', 1000, function(){
			var newCss = $('#test').css('background-image');
			ok(true, 'Complete event fires');
			ok( /radial-gradient\((.*), (circle|circle cover), rgb\(128, 0, 128\), rgb\(255, 165, 0\)\)/.test(newCss), 'New Css value has "taken"' );
			start();
		});
	});	
	
});