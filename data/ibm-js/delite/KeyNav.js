/** @module delite/KeyNav */
define([
	"dcl/dcl",
	"requirejs-dplugins/jquery!attributes/classes",	// addClass(), removeClass()
	"./keys", // keys.END keys.HOME, keys.LEFT_ARROW etc.
	"./features",
	"./Widget",
	"./activationTracker"	// delite-deactivated event when focus removed from KeyNav and logical descendants
], function (dcl, $, keys, has, Widget) {
	
	/**
	 * Dispatched after the user has selected a different descendant, by clicking, arrow keys,
	 * or keyboard search.
	 * @example
	 * widget.on("keynav-child-navigated", function (evt) {
	 *	console.log("old value: " + evt.oldValue);
	 *	console.log("new value: " + evt.newValue);
	 * }
	 * @event module:delite/KeyNav#keynav-child-navigated
	 * @property {number} oldValue - The previously selected item.
	 * @property {number} newValue - The new selected item.
	 */

	// Generate map from keyCode to handler name
	var keycodeToMethod = {};
	for (var key in keys) {
		keycodeToMethod[keys[key]] = key.replace(/[^_]+|_./g, function (c) {
			return c.charAt(0) === "_" ? c.charAt(1) : c.toLowerCase();
		}) + "KeyHandler";
	}

	/**
	 * Return true if node is an `<input>` or similar that responds to keyboard input.
	 * @param {Element} node
	 * @returns {boolean}
	 */
	function takesInput(node) {
		var tag = node.nodeName.toLowerCase();

		return !node.readOnly && (tag === "textarea" || (tag === "input" &&
			/^(color|email|number|password|search|tel|text|url|range)$/.test(node.type)));
	}

	/**
	  * A mixin to allow arrow key and letter key navigation of child Elements.
	  * It can be used by delite/Container based widgets with a flat list of children,
	  * or more complex widgets like a Tree.
	  * 
	  * To use this mixin, the subclass must:
	  *
	  * - Implement one method for each keystroke that subclass wants to handle, with names based on the keys
	  *   defined in delite/keys.  For example, `DOWN_ARROW` --> `downArrowKeyHandler()`.
	  *   The method takes two parameters: the events, and the currently navigated node.
	  *   For BIDI support, the left and right arrows are handled specially, mapped to the `previousArrowKeyHandler()`
	  *   and `nextArrowKeyHandler()` methods in LTR mode, or reversed in RTL mode.
	  *   Most subclasses will want to implement either `previousArrowKeyHandler()`
	  *   and `nextArrowKeyHandler()`, or `downArrowKeyHandler()` and `upArrowKeyHandler()`.
	  * - Set all navigable descendants' initial tabIndex to "-1"; both initial descendants and any
	  *   descendants added later, by for example `addChild()`.  Exception: if `focusDescendants` is false then the
	  *   descendants shouldn't have any tabIndex at all.
	  * - Define `descendantSelector` as a function or string that identifies navigable child Elements.
	  * - If the descendant elements contain text, they should have a label attribute.  KeyNav uses the label
	  *   attribute for letter key navigation.
	  *
	  * @mixin module:delite/KeyNav
	  * @augments module:delite/Widget
	  */
	return dcl(Widget, /** @lends module:delite/KeyNav# */ {

		/*jshint -W101*/
		/**
		 * When true, focus the descendant widgets as the user navigates to them via arrow keys or keyboard letter
		 * search.  When false, rather than focusing the widgets, it merely sets `navigatedDescendant`,
		 * and sets the `d-active-descendant` class on the descendant widget the user has navigated to.
		 *
		 * False mode is intended for widgets like ComboBox where the focus is somewhere outside this widget
		 * (typically on an `<input>`) and keystrokes are merely being forwarded to the KeyNav widget.
		 *
		 * When set to false:
		 *
		 * - All navigable descendants must specify an id.
		 * - Navigable descendants shouldn't have any tabIndex (as opposed to having tabIndex=-1).
		 * - The focused element should specify `aria-owns` to point to this KeyNav Element.
		 * - The focused Element must be kept synced so that `aria-activedescendant` points to the currently
		 *   navigated descendant.  Do this responding to the `keynav-child-navigated` event emitted by this widget,
		 *   or by calling `observe()` and monitoring changed to `navigatedDescendant`.
		 * - The focused Element must forward keystrokes by calling `emit("keydown", ...)` and/or
		 *   `emit("keypress", ...)` on this widget.
		 * - You must somehow set the initial navigated descendant, typically by calling `navigateToFirst()` either
		 *   when the the dropdown is opened, or on the first call to `downArrowKeyHandler()`.
		 * - You must have some CSS styling so that the currently navigated node is apparent.
		 *
		 * See http://www.w3.org/WAI/GL/wiki/Using_aria-activedescendant_to_allow_changes_in_focus_within_widgets_to_be_communicated_to_Assistive_Technology#Example_1:_Combobox
		 * for details.
		 * @member {boolean}
		 * @default true
		 * @protected
		 */
		focusDescendants: true,
		/*jshint +W101*/

		/**
		 * The currently navigated descendant, or null if there isn't one.
		 * @member {Element}
		 * @readonly
		 * @protected
		 */
		navigatedDescendant: null,

		/**
		 * Selector to identify which descendant Elements are navigable via arrow keys or
		 * keyboard search.  Note that for subclasses like a Tree, one navigable node could be a descendant of another.
		 *
		 * It's either a function that takes an Element parameter and returns true/false,
		 * or a CSS selector string, for example ".list-item".
		 *
		 * By default, the direct DOM children of this widget are considered the selectable descendants.
		 *
		 * Must be set in the prototype rather than on the instance.
		 *
		 * @member {string|Function}
		 * @protected
		 * @constant
		 */
		descendantSelector: null,

		/**
		 * Figure out effective target of this event, either a navigable node, or this widget itself.
		 * Note that for subclasses like a Tree, one navigable node could be a descendant of another.
		 * @param {Event} evt
		 * @private
		 */
		_getTargetElement: function (evt) {
			for (var child = evt.target; child !== this; child = child.parentNode) {
				if (this._selectorFunc(child)) {
					return child;
				}
			}
			return this;
		},

		postRender: function () {
			// Setup function to check which child nodes are navigable.
			if (typeof this.descendantSelector === "string") {
				var matchesFuncName = has("dom-matches");
				this._selectorFunc = function (elem) {
					return elem[matchesFuncName](this.descendantSelector);
				};
			} else if (this.descendantSelector) {
				this._selectorFunc = this.descendantSelector;
			} else {
				this._selectorFunc = function (elem) { return elem.parentNode === this.containerNode; };
			}

			this.on("keypress", this._keynavKeyPressHandler.bind(this));
			this.on("keydown", this._keynavKeyDownHandler.bind(this));
			this.on("click", function (evt) {
				var target = this._getTargetElement(evt);
				if (target !== this) {
					this._descendantNavigateHandler(target, evt);
				}
			});

			this.on("delite-deactivated", function () {
				if (this.focusDescendants) {
					this._keynavDeactivatedHandler();
				}
			}.bind(this));

			this.on("focusin", function (evt) {
				if (this.focusDescendants) {
					var target = this._getTargetElement(evt);
					if (target === this) {
						this._keynavFocusHandler(evt);
					} else {
						this._descendantNavigateHandler(target, evt);
					}
				}
			}.bind(this));
		},

		attachedCallback: function () {
			// If the user hasn't specified a tabindex declaratively, then set to default value.
			if (this.focusDescendants && !this.hasAttribute("tabindex")) {
				this.tabIndex = "0";
			}
		},

		/**
		 * Called on home key.
		 * @param {Event} evt
		 * @param {Element} navigatedDescendant
		 * @protected
		 */
		homeKeyHandler: function (evt) {
			this.navigateToFirst(evt);
		},

		/**
		 * Called on end key.
		 * @param {Event} evt
		 * @param {Element} navigatedDescendant
		 * @protected
		 */
		endKeyHandler: function (evt) {
			this.navigateToLast(evt);
		},

		/**

		/**
		 * Default focus() implementation: navigate to the first navigable descendant.
		 * Note that if `focusDescendants` is false, this will merely set the `d-active-descendant` class
		 * rather than actually focusing the descendant.
		 */
		focus: function () {
			this.navigateToFirst();
		},

		/**
		 * Navigate to the first navigable descendant.
		 * Note that if `focusDescendants` is false, this will merely set the `d-active-descendant` class
		 * rather than actually focusing the descendant.
		 * @param {Event} triggerEvent - The event that lead to the navigation, or `undefined`
		 *     if the navigation is triggered programmatically.
		 * @protected
		 */
		navigateToFirst: function (triggerEvent) {
			this.navigateTo(this.getNext(this, 1), triggerEvent);
		},

		/**
		 * Navigate to the last navigable descendant.
		 * Note that if `focusDescendants` is false, this will merely set the `d-active-descendant` class
		 * rather than actually focusing the descendant.
		 * @param {Event} triggerEvent - The event that lead to the navigation, or `undefined`
		 *     if the navigation is triggered programmatically.
		 * @protected
		 */
		navigateToLast: function (triggerEvent) {
			this.navigateTo(this.getNext(this, -1), false, triggerEvent);
		},

		/**
		 * Navigate to the specified descendant.
		 * Note that if `focusDescendants` is false, this will merely set the `d-active-descendant` class
		 * rather than actually focusing the descendant.
		 * @param {Element} child - Reference to the descendant.
		 * @param {boolean} last - If true and if descendant has multiple focusable nodes, focus the
		 *     last one instead of the first one.  This assumes that the child's `focus()` method takes a boolean
		 *     parameter where `true` means to focus the last child.
		 * @param {Event} triggerEvent - The event that lead to the navigation, or `undefined`
		 *     if the navigation is triggered programmatically.
		 * @protected
		 */
		navigateTo: function (child, last, triggerEvent) {
			if (this.focusDescendants) {
				// For IE focus outline to appear, must set tabIndex before focus.
				// If this._savedTabIndex is set, use it instead of this.tabIndex, because it means
				// the container's tabIndex has already been changed to -1.
				child.tabIndex = "_savedTabIndex" in this ? this._savedTabIndex : this.tabIndex;
				child.focus(last ? "end" : "start");

				// _descendantNavigateHandler() will be called automatically from child's focus event.
			} else {
				this._descendantNavigateHandler(child, triggerEvent);
			}
		},

		/**
		 * Handler for when the container itself gets focus.
		 * Called only when `this.focusDescendants` is true.
		 * Initially the container itself has a tabIndex, but when it gets focus, switch focus to first child.
		 *
		 * @param {Event} evt
		 * @private
		 */
		_keynavFocusHandler: function () {
			// Note that we can't use the delite-activated event because switching focus from that
			// event handler confuses the activationTracker.js code (because it recursively triggers the
			// delite-activated event).  Also, delite-activated would fire when focus went
			// directly to a child widget due to mouse click.

			// Ignore spurious focus event:
			// On IE, clicking the scrollbar of a select dropdown moves focus from the focused child item to me
			if (this.navigatedDescendant) {
				return;
			}

			// When the container gets focus by being tabbed into, or a descendant gets focus by being clicked,
			// remove the container's tabIndex so that tab or shift-tab
			// will go to the fields after/before the container, rather than the container itself
			this._savedTabIndex = this.tabIndex;
			this.removeAttribute("tabindex");

			this.focus();
		},

		/**
		 * Handler for when focus is moved away the container, and its descendant (popup) widgets.
		 * Called only when `this.focusDescendants` is true.
		 * @private
		 */
		_keynavDeactivatedHandler: function () {
			// then restore the container's tabIndex so that user can tab to it again.
			// Note that using _onBlur() so that this doesn't happen when focus is shifted
			// to one of my child widgets (typically a popup)

			// TODO: for 2.0 consider changing this to blur whenever the container blurs, to be truthful that there is
			// no focused child at that time.
			this.setAttribute("tabindex", this._savedTabIndex);
			delete this._savedTabIndex;
			if (this.navigatedDescendant) {
				this.navigatedDescendant.tabIndex = "-1";
				this.navigatedDescendant = null;
			}
		},

		/**
		 * Called when a child is navigated to, either by user clicking it, or programatically by arrow key handling
		 * code.  It marks that the specified child is the navigated one.
		 * @param {Element} child
		 * @param {Event} triggerEvent - The event that lead to the navigation, or `undefined`
		 *     if the navigation is triggered programmatically.
		 * @fires module:delite/KeyNav#keynav-child-navigated
		 * @private
		 */
		_descendantNavigateHandler: function (child, triggerEvent) {
			if (child && child !== this.navigatedDescendant) {
				if (this.focusDescendants) {
					if (this.navigatedDescendant && !this.navigatedDescendant._destroyed) {
						// mark that the previously focusable node is no longer focusable
						this.navigatedDescendant.tabIndex = "-1";
					}

					// If container still has tabIndex setting then remove it; instead we'll set tabIndex on child
					if (!("_savedTabIndex" in this)) {
						this._savedTabIndex = this.tabIndex;
						this.removeAttribute("tabindex");
					}

					child.tabIndex = this._savedTabIndex;
				}

				if (this.navigatedDescendant) {
					$(this.navigatedDescendant).removeClass("d-active-descendant");
				}

				this.emit("keynav-child-navigated", {
					oldValue: this.navigatedDescendant,
					newValue: child,
					triggerEvent: triggerEvent
				});

				// mark that the new node is the currently navigated one
				this.navigatedDescendant = child;
				if (child) {
					$(child).addClass("d-active-descendant");
				}
			}
		},

		_searchString: "",

		/**
		 * If multiple characters are typed where each keystroke happens within
		 * multiCharSearchDuration of the previous keystroke,
		 * search for nodes matching all the keystrokes.
		 * 
		 * For example, typing "ab" will search for entries starting with
		 * "ab" unless the delay between "a" and "b" is greater than `multiCharSearchDuration`.
		 * 
		 * @member {number} KeyNav#multiCharSearchDuration
		 * @default 1000
		 */
		multiCharSearchDuration: 1000,

		/**
		 * When a key is pressed that matches a child item,
		 * this method is called so that a widget can take appropriate action if necessary.
		 * 
		 * @param {Element} item
		 * @param {Event} evt
		 * @param {string} searchString
		 * @param {number} numMatches
		 * @private
		 */
		_keyboardSearchHandler: function (item, /*jshint unused: vars */ evt, searchString, numMatches) {
			if (item) {
				this.navigateTo(item);
			}
		},

		/**
		 * Compares the searchString to the Element's text label, returning:
		 *
		 * - -1: a high priority match  and stop searching
		 * - 0: not a match
		 * - 1: a match but keep looking for a higher priority match
		 * 
		 * @param {Element} item
		 * @param {string} searchString
		 * @returns {number}
		 * @private
		 */
		_keyboardSearchCompare: function (item, searchString) {
			var element = item,
				text = item.label || (element.focusNode ? element.focusNode.label : "") || element.textContent || "",
				currentString = text.replace(/^\s+/, "").substr(0, searchString.length).toLowerCase();

			// stop searching after first match by default
			return (!!searchString.length && currentString === searchString) ? -1 : 0;
		},

		/**
		 * When a key is pressed, if it's an arrow key etc. then it's handled here.
		 * @param {Event} evt
		 * @private
		 */
		_keynavKeyDownHandler: function (evt) {
			// Ignore left, right, home, end, and space on <input> controls
			if (takesInput(evt.target) &&
				(evt.keyCode === keys.LEFT_ARROW || evt.keyCode === keys.RIGHT_ARROW ||
					evt.keyCode === keys.HOME || evt.keyCode === keys.END || evt.keyCode === keys.SPACE)) {
				return;
			}

			if (evt.keyCode === keys.SPACE && this._searchTimer && !(evt.ctrlKey || evt.altKey || evt.metaKey)) {
				// If the user types some string like "new york", interpret the space as part of the search rather
				// than to perform some action, even if there is a key handler method defined.

				// Stop a11yclick from interpreting key as a click event.
				// Also stop IE from scrolling, and most browsers (except FF) from emitting keypress event.
				evt.preventDefault();

				this._keyboardSearch(evt, " ");
			} else {
				// Otherwise call the handler specified in this.keyHandlers.
				this._applyKeyHandler(evt);
			}
		},

		/**
		 * If the class has defined a method to handle the specified key, then call it.
		 * See the description of `KeyNav` for details on how to define methods.
		 * @param {Event} evt
		 * @private
		 */
		_applyKeyHandler: function (evt) {
			// Get name of method to call
			var methodName;
			switch (evt.keyCode) {
			case keys.LEFT_ARROW:
				methodName = this.effectiveDir === "rtl" ? "nextArrowKeyHandler" : "previousArrowKeyHandler";
				break;
			case keys.RIGHT_ARROW:
				methodName = this.effectiveDir === "rtl" ? "previousArrowKeyHandler" : "nextArrowKeyHandler";
				break;
			default:
				methodName = keycodeToMethod[evt.keyCode];
			}

			// Call it
			var func = this[methodName];
			if (func) {
				func.call(this, evt, this.navigatedDescendant);
				evt.stopPropagation();
				evt.preventDefault();
				this._searchString = ""; // so a DOWN_ARROW b doesn't search for ab
			}
		},

		/**
		 * When a printable key is pressed, it's handled here, searching by letter.
		 * @param {Event} evt
		 * @private
		 */
		_keynavKeyPressHandler: function (evt) {
			// Ignore:
			//		- keystrokes on <input> and <textarea>
			// 		- duplicate events on firefox (ex: arrow key that will be handled by keydown handler)
			//		- control sequences like CMD-Q.
			//		- the SPACE key (only occurs on FF)
			//
			// Note: if there's no search in progress, then SPACE should be ignored.   If there is a search
			// in progress, then SPACE is handled in _keynavKeyDownHandler.
			if (takesInput(evt.target) || evt.charCode <= keys.SPACE || evt.ctrlKey || evt.altKey || evt.metaKey) {
				return;
			}

			evt.preventDefault();
			evt.stopPropagation();

			this._keyboardSearch(evt, String.fromCharCode(evt.charCode).toLowerCase());
		},

		/**
		 * Perform a search of the widget's options based on the user's keyboard activity.
		 *
		 * Called on keypress (and sometimes keydown), searches through this widget's children
		 * looking for items that match the user's typed search string.  Multiple characters
		 * typed within `multiCharSearchDuration` of each other are combined for multi-character searching.
		 * @param {Event} evt
		 * @param {string} keyChar
		 * @private
		 */
		_keyboardSearch: function (evt, keyChar) {
			var
				matchedItem = null,
				searchString,
				numMatches = 0;

			if (this._searchTimer) {
				this._searchTimer.remove();
			}
			this._searchString += keyChar;
			var allSameLetter = /^(.)\1*$/.test(this._searchString);
			var searchLen = allSameLetter ? 1 : this._searchString.length;
			searchString = this._searchString.substr(0, searchLen);
			this._searchTimer = this.defer(function () { // this is the "success" timeout
				this._searchTimer = null;
				this._searchString = "";
			}, this.multiCharSearchDuration);
			var currentItem = this.navigatedDescendant || null;
			if (searchLen === 1 || !currentItem) {
				currentItem = this.getNext(currentItem, 1); // skip current
				if (!currentItem) {
					return;
				} // no items
			}
			var stop = currentItem;
			do {
				var rc = this._keyboardSearchCompare(currentItem, searchString);
				if (!!rc && numMatches++ === 0) {
					matchedItem = currentItem;
				}
				if (rc === -1) { // priority match
					numMatches = -1;
					break;
				}
				currentItem = this.getNext(currentItem, 1);
			} while (currentItem !== stop);

			this._keyboardSearchHandler(matchedItem, evt, searchString, numMatches);
		},

		/**
		 * Returns the next or previous navigable descendant, relative to "child".
		 * If "child" is this, then it returns the first focusable descendant (when dir === 1)
		 * or last focusable descendant (when dir === -1).
		 * @param {Element} child - The current child Element.
		 * @param {number} dir - 1 = after, -1 = before
		 * @returns {Element}
		 * @protected
		 */
		getNext: function (child, dir) {
			var root = this, origChild = child;
			function dfsNext(node) {
				if (node.firstElementChild) { return node.firstElementChild; }
				while (node !== root) {
					if (node.nextElementSibling) { return node.nextElementSibling; }
					node = node.parentNode;
				}
				return root;	// loop around, plus corner case when no children
			}
			function dfsLast(node) {
				while (node.lastElementChild) { node = node.lastElementChild; }
				return node;
			}
			function dfsPrev(node) {
				return node === root ? dfsLast(root) : // loop around, plus corner case when no children
					(node.previousElementSibling && dfsLast(node.previousElementSibling)) || node.parentNode;
			}
			while (true) {
				child = dir > 0 ? dfsNext(child) : dfsPrev(child);
				if (child === origChild) {
					return null;	// looped back to original child
				} else if (this._selectorFunc(child)) {
					return child;	// this child matches
				}
			}
		}
	});
});
