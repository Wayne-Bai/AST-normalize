/*!
 * SAP UI development toolkit for HTML5 (SAPUI5/OpenUI5)
 * (c) Copyright 2009-2015 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global', './InputBaseRenderer', 'sap/ui/core/Renderer'],
	function(jQuery, InputBaseRenderer, Renderer) {
		"use strict";

		/**
		 * ComboBox renderer.
		 *
		 * @namespace
		 */
		var ComboBoxRenderer = Renderer.extend(sap.m.ComboBoxBaseRenderer);

		/**
		 * CSS class to be applied to the root element of the ComboBox.
		 *
		 * @readonly
		 * @const {string}
		 */
		ComboBoxRenderer.CSS_CLASS = "sapMComboBox";

		/**
		 * Add classes to the ComboBox.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
		ComboBoxRenderer.addOuterClasses = function(oRm, oControl) {
			var CSS_CLASS = ComboBoxRenderer.CSS_CLASS;
			sap.m.ComboBoxBaseRenderer.addOuterClasses.apply(this, arguments);
			oRm.addClass(CSS_CLASS);
			oRm.addClass(CSS_CLASS + "Input");
		};

		/**
		 * Add inner classes to the ComboBox's input element.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
		ComboBoxRenderer.addInnerClasses = function(oRm, oControl) {
			sap.m.ComboBoxBaseRenderer.addInnerClasses.apply(this, arguments);
			oRm.addClass(ComboBoxRenderer.CSS_CLASS + "InputInner");
		};

		return ComboBoxRenderer;

	}, /* bExport= */ true);