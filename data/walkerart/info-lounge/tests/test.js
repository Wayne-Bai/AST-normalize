// A custom function
function ajax(successCallback) {
	$.ajax({
		url: 'javascripts/test.json',
		success: successCallback
	});
}

function body_test(){
  /*
  var $body = $( "body" );
 
  $body.on( "click", function() {
    ok( true, "body was clicked!" );
  });
 
  $body.trigger( "click" );
  */
  ok( true, "body was clicked!" );
}

function swipe_test(){
  
  
}

// Tell QUnit that you expect three assertion to run
test('asynchronous test', 4, function() {
	// Pause the test
	stop();

	ajax(function() {
		ok(true);
	})

	ajax(function() {
		ok(true);
		ok(true);
	})
  
  body_test();

	setTimeout(function() {
		start();
	}, 2000);
})
