/*jslint browser: true*/
/*global $, $, Modernizr, FastClick, enquire */

/*
Use the comment-based directives to compress and minify all js files into one
*/

// @depends lib/media.match.min.js
// @depends lib/jquery-1.8.3.min.js
// @depends lib/enquire.min.js
// @depends lib/appendAround.js
// @depends lib/fastclick.js
// @depends lib/galleria/galleria-1.2.9.min.js
// @depends lib/jquery.validate.min.js
// @depends lib/jquery.fitvids.min.js
// @depends lib/jquery.foundation.forms.js
// @depends lib/ajaxPagination.js

$(document).ready(function () {

	$(".append-around").appendAround();

	$('body').addClass('js');

	$(".toTop").click(function(event){
		event.preventDefault();
		$('html,body').animate({scrollTop:0}, 500);
	});

	enableListColourMarkers();

	// Hide address bar on mobile devices (except if #hash present, so we don't mess up deep linking).
	if ( Modernizr.touch && !window.location.hash ) {
		$(window).load(function () {
		  setTimeout(function () {
		    // At load, if user hasn't scrolled more than 20px or so...
				if( $(window).scrollTop() < 20 ) {
		      window.scrollTo(0, 1);
		    }
		  }, 0);
		});
	}

	//Add the fast click events if touch is enabled
	if( Modernizr.touch ) {
		// Instantiate FastClick
		window.addEventListener('load', function() {
		    var ft = new FastClick(document.body);
		}, false);
	}

	//Add placeholder support for IE9 below browsers
	if(!Modernizr.input.placeholder){

		$('[placeholder]').focus(function() {
		  var input = $(this);
		  if (input.val() == input.attr('placeholder')) {
			input.val('');
			input.removeClass('placeholder');
		  }
		}).blur(function() {
		  var input = $(this);
		  if (input.val() == '' || input.val() == input.attr('placeholder')) {
			input.addClass('placeholder');
			input.val(input.attr('placeholder'));
		  }
		}).blur();
		$('[placeholder]').parents('form').submit(function() {
		  $(this).find('[placeholder]').each(function() {
			var input = $(this);
			if (input.val() == input.attr('placeholder')) {
			  input.val('');
			}
		  })
		});

	}

	/********************************************
		- All functionality that requires responsive
		Should be included here
	*********************************************/
	enquire.register("screen and (min-width:320px) and (max-width:739px)", {
		match: function() {
			/*
			First de register all events in mobile view (This should be called in the unmatch function for enquire.register but there currently is a bug
			which does not preserve the order of unmatch then match when changing to the different media queries ).
			This will be resolved in V2 as stated here https://github.com/WickyNilliams/enquire.js/issues/29
			*/
			$('.toggleBtn.search').off('click');

			activateMobileMenu();
			activateMobileSearch();
			activateMobileFooterLinks();
		}
	});

	enquire.register("screen and (min-width:768px)", {

		match: function() {
			/*
			First de register all events in mobile view (This should be called in the unmatch function for enquire.register but there currently is a bug
			which does not preserve the order of unmatch then match when changing to the different media queries ).
			This will be resolved in V2 as stated here https://github.com/WickyNilliams/enquire.js/issues/29
			*/

			deactivateMobileFooterLinks();

			$('#menu-link').off('click');
			$('.parent > a').off('click');

			$('.toggleBtn.search').on("click", function(e){
				e.preventDefault();
				var sForm = $('.header-search-form');
				sForm.submit();
			});

			//fcbNav function
			justifiedMenu($('nav#menu'));

			$(window).resize(function(){
				justifiedMenu($('nav#menu'));
			});

		}
	});


	// Contact Form validation
	var contactForm = $('.form-contact-us').validate({
		rules: {
			firstName: "required",
			lastName: "required",
			email: {"required": true, email: true},
			comment: "required",
			phone: {"required": true, number: true}
		},
		messages: {
			firstName : 'Pleaser enter your first name.',
			lastName : 'Pleaser enter your First name.',
			email : 'Please enter a valid email address',
			comment: 'Please enter a comment',
			phone : 'Please enter your phone number in digits with no spaces between them.'
		},
        errorElement: "small"
	});

	// Submit contact form using custom button
	$('.form-contact-us .button-submit').on("click", function(e){
		e.preventDefault();

		if( $('.form-contact-us').valid() ) {
			$('.form-contact-us').submit();
		}
	});

	// Enable fit vids to
	$('.wrapper').fitVids();

	// Allow all close buttons to close the parent
	$('.close').on("click", function(){
		$(this).parent().remove();
	});

});



