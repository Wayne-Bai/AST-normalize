//	Responsive Toggle v1.2, Copyright 2014, Joe Mottershaw, https://github.com/joemottershaw/
//	=========================================================================================

	$(document).ready(function() {
		// Initiate
			$('.responsive-toggle').each(function() {
				// Hide panels
					$('.responsive-toggle-panel', this).hide();

				// Set Expand/Collapse Icons
					$('.responsive-toggle-minus', this).hide();

				// Bind the click event handler
					$('.responsive-toggle-head').click(function(e) {
						// Toggle head
							$(this).toggleClass('active');

						// Toggle icons
							var thisPlus	=	$(this).find('.responsive-toggle-plus').toggle();
							var thisMinus	=	$(this).find('.responsive-toggle-minus').toggle();

						// Toggle panel
							$(this).next('.responsive-toggle-panel').toggleClass('active').slideToggle();
					});
			});
	});