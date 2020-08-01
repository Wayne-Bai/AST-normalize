/*!
 * SAP UI development toolkit for HTML5 (SAPUI5/OpenUI5)
 * (c) Copyright 2009-2015 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides control sap.ui.layout.form.FormContainer.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Element', 'sap/ui/core/EnabledPropagator', 'sap/ui/core/theming/Parameters', 'sap/ui/layout/library'],
	function(jQuery, Element, EnabledPropagator, Parameters, library) {
	"use strict";



	/**
	 * Constructor for a new form/FormContainer.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Used to group form elements.
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version 1.26.9
	 *
	 * @constructor
	 * @public
	 * @since 1.16.0
	 * @alias sap.ui.layout.form.FormContainer
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FormContainer = Element.extend("sap.ui.layout.form.FormContainer", /** @lends sap.ui.layout.form.FormContainer.prototype */ { metadata : {

		library : "sap.ui.layout",
		properties : {

			/**
			 * Group is expanded.
			 * This property works only if the Container is expandable.
			 */
			expanded : {type : "boolean", group : "Misc", defaultValue : true},

			/**
			 * Defines if the Container is expandable.
			 * The expander icon will only be shown if a title is set for the Container.
			 */
			expandable : {type : "boolean", group : "Misc", defaultValue : false},

			/**
			 * Invisible FormContainers are not rendered.
			 */
			visible : {type : "boolean", group : "Misc", defaultValue : true}
		},
		defaultAggregation : "formElements",
		aggregations : {

			/**
			 * Elements of the FormContainer.
			 */
			formElements : {type : "sap.ui.layout.form.FormElement", multiple : true, singularName : "formElement"},

			/**
			 * Title element of the Container. Can either be a Label object, or a simple string.
			 */
			title : {type : "sap.ui.core.Title", altTypes : ["string"], multiple : false}
		}
	}});

	/**
	 * This file defines behavior for the control,
	 */


	//sap.ui.core.EnabledPropagator.call(sap.ui.layout.form.FormContainer.prototype);

	(function() {

		FormContainer.prototype.init = function(){

			this._rb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.layout");

		};

		FormContainer.prototype.exit = function(){

			if (this._oExpandButton) {
				this._oExpandButton.destroy();
				delete this._oExpandButton;
			}
			this._rb = undefined;

		};

		FormContainer.prototype.setExpandable = function(bExpandable){

			this.setProperty("expandable", bExpandable);

			if (bExpandable) {
				var that = this;
				if (!this._oExpandButton) {
					this._oExpandButton = sap.ui.layout.form.FormHelper.createButton(this.getId() + "--Exp", _handleExpButtonPress, that);
					this._oExpandButton.setParent(this);
				}
				_setExpanderIcon(that);
			}

			return this;

		};

		FormContainer.prototype.setExpanded = function(bExpanded){

			this.setProperty("expanded", bExpanded, true); // no automatic rerendering

			var that = this;
			_setExpanderIcon(that);

			var oForm = this.getParent();
			if (oForm && oForm.toggleContainerExpanded) {
				oForm.toggleContainerExpanded(that);
			}

			return this;

		};

		/*
		 * If onAfterRendering of a field is processed the Form (layout) might need to change it.
		 */
		FormContainer.prototype.contentOnAfterRendering = function(oFormElement, oControl){

			// call function of parent (if assigned)
			var oParent = this.getParent();
			if (oParent && oParent.contentOnAfterRendering) {
				oParent.contentOnAfterRendering( oFormElement, oControl);
			}

		};

		/*
		 * If LayoutData changed on control this may need changes on the layout. So bubble to the form
		 */
		FormContainer.prototype.onLayoutDataChange = function(oEvent){

			// call function of parent (if assigned)
			var oParent = this.getParent();
			if (oParent && oParent.onLayoutDataChange) {
				oParent.onLayoutDataChange(oEvent);
			}

		};

		/*
		 * Checks if properties are fine
		 * Expander only visible if title is set -> otherwise give warning
		 * @return 0 = no problem, 1 = warning, 2 = error
		 * @private
		 */
		FormContainer.prototype._checkProperties = function(){

			var iReturn = 0;

			if (this.getExpandable() && !this.getTitle()) {
				jQuery.sap.log.warning("Expander only displayed if title is set", this.getId(), "FormContainer");
				iReturn = 1;
			}

			return iReturn;

		};

		function _setExpanderIcon(oContainer){

			if (!oContainer._oExpandButton) {
				return;
			}

			var sIcon, sIconHovered, sText, sTooltip;

			if (oContainer.getExpanded()) {
				sIcon = Parameters.get('sapUiFormContainerColImageURL');
				sIconHovered = Parameters.get('sapUiFormContainerColImageDownURL');
				sText = "-";
				sTooltip = oContainer._rb.getText("FORM_COLLAPSE");
			} else {
				sIcon = Parameters.get('sapUiFormContainerExpImageURL');
				sIconHovered = Parameters.get('sapUiFormContainerExpImageDownURL');
				sText = "+";
				sTooltip = oContainer._rb.getText("FORM_EXPAND");
			}

			if (sIcon) {
				sIcon = jQuery.sap.getModulePath("sap.ui.layout", '/') + "themes/" + sap.ui.getCore().getConfiguration().getTheme() + sIcon;
				sText = "";
			}
			if (sIconHovered) {
				sIconHovered = jQuery.sap.getModulePath("sap.ui.layout", '/') + "themes/" + sap.ui.getCore().getConfiguration().getTheme() + sIconHovered;
			}
			sap.ui.layout.form.FormHelper.setButtonContent(oContainer._oExpandButton, sText, sTooltip, sIcon, sIconHovered);

		}

		function _handleExpButtonPress(oEvent){

			this.setExpanded(!this.getExpanded());

		}

	}());

	return FormContainer;

}, /* bExport= */ true);
