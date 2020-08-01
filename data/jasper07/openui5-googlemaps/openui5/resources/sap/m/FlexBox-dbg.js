/*!
 * SAP UI development toolkit for HTML5 (SAPUI5/OpenUI5)
 * (c) Copyright 2009-2014 SAP AG or an SAP affiliate company. 
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.m.FlexBox.
jQuery.sap.declare("sap.m.FlexBox");
jQuery.sap.require("sap.m.library");
jQuery.sap.require("sap.ui.core.Control");


/**
 * Constructor for a new FlexBox.
 * 
 * Accepts an object literal <code>mSettings</code> that defines initial 
 * property values, aggregated and associated objects as well as event handlers. 
 * 
 * If the name of a setting is ambiguous (e.g. a property has the same name as an event), 
 * then the framework assumes property, aggregation, association, event in that order. 
 * To override this automatic resolution, one of the prefixes "aggregation:", "association:" 
 * or "event:" can be added to the name of the setting (such a prefixed name must be
 * enclosed in single or double quotes).
 *
 * The supported settings are:
 * <ul>
 * <li>Properties
 * <ul>
 * <li>{@link #getVisible visible} : boolean (default: true)</li>
 * <li>{@link #getHeight height} : sap.ui.core.CSSSize (default: '')</li>
 * <li>{@link #getWidth width} : sap.ui.core.CSSSize (default: '')</li>
 * <li>{@link #getDisplayInline displayInline} : boolean (default: false)</li>
 * <li>{@link #getDirection direction} : sap.m.FlexDirection (default: sap.m.FlexDirection.Row)</li>
 * <li>{@link #getFitContainer fitContainer} : boolean (default: false)</li>
 * <li>{@link #getRenderType renderType} : sap.m.FlexRendertype (default: sap.m.FlexRendertype.Div)</li>
 * <li>{@link #getJustifyContent justifyContent} : sap.m.FlexJustifyContent (default: sap.m.FlexJustifyContent.Start)</li>
 * <li>{@link #getAlignItems alignItems} : sap.m.FlexAlignItems (default: sap.m.FlexAlignItems.Stretch)</li></ul>
 * </li>
 * <li>Aggregations
 * <ul>
 * <li>{@link #getItems items} <strong>(default aggregation)</strong> : sap.ui.core.Control[]</li></ul>
 * </li>
 * <li>Associations
 * <ul></ul>
 * </li>
 * <li>Events
 * <ul></ul>
 * </li>
 * </ul> 

 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * The FlexBox control builds the container for a flexible box layout.
 * 
 * Browser support:
 * This control is not supported in Internet Explorer 9!
 * @extends sap.ui.core.Control
 *
 * @author SAP AG 
 * @version 1.20.7
 *
 * @constructor   
 * @public
 * @name sap.m.FlexBox
 */
sap.ui.core.Control.extend("sap.m.FlexBox", { metadata : {

	// ---- object ----

	// ---- control specific ----
	library : "sap.m",
	properties : {
		"visible" : {type : "boolean", group : "Appearance", defaultValue : true},
		"height" : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : ''},
		"width" : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : ''},
		"displayInline" : {type : "boolean", group : "Appearance", defaultValue : false},
		"direction" : {type : "sap.m.FlexDirection", group : "Appearance", defaultValue : sap.m.FlexDirection.Row},
		"fitContainer" : {type : "boolean", group : "Appearance", defaultValue : false},
		"renderType" : {type : "sap.m.FlexRendertype", group : "Misc", defaultValue : sap.m.FlexRendertype.Div},
		"justifyContent" : {type : "sap.m.FlexJustifyContent", group : "Appearance", defaultValue : sap.m.FlexJustifyContent.Start},
		"alignItems" : {type : "sap.m.FlexAlignItems", group : "Appearance", defaultValue : sap.m.FlexAlignItems.Stretch}
	},
	defaultAggregation : "items",
	aggregations : {
    	"items" : {type : "sap.ui.core.Control", multiple : true, singularName : "item"}
	}
}});


/**
 * Creates a new subclass of class sap.m.FlexBox with name <code>sClassName</code> 
 * and enriches it with the information contained in <code>oClassInfo</code>.
 * 
 * <code>oClassInfo</code> might contain the same kind of informations as described in {@link sap.ui.core.Element.extend Element.extend}.
 *   
 * @param {string} sClassName name of the class to be created
 * @param {object} [oClassInfo] object literal with informations about the class  
 * @param {function} [FNMetaImpl] constructor function for the metadata object. If not given, it defaults to sap.ui.core.ElementMetadata.
 * @return {function} the created class / constructor function
 * @public
 * @static
 * @name sap.m.FlexBox.extend
 * @function
 */


