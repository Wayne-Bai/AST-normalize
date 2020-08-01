/**
 * Show drop downs (ex: the select list of a ComboBox) or popups (ex: right-click context menus).
 * @module delite/popup
 */
define([
	"dcl/advise",
	"dcl/dcl",
	"./BackgroundIframe",
	"./features", // has("config-bgIframe")
	"./keys",
	"./place",
	"./Viewport",
	"./theme!" // d-popup class
], function (advise, dcl, BackgroundIframe, has, keys, place, Viewport) {

	function isDocLtr(doc) {
		return !(/^rtl$/i).test(doc.body.dir || doc.documentElement.dir);
	}

	// Mysterious code to workaround iOS problem where clicking a button  below an input will just keep the input
	// focused.  Button gets pointerdown event but not click event.  Test case: popup.html, press "show centered dialog"
	// and first click the <input>, then click the <button> below it.
	document.addEventListener("pointerdown", function () {
		document.body.scrollTop = document.body.scrollTop;
	}, true);

	/**
	 * Arguments to delite/popup#open() method.
	 * @typedef {Object} module:delite/popup.OpenArgs
	 * @property {module:delite/Widget} popup - The Widget to display.
	 * @property {module:delite/Widget} parent - The button etc. that is displaying this popup.
	 * @property {Element|Rectangle} around - DOM node (typically a button);
	 * place popup relative to this node.  (Specify this *or* `x` and `y` properties.)
	 * @property {number} x - Absolute horizontal position (in pixels) to place node at.
	 * (Specify this *or* `around` parameter.)
	 * @property {number} y - Absolute vertical position (in pixels) to place node at.
	 * (Specify this *or* `around` parameter.)
	 * @property {string[]} orient - When the `around` parameter is specified, `orient` should be a
	 * list of positions to try, ex. `[ "below", "above" ]`
	 * delite/popup.open() tries to position the popup according to each specified position, in order,
	 * until the popup appears fully within the viewport.  The default value is `["below", "above"]`.
	 * When an (x,y) position is specified rather than an around node, orient is either
	 * "R" or "L".  R (for right) means that it tries to put the popup to the right of the mouse,
	 * specifically positioning the popup's top-right corner at the mouse position, and if that doesn't
	 * fit in the viewport, then it tries, in order, the bottom-right corner, the top left corner,
	 * and the top-right corner.
	 *
	 * Alternately, orient can be an array `["center"]`, which pops up the specified node in the center of
	 * the viewport, like a dialog.  It will shrink the size of the node if necessary, in which case the node
	 * must be designed so that scrolling occurs in the right place.
	 *
	 * @property {Function} onCancel - Callback when user has canceled the popup by:
	 * 1. hitting ESC or
	 * 2. by using the popup widget's proprietary cancel mechanism (like a cancel button in a dialog);
	 * i.e. whenever popupWidget.onCancel() is called, args.onCancel is called
	 * @property {Function} onClose - Callback whenever this popup is closed.
	 * @property {Position} padding - Adding a buffer around the opening position.
	 * This is only used when `around` is not set.
	 * @property {number} maxHeight
	 * The max height for the popup.  Any popup taller than this will have scrollbars.
	 * Set to Infinity for no max height.  Default is to limit height to available space in viewport,
	 * above or below the aroundNode or specified x/y position.
	 */

	/**
	 * Function to destroy wrapper when popup widget is destroyed.
	 */
	function destroyWrapper() {
		if (this._popupWrapper) {
			this._popupWrapper.parentNode.removeChild(this._popupWrapper);
			delete this._popupWrapper;
		}
	}

	// TODO: convert from singleton to just a hash of functions; easier to doc that way.

	var PopupManager = dcl(null, /** @lends module:delite/popup */ {
		/**
		 * Stack of information about currently popped up widgets.
		 * See `open()` method to see the properties set in each Object in this stack (widget, wrapper, etc)
		 * (someone opened _stack[0], and then it opened _stack[1], etc.)
		 * @member {*} PopupManager._stack
		 */
		_stack: [],

		/**
		 * Z-index of the first popup.   (If first popup opens other popups they get a higher z-index.)
		 * @member {number} PopupManager._beginZIndex
		 */
		_beginZIndex: 1000,

		_idGen: 1,

		constructor: function () {
			Viewport.on("resize", this._repositionAll.bind(this));
			Viewport.on("scroll", this._viewportScrollHandler.bind(this));
		},

		/**
		 * We check for viewport scroll above, but this code checks for scrolling an inner `<div>`,
		 * thus moving the anchor node.  Using the scrollbar will close all the popups on the screen, but not
		 * if you scroll via a mousewheel or a mousepad double-finger gesture.
		 * @private
		 */
		_checkScroll: function () {
			if (this._firstAroundNode) {	// guard for when clearTimeout() on IE doesn't work
				var oldPos = this._firstAroundPosition,
					newPos = place.position(this._firstAroundNode),
					dx = newPos.x - oldPos.x,
					dy = newPos.y - oldPos.y;

				if (dx || dy) {
					this._firstAroundPosition = newPos;
					this._repositionAll();
				}

				this._aroundMoveListener = setTimeout(this._checkScroll.bind(this), dx || dy ? 10 : 50);
			}
		},

		/**
		 * Reposition all the popups due to viewport size change.
		 * @private
		 */
		_repositionAll: function () {
			this._stack.forEach(function (args) {
				this._size(args);
				this._position(args);
			}, this);
		},

		/**
		 * Reposition all the popups due to viewport scroll.  The main purpose of the function is to handle
		 * automatic scrolling on mobile from the keyboard popping up or when the browser tries to scroll the
		 * focused element to the upper part of the screen.
		 * @private
		 */
		_viewportScrollHandler: function () {
			this._stack.forEach(function (args) {
				if (args.orient[0] !== "center") {	// no need to resize dialogs just due to viewport scroll
					this._size(args);
				}
				this._position(args);
			}, this);
		},

		/**
		 * Initialization for widgets that will be used as popups.
		 * Puts widget inside a wrapper DIV (if not already in one), and returns pointer to that wrapper DIV.
		 * @param {module:delite/Widget} widget
		 * @returns {HTMLElement} The wrapper DIV.
		 * @private
		 */
		_createWrapper: function (widget) {
			var wrapper = widget._popupWrapper;
			if (!wrapper) {
				// Create wrapper <div> for when this widget [in the future] will be used as a popup.
				// This is done early because of IE bugs where creating/moving DOM nodes causes focus
				// to go wonky, see tests/robot/Toolbar.html to reproduce
				wrapper = widget.ownerDocument.createElement("div");
				wrapper.className = "d-popup";
				wrapper.style.display = "none";
				wrapper.setAttribute("role", "region");
				wrapper.setAttribute("aria-label", widget["aria-label"] || widget.label || widget.name || widget.id);
				widget.ownerDocument.body.appendChild(wrapper);

				wrapper.appendChild(widget);
				widget.attachedCallback();

				widget._popupWrapper = wrapper;
				advise.after(widget, "destroy", destroyWrapper);
			}

			return wrapper;
		},

		/**
		 * Moves the popup widget off-screen.  Do not use this method to hide popups when not in use, because
		 * that will create an accessibility issue: the offscreen popup will still be in the tabbing order.
		 * @param {module:delite/Widget} widget
		 * @returns {HTMLElement}
		 */
		moveOffScreen: function (widget) {
			// Create wrapper if not already there, then besides setting visibility:hidden,
			// move it out of the viewport, see #5776, #10111, #13604
			var wrapper = this._createWrapper(widget),
				style = wrapper.style,
				ltr = isDocLtr(widget.ownerDocument);

			// TODO: move to CSS class (d-offscreen?), but need to know direction of widget or at least page
			dcl.mix(style, {
				visibility: "hidden",
				top: "-9999px",
				display: ""
			});
			style[ltr ? "left" : "right"] = "-9999px";
			style[ltr ? "right" : "left"] = "auto";

			return wrapper;
		},

		/**
		 * Hide this popup widget (until it is ready to be shown).
		 * Initialization for widgets that will be used as popups.
		 *
		 * Also puts widget inside a wrapper DIV (if not already in one).
		 *
		 * If popup widget needs to layout it should do so when it is made visible,
		 * and popup._onShow() is called.
		 * @param {module:delite/Widget} widget
		 */
		hide: function (widget) {
			// Create wrapper if not already there
			var wrapper = this._createWrapper(widget);

			dcl.mix(wrapper.style, {
				display: "none",
				height: "auto"		// Open may have limited the height to fit in the viewport
			});
		},

		/**
		 * Compute the closest ancestor popup that's *not* a child of another popup.
		 * Ex: For a TooltipDialog with a button that spawns a tree of menus, find the popup of the button.
		 * @returns {module:delite/Widget}
		 */
		getTopPopup: function () {
			var stack = this._stack;
			for (var pi = stack.length - 1; pi > 0 && stack[pi].parent === stack[pi - 1].popup; pi--) {
				/* do nothing, just trying to get right value for pi */
			}
			return stack[pi];
		},

		/**
		 * Popup the widget at the specified position.
		 *
		 * Note that whatever widget called delite/popup.open() should also require activationTracker and listen for
		 * delite-deactivated event to know that focus has moved somewhere
		 * else and thus the popup should be closed.
		 *
		 * @param {module:delite/popup.OpenArgs} args
		 * @returns {*} If orient !== center then returns the alignment of the popup relative to the anchor node.
		 * @example
		 * // Open at the mouse position
		 * popup.open({popup: menuWidget, x: evt.pageX, y: evt.pageY});
		 * @example
		 * // Open the widget as a dropdown
		 * popup.open({parent: this, popup: menuWidget, around: this, onClose: function(){...}});
		 */
		open: function (args) {
			this._prepareToOpen(args);
			this._size(args, true);
			return this._position(args);
		},

		/**
		 * Do the work to display a popup widget, except for positioning.
		 * @param {module:delite/popup.OpenArgs} args
		 * @returns {*}
		 * @private
		 */
		_prepareToOpen: function (args) {
			/* jshint maxcomplexity:12 */

			var stack = this._stack,
				widget = args.popup,
				around = args.around;

			// Generate id for popup if it doesn't already have one.
			if (!widget.id) {
				widget.id = args.around && args.around.id ? args.around.id + "_dropdown" : "popup_" + this._idGen++;
			}

			// If we are opening a new popup that isn't a child of a currently opened popup, then
			// close currently opened popup(s).   This should happen automatically when the old popups
			// gets the delite-activated event, except that event isn't reliable on IE, see [22198].
			// TODO: check if this code still needed for delite
			while (stack.length && (!args.parent || !stack[stack.length - 1].popup.contains(args.parent))) {
				this.close(stack[stack.length - 1].popup);
			}

			// Get pointer to popup wrapper, and create wrapper if it doesn't exist.  Remove display:none (but keep
			// off screen) so we can do sizing calculations.
			var wrapper = this.moveOffScreen(widget);

			var wrapperClasses = ["d-popup"];
			((widget.baseClass || "") + " " + widget.className).split(/ +/).forEach(function (cls) {
				if (cls) {
					wrapperClasses.push(cls + "-popup");
				}
			});
			dcl.mix(wrapper, {
				id: widget.id + "_wrapper",
				className: wrapperClasses.join(" ")
			});
			wrapper.style.zIndex = this._beginZIndex + stack.length;
			wrapper._popupParent = args.parent ? args.parent : null;

			if (stack.length === 0 && around) {
				// First element on stack. Save position of aroundNode and setup listener for changes to that position.
				this._firstAroundNode = around;
				this._firstAroundPosition = place.position(around);
				this._aroundMoveListener = setTimeout(this._checkScroll.bind(this), 50);
			}

			if (has("config-bgIframe") && !widget.bgIframe) {
				// setting widget.bgIframe triggers cleanup in Widget.destroy()
				widget.bgIframe = new BackgroundIframe(wrapper);
			}

			wrapper.style.visibility = "visible";
			widget.style.visibility = "visible";	// counteract effects from HasDropDown

			var handlers = [];

			// provide default escape and tab key handling
			// (this will work for any widget, not just menu)
			var onKeyDown = function (evt) {
				if (evt.keyCode === keys.ESCAPE && args.onCancel) {
					evt.stopPropagation();
					evt.preventDefault();
					args.onCancel();
				} else if (evt.keyCode === keys.TAB) {
					evt.stopPropagation();
					evt.preventDefault();
					var topPopup = this.getTopPopup();
					if (topPopup.onCancel) {
						topPopup.onCancel();
					}
				}
			}.bind(this);
			wrapper.addEventListener("keydown", onKeyDown);
			handlers.push({
				remove: function () {
					wrapper.removeEventListener("keydown", onKeyDown);
				}
			});

			// watch for cancel/execute events on the popup and notify the caller
			if (args.onCancel) {
				handlers.push(widget.on("cancel", args.onCancel));
			}

			// Simple widgets like a Calendar will emit "change" events, whereas complex widgets like
			// a TooltipDialog/Menu will emit "execute" events.  No way to tell which event the widget will
			// emit, so listen for both.
			//
			// If there's a hierarchy of menus and the user clicks on a nested menu, the callback
			// registered for the top menu should get the execute event.  At least, that's how it worked in dijit.
			var executeHandler = function () {
				var topPopup = this.getTopPopup();
				if (topPopup.onExecute) {
					topPopup.onExecute();
				}
			}.bind(this);
			handlers.push(
				widget.on("change", executeHandler),
				widget.on("execute", executeHandler)
			);

			var stackEntry = Object.create(args);
			stackEntry.wrapper = wrapper;
			stackEntry.handlers = handlers;
			stack.push(stackEntry);
		},

		/**
		 * Size or resize the popup specified by args.
		 * @param {module:delite/popup.OpenArgs} args
		 * @param {boolean} measureSize
		 * @returns {*} If orient !== center then returns the alignment of the popup relative to the anchor node.
		 * @private
		 */
		_size: function (args, measureSize) {
			/* jshint maxcomplexity:13 */
			var widget = args.popup,
				wrapper = widget._popupWrapper,
				around = args.around,
				orient = args.orient || ["below", "below-alt", "above", "above-alt"],
				viewport = Viewport.getEffectiveBox(widget.ownerDocument);

			if (measureSize) {
				// Get natural size of popup (i.e. when not squashed to fit within viewport).  First, remove any
				// previous size restriction set on wrapper.  Note that setting wrapper's height and width to "auto"
				// erases scroll position, so should only be done when popup is first shown, before user has scrolled.
				wrapper.style.height = "auto";
				if (orient[0] === "center") {
					// Don't set width to "auto" when orient!=center because it interferes with HasDropDown's
					// autoWidth/forceWidth.
					// TODO: maybe this if() check is no longer necessary to due to parent if(measureSize)
					wrapper.style.width = "auto";
				}

				args._naturalHeight = widget.offsetHeight;
				args._naturalWidth = widget.offsetWidth;
			}

			if (orient[0] === "center") {
				// Limit height and width so dialog fits within viewport.
				wrapper.style.height = args._naturalHeight > viewport.h * 0.9 ? Math.floor(viewport.h * 0.9) + "px" :
					"auto";
				wrapper.style.width = args._naturalWidth > viewport.w * 0.9 ? Math.floor(viewport.w * 0.9) + "px" :
					"auto";
			} else {
				// Limit height to space available in viewport either above or below aroundNode (whichever side has
				// more room).  This may make the popup widget display a scrollbar (or multiple scrollbars).
				var maxHeight;
				if ("maxHeight" in args && args.maxHeight !== -1) {
					maxHeight = args.maxHeight || Infinity;
				} else {
					var aroundPos = around ? around.getBoundingClientRect() : {
						top: args.y - (args.padding || 0),
						height: (args.padding || 0) * 2
					};
					maxHeight = Math.floor(Math.max(aroundPos.top, viewport.h -
						(aroundPos.top + aroundPos.height)));
				}

				wrapper.style.height = args._naturalHeight > maxHeight ? maxHeight + "px" : "auto";
			}

			// Workaround for android < 4.4 bug where popup overflows from wrapper.
			// Probably this code can be removed when/if we get rid of the wrapper div.
			widget.style.height = wrapper.style.height;
		},

		/**
		 * Position the popup specified by args.
		 * @param args
		 * @returns {*} If orient !== center then returns the alignment of the popup relative to the anchor node.
		 * @private
		 */
		_position: function (args) {
			var widget = args.popup,
				wrapper = widget._popupWrapper,
				around = args.around,
				orient = args.orient || ["below", "below-alt", "above", "above-alt"],
				ltr = args.parent ? args.parent.effectiveDir !== "rtl" : isDocLtr(widget.ownerDocument);

			// position the wrapper node
			if (orient[0] === "center") {
				place.center(wrapper);
			} else {
				var layoutFunc = widget.orient ? widget.orient.bind(widget) : null;
				return around ?
					place.around(wrapper, around, orient, ltr, layoutFunc) :
					place.at(wrapper, args, orient === "R" ? ["TR", "BR", "TL", "BL"] : ["TL", "BL", "TR", "BR"],
						args.padding, layoutFunc);
			}
		},

		/**
		 * Close specified popup and any popups that it parented.  If no popup is specified, closes all popups.
		 * @param {module:delite/Widget} [popup]
		 */
		close: function (popup) {
			var stack = this._stack;

			// Basically work backwards from the top of the stack closing popups
			// until we hit the specified popup, but IIRC there was some issue where closing
			// a popup would cause others to close too.  Thus if we are trying to close B in [A,B,C]
			// closing C might close B indirectly and then the while() condition will run where stack===[A]...
			// so the while condition is constructed defensively.
			while ((popup && stack.some(function (elem) {
				return elem.popup === popup;
			})) ||
				(!popup && stack.length)) {
				var top = stack.pop(),
					widget = top.popup,
					onClose = top.onClose;

				if (widget.bgIframe) {
					// push the iframe back onto the stack.
					widget.bgIframe.destroy();
					delete widget.bgIframe;
				}

				var h;
				while ((h = top.handlers.pop())) {
					h.remove();
				}

				// Hide the widget and its wrapper unless it has already been destroyed in above onClose() etc.
				this.hide(widget);

				if (onClose) {
					onClose();
				}
			}

			if (stack.length === 0 && this._aroundMoveListener) {
				clearTimeout(this._aroundMoveListener);
				this._firstAroundNode = this._firstAroundPosition = this._aroundMoveListener = null;
			}
		}
	});

	return new PopupManager();
});
