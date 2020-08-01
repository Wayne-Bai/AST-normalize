/*!
 * SAP UI development toolkit for HTML5 (SAPUI5/OpenUI5)
 * (c) Copyright 2009-2014 SAP AG or an SAP affiliate company. 
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.m.ActionSheet.
jQuery.sap.declare("sap.m.ActionSheet");
jQuery.sap.require("sap.m.library");
jQuery.sap.require("sap.ui.core.Control");


/**
 * Constructor for a new ActionSheet.
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
 * <li>{@link #getPlacement placement} : sap.m.PlacementType (default: sap.m.PlacementType.Bottom)</li>
 * <li>{@link #getShowCancelButton showCancelButton} : boolean (default: true)</li>
 * <li>{@link #getCancelButtonText cancelButtonText} : string</li>
 * <li>{@link #getTitle title} : string</li></ul>
 * </li>
 * <li>Aggregations
 * <ul>
 * <li>{@link #getButtons buttons} : sap.m.Button[]</li></ul>
 * </li>
 * <li>Associations
 * <ul></ul>
 * </li>
 * <li>Events
 * <ul>
 * <li>{@link sap.m.ActionSheet#event:cancelButtonTap cancelButtonTap} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.m.ActionSheet#event:beforeOpen beforeOpen} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.m.ActionSheet#event:afterOpen afterOpen} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.m.ActionSheet#event:beforeClose beforeClose} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.m.ActionSheet#event:afterClose afterClose} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.m.ActionSheet#event:cancelButtonPress cancelButtonPress} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li></ul>
 * </li>
 * </ul> 

 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * ActionSheet is a special kind of control which contains one or more sap.m.Button(s) and the ActionSheet will be closed when one of the buttons is tapped. It looks similar as a sap.m.Dialog in iPhone and Android while as a sap.m.Popover in iPad.
 * @extends sap.ui.core.Control
 *
 * @author SAP AG 
 * @version 1.20.7
 *
 * @constructor   
 * @public
 * @since 1.9.1
 * @name sap.m.ActionSheet
 */
sap.ui.core.Control.extend("sap.m.ActionSheet", { metadata : {

	// ---- object ----
	publicMethods : [
		// methods
		"openBy", "close", "isOpen"
	],

	// ---- control specific ----
	library : "sap.m",
	properties : {
		"placement" : {type : "sap.m.PlacementType", group : "Appearance", defaultValue : sap.m.PlacementType.Bottom},
		"showCancelButton" : {type : "boolean", group : "Appearance", defaultValue : true},
		"cancelButtonText" : {type : "string", group : "Appearance", defaultValue : null},
		"title" : {type : "string", group : "Appearance", defaultValue : null}
	},
	aggregations : {
    	"buttons" : {type : "sap.m.Button", multiple : true, singularName : "button"}, 
    	"_cancelButton" : {type : "sap.m.Button", multiple : false, visibility : "hidden"}
	},
	events : {
		"cancelButtonTap" : {}, 
		"beforeOpen" : {}, 
		"afterOpen" : {}, 
		"beforeClose" : {}, 
		"afterClose" : {}, 
		"cancelButtonPress" : {}
	}
}});


/**
 * Creates a new subclass of class sap.m.ActionSheet with name <code>sClassName</code> 
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
 * @name sap.m.ActionSheet.extend
 * @function
 */

sap.m.ActionSheet.M_EVENTS = {'cancelButtonTap':'cancelButtonTap','beforeOpen':'beforeOpen','afterOpen':'afterOpen','beforeClose':'beforeClose','afterClose':'afterClose','cancelButtonPress':'cancelButtonPress'};


