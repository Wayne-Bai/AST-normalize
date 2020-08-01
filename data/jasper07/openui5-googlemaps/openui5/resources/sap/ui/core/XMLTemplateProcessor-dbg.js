/*!
 * SAP UI development toolkit for HTML5 (SAPUI5/OpenUI5)
 * (c) Copyright 2009-2014 SAP AG or an SAP affiliate company. 
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */


sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	
	
	
		function parseScalarType(sType, sValue, sName, oController) {
			// check for a binding expression (string)
			var oBindingInfo = sap.ui.base.ManagedObject.bindingParser(sValue, oController, true);
			if ( oBindingInfo && typeof oBindingInfo === "object" ) {
				return oBindingInfo;
			}
	
			var vValue = sValue = oBindingInfo || sValue; // oBindingInfo could be an unescaped string 
			var oType = sap.ui.base.DataType.getType(sType);
			if (oType) {
				if (oType instanceof sap.ui.base.DataType) {
					vValue = oType.parseValue(sValue);
				}
				// else keep original sValue (e.g. for enums)
			} else {
				throw new Error("Property " + sName + " has unknown type " + sType);
			}
			
			// Note: to avoid double resolution of binding expressions, we have to escape string values once again 
			return typeof vValue === "string" ? sap.ui.base.ManagedObject.bindingParser.escape(vValue) : vValue;
		}
	
		function localName(xmlNode) {
			// localName for standard browsers, baseName for IE, nodeName in the absence of namespaces
			return xmlNode.localName || xmlNode.baseName || xmlNode.nodeName;
		}
	
		/**
		 * The XMLTemplateProcessor class is used to load and process Control trees in XML-declarative notation.
		 * 
		 * @static
		 * @class sap.ui.core.XMLTemplateProcessor
		 * @name sap.ui.core.XMLTemplateProcessor
		 */
		var XMLTemplateProcessor = {};
	
		
		
		/**   API METHODS ***/
		
		
		/**
		 * Loads an XML template using the module loading mechanism and returns the root XML element of the XML document.
		 *
		 * @param {string} sTemplateName
		 * @param {string} [sExtension]
		 * @return {Element} an XML document root element
		 * @name sap.ui.core.XMLTemplateProcessor.loadTemplate
		 * @function
		 */
		XMLTemplateProcessor.loadTemplate = function(sTemplateName, sExtension) {
			var sResourceName = jQuery.sap.getResourceName(sTemplateName, "." + (sExtension || "view") + ".xml");
			return jQuery.sap.loadResource(sResourceName).documentElement; // result is the document node
		};
	
	
		/**
		 * Parses only the attributes of the XML root node (View!) and fills them into the given settings object.
		 * Children are parsed later on after the controller has been set.
		 * TODO cannot handle event handlers in the root node
		 * 
		 * @param {Element} xmlNode the XML element representing the View
		 * @param {sap.ui.core.ManagedObject} oView the View to consider when parsing the attributes
		 * @param {object} mSettings the settings object which should be enriched with the suitable attributes from the XML node
		 * @return undefined
		 * @name sap.ui.core.XMLTemplateProcessor.parseViewAttributes
		 * @function
		 */
		XMLTemplateProcessor.parseViewAttributes = function(xmlNode, oView, mSettings) {
	
			var mAllProperties = oView.getMetadata().getAllProperties();
			for ( var i = 0; i < xmlNode.attributes.length; i++) {
				var attr = xmlNode.attributes[i];
				if (attr.name === 'controllerName') {
					oView._controllerName = attr.value;
				} else if (attr.name === 'resourceBundleName') {
					oView._resourceBundleName =  attr.value;
				} else if (attr.name === 'resourceBundleUrl') {
					oView._resourceBundleUrl =  attr.value;
				} else if (attr.name === 'resourceBundleLocale') {
					oView._resourceBundleLocale =  attr.value;
				} else if (attr.name === 'resourceBundleAlias') {
					oView._resourceBundleAlias =  attr.value;
				} else if (attr.name === 'class') {
					oView.addStyleClass(attr.value);
				}else if (!mSettings[attr.name] && mAllProperties[attr.name]) {
					mSettings[attr.name] = parseScalarType(mAllProperties[attr.name].type, attr.value, attr.name, oView._oContainingView.oController);
				}
			}
		};
	
	
		/**
		 * Parses a complete XML template definition (full node hierarchy)
		 * 
		 * @param {Element} xmlNode the XML element representing the View/Fragment
		 * @param {sap.ui.core.ManagedObject} oView the View/Fragment which corresponds to the parsed XML
		 * @return an array containing Controls and/or plain HTML element strings
		 * @name sap.ui.core.XMLTemplateProcessor.parseTemplate
		 * @function
		 */
		XMLTemplateProcessor.parseTemplate = function(xmlNode, oView) {
	
			var aResult=[];
			var oCustomizingConfig = undefined;
			var sCurrentName = oView.sViewName || oView._sFragmentName; // TODO: should Fragments and Views be separated here?
			if (!sCurrentName) {
				var oTopView = oView;
				var iLoopCounter = 0; // Make sure there are not infinite loops
				while (++iLoopCounter < 1000 && oTopView && oTopView !== oTopView._oContainingView) {
					oTopView = oTopView._oContainingView;
				}
				sCurrentName = oTopView.sViewName;
			}
	
			if (oView.isSubView()) {
				parseNode(xmlNode, true);
			} else {
				parseChildren(xmlNode);
			}
	
			return aResult;
	
			/**
			 * Parses an XML node that might represent a UI5 control or simple XHTML.
			 * XHTML will be added to the aResult array as a sequence of strings,
			 * UI5 controls will be instantiated and added as controls
			 * 
			 * @param xmlNode the XML node to parse
			 * @param bRoot whether this node is the root node
			 * @return undefined but the aResult array is filled 
			 */
			function parseNode(xmlNode, bRoot, bIgnoreToplevelTextNodes) {
	
				if ( xmlNode.nodeType === 1 /* ELEMENT_NODE */ ) {
	
					var sLocalName = localName(xmlNode);
					if (xmlNode.namespaceURI === "http://www.w3.org/1999/xhtml" || xmlNode.namespaceURI === "http://www.w3.org/2000/svg") {
						// write opening tag
						aResult.push("<" + sLocalName + " ");
						// write attributes
						var sId;
						for (var i = 0; i < xmlNode.attributes.length; i++) {
							var attr = xmlNode.attributes[i];
							var value = attr.value;
							if (attr.name === "id") {
								value = oView._oContainingView.createId(value);
							}
							aResult.push(attr.name + "=\"" + jQuery.sap.encodeHTML(value) + "\" ");
						}
						if ( bRoot === true ) {
							aResult.push("data-sap-ui-preserve" + "=\"" + oView.getId() + "\" ");
						}
						aResult.push(">");
	
						// write children
						parseChildren(xmlNode);
	
						// close the tag
						aResult.push("</" + sLocalName + ">");
	
					} else if (sLocalName === "FragmentDefinition" && xmlNode.namespaceURI === "sap.ui.core") {
						// a Fragment element - which is not turned into a control itself. Only its content is parsed.
						parseChildren(xmlNode, false, true);
						// TODO: check if this branch is required or can be handled by the below one 
						
					} else {
	
						// assumption: an ELEMENT_NODE with non-XHTML namespace is a SAPUI5 control and the namespace equals the library name
						var aChildren = createControlOrExtension(xmlNode);
	
						for (var i = 0; i < aChildren.length; i++) {
							var oChild = aChildren[i];
							if (oView.getMetadata().hasAggregation("content")){
								oView.addAggregation("content", oChild);
							}
							else if (oView.getMetadata().hasAssociation(("content"))){
								oView.addAssociation("content", oChild);
							}
		
							aResult.push(oChild);
						}
	
					}
	
				} else if (xmlNode.nodeType === 3 /* TEXT_NODE */ && !bIgnoreToplevelTextNodes) {
	
					var text = xmlNode.textContent || xmlNode.text,
					parentName = localName(xmlNode.parentNode);
					if (text) {
						if (parentName != "style") {
							text = jQuery.sap.encodeHTML(text);
						}
						aResult.push(text);
					}
	
				}
	
			}
	
			/**
			 * Parses the children of an XML node
			 */
			function parseChildren(xmlNode, bRoot, bIgnoreToplevelTextNodes) {
				var children = xmlNode.childNodes;
				for (var i = 0; i < children.length; i++) {
					parseNode(children[i], bRoot, bIgnoreToplevelTextNodes);
				}
			}
	
			function findControlClass(sNamespaceURI, sLocalName) {
				var sClassName;
				var mLibraries = sap.ui.getCore().getLoadedLibraries();
				jQuery.each(mLibraries, function(sLibName, oLibrary) {
					if ( sNamespaceURI === oLibrary.namespace || sNamespaceURI === oLibrary.name ) {
						sClassName = oLibrary.name + "." + ((oLibrary.tagNames && oLibrary.tagNames[sLocalName]) || sLocalName);
					}
				});
				// TODO guess library from sNamespaceURI and load corresponding lib!?
				sClassName = sClassName || sNamespaceURI + "." + sLocalName;
	
				// ensure that control and library are loaded
				jQuery.sap.require(sClassName); // make sure oClass.getMetadata() exists
	
				return jQuery.sap.getObject(sClassName);
			}
	
			/**
			 * Takes an arbitrary node (control or plain HTML) and creates zero or one or more SAPUI5 controls from it,
			 * iterating over the attributes and child nodes.
			 * 
			 * @return an array with 0..n controls
			 * @private
			 */
			function createControls(node) {
				// differentiate between SAPUI5 and plain-HTML children
				if (node.namespaceURI === "http://www.w3.org/1999/xhtml" || node.namespaceURI === "http://www.w3.org/2000/svg" ) {
					var id = node.attributes['id'] ? node.attributes['id'].textContent || node.attributes['id'].text : null;
					// plain HTML node - create a new View control
					return [ new sap.ui.core.mvc.XMLView({
						id: id ? oView._oContainingView.createId(id) : undefined,
								xmlNode:node,
								containingView:oView._oContainingView}) ];
					
				} else {
					// non-HTML (SAPUI5) control
					return createControlOrExtension(node);
				}
			}
			
			/**
			 * Creates 0..n UI5 controls from an XML node which is not plain HTML, but a UI5 node (either control or ExtensionPoint).
			 * One control for regular controls, zero for ExtensionPoints without configured extension and
			 * n controls for multi-root Fragments.
			 * 
			 * @return an array with 0..n controls created from a node
			 * @private
			 */
			function createControlOrExtension(node) { // this will also be extended for Fragments with multiple roots
				
				if (localName(node) === "ExtensionPoint" && node.namespaceURI === "sap.ui.core") {
					// ExtensionPoint
					return createExtension(node, oView);
					
				} else {
					// a plain and simple regular UI5 control
					return createRegularControls(node);
				}
			}
	
			/**
			 * Creates 0..n UI5 controls from an ExtensionPoint node.
			 * One control if the ExtensionPoint is e.g. filled with a View, zero for ExtensionPoints without configured extension and
			 * n controls for multi-root Fragments as extension.
			 * 
			 * @return an array with 0..n controls created from an ExtensionPoint node
			 * @private
			 */
			function createExtension(node, oView) {
				var vResult = undefined;
				
				if (sap.ui.core.CustomizingConfiguration) {
					// Extension Point - is something configured?
					var extensionConfig = sap.ui.core.CustomizingConfiguration.getViewExtension(sCurrentName, node.getAttribute("name"));
					if (extensionConfig) {
						if (extensionConfig.className) {
							jQuery.sap.require(extensionConfig.className); // make sure oClass.getMetadata() exists
							var oClass = jQuery.sap.getObject(extensionConfig.className);
							jQuery.sap.log.info("Customizing: View extension found for extension point '" + node.getAttribute("name") 
									+ "' in View '" + sCurrentName + "': " + extensionConfig.className + ": " + (extensionConfig.viewName || extensionConfig.fragmentName));
									
							if (extensionConfig.className === "sap.ui.core.Fragment") {
								var oFragment = new oClass({
									type: extensionConfig.type, 
									fragmentName: extensionConfig.fragmentName,
									containingView: oView
								});
								vResult = (jQuery.isArray(oFragment) ? oFragment : [oFragment]); // vResult is now an array, even if empty - so if a Fragment is configured, the default content below is not added anymore
								
							} else if (extensionConfig.className === "sap.ui.core.mvc.View") {
								var oView = sap.ui.view({type: extensionConfig.type, viewName: extensionConfig.viewName});
								vResult = [oView]; // vResult is now an array, even if empty - so if a Fragment is configured, the default content below is not added anymore
								
							} else {
								// unknown extension class
								jQuery.sap.log.warning("Customizing: Unknown extension className configured (and ignored) in Component.js for extension point '" + node.getAttribute("name") 
										+ "' in View '" + sCurrentName + "': " + extensionConfig.className);
							}
						} else {
							jQuery.sap.log.warning("Customizing: no extension className configured in Component.js for extension point '" + node.getAttribute("name") 
									+ "' in View '" + sCurrentName + "': " + extensionConfig.className);
						}
					} else {
						// no extension configured
					}
				}
				
				if (!vResult) { // no extension configured or found or customizing disabled - check for default content
					vResult = [];
					var children = node.childNodes;
					for (var i = 0; i < children.length; i++) {
						var oChildNode = children[i];
						if (oChildNode.nodeType === 1 /* ELEMENT_NODE */) { // text nodes are ignored - plaintext inside extension points is not supported; no warning log because even whitespace is a text node
							vResult = jQuery.merge(vResult, createControls(oChildNode));
						}
					}
				}
				
				return vResult || [];
			}
			
			/**
			 * Creates 0..n UI5 controls from an XML node.
			 * One control for regular controls, zero for ExtensionPoints without configured extension and
			 * n controls for multi-root Fragments.
			 * 
			 * @return an array with 0..n controls created from a node
			 * @private
			 */
			function createRegularControls(node) {
				var ns = node.namespaceURI,
				oClass = findControlClass(ns, localName(node)),
				oMetadata = oClass.getMetadata(),
				mJSONKeys = oMetadata.getJSONKeys(),
				mSettings = {},
				sStyleClasses = "",
				aCustomData = [],
				sOriginalControlId;
	
				for (var i = 0; i < node.attributes.length; i++) {
					var attr = node.attributes[i];
	
					var sName = attr.name;
					var sValue = attr.value;
	
					// apply the value of the attribute to a
					//   * property,
					//   * association (id of the control),
					//   * event (name of the function in the controller) or
					//   * CustomData element (namespace-prefixed attribute)
	
					var oInfo = mJSONKeys[sName];
	
					if (sName === "id") {
						// special handling for ID
						mSettings[sName] = oView._oContainingView.createId(sValue);
						sOriginalControlId = sValue;
	
					} else if (sName === "class") {
						// special handling for CSS classes, which will be added via addStyleClass()
						sStyleClasses += sValue;
	
					} else if (sName === "viewName") {
						mSettings[sName] = sValue;
	
					} else if (sName === "fragmentName") {
						mSettings[sName] = sValue;
						mSettings['containingView'] = oView._oContainingView;
	
					} else if (sName === "binding") {
						var oBindingInfo = sap.ui.base.ManagedObject.bindingParser(sValue, oView._oContainingView.oController)
						// TODO reject complex bindings, types, formatters; enable 'parameters'? 
						mSettings.objectBindings = mSettings.objectBindings || {};
						mSettings.objectBindings[oBindingInfo.model || undefined] = oBindingInfo;
	
					} else if (sName.indexOf(":") > -1) {  // namespace-prefixed attribute found
						if (attr.namespaceURI === "http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1") {  // CustomData attribute found
							var sLocalName = localName(attr);
							aCustomData.push(new sap.ui.core.CustomData({
								key:sLocalName,
								value:parseScalarType("any", sValue, sLocalName, oView._oContainingView.oController)
							}));
						} else if ( sName.indexOf("xmlns:") !== 0 ) { // other, unknown namespace and not an xml namespace alias definition
							jQuery.sap.log.warning(oView + ": XMLView parser encountered and ignored attribute '" + sName + "' (value: '" + sValue + "') with unknown namespace");
							// TODO: here XMLView could check for namespace handlers registered by the application for this namespace which could modify mSettings according to their interpretation of the attribute
						}
	
					} else if (oInfo && oInfo._iKind === 0 /* PROPERTY */ ) {
						// other PROPERTY
						mSettings[sName] = parseScalarType(oInfo.type, sValue, sName, oView._oContainingView.oController);
	
					} else if (oInfo && oInfo._iKind === 1 /* SINGLE_AGGREGATION */ && oInfo.altTypes ) {
						// AGGREGATION with scalar type (altType)
						mSettings[sName] = parseScalarType(oInfo.altTypes[0], sValue, sName, oView._oContainingView.oController);
	
					} else if (oInfo && oInfo._iKind === 2 /* MULTIPLE_AGGREGATION */ ) {
						var oBindingInfo = sap.ui.base.ManagedObject.bindingParser(sValue, oView._oContainingView.oController);
						if ( oBindingInfo ) {
							mSettings[sName] = oBindingInfo;
						} else {
							// TODO we now in theory allow more than just a binding path. Update message?
							jQuery.sap.log.error(oView + ": aggregations with cardinality 0..n only allow binding paths as attribute value (wrong value: " + sName + "='" + sValue + "')");
						}
	
					} else if (oInfo && oInfo._iKind === 3 /* SINGLE_ASSOCIATION */ ) {
						// ASSOCIATION
						mSettings[sName] = oView.createId(sValue); // use the value as ID
	
					} else if (oInfo && oInfo._iKind === 4 /* MULTIPLE_ASSOCIATION */ ) {
						// we support "," and " " to separate IDs 
						mSettings[sName] = jQuery.map(sValue.split(/[\s,]+/g), function(sId) {
							// Note: empty IDs need to ignored, therefore splitting by a sequence of separators is okay. 
							return sId ? oView.createId(sId) : null;
						});
	
					} else if (oInfo && oInfo._iKind === 5 /* EVENT */ ) {
						// EVENT
						var fnEventHandler = oView._oContainingView.oController[sValue];
						if (typeof(fnEventHandler) !== "function") {
							jQuery.sap.log.warning(oView + ": event handler function \"" + sValue + "\" is not a function or does not exist in the controller.");
						}
						if (fnEventHandler) {
							// the handler name is set as property on the function to keep this information
							// e.g. for serializers which converts a control tree back to a declarative format
							fnEventHandler["_sapui_handlerName"] = sValue;
							mSettings[sName] = [fnEventHandler, oView._oContainingView.oController];
						}
	
					} else if ( sName !== "xmlns" ) {
						jQuery.sap.log.warning(oView + ": XMLTemplateProcessor encountered and ignored unknown attribute '" + sName + "' (value: '" + sValue + "')");
					}
				}
				if (aCustomData.length > 0) {
					mSettings.customData = aCustomData;
				}
	
				function handleChildren(node, oAggregation, mAggregations) {
	
					var childNode,oNamedAggregation;
	
					// loop over all nodes
					for (childNode=node.firstChild; childNode; childNode = childNode.nextSibling) {
	
						// inspect only element nodes
						if ( childNode.nodeType === 1 /* ELEMENT_NODE */ ) {
	
							// check for a named aggregation (must have the same namespace as the parent and an aggregation with the same name must exist)
							oNamedAggregation = childNode.namespaceURI === ns && mAggregations && mAggregations[localName(childNode)];
							if (oNamedAggregation) {
	
								// the children of the current childNode are aggregated controls (or HTML) below the named aggregation
								handleChildren(childNode, oNamedAggregation);
	
							}
							else if (oAggregation) {
								// child node name does not equal an aggregation name,
								// so this child must be a control (or HTML) which is aggregated below the DEFAULT aggregation
								var aControls = createControls(childNode);
								for (var i = 0; i < aControls.length; i++) {
									var oControl = aControls[i];
									// append the child to the aggregation
									var name = oAggregation._sName;
									if (oAggregation.multiple) {
										// 1..n AGGREGATION
										if (!mSettings[name]) {
											mSettings[name] = [];
										}
										if ( typeof mSettings[name].path === "string" ) {
											jQuery.sap.assert(!mSettings[name].template, "list bindings support only a single template object");
											mSettings[name].template = oControl;
										} else {
											mSettings[name].push(oControl);
										}
									} else {
										// 1..1 AGGREGATION
										jQuery.sap.assert(!mSettings[name], "multiple aggregates defined for aggregation with cardinality 0..1");
										mSettings[name] = oControl;
									}
								}
							} else if (localName(node) !== "FragmentDefinition" || node.namespaceURI !== "sap.ui.core") { // children of FragmentDefinitions are ok, they need no aggregation
								throw new Error("Cannot add direct child without default aggregation defined for control " + oMetadata.getElementName());
							}
	
						} else if ( childNode.nodeType === 3 /* TEXT_NODE */ ) {
							if ( jQuery.trim(childNode.textContent || childNode.text) ) { // whitespace would be okay
								throw new Error("Cannot add text nodes as direct child of an aggregation. For adding text to an aggregation, a surrounding html tag is needed");
							}
						} // other nodes types are silently ignored
	
					}
				}
	
				// loop child nodes and handle all AGGREGATIONS
				var oAggregation = oMetadata.getDefaultAggregation();
				var mAggregations = oMetadata.getAllAggregations();
				handleChildren(node, oAggregation, mAggregations);
	
				// customizing of control properties
				if (sap.ui.core.CustomizingConfiguration && sOriginalControlId) {
					var mCustomSettings = sap.ui.core.CustomizingConfiguration.getCustomProperties(sCurrentName, sOriginalControlId);
					if (mCustomSettings) {
						mSettings = jQuery.extend(mSettings, mCustomSettings); // override original property initialization with customized property values
					}
				}
				
				// apply the settings to the control
				var vNewControlInstance;
				if (sap.ui.core.mvc.View.prototype.isPrototypeOf(oClass.prototype) && typeof oClass._sType === "string") {
					// for views having a factory function defined we use the factory function!
					vNewControlInstance = sap.ui.view(mSettings, undefined, oClass._sType);
				} else {
					// call the control constructor
					// NOTE: the sap.ui.core.Fragment constructor can return an array containing multiple controls (for multi-root Fragments)
					//   This is the reason for all the related functions around here returning arrays.
					vNewControlInstance = new oClass(mSettings);
				}
	
				if (sStyleClasses && vNewControlInstance.addStyleClass) {
					// Elements do not have a style class!
					vNewControlInstance.addStyleClass(sStyleClasses);
				}
	
				if (!vNewControlInstance) {
					vNewControlInstance = [];
				} else if (!jQuery.isArray(vNewControlInstance)) {
					vNewControlInstance = [vNewControlInstance];
				}
				return vNewControlInstance;
			}
	
		};
	
	
	

	return XMLTemplateProcessor;

}, /* bExport= */ true);
