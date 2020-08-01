/* ========================================================================
 * site.js v0.0.1
 * Use the light-responsive for the demo site.
 * ========================================================================
 * Copyright 2015 by Phat Ly
 * Licensed under MIT (https://github.com/phatly27/light-responsive-js/master/src/demo/js/site.js)
 * ======================================================================== */

/**
 * Check the required jQuery library.
 * @param  {String} typeof jQuery        type name of jQuery object
 * @return {avoid}                       return nothing 
 */
if (typeof jQuery === 'undefined') {
  throw new Error('Demo\'s JavaScript requires jQuery')
}

/**
 * Create a closure for the specified jQuery
 * @param  {Object} $ jQuery
 * @return {avoid}    return nothing
 */
(function ($) {
	$(function () {

		/**
		 * Responsive the essential elements for the global website
		 */
		$('#demo-wrapper').responsive();
		$('#demo-content-func-main > table *').responsive();

		/**
		 * Define the demo sidebar right ref id
		 * @type {String}
		 */
		var sidebarRightRefAttr = 'demo-sidebar-right-ref-id';

		/**
		 * Bind to the click event to handle the sidebar right.
		 */
		$('[{0}]:not([{0}=""])'.replace('{0}', sidebarRightRefAttr).replace('{0}', sidebarRightRefAttr))
			.unbind('click').bind('click', function () {

			/**
			 * Get the sidebar element
			 * @type {Object}
			 */
			var $sidebar = $('#' + $(this).attr(sidebarRightRefAttr));

			/**
			 * Remove before creating a new one
			 */
			$('.demo-bg-mask').remove();

			/**
			 * Animate to show the sidebar right
			 */			
			$sidebar.animate({ right: '+=300px'}, 'fast', function () {

				/**
				 * Add the background mask to body to overlap all remaining ones
				 * @type {String}
				 */
				$('body').append('<div class="demo-bg-mask" mq-min-width-769px-add-class="demo-hide"></div>');

				/**
				 * Responsive immediately after being created
				 */
				$('.demo-bg-mask').responsive();

				/**
				 * When the user clicks on the background mask,
				 * then remove it to show all remaining ones
				 * and animate the sidebar to hide it
				 */
				$('body').on('click', '.demo-bg-mask', function () {

					/**
					 * Remove the background mask
					 */
					$('.demo-bg-mask').remove();

					/**
				 	 * Animate to hide the sidebar right
				 	 */
					$sidebar.animate({ right: '-=300px'}, 'fast', function () {
						/**
						 * Remove the unnecessary style
						 */
						$(this).removeAttr('style');
					});
				});
			});
		});
	});
}(jQuery));