/*!
 * SAP UI development toolkit for HTML5 (SAPUI5/OpenUI5)
 * (c) Copyright 2009-2014 SAP AG or an SAP affiliate company. 
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides helper class sap.ui.core.Popup
sap.ui.define(['jquery.sap.global', 'sap/ui/base/EventProvider', 'sap/ui/base/Object', './Control', './IntervalTrigger', './RenderManager', './UIArea', 'jquery.sap.script'],
	function(jQuery, EventProvider, BaseObject, Control, IntervalTrigger, RenderManager, UIArea/* , jQuerySap */) {
	"use strict";


	/**
	 * Creates an instance of <code>sap.ui.core.Popup</code> that can be used to open controls as a Popup,
	 * visually appearing in front of other controls.
	 *
	 * @class Popup Class is a helper class for controls that want themselves or
	 * parts of themselves or even other aggregated or composed controls
	 * or plain HTML content to popup on the screen like menues, dialogs, drop down boxes.
	 *
	 * It allows the controls to be aligned to other dom elements
	 * using the {@link sap.ui.core.Popup.Dock.html} method. With it you can define where
	 * the popup should be docked. One can dock the popup to the top bottom left or right side
	 * of a dom ref.
	 *
	 * In the case that the popup has no space to show itself in the view port
	 * of the current window it tries to open itself to
	 * the inverted direction.
	 * 
	 * <strong>Since 1.12.3</strong> it is possible to add further DOM-element-ids that can get the focus
	 * when 'autoclose' is enabled. E.g. the RichTextEditor with running TinyMCE uses this method to
	 * be able to focus the Popups of the TinyMCE if the RichTextEditor runs within a Popup/Dialog etc.
	 * 
	 *  To provide an additional DOM-element that can get the focus the following should be done:
	 * 	// create an object with the corresponding DOM-id
	 * 	var oObject = {
	 *		id : "this_is_the_most_valuable_id_of_the_DOM_element"
	 *	};
	 *
	 *	// add the event prefix for adding an element to the ID of the corresponding Popup
	 *	var sEventId = "sap.ui.core.Popup.addFocusableContent-" + oPopup.getId();
	 *
	 *	// fire the event with the created event-id and the object with the DOM-id
	 *	sap.ui.getCore().getEventBus().publish("sap.ui", sEventId, oObject);  
	 *
	 * @param {sap.ui.core.Control | sap.ui.core.Element | DOMNode} oContent the content to render in the popup. In case of sap.ui.core.Element or DOMNode, the content must be present in the page (i.e. rendered). In case of sap.ui.core.Control, the Popup ensures rendering before opening.
	 * @param {boolean} [bModal=false] whether the popup should be opened in a modal way (i.e. with blocking background). Setting this to "true" effectively blocks all attempts to focus content outside the modal popup. A modal popup also automatically sets the focus back to whatever was focused when the popup opened.
	 * @param {boolean} [bShadow=true] whether the popup should be have a visual shadow underneath (shadow appearance depends on active theme and browser support)
	 * @param {boolean} [bAutoClose=false] whether the popup should automatically close when the focus moves out of the popup
	 *
	 * @constructor
	 * @public
	 * @name sap.ui.core.Popup
	 */
	var Popup = EventProvider.extend("sap.ui.core.Popup", /** @lends sap.ui.core.Popup */ {
		constructor: function (oContent, bModal, bShadow, bAutoClose) {
			jQuery.sap.assert(arguments.length == 0 || (oContent && typeof oContent === "object"), "oContent must be an object or there may be no arguments at all");
			jQuery.sap.assert((bModal === undefined || bModal === true || bModal === false), "bModal must be true, false, or undefined");
			jQuery.sap.assert((bShadow === undefined || bShadow === true || bShadow === false), "bShadow must be true, false, or undefined");
			jQuery.sap.assert((bAutoClose === undefined || bAutoClose === true || bAutoClose === false), "bAutoClose must be true, false, or undefined");
	
			EventProvider.apply(this);
	
			this._id = jQuery.sap.uid(); // internal ID to make event handlers unique
	
			this.bOpen = false; // true exactly if the Popup is opening, open, or closing
			this.eOpenState = sap.ui.core.OpenState.CLOSED;
	
			if (oContent) {
				this.setContent(oContent);
			}
	
			this._oDefaultPosition = {
				my: Popup.Dock.CenterCenter,
				at: Popup.Dock.CenterCenter,
				of: document,
				offset: "0 0",
				collision: "flip"
			};
	
			this._oPosition = jQuery.extend({},this._oDefaultPosition);
	
			this._bModal = !!bModal;
			this._oPreviousFocus = null;
			this._sInitialFocusId = null;
			this._bShadow = typeof(bShadow) === "boolean" ? bShadow : true;
			this._bAutoClose = !!bAutoClose;
			this._aAutoCloseAreas;
			this._animations = { open: null, close: null };
			this._durations = {	open: "fast", close: "fast" };
			this._iZIndex = -1;
			this._oBlindLayer = null;
	
			//autoclose handler for mobile or desktop browser in touch mode
			//this function needs to be put onto the instance other than the prototype because functions on the prototype are treated as same function and can't be bound twice.
			if (this.touchEnabled){
				this._fAutoCloseHandler = function(oEvent) {
					// Suppress the delayed mouse event from mobile browser
					if(oEvent.isMarked("delayedMouseEvent") || oEvent.isMarked("cancelAutoClose")){
						return;
					}

					// call the close handler only when it's fully opened
					// this also prevents calling close while closing
					if (this.eOpenState === sap.ui.core.OpenState.CLOSING || this.eOpenState === sap.ui.core.OpenState.CLOSED) {
						return;
					}

					var oDomNode = oEvent.target,
						oPopupDomNode = this._$().get(0),
						bInsidePopup = jQuery.contains(oPopupDomNode, oDomNode),
						bInsideAutoCloseAreas = false,
						bInsideFocusableAreas = false,
						i;
	
					if (this._aAutoCloseAreas) {
						for (i = 0; i < this._aAutoCloseAreas.length; i++) {
							if (jQuery.sap.containsOrEquals(this._aAutoCloseAreas[i], oDomNode)) {
								bInsideAutoCloseAreas = true;
								break;
							}
						}
					}

					if (this._aFocusableArea) {
						for (i = 0; i < this._aFocusableArea.length; i++ ) {
							if (jQuery.sap.containsOrEquals(jQuery.sap.domById(this._aFocusableArea[i])), oDomNode) {
								bInsideFocusableAreas = true;
								break;
							}
						}
					}

					if (!(bInsidePopup || bInsideAutoCloseAreas || bInsideFocusableAreas)) {
						this.close();
					}
				};
			}
		},
	
		metadata : {
			publicMethods : ["open", "close", "setContent", "getContent", "setPosition", "setShadow", "setModal", "setAutoClose", "isOpen", "getAutoClose", "getOpenState", "setAnimations", "setDurations", "attachOpened", "attachClosed", "detachOpened", "detachClosed"]
		}
	
	});
	
	Popup._activateBlindLayer = true;
	
	// stack used for storing z-indices for blocklayer
	Popup.blStack = [];
	
	Popup.M_EVENTS = {opened:'opened',closed:'closed'};
	
	/**
	 * Enumeration providing options for docking of some element to another.
	 * "Right" and "Left" will stay the same in RTL mode, but "Begin" and "End" will flip to the other side ("Begin" is "Right" in RTL).
	 *
	 * @static
	 * @namespace
	 * @public
	 * @name sap.ui.core.Popup.Dock
	 */
	Popup.Dock = /** @lends sap.ui.core.Popup.Dock */ {
	
			/**
			 * @public
			 */
			BeginTop      : "begin top",
	
			/**
			 * @public
			 */
			BeginCenter   : "begin center",
	
			/**
			 * @public
			 */
			BeginBottom   : "begin bottom",
	
			/**
			 * @public
			 */
			LeftTop      : "left top",
	
			/**
			 * @public
			 */
			LeftCenter   : "left center",
	
			/**
			 * @public
			 */
			LeftBottom   : "left bottom",
	
			/**
			 * @public
			 */
			CenterTop    : "center top",
	
			/**
			 * @public
			 */
			CenterCenter : "center center",
	
			/**
			 * @public
			 */
			CenterBottom : "center bottom",
	
			/**
			 * @public
			 */
			RightTop     : "right top",
	
			/**
			 * @public
			 */
			RightCenter  : "right center",
	
			/**
			 * @public
			 */
			RightBottom  : "right bottom",
	
			/**
			 * @public
			 */
			EndTop     : "end top",
	
			/**
			 * @public
			 */
			EndCenter  : "end center",
	
			/**
			 * @public
			 */
			EndBottom  : "end bottom"
	};
	
	/**
	 * This property changes how the autoClose behaves on the Popup. When it's set to true, the Popup will be closed when tap outside of the Popup. Otherwise it will close as soon as the focus leaves the Popup.
	 *
	 * The default value of this property is true when running in touchable environments.
	 *
	 * @static
	 * @type {boolean}
	 * @private
	 * @name sap.ui.core.Popup#touchEnabled
	 */
	Popup.prototype.touchEnabled = sap.ui.Device.support.touch || jQuery.sap.simulateMobileOnDesktop;
	
	/**
	 * This property changes how focus handling works. When it's set to true, focus will be restored after Popup is closed to the previous focused element before Popup is open. Otherwise, this function is disabled.
	 *
	 * By default, the focus is restored only in non-touch environments.
	 *
	 * @static
	 * @type {boolean}
	 * @private
	 * @name sap.ui.core.Popup#restoreFocus
	 */
	Popup.prototype.restoreFocus = !sap.ui.Device.support.touch && !jQuery.sap.simulateMobileOnDesktop;
	
	//****************************************************
	// Event handlers
	//****************************************************
	
	/**
	 * Attach event-handler <code>fnFunction</code> to the 'opened' event of this <code>sap.ui.core.Popup</code>.<br/>
	 *
	 * Event is fired when the popup has completely opened (after any animation).
	 *
	 *
	 * @param {function}
	 *            fnFunction The function to call, when the event occurs. This function will be called on the
	 *            oListener-instance (if present)
	 * @param {object}
	 *            [oListener] object on which to call the given function.
	 * @return {sap.ui.core.Popup} <code>this</code> to allow method chaining
	 * @public
	 * @name sap.ui.core.Popup#attachOpened
	 * @function
	 */
	Popup.prototype.attachOpened = function(fnFunction, oListener) {
		this.attachEvent("opened", fnFunction, oListener);
		return this;
	};
	
	/**
	 * Attach event-handler <code>fnFunction</code> to the 'closed' event of this <code>sap.ui.core.Popup</code>.<br/>
	 *
	 * Event is fired when the popup has completely closed (after any animation).
	 *
	 *
	 * @param {function}
	 *            fnFunction The function to call when the popup has completely closed (after any animation).
	 * @param {object}
	 *            [oListener] object on which to call the given function.
	 * @return {sap.ui.core.Popup} <code>this</code> to allow method chaining
	 * @public
	 * @name sap.ui.core.Popup#attachClosed
	 * @function
	 */
	Popup.prototype.attachClosed = function(fnFunction, oListener) {
		this.attachEvent("closed", fnFunction, oListener);
		return this;
	};
	
	/**
	 * Detach event handler <code>fnFunction</code> from the 'opened' event of this <code>sap.ui.core.Popup</code>.<br/>
	 *
	 * @param {function}
	 *            fnFunction The function to call when the popup has completely opened (after any animation).
	 * @param {object}
	 *            oListener (optional) The object, that wants to be notified, when the event occurs
	 * @return {sap.ui.core.Popup} <code>this</code> to allow method chaining
	 * @public
	 * @name sap.ui.core.Popup#detachOpened
	 * @function
	 */
	Popup.prototype.detachOpened = function(fnFunction, oListener) {
		this.detachEvent("opened", fnFunction, oListener);
		return this;
	};
	
	/**
	 * Detach event handler <code>fnFunction</code> from the 'closed' event of this <code>sap.ui.core.Popup</code>.<br/>
	 *
	 * @param {function}
	 *            fnFunction The function to call when the popup has completely closed (after any animation).
	 * @param {object}
	 *            oListener (optional) The object, that wants to be notified, when the event occurs
	 * @return {sap.ui.core.Popup} <code>this</code> to allow method chaining
	 * @public
	 * @name sap.ui.core.Popup#detachClosed
	 * @function
	 */
	Popup.prototype.detachClosed = function(fnFunction, oListener) {
		this.detachEvent("closed", fnFunction, oListener);
		return this;
	};
	
	//****************************************************
	//Layer et al
	//****************************************************
	
	/**
	* @class
	* @private
	* @name sap.ui.core.Popup.Layer
	*/
	BaseObject.extend("sap.ui.core.Popup.Layer", {
		constructor: function() {
			var sDomString = this.getDomString();
			this._$Ref = jQuery(sDomString).appendTo(sap.ui.getCore().getStaticAreaRef());
		}
	});
	
	/**
	*
	* @param oRef
	* @param iZIndex
	* @private
	* @name sap.ui.core.Popup.Layer#init
	* @function
	*/
	Popup.Layer.prototype.init = function(/** jQuery */oRef, iZIndex) {
		this._$Ref
			.css("visibility", "visible")
			.css("z-index", iZIndex);
		this.update(oRef, iZIndex);
		this._$Ref.insertAfter(oRef).show();
	};
	
	/**
	* @protected
	* @name sap.ui.core.Popup.Layer#update
	* @function
	*/
	Popup.Layer.prototype.update = function(/** jQuery */oRef, iZIndex){
		var oRect = oRef.rect();
		this._$Ref
			.css("left", oRect.left)
			.css("top", oRect.top);
	
		if(oRef.css("right") != "auto" && oRef.css("right") != "inherit"){
			this._$Ref
				.css("right", oRef.css("right"))
				.css("width", "auto");
		}else{
			this._$Ref
				.css("width", oRect.width)
				.css("right", "auto");
		}
		if(oRef.css("bottom") != "auto" && oRef.css("bottom") != "inherit"){
			this._$Ref
				.css("bottom", oRef.css("bottom"))
				.css("height", "auto");
		} else {
			this._$Ref
				.css("height", oRect.height)
				.css("bottom", "auto");
		}
	
		if(typeof(iZIndex) === "number") {
			this._$Ref.css("z-index", iZIndex);
		}
	};
	
	Popup.Layer.prototype.reset = function(){
		this._$Ref
			.hide()
			.css("visibility", "hidden")
			.appendTo(sap.ui.getCore().getStaticAreaRef());
	};
	
	/**
	 * Must be overwritten by sub class
	 * @name sap.ui.core.Popup.Layer#getDomString
	 * @function
	 */
	Popup.Layer.prototype.getDomString = function(){
		jQuery.sap.log.error("sap.ui.core.Popup.Layer: getDomString function must be overwritten!");
	
		return "";
	};
	
	//End of Layer
	
	//****************************************************
	// BlindLayer et al
	//****************************************************
	
	/**
	 * @class
	 * @private
	 */
	Popup.Layer.extend("sap.ui.core.Popup.BlindLayer", {
		constructor : function() {
			Popup.Layer.apply(this);
		}
	});
	
	Popup.BlindLayer.prototype.getDomString = function(){
		return "<div class=\"sapUiBliLy\" id=\"sap-ui-blindlayer-" + jQuery.sap.uid() + "\"><iframe scrolling=\"no\" src=\"javascript:''\"	tabIndex=\"-1\"></iframe></div>";
	};
	
	/**
	 * Facility for reuse of created iframes.
	 * @type sap.ui.base.ObjectPool
	 * @private
	 * @name sap.ui.core.Popup#oBlindLayerPool
	 */
	Popup.prototype.oBlindLayerPool = new sap.ui.base.ObjectPool(Popup.BlindLayer);
	// End of BlindLayer
	
	//****************************************************
	//ShieldLayer et al
	//****************************************************
	
	/**
	* @class
	* @private
	* @name sap.ui.core.Popup.ShieldLayer
	*/
	Popup.Layer.extend("sap.ui.core.Popup.ShieldLayer", {
		constructor: function() {
			Popup.Layer.apply(this);
		}
	});
	
	Popup.ShieldLayer.prototype.getDomString = function(){
		return "<div class=\"sapUiPopupShield\" id=\"sap-ui-shieldlayer-" + jQuery.sap.uid() + "\"></div>";
	};
	
	/**
	* Facility for reuse of created shield layers.
	* @type sap.ui.base.ObjectPool
	* @private
	* @name sap.ui.core.Popup#oShieldLayerPool
	*/
	Popup.prototype.oShieldLayerPool = new sap.ui.base.ObjectPool(Popup.ShieldLayer);
	//End of ShieldLayer
	
	// Begin of Popup-Stacking facilities
	(function() {
		var iLastZIndex = 0;
	
		/**
		 * Returns the last z-index that has been handed out. does not increase the internal z-index counter.
		 *
		 * @returns {Number}
		 * @public
		 * @name sap.ui.core.Popup.getLastZIndex
		 * @function
		 */
		Popup.getLastZIndex = function(){
			return iLastZIndex;
		};
	
		/**
		 * Returns the last z-index that has been handed out. does not increase the internal z-index counter.
		 *
		 * @returns {Number}
		 * @public
		 * @name sap.ui.core.Popup#getLastZIndex
		 * @function
		 */
		Popup.prototype.getLastZIndex = function(){
			return Popup.getLastZIndex();
		};
	
		/**
		 * Returns the next available z-index on top of the existing/previous popups. Each call increases the internal z-index counter and the returned z-index.
		 *
		 * @returns {Number} the next z-index on top of the Popup stack
		 * @public
		 * @name sap.ui.core.Popup.getNextZIndex
		 * @function
		 */
		Popup.getNextZIndex = function(){
			return (iLastZIndex += 10);
		};
	
		/**
		 * Returns the next available z-index on top of the existing/previous popups. Each call increases the internal z-index counter and the returned z-index.
		 *
		 * @returns {Number} the next z-index on top of the Popup stack
		 * @public
		 * @name sap.ui.core.Popup#getNextZIndex
		 * @function
		 */
		Popup.prototype.getNextZIndex = function(){
			return Popup.getNextZIndex();
		};
	}());
	// End of Popup-Stacking facilites
	
	/**
	 * Opens the popup's content at the position either specified here or beforehand via {@link #setPosition}.
	 * Content must be capable of being positioned via "position:absolute;"
	 * All parameters are optional (open() may be called without any parameters). iDuration may just be omitted, but if any of "at", "of", "offset", "collision" is given, also the preceding positioning parameters ("my", at",...) must be given.
	 *
	 * If the Popup's OpenState is different from "CLOSED" (i.e. if the Popup is already open, opening or closing), the call is ignored.
	 *
	 * @param {int} [iDuration] animation duration in milliseconds; default is the jQuery preset "fast". For iDuration == 0 the opening happens synchronously without animation.
	 * @param {sap.ui.core.Popup.Dock} [my=sap.ui.core.Popup.Dock.CenterCenter] the popup content's reference position for docking
	 * @param {sap.ui.core.Popup.Dock} [at=sap.ui.core.Popup.Dock.CenterCenter] the "of" element's reference point for docking to
	 * @param {Element|sap.ui.core.Element} [of=document] the DOM Element or UI5 Element to dock to
	 * @param {string} [offset='0 0'] the offset relative to the docking point, specified as a string with space-separated pixel values (e.g. "0 10" to move the popup 10 pixels to the right). If the docking of both "my" and "at" are both RTL-sensitive ("begin" or "end"), this offset is automatically mirrored in the RTL case as well.
	 * @param {string} [collision='flip'] defines how the position of an element should be adjusted in case it overflows the window in some direction.
	 * @param {boolean} [followOf=false] defines whether the popup should follow the dock reference when the reference changes its position.
	 * @public
	 * @name sap.ui.core.Popup#open
	 * @function
	 */
	Popup.prototype.open = function(iDuration, my, at, of, offset, collision, followOf) {
		jQuery.sap.assert(this.oContent, "Popup content must have been set by now");
		// other asserts follow after parameter shifting
	
		if(this.eOpenState != sap.ui.core.OpenState.CLOSED) {
			return;
		}
	
		this.eOpenState = sap.ui.core.OpenState.OPENING;
	
		var oStatic = sap.ui.getCore().getStaticAreaRef();
		oStatic = sap.ui.getCore().getUIArea(oStatic);
		
		// If the content is a control and has no parent, add it to the static UIArea.
		// This makes automatic rerendering after invalidation work.
		// When the popup closes, the content is removed again from the static UIArea.
		this._bContentAddedToStatic = false;
		if ( this.oContent instanceof Control && !this.oContent.getParent() ) {
			oStatic.addContent(this.oContent, true);
			this._bContentAddedToStatic = true;
		}
	
		// Check if the content isn't connected properly to an UI-area. This could cause strange behavior of events and rendering.
		// To find a Popup issue in this case a warning should be logged to the console.
		//
		// E.g. if the content has a different UI-area than its parent -> warning is thrown if 'sap.ui.core.Popup._bEnableUIAreaCheck'
		// is set
		if(this.oContent.getUIArea) {
			var oArea = this.oContent.getUIArea();
			
			if(oArea === null) {
				jQuery.sap.log.warning("The Popup content is NOT connected with an UIArea and may not work properly!");
			} else if (Popup._bEnableUIAreaCheck && oArea.getRootNode().id !== oStatic.getRootNode().id) {
	
				// the variable 'sap.ui.core.Popup._bEnableUIAreaCheck' isn't defined anywhere. To enable this check this variable
				// has to be defined within the console or somehow else.
				jQuery.sap.log.warning("The Popup content is NOT connected with the static-UIArea and may not work properly!");
			}
		}
	
		// iDuration is optional... if not given:
		if (typeof(iDuration) == "string") {
			followOf = collision;
			collision = offset;
			offset = of;
			of = at;
			at = my;
			my = iDuration;
			iDuration = -1;
		}
	
		// if no arguments are passed iDuration has to be set to -1
		if (iDuration === undefined) {
			iDuration = -1;
		}
	
		// all other parameters must be given if any subsequent parameter is given, hence no more shifting
		// now every parameter should be in the right variable
	
		jQuery.sap.assert(iDuration === -1 || (typeof iDuration === "number" && iDuration % 1 == 0), "iDuration must be an integer (or omitted)"); // omitted results in -1
		jQuery.sap.assert(my === undefined || typeof my === "string", "my must be a string or empty");
		jQuery.sap.assert(at === undefined || typeof at === "string", "at must be a string or empty");
		jQuery.sap.assert(!of || typeof of === "object" || typeof of === "function", "of must be empty or an object");
		jQuery.sap.assert(!offset || typeof offset === "string", "offset must be empty or a string");
		jQuery.sap.assert(!collision || typeof collision === "string", "collision must be empty or a string");
	
		// disable for mobile or desktop browser in touch mode
		if(this.restoreFocus){
	
			// save current focused element to restore the focus after closing
			this._oPreviousFocus = Popup.getCurrentFocusInfo();
		}
	
		var $Ref = this._$(true);
		var iRealDuration = "fast";
		if((iDuration === 0) || (iDuration > 0)) {
			iRealDuration = iDuration;
		} else if ((this._durations.open === 0) || (this._durations.open > 0)) {
			iRealDuration = this._durations.open;
		}
	
		// Ensure right position is used for this call
		var _oPosition;
		if (my || at || of || offset || collision) {
			_oPosition = this._createPosition(my, at, of, offset, collision);
		} else {
			_oPosition = this._oPosition;
		}
		if (!_oPosition.of) {
			_oPosition.of = this._oPosition.of || document;
		}
	
		this._iZIndex = this._iZIndex === this.getLastZIndex() ? this._iZIndex : this.getNextZIndex();
	
		var oStaticArea = sap.ui.getCore().getStaticAreaRef();
		$Ref.css("position", "absolute").css("visibility", "hidden");
	
		if(!($Ref[0].parentNode == oStaticArea)) { // do not move in DOM if not required - otherwise this destroys e.g. the RichTextEditor
			$Ref.appendTo(oStaticArea);
		}
		$Ref.css("z-index", this._iZIndex);
	
		jQuery.sap.log.debug("position popup content " + $Ref.attr("id") + " at " + (window.JSON ? JSON.stringify(_oPosition.at) : String(_oPosition.at)));
		this._applyPosition(_oPosition);
	
		if (followOf !== undefined) {
			this.setFollowOf(followOf);
		}
	
		var that = this;
	
		// shield layer is needs for iOS devices to prevent the delayed mouse events from reaching the dom element in popup while it's being open.
		if(sap.ui.Device.os.ios && sap.ui.Device.support.touch){
			if(this._oTopShieldLayer){
				// very extreme case where the same popop is opened and closed again before the 500ms timed out.
				// reuse the same shieldlayer and clear the timeout
				jQuery.sap.clearDelayedCall(this._iTopShieldRemoveTimer);
				this._iTopShieldRemoveTimer = null;
			}else{
				this._oTopShieldLayer = this.oShieldLayerPool.borrowObject($Ref, this._iZIndex + 1);
			}
	
			// hide the shield layer after the delayed mouse events are fired.
			this._iTopShieldRemoveTimer = jQuery.sap.delayedCall(500, this, function(){
				this.oShieldLayerPool.returnObject(this._oTopShieldLayer);
				this._oTopShieldLayer = null;
				this._iTopShieldRemoveTimer = null;
			});
		}
	
		var fnOpened = function() {
			$Ref.css("display","block");
	
			// in modal and auto-close case the focus needs to be in the popup; provide this generic implementation as helper, but users can change the focus in the "opened" event handler
			if (that._bModal || that._bAutoClose || that._sInitialFocusId) {
				var domRefToFocus = null;
				if (that._sInitialFocusId) {
					var control = sap.ui.getCore().byId(that._sInitialFocusId);
	
					if (control) {
						domRefToFocus = control.getFocusDomRef();
					}
					domRefToFocus = domRefToFocus || jQuery.sap.domById(that._sInitialFocusId);
				}
	
				jQuery.sap.focus(domRefToFocus || $Ref.firstFocusableDomRef());
			}
	
			that.eOpenState = sap.ui.core.OpenState.OPEN;
	
			if(that.getFollowOf()){
				Popup.DockTrigger.addListener(Popup.checkDocking, that);
			}
	
			that._updateBlindLayer();
	
			// notify that opening has completed
			if (!!sap.ui.Device.browser.internet_explorer && sap.ui.Device.browser.version == 9) {
				jQuery.sap.delayedCall(0,that,function(){
					that.fireEvent(Popup.M_EVENTS.opened);
				});
			} else {
				that.fireEvent(Popup.M_EVENTS.opened);
			}
		};
	
		// and show the popup content
		$Ref.toggleClass("sapUiShd", this._bShadow).hide().css("visibility", "visible");
		if (iRealDuration == 0) { // do not animate if there is a duration == 0
			// internal status that any animation has been finished should set to true;
			this.bOpen = true;
			fnOpened.apply(); // otherwise call after-opening functions directly
		} else {
			if (this._animations.open) { // if custom animation is defined, call it
				this._animations.open.call(null, $Ref, iRealDuration, fnOpened);
			} else { // otherwise play the default animation
				$Ref.fadeIn(iRealDuration, fnOpened);
			}
		}
	
		// get (and 'show' i.e. activate) the BlindLayer
		if(!!sap.ui.Device.browser.internet_explorer && Popup._activateBlindLayer) {
			this._oBlindLayer = this.oBlindLayerPool.borrowObject($Ref, this._iZIndex - 1);
		} // -1 = BlindLayer, -2 = BlockLayer
	
		if(this._bModal) {
			this._showBlockLayer();
		}
	
		// add Delegate to hosted content for handling of events (e.g. onfocusin)
		if(this.oContent instanceof sap.ui.core.Element) {
			this.oContent.addDelegate(this);
		}
		
		this.bOpen = true;
	
		if (this._bModal || this._bAutoClose) { // initialize focus handling
			this.fEventHandler = jQuery.proxy(this.onFocusEvent, this);
			// make sure to notice all blur's in the popup
			var jPopupRoot = $Ref;//this._$();
			if(document.addEventListener && !sap.ui.Device.browser.internet_explorer) { //FF, Safari
				document.addEventListener("focus", this.fEventHandler, true);
				jPopupRoot.get(0).addEventListener("blur", this.fEventHandler, true);
				if (this._aAutoCloseAreas) {
					for (var i = 0; i < this._aAutoCloseAreas.length; i++) {
						this._aAutoCloseAreas[i].addEventListener("blur", this.fEventHandler, true);
					}
				}
			} else { // IE8
				jQuery(document).bind("activate." + this._id, this.fEventHandler);
				jPopupRoot.bind("deactivate." + this._id, this.fEventHandler);
				if (this._aAutoCloseAreas) {
					for (var i = 0; i < this._aAutoCloseAreas.length; i++) {
						jQuery(this._aAutoCloseAreas[i]).bind("deactivate." + this._id, this.fEventHandler);
					}
				}
			}
		}
	
		//autoclose implementation for mobile or desktop browser in touch mode
		if(this.touchEnabled && !this._bModal && this._bAutoClose){
		jQuery(document).on("touchstart mousedown", jQuery.proxy(this._fAutoCloseHandler, this));
		}
	
		//  register resize handler for blindlayer resizing
		if(this._oBlindLayer) {
			this._resizeListenerId = sap.ui.core.ResizeHandler.register(this._$().get(0), jQuery.proxy(this.onresize, this));
		}
	};
	
	/**
	 * Handles the focus/blur events.
	 *
	 * @param oBrowserEvent the browser event
	 * @private
	 * @name sap.ui.core.Popup#onFocusEvent
	 * @function
	 */
	Popup.prototype.onFocusEvent = function(oBrowserEvent) {
		var oEvent = jQuery.event.fix(oBrowserEvent);
		var type = (oEvent.type == "focus" || oEvent.type == "activate") ? "focus" : "blur";
		var bContains = false;
	
		if (type=="focus") {
			var oDomRef = this._$().get(0);
			if (oDomRef) {
				bContains = oDomRef == oEvent.target || jQuery.contains(oDomRef, oEvent.target);
	
				// if focus does not go into the popup, check any other areas belonging to it
				if (!bContains && this._aAutoCloseAreas) {
					for (var i = 0; i < this._aAutoCloseAreas.length; i++) {
						bContains = this._aAutoCloseAreas[i] == oEvent.target || jQuery.contains(this._aAutoCloseAreas[i], oEvent.target);
						if (bContains) {
							break;
						}
					}
				}
	
				// check if any additional focusable elements should be focused
				if (!bContains && this._aFocusableArea) {
					var j = this._aFocusableArea.length;
					for (i = 0; i < j; i++) {
						if (jQuery.sap.domById(this._aFocusableArea[i])) {
							bContains = oEvent.target.id === this._aFocusableArea[i] || jQuery.contains(jQuery.sap.domById(this._aFocusableArea[i]), oEvent.target);
							if (bContains) {
								break;
							}
						}
					}
				}
	
				jQuery.sap.log.debug("focus event on " + oEvent.target.id + ", contains: " + bContains);
	
				if (this._bModal && !bContains) { // case: modal popup and focus has gone somewhere else in the document
	
					// The popup is modal, but the focus has moved to a part of the document that is NOT inside the popup
					// check whether this modal popup is the topmost one
					var bTopMost = (Popup.getLastZIndex() == this._iZIndex);
	
					if (bTopMost) {
	
						// if in desktop browser or the DOM node which has the focus is input outside the popup,
						// focus on the last blurred element
						if (!sap.ui.Device.support.touch || jQuery(oEvent.target).is(":input")) {
	
							// set the focus back to the last focused element inside the popup or at least to the popup root
							var oDomRefToFocus = this.oLastBlurredElement ? this.oLastBlurredElement : oDomRef;
							jQuery.sap.focus(oDomRefToFocus);
						}
					}
				} else if (this._bAutoClose && bContains && this._sTimeoutId) { // case: autoclose popup and focus has returned into the popup immediately
	
					// focus has returned, so it did only move inside the popup => clear timeout
					if(this._sTimeoutId){
						jQuery.sap.clearDelayedCall(this._sTimeoutId);
						this._sTimeoutId = null;
					}
				}
			}
		} else if (type=="blur") { // an element inside the popup is loosing focus - remember in case we need to re-set
			jQuery.sap.log.debug("blur event on " + oEvent.target.id);
			if (this._bModal) {
				this.oLastBlurredElement = oEvent.target;
			} else if (this._bAutoClose) {
				// focus/blur for handling autoclose is disabled for desktop browsers which are not in the touch simulation mode
				// create timeout for closing the popup if there is no focus immediately returning to the popup
				if (!this.touchEnabled && !this._sTimeoutId) {
					this._sTimeoutId = jQuery.sap.delayedCall(0, this, "close"); // TODO: do we need a "onBeforeClose" event?
				}
			}
		}
	};
	
	/**
	 * Sets the ID of the element that should be focused once the popup opens.
	 * If the given ID is the ID of an existing Control, this Control's focusDomRef will be focused instead, which may be an HTML element with a different ID (usually a sub-element inside the Control).
	 * If no existing element ID is supplied and the Popup is modal or auto-close, the Popup will instead focus the first focusable element.
	 *
	 * @param sId the ID of the DOM element to focus
	 * @public
	 * @name sap.ui.core.Popup#setInitialFocusId
	 * @function
	 */
	Popup.prototype.setInitialFocusId = function(sId) {
		jQuery.sap.assert(!sId || typeof sId === "string", "sId must be a string or empty");
		this._sInitialFocusId = sId;
	};
	
	/**
	 * Closes the popup.
	 *
	 * If the Popup is already closed or in the process of closing, calling this method does nothing.
	 * If the Popup is in the process of being opened and closed with a duration of 0, calling this method does nothing.
	 * If the Popup is in the process of being opened and closed with an animation duration, the animation will be chained, but this functionality is dangerous,
	 * may lead to inconsistent behavior and is thus not recommended and may even be removed.
	 *
	 * @param {int} [iDuration] animation duration in milliseconds; default is the jQuery preset "fast".  For iDuration == 0 the closing happens synchronously without animation.
	 * @public
	 * @name sap.ui.core.Popup#close
	 * @function
	 */
	Popup.prototype.close = function(iDuration) {
		jQuery.sap.assert(iDuration === undefined || (typeof iDuration === "number" && (iDuration % 1 == 0)), "iDuration must be empty or an integer");
	
		if(this.eOpenState == sap.ui.core.OpenState.CLOSED || this.eOpenState == sap.ui.core.OpenState.CLOSING) {
			return;
		} // also close when OPENING
		// the above will queue the animations (close only after opening), but may lead to the CLOSED event happening before the OPENED event
	
		var iRealDuration = "fast";
		if((iDuration === 0) || (iDuration > 0)) {
			iRealDuration = iDuration;
		} else if ((this._durations.close === 0) || (this._durations.close > 0)) {
			iRealDuration = this._durations.close;
		}
	
		if (iRealDuration === 0 && this.eOpenState == sap.ui.core.OpenState.OPENING) {
			return;
		} // do not allowed immediate closing while opening
	
		//if(this.eOpenState != sap.ui.core.OpenState.OPEN) return; // this is the more conservative approach: to only close when the Popup is OPEN
	
		this.eOpenState = sap.ui.core.OpenState.CLOSING;
		
		if (this.getFollowOf()) {
			Popup.DockTrigger.removeListener(Popup.checkDocking, this);
		}
	
		if (this._aFocusableArea) {
			delete this._aFocusableArea;
		}
	
		// unsubscribe the event listeners from EventBus
		if (this._bFocusableListenersRegistered) {
			delete this._bFocusableListenersRegistered;
	
			var sEventId = "sap.ui.core.Popup.addFocusableContent-" + this._id;
			sap.ui.getCore().getEventBus().unsubscribe("sap.ui", sEventId, this._addFocusableArea, this);
	
			sEventId = "sap.ui.core.Popup.removeFocusableContent-" + this._id;
			sap.ui.getCore().getEventBus().unsubscribe("sap.ui", sEventId, this._removeFocusableArea, this);
		}
	
		// If we added the content control to the static UIArea,
		// then we should remove it again now.
		// Assumption: application did not move the content in the meantime!
		if ( this.oContent && this._bContentAddedToStatic ) {
	
			//Fix for RTE in PopUp
			sap.ui.getCore().getEventBus().publish("sap.ui","__beforePopupClose", { domNode : this._$().get(0) });
			var oStatic = sap.ui.getCore().getStaticAreaRef();
			oStatic = sap.ui.getCore().getUIArea(oStatic);
			oStatic.removeContent(oStatic.indexOfContent(this.oContent), true);
		}
	
		this._bContentAddedToStatic = false;
	
		this._sTimeoutId = null;
	
		if (this.fEventHandler) { // remove focus handling
			var jPopupRoot = this._$();
			if(document.removeEventListener && !sap.ui.Device.browser.internet_explorer) { //FF, Safari
				document.removeEventListener("focus", this.fEventHandler, true);
				jPopupRoot.get(0).removeEventListener("blur", this.fEventHandler, true);
				if (this._aAutoCloseAreas) {
					for (var i = 0; i < this._aAutoCloseAreas.length; i++) {
						this._aAutoCloseAreas[i].removeEventListener("blur", this.fEventHandler, true);
					}
				}
			} else { // IE8
				jQuery(document).unbind("activate." + this._id, this.fEventHandler);
				jPopupRoot.unbind("deactivate." + this._id, this.fEventHandler);
				if (this._aAutoCloseAreas) {
					for (var i = 0; i < this._aAutoCloseAreas.length; i++) {
						jQuery(this._aAutoCloseAreas[i]).unbind("deactivate." + this._id, this.fEventHandler);
					}
				}
			}
			this.fEventHandler = null;
		}
	
		//deregister the autoclose handler for mobile
		if(this.touchEnabled){
			if(!this._bModal && this._bAutoClose){
			jQuery(document).off("touchstart mousedown", this._fAutoCloseHandler);
			}
		}
		
		if(this.oContent instanceof sap.ui.core.Element) {
			this.oContent.removeDelegate(this);
		}
	
		var $Ref = this._$();
	
		// get (and 'hide' i.e. remove) the BlindLayer
		if(this._oBlindLayer) {
			this.oBlindLayerPool.returnObject(this._oBlindLayer);
		}
		this._oBlindLayer = null;
	
		var that = this;
		
		// shield layer is needs for iOS devices to prevent the delayed mouse events from reaching the underneath dom element.
		if(sap.ui.Device.os.ios && sap.ui.Device.support.touch){
			if(this._oBottomShieldLayer){
	
				// very extreme case where the same popop is opened and closed again before the 500ms timed out.
				// reuse the same shieldlayer and clear the timeout
				jQuery.sap.clearDelayedCall(this._iBottomShieldRemoveTimer);
				this._iBottomShieldRemoveTimer = null;
			}else{
				this._oBottomShieldLayer = this.oShieldLayerPool.borrowObject($Ref, this._iZIndex - 3);
			}
	
			// hide the shield layer after the delayed mouse events are fired.
			this._iBottomShieldRemoveTimer = jQuery.sap.delayedCall(500, this, function(){
				this.oShieldLayerPool.returnObject(this._oBottomShieldLayer);
				this._oBottomShieldLayer = null;
				this._iBottomShieldRemoveTimer = null;
			});
		}
		
		var fnClose = function() { // the function to call when the popup closing animation has completed
			jQuery($Ref).hide().
				css("visibility", "inherit").
				css("left", "0px").
				css("top", "0px").
				css("right", "");
	
			//disabled for mobile or desktop browser in touch mode
			if(that.restoreFocus){
				if (that._bModal){
	
					// try to set the focus back to whatever was focused before. Do this here because animation needs to be finished.
					//- TODO: currently focus is restored only for modal popups. Non modal popups have to do it themselves because the outside focus can change!
					Popup.applyFocusInfo(that._oPreviousFocus);
					that._oPreviousFocus = null;
					that.oLastBlurredElement = null;
				}
			}
	
			that.bOpen = false;
			that.eOpenState = sap.ui.core.OpenState.CLOSED;
	
			// notify users that the popup is now officially closed
			that.fireEvent(Popup.M_EVENTS.closed);
		};
	
		if (iRealDuration == 0) { // iRealDuration == 0 means: no animation!
			fnClose.apply();
		} else {
			if (this._animations.close) {
				this._animations.close.call(null, $Ref, iRealDuration, fnClose); // play custom animation, if supplied
			} else {
				$Ref.fadeOut(iRealDuration, fnClose); // otherwise use jQuery animation
			}
		}
	
		if(this._bModal) {
			this._hideBlockLayer();
		}
	
		//deregister resize handler
		if (this._resizeListenerId) {
			sap.ui.core.ResizeHandler.deregister(this._resizeListenerId);
			this._resizeListenerId = null;
		}
	};
	
	/**
	 * Returns an object containing as much information about the current focus as possible, or null if no focus is present or no focus information can be gathered.
	 * @name sap.ui.core.Popup.getCurrentFocusInfo
	 * @function
	 */
	Popup.getCurrentFocusInfo = function() {
		var _oPreviousFocus = null;
		var focusedControlId = sap.ui.getCore().getCurrentFocusedControlId();
		if(focusedControlId) {
	
			// a SAPUI5 control was focused before
			var oFocusedControl = sap.ui.getCore().getControl(focusedControlId);
			_oPreviousFocus = {'sFocusId':focusedControlId,'oFocusInfo': oFocusedControl ? oFocusedControl.getFocusInfo() : {}}; // add empty oFocusInfo to avoid the need for all recipients to check
		} else {
			try {
	
				// not a SAPUI5 control... but if something has focus, save as much information about it as available
				var oElement = document.activeElement;
				if (oElement) {
					_oPreviousFocus = {'sFocusId':oElement.id,'oFocusedElement':oElement,'oFocusInfo':{}}; // add empty oFocusInfo to avoid the need for all recipients to check
				}
			} catch (ex) {
	
				// IE9 throws an Unspecified Error when accessing document.activeElement inside a frame before body.onload
				// This is not an issue, as there is just no focus yet to restore
				// Other browsers do not fail here, but even if they would, the worst thing would be a non-restored focus
				_oPreviousFocus = null;
			}
		}
		return _oPreviousFocus;
	};
	
	/**
	 *
	 * @name sap.ui.core.Popup.applyFocusInfo
	 * @function
	 */
	Popup.applyFocusInfo = function(oPreviousFocus) {
		if(oPreviousFocus) {
			var oFocusedControl = sap.ui.getCore().getControl(oPreviousFocus.sFocusId);
			if(oFocusedControl) {
	
				// if a SAPUI5 control had been focused, just re-focus it
				oFocusedControl.applyFocusInfo(oPreviousFocus.oFocusInfo);
			} else {
	
				// no SAPUI5 control... try to find the control by ID if an ID was there
				var oElement = jQuery.sap.domById(oPreviousFocus.sFocusId)
						|| oPreviousFocus.oFocusedElement; // if not even an ID was available when focus was lost maybe the original DOM element is still there
				jQuery.sap.focus(oElement); // also works for oElement == null
			}
		}
	};
	
	/**
	 * Sets the content this instance of the Popup should render.
	 * Content must be capable of being positioned via position:absolute;
	 * @param {sap.ui.core.Control | DOMRef } oContent
	 * @return {sap.ui.core.Popup} <code>this</code> to allow method chaining
	 * @public
	 * @name sap.ui.core.Popup#setContent
	 * @function
	 */
	Popup.prototype.setContent = function(oContent) {
		jQuery.sap.assert(typeof oContent === "object", "oContent must be an object");
		this.oContent = oContent;
		return this;
	};
	
	/**
	 * Returns this Popup's content.
	 * @return {sap.ui.core.Control | DOMRef } the content that has been set previously (if any)
	 * @public
	 * @name sap.ui.core.Popup#getContent
	 * @function
	 */
	Popup.prototype.getContent = function() {
		return this.oContent;
	};
	
	/**
	 * Sets the position of the Popup (if you refer to a Control as anchor then do not
	 * use the DOMRef of the control which might change after re-renderings).
	 * Optional parameters can only be omitted when all subsequent parameters are omitted as well.
	 *
	 * @param {sap.ui.core.Popup.Dock} my specifies which point of the given Content should be aligned
	 * @param {sap.ui.core.Popup.Dock | object {left: {sap.ui.core.CSSSize}, top: {sap.ui.core.CSSSize}}} at specifies the point of the reference element to which the given Content should be aligned
	 * @param {string | sap.ui.core.Control | DOMRef | jQuery | jQuery.Event} [of=document] specifies the reference element to which the given content should be aligned as specified in the other parameters
	 * @param {string} [offset='0 0'] the offset relative to the docking point, specified as a string with space-separated pixel values (e.g. "0 10" to move the popup 10 pixels to the right). If the docking of both "my" and "at" are both RTL-sensitive ("begin" or "end"), this offset is automatically mirrored in the RTL case as well.
	 * @param {string} [collision] defines how the position of an element should be adjusted in case it overflows the window in some direction. The valid values that refer to jQuery-UI's position parameters are "flip", "fit" and "none".
	 * @return {sap.ui.core.Popup} <code>this</code> to allow method chaining
	 * @public
	 * @name sap.ui.core.Popup#setPosition
	 * @function
	 */
	Popup.prototype.setPosition = function(my, at, of, offset, collision) {
		jQuery.sap.assert(typeof my === "string", "my must be a string");
		jQuery.sap.assert(typeof at === "string" || (typeof at === "object" && (typeof at.left === "number") && (typeof at.top === "number")), "my must be a string or an object with 'left' and 'top' properties");
		jQuery.sap.assert(!of || typeof of === "object" || typeof of === "function", "of must be empty or an object");
		jQuery.sap.assert(!offset || typeof offset === "string", "offset must be empty or a string");
		jQuery.sap.assert(!collision || typeof collision === "string", "collision must be empty or a string");
	
		this._oPosition = this._createPosition(my, at, of, offset, collision);
	
		if(this.eOpenState != sap.ui.core.OpenState.CLOSED) {
			this._applyPosition(this._oPosition);
			this._oBlindLayer && this._oBlindLayer.update(this._$());
		}
	
		return this;
	};
	
	Popup.prototype._createPosition = function(my, at, of, offset, collision) {
	
		// check if new jQuery-Ui (>1.9) offset is used
		var bNewOffset = false;
		if (my && (my.indexOf("+") >=0 || my.indexOf("-") >=0)) {
			bNewOffset = true;
			if (offset && offset != "0 0") {
				jQuery.sap.log.warning("offset used in my and in offset, the offset value will be ignored", "sap.ui.core.Popup", "setPosition");
			}
			offset = null;
		}
	
		var oPosition = jQuery.extend({},this._oDefaultPosition, {
			"my": my || this._oDefaultPosition.my, // to use default my if empty string
			"at": at || this._oDefaultPosition.at, // to use default at if empty string
			"of": of,
			"offset": offset,
			"collision": collision
		});
	
		if( !jQuery.ui.version) {
			// only jquery-ui-position.js loaded, not jquery-ui-core.js, so no version info available
			if ( Popup._bNewOffset == null ) {
				// check whether the jQuery UI version is new (no more offset parameter) or not 
				Popup._bNewOffset = true;
				if (!(sap.ui.Device.browser.internet_explorer && sap.ui.Device.browser.version == 8 && jQuery.sap.Version(jQuery().jquery).compareTo("1.8.1") < 0)) {
					// In IE8 and jQuery 1.7.1 this check crashes. So it is not supported to use a older jQueryUi version without the core in this case.
					var $Div = jQuery(document.createElement("div"));
					$Div.position({
						of: window,
						using: function(position, data) {
							// the data parameter to the using callback was introduced together with the replacement for 'offset'
							Popup._bNewOffset = (data !== undefined);
						}
					});
				}
	
			}
		}
	
		if( Popup._bNewOffset || jQuery.sap.Version(jQuery.ui.version).compareTo("1.8.23") > 0) {
			if (offset && offset != "0 0") {
				// convert offset to my
				var aMy = oPosition.my.split(" ");
				var aOffset = offset.split(" ");
				var aSign = [parseInt(aOffset[0]) < 0 ? "" : "+", parseInt(aOffset[1]) < 0 ? "" : "+"]; // no "-" sign because already in numer of offset
	
				oPosition.my = aMy[0] + aSign[0] + aOffset[0] + " " + aMy[1] + aSign[1] + aOffset[1];
				oPosition.offset = null;
			}
		}else if(bNewOffset){
			// new offset used with old jQuery version -> convert into offset property
			var aMy = oPosition.my.split(" ");
			var aOffset = ["",""];
			var iIndex = aMy[0].indexOf("+");
			if (iIndex < 0) {
				iIndex = aMy[0].indexOf("-");
			}
			if (iIndex >= 0) {
				aOffset[0] = aMy[0].slice(iIndex);
				aMy[0] = aMy[0].slice(0, iIndex);
			}
	
			iIndex = aMy[1].indexOf("+");
			if (iIndex < 0) {
				iIndex = aMy[1].indexOf("-");
			}
			if (iIndex >= 0) {
				aOffset[1] = aMy[1].slice(iIndex);
				aMy[1] = aMy[1].slice(0, iIndex);
			}
	
			oPosition.my = aMy[0] + " " + aMy[1];
			oPosition.offset = aOffset[0] + " " + aOffset[1];
		}
	
		return oPosition;
	
	};
	
	Popup.prototype._getPositionOffset = function() {
	
		var aOffset = [];
	
		if (this._oPosition.my && (this._oPosition.my.indexOf("+") >=0 || this._oPosition.my.indexOf("-") >=0)) {
			var aMy = this._oPosition.my.split(" ");
			var iIndex = aMy[0].indexOf("+");
			if (iIndex < 0) {
				iIndex = aMy[0].indexOf("-");
			}
			if (iIndex >= 0) {
				aOffset[0] = aMy[0].slice(iIndex);
			}
	
			iIndex = aMy[1].indexOf("+");
			if (iIndex < 0) {
				iIndex = aMy[1].indexOf("-");
			}
			if (iIndex >= 0) {
				aOffset[1] = aMy[1].slice(iIndex);
			}
	
		}else if(this._oPosition.offset) {
			aOffset = this._oPosition.offset.split(" ");
		}
	
		return aOffset;
	
	};
	
	/**
	 * Applies the given position to the Popup which is assumed to be currently open
	 *
	 * @private
	 * @name sap.ui.core.Popup#_applyPosition
	 * @function
	 */
	Popup.prototype._applyPosition = function(oPosition) {
		var bRtl = sap.ui.getCore().getConfiguration().getRTL();
		var $Ref = this._$();
		var oAt = oPosition.at;
	
		if(typeof(oAt) === "string") {
			$Ref.css("display", "block").position(this._resolveReference(this._convertPositionRTL(oPosition, bRtl))); // must be visible, so browsers can calculate its offset!
			this._fixPositioning(oPosition, bRtl);
		} else if(sap.ui.core.CSSSize.isValid(oAt.left) && sap.ui.core.CSSSize.isValid(oAt.top)) {
			$Ref.css("left", oAt.left).css("top", oAt.top);
		} else if(sap.ui.core.CSSSize.isValid(oAt.right) && sap.ui.core.CSSSize.isValid(oAt.top)) {
			$Ref.css("right", oAt.right).css("top", oAt.top);
		} else if(typeof(oAt.left) === "number" && typeof(oAt.top) === "number") {
			var domRef = $Ref[0];
			if (domRef && domRef.style.right) { // in some RTL cases leave the Popup attached to the right side of the browser window
				var width = $Ref.outerWidth();
				$Ref.css("right", (document.documentElement.clientWidth - (oAt.left + width)) + "px").css("top", oAt.top + "px");
			} else {
				$Ref.css("left", oAt.left + "px").css("top", oAt.top + "px");
			}
		}
	
		// remember given position for later redraws
		this._oLastPosition = oPosition;
		this._oLastOfRect = this._calcOfRect(oPosition.of);
	};
	
	/**
	 * Calculates the rect information of the given parameter.
	 * 
	 * @param {Element|sap.ui.core.Element} oOf the DOM Element or UI Element instance on which the calculation is done
	 * @returns {object} the rect infomartion which contains the top, left, width, height of the given object
	 * @private
	 * @name sap.ui.core.Popup#_calcOfRect
	 * @function
	 */
	Popup.prototype._calcOfRect = function(oOf){
		return  jQuery(oOf instanceof sap.ui.core.Element ? oOf.getDomRef() : oOf).rect();
	};
	
	/**
	 * Converts a position string with RTL-independent settings like "begin top" or "end center" into a string understood by
	 * jQuery UI position() by replacing "begin" and "end" with the respective concrete value, depending on RTL settings.
	 * The returned object is a clone, the original is unchanged.
	 *
	 * @private
	 * @name sap.ui.core.Popup#_convertPositionRTL
	 * @function
	 */
	Popup.prototype._convertPositionRTL = function(oPosition, bRtl) {
		var oFixedPos = jQuery.extend({}, oPosition); // don't modify the original object
	
		if (bRtl) {
			var bNewOffset = false;
			if (oFixedPos.my && (oFixedPos.my.indexOf("+") >=0 || oFixedPos.my.indexOf("-") >=0)) {
				// check if new jQuery-Ui (>1.9) offset is used
				bNewOffset = true;
			}
	
			if ((oFixedPos.offset || bNewOffset)
					&& ((oFixedPos.my.indexOf("begin") > -1) || (oFixedPos.my.indexOf("end") > -1))
					&& ((oFixedPos.at.indexOf("begin") > -1) || (oFixedPos.at.indexOf("end") > -1))) {
				if (bNewOffset) {
					var aMy = oFixedPos.my.split(" ");
					if(aMy.length == 2) {
						oFixedPos.my = "";
						if (aMy[0]) {
							if (aMy[0].indexOf("begin") > -1 || aMy[0].indexOf("end") > -1) {
								if (aMy[0].indexOf("+") > -1) {
									aMy[0] = aMy[0].replace("+", "-");
								} else if (aMy[0].indexOf("-") > -1){
									aMy[0] = aMy[0].replace("-", "+");
								}
							}
							oFixedPos.my = aMy[0];
						}
						if (aMy[1]) {
							if (aMy[1].indexOf("begin") > -1 || aMy[1].indexOf("end") > -1) {
								if (aMy[1].indexOf("+") > -1) {
									aMy[1] = aMy[1].replace("+", "-");
								} else if (aMy[1].indexOf("-") > -1){
									aMy[1] = aMy[1].replace("-", "+");
								}
							}
							if (aMy[0]) {
								oFixedPos.my = oFixedPos.my + " ";
							}
							oFixedPos.my = oFixedPos.my + aMy[1];
						}
					}
				} else{
					oFixedPos.offset = this._mirrorOffset(oFixedPos.offset);
				}
			}
			oFixedPos.my = oFixedPos.my.replace("begin", "right").replace("end", "left");
			oFixedPos.at = oFixedPos.at.replace("begin", "right").replace("end", "left");
		} else {
			oFixedPos.my = oFixedPos.my.replace("end", "right").replace("begin", "left");
			oFixedPos.at = oFixedPos.at.replace("end", "right").replace("begin", "left");
		}
	
		return oFixedPos;
	};
	
	/**
	 * Mirrors the given offset which is a string containing two integer numbers separated by whitespace.
	 * (=negates the first number)
	 *
	 * @param {string} sOffset the offset to be mirrored
	 * @returns {string} the mirrored offset 
	 *
	 * @private
	 * @name sap.ui.core.Popup#_mirrorOffset
	 * @function
	 */
	Popup.prototype._mirrorOffset = function(sOffset) {
		var aOffset = jQuery.trim(sOffset).split(/\s/);
		var posX = parseInt(aOffset[0], 10);
		return (-posX) + " " + aOffset[aOffset.length-1]; // array could be longer than 2 with multiple whitespace characters
	};
	
	/**
	 * Changes the default positioning of the Popup ("left: ...px") to ("right: ...px"), maintaining the
	 * actual screen position, if the Popup should "grow to the left" when increasing in size.
	 * This is the case if:
	 * - LTR mode and horizontal alignment is right or end
	 * - RTL mode and horizontal alignment is right, begin or center
	 *
	 * @private
	 * @name sap.ui.core.Popup#_fixPositioning
	 * @function
	 */
	Popup.prototype._fixPositioning = function(sPosition, bRtl) {
		var my = sPosition.my;
		if (typeof(my) === "string") {
			if (bRtl && ((my.indexOf("right") > -1) || (my.indexOf("begin") > -1) || (my.indexOf("center") > -1))) {
				var $Ref = this._$();
				var right = jQuery(window).width() - $Ref.outerWidth() - $Ref.offset().left;
				$Ref.css("right", right + "px").css("left", "");
			} else if ((my.indexOf("right") > -1) || (my.indexOf("end") > -1)) {
	
				// LTR
				var $Ref = this._$();
				var right = jQuery(window).width() - $Ref.outerWidth() - $Ref.offset().left;
				$Ref.css("right", right + "px").css("left", "");
			}
		}
	};
	
	/**
	 * If the reference element is specified as a sap.ui.core.Element, then it is resolved to a DOM node.
	 * 
	 * @param {object} oPosition position info object describing the desired position of the popup.
	 * @returns {object} resolved position info
	 * @private
	 * @name sap.ui.core.Popup#_resolveReference
	 * @function
	 */
	Popup.prototype._resolveReference = function(oPosition) {
		var oResult = oPosition;
		if ( oPosition.of instanceof sap.ui.core.Element ) {
			oResult = jQuery.extend({}, oPosition, { of : oPosition.of.getDomRef()});
		}
	
		return oResult;
	};
	
	/**
	 * Determines whether the Popup should have a shadow (in supporting browsers).
	 * This also affects a currently open popup.
	 *
	 * @param {boolean} bShowShadow whether to show a shadow 
	 * @return {sap.ui.core.Popup} <code>this</code> to allow method chaining
	 * @public
	 * @name sap.ui.core.Popup#setShadow
	 * @function
	 */
	Popup.prototype.setShadow = function(bShowShadow) {
		jQuery.sap.assert(typeof bShowShadow === "boolean", "bShowShadow must be boolean");
		this._bShadow = bShowShadow;
		if(this.eOpenState != sap.ui.core.OpenState.CLOSED) {
			this._$().toggleClass("sapUiShd", bShowShadow);
		}
	
		return this;
	};
	
	/**
	 * Used to specify whether the Popup should be modal. A modal popup will put some fading "block layer" over the background and
	 * prevent attempts to put the focus outside/below the popup.
	 * Setting this while the popup is open will change "block layer" immediately.
	 *
	 * @param {boolean} bModal whether the Popup is of modal type
	 * @param {string} [sModalCSSClass] a CSS class (or space-separated list of classes) that should be added to the block layer
	 * @return {sap.ui.core.Popup} <code>this</code> to allow method chaining
	 * @public
	 * @name sap.ui.core.Popup#setModal
	 * @function
	 */
	Popup.prototype.setModal = function(bModal, sModalCSSClass) {
		jQuery.sap.assert(typeof bModal === "boolean", "bModal must be boolean");
		jQuery.sap.assert(!sModalCSSClass || typeof sModalCSSClass === "string", "sModalCSSClass must be empty or a string");
	
		var bOldModal = this._bModal;
		
		this._bModal = bModal;
		this._sModalCSSClass = sModalCSSClass;
		
		//update the blocklayer and autoclose handler when the popup is open
		if(this.isOpen()){
			if(bOldModal !== bModal){
				if(bModal){
					this._showBlockLayer();
				}else{
					this._hideBlockLayer();
				}
				
				if(this.touchEnabled && this._bAutoClose){
					if(!bModal){
	
						//register the autoclose handler when modal is set to false
					jQuery(document).on("touchstart mousedown", jQuery.proxy(this._fAutoCloseHandler, this));
					}else{
	
						//deregister the autoclose handler when modal is set to true
					jQuery(document).off("touchstart mousedown", this._fAutoCloseHandler);
					}
				}
			}
		}
		return this;
	};
	
	/**
	 * Used to specify whether the Popup should close as soon as
	 * - for non-touch environment: the focus leaves
	 * - for touch environment: user clicks the area which is outside the popup itself, the dom elemnt which popup aligns to (except document),
	 *  and one of the autoCloseAreas set by calling setAutoCloseAreas.
	 * @param {boolean} bAutoClose whether the Popup should close as soon as the focus leaves
	 * @return {sap.ui.core.Popup} <code>this</code> to allow method chaining
	 * @public
	 * @name sap.ui.core.Popup#setAutoClose
	 * @function
	 */
	Popup.prototype.setAutoClose = function(bAutoClose) {
		jQuery.sap.assert(typeof bAutoClose === "boolean", "bAutoClose must be boolean");
	
		if(this.touchEnabled && this.isOpen() && this._bAutoClose !== bAutoClose){
			if(!this._bModal){
				if(bAutoClose){
	
					//register the autoclose hanlder when autoclose is set to true
				jQuery(document).on("touchstart mousedown", jQuery.proxy(this._fAutoCloseHandler, this));
				}else{
	
					//deregister the autoclose handler when autoclose is set to false
				jQuery(document).off("touchstart mousedown", this._fAutoCloseHandler);
				}
			}
		}
	
		this._bAutoClose = bAutoClose;
		return this;
	};
	
	/**
	 * Sets the additional areas in the page that are considered part of the Popup when autoclose is enabled. 
	 * - non-touch environment: if the focus leaves the Popup but immediately enters one of these areas, the Popup does NOT close.
	 * - touch environment: if user clicks one of these areas, the Popup does NOT close.
	 *
	 * @param {DomRef[]} aAutoCloseAreas an array containing DOM elements considered part of the Popup; a value of null removes all previous areas
	 * @return {sap.ui.core.Popup} <code>this</code> to allow method chaining
	 * @public
	 * @name sap.ui.core.Popup#setAutoCloseAreas
	 * @function
	 */
	Popup.prototype.setAutoCloseAreas = function(aAutoCloseAreas) {
		jQuery.sap.assert(aAutoCloseAreas === null || jQuery.isArray(aAutoCloseAreas), "aAutoCloseAreas must be null or an array");
		this._aAutoCloseAreas = aAutoCloseAreas;
		return this;
	};
	
	/**
	 * Sets the animation functions to use for opening and closing the Popup. Any null value will be ignored and not change the respective animation function.
	 * When called, the animation functions receive three parameters:
	 * - the jQuery object wrapping the DomRef of the popup
	 * - the requested animation duration
	 * - a function that MUST be called once the animation has completed
	 *
	 * @param {function} fnOpen
	 * @param {function} fnClose
	 * @return {sap.ui.core.Popup} <code>this</code> to allow method chaining
	 * @public
	 * @name sap.ui.core.Popup#setAnimations
	 * @function
	 */
	Popup.prototype.setAnimations = function(fnOpen, fnClose) {
		jQuery.sap.assert(fnOpen === null || typeof fnOpen === "function", "fnOpen must be a function");
		jQuery.sap.assert(fnClose === null || typeof fnClose === "function", "fnClose must be a function");
	
		if (fnOpen && (typeof(fnOpen) == "function")) {
			this._animations.open = fnOpen;
		}
	
		if (fnClose && (typeof(fnClose) == "function")) {
			this._animations.close = fnClose;
		}
	
		return this;
	};
	
	/**
	 * Sets the durations for opening and closing animations.
	 * Null values and values < 0 are ignored.
	 * A duration of 0 means no animation.
	 * Default value is "fast" which is the jQuery constant for "200 ms".
	 *
	 * @param {int} iOpenDuration in milliseconds
	 * @param {int} iCloseDuration in milliseconds
	 * @return {sap.ui.core.Popup} <code>this</code> to allow method chaining
	 * @public
	 * @name sap.ui.core.Popup#setDurations
	 * @function
	 */
	Popup.prototype.setDurations = function(iOpenDuration, iCloseDuration) {
		jQuery.sap.assert(iOpenDuration === null || (typeof iOpenDuration === "number" && (iOpenDuration % 1 == 0)), "iOpenDuration must be null or an integer");
		jQuery.sap.assert(!iCloseDuration || (typeof iCloseDuration === "number" && (iCloseDuration % 1 == 0)), "iOpenDuration must be undefined or an integer");
	
		if ((iOpenDuration > 0) || (iOpenDuration === 0)) {
			this._durations.open = iOpenDuration;
		}
	
		if ((iCloseDuration > 0) || (iCloseDuration === 0)) {
			this._durations.close = iCloseDuration;
		}
	
		return this;
	};
	
	/**
	 * This enabled/disables the Popup to follow its opening reference. If the Popup is open and a followOf should
	 * be set the corresponding listener will be attached.
	 * 
	 * @param {boolean | function | null} a boolean value enabled/disables the default followOf-Handler. Or an individual handler can be given. 
	 * null deletes all followOf settings.
	 * @since 1.13.0
	 * @public
	 * @name sap.ui.core.Popup#setFollowOf
	 * @function
	 */
	Popup.prototype.setFollowOf = function(followOf) {
		var bUpdateOfRect = false;
	
		// deregister any listener to ensure that in every state of the Popup the correct listener is attached (or not)
		Popup.DockTrigger.removeListener(Popup.checkDocking, this);
	
		if (typeof(followOf) === "function") {
			this._bFollowOf = true;
			this._followOfHandler = followOf;
			bUpdateOfRect = true;
		} else if (typeof(followOf) === "boolean") {
			this._bFollowOf = followOf;
			if (!this._bFollowOf) {
				this._followOfHandler = null;
			}
			bUpdateOfRect = followOf;
		} else {
			this._bFollowOf = false;
			this._followOfHandler = null;
	
			if (followOf != null) {
				jQuery.sap.log.error("Trying to set an invalid type to 'followOf: " + followOf);
			}
		}
		
		if(bUpdateOfRect && this._oLastPosition){
			this._oLastOfRect = this._calcOfRect(this._oLastPosition.of);
		}
	
		if (this._bFollowOf && this.getOpenState() === sap.ui.core.OpenState.OPEN) {
			Popup.DockTrigger.addListener(Popup.checkDocking, this);
		}
	};
	
	/**
	 * Determines whether the pop-up should auto closes or not.
	 *
	 * @returns {boolean}
	 * @since 1.16
	 * @public
	 * @name sap.ui.core.Popup#getAutoClose
	 * @function
	 */
	Popup.prototype.getAutoClose = function() {
		return this._bAutoClose;
	};
	
	/**
	 * This returns true/false if the default followOf method should be used. If a separate followOf-handler was previously added
	 * the correspodning function is returned.
	 * 
	 * @returns {boolean | function} if a function was set it is returned otherwise a boolean value whether the follow of is activated
	 * @since 1.13.0
	 * @public
	 * @name sap.ui.core.Popup#getFollowOf
	 * @function
	 */
	Popup.prototype.getFollowOf = function() {
		if (this._bFollowOf) {
			return typeof(this._followOfHandler) === "function" ? this._followOfHandler : true;
		}
	
		return false;
	};
	
	/**
	 * Returns whether the Popup is currently open (this includes opening and closing animations).
	 *
	 * @returns {boolean} whether the Popup is opened (or currently being opened or closed)
	 * @public
	 * @name sap.ui.core.Popup#isOpen
	 * @function
	 */
	Popup.prototype.isOpen = function() {
		return this.bOpen;
	};
	
	/**
	 * Returns whether the Popup is currently open, closed, or transitioning between these states.
	 *
	 * @returns {sap.ui.core.OpenState} whether the Popup is opened
	 * @public
	 * @name sap.ui.core.Popup#getOpenState
	 * @function
	 */
	Popup.prototype.getOpenState = function() {
		return this.eOpenState;
	};
	
	/**
	 * Closes and destroys this instance of Popup.
	 * Does not destroy the hosted content.
	 * @public
	 * @name sap.ui.core.Popup#destroy
	 * @function
	 */
	Popup.prototype.destroy = function() {
	
		// deregister resize handler
		if (this._resizeListenerId) {
			sap.ui.core.ResizeHandler.deregister(this._resizeListenerId);
			this._resizeListenerId = null;
		}
	
		this.close();
		this.oContent = null;
	
		if (this._bFollowOf) {
			this.setFollowOf(null);
		}
	
		// deregister all additional focusable stuff
		if (this._aFocusableArea) {
			delete this._aFocusableArea;
		}
	
		if (this._bFocusableListenersRegistered) {
			delete this._bFocusableListenersRegistered;
	
			var sEventId = "sap.ui.core.Popup.addFocusableContent-" + this._id;
			sap.ui.getCore().getEventBus().unsubscribe("sap.ui", sEventId, this._addFocusableArea);
	
			sEventId = "sap.ui.core.Popup.removeFocusableContent-" + this._id;
			sap.ui.getCore().getEventBus().unsubscribe("sap.ui", sEventId, this._removeFocusableArea);
		}
	};
	
	/**
	 * This listener is called by the EventBus when an element-id should be added to the
	 * focusable area. The event is fired when a control publishes the corresponding event
	 * according to the channel id "sap.ui" with the event id:
	 * "sap.ui.core.Popup.addFocusableContent-<Popup-ID>". The Popup-id can be obtained by this._id.
	 * 
	 * @param {string} 'sChannel': channel of the EventBus
	 * @param {string} 'sEvent': name of the event
	 * @param {Object} 'oFocusable': object with an id-property
	 * @since 1.12.3
	 * @private
	 * @name sap.ui.core.Popup#_addFocusableArea
	 * @function
	 */
	Popup.prototype._addFocusableArea = function(sChannel, sEvent, oFocusable) {
		if (!this._aFocusableArea) {
			this._aFocusableArea = [];
		}
	
		if (oFocusable.id && typeof(oFocusable.id) === "string") {
			this._aFocusableArea.push(oFocusable.id);
		} else {
			jQuery.sap.log.warning("Either no id given or id is no string");
		}
	};
	
	/**
	 * This listener is called by the EventBus when an element-id should be removed from the
	 * focusable area. The event is fired when a control publishes the corresponding event
	 * according to the channel id "sap.ui" with the event id:
	 * "sap.ui.core.Popup.removeFocusableContent-<Popup-ID>". The Popup-id can be obtained by this._id.
	 * 
	 * @param {string} 'sChannel': channel of the EventBus
	 * @param {string} 'sEvent': name of the event
	 * @param {Object} 'oFocusable': object with an id-property and if a autoClose machanism should occur
	 * @since 1.17.0
	 * @private
	 * @name sap.ui.core.Popup#_removeFocusableArea
	 * @function
	 */
	Popup.prototype._removeFocusableArea = function(sChannel, sEvent, oFocusable) {
		if (this._aFocusableArea && this._aFocusableArea.length > 0) {
			for (var i=0; i < this._aFocusableArea.length; i++) {
				if (this._aFocusableArea[i] === oFocusable.id) {
					// remove corresponding id and stop looping
					this._aFocusableArea = this._aFocusableArea.splice(i, i);
					break;
				}
			}
			
			if (oFocusable.bAutoClose && this._bAutoClose) {
				this.close();
			}
		}
	};
	
	/**
	 * This adds the Popup's id to the given DOM-reference right into the HTML as
	 * an attribute to identify the Popup within the static UI-area.
	 * 
	 * Additionally the corresponding event-listener is registered to the EventBus. The event is registered
	 * to the reserved channel "sap.ui" and is called "sap.ui.core.Popup.addFocusableContent-"
	 * with the corresponding Popup-id.
	 * This event can be published via the EventBus to add a focusable DOM-element-id to the focusable area when
	 * the Popup looses its focus. 
	 * 
	 * @param {jQuery} $Ref to which DOM-reference the Popup-id should be added to
	 * @private 
	 * @name sap.ui.core.Popup#_setIdentity
	 * @function
	 */
	Popup.prototype._setIdentity = function($Ref) {
		if (typeof $Ref === "object") {
			$Ref.attr("data-sap-ui-popup", this._id);
		} else {
			jQuery.sap.log.warning("Incorrect DomRef-type for 'setIdentity': " + $Ref, this);
			return;
		}
	
		if (!this._bFocusableListenersRegistered) {
			this._bFocusableListenersRegistered = true;
	
			var sEventId = "sap.ui.core.Popup.addFocusableContent-" + this._id;
			sap.ui.getCore().getEventBus().subscribe("sap.ui", sEventId, this._addFocusableArea, this);
	
			sEventId = "sap.ui.core.Popup.removeFocusableContent-" + this._id;
			sap.ui.getCore().getEventBus().subscribe("sap.ui", sEventId, this._removeFocusableArea, this);
		}
	};
	
	/**
	 * Returns the jQuery object containing the root of the content of the Popup
	 * @returns {jQuery} the jQuery object containing the root of the content of the Popup
	 * @private
	 * @name sap.ui.core.Popup#_$
	 * @function
	 */
	Popup.prototype._$ = function(bForceReRender){
		var $ContentRef;
	
		if(this.oContent instanceof Control){
			$ContentRef = this.oContent.$();
			if ($ContentRef.length === 0 || bForceReRender) {
				jQuery.sap.log.info("Rendering of popup content: " + this.oContent.getId());
				if ($ContentRef.length > 0) {
					RenderManager.preserveContent($ContentRef[0], /* bPreserveRoot */ true, /* bPreserveNodesWithId */ false);
				}
				sap.ui.getCore().getRenderManager().render(this.oContent, sap.ui.getCore().getStaticAreaRef());
				$ContentRef = this.oContent.$();
			}
		} else if(this.oContent instanceof sap.ui.core.Element){
			$ContentRef = this.oContent.$();
		} else {
			$ContentRef = jQuery(this.oContent);
		}
	
		this._setIdentity($ContentRef);
	
		return $ContentRef;
	};
	
	/**
	 *
	 * @param iZIndex
	 * @private
	 * @name sap.ui.core.Popup#_showBlockLayer
	 * @function
	 */
	Popup.prototype._showBlockLayer = function() {
		var $BlockRef = jQuery("#sap-ui-blocklayer-popup"),
			sClassName = "sapUiBLy" + (this._sModalCSSClass ? " " + this._sModalCSSClass : "");
	
		if ($BlockRef.length === 0) {
			$BlockRef = jQuery('<div id="sap-ui-blocklayer-popup" tabindex="0" class="' + sClassName + '"></div>');
			$BlockRef.appendTo(sap.ui.getCore().getStaticAreaRef());
		} else {
			$BlockRef.removeClass().addClass(sClassName);
		}
	
		// push current z-index to stack
		Popup.blStack.push(this._iZIndex - 2);
		$BlockRef.css("z-index", this._iZIndex - 2).css("visibility","visible").show();
	
		// prevent HTML page from scrolling
		jQuery("html").addClass("sapUiBLyBack");
	
	};
	
	Popup.prototype._hideBlockLayer = function() {
	
		// a dialog was closed so pop his z-index from the stack
		Popup.blStack.pop();
	
		// if there are more z-indices this means there are more dialogs stacked up. So redisplay the blocklayer (with new z-index) under the new current dialog which should be displayed.
		if (Popup.blStack.length > 0) {
	
			// set the blocklayer z-index to the last z-index in the stack and show it
			jQuery("#sap-ui-blocklayer-popup").css("z-index", Popup.blStack[Popup.blStack.length-1]).css("visibility","visible").show();
		} else {
	
			// the last dialog was closed so we can hide the block layer now
			jQuery("#sap-ui-blocklayer-popup").css("visibility","inherit").hide();
		}
	
		// allow scrolling in HTML page
		jQuery("html").removeClass("sapUiBLyBack");
	
	};
	
	//****************************************************
	//Handling of movement of the dock references
	//****************************************************
	Popup.DockTrigger = new IntervalTrigger(200);
	
	var fnRectEqual = function(oRectOne, oRectTwo) {
		if (oRectOne.left != oRectTwo.left
				|| oRectOne.top != oRectTwo.top
				|| oRectOne.width != oRectTwo.width
				|| oRectOne.height != oRectTwo.height) {
			return false;
		}
		return true;
	};
	
	Popup.checkDocking = function(){
		if (this.getOpenState() === sap.ui.core.OpenState.OPEN) {
			var oCurrentOfRect = jQuery(this._oLastPosition.of instanceof sap.ui.core.Element ? this._oLastPosition.of.getDomRef() : this._oLastPosition.of).rect();
			
			if (!oCurrentOfRect) {
				// Docking not possibe due to missing opener.
				this.close();
				return;
			}

			// Check if the current rect-object of the given 'of' became 0 it is sure that the 'of'
			// was rerendered and all corresponding stuff has to be updated to position the popup
			// properly again
			if (fnRectEqual(oCurrentOfRect, {left : 0, top : 0, width : 0, height : 0})) {
				if (this._oLastPosition.of.id && this._oLastPosition.of.id !== "") {
					// The 'of' was rerendered so the newest DOM-element has to be updated for the corresponding rect-object.
					// Because the id of the 'of' may be still the same but due to its rerendering the reference changed and has to be updated 
					var oNewestOf = jQuery.sap.domById(this._oLastPosition.of.id);
					var oNewestOfRect = jQuery(oNewestOf).rect();
					
					// if there is a newest corresponding DOM-reference and it differs from the current -> use the newest one
					if (oNewestOfRect && !fnRectEqual(oCurrentOfRect, oNewestOfRect)) {
						oCurrentOfRect = oNewestOfRect;
						
						delete this._oLastPosition.of;
						this._oLastPosition.of = oNewestOf;
					}
				} 
			}
	
			/*
			 * It's possible that the triggering has already started since the listener is added in 'open' and the Popup hasn't opened yet.
			 * Therefore '_oLastOfRect' wasn't set due to the Popup didn't set it in '_applyPosition'.
			 */
			if (this._oLastOfRect) {
				if (!fnRectEqual(this._oLastOfRect, oCurrentOfRect)) {
					if (this._followOfHandler) {
						// provide the last position additionally if the call back needs it also
						// e.g. the Callout needs it => create deep copy of old positioning object
						var oLastCopy = jQuery.extend(true, {}, this._oLastPosition);
						this._followOfHandler(oLastCopy);
					} else {
						this._applyPosition(this._oLastPosition);
					}
				}
			}
		}
	};
	
	//****************************************************
	//Focus Handling Delegate function for use with the given content (of type sap.ui.core.Element)
	//****************************************************
	/**
	 * Delegate function for handling of touchstart event on sap.ui.core.Elements as content
	 * 
	 * This is a fix for preventing the Popup A from getting higher z-index than popup B when popup B is opened within popup A.
	 * 
	 * Mousedown event is fired with 300ms delay and when the event is caught by popup A, the popup B is already opened. Therefore popup A increases its z-index to be on the front.
	 * When ontouchstart is called, the next mousedown event which comes with a 300ms delay will be ignored. 
	 * 
	 * @private
	 * @name sap.ui.core.Popup#ontouchstart
	 * @function
	 */
	Popup.prototype.ontouchstart = function(oEvent){
		this.onmousedown(oEvent, true);
		// this marks that the onmousedown function is already called by listening to touchstart event on device which supports touchstart.
		// the onmousedown won't be called again by listening to mousedown event
		this._bMousedownCalled = true;
	};
	
	/**
	 * Delegate function for handling of mousedown event on sap.ui.core.Elements as content
	 * @private
	 * @name sap.ui.core.Popup#onmousedown
	 * @function
	 */
	Popup.prototype.onmousedown = function(oEvent, bSupressChecking) {
		if(this._bMousedownCalled && !bSupressChecking){
			//if onmousedown is already called, isn't needed to be called again.
			this._bMousedownCalled = false;
			return;
		}
		
		if (this._iZIndex === this.getLastZIndex()) {
			return;
		} // we are 'uppermost' and therefore everything is ok
	
		this._iZIndex = this.getNextZIndex();
	
		var $Ref = this._$();
		$Ref.css("z-index", this._iZIndex);
	
		if (this._oBlindLayer) {
			this._oBlindLayer.update($Ref, this._iZIndex -1);
		}
	};
	
	//****************************************************
	//Rerendering Handling Delegate function for use with the given content (of type sap.ui.core.Element)
	//****************************************************
	
	/**
	 * Delegate function for onAfterRendering.
	 * Only active when Popup is opened.
	 * @private
	 * @name sap.ui.core.Popup#onAfterRendering
	 * @function
	 */
	Popup.prototype.onAfterRendering = function(oEvent){
		var $Ref = this.getContent().$();
	
		// TODO all stuff done in 'open' is destroyed if the content was rerendered 
		$Ref.toggleClass("sapUiShd", this._bShadow);
		$Ref.css("position", "absolute");
		
		// set/update the identification properly
		this._setIdentity($Ref);
	
		// Ensure right position is used for this call
		var ref = $Ref[0];
		var left = ref.style.left;
		var right = ref.style.right;
		var top = ref.style.top;
		var bottom = ref.style.bottom;
	
		if (!(left && left != "auto" || right && right != "auto" || top && top != "auto" || bottom && bottom != "auto")) {
			jQuery.sap.log.debug("reposition popup content " + $Ref.attr("id") + " at " + (window.JSON ? JSON.stringify(this._oLastPosition.at) : String(this._oLastPosition.at)));
			this._applyPosition(this._oLastPosition);
		}
	
		$Ref.show()
			.css("visibility", "visible")
			.css("z-index", this._iZIndex);
	
		// register resize handler for blindlayer resizing
		if (this._oBlindLayer) {
			this._resizeListenerId = sap.ui.core.ResizeHandler.register(this._$().get(0), jQuery.proxy(this.onresize, this));
		}
	};
	
	/**
	* Delegate function for onBeforeRendering.
	* @private
	* @name sap.ui.core.Popup#onBeforeRendering
	* @function
	*/
	Popup.prototype.onBeforeRendering = function(oEvent) {
		// deregister resize handler
		if (this._resizeListenerId) {
			sap.ui.core.ResizeHandler.deregister(this._resizeListenerId);
			this._resizeListenerId = null;
		}
	};
	
	/**
	 * Resize handler listening to the popup. If the Popup changes its size the blindlayer
	 * should be updated as well. For example necessary when popup content has absolute positions.
	 *
	 * @private
	 * @name sap.ui.core.Popup#onresize
	 * @function
	 */
	Popup.prototype.onresize = function(oEvent) {
		if (this.eOpenState != sap.ui.core.OpenState.CLOSED && this._oBlindLayer) {
			var that = this;
			setTimeout(function(){that._updateBlindLayer();}, 0);
		}
	};
	
	Popup.prototype._updateBlindLayer = function() {
		if (this.eOpenState != sap.ui.core.OpenState.CLOSED && this._oBlindLayer) {
			this._oBlindLayer.update(this._$());
		}
	};
	

	return Popup;

}, /* bExport= */ true);
