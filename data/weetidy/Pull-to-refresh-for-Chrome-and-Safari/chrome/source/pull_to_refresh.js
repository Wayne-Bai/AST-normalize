// Setup the namespace

var pullToReload = {

	// Instance vars
	eventCapable: true,
	refreshCapable: false,
	timeStarted: null,
	scrollUpTime: null,
	
	init: function () {

		// Inject the html onto the page
		$('body').prepend('<div id="pullToRefreshReloading"><span class="icon"></span><span class="text">Reloading...</span></div><div id="pullToRefresh"><div class="wrap"><span class="icon">&nbsp;</span><div id="pullyText">Pull to refresh</div></div></div>');
		
		// Bind scroll listener
		$(window).bind('scroll', pullToReload.monitorScroll);
	},

	monitorScroll: function () {

		// If user is down the page, pull to refresh is not allowed
		if (window.scrollY > 0) {
			// reset the time
			pullToReload.scrollUpTime = null;
			pullToReload.eventCapable = false;
		}

		if (window.scrollY === 0) {
			// Start a timer if it isn't set
			if (pullToReload.scrollUpTime === null) {
				pullToReload.scrollUpTime = new Date();
			}
		}

		// User is real close, let's check that timer and see if it's long enough to reload the page
		if (pullToReload.scrollUpTime !== null)
		{
			var nowTime = new Date(),
				diff = nowTime.getTime() - pullToReload.scrollUpTime.getTime();

			if (diff > 500) {
				pullToReload.runScrollCommands();
			}
		}
		else
		{
			pullToReload.runScrollCommands();
		}
		
	},

	runScrollCommands: function () {
		
		// Scrolling up has occured, but not enough to reload yet
		if (window.scrollY < 0 && window.scrollY > -40)
		{
			// Set the text to pull to refresh
			$("#pullToRefresh #pullyText").html("Pull to refresh");
			
			if ($("#pullToRefresh .icon").hasClass("flippedArrow")) {
				$("#pullToRefresh .icon").removeClass("flippedArrow");
			}
			
			// Set the position of the pull down bar
			$("#pullToRefresh").css({ top: Math.abs(window.scrollY) - 40 });

			// Only set the time if we pull up and if the time is null
			if (pullToReload.refreshCapable === true && pullToReload.timeStarted === null) {
				// Set a date for scrolling back down the way
				pullToReload.timeStarted = new Date();
			}
		}
		
		// Reload threshold has passed
		if (window.scrollY <= -40)
		{
			// Set the text and icon to release
			$("#pullToRefresh #pullyText").html("Release to refresh");
			
			if ( ! $("#pullToRefresh .icon").hasClass("flippedArrow")) {
				$("#pullToRefresh .icon").addClass("flippedArrow");

			}
			
			// Set the position incase we scrolled too fast
			$("#pullToRefresh").css({ top: 0 });

			// Set refresh capable
			pullToReload.refreshCapable = true;

			// Wipe out the time
			pullToReload.timeStarted = null;
		}
		
		// We're back down below the page, let's see if we can reload
		if (window.scrollY >= 0 && pullToReload.refreshCapable === true)
		{
			if (pullToReload.timeStarted !== null) {
				// Check the time
				var nowTime = new Date(),
					diff = nowTime.getTime() - pullToReload.timeStarted.getTime();

				// If we have taken less than a half second for the release, reload the page
				if (diff < 500) {
					pullToReload.reloadTheWeePageMate();
				}
			}
			else
			{
				// We haven't even got to set the time it was that fast, let's reload.
				pullToReload.reloadTheWeePageMate();
			}

			// Set the time back to null and set release capable back to false
			pullToReload.timeStarted = null;
			pullToReload.refreshCapable = false;
		}

		if (window.scrollY >= 0)
		{
			// Set the position to completely hidden again
			$("#pullToRefresh").css({ top: -40 });
		}

	},

	reloadTheWeePageMate: function () {
		$("#pullToRefreshReloading").fadeIn(300);

		// Hold for a wee second to see the animation
		setTimeout(function(){
			// Do the page reload
			window.location.reload();
		}, 750);
	}

};

$(document).ready(pullToReload.init);