/*!
 * SAP UI development toolkit for HTML5 (SAPUI5/OpenUI5)
 * (c) Copyright 2009-2014 SAP AG or an SAP affiliate company. 
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides an abstraction for list bindings
sap.ui.define(['jquery.sap.global', 'sap/ui/model/ContextBinding'],
	function(jQuery, ContextBinding) {
	"use strict";


	/**
	 * Constructor for odata.ODataContextBinding
	 *
	 * @class
	 * The ContextBinding is a specific binding for a setting context for the model
	 *
	 * @param {sap.ui.model.Model} oModel
	 * @param {String} sPath
	 * @param {Object} oContext
	 * @param {Object} [mParameters]
	 * @abstract
	 * @public
	 * @name sap.ui.model.odata.ODataContextBinding
	 */
	var ODataContextBinding = ContextBinding.extend("sap.ui.model.odata.ODataContextBinding", /** @lends sap.ui.model.odata.ODataContextBinding */ {
	
		constructor : function(oModel, sPath, oContext, mParameters, oEvents){
			ContextBinding.call(this, oModel, sPath, oContext, mParameters, oEvents);
		}
	});
	
	/**
	 * Creates a new subclass of class sap.ui.model.odata.ODataContextBinding with name <code>sClassName</code> 
	 * and enriches it with the information contained in <code>oClassInfo</code>.
	 * 
	 * For a detailed description of <code>oClassInfo</code> or <code>FNMetaImpl</code> 
	 * see {@link sap.ui.base.Object.extend Object.extend}.
	 *   
	 * @param {string} sClassName name of the class to be created
	 * @param {object} [oClassInfo] object literal with informations about the class  
	 * @param {function} [FNMetaImpl] alternative constructor for a metadata object
	 * @return {function} the created class / constructor function
	 * @public
	 * @static
	 * @name sap.ui.model.odata.ODataContextBinding.extend
	 * @function
	 */
	
	/**
	 * @see sap.ui.model.Binding.prototype.initialize
	 * @name sap.ui.model.odata.ODataContextBinding#initialize
	 * @function
	 */
	ODataContextBinding.prototype.initialize = function() {
		var that = this,
			sResolvedPath = this.oModel.resolve(this.sPath, this.oContext),
			oData = this.oModel._getObject(this.sPath, this.oContext),
			bReloadNeeded = this.oModel._isReloadNeeded(sResolvedPath, oData, this.mParameters);
	
		if (bReloadNeeded) {
			this.fireDataRequested();
		}
		this.oModel.createBindingContext(this.sPath, this.oContext, this.mParameters, function(oContext) {
			that.oElementContext = oContext;
			that._fireChange(); 
			if (bReloadNeeded) {
				that.fireDataReceived();
			}
		}, bReloadNeeded);
	};
	
	/**
	 * @see sap.ui.model.ContextBinding.prototype.refresh
	 * 
	 * @param {boolean} [bForceUpdate] Update the bound control even if no data has been changed
	 * @param {object} [mChangedEntities]
	 * @name sap.ui.model.odata.ODataContextBinding#refresh
	 * @function
	 */
	ODataContextBinding.prototype.refresh = function(bForceUpdate, mChangedEntities) {
		var that = this, sKey, oStoredEntry, bChangeDetected = false;
		
		if (mChangedEntities) {
			//get entry from model. If entry exists get key for update bindings
			oStoredEntry = this.oModel._getObject(this.sPath, this.oContext);
			if (oStoredEntry) {
				sKey = this.oModel._getKey(oStoredEntry);
				if (sKey in mChangedEntities) {
					bChangeDetected = true;
				}
			}
		} else { // default
			bChangeDetected = true; 
		}
		if (bForceUpdate || bChangeDetected) {
			//recreate Context: force update
			this.fireDataRequested();
			this.oModel.createBindingContext(this.sPath, this.oContext, this.mParameters, function(oContext) {
				if (that.oElementContext == oContext) {
					if (bForceUpdate) {
						that._fireChange();
					}
				} else { 
					that.oElementContext = oContext;
					that._fireChange();
				}
				that.fireDataReceived();
			}, true);
		}
	};
	
	/**
	 * @see sap.ui.model.ContextBinding.prototype.setContext
	 * @name sap.ui.model.odata.ODataContextBinding#setContext
	 * @function
	 */
	ODataContextBinding.prototype.setContext = function(oContext) {
		var that = this, 
			sResolvedPath,
			oData,
			bReloadNeeded;
		
		if (this.oContext != oContext && this.isRelative()) {
			sResolvedPath = this.oModel.resolve(this.sPath, this.oContext),
			oData = this.oModel._getObject(this.sPath, this.oContext),
		 	bReloadNeeded = this.oModel._isReloadNeeded(sResolvedPath, oData, this.mParameters);
		
			this.oContext = oContext;
			if (bReloadNeeded) {
				this.fireDataRequested();
			}
			this.oModel.createBindingContext(this.sPath, this.oContext, this.mParameters, function(oContext) {
				that.oElementContext = oContext;
				that._fireChange();
				if (bReloadNeeded) {
					that.fireDataReceived();
				}
			}, bReloadNeeded);
		}
	};

	return ODataContextBinding;

}, /* bExport= */ true);
