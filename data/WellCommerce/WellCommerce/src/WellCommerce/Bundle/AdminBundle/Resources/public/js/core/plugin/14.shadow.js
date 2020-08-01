/*
* SHADOW
* Adds a nice shadow to the given element.
*/

var oDefaults = {
	oClasses: {
		sNE: 'shadow-ne',
		sSE: 'shadow-se',
		sSW: 'shadow-sw',
		sS: 'shadow-s',
		sE: 'shadow-e'
	}
};

var GShadow = function() {
	
	var gThis = this;
	
	this._Constructor = function() {
		$(gThis).append('<span class="' + gThis.m_oOptions.oClasses.sNE + '"/>');
		$(gThis).append('<span class="' + gThis.m_oOptions.oClasses.sSE + '"/>');
		$(gThis).append('<span class="' + gThis.m_oOptions.oClasses.sSW + '"/>');
		$(gThis).append('<span class="' + gThis.m_oOptions.oClasses.sS + '"/>');
		$(gThis).append('<span class="' + gThis.m_oOptions.oClasses.sE + '"/>');
	};
	
	gThis._Constructor();
	
};

new GPlugin('GShadow', oDefaults, GShadow);