/*!
 * SAP UI development toolkit for HTML5 (SAPUI5/OpenUI5)
 * (c) Copyright 2009-2014 SAP AG or an SAP affiliate company. 
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides the Resource model implementation of a property binding
sap.ui.define(['jquery.sap.global', 'sap/ui/model/PropertyBinding'],
	function(jQuery, PropertyBinding) {
	"use strict";


	/**
	 * @class
	 * Property binding implementation for resource bundles
	 *
	 * @param {sap.ui.model.resource.ResourceModel} oModel
	 * @param {string} sPath
	 * @param {sap.ui.model.Context} oContext
	 * @param {object} [mParameters]
	 * @name sap.ui.model.resource.ResourcePropertyBinding
	 */
	var ResourcePropertyBinding = PropertyBinding.extend("sap.ui.model.resource.ResourcePropertyBinding", /** @lends sap.ui.model.resource.ResourcePropertyBinding */ {
		
		constructor : function(oModel, sPath){
			PropertyBinding.apply(this, arguments);
		
			this.oValue = this.oModel.getProperty(sPath);
		}
		
	});
	
	/**
	 * Creates a new subclass of class sap.ui.model.resource.ResourcePropertyBinding with name <code>sClassName</code> 
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
	 * @name sap.ui.model.resource.ResourcePropertyBinding.extend
	 * @function
	 */
	
	/**
	 * @see sap.ui.model.PropertyBinding.prototype.getValue
	 * @name sap.ui.model.resource.ResourcePropertyBinding#getValue
	 * @function
	 */
	ResourcePropertyBinding.prototype.getValue = function(){
		return this.oModel.getProperty(this.sPath);
	};

	return ResourcePropertyBinding;

}, /* bExport= */ true);
