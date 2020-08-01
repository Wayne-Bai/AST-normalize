/*
* HELP
*/

var GHelp = function() {
	
	var gThis = this;

	gThis.OnContentLoaded = GEventHandler(function(eEvent) {

		gThis.m_sContent.html(eEvent.sContent);
		gThis.bLoaded = true;
	});
	
	gThis._OnExpandHelp = GEventHandler(function(eEvent) {

		gThis.m_sContent.slideToggle('fast');
		
		if(gThis.bLoaded == false){
			
			xajax_getHelpForPage ({
				sController: GCore.sCurrentController,
				sAction: GCore.sCurrentAction
			}, GCallback(gThis.OnContentLoaded));
			
		}
		
		return false;
	});
	
	gThis.MakeHelpButton = function() {
		gThis.bLoaded = false;
		gThis.m_jLi = $('<li>');
		gThis.m_jA = $('<a class="button" href="#"/>');
		gThis.m_jA.append('<span><img src="'+GCore.DESIGN_PATH+'images/icons/buttons/help.png" alt=""/>' + GForm.Language.help + '</span>');
		gThis.m_jA.appendTo(gThis.m_jLi);	
		gThis.m_jLi.appendTo($('.possibilities'));
		gThis.m_jA.bind('click', gThis._OnExpandHelp);
		gThis.m_sContent = $('<div></div>').addClass('block').html('<p>Trwa wczytywanie pomocy...</p>');
		gThis.m_sContent.insertAfter($('.possibilities'));
		gThis.m_sContent.hide();
	};
	
	gThis.MakeHelpButton();
	
};

new GPlugin('GHelp', oDefaults, GHelp);