/**
 * Getter for property <code>visible</code>.
 * Is the control visible
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>visible</code>
 * @public
 * @name sap.m.FlexBox#getVisible
 * @function
 */

/**
 * Setter for property <code>visible</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bVisible  new value for property <code>visible</code>
 * @return {sap.m.FlexBox} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.FlexBox#setVisible
 * @function
 */


/**
 * Getter for property <code>height</code>.
 * The height of the FlexBox. Note that when a percentage is given, for the height to work as expected, the height of the surrounding container must be defined.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {sap.ui.core.CSSSize} the value of property <code>height</code>
 * @public
 * @since 1.9.1
 * @name sap.m.FlexBox#getHeight
 * @function
 */

/**
 * Setter for property <code>height</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {sap.ui.core.CSSSize} sHeight  new value for property <code>height</code>
 * @return {sap.m.FlexBox} <code>this</code> to allow method chaining
 * @public
 * @since 1.9.1
 * @name sap.m.FlexBox#setHeight
 * @function
 */


/**
 * Getter for property <code>width</code>.
 * The width of the FlexBox. Note that when a percentage is given, for the width to work as expected, the width of the surrounding container must be defined.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {sap.ui.core.CSSSize} the value of property <code>width</code>
 * @public
 * @since 1.9.1
 * @name sap.m.FlexBox#getWidth
 * @function
 */

/**
 * Setter for property <code>width</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {sap.ui.core.CSSSize} sWidth  new value for property <code>width</code>
 * @return {sap.m.FlexBox} <code>this</code> to allow method chaining
 * @public
 * @since 1.9.1
 * @name sap.m.FlexBox#setWidth
 * @function
 */


/**
 * Getter for property <code>displayInline</code>.
 * Determines whether the flexbox is in block or inline mode
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>displayInline</code>
 * @public
 * @name sap.m.FlexBox#getDisplayInline
 * @function
 */

/**
 * Setter for property <code>displayInline</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bDisplayInline  new value for property <code>displayInline</code>
 * @return {sap.m.FlexBox} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.FlexBox#setDisplayInline
 * @function
 */


/**
 * Getter for property <code>direction</code>.
 * Determines the direction of the layout of child elements
 *
 * Default value is <code>Row</code>
 *
 * @return {sap.m.FlexDirection} the value of property <code>direction</code>
 * @public
 * @name sap.m.FlexBox#getDirection
 * @function
 */

/**
 * Setter for property <code>direction</code>.
 *
 * Default value is <code>Row</code> 
 *
 * @param {sap.m.FlexDirection} oDirection  new value for property <code>direction</code>
 * @return {sap.m.FlexBox} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.FlexBox#setDirection
 * @function
 */


/**
 * Getter for property <code>fitContainer</code>.
 * Determines whether the flexbox will be sized to completely fill its container. If the FlexBox is inserted into a Page, the property 'enableScrolling' of the Page needs to be set to 'false' for the FlexBox to fit the entire viewport.
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>fitContainer</code>
 * @public
 * @name sap.m.FlexBox#getFitContainer
 * @function
 */

/**
 * Setter for property <code>fitContainer</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bFitContainer  new value for property <code>fitContainer</code>
 * @return {sap.m.FlexBox} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.FlexBox#setFitContainer
 * @function
 */


/**
 * Getter for property <code>renderType</code>.
 * Determines whether the layout is rendered as a series of divs or as an unordered list (ul)
 *
 * Default value is <code>Div</code>
 *
 * @return {sap.m.FlexRendertype} the value of property <code>renderType</code>
 * @public
 * @name sap.m.FlexBox#getRenderType
 * @function
 */

/**
 * Setter for property <code>renderType</code>.
 *
 * Default value is <code>Div</code> 
 *
 * @param {sap.m.FlexRendertype} oRenderType  new value for property <code>renderType</code>
 * @return {sap.m.FlexBox} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.FlexBox#setRenderType
 * @function
 */


/**
 * Getter for property <code>justifyContent</code>.
 * Determines the layout behavior along the main axis. "SpaceAround" is currently not supported in most non-Webkit browsers.
 *
 * Default value is <code>Start</code>
 *
 * @return {sap.m.FlexJustifyContent} the value of property <code>justifyContent</code>
 * @public
 * @name sap.m.FlexBox#getJustifyContent
 * @function
 */

/**
 * Setter for property <code>justifyContent</code>.
 *
 * Default value is <code>Start</code> 
 *
 * @param {sap.m.FlexJustifyContent} oJustifyContent  new value for property <code>justifyContent</code>
 * @return {sap.m.FlexBox} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.FlexBox#setJustifyContent
 * @function
 */