function activateMobileSearch() {
	/* toogle button for search */
	$('.toggleBtn.search').on("click", function(e){
		e.preventDefault();

		var sForm = $('.header-search-form');
		var sInput = $('.header-search-form .search');

		sForm.toggleClass('active');
		if(sForm.hasClass('active')) {
			sInput.focus();

			if( $('.toggleBtn.menu').hasClass('active') ) {
				$('.toggleBtn.menu').removeClass('active');
				$('#menu').removeClass('active');
			}
		}
	});
}

function activateMobileMenu() {
	/* Toggle button for menu */
	var $menu = $('#menu'),
	$menulink = $('#menu-link'),
	$menuTrigger = $('.parent > a');

	$menulink.on("click", function(e) {
		e.preventDefault();
		$menulink.toggleClass('active');
		$menu.toggleClass('active');

		if( $('.header-search-form').hasClass('active') ) {
			$('.header-search-form').removeClass('active');
		}
	});

	// This is setup to only show top level nav in mobile menu.
	// Script below will need more work	(e.preventdefault() stops the nav click event allowing sub menu to show)
	$menuTrigger.on("click", function(e) {
		//e.preventDefault();
		var $this = $(this);
		//$this.toggleClass('active').next('ul').toggleClass('active');
		//$this.toggleClass('active').next('ul').toggleClass('active');
	});
}

function justifiedMenu(queryObj){
	var nav = queryObj.children('ul');
	var navWidth = nav.outerWidth();
	var totalWidth = 0;
	var navChildrens = nav.children('li');
	var navAnchors = navChildrens.children('a');
	var numOfNavChildrens = navChildrens.length;
	var navULs = nav.find('ul');

	navChildrens.each(function(i) {
		totalWidth += $(this).outerWidth(true);
	});

	totalExpand = (navWidth - totalWidth) / numOfNavChildrens;
	roundedExpand =  parseInt(totalExpand);
	remainder = Math.floor((totalExpand - roundedExpand) * numOfNavChildrens);

	navAnchors.each(function(i) {

		width = roundedExpand + $(this).outerWidth(true);

		if(i === (numOfNavChildrens-1)) {
			width += remainder;
		}
		$(this).css({ width:width + "px" });

	});
}

function activateMobileFooterLinks(){
	$('.footerlinks h4 a, .footerlinks h4 span').on('click', function(){
		$('.footerlinks ul').hide();
		$(this).parent().siblings('ul').show();
		return false;
	});
}

function deactivateMobileFooterLinks(){
	$('.footerlinks h4 a, .footerlinks h4 span').off('click');
	$('.footerlinks ul').show();
}

function enableListColourMarkers(){
	$('.bodyContent li').each(function(){
		var listContent = $(this).html();
		if(listContent.search('span') < 0){
			$(this).html('<span>' + listContent + '</span>');
		}
	});
}

function justifiedFooterNavBlocksHeight(){
	var iMaxHeight = 0;
	$('.footerlinks .columns').each(function (){
		var iColumnHeight = $(this).height();
		if(iColumnHeight > iMaxHeight) iMaxHeight = iColumnHeight;
	});

	if(iMaxHeight > 0) $('.footerlinks .columns').height(iMaxHeight);
}

function deActivateJustifiedFooterNavBlocksHeight(){
	$('.footerlinks .columns').each(function (){
		$(this).height('auto');
	});
}
