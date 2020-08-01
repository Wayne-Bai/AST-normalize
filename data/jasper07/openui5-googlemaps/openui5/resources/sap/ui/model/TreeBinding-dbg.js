/*!
 * SAP UI development toolkit for HTML5 (SAPUI5/OpenUI5)
 * (c) Copyright 2009-2014 SAP AG or an SAP affiliate company. 
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides an abstraction for list bindings
sap.ui.define(['jquery.sap.global', './Binding'],
	function(jQuery, Binding) {
	"use strict";


	/**
	 * Constructor for TreeBinding
	 *
	 * @class
	 * The TreeBinding is a specific binding for trees in the model, which can be used
	 * to populate Trees.
	 *
	 * @param {sap.ui.model.Model} oModel
	 * @param {string}
	 *         sPath the path pointing to the tree / array that should be bound
	 * @param {object}
	 *         [oContext=null] the context object for this databinding (optional)
	 * @param {array}
	 *         [aFilters=null] predefined filter/s contained in an array (optional)
	 * @param {object}
	 *         [mParameters=null] additional model specific parameters (optional) 
	 * @public
	 * @name sap.ui.model.TreeBinding
	 */
	var TreeBinding = Binding.extend("sap.ui.model.TreeBinding", /** @lends sap.ui.model.TreeBinding */ {
		
		constructor : function(oModel, sPath, oContext, aFilters, mParameters){
			Binding.call(this, oModel, sPath, oContext, mParameters);
			this.aFilters = aFilters;
			this.bDisplayRootNode = mParameters && mParameters.displayRootNode === true;
		},
	
		metadata : {
			"abstract" : true,
			publicMethods : [
				"getRootContexts", "getNodeContexts", "hasChildren", "filter"
			]
		}
		
	});
	
	/**
	 * Creates a new subclass of class sap.ui.model.TreeBinding with name <code>sClassName</code> 
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
	 * @name sap.ui.model.TreeBinding.extend
	 * @function
	 */
	
	
	// the 'abstract methods' to be implemented by child classes
	/**
	 * Returns the current value of the bound target
	 *
	 * @function
	 * @name sap.ui.model.TreeBinding.prototype.getRootContexts
	 * @return {Array} the array of child contexts for the root node
	 *
	 * @public
	 */
	
	/**
	 * Returns the current value of the bound target
	 *
	 * @function
	 * @name sap.ui.model.TreeBinding.prototype.getNodeContexts
	 * @param {Object} oContext the context element of the node
	 * @return {Array} the array of child contexts for the given node
	 *
	 * @public
	 */
	
	/**
	 * Returns if the node has child nodes
	 *
	 * @function
	 * @name sap.ui.model.TreeBinding.prototype.hasChildren
	 * @param {Object} oContext the context element of the node
	 * @return {boolean} true if node has children
	 *
	 * @public
	 */
	
	/**
	 * Filters the tree according to the filter definitions.
	 *
	 * @function
	 * @name sap.ui.model.TreeBinding.prototype.filter
	 * @param {Array} aFilters Array of sap.ui.model.Filter objects
	 *
	 * @public
	 */
	
	/**
	 * Attach event-handler <code>fnFunction</code> to the '_filter' event of this <code>sap.ui.model.TreeBinding</code>.<br/>
	 * @param {function} fnFunction The function to call, when the event occurs.
	 * @param {object} [oListener] object on which to call the given function.
	 * @protected
	 * @deprecated use the change event. It now contains a parameter (reason : "filter") when a filter event is fired.
	 * @name sap.ui.model.TreeBinding#attachFilter
	 * @function
	 */
	TreeBinding.prototype.attachFilter = function(fnFunction, oListener) {
		this.attachEvent("_filter", fnFunction, oListener);
	};
	
	/**
	 * Detach event-handler <code>fnFunction</code> from the '_filter' event of this <code>sap.ui.model.TreeBinding</code>.<br/>
	 * @param {function} fnFunction The function to call, when the event occurs.
	 * @param {object} [oListener] object on which to call the given function.
	 * @protected
	 * @deprecated use the change event.
	 * @name sap.ui.model.TreeBinding#detachFilter
	 * @function
	 */
	TreeBinding.prototype.detachFilter = function(fnFunction, oListener) {
		this.detachEvent("_filter", fnFunction, oListener);
	};
	
	/**
	 * Fire event _filter to attached listeners.
	 * @param {Map} [mArguments] the arguments to pass along with the event.
	 * @private
	 * @deprecated use the change event. It now contains a parameter (reason : "filter") when a filter event is fired.
	 * @name sap.ui.model.TreeBinding#_fireFilter
	 * @function
	 */
	TreeBinding.prototype._fireFilter = function(mArguments) {
		this.fireEvent("_filter", mArguments);
	};
	

	return TreeBinding;

}, /* bExport= */ true);