/**
 * Getter for property <code>alignItems</code>.
 * Determines the layout behavior of items along the cross-axis. "Baseline" is not supported in Internet Explorer <10.
 *
 * Default value is <code>Stretch</code>
 *
 * @return {sap.m.FlexAlignItems} the value of property <code>alignItems</code>
 * @public
 * @name sap.m.FlexBox#getAlignItems
 * @function
 */

/**
 * Setter for property <code>alignItems</code>.
 *
 * Default value is <code>Stretch</code> 
 *
 * @param {sap.m.FlexAlignItems} oAlignItems  new value for property <code>alignItems</code>
 * @return {sap.m.FlexBox} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.FlexBox#setAlignItems
 * @function
 */


/**
 * Getter for aggregation <code>items</code>.<br/>
 * Flex items within the FlexBox layout
 * 
 * <strong>Note</strong>: this is the default aggregation for FlexBox.
 * @return {sap.ui.core.Control[]}
 * @public
 * @name sap.m.FlexBox#getItems
 * @function
 */


/**
 * Inserts a item into the aggregation named <code>items</code>.
 *
 * @param {sap.ui.core.Control}
 *          oItem the item to insert; if empty, nothing is inserted
 * @param {int}
 *             iIndex the <code>0</code>-based index the item should be inserted at; for 
 *             a negative value of <code>iIndex</code>, the item is inserted at position 0; for a value 
 *             greater than the current size of the aggregation, the item is inserted at 
 *             the last position        
 * @return {sap.m.FlexBox} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.FlexBox#insertItem
 * @function
 */

/**
 * Adds some item <code>oItem</code> 
 * to the aggregation named <code>items</code>.
 *
 * @param {sap.ui.core.Control}
 *            oItem the item to add; if empty, nothing is inserted
 * @return {sap.m.FlexBox} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.FlexBox#addItem
 * @function
 */

/**
 * Removes an item from the aggregation named <code>items</code>.
 *
 * @param {int | string | sap.ui.core.Control} vItem the item to remove or its index or id
 * @return {sap.ui.core.Control} the removed item or null
 * @public
 * @name sap.m.FlexBox#removeItem
 * @function
 */

/**
 * Removes all the controls in the aggregation named <code>items</code>.<br/>
 * Additionally unregisters them from the hosting UIArea.
 * @return {sap.ui.core.Control[]} an array of the removed elements (might be empty)
 * @public
 * @name sap.m.FlexBox#removeAllItems
 * @function
 */

/**
 * Checks for the provided <code>sap.ui.core.Control</code> in the aggregation named <code>items</code> 
 * and returns its index if found or -1 otherwise.
 *
 * @param {sap.ui.core.Control}
 *            oItem the item whose index is looked for.
 * @return {int} the index of the provided control in the aggregation if found, or -1 otherwise
 * @public
 * @name sap.m.FlexBox#indexOfItem
 * @function
 */
	

/**
 * Destroys all the items in the aggregation 
 * named <code>items</code>.
 * @return {sap.m.FlexBox} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.FlexBox#destroyItems
 * @function
 */


// Start of sap\m\FlexBox.js
jQuery.sap.require("sap.m.FlexBoxStylingHelper");

sap.m.FlexBox.prototype.init = function() {
	// Make sure that HBox and VBox have a valid direction
	if(this instanceof sap.m.HBox && (this.getDirection() !== "Row" || this.getDirection() !== "RowReverse")) {
		this.setDirection('Row');
	}
	if(this instanceof sap.m.VBox && (this.getDirection() !== "Column" || this.getDirection() !== "ColumnReverse")) {
		this.setDirection('Column');
	}
};

sap.m.FlexBox.prototype.setDisplayInline = function(bInline) {
	var sDisplay = "";

	this.setProperty("displayInline", bInline, false);
	if(bInline) {
		sDisplay = "inline-flex";
	} else {
		sDisplay = "flex";
	}
	sap.m.FlexBoxStylingHelper.setStyle(null, this, "display", sDisplay);
	return this;
};

sap.m.FlexBox.prototype.setDirection = function(sValue) {
	this.setProperty("direction", sValue, false);
	sap.m.FlexBoxStylingHelper.setStyle(null, this, "flex-direction", sValue);
	return this;
};

sap.m.FlexBox.prototype.setFitContainer = function(sValue) {
	if(sValue && !(this.getParent() instanceof sap.m.FlexBox)) {
		jQuery.sap.log.info("FlexBox fitContainer set to true. Remember, if the FlexBox is inserted into a Page, the property 'enableScrolling' of the Page needs to be set to 'false' for the FlexBox to fit the entire viewport.");
		var $flexContainer = this.$();
		$flexContainer.css("width", "auto");
		$flexContainer.css("height", "100%");
	}
	
	this.setProperty("fitContainer", sValue, false);

	return this;
};