/**
 * Getter for property <code>placement</code>.
 * The ActionSheet behaves as a sap.m.Popover in iPad and this property is the information about on which side will the popover be placed at. Possible values are sap.m.PlacementType.Left, sap.m.PlacementType.Right, sap.m.PlacementType.Top, sap.m.PlacementType.Bottom. The default value is sap.m.PlacementType.Bottom.
 *
 * Default value is <code>Bottom</code>
 *
 * @return {sap.m.PlacementType} the value of property <code>placement</code>
 * @public
 * @name sap.m.ActionSheet#getPlacement
 * @function
 */

/**
 * Setter for property <code>placement</code>.
 *
 * Default value is <code>Bottom</code> 
 *
 * @param {sap.m.PlacementType} oPlacement  new value for property <code>placement</code>
 * @return {sap.m.ActionSheet} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.ActionSheet#setPlacement
 * @function
 */


/**
 * Getter for property <code>showCancelButton</code>.
 * If this is set to true, there will be a cancel button shown below the action buttons. There won't be any cancel button shown in iPad regardless of this property. The default value is set to true.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>showCancelButton</code>
 * @public
 * @name sap.m.ActionSheet#getShowCancelButton
 * @function
 */

/**
 * Setter for property <code>showCancelButton</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bShowCancelButton  new value for property <code>showCancelButton</code>
 * @return {sap.m.ActionSheet} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.ActionSheet#setShowCancelButton
 * @function
 */


/**
 * Getter for property <code>cancelButtonText</code>.
 * This is the text displayed in the cancelButton. Default value is "Cancel", and it's translated according to the current locale setting. This property will be ignored when running either in iPad or showCancelButton is set to false.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>cancelButtonText</code>
 * @public
 * @name sap.m.ActionSheet#getCancelButtonText
 * @function
 */

/**
 * Setter for property <code>cancelButtonText</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sCancelButtonText  new value for property <code>cancelButtonText</code>
 * @return {sap.m.ActionSheet} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.ActionSheet#setCancelButtonText
 * @function
 */


/**
 * Getter for property <code>title</code>.
 * Title will be show in the header area in iPhone and every Android devices. This property will be ignored in iPad.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>title</code>
 * @public
 * @name sap.m.ActionSheet#getTitle
 * @function
 */

/**
 * Setter for property <code>title</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sTitle  new value for property <code>title</code>
 * @return {sap.m.ActionSheet} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.ActionSheet#setTitle
 * @function
 */


/**
 * Getter for aggregation <code>buttons</code>.<br/>
 * These buttons are added to the content area in ActionSheet control. When button is tapped, the ActionSheet is closed before the tap event listener is called.
 * 
 * @return {sap.m.Button[]}
 * @public
 * @name sap.m.ActionSheet#getButtons
 * @function
 */


/**
 * Inserts a button into the aggregation named <code>buttons</code>.
 *
 * @param {sap.m.Button}
 *          oButton the button to insert; if empty, nothing is inserted
 * @param {int}
 *             iIndex the <code>0</code>-based index the button should be inserted at; for 
 *             a negative value of <code>iIndex</code>, the button is inserted at position 0; for a value 
 *             greater than the current size of the aggregation, the button is inserted at 
 *             the last position        
 * @return {sap.m.ActionSheet} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.ActionSheet#insertButton
 * @function
 */

/**
 * Adds some button <code>oButton</code> 
 * to the aggregation named <code>buttons</code>.
 *
 * @param {sap.m.Button}
 *            oButton the button to add; if empty, nothing is inserted
 * @return {sap.m.ActionSheet} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.ActionSheet#addButton
 * @function
 */

/**
 * Removes an button from the aggregation named <code>buttons</code>.
 *
 * @param {int | string | sap.m.Button} vButton the button to remove or its index or id
 * @return {sap.m.Button} the removed button or null
 * @public
 * @name sap.m.ActionSheet#removeButton
 * @function
 */

/**
 * Removes all the controls in the aggregation named <code>buttons</code>.<br/>
 * Additionally unregisters them from the hosting UIArea.
 * @return {sap.m.Button[]} an array of the removed elements (might be empty)
 * @public
 * @name sap.m.ActionSheet#removeAllButtons
 * @function
 */

