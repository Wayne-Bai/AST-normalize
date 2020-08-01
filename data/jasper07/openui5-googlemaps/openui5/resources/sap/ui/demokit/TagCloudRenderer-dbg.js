/*!
 * SAP UI development toolkit for HTML5 (SAPUI5/OpenUI5)
 * (c) Copyright 2009-2014 SAP AG or an SAP affiliate company. 
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides default renderer for control sap.ui.demokit.TagCloud
jQuery.sap.declare("sap.ui.demokit.TagCloudRenderer");

/**
 * @class TagCloud renderer.
 * @static
 */
sap.ui.demokit.TagCloudRenderer = function() {
};


/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 * 
 * @param {sap.ui.core.RenderManager} oRenderManager the RenderManager that can be used for writing to the Render-Output-Buffer
 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
 */
sap.ui.demokit.TagCloudRenderer.render = function(oRenderManager, oControl){
	var rm = oRenderManager;
    rm.write("<div");
    rm.writeControlData(oControl);
    rm.addClass("sapUiTagCloud");
    rm.writeClasses();
    rm.write(">"); // div element
    
    var tags = oControl.getTags();
	if ( !tags || !tags.length ) {
		return;
	}
	
	//Compute min / max weight
	var fsMin = oControl.getMinFontSize(),
		fsScale = oControl.getMaxFontSize() - fsMin,
    	wMinMax = this.computeWeightRange(tags),
    	wMin = wMinMax.min,
    	wScale = wMinMax.max - wMin;

    var fontsize = wScale === 0 ? function(w) { return fsMin; } : function(w) {
        return fsMin + (w-wMin) / wScale * fsScale;
    };
    
    // render each tag.
	for (var i=0;i<tags.length;i++) {
	  var tag = tags[i];
	  rm.write("<span");
	  rm.writeElementData(tag);
	  rm.writeAttribute("class","sapUiTagCloudTextNormal");
	  if(tag.getTooltip_AsString()){
		  rm.writeAttributeEscaped("title",tag.getTooltip_AsString());
	  }
	  //Compute font size relative to weight
	  rm.writeAttribute("style","font-size:"+fontsize(tag.getWeight())+"px;");
	  rm.write(">"); // span element
	  rm.writeEscaped(tag.getText());
	  rm.write("</span>"); // span element
	}
    
    rm.write("</div>"); // div element
};

sap.ui.demokit.TagCloudRenderer.computeWeightRange = function(tags){
	var min=tags[0].getWeight(), max=min;
	for (var i=1; i<tags.length; i++) {
		var w = tags[i].getWeight();
		if (w > max){max = w;}
		if (w < min){min = w;}
	}
	return {min:min, max:max};
};

