/*!
 * SAP UI development toolkit for HTML5 (SAPUI5/OpenUI5)
 * (c) Copyright 2009-2015 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides control sap.m.StandardTile.
sap.ui.define(['jquery.sap.global', './Tile', './library', 'sap/ui/core/IconPool'],
	function(jQuery, Tile, library, IconPool) {
	"use strict";


	
	/**
	 * Constructor for a new StandardTile.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The StandardTile
	 * @extends sap.m.Tile
	 *
	 * @author SAP SE
	 * @version 1.26.9
	 *
	 * @constructor
	 * @public
	 * @since 1.12
	 * @alias sap.m.StandardTile
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var StandardTile = Tile.extend("sap.m.StandardTile", /** @lends sap.m.StandardTile.prototype */ { metadata : {
	
		library : "sap.m",
		properties : {
	
			/**
			 * Tile title
			 */
			title : {type : "string", group : "Misc", defaultValue : null},
	
			/**
			 * Tile description
			 */
			info : {type : "string", group : "Misc", defaultValue : null},
	
			/**
			 * Tile icon
			 */
			icon : {type : "sap.ui.core.URI", group : "Misc", defaultValue : null},
	
			/**
			 * Tile active icon
			 */
			activeIcon : {type : "sap.ui.core.URI", group : "Misc", defaultValue : null},
	
			/**
			 * Number field
			 */
			number : {type : "string", group : "Misc", defaultValue : null},
	
			/**
			 * Number units qualifier
			 */
			numberUnit : {type : "string", group : "Misc", defaultValue : null},
	
			/**
			 * Info state defines the color of the info text. E.g. Error, Warning, Success...
			 */
			infoState : {type : "sap.ui.core.ValueState", group : "Misc", defaultValue : sap.ui.core.ValueState.None},
	
			/**
			 * Tile type.
			 */
			type : {type : "sap.m.StandardTileType", group : "Misc", defaultValue : sap.m.StandardTileType.None},
	
			/**
			 * By default, this is set to true but then one or more requests are sent trying to get the density perfect version of image if this version of image doesn't exist on the server.
			 * 
			 * If bandwidth is the key for the application, set this value to false.
			 */
			iconDensityAware : {type : "boolean", group : "Appearance", defaultValue : true}
		}
	}});
	
	///**
	// * This file defines behavior for the control,
	// */
	
	
	/**
	 * Called when the control is destroyed.
	 * 
	 * @private
	 */
	StandardTile.prototype.exit = function() {
		if (this._oImageControl) {
			this._oImageControl.destroy();
			this._oImageControl = null;
		}
	};
	
	/*
	 * Overrides the icon property of the Tile Control
	 */
	StandardTile.prototype.getIcon = function() {
		if (!this.getProperty("icon") && this.getType() === "Create") {
			return IconPool.getIconURI("add");
		} else {
			return this.getProperty("icon");
		}
	};
	
	
	/**
	 * Lazy load tile icon image.
	 * @private
	 */
	StandardTile.prototype._getImage = function() {
		
		var sImgId = this.getId() + "-img";
		var sSize = sap.ui.Device.system.phone ? "1.3rem" : "2rem";
		
		var mProperties = {
			src : this.getIcon(),
			height : sSize,
			width : sSize,
			size: sSize,
			densityAware : this.getIconDensityAware()
		};
		
		this._oImageControl = sap.m.ImageHelper.getImageControl(sImgId, this._oImageControl, this, mProperties);
		
		return this._oImageControl;
	};
	

	return StandardTile;

}, /* bExport= */ true);