/**
 * Checks for the provided <code>sap.m.Button</code> in the aggregation named <code>buttons</code> 
 * and returns its index if found or -1 otherwise.
 *
 * @param {sap.m.Button}
 *            oButton the button whose index is looked for.
 * @return {int} the index of the provided control in the aggregation if found, or -1 otherwise
 * @public
 * @name sap.m.ActionSheet#indexOfButton
 * @function
 */
	

/**
 * Destroys all the buttons in the aggregation 
 * named <code>buttons</code>.
 * @return {sap.m.ActionSheet} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.ActionSheet#destroyButtons
 * @function
 */


/**
 * This event is fired when the cancelButton is tapped. For iPad, this event is also fired when showCancelButton is set to true, and Popover is closed by tapping outside. (This event is deprecated, use the press event instead) 
 *
 * @name sap.m.ActionSheet#cancelButtonTap
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'cancelButtonTap' event of this <code>sap.m.ActionSheet</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.m.ActionSheet</code>.<br/> itself. 
 *  
 * This event is fired when the cancelButton is tapped. For iPad, this event is also fired when showCancelButton is set to true, and Popover is closed by tapping outside. (This event is deprecated, use the press event instead) 
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.m.ActionSheet</code>.<br/> itself.
 *
 * @return {sap.m.ActionSheet} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.ActionSheet#attachCancelButtonTap
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'cancelButtonTap' event of this <code>sap.m.ActionSheet</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.m.ActionSheet} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.ActionSheet#detachCancelButtonTap
 * @function
 */

/**
 * Fire event cancelButtonTap to attached listeners.

 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.m.ActionSheet} <code>this</code> to allow method chaining
 * @protected
 * @name sap.m.ActionSheet#fireCancelButtonTap
 * @function
 */


/**
 * This event will be fired before the ActionSheet is opened. 
 *
 * @name sap.m.ActionSheet#beforeOpen
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'beforeOpen' event of this <code>sap.m.ActionSheet</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.m.ActionSheet</code>.<br/> itself. 
 *  
 * This event will be fired before the ActionSheet is opened. 
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.m.ActionSheet</code>.<br/> itself.
 *
 * @return {sap.m.ActionSheet} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.ActionSheet#attachBeforeOpen
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'beforeOpen' event of this <code>sap.m.ActionSheet</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.m.ActionSheet} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.ActionSheet#detachBeforeOpen
 * @function
 */

/**
 * Fire event beforeOpen to attached listeners.

 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.m.ActionSheet} <code>this</code> to allow method chaining
 * @protected
 * @name sap.m.ActionSheet#fireBeforeOpen
 * @function
 */


/**
 * This event will be fired after the ActionSheet is opened. 
 *
 * @name sap.m.ActionSheet#afterOpen
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'afterOpen' event of this <code>sap.m.ActionSheet</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.m.ActionSheet</code>.<br/> itself. 
 *  
 * This event will be fired after the ActionSheet is opened. 
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.m.ActionSheet</code>.<br/> itself.
 *
 * @return {sap.m.ActionSheet} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.ActionSheet#attachAfterOpen
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'afterOpen' event of this <code>sap.m.ActionSheet</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.m.ActionSheet} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.ActionSheet#detachAfterOpen
 * @function
 */

/**
 * Fire event afterOpen to attached listeners.

 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.m.ActionSheet} <code>this</code> to allow method chaining
 * @protected
 * @name sap.m.ActionSheet#fireAfterOpen
 * @function
 */


