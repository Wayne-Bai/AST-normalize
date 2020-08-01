/*!
 * SAP UI development toolkit for HTML5 (SAPUI5/OpenUI5)
 * (c) Copyright 2009-2014 SAP AG or an SAP affiliate company. 
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides a filter for list bindings
sap.ui.define(['jquery.sap.global', './FilterOperator'],
	function(jQuery, FilterOperator) {
	"use strict";


	/**
	 * Constructor for Filter
	 * You can either pass an object with the filter parameters or use the function arguments
	 * 
	 * Using object:
	 * new sap.ui.model.Filter({
	 *   sPath: ...,
	 *   sOperator: ...,
	 *   oValue1: ...,
	 *   oValue2: ...,
	 *   aFilters: ...,
	 *   bAnd: ...
	 * })
	 * 
	 * You can only pass sPath, sOperator and their values OR aFilters and bAnd. You will get an error if you define an invalid combination of filters parameters.
	 * 
	 * Using arguments:
	 * new sap.ui.model.Filter(sPath, sOperator, oValue1, oValue2);
	 * OR
	 * new sap.ui.model.Filter(aFilters, bAnd);
	 * 
	 * aFilters is an array of other instances of sap.ui.model.Filter. If bAnd is set all filters within the filter will be ANDed else they will be ORed.
	 *
	 * @class
	 * Filter for the list binding
	 *
	 * @param {String} sPath the binding path for this filter
	 * @param {sap.ui.model.FilterOperator} sOperator Operator used for the filter
	 * @param {Object} oValue1 First value to use for filter
	 * @param {Object} [oValue2=null] Second value to use for filter (optional)
	 * @public
	 * @name sap.ui.model.Filter
	 */
	var Filter = sap.ui.base.Object.extend("sap.ui.model.Filter", /** @lends sap.ui.model.Filter */ {
		constructor : function(sPath, sOperator, oValue1, oValue2){
			//There are two different ways of specifying a filter
			//If can be passed in only one object or defined with parameters
			if (typeof sPath === "object" && !jQuery.isArray(sPath)) {
				var oFilterData = sPath;
				this.sPath = oFilterData.path;
				this.sOperator = oFilterData.operator;
				this.oValue1 = oFilterData.value1;
				this.oValue2 = oFilterData.value2;
				this.aFilters = oFilterData.aFilters;
				this.bAnd = oFilterData.bAnd;
			} else {
				//If parameters are used we have to check weather a regular or a multi filter is speficied
				if (jQuery.isArray(sPath)) {
					this.aFilters = sPath;
				} else {
					this.sPath = sPath;
				}
				if (jQuery.type(sOperator) === "boolean") {
					this.bAnd = sOperator;
				} else {
					this.sOperator = sOperator;
				}
				this.oValue1 = oValue1;
				this.oValue2 = oValue2;
			}
			if (jQuery.isArray(this.aFilters) && this.bAnd != undefined && !this.sPath && !this.sOperator && !this.oValue1 && !this.oValue2) {
				this._bMultiFilter = true;
				jQuery.each(this.aFilters, function(iIndex, oFilter) {
					if (!(oFilter instanceof Filter)) {
						jQuery.sap.log.error("Filter in Aggregation of Multi filter has to be instance of sap.ui.model.Filter");
					}
				});
			} else if (!this.aFilters && !this.bAnd && this.sPath !== undefined && this.sOperator && this.oValue1 !== undefined) {
				this._bMultiFilter = false;
			} else {
				jQuery.sap.log.error("Wrong parameters defined for filter.");
			}
		}
	
	});
	
	/**
	 * Creates a new subclass of class sap.ui.model.Filter with name <code>sClassName</code> 
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
	 * @name sap.ui.model.Filter.extend
	 * @function
	 */
	
	

	return Filter;

}, /* bExport= */ true);
