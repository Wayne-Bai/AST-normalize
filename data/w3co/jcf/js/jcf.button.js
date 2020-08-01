/*!
 * JavaScript Custom Forms : Button Module
 *
 * Copyright 2014-2015 PSD2HTML - http://psd2html.com/jcf
 * Released under the MIT license (LICENSE.txt)
 *
 * Version: 1.1.1
 */
;(function($) {
	'use strict';

	jcf.addModule({
		name: 'Button',
		selector: 'button, input[type="button"], input[type="submit"], input[type="reset"]',
		options: {
			realElementClass: 'jcf-real-element',
			fakeStructure: '<span class="jcf-button"><span class="jcf-button-content"></span></span>',
			buttonContent: '.jcf-button-content'
		},
		matchElement: function(element) {
			return element.is(this.selector);
		},
		init: function() {
			this.initStructure();
			this.attachEvents();
			this.refresh();
		},
		initStructure: function() {
			this.page = $('html');
			this.realElement = $(this.options.element).addClass(this.options.realElementClass);
			this.fakeElement = $(this.options.fakeStructure).insertBefore(this.realElement);
			this.buttonContent = this.fakeElement.find(this.options.buttonContent);

			this.fakeElement.css({
				position: 'relative'
			});
			this.realElement.prependTo(this.fakeElement).css({
				position: 'absolute',
				opacity: 0
			});
		},
		attachEvents: function() {
			this.realElement.on({
				focus: this.onFocus,
				'jcf-pointerdown': this.onPress
			});
		},
		onPress: function() {
			this.fakeElement.addClass(this.options.pressedClass);
			this.page.on('jcf-pointerup', this.onRelease);
		},
		onRelease: function() {
			this.fakeElement.removeClass(this.options.pressedClass);
			this.page.off('jcf-pointerup', this.onRelease);
		},
		onFocus: function() {
			this.fakeElement.addClass(this.options.focusClass);
			this.realElement.on('blur', this.onBlur);
		},
		onBlur: function() {
			this.fakeElement.removeClass(this.options.focusClass);
			this.realElement.off('blur', this.onBlur);
		},
		refresh: function() {
			this.buttonContent.html(this.realElement.html() || this.realElement.val());
			this.fakeElement.toggleClass(this.options.disabledClass, this.realElement.is(':disabled'));
		},
		destroy: function() {
			this.realElement.removeClass(this.options.realElementClass).insertBefore(this.fakeElement);
			this.fakeElement.remove();

			this.realElement.off({
				focus: this.onFocus,
				blur: this.onBlur,
				'jcf-pointerdown': this.onPress
			});

			this.realElement.css({
				position: '',
				opacity: ''
			});
		}
	});

}(jQuery));
