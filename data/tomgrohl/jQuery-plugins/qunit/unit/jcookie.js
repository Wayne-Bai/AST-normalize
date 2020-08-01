module("jCookie Cookie Plugin");

test("Basic", 3, function() {


	$.cookie('mycookie', 'value');
	
	equals( $.cookie('mycookie'), 'value', "Cookie Value is Correct" );
	
	
	$.cookie('mycookie', 'another value');
		
	equals( $.cookie('mycookie'), 'another value', "Cookie Value is Successfully changed" );
	
	

	$.cookie('mycookie', null);
		
	equals( $.cookie('mycookie'), undefined, "Cookie Value is Successfully Deleted" );	

});


test("Advanced", 3, function() {

	var options = {
		"path" : "/plugins/qunit",
		"expires" : 1,
		"domain" : false //on localhost
	};

	$.cookie('mycookie2', 'value', options);
	
	equals( $.cookie('mycookie2'), 'value', "Cookie Value is Correct" );
	
	
	$.cookie('mycookie2', 'another value', options);
		
	equals( $.cookie('mycookie2'), 'another value', "Cookie Value is Successfully changed" );
	
	

	$.cookie('mycookie2', null, options);
		
	equals( $.cookie('mycookie2'), undefined, "Cookie Value is Successfully Deleted" );	

});