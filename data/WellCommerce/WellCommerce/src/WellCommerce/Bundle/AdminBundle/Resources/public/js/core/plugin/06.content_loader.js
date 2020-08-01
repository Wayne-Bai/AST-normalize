/*
* CONTENT LOADER
* AJAX-based remote content loader.
*/

var oDefaults = {
	oParams: {},
	sSource: '',
	oClasses: {
		sLoadingClass: 'preloader'
	}
};

var GContentLoader = function() {
	
	var gThis = this;
	
	gThis.m_jHolder;
	
	gThis._Constructor = function() {
		gThis.m_jHolder = $('<div/>');
		$(gThis).append($('<div class="' + gThis._GetClass('Loading') + '"/>').css('display', 'none').fadeIn(150));
		gThis.m_jHolder.load(gThis.m_oOptions.sSource, gThis.m_oOptions.oParams, gThis.Loaded);
	};
	
	gThis.Loaded = GEventHandler(function(eEvent) {	
		$(gThis).find('.' + gThis._GetClass('Loading')).stop(true, false).fadeOut(150, function() {
			$(gThis).empty().html(gThis.m_jHolder.html()).css('opacity', 0).animate({
				opacity: 1
			}, 150);
			$(gThis).find('.block').GBlock();
			$(gThis).find('.box').GBox();
			$(gThis).find('select').GSelect();
		});
	});
	
	gThis._Constructor();
	
};

new GPlugin('GContentLoader', oDefaults, GContentLoader);