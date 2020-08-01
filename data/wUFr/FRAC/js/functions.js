$( "#toggle_user_menu" ).click(function() {
	$("#header_user_menu").toggleClass("open");
	$("#toggle_user_menu").toggleClass("active");
});


// MAIN MENU SUB ITEMS TOGGLE
$( "#admin_sidebar div.opener" ).click(function() {
	$(this).parent("li").toggleClass('opened');
	$(this).toggleClass('active')
});

// FOR MOBILE - HOTDOG
$( "#main_menu_hotdog" ).click(function() {
	$("#admin_sidebar").toggleClass("opened");
});

// UI BOX CLOSE-OPEN TOGGLE
$( ".ui_box .header .close" ).click(function() {
	$(this).parent().parent().parent(".ui_box").toggleClass('closed');
	$(this).toggleClass('active')
});

// UI MESSAGE CLOSE-OPEN TOGGLE
$( ".ui_message .close" ).click(function() {
	$(this).parent(".ui_message").addClass('closed');
});


// MAIN CONTENT WINDOWS RESIZE

/*

NEED TO REMAKE THIS CRAP - PROBABLY JS FOR HOVER ACTION ON SIDEBAR; ABSOLUTE BACKGROUND UNDER SIDEBAR TO FAKE 100% HEIGHT

*/

if($(window).width()>600){
	var height = $("#admin_main").height();
	$('#admin_sidebar').height(height);
}

$(window).resize(function() {
	if($(window).width()>600){
		setTimeout(function() {
			var height = $("#admin_main").height();
			$('#admin_sidebar').height(height);
		}, 1000);
		
	}
	else {
		$('#admin_sidebar').css('height' , 'auto');
	}
});