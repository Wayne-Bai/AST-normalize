/*!
 * SAP UI development toolkit for HTML5 (SAPUI5/OpenUI5)
 * (c) Copyright 2009-2015 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	/**
	 * BusyDialog renderer. 
	 * @namespace
	 */
	var BusyDialogRenderer = {
	};
	
	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * 
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	BusyDialogRenderer.render = function(oRm, oControl){
		// write the HTML into the render manager
		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.addClass("sapMBusyDialog sapMCommonDialog");
		if (jQuery.device.is.iphone) {
			oRm.addClass("sapMDialogHidden");
		}
		
		if (!oControl.getText() && !oControl.getTitle() && !oControl.getShowCancelButton()) {
			oRm.addClass("sapMBusyDialogSimple");
		}
	
		// test dialog with sap-ui-xx-formfactor=compact
		if (sap.m._bSizeCompact) {
			oRm.addClass("sapUiSizeCompact");
		}
	
		oRm.writeClasses();
		var sTooltip = oControl.getTooltip_AsString();
		if (sTooltip) {
			oRm.writeAttributeEscaped("title", sTooltip);
		}
		oRm.write(">");
		if (oControl.getTitle()) {
			oRm.write("<header class=\"sapMDialogTitle\">");
			oRm.writeEscaped(oControl.getTitle());
			oRm.write("</header>");
		}
	
		oRm.renderControl(oControl._oLabel);
		oRm.renderControl(oControl._busyIndicator);
	
		if (oControl.getShowCancelButton()) {
			if (sap.ui.Device.system.phone) {
				oRm.write("<footer class='sapMBusyDialogFooter sapMFooter-CTX'>");
				oRm.renderControl(oControl._oButton);
				oRm.write("</footer>");
			} else {
				oRm.renderControl(oControl._oButtonToolBar);
			}
		}
		oRm.write("</div>");
	};
	

	return BusyDialogRenderer;

}, /* bExport= */ true);