//TODO Enable wrapping when any browser supports it
/*sap.m.FlexBox.prototype.setJustifyContent = function(sValue) {
	this.setProperty("wrap", sValue, true);
	sap.m.FlexBoxStylingHelper.setStyle(null, this, "flex-wrap", sValue);
	return this;
}*/

sap.m.FlexBox.prototype.setJustifyContent = function(sValue) {
	this.setProperty("justifyContent", sValue, false);
	sap.m.FlexBoxStylingHelper.setStyle(null, this, "justify-content", sValue);
	return this;
};

sap.m.FlexBox.prototype.setAlignItems = function(sValue) {
	this.setProperty("alignItems", sValue, false);
	sap.m.FlexBoxStylingHelper.setStyle(null, this, "align-items", sValue);
	return this;
};

sap.m.FlexBox.prototype.setAlignContent = function(sValue) {
	this.setProperty("alignContent", sValue, false);
	sap.m.FlexBoxStylingHelper.setStyle(null, this, "align-content", sValue);
	return this;
};

sap.m.FlexBox.prototype.onAfterRendering = function() {
	if(jQuery.support.useFlexBoxPolyfill) {
		// Check for parent FlexBoxes. Size calculations need to be made from top to bottom
		// while the renderer goes from bottom to top.
		var currentElement = this;
		var parent = null;
		jQuery.sap.log.info("Check #"+currentElement.getId()+" for nested FlexBoxes");

		for (parent = currentElement.getParent();
			parent !== null && parent !== undefined && 
			(parent instanceof sap.m.FlexBox
			|| (parent.getLayoutData() !== null && parent.getLayoutData() instanceof sap.m.FlexItemData));
			) {
			currentElement = parent;
			parent = currentElement.getParent();
		}

		this.sanitizeChildren(this);
		this.renderFlexBoxPolyFill();
	}
};

/*
 * @private
 */
sap.m.FlexBox.prototype.sanitizeChildren = function(oControl) {
	// Check the flex items
	var aChildren = oControl.getItems();
	for (var i = 0; i < aChildren.length; i++) {
		if(aChildren[i].getVisible === undefined || aChildren[i].getVisible()) {
			var $child = "";
			if(aChildren[i] instanceof sap.m.FlexBox) {
				$child = aChildren[i].$();
			} else {
				$child = aChildren[i].$().parent();	// Get wrapper <div>
			}
			var domchild =  aChildren[i].getDomRef();
			$child.width("auto");
			//$child.height("100%");
			if(aChildren[i] instanceof sap.m.FlexBox) {
				this.sanitizeChildren(aChildren[i]);
			}
		}
	}
};

/*
 * @private
 */
sap.m.FlexBox.prototype.renderFlexBoxPolyFill = function() {
	var flexMatrix = [];
	var ordinalMatrix = [];

	// Prepare flex and ordinal matrix
	var aChildren = this.getItems();
	for (var i = 0; i < aChildren.length; i++) {
		// If no visible property or if visible
		if(aChildren[i].getVisible === undefined || aChildren[i].getVisible()) {
			// Get layout properties
			var oLayoutData = aChildren[i].getLayoutData();

			if(oLayoutData !== "undefined" && oLayoutData !== null && oLayoutData instanceof sap.m.FlexItemData) {
				if(oLayoutData.getGrowFactor() !== 1) {
					flexMatrix.push(oLayoutData.getGrowFactor());
				} else {
					flexMatrix.push(1);		// default value
				}
				if(oLayoutData.getOrder() != 0) {
					ordinalMatrix.push(oLayoutData.getOrder());
				} else {
					ordinalMatrix.push(0);	// default value
				}
			}
		}
	}

	if(flexMatrix.length === 0) flexMatrix = null;
	if(ordinalMatrix.length === 0) ordinalMatrix = null;

	if(this.getFitContainer()) {
		// Call setter for fitContainer to apply the appropriate styles which are normally applied by the FlexBoxStylingHelper
		this.setFitContainer(true);
	}

	var oSettings = {
	    direction : this.getDirection(),
	    alignItems : this.getAlignItems(),
	    justifyContent : this.getJustifyContent(),
	    flexMatrix : flexMatrix,
	    ordinalMatrix : ordinalMatrix
	};

	sap.m.FlexBoxStylingHelper.applyFlexBoxPolyfill(this.getId(), oSettings);
};