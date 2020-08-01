/* @preserve
 * Mobile first responsive menu
 * Copyright 2014 Robin Poort
 * http://www.robinpoort.com
 */

"use strict";

(function($) {

    // Check the position of elements in the markup
    $.fn.isAfter = function(elem) {
        if(typeof(elem) == "string") elem = $(elem);
        return this.add(elem).index(elem) == 0;
    }

    $.responsiveMenu = function(element, options) {

        var defaults = {
            parentElement: $(element).parent(),
            menuElement: $(element),
            toggleWidth: 600,
            toggleButtonClass: 'menu_toggle_button',
            toggleButtonNameClosed: '≡',
            toggleButtonNameOpen: '&times;',
            toggleButtonLocation: 'before',
            subToggleClass: 'sub_toggle',
            subToggleNameClosed: '+',
            subToggleNameOpen: '-',
            subToggleLocation: 'after',
            subToggleListClass: 'rm-subMenu',
            classNameClosed: 'rm-closed',
            classNameOpen: 'rm-open',
            animations: true,
            animationSpeed: 200,
            scrollTopDuration: 1,
            clickAside: false,
            keyboard: false,
            fixedMenu: false
        },
        plugin = this;

        plugin.settings = {}

        var $element = $(element),
            element = element;

        plugin.init = function() {

            plugin.settings = $.extend({}, defaults, options);

            // Accessible show and hide functions
            $.fn.accessibleHide = function() {
                this.addClass('accessible-hide');
            }
            $.fn.accessibleShow = function() {
                this.removeClass('accessible-hide');
            }


            // Inital set menu to closed
            $element.addClass('menu--closed');


            // Check if the main toggle button exists and if not create it
            if( !$(plugin.settings.toggleButtonClass).length ) {
                // Creating the toggle button
                var toggleButtonMarkup = '<div class="' + plugin.settings.toggleButtonClass + ' ' + plugin.settings.classNameClosed +'">' + plugin.settings.toggleButtonNameClosed + '</div>';
                if (plugin.settings.toggleButtonLocation == "after") {
                    $(plugin.settings.menuElement).after(toggleButtonMarkup).parent().find('.' + plugin.settings.toggleButtonClass).accessibleHide();
                } else {
                    $(plugin.settings.menuElement).before(toggleButtonMarkup).parent().find('.' + plugin.settings.toggleButtonClass).accessibleHide();
                }
            }


            // Check if the sub toggle buttons exists and if not create them
            if( !$(plugin.settings.subToggleClass).length ) {
                // Creating the sub toggle buttons
                var subToggleMarkup = '<span class="' + plugin.settings.subToggleClass + ' ' + plugin.settings.classNameClosed + '">' + plugin.settings.subToggleNameClosed + '</span>';
                if (plugin.settings.subToggleLocation == "before") {
                    $(plugin.settings.menuElement).find('li').has('ul').find('>a').before(subToggleMarkup).find(plugin.settings.subToggleClass).accessibleHide();
                } else {
                    $(plugin.settings.menuElement).find('li').has('ul').find('>a').after(subToggleMarkup).find(plugin.settings.subToggleClass).accessibleHide();
                }
            }


            // Check if the menu is fixed and if so check if sticky-parent already exists
            if( plugin.settings.fixedMenu ) {
                if( !$('.sticky-parent').length ) {
                    $(plugin.settings.parentElement).wrap('<div class="sticky-parent"></div>');
                }
            }


            // Setting vars
            var menuElem = plugin.settings.menuElement,
                menuSubElem = $(menuElem).find('li>ul'),
                toggleButton = $(menuElem).siblings('.' + plugin.settings.toggleButtonClass),
                subToggle = $(menuElem).find('.' + plugin.settings.subToggleClass),
                animationSpeed = plugin.settings.animationSpeed;


            // Set the animationspeed to 1 if animations are not being used
            if ( plugin.settings.animations == false ) {
                animationSpeed = 1;
            }



            // Add appropriate classes
            function addBodyClass(width) {
                if( width < plugin.settings.toggleWidth ) {
                    $element.removeClass('menu--unfolded').addClass('menu--folded');
                } else {
                    $element.removeClass('menu--folded').addClass('menu--unfolded');
                }
            }


            // Fixed menu
            function fixedMenu() {
                if ( plugin.settings.fixedMenu ) {
                    $element.addClass('menu--fixed')
                    var menuHeight = plugin.settings.parentElement.outerHeight();
                    $('.sticky-parent').css('height', menuHeight);
                    $('body').css('padding-top', menuHeight);
                }
            }


            // Toggle button action
            function toggleButtons(width) {
                // Before Menu Hide
                if (plugin.settings.beforeMenuHide) { plugin.settings.beforeMenuHide(); }
                // If screen size is small
                if( width < plugin.settings.toggleWidth ) {
                    // Main toggle
                    if (toggleButton.hasClass(plugin.settings.classNameClosed)) {
                        $(menuElem).accessibleHide();
                    }
                    if (toggleButton.hasClass('accessible-hide')) {
                        toggleButton.accessibleShow();
                    }
                    // Sub toggle
                    if (!subToggle.hasClass(plugin.settings.classNameOpen)) {
                        $(menuSubElem).accessibleHide();
                    }
                    if (subToggle.hasClass('accessible-hide')) {
                        subToggle.accessibleShow();
                    }
                }
                // If screen size is big
                if( width >= plugin.settings.toggleWidth ) {

                    // Setting submenus to hide as standard when getting back smaller
                    subToggle.removeClass(plugin.settings.classNameOpen).addClass(plugin.settings.classNameClosed).html(plugin.settings.subToggleNameClosed);

                    // Main toggle
                    $(menuElem).accessibleShow();
                    toggleButton.accessibleHide();

                    // Sub toggle
                    if ($(menuSubElem).hasClass('accessible-hide')) {
                        $(menuSubElem).accessibleShow();
                    }
                    subToggle.accessibleHide();
                }
                // After Menu Hide
                if (plugin.settings.afterMenuHide) { plugin.settings.afterMenuHide(); }
            }


            // Run again on window resize and ready
            $(window).on('resize ready', function(event) {
                // Get the window width or get the body width as a fallback
                var width = event.target.innerWidth || $('body').width();
                // Functions
                addBodyClass(width);
                toggleButtons(width);
                fixedMenu();
            });


            function showMainLevel() {
                $(menuElem).accessibleShow();
                $(menuElem).hide().slideDown(animationSpeed, function() {
                    $(menuElem).removeAttr('style');
                    // After Main toggle
                    if (plugin.settings.afterMainToggle) { plugin.settings.afterMainToggle(); }
                    $element.removeClass('menu--closed').addClass('menu--open');
                    $(window).trigger('resize');
                    // When element is larger than window
                    var windowHeight = $(window).height(),
                        elementHeight = $element.outerHeight(),
                        parentHeight = plugin.settings.parentElement.height();
                    if ( elementHeight >= windowHeight && plugin.settings.fixedMenu ) {
                        $('body').addClass('menu-too-big--body');
                        $element.addClass('menu-too-big').css({'max-height': windowHeight-parentHeight});
                    }
                });
                $(toggleButton).removeClass(plugin.settings.classNameClosed).addClass(plugin.settings.classNameOpen).html(plugin.settings.toggleButtonNameOpen);
            }


            function hideMainLevel() {
                $(menuElem).slideUp(animationSpeed, function() {
                    $(menuElem).removeAttr('style');
                    $(menuElem).accessibleHide();
                    // After Main toggle
                    if (plugin.settings.afterMainToggle) { plugin.settings.afterMainToggle(); }
                    $element.removeClass('menu--open').addClass('menu--closed');
                    $(window).trigger('resize');
                    // When element is larger than window
                    if ( $element.hasClass('menu-too-big') ) {
                        $('body').removeClass('menu-too-big--body');
                        $element.css({'max-height': 'none'});
                    }
                });
                $(toggleButton).removeClass(plugin.settings.classNameOpen).addClass(plugin.settings.classNameClosed).html(plugin.settings.toggleButtonNameClosed);
            }


            function showSubLevel(subElem) {
                subElem.siblings('ul').accessibleShow();
                subElem.siblings('ul').hide().slideDown(animationSpeed, function() {
                    $(this).removeAttr('style');
                    // After Sub toggle
                    if (plugin.settings.afterSubToggle) { plugin.settings.afterSubToggle(); }
                    $(window).trigger('resize');
                });
                subElem.removeClass(plugin.settings.classNameClosed).addClass(plugin.settings.classNameOpen).html(plugin.settings.subToggleNameOpen);
            }


            function hideSubLevel(subElem) {
                subElem.siblings('ul').slideUp(animationSpeed, function() {
                    $(this).removeAttr('style').accessibleHide();
                    // After Sub toggle
                    if (plugin.settings.afterSubToggle) { plugin.settings.afterSubToggle(); }
                    $(window).trigger('resize');
                });
                subElem.removeClass(plugin.settings.classNameOpen).addClass(plugin.settings.classNameClosed).html(plugin.settings.subToggleNameClosed);
            }


            // Use the toggle button
            toggleButton.click(function() {
                // Before Main toggle
                if (plugin.settings.beforeMainToggle) { plugin.settings.beforeMainToggle(); }
                if ($(menuElem).hasClass('accessible-hide')) {
                    showMainLevel();
                } else {
                    hideMainLevel();
                }
            });


            // Use the sub toggle button
            subToggle.click(function() {
                // Before Sub toggle
                if (plugin.settings.beforeSubToggle) { plugin.settings.beforeSubToggle(); }
                if ($(this).siblings('ul:not(.accessible-hide)').length) {
                    var subElem = $(this);
                    hideSubLevel(subElem);
                } else if ($(this).siblings('ul').hasClass('accessible-hide')) {
                    var subElem = $(this);
                    showSubLevel(subElem);
                }
            });


            // Clicking outside of the menu area to close all open menus
            if ( plugin.settings.clickAside ) {
                $(document).click(function() {
                    // Before Main toggle
                    if (plugin.settings.beforeMainToggle) { plugin.settings.beforeMainToggle(); }
                    // Hide the menu
                    if ($(menuElem).hasClass('menu--open')) {
                        hideMainLevel();
                    }
                });

                plugin.settings.parentElement.add(plugin.settings.menuElement).add('.menu_toggle_button').click(function(event){
                    event.stopPropagation();
                });
            }


            // Using the esc key to close all open menus
            if ( plugin.settings.keyboard ) {
                $(document).bind('keydown', function(e) {
                    if (e.which == 27) {
                        hideMainLevel();
                    }
                });
            }


            // Anchor linking function. Add pixels when menu is fixed
            function anchorLink(element) {
                // Prevent default behaviour
                event.preventDefault();

                // Setting variables
                var original_target = element,
                    target = $(original_target),
                    scrollTopAmount = Math.ceil(target.offset().top),
                    scrollUntilHeight2 = 0,
                    scrollUntilHeight = 0;

                // Add or reduce height from scrollTop
                $('.sticky-parent').each(function () {
                    // Add height
                    if ( target.isAfter( $(this) ) ) {
                        scrollUntilHeight2 += $(this).outerHeight();
                    }
                    scrollUntilHeight = scrollUntilHeight2;
                })
                scrollTopAmount -= scrollUntilHeight;
                window.location.hash = original_target;
                $('html,body').animate({scrollTop: scrollTopAmount }, plugin.settings.scrollTopDuration);
            }


            // When clicking on anchor links or when there's a has in the URL
            if( $('.sticky-parent').length ) {
                // Anchor links
                $('a[href*=#]:not([href=#])').click(function() {
                    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
                        var element = $(this).prop('hash');
                        anchorLink(element);
                    }
                });
                // Window.location.hash
                $(window).load(function() {
                    if(window.location.hash) {
                        var element = window.location.hash;
                        anchorLink(element);
                    }
                });
            }
        }

        plugin.init();

    }


    // add the plugin to the jQuery.fn object
    $.fn.responsiveMenu = function(options) {
        // iterate through the DOM elements we are attaching the plugin to
        return this.each(function() {
            // if plugin has not already been attached to the element
            if (undefined == $(this).data('responsiveMenu')) {
                // create a new instance of the plugin
                var plugin = new $.responsiveMenu(this, options);
                // in the jQuery version of the element
                // store a reference to the plugin object
                $(this).data('responsiveMenu', plugin);
            }
        });
    }

})(jQuery);