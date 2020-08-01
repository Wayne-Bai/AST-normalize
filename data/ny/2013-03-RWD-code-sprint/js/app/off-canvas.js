/*global exlsr: false */
/*
 Additional Login needed for off canvas Menus
*/

$(document).ready(function(){

	// Add control div to the top of the global nav element
	$('<div id="menu-controls" class="menu-controls"><span id="sub-menu-title" class="sub-menu-title"></span><a href="#" id="menu-back" class="menu-back icon-left-open">Back</a></div>').prependTo('#global-nav');

	// Find the global Dom and look for all a that have a child ul
	var rootMenu = $('#global-nav').find('a[href="#"]');

	rootMenu.each(function() {

		// Save off the link item just in case
		var link = $(this),
			subMenu = link.next('ul');

		// Check to see if there is a ul next to the anchor
		if (subMenu.length) {

			// We have a sub menu item so create the click event
			link.on(exlsr.activateEventName, function(e){

				// Prevent default link action
				e.preventDefault();

				// Prevent menu click propagation
				e.stopPropagation();

				// Check to see if the direct submenu item already is active
				if (!subMenu.hasClass('active-menu')) {

					// Check to see if there is another already active menu item
					var menuCheck = $('.active-menu');

					if (menuCheck.length) {
						menuCheck.removeClass('active-menu');
						menuCheck.siblings('a').removeClass('active');
					}

					// Set the link text in the title span
					$('#sub-menu-title').text(link.text());

					// Add the class of active to the active menu link
					link.addClass('active');

					// Add a class to the menu.
					subMenu.addClass("active-menu");

					if (!exlsr.$body.hasClass('active-sub-menu')) {
						exlsr.$body.addClass('active-sub-menu');
					}

					// Add click off event handler on body
					exlsr.$body.on(exlsr.activateEventName, function(){

						// Find all occurances off active menu, active and active-sub-menu and remove them
						exlsr.$body.removeClass('active-sub-menu');
						$('#global-nav .active').removeClass('active');
						$('#global-nav .active-menu').removeClass('active-menu');

					});

				} else {

					// Menu is active
					subMenu.removeClass("active-menu");

					// Remove active link class
					link.removeClass('active');

				}

			});
		}

	});

	// Bind for menu-back
	$('#menu-back').on(exlsr.activateEventName, function(e){

		// Prevent element default action
		e.preventDefault();

		// Prevent the click event from moving up
		e.stopPropagation();

		// Check to see if there is an active menu class
		var numberOfSubs = $('.active-menu');

		if (numberOfSubs.length > 0) {

			// Find the last occuance of the active menu and hide it
			numberOfSubs.last().removeClass('active-menu');

			// See if there are other menus
			if ($('.active-menu').length === 0) {

				// Remove the sub-menu-title as no sub menus are open
				$('#sub-menu-title').text("");

				// Remove the active-sub-menu class from the body
				exlsr.$body.removeClass('active-sub-menu');
			}

		}


	});

	// console.log(rootMenu);

});
