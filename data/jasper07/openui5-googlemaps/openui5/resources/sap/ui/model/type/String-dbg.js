/*!
 * SAP UI development toolkit for HTML5 (SAPUI5/OpenUI5)
 * (c) Copyright 2009-2014 SAP AG or an SAP affiliate company. 
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides the base implementation for all model implementations
sap.ui.define(['jquery.sap.global', 'sap/ui/core/format/NumberFormat', 'sap/ui/model/SimpleType'],
	function(jQuery, NumberFormat, SimpleType) {
	"use strict";


	/**
	 * Constructor for a String type.
	 *
	 * @class
	 * This class represents string simple types.
	 *
	 * @extends sap.ui.model.SimpleType
	 *
	 * @author SAP AG
	 * @version 1.20.7
	 *
	 * @constructor
	 * @public
	 * @param {object} [oFormatOptions] formatting options. String doesn't support any formatting options
	 * @param {object} [oConstraints] value constraints. All given constraints must be fulfilled by a value to be valid  
	 * @param {int} [oConstraints.maxLength] maximum length (in characters) that a string of this value may have  
	 * @param {string} [oConstraints.startsWith] a prefix that any valid value must start with  
	 * @param {string} [oConstraints.startsWithIgnoreCase] a prefix that any valid value must start with, ignoring case  
	 * @param {string} [oConstraints.endsWith] a suffix that any valid value must end with  
	 * @param {string} [oConstraints.endsWithIgnoreCase] a suffix that any valid value must end with, ignoring case  
	 * @param {string} [oConstraints.contains] an infix that must be contained in any valid value  
	 * @param {string} [oConstraints.equals] only value that is allowed  
	 * @param {RegExp} [oConstraints.search] a regular expression that the value must match  
	 * @name sap.ui.model.type.String
	 */
	var String = SimpleType.extend("sap.ui.model.type.String", /** @lends sap.ui.model.type.String */ {
		
		constructor : function () {
			SimpleType.apply(this, arguments);
			this.sName = "String";
			if (this.oConstraints.search && typeof this.oConstraints.search == "string") {
				this.oConstraints.search = new RegExp(this.oConstraints.search);
			}
		}
	
	});
	
	/**
	 * Creates a new subclass of class sap.ui.model.type.String with name <code>sClassName</code> 
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
	 * @name sap.ui.model.type.String.extend
	 * @function
	 */
	
	/**
	 * @see sap.ui.model.SimpleType.prototype.formatValue
	 * @name sap.ui.model.type.String#formatValue
	 * @function
	 */
	String.prototype.formatValue = function(sValue, sInternalType) {
		if (sValue == undefined || sValue == null) {
			return null;
		}
		switch(sInternalType) {
			case "string":
				return sValue;
			case "int":
				var iResult = parseInt(sValue, 10);
				if (isNaN(iResult)) {
					throw new sap.ui.model.FormatException(sValue + " is not a valid int value");
				}
				return iResult;
			case "float":
				var fResult = parseFloat(sValue);
				if (isNaN(fResult)) {
					throw new sap.ui.model.FormatException(sValue + " is not a valid float value");
				}
				return fResult;
			case "boolean":
				if (sValue.toLowerCase() == "true" || sValue == "X") {
					return true;
				}
				if (sValue.toLowerCase() == "false" || sValue == "") {
					return false;
				}
				throw new sap.ui.model.FormatException(sValue + " is not a valid boolean value");
			default:
				throw new sap.ui.model.FormatException("Don't know how to format String to " + sInternalType);
		}
	};
	
	/**
	 * @see sap.ui.model.SimpleType.prototype.parseValue
	 * @name sap.ui.model.type.String#parseValue
	 * @function
	 */
	String.prototype.parseValue = function(oValue, sInternalType) {
		var sResult;
		switch(sInternalType) {
			case "string":
				return oValue;
			case "boolean":
			case "int":
			case "float":
				return oValue.toString();
			default:
				throw new sap.ui.model.ParseException("Don't know how to parse String from " + sInternalType);
		}
	};
	
	/**
	 * @see sap.ui.model.SimpleType.prototype.validateValue
	 * @name sap.ui.model.type.String#validateValue
	 * @function
	 */
	String.prototype.validateValue = function(sValue) {
		if (this.oConstraints) {
			var aViolatedConstraints = [];
			jQuery.each(this.oConstraints, function(sName, oContent) {
				switch (sName) {
					case "maxLength":  // expects int
						if (sValue.length > oContent) {
							aViolatedConstraints.push("maxLength");
						}
						break;
					case "minLength":  // expects int
						if (sValue.length < oContent) {
							aViolatedConstraints.push("minLength");
						}
						break;
					case "startsWith":  // expects string
						if (!jQuery.sap.startsWith(sValue,oContent)) {
							aViolatedConstraints.push("startsWith");
						}
						break;
					case "startsWithIgnoreCase":  // expects string
						if (!jQuery.sap.startsWithIgnoreCase(sValue,oContent)) {
							aViolatedConstraints.push("startsWithIgnoreCase");
						}
						break;
					case "endsWith":  // expects string
						if (!jQuery.sap.endsWith(sValue,oContent)) {
							aViolatedConstraints.push("endsWith");
						}
						break;
					case "endsWithIgnoreCase": // expects string
						if (!jQuery.sap.endsWithIgnoreCase(sValue,oContent)) {
							aViolatedConstraints.push("endsWithIgnoreCase");
						}
						break;
					case "contains": // expects string
						if (sValue.indexOf(oContent) == -1) {
							aViolatedConstraints.push("contains");
						}
						break;
					case "equals": // expects string
						if (sValue != oContent) {
							aViolatedConstraints.push("equals");
						}
						break;
					case "search": // expects regex
						if (sValue.search(oContent) == -1) {
							aViolatedConstraints.push("search");
						}
						break;
				}
			});
			if (aViolatedConstraints.length > 0) {
				throw new sap.ui.model.ValidateException("Validation of type constraints failed", aViolatedConstraints);
			}
		}
	};
	
	

	return String;

}, /* bExport= */ true);