/**
 * This event will be fired before the ActionSheet is closed. 
 *
 * @name sap.m.ActionSheet#beforeClose
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'beforeClose' event of this <code>sap.m.ActionSheet</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.m.ActionSheet</code>.<br/> itself. 
 *  
 * This event will be fired before the ActionSheet is closed. 
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.m.ActionSheet</code>.<br/> itself.
 *
 * @return {sap.m.ActionSheet} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.ActionSheet#attachBeforeClose
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'beforeClose' event of this <code>sap.m.ActionSheet</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.m.ActionSheet} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.ActionSheet#detachBeforeClose
 * @function
 */

/**
 * Fire event beforeClose to attached listeners.

 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.m.ActionSheet} <code>this</code> to allow method chaining
 * @protected
 * @name sap.m.ActionSheet#fireBeforeClose
 * @function
 */


/**
 * This event will be fired after the ActionSheet is closed. 
 *
 * @name sap.m.ActionSheet#afterClose
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'afterClose' event of this <code>sap.m.ActionSheet</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.m.ActionSheet</code>.<br/> itself. 
 *  
 * This event will be fired after the ActionSheet is closed. 
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.m.ActionSheet</code>.<br/> itself.
 *
 * @return {sap.m.ActionSheet} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.ActionSheet#attachAfterClose
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'afterClose' event of this <code>sap.m.ActionSheet</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.m.ActionSheet} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.ActionSheet#detachAfterClose
 * @function
 */

/**
 * Fire event afterClose to attached listeners.

 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.m.ActionSheet} <code>this</code> to allow method chaining
 * @protected
 * @name sap.m.ActionSheet#fireAfterClose
 * @function
 */


/**
 * This event is fired when the cancelButton is clicked. For iPad, this event is also fired when showCancelButton is set to true, and Popover is closed by clicking outside. 
 *
 * @name sap.m.ActionSheet#cancelButtonPress
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'cancelButtonPress' event of this <code>sap.m.ActionSheet</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.m.ActionSheet</code>.<br/> itself. 
 *  
 * This event is fired when the cancelButton is clicked. For iPad, this event is also fired when showCancelButton is set to true, and Popover is closed by clicking outside. 
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.m.ActionSheet</code>.<br/> itself.
 *
 * @return {sap.m.ActionSheet} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.ActionSheet#attachCancelButtonPress
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'cancelButtonPress' event of this <code>sap.m.ActionSheet</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.m.ActionSheet} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.ActionSheet#detachCancelButtonPress
 * @function
 */

/**
 * Fire event cancelButtonPress to attached listeners.

 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.m.ActionSheet} <code>this</code> to allow method chaining
 * @protected
 * @name sap.m.ActionSheet#fireCancelButtonPress
 * @function
 */


/**
 * Calling this method will make the ActionSheet visible on the screen.
 *
 * @name sap.m.ActionSheet.prototype.openBy
 * @function
 * @param {object} 
 *         oControl
 *         The ActionSheet behaves as a sap.m.Popover in iPad and the control parameter is the object to which the popover will be placed. It can be not only a UI5 control, but also an existing dom reference. The side of the placement depends on the placement property set in the popover. In other platforms, ActionSheet behaves as a standard dialog and this parameter is ignored because dialog is aligned to the screen.

 * @type void
 * @public
 */


/**
 * Calling this method will make the ActionSheet disappear from the screen.
 *
 * @name sap.m.ActionSheet.prototype.close
 * @function

 * @type void
 * @public
 */


/**
 * The method checks if the ActionSheet is open. It returns true when the ActionSheet is currently open (this includes opening and closing animations), otherwise it returns false.
 *
 * @name sap.m.ActionSheet.prototype.isOpen
 * @function

 * @type boolean
 * @public
 */


// Start of sap\m\ActionSheet.js
jQuery.sap.require("sap.m.Dialog");
jQuery.sap.require("sap.m.Popover");
jQuery.sap.require("sap.ui.core.delegate.ItemNavigation");

sap.m.ActionSheet.prototype.init = function() {
	// Delegate keyboard processing to ItemNavigation, see commons.SegmentedButton
	this._oItemNavigation = new sap.ui.core.delegate.ItemNavigation();
	this._oItemNavigation.setCycling(false);
	this.addDelegate(this._oItemNavigation);
};

