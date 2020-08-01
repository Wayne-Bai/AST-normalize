/*!
 * SAP UI development toolkit for HTML5 (SAPUI5/OpenUI5)
 * (c) Copyright 2009-2015 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global', './InputRenderer', 'sap/ui/core/Renderer'],
	function(jQuery, InputRenderer, Renderer) {
	"use strict";


	/**
	 * MultiInput renderer.
	 * @namespace
	 */
	var MultiInputRenderer = Renderer.extend(InputRenderer);
	
	MultiInputRenderer.openInputTag = function(oRm, oControl) {
		oRm.write("<div id=\"" + oControl.getId() + "-border\" class=\"sapMMultiInputBorder\">");
	
		MultiInputRenderer._renderTokens(oRm, oControl);
		
		MultiInputRenderer._renderInput(oRm, oControl);
	};
	
	MultiInputRenderer._renderTokens = function(oRm, oControl) {
		oRm.renderControl(oControl._tokenizer);
	};
	
	MultiInputRenderer._renderInput = function(oRm, oControl) {
		oRm.write("<div class=\"sapMMultiInputInputContainer\">");
		InputRenderer.openInputTag.call(this, oRm, oControl);
	};
	
	MultiInputRenderer.closeInputTag = function(oRm, oControl) {
		InputRenderer.closeInputTag.call(this, oRm, oControl);
		oRm.write("</div>");
		oRm.write("</div>");
		oRm.write("<div class=\"sapMMultiInputShadowDiv\"/>");
	};

	return MultiInputRenderer;

}, /* bExport= */ true);
