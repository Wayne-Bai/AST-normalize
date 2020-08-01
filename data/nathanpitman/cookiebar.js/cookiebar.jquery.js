$(document).ready(function () {

	/*!
	 * jQuery Cookiebar
	 * https://github.com/ninefour/cookiebar.js
	 *
	 * Copyright 2012, Nathan Pitman
	 */

	// For reading the cookie
	function cb_vis() {
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf("cb_vis=") == 0) return c.substring("cb_vis=".length,c.length);
		}
		return null;
	}
	
	// Cookie Policy URL (cp:url)
	var cb_policy = $("link[rel=cookie-policy]").attr("href");

	// Check if a policy URL is specified
	if (cb_policy) {
		
		// Checks if the cookie exists, if not it renders the cookiebar
		if (!cb_vis()) {
			
			// Append/prepend the cookiebar CSS and content to the document
			var bodyMarginTop = parseInt($("body").css("margin-top"))+38;

			// The markup for the cookie bar itself
			var cb_html = "<div id='cb'><p>This website uses cookies. You can <a href='"+cb_policy+"'>change your cookie settings</a> to disable them. If you continue to browse our site, you are agreeing to our use of cookies.</p><button title='Dismiss'><span>Dismiss</span></button></div>";
			
			// The CSS that's applied to the cookiebar (note the base64 encoded dismiss icon)
			var cb_css = "<style>body.cb { margin-top: "+bodyMarginTop+"px !important; } #cb { position: fixed; z-index: 2147483647; left: 0; top: 0; width: 100%; min-height: 34px; border-top: 1px solid #FFFFFF; border-bottom: 1px solid #CCCCCC; background-color: #EBEBEB; background-image:-moz-linear-gradient(50% 0% -90deg,rgb(236,236,236) 0%,rgb(225,225,225) 100%); background-image:-webkit-gradient(linear,50% 0%,50% 100%,color-stop(0, rgb(236,236,236)),color-stop(1, rgb(225,225,225))); background-image:-webkit-linear-gradient(-90deg,rgb(236,236,236) 0%,rgb(225,225,225) 100%); background-image:linear-gradient(-90deg,rgb(236,236,236) 0%,rgb(225,225,225) 100%); } #cb p { margin: 0 20px 0 0; padding: 10px; color: #000000; font-size: 12px; text-align: left; } @media (max-width: 480px) { #cb p { margin: 0 40px 0 0; } } #cb button { position: absolute; top: 10px; right: 10px; background-color: transparent; width: 15px; height: 15px; padding: 0; margin: 0; border: none; box-shadow: none; cursor: pointer; background-image: url('https://raw.github.com/ninefour/cookiebar.js/master/assets/dismiss.png'); background-position: 0 0; background-repeat: no-repeat; } @media (max-width: 480px) { #cb button { margin: 0; padding: 0; width: 30px; height: 30px; background-position: -20px 0; } } #cb button:hover { background-position: 0 -30px; } @media (max-width: 480px) { #cb button:hover { background-position: -20px -30px; } } #cb button span { display: none; }</style>";
			
			$('body').addClass('cb');
			$('head').append(cb_css);
			$('body').prepend(cb_html);
			
			// Write the cookie on click to hide the cookie bar
			$('#cb button').click(function() {
				var expires = 365 * 10;
				document.cookie = "cb_vis=0"+expires+"; path=/";
				$('body').removeClass('cb');
				$('#cb').toggle();
			});
	
		};
	
	} else {
		alert("You must specify a policy URL in your document head.");
	}	

});