sap.m.ActionSheet.prototype.exit = function(){
	if(this._parent){
		this._parent.destroy();
		this._parent = null;
	}
	if(this._oCancelButton){
		this._oCancelButton.destroy();
		this._oCancelButton = null;
	}

	if (this._oItemNavigation) {
		this.removeDelegate(this._oItemNavigation);
		this._oItemNavigation.destroy();
		delete this._oItemNavigation;
	}
};

// keyboard navigation
sap.m.ActionSheet.prototype._setItemNavigation = function() {
	var aButtons = this.getButtons(),
		aDomRefs = [],
		oDomRef = this.getDomRef();

	if (oDomRef) {
		this._oItemNavigation.setRootDomRef(oDomRef);
		for(var i = 0; i < aButtons.length; i++){
			if(aButtons[i].getEnabled()){
				aDomRefs.push(aButtons[i].getDomRef());
			}
		}
		if(this._oCancelButton){
			aDomRefs.push(this._oCancelButton.getDomRef());
		}
		this._oItemNavigation.setItemDomRefs(aDomRefs);
		this._oItemNavigation.setSelectedIndex(0);
		this._oItemNavigation.setPageSize(aDomRefs.length);
	}
};
sap.m.ActionSheet.prototype.onAfterRendering = function() {
	this._setItemNavigation();
	this.$().on("keyup.ActionSheet", jQuery.proxy(this.onKeyUp, this));
};
sap.m.ActionSheet.prototype.onBeforeRendering = function() {
	if(this.getDomRef()){
		this.$().off("keyup.ActionSheet");
	}
};
sap.m.ActionSheet.prototype.onKeyUp = function(event) {
	if( event.which == jQuery.sap.KeyCodes.ESCAPE){
		this.close();
		event.stopPropagation();
		event.preventDefault();
	}
};
sap.m.ActionSheet.prototype.sapfocusleave = function() {
	this.close();
};

sap.m.ActionSheet.prototype.openBy = function(oControl){
	var that = this;
	if(!this._parent){
		var oOldParent = this.getParent();

		// ActionSheet may already have a parent for dependent aggregation.
		// This parent must be cleared before adding it to the popup instance, otherwise ActionSheet closes immediately after opening for the first time.
		// TODO: after ManagedObject.prototype._removeChild function is fixed for removing control from dependents aggregation, remove this.
		if(oOldParent){
			this.setParent(null);
		}

		if(jQuery.device.is.ipad || (sap.m.Dialog._bOneDesign && !sap.ui.Device.system.phone)){
		//create a Popover instance for iPad
			this._parent = new sap.m.Popover({
				placement: this.getPlacement(),
				showHeader: false,
				content: [this],
				beforeOpen: function(){
					that.fireBeforeOpen();
				},
				afterOpen: function(){
					that.focus();
					that.fireAfterOpen();
				},
				beforeClose: function(){
					that.fireBeforeClose();
				},
				afterClose: function(){
					if(that.getShowCancelButton()){
						that.fireCancelButtonTap(); // (This event is deprecated, use the "cancelButtonPress" event instead)
						that.fireCancelButtonPress();
					}
					that.fireAfterClose();
				}
			}).addStyleClass("sapMActionSheetPopover");

			if(sap.ui.Device.browser.internet_explorer){
				this._parent._fnSetArrowPosition = jQuery.proxy(function(){
					sap.m.Popover.prototype._setArrowPosition.apply(this);
					
					var $this = this.$(),
						fContentWidth = $this.children(".sapMPopoverCont")[0].getBoundingClientRect().width;
					jQuery.each($this.find(".sapMActionSheet > .sapMBtn"), function(index, oButtonDom){
						var $button = jQuery(oButtonDom),
							fButtonWidth;
						$button.css("width", "");
						fButtonWidth = oButtonDom.getBoundingClientRect().width;
						if(fButtonWidth <= fContentWidth){
							$button.css("width", "100%");
						}
					});
				}, this._parent);
			}
		}else{
			//create a Dialog instance for the rest
			this._parent = new sap.m.Dialog({
				title: this.getTitle(),
				type: sap.m.DialogType.Standard,
				content: [this],
				beforeOpen: function(){
					that.fireBeforeOpen();
				},
				afterOpen: function(){
					that.focus();
					that.fireAfterOpen();
				},
				beforeClose: function(oEvent){
					that.fireBeforeClose({
						origin: oEvent.getParameter("origin")
					});
				},
				afterClose: function(oEvent){
					that.fireAfterClose({
						origin: oEvent.getParameter("origin")
					});
				}
			}).addStyleClass("sapMActionSheetDialog");
			
			if(this.getTitle()){
				this._parent.addStyleClass("sapMActionSheetDialogWithTitle");
			}
			
			if(!(jQuery.device.is.iphone || (sap.m.Dialog._bOneDesign && sap.ui.Device.system.phone))){
				this._parent.setBeginButton(this._getCancelButton());
			}
			
			//need to modify some internal methods of Dialog for iPhone, because
			//the actionsheet won't be sized full screen if the content is smaller than the whole screen.
			//Then the transform animation need to be set at runtime with some height calculation. 
			if(jQuery.device.is.iphone || (sap.m.Dialog._bOneDesign && sap.ui.Device.system.phone)){
				//remove the transparent property from blocklayer
				this._parent.oPopup.setModal(true);
				this._parent._setDimensions = function(){
					var $this = this.$(),
						$content = this.$("cont");
					//CSS reset
					$this.css({
						"width": "100%",
						"max-height": "100%",
						"left": "0px",
						"right": "",
						"bottom": "",
					});
					$content.css("max-height", "");
				};
				
				//Generate a translate3d string with the given y offset
				function genTransformCSS(y){
					return "translate3d(0px, " + (y > 0 ? y : 0) +"px, 0px)";
				}
				
				this._parent._openAnimation = function($this, iRealDuration, fnOpened){
					var $window = jQuery(window), 
						iWindowHeight = $window.height(),
						sStartTransform = genTransformCSS(iWindowHeight);
					
					//need to set the transform css before its visible, in order to trigger the animation properly.
					$this.css({
						"top": "0px",
						"-webkit-transform": sStartTransform,
						"-moz-transform": sStartTransform,
						"transform": sStartTransform,
						"display": "block"
					});
					
					$this.bind("webkitTransitionEnd transitionend", function(){
						jQuery(this).unbind("webkitTransitionEnd transitionend");
						$this.removeClass("sapMDialogSliding");
						fnOpened();
					});
					
					//need a timeout to trigger the animation
					setTimeout(function(){
						var iTop = iWindowHeight - $this.outerHeight(),
							//calculation for the end point of the animation
							sEndTransform = genTransformCSS(iTop);
						$this.css({
							"-webkit-transform": sEndTransform,
							"-moz-transform": sEndTransform,
							"transform": sEndTransform
						}).addClass("sapMDialogSliding").removeClass("sapMDialogHidden");
					}, 0);
				};
				
				this._parent._closeAnimation = function($this, iRealDuration, fnClosed){
					var $window = jQuery(window), 
						sTransform = genTransformCSS($window.height());
					$this.bind("webkitTransitionEnd transitionend", function(){
						jQuery(this).unbind("webkitTransitionEnd transitionend");
						$this.removeClass("sapMDialogSliding");
						fnClosed();
					});
					$this.css({
						"-webkit-transform": sTransform,
						"-moz-transform": sTransform,
						"transform": sTransform
					}).addClass("sapMDialogSliding");
				};
				
				//set the animation to the interal oPopup instance on Dialog
				this._parent.oPopup.setAnimations(jQuery.proxy(this._parent._openAnimation, this._parent), jQuery.proxy(this._parent._closeAnimation, this._parent));				
				
				
				//also need to change the logic for adjusting scrollable area.
				this._parent._adjustScrollingPane = function(){
					var $this = this.$(),
						iHeight = $this.height(),
						iHeaderHeight = $this.children("header.sapMBar").outerHeight(true),
						$content = this.$("cont");
				
					$content.css("max-height", iHeight - iHeaderHeight);
					this._oScroller.refresh();
				};
				
				//only need to recalculate the transform offset when window resizes, doesn't need to reposition using Popup.js again for iPhone.
				this._parent._fnOrientationChange = jQuery.proxy(function(){
					this._setDimensions();
					
					var $window = jQuery(window), 
						iWindowHeight = $window.height(),
						$this = this.$(),
						iTop = iWindowHeight - $this.outerHeight(),
						sTransform = genTransformCSS(iTop),
						$content = this.$("cont");
					
					$this.css({
						"-webkit-transform": sTransform,
						"-moz-transform": sTransform,
						"transform": sTransform
					});
					
					this._adjustScrollingPane();
				}, this._parent);
			}
		}

		// Check if this control has already a parent. If yes, add the _parent control into the dependents aggregation
		// to enable model propagation and lifecycle management.
		if(oOldParent){
			oOldParent.addDependent(this._parent);
		}
	}
	
	//open the ActionSheet
	if(jQuery.device.is.ipad || (sap.m.Dialog._bOneDesign && !sap.ui.Device.system.phone)){
		this._parent.openBy(oControl);
	}else{
		this._parent.open();
	}
};


sap.m.ActionSheet.prototype.close = function(oControl){
	if(this._parent){
		this._parent.close();
	}
};


sap.m.ActionSheet.prototype.isOpen = function(oControl){
	return !!this._parent && this._parent.isOpen();
};


sap.m.ActionSheet.prototype._createCancelButton = function(){
	if(!this._oCancelButton){
		var sCancelButtonText = (this.getCancelButtonText()) ? this.getCancelButtonText() : sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("ACTIONSHEET_CANCELBUTTON_TEXT"),
			that = this;
//			var sButtonStyle = (sap.ui.Device.os.ios) ? sap.m.ButtonType.Unstyled : sap.m.ButtonType.Default;
		this._oCancelButton = new sap.m.Button(this.getId() + '-cancelBtn', {
			text: sCancelButtonText,
			type: sap.m.ButtonType.Emphasized,
			press : function() {
				if(!(jQuery.device.is.ipad || (sap.m.Dialog._bOneDesign && !sap.ui.Device.system.phone)) && that._parent){
					that._parent._oCloseTrigger = this;
				}
				that.close();
				that.fireCancelButtonTap(); // (This event is deprecated, use the "cancelButtonPress" event instead)
				that.fireCancelButtonPress();
			}
		}).addStyleClass("sapMActionSheetButton sapMActionSheetCancelButton sapMBtnTransparent sapMBtnInverted");
		
		if(jQuery.device.is.iphone || (sap.m.Dialog._bOneDesign && sap.ui.Device.system.phone)){
			this.setAggregation("_cancelButton", this._oCancelButton, true);
		}
	}
	return this;
};

sap.m.ActionSheet.prototype._getCancelButton = function(){
	if(!(jQuery.device.is.ipad || (sap.m.Dialog._bOneDesign && !sap.ui.Device.system.phone)) && this.getShowCancelButton()){
		this._createCancelButton();
		return this._oCancelButton;
	}
	return null;
};

sap.m.ActionSheet.prototype.setCancelButtonText = function(sText) {
	this.setProperty("cancelButtonText", sText, true);
	if(this._oCancelButton) {
		this._oCancelButton.setText(sText);
	}
	return this;
};

sap.m.ActionSheet.prototype._preProcessActionButton = function(oButton){
	var sType = oButton.getType();

	if(sap.m.Dialog._bOneDesign){
		if(sType !== sap.m.ButtonType.Accept && sType !== sap.m.ButtonType.Reject){
			oButton.setType(sap.m.ButtonType.Transparent);
		}
	}
	oButton.addStyleClass("sapMBtnInverted"); // dark background
	return this;
};

sap.m.ActionSheet.prototype.setShowCancelButton = function(bValue){
	if(this._parent){
		if(jQuery.device.is.iphone || (sap.m.Dialog._bOneDesign && sap.ui.Device.system.phone)){
			//if iPhone, we need to rerender to show or hide the cancel button
			this.setProperty("showCancelButton", bValue, false);
		}else if(!sap.m.Dialog._bOneDesign && !sap.ui.Device.os.ios){
			this.setProperty("showCancelButton", bValue, true);
			this._parent.setBeginButton(this._getCancelButton());
		}
	}else{
		this.setProperty("showCancelButton", bValue, true);
	}
	return this;
};

sap.m.ActionSheet.prototype.setTitle = function(sTitle){
	this.setProperty("title", sTitle, true);
	if(this._parent && !(jQuery.device.is.ipad || (sap.m.Dialog._bOneDesign && !sap.ui.Device.system.phone))){
		this._parent.setTitle(sTitle);
	}
	
	if(this._parent){
		if(sTitle){
			this._parent.addStyleClass("sapMActionSheetDialogWithTitle");
		}else{
			this._parent.removeStyleClass("sapMActionSheetDialogWithTitle");
		}
	}
	return this;
};

sap.m.ActionSheet.prototype.setPlacement = function(sPlacement){
	this.setProperty("placement", sPlacement, true);
	
	if(jQuery.device.is.ipad || (sap.m.Dialog._bOneDesign && !sap.ui.Device.system.phone)){
		if(this._parent){
			this._parent.setPlacement(sPlacement);
		}
	}
	return this;
};

sap.m.ActionSheet.prototype._buttonSelected = function(){
	if(!(jQuery.device.is.ipad || (sap.m.Dialog._bOneDesign && !sap.ui.Device.system.phone)) && this._parent){
		this._parent._oCloseTrigger = this;
	}
	this.close();
};

/* Override API methods */
sap.m.ActionSheet.prototype.addButton = function(oButton) {
	this.addAggregation("buttons",oButton, false);
	this._preProcessActionButton(oButton);
	oButton.attachPress(this._buttonSelected, this);
	return this;
};
sap.m.ActionSheet.prototype.insertButton = function(oButton, iIndex) {
	this.insertAggregation("buttons",oButton, iIndex, false);
	this._preProcessActionButton(oButton);
	oButton.attachPress(this._buttonSelected, this);
	return this;
};
sap.m.ActionSheet.prototype.removeButton = function(oButton) {
	var result = this.removeAggregation("buttons",oButton, false);
	if (result) {
		result.detachPress(this._buttonSelected, this);
	}
	return result;
};
sap.m.ActionSheet.prototype.removeAllButtons = function() {
	var result = this.removeAllAggregation("buttons", false),
		that = this;
	jQuery.each(result, function(i, oButton) {
		oButton.detachPress(that._buttonSelected, that);
	});
	return result;
};
sap.m.ActionSheet.prototype.clone = function() {

	var aButtons = this.getButtons();
	for ( var i = 0; i < aButtons.length; i++) {
		var oButton = aButtons[i];
		oButton.detachPress(this._buttonSelected, this);
	}

	var oClone = sap.ui.core.Control.prototype.clone.apply(this, arguments);

	for ( var i = 0; i < aButtons.length; i++) {
		var oButton = aButtons[i];
		oButton.attachPress(this._buttonSelected, this);
	}

	return oClone;
};
