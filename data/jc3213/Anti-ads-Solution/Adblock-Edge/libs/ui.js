/*
 * This Source Code is subject to the terms of the Mozilla Public License
 * version 2.0 (the "License"). You can obtain a copy of the License at
 * http://mozilla.org/MPL/2.0/.
 */

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");

let {Utils} = require("utils");
let {Prefs} = require("prefs");
let {Policy} = require("contentPolicy");
let {FilterStorage} = require("filterStorage");
let {FilterNotifier} = require("filterNotifier");
let {RequestNotifier} = require("requestNotifier");
let {Filter} = require("filterClasses");
let {Subscription, SpecialSubscription, DownloadableSubscription} = require("subscriptionClasses");
let {Synchronizer} = require("synchronizer");
let {KeySelector} = require("keySelector");

let CustomizableUI = null;


/**
 * Filter corresponding with "disable on site" menu item (set in fillIconMent()).
 * @type Filter
 */
let siteWhitelist = null;
/**
 * Filter corresponding with "disable on site" menu item (set in fillIconMenu()).
 * @type Filter
 */
let pageWhitelist = null;

/**
 * Window containing the detached list of blockable items.
 * @type Window
 */
let detachedBottombar = null;

/**
 * Object initializing add-on options, observes add-on manager notifications
 * about add-on options being opened.
 * @type nsIObserver
 */
let optionsObserver =
{
	init: function()
	{
		Services.obs.addObserver(this, "addon-options-displayed", true);
		onShutdown.add(function()
		{
			Services.obs.removeObserver(this, "addon-options-displayed");
		}.bind(this));
	},

	/**
	 * Initializes options in add-on manager when they show up.
	 */
	initOptionsDoc: function(/**Document*/ doc)
	{
		function hideElement(id, hide)
		{
			let element = doc.getElementById(id);
			if (element)
				element.collapsed = hide;
		}
		function setChecked(id, checked)
		{
			let element = doc.getElementById(id);
			if (element)
				element.value = checked;
		}
		function addCommandHandler(id, handler)
		{
			let element = doc.getElementById(id);
			if (element)
				element.addEventListener("command", handler, false);
		}

		addCommandHandler("adblockplus-filters", UI.openFiltersDialog.bind(UI));

		let {Sync} = require("sync");
		let syncEngine = Sync.getEngine();
		hideElement("adblockplus-sync", !syncEngine);

		let {defaultToolbarPosition, statusbarPosition} = require("appSupport");
		let hasToolbar = defaultToolbarPosition;
		let hasStatusBar = statusbarPosition;

		hideElement("adblockplus-showintoolbar", !hasToolbar);
		hideElement("adblockplus-showinstatusbar", !hasStatusBar);

		let checkbox = doc.querySelector("setting[type=bool]");
		if (checkbox)
			initCheckboxes();

		function initCheckboxes()
		{
			if (!("value" in checkbox))
			{
				// XBL bindings didn't apply yet (bug 708397), try later
				Utils.runAsync(initCheckboxes);
				return;
			}

			setChecked("adblockplus-savestats", Prefs.savestats);
			addCommandHandler("adblockplus-savestats", function()
			{
				UI.toggleSaveStats(doc.defaultView);
				this.value = Prefs.savestats;
			});

			setChecked("adblockplus-sync", syncEngine && syncEngine.enabled);
			addCommandHandler("adblockplus-sync", function()
			{
				this.value = UI.toggleSync();
			});

			setChecked("adblockplus-showintoolbar", UI.isToolbarIconVisible());
			addCommandHandler("adblockplus-showintoolbar", function()
			{
				UI.toggleToolbarIcon();
				this.value = UI.isToolbarIconVisible();
			});

			let list = doc.getElementById("adblockplus-subscription-list");
			if (list)
			{
				// Load subscriptions data
				let request = new XMLHttpRequest();
				request.mozBackgroundRequest = true;
				request.open("GET", "chrome://adblockplus/content/ui/subscriptions.xml");
				request.addEventListener("load", function()
				{
					if (onShutdown.done)
						return;

					let currentSubscription = FilterStorage.subscriptions.filter((subscription) => subscription instanceof DownloadableSubscription &&
						subscription.url != Prefs.subscriptions_exceptionsurl);
					
					currentSubscription = (currentSubscription.length ? currentSubscription[0] : null);

					let subscriptions =request.responseXML.getElementsByTagName("subscription");
					for (let i = 0; i < subscriptions.length; i++)
					{
						let item = subscriptions[i];
						let url = item.getAttribute("url");
						if (!url)
							continue;

						list.appendItem(item.getAttribute("title"), url, null);
						if (currentSubscription && url == currentSubscription.url)
							list.selectedIndex = list.itemCount - 1;

						if (currentSubscription && list.selectedIndex < 0)
						{
							list.appendItem(currentSubscription.title, currentSubscription.url, null);
							list.selectedIndex = list.itemCount - 1;
						}
					}

					var listener = function()
					{
						if (list.value)
							UI.setSubscription(list.value, list.label);
					}
					list.addEventListener("command", listener, false);

					// xul:menulist in Fennec is broken and doesn't trigger any events
					// on selection. Have to detect selectIndex changes instead.
					// See http://hg.mozilla.org/mozilla-central/file/04d8c309fe72/mobile/android/chrome/content/SelectHelper.js#l40
					list.watch("selectedIndex", function(prop, oldval, newval)
					{
						Utils.runAsync(listener);
						return newval;
					});
				}, false);
				request.send();
			}
		}
	},

	observe: function(subject, topic, data)
	{
		let {addonID} = require("info")
		if (data != addonID)
			return;

		this.initOptionsDoc(subject.QueryInterface(Ci.nsIDOMDocument));
	},

	QueryInterface: XPCOMUtils.generateQI([Ci.nsIObserver, Ci.nsISupportsWeakReference])
};
optionsObserver.init();

/**
 * Session restore observer instance, stored to prevent it from being garbage
 * collected.
 * @type SessionRestoreObserver
 */
let sessionRestoreObserver = null;

/**
 * Observer waiting for the browsing session to be restored on startup.
 */
function SessionRestoreObserver(/**function*/ callback)
{
	sessionRestoreObserver = this;

	this.callback = callback;
	Services.obs.addObserver(this, "sessionstore-windows-restored", true);

	// Just in case, don't wait longer than 5 seconds
	this.timer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);
	this.timer.init(this, 5000, Ci.nsITimer.TYPE_ONE_SHOT);
}
SessionRestoreObserver.prototype =
{
	callback: null,
	timer: null,
	observe: function(subject, topic, data)
	{
		Services.obs.removeObserver(this, "sessionstore-windows-restored");
		sessionRestoreObserver = null;

		this.timer.cancel();
		this.timer = null;

		if (!onShutdown.done)
			this.callback();
	},
	QueryInterface: XPCOMUtils.generateQI([Ci.nsIObserver, Ci.nsISupportsWeakReference])
}

let UI = exports.UI =
{
	/**
	 * Gets called on startup, initializes UI integration.
	 */
	init: function()
	{
		// We should call initDone once both overlay and filters are loaded
		let overlayLoaded = false;
		let filtersLoaded = false;
		let sessionRestored = false;

		// Start loading overlay
		let request = new XMLHttpRequest();
		request.mozBackgroundRequest = true;
		request.open("GET", "chrome://adblockplus/content/ui/overlay.xul");
		request.addEventListener("load", function(event)
		{
			if (onShutdown.done)
				return;

			this.processOverlay(request.responseXML.documentElement);

			// Don't wait for the rest of the startup sequence, add icon already
			this.addToolbarButton();

			overlayLoaded = true;
			if (overlayLoaded && filtersLoaded && sessionRestored)
				this.initDone();
		}.bind(this), false);
		request.send(null);

		// Wait for filters to load
		if (FilterStorage._loading)
		{
			let listener = function(action)
			{
				if (action != "load")
					return;

				FilterNotifier.removeListener(listener);
				filtersLoaded = true;
				if (overlayLoaded && filtersLoaded && sessionRestored)
					this.initDone();
			}.bind(this);
			FilterNotifier.addListener(listener);
		}
		else
			filtersLoaded = true;

		// Initialize UI after the session is restored
		let window = this.currentWindow;
		if (!window && "nsISessionStore" in Ci)
		{
			// No application windows yet, the application must be starting up. Wait
			// for session to be restored before initializing our UI.
			new SessionRestoreObserver(function()
			{
				sessionRestored = true;
				if (overlayLoaded && filtersLoaded && sessionRestored)
					this.initDone();
			}.bind(this));
		}
		else
			sessionRestored = true;
	},

	/**
	 * Provesses overlay document data and initializes overlay property.
	 */
	processOverlay: function(/**Element*/ root)
	{
		let specialElements = {"abp-status-popup": true, "abp-status": true, "abp-toolbarbutton": true, "abp-menuitem": true, "abp-bottombar-container": true};

		this.overlay = {all: []};

		// Remove whitespace text nodes
		let walker = root.ownerDocument.createTreeWalker(
			root, Ci.nsIDOMNodeFilter.SHOW_TEXT,
			(node) => !/\S/.test(node.nodeValue), false
		);
		let whitespaceNodes = [];
		while (walker.nextNode())
			whitespaceNodes.push(walker.currentNode);

		for (let i = 0; i < whitespaceNodes.length; i++)
			whitespaceNodes[i].parentNode.removeChild(whitespaceNodes[i]);

		// Put overlay elements into appropriate fields
		while (root.firstElementChild)
		{
			let child = root.firstElementChild;
			if (child.getAttribute("id") in specialElements)
				this.overlay[child.getAttribute("id")] = child;
			else
				this.overlay.all.push(child);
			root.removeChild(child);
		}

		// Read overlay attributes
		this.overlay.attributes = {};
		for (let i = 0; i < root.attributes.length; i++)
			this.overlay.attributes[root.attributes[i].name] = root.attributes[i].value;

		// Copy context menu into the toolbar icon and Tools menu item
		function fixId(element, newId)
		{
			if (element.hasAttribute("id"))
				element.setAttribute("id", element.getAttribute("id").replace("abp-status", newId));

			for (let i = 0, len = element.children.length; i < len; i++)
				fixId(element.children[i], newId);

			return element;
		}

		if ("abp-status-popup" in this.overlay)
		{
			let menuSource = this.overlay["abp-status-popup"];
			delete this.overlay["abp-status-popup"];

			if (this.overlay.all.length)
				this.overlay.all[0].appendChild(menuSource);
			if ("abp-toolbarbutton" in this.overlay)
				this.overlay["abp-toolbarbutton"].appendChild(fixId(menuSource.cloneNode(true), "abp-toolbar"));
			if ("abp-menuitem" in this.overlay)
				this.overlay["abp-menuitem"].appendChild(fixId(menuSource.cloneNode(true), "abp-menuitem"));
		}
	},

	/**
	 * Gets called once the initialization is finished and Adblock Edge elements
	 * can be added to the UI.
	 */
	initDone: function()
	{
		// The icon might be added already, make sure its state is correct
		this.updateState();
		
		// Listen for pref and filters changes
		Prefs.addListener(function(name)
		{
			if (name == "enabled" || name == "defaulttoolbaraction" || name == "defaultstatusbaraction")
				this.updateState();
			else if (name == "showinstatusbar")
			{
				for (let window in this.applicationWindows)
					this.updateStatusbarIcon(window);
			}
		}.bind(this));
		FilterNotifier.addListener(function(action)
		{
			if (/^(filter|subscription)\.(added|removed|disabled|updated)$/.test(action) || action == "load")
				this.updateState();
		}.bind(this));

		// Execute first-run actions if a window is open already, otherwise it
		// will happen in applyToWindow() when a window is opened.
		this.firstRunActions(this.currentWindow);
	},

	addToolbarButton: function()
	{
		let {WindowObserver} = require("windowObserver");
		new WindowObserver(this);

		let {defaultToolbarPosition} = require("appSupport");
		if ("abp-toolbarbutton" in this.overlay && defaultToolbarPosition)
		{
			try
			{
				({CustomizableUI}) = Cu.import("resource:///modules/CustomizableUI.jsm", null);
			}
			catch (e)
			{
				// No built-in CustomizableUI API, use our own implementation.
				({CustomizableUI}) = require("customizableUI");
			}

			CustomizableUI.createWidget({
				id: "abp-toolbarbutton",
				type: "custom",
				positionAttribute: "abp-iconposition",        // For emulation only
				defaultArea: defaultToolbarPosition.parent,
				defaultBefore: defaultToolbarPosition.before, // For emulation only
				defaultAfter: defaultToolbarPosition.after,   // For emulation only
				removable: true,
				onBuild: function(document)
				{
					let node = document.importNode(this.overlay["abp-toolbarbutton"], true);
					node.addEventListener("click", this.onIconClick, false);
					node.addEventListener("command", this.onIconClick, false);
					this.updateIconState(document.defaultView, node);
					return node;
				}.bind(this),
				onAdded: function(node)
				{
					// For emulation only, this callback isn't part of the official
					// CustomizableUI API.
					this.updateIconState(node.ownerDocument.defaultView, node);
				}.bind(this),
			});
			onShutdown.add(CustomizableUI.destroyWidget.bind(CustomizableUI, "abp-toolbarbutton"));
		}
	},

	firstRunActions: function(window)
	{
		if (this.firstRunDone || !window || FilterStorage._loading)
			return;

		this.firstRunDone = true;

		let {addonVersion} = require("info");
		let prevVersion = Prefs.currentVersion;
		if (prevVersion != addonVersion)
		{
			Prefs.currentVersion = addonVersion;
		}
	},

	/**
	 * Will be set to true after the check whether first-run actions should run
	 * has been performed.
	 * @type Boolean
	 */
	firstRunDone: false,

	/**
	 * Initializes Adblock Edge UI in a window.
	 */
	applyToWindow: function(/**Window*/ window, /**Boolean*/ noDelay)
	{
		let {delayInitialization, isKnownWindow, getBrowser, addBrowserLocationListener, addBrowserClickListener} = require("appSupport");
		if (window.document.documentElement.id == "CustomizeToolbarWindow" || isKnownWindow(window))
		{
			// Add style processing instruction
			let style = window.document.createProcessingInstruction("xml-stylesheet", 'class="adblockplus-node" href="chrome://adblockplus/skin/overlay.css" type="text/css"');
			window.document.insertBefore(style, window.document.firstChild);
		}

		if (!isKnownWindow(window))
			return;

		// Thunderbird windows will not be initialized at this point, execute
		// delayed
		if (!noDelay && delayInitialization)
		{
			Utils.runAsync(this.applyToWindow.bind(this, window, true));
			return;
		}

		// Add general items to the document
		for (let i = 0; i < this.overlay.all.length; i++)
			window.document.documentElement.appendChild(this.overlay.all[i].cloneNode(true));

		// Add status bar icon
		this.updateStatusbarIcon(window);

		// Add tools menu item
		if ("abp-menuitem" in this.overlay)
		{
			let {toolsMenu} = require("appSupport");
			let [parent, before] = this.resolveInsertionPoint(window, toolsMenu);
			if (parent)
				parent.insertBefore(this.overlay["abp-menuitem"].cloneNode(true), before);
		}

		// Attach event handlers
		for (let i = 0; i < eventHandlers.length; i++)
		{
			let [id, event, handler] = eventHandlers[i];
			let element = window.document.getElementById(id);
			if (element)
				element.addEventListener(event, handler.bind(null, window), false);
		}
		window.addEventListener("popupshowing", this.onPopupShowing, false);
		window.addEventListener("keypress", this.onKeyPress, false);

		addBrowserLocationListener(window, function()
		{
			this.updateIconState(window, window.document.getElementById("abp-status"));
			this.updateIconState(window, window.document.getElementById("abp-toolbarbutton"));
		}.bind(this));
		addBrowserClickListener(window, this.onBrowserClick.bind(this, window));

		// First-run actions?
		this.firstRunActions(window);

		// Some people actually switch off browser.frames.enabled and are surprised
		// that things stop working...
		window.QueryInterface(Ci.nsIInterfaceRequestor)
					.getInterface(Ci.nsIWebNavigation)
					.QueryInterface(Ci.nsIDocShell)
					.allowSubframes = true;
	},

	/**
	 * Removes Adblock Edge UI from a window.
	 */
	removeFromWindow: function(/**Window*/ window)
	{
		let {isKnownWindow, removeBrowserLocationListeners, removeBrowserClickListeners} = require("appSupport");
		if (window.document.documentElement.id == "CustomizeToolbarWindow" || isKnownWindow(window))
		{
			// Remove style processing instruction
			for (let child = window.document.firstChild; child; child = child.nextSibling)
				if (child.nodeType == child.PROCESSING_INSTRUCTION_NODE && child.data.indexOf("adblockplus-node") >= 0)
					child.parentNode.removeChild(child);
		}

		if (!isKnownWindow(window))
			return;

		for (let id in this.overlay)
		{
			if (id == "all")
			{
				let list = this.overlay[id];
				for (let i = 0; i < list.length; i++)
				{
					let clone = window.document.getElementById(list[i].getAttribute("id"));
					if (clone)
						clone.parentNode.removeChild(clone);
				}
			}
			else
			{
				let clone = window.document.getElementById(id);
				if (clone)
					clone.parentNode.removeChild(clone);
			}
		}

		window.removeEventListener("popupshowing", this.onPopupShowing, false);
		window.removeEventListener("keypress", this.onKeyPress, false);
		removeBrowserLocationListeners(window);
		removeBrowserClickListeners(window);
	},

	/**
	 * The overlay information to be used when adding elements to the UI.
	 * @type Object
	 */
	overlay: null,

	/**
	 * Iterator for application windows that Adblock Edge should apply to.
	 * @type Iterator
	 */
	get applicationWindows()
	{
		let {isKnownWindow} = require("appSupport");

		let enumerator = Services.wm.getZOrderDOMWindowEnumerator(null, true);
		if (!enumerator.hasMoreElements())
		{
			// On Linux the list returned will be empty, see bug 156333. Fall back to random order.
			enumerator = Services.wm.getEnumerator(null);
		}
		while (enumerator.hasMoreElements())
		{
			let window = enumerator.getNext().QueryInterface(Ci.nsIDOMWindow);
			if (isKnownWindow(window))
				yield window;
		}
	},

	/**
	 * Returns the top-most application window or null if none exists.
	 * @type Window
	 */
	get currentWindow()
	{
		for (let window of this.applicationWindows)
			return window;
		return null;
	},

	/**
	 * Opens a URL in the browser window. If browser window isn't passed as parameter,
	 * this function attempts to find a browser window. If an event is passed in
	 * it should be passed in to the browser if possible (will e.g. open a tab in
	 * background depending on modifiers keys).
	 */
	loadInBrowser: function(/**String*/ url, /**Window*/ currentWindow, /**Event*/ event)
	{
		if (!currentWindow)
			currentWindow = this.currentWindow;

		let {addTab} = require("appSupport");
		if (currentWindow && addTab)
			addTab(currentWindow, url, event);
		else
		{
			let protocolService = Cc["@mozilla.org/uriloader/external-protocol-service;1"].getService(Ci.nsIExternalProtocolService);
			protocolService.loadURI(Services.io.newURI(url, null, null), null);
		}
	},

	/**
	 * Opens a pre-defined documentation link in the browser window. This will
	 * send the UI language to adblockplus.org so that the correct language
	 * version of the page can be selected.
	 */
	loadDocLink: function(/**String*/ linkID, /**Window*/ window)
	{
		let {Prefs} = require("prefs");
		let link = Prefs.documentation_link.replace(/%LINK%/g, linkID).replace(/%LANG%/g, Utils.appLocale);
		this.loadInBrowser(link, window);
	},


	/**
	 * Brings up the filter composer dialog to block an item.
	 */
	blockItem: function(/**Window*/ window, /**Node*/ node, /**RequestEntry*/ item)
	{
		if (!item)
			return;

		window.openDialog("chrome://adblockplus/content/ui/composer.xul", "_blank", "chrome,centerscreen,resizable,dialog=no,dependent", [node], item);
	},

	/**
	 * Opens filter preferences dialog or focuses an already open dialog.
	 * @param {Filter} [filter]  filter to be selected
	 */
	openFiltersDialog: function(filter)
	{
		let existing = Services.wm.getMostRecentWindow("abp:filters");
		if (existing)
		{
			try
			{
				existing.focus();
			} catch (e) {}
			if (filter)
				existing.SubscriptionActions.selectFilter(filter);
		}
		else
		{
			Services.ww.openWindow(null, "chrome://adblockplus/content/ui/filters.xul", "_blank", "chrome,centerscreen,resizable,dialog=no", {wrappedJSObject: filter});
		}
	},  

	/**
	 * Handles clicks inside the browser's content area, will intercept clicks on
	 * abp: links. This can be called either with an event object or with the link
	 * target (if it is the former then link target will be retrieved from event
	 * target).
	 */
	onBrowserClick: function (/**Window*/ window, /**Event*/ event, /**String*/ linkTarget)
	{
		if (event)
		{
			// Ignore right-clicks
			if (event.button == 2)
				return;

			// Search the link associated with the click
			let link = event.target;
			while (link && !(link instanceof Ci.nsIDOMHTMLAnchorElement))
				link = link.parentNode;

			if (!link || link.protocol != "abp:")
				return;

			// This is our link - make sure the browser doesn't handle it
			event.preventDefault();
			event.stopPropagation();

			linkTarget = link.href;
		}

		let match = /^abp:\/*subscribe\/*\?(.*)/i.exec(linkTarget);
		if (!match)
			return;

		// Decode URL parameters
		let title = null;
		let url = null;
		let mainSubscriptionTitle = null;
		let mainSubscriptionURL = null;
		for (let param of match[1].split('&'))
		{
			let parts = param.split("=", 2);
			if (parts.length != 2 || !/\S/.test(parts[1]))
				continue;
			switch (parts[0])
			{
				case "title":
					title = decodeURIComponent(parts[1]);
					break;
				case "location":
					url = decodeURIComponent(parts[1]);
					break;
				case "requiresTitle":
					mainSubscriptionTitle = decodeURIComponent(parts[1]);
					break;
				case "requiresLocation":
					mainSubscriptionURL = decodeURIComponent(parts[1]);
					break;
			}
		}
		if (!url)
			return;

		// Default title to the URL
		if (!title)
			title = url;

		// Main subscription needs both title and URL
		if (mainSubscriptionTitle && !mainSubscriptionURL)
			mainSubscriptionTitle = null;
		if (mainSubscriptionURL && !mainSubscriptionTitle)
			mainSubscriptionURL = null;

		// Trim spaces in title and URL
		title = title.replace(/^\s+/, "").replace(/\s+$/, "");
		url = url.replace(/^\s+/, "").replace(/\s+$/, "");
		if (mainSubscriptionURL)
		{
			mainSubscriptionTitle = mainSubscriptionTitle.replace(/^\s+/, "").replace(/\s+$/, "");
			mainSubscriptionURL = mainSubscriptionURL.replace(/^\s+/, "").replace(/\s+$/, "");
		}

		// Verify that the URL is valid
		url = Utils.makeURI(url);
		if (!url || (url.scheme != "http" && url.scheme != "https" && url.scheme != "ftp"))
			return;
		url = url.spec;

		if (mainSubscriptionURL)
		{
			mainSubscriptionURL = Utils.makeURI(mainSubscriptionURL);
			if (!mainSubscriptionURL || (mainSubscriptionURL.scheme != "http" && mainSubscriptionURL.scheme != "https" && mainSubscriptionURL.scheme != "ftp"))
				mainSubscriptionURL = mainSubscriptionTitle = null;
			else
				mainSubscriptionURL = mainSubscriptionURL.spec;
		}

		this.openSubscriptionDialog(window, url, title, mainSubscriptionURL, mainSubscriptionTitle);
	},

	/**
	 * Opens a dialog letting the user confirm/adjust a filter subscription to
	 * be added.
	 */
	openSubscriptionDialog: function(/**Window*/ window, /**String*/ url, /**String*/ title, /**String*/ mainURL, /**String*/ mainTitle)
	{
		let subscription = {url: url, title: title, disabled: false, external: false,
												mainSubscriptionTitle: mainTitle, mainSubscriptionURL: mainURL};
		window.openDialog("chrome://adblockplus/content/ui/subscriptionSelection.xul", "_blank",
											"chrome,centerscreen,resizable,dialog=no", subscription, null);
	},

	/**
	 * Retrieves the current location of the browser.
	 */
	getCurrentLocation: function(/**Window*/ window) /**nsIURI*/
	{
		let {getCurrentLocation} = require("appSupport");
		let result = getCurrentLocation(window);
		return (result ? Utils.unwrapURL(result) : null);
	},

	/**
	 * Looks up an element with given ID in the window. If a list of IDs is given
	 * will try all of them until an element exists.
	 */
	findElement: function(/**Window*/ window, /**String|String[]*/ id) /**Element*/
	{
		if (id instanceof Array)
		{
			for (let candidate of id)
			{
				let result = window.document.getElementById(candidate);
				if (result)
					return result;
			}
			return null;
		}
		else
			return window.document.getElementById(id);
	},

	/**
	 * Resolves an insertion point as specified in appSupport module. Returns
	 * two elements: the parent element and the element to insert before.
	 */
	resolveInsertionPoint: function(/**Window*/ window, /**Object*/ insertionPoint) /**Element[]*/
	{
		let parent = null;
		let before = null;
		if (insertionPoint)
		{
			if ("parent" in insertionPoint)
				parent = this.findElement(window, insertionPoint.parent);

			if (parent && "before" in insertionPoint)
				before = this.findElement(window, insertionPoint.before);

			if (parent && !before && "after" in insertionPoint)
			{
				let after = this.findElement(window, insertionPoint.after);
				if (after)
					before = after.nextElementSibling;
			}

			if (before && before.parentNode != parent)
				before = null;
		}

		return [parent, before];
	},

	/**
	 * Toggles visibility state of the toolbar icon.
	 */
	toggleToolbarIcon: function()
	{
		if (!CustomizableUI)
			return;
		if (this.isToolbarIconVisible())
			CustomizableUI.removeWidgetFromArea("abp-toolbarbutton");
		else
		{
			let {defaultToolbarPosition} = require("appSupport");
			CustomizableUI.addWidgetToArea("abp-toolbarbutton", defaultToolbarPosition.parent);
		}
	},

	/**
	 * Updates Adblock Edge icon state for all windows.
	 */
	updateState: function()
	{
		for (let window in this.applicationWindows)
		{
			this.updateIconState(window, window.document.getElementById("abp-status"));
			this.updateIconState(window, window.document.getElementById("abp-toolbarbutton"));
		}
	},

	/**
	 * Updates Adblock Edge icon state for a single application window.
	 */
	updateIconState: function(/**Window*/ window, /**Element*/ icon)
	{
		if (!icon)
			return;

		let state = (Prefs.enabled ? "active" : "disabled");
		if (state == "active")
		{
			let location = this.getCurrentLocation(window);
			if (location && Policy.isWhitelisted(location.spec))
				state = "whitelisted";
		}
		
		let popupId = "abp-status-popup";
		if (icon.localName == "statusbarpanel")
		{
			if (Prefs.defaultstatusbaraction == 0)
			{
				icon.setAttribute("popup", popupId);
				icon.removeAttribute("context");
			}
			else
			{
				icon.removeAttribute("popup");
				icon.setAttribute("context", popupId);
			}
		}
		else
		{
			if (Prefs.defaulttoolbaraction == 0)
			{
				icon.setAttribute("type", "menu");
				icon.removeAttribute("context");
			}
			else
			{
				icon.setAttribute("type", "menu-button");
				icon.setAttribute("context", popupId);
			}
		}

		icon.setAttribute("abpstate", state);
	},

	/**
	 * Shows or hides status bar icons in all windows, according to pref.
	 */
	updateStatusbarIcon: function(/**Window*/ window)
	{
		if (!("abp-status" in this.overlay))
			return;

		let {statusbarPosition} = require("appSupport");
		if (!statusbarPosition)
			return;

		let icon = window.document.getElementById("abp-status");
		if (Prefs.showinstatusbar && !icon)
		{
			let [parent, before] = this.resolveInsertionPoint(window, statusbarPosition);
			if (!parent)
				return;

			parent.insertBefore(this.overlay["abp-status"].cloneNode(true), before);

			icon = window.document.getElementById("abp-status");
			this.updateIconState(window, icon);
			icon.addEventListener("click", this.onIconClick, false);
		}
		else if (!Prefs.showinstatusbar && icon)
			icon.parentNode.removeChild(icon);
	},

	/**
	 * Toggles the value of a boolean preference.
	 */
	togglePref: function(/**String*/ pref)
	{
		Prefs[pref] = !Prefs[pref];
	},

	/**
	 * If the given filter is already in user's list, removes it from the list. Otherwise adds it.
	 */
	toggleFilter: function(/**Filter*/ filter)
	{
		if (filter.subscriptions.length)
		{
			if (filter.disabled || filter.subscriptions.some((subscription) => !(subscription instanceof SpecialSubscription)))
				filter.disabled = !filter.disabled;
			else
				FilterStorage.removeFilter(filter);
		}
		else
			FilterStorage.addFilter(filter);
	},


	/**
	 * Toggles "Count filter hits" option.
	 */
	toggleSaveStats: function(window)
	{
		if (Prefs.savestats)
		{
			if (!Utils.confirm(window, Utils.getString("clearStats_warning")))
				return;

			FilterStorage.resetHitCounts();
			Prefs.savestats = false;
		}
		else
			Prefs.savestats = true;
	},

	/**
	 * Sets the current filter subscription in a single-subscription scenario,
	 * all other subscriptions will be removed.
	 */
	setSubscription: function(url, title)
	{
		let subscription = Subscription.fromURL(url);
		let currentSubscriptions = FilterStorage.subscriptions.filter(
			((subscription) => subscription instanceof DownloadableSubscription && subscription.url != Prefs.subscriptions_exceptionsurl)
		);
		if (!subscription || currentSubscriptions.indexOf(subscription) >= 0)
			return;

		for (let i = 0; i < currentSubscriptions.length; i++)
			FilterStorage.removeSubscription(currentSubscriptions[i]);

		subscription.title = title;
		FilterStorage.addSubscription(subscription);
		if (subscription instanceof DownloadableSubscription && !subscription.lastDownload)
			Synchronizer.execute(subscription);
	},

	/**
	 * Toggles the pref for the Adblock Edge sync engine.
	 * @return {Boolean} new state of the sync engine
	 */
	toggleSync: function()
	{
		let {Sync} = require("sync");
		let syncEngine = Sync.getEngine();
		if (syncEngine)
		{
			syncEngine.enabled = !syncEngine.enabled;
			return syncEngine.enabled;
		}
		else
			return false;
	},

	/**
	 * Tests whether blockable items list is currently open.
	 */
	isBottombarOpen: function(/**Window*/ window) /**Boolean*/
	{
		if (detachedBottombar && !detachedBottombar.closed)
			return true;

		return !!window.document.getElementById("abp-bottombar");
	},

	/**
	 * Called when some pop-up in the application window shows up, initializes
	 * pop-ups related to Adblock Edge.
	 */
	onPopupShowing: function(/**Event*/ event)
	{
		if (event.defaultPrevented)
			return;

		let popup = event.originalTarget;

		let {contentContextMenu} = require("appSupport");
		if ((typeof contentContextMenu == "string" && popup.id == contentContextMenu) ||
				(contentContextMenu instanceof Array && contentContextMenu.indexOf(popup.id) >= 0))
		{
			this.fillContentContextMenu(popup);
		}
		else if (popup.id == "abp-tooltip")
			this.fillIconTooltip(event, popup.ownerDocument.defaultView);
		else
		{
			let match = /^(abp-(?:toolbar|status|menuitem)-)popup$/.exec(popup.id);
			if (match)
				this.fillIconMenu(event, popup.ownerDocument.defaultView, match[1]);
		}
	},

	/**
	 * Handles click on toolbar and status bar icons.
	 */
	onIconClick: function(/**Event*/ event)
	{
		if (event.eventPhase != event.AT_TARGET)
			return;

		let isToolbar = (event.target.localName != "statusbarpanel");
		let action = 0;
		if ((isToolbar && event.type == "command") || (!isToolbar && event.button == 0))
			action = (isToolbar ? Prefs.defaulttoolbaraction : Prefs.defaultstatusbaraction);
		else if (event.button == 1)
			action = 3;

		let window = event.target.ownerDocument.defaultView;
		if (action == 1)
			this.toggleBottombar(window);
		else if (action == 2)
			this.openFiltersDialog();
		else if (action == 3)
		{
			// If there is a whitelisting rule for current page - remove it (reenable).
			// Otherwise flip "enabled" pref.
			if (!this.removeWhitelist(window))
				this.togglePref("enabled");
		}
	},

	/**
	 * Removes/disables the exception rule applying for the current page.
	 */
	removeWhitelist: function(/**Window*/ window)
	{
		let location = this.getCurrentLocation(window);
		let filter = null;
		if (location)
			filter = Policy.isWhitelisted(location.spec);
		if (filter && filter.subscriptions.length && !filter.disabled)
		{
			UI.toggleFilter(filter);
			return true;
		}
		return false;
	},

	/**
	 * Updates state of the icon tooltip.
	 */
	fillIconTooltip: function(/**Event*/ event, /**Window*/ window)
	{
		let E = (id) => window.document.getElementById(id);

		let node = window.document.tooltipNode;
		if (!node || !node.hasAttribute("tooltip"))
		{
			event.preventDefault();
			return;
		}

		// Prevent tooltip from overlapping menu
		for (let id of ["abp-toolbar-popup", "abp-status-popup"])
		{
			let element = E(id);
			if (element && element.state == "open")
			{
				event.preventDefault();
				return;
			}
		}

		let type = (node.id == "abp-toolbarbutton" ? "toolbar" : "statusbar");
		let action = parseInt(Prefs["default" + type + "action"]);
		if (isNaN(action))
			action = -1;

		let actionDescr = E("abp-tooltip-action");
		actionDescr.hidden = (action < 0 || action > 3);
		if (!actionDescr.hidden)
			actionDescr.setAttribute("value", Utils.getString("action" + action + "_tooltip"));

		let statusDescr = E("abp-tooltip-status");
		let state = node.getAttribute("abpstate");
		let statusStr = Utils.getString(state + "_tooltip");
		if (state == "active")
		{
			let [activeSubscriptions, activeFilters] = FilterStorage.subscriptions.reduce(function([subscriptions, filters], current)
			{
				if (current instanceof SpecialSubscription)
					return [subscriptions, filters + current.filters.filter((filter) => !filter.disabled).length];
				else if (!current.disabled && !(Prefs.subscriptions_exceptionscheckbox && current.url == Prefs.subscriptions_exceptionsurl))
					return [subscriptions + 1, filters];
				else
					return [subscriptions, filters]
			}, [0, 0]);

			statusStr = statusStr.replace(/\?1\?/, activeSubscriptions).replace(/\?2\?/, activeFilters);
		}
		statusDescr.setAttribute("value", statusStr);

		let activeFilters = [];
		E("abp-tooltip-blocked-label").hidden = (state != "active");
		E("abp-tooltip-blocked").hidden = (state != "active");
		if (state == "active")
		{
			let {getBrowser} = require("appSupport");
			let stats = RequestNotifier.getWindowStatistics(getBrowser(window).contentWindow);

			let blockedStr = Utils.getString("blocked_count_tooltip");
			blockedStr = blockedStr.replace(/\?1\?/, stats ? stats.blocked : 0).replace(/\?2\?/, stats ? stats.items : 0);

			if (stats && stats.whitelisted + stats.hidden)
			{
				blockedStr += " " + Utils.getString("blocked_count_addendum");
				blockedStr = blockedStr.replace(/\?1\?/, stats.whitelisted).replace(/\?2\?/, stats.hidden);
			}

			E("abp-tooltip-blocked").setAttribute("value", blockedStr);

			if (stats)
			{
				let filterSort = function(a, b)
				{
					return stats.filters[b] - stats.filters[a];
				};
				for (let filter in stats.filters)
					activeFilters.push(filter);
				activeFilters = activeFilters.sort(filterSort);
			}

			if (activeFilters.length > 0)
			{
				let filtersContainer = E("abp-tooltip-filters");
				while (filtersContainer.firstChild)
					filtersContainer.removeChild(filtersContainer.firstChild);

				for (let i = 0; i < activeFilters.length && i < 3; i++)
				{
					let descr = filtersContainer.ownerDocument.createElement("description");
					descr.setAttribute("value", activeFilters[i] + " (" + stats.filters[activeFilters[i]] + ")");
					filtersContainer.appendChild(descr);
				}
			}
		}

		E("abp-tooltip-filters-label").hidden = (activeFilters.length == 0);
		E("abp-tooltip-filters").hidden = (activeFilters.length == 0);
		E("abp-tooltip-more-filters").hidden = (activeFilters.length <= 3);
	},

	/**
	 * Updates state of the icon context menu.
	 */
	fillIconMenu: function(/**Event*/ event, /**Window*/ window, /**String*/ prefix)
	{
		function hideElement(id, hide)
		{
			let element = window.document.getElementById(id);
			if (element)
				element.hidden = hide;
		}
		function setChecked(id, checked)
		{
			let element = window.document.getElementById(id);
			if (element)
				element.setAttribute("checked", checked);
		}
		function setDisabled(id, disabled)
		{
			let element = window.document.getElementById(id);
			if (element)
				element.setAttribute("disabled", disabled);
		}
		function setDefault(id, isDefault)
		{
			let element = window.document.getElementById(id);
			if (element)
				element.setAttribute("default", isDefault);
		}
		function generateLabel(id, param)
		{
			let element = window.document.getElementById(id);
			if (element)
				element.setAttribute("label", element.getAttribute("labeltempl").replace(/\?1\?/, param));
		}

		let bottombarOpen = this.isBottombarOpen(window);
		hideElement(prefix + "openbottombar", bottombarOpen);
		hideElement(prefix + "closebottombar", !bottombarOpen);

		hideElement(prefix + "whitelistsite", true);
		hideElement(prefix + "whitelistpage", true);

		let location = this.getCurrentLocation(window);
		if (location && Policy.isBlockableScheme(location))
		{
			let host = null;
			try
			{
				host = location.host.replace(/^www\./, "");
			} catch (e) {}

			if (host)
			{
				let ending = "|";
				location = location.clone();
				if (location instanceof Ci.nsIURL)
					location.ref = "";
				if (location instanceof Ci.nsIURL && location.query)
				{
					location.query = "";
					ending = "?";
				}

				siteWhitelist = Filter.fromText("@@||" + host + "^$document");
				setChecked(prefix + "whitelistsite", siteWhitelist.subscriptions.length && !siteWhitelist.disabled);
				generateLabel(prefix + "whitelistsite", host);
				hideElement(prefix + "whitelistsite", false);

				pageWhitelist = Filter.fromText("@@|" + location.spec + ending + "$document");
				setChecked(prefix + "whitelistpage", pageWhitelist.subscriptions.length && !pageWhitelist.disabled);
				hideElement(prefix + "whitelistpage", false);
			}
			else
			{
				siteWhitelist = Filter.fromText("@@|" + location.spec + "|");
				setChecked(prefix + "whitelistsite", siteWhitelist.subscriptions.length && !siteWhitelist.disabled);
				generateLabel(prefix + "whitelistsite", location.spec.replace(/^mailto:/, ""));
				hideElement(prefix + "whitelistsite", false);
			}
		}

		setChecked(prefix + "disabled", !Prefs.enabled);
		setChecked(prefix + "frameobjects", Prefs.frameobjects);
		setChecked(prefix + "slowcollapse", !Prefs.fastcollapse);
		setChecked(prefix + "savestats", Prefs.savestats);

		let {defaultToolbarPosition, statusbarPosition} = require("appSupport");
		let hasToolbar = defaultToolbarPosition;
		let hasStatusBar = statusbarPosition;;
		hideElement(prefix + "showintoolbar", !hasToolbar || prefix == "abp-toolbar-");
		hideElement(prefix + "showinstatusbar", !hasStatusBar);
		hideElement(prefix + "iconSettingsSeparator", (prefix == "abp-toolbar-" || !hasToolbar) && !hasStatusBar);

		setChecked(prefix + "showintoolbar", this.isToolbarIconVisible());
		setChecked(prefix + "showinstatusbar", Prefs.showinstatusbar);

		let {Sync} = require("sync");
		let syncEngine = Sync.getEngine();
		hideElement(prefix + "sync", !syncEngine);
		setChecked(prefix + "sync", syncEngine && syncEngine.enabled);

		let defAction = (!window.document.popupNode || window.document.popupNode.id == "abp-toolbarbutton" ?
										 Prefs.defaulttoolbaraction :
										 Prefs.defaultstatusbaraction);
		setDefault(prefix + "openbottombar", defAction == 1);
		setDefault(prefix + "closebottombar", defAction == 1);
		setDefault(prefix + "filters", defAction == 2);
		setDefault(prefix + "disabled", defAction == 3);

		let popup = window.document.getElementById(prefix + "popup");
		let items = (popup ? popup.querySelectorAll('menuitem[key]') : []);
		for (let i = 0; i < items.length; i++)
		{
			let item = items[i];
			let match = /^abp-key-/.exec(item.getAttribute("key"));
			if (!match)
				continue;

			let name = match.input.substr(match.index + match[0].length);
			if (!this.hotkeys)
				this.configureKeys(window);
			if (name in this.hotkeys)
			{
				let text = KeySelector.getTextForKey(this.hotkeys[name]);
				if (text)
					item.setAttribute("acceltext", text);
				else
					item.removeAttribute("acceltext");
			}
		}

		hideElement(prefix + "contributebutton", Prefs.hideContributeButton);
	},

	/**
	 * Adds Adblock Edge menu items to the content area context menu when it shows
	 * up.
	 */
	fillContentContextMenu: function(/**Element*/ popup)
	{
		let target = popup.triggerNode;
		if (target instanceof Ci.nsIDOMHTMLMapElement || target instanceof Ci.nsIDOMHTMLAreaElement)
		{
			// HTML image maps will usually receive events when the mouse pointer is
			// over a different element, get the real event target.
			let rect = target.getClientRects()[0];
			target = target.ownerDocument.elementFromPoint(Math.max(rect.left, 0), Math.max(rect.top, 0));
		}

		if (!target)
			return;

		let window = popup.ownerDocument.defaultView;
		let menuItems = [];
		let addMenuItem = function([node, nodeData])
		{
			let type = nodeData.typeDescr.toLowerCase();
			if (type == "background")
			{
				type = "image";
				node = null;
			}

			let label = this.overlay.attributes[type + "contextlabel"];
			if (!label)
				return;

			let item = popup.ownerDocument.createElement("menuitem");
			item.setAttribute("label", label);
			item.setAttribute("class", "abp-contextmenuitem");
			item.addEventListener("command", this.blockItem.bind(this, window, node, nodeData), false);
			popup.appendChild(item);

			menuItems.push(item);
		}.bind(this);

		// Look up data that we have for the node
		let data = RequestNotifier.getDataForNode(target);
		let hadImage = false;
		if (data && !data[1].filter)
		{
			addMenuItem(data);
			hadImage = (data[1].typeDescr == "IMAGE");
		}

		// Look for frame data
		let wnd = Utils.getWindow(target);
		if (wnd.frameElement)
		{
			let data = RequestNotifier.getDataForNode(wnd.frameElement, true);
			if (data && !data[1].filter)
				addMenuItem(data);
		}

		// Look for a background image
		if (!hadImage)
		{
			let extractImageURL = function(computedStyle, property)
			{
				let value = computedStyle.getPropertyCSSValue(property);
				// CSSValueList
				if ("length" in value && value.length >= 1)
					value = value[0];
				// CSSValuePrimitiveType
				if ("primitiveType" in value && value.primitiveType == value.CSS_URI)
					return Utils.unwrapURL(value.getStringValue()).spec;

				return null;
			};

			let node = target;
			while (node)
			{
				if (node.nodeType == Ci.nsIDOMNode.ELEMENT_NODE)
				{
					let style = wnd.getComputedStyle(node, "");
					let bgImage = extractImageURL(style, "background-image") || extractImageURL(style, "list-style-image");
					if (bgImage)
					{
						let data = RequestNotifier.getDataForNode(wnd.document, true, Policy.type.IMAGE, bgImage);
						if (data && !data[1].filter)
						{
							addMenuItem(data);
							break;
						}
					}
				}

				node = node.parentNode;
			}
		}

		// Add "Remove exception" menu item if necessary
		let location = this.getCurrentLocation(window);
		let filter = (location ? Policy.isWhitelisted(location.spec) : null);
		if (filter && filter.subscriptions.length && !filter.disabled)
		{
			let label = this.overlay.attributes.whitelistcontextlabel;
			if (!label)
				return;

			let item = popup.ownerDocument.createElement("menuitem");
			item.setAttribute("label", label);
			item.setAttribute("class", "abp-contextmenuitem");
			item.addEventListener("command", this.toggleFilter.bind(this, filter), false);
			popup.appendChild(item);

			menuItems.push(item);
		}

		// Make sure to clean up everything once the context menu is closed
		if (menuItems.length)
		{
			let cleanUp = function(event)
			{
				if (event.eventPhase != event.AT_TARGET)
					return;

				popup.removeEventListener("popuphidden", cleanUp, false);
				for (let i = 0; i < menuItems.length; i++)
					if (menuItems[i].parentNode)
						menuItems[i].parentNode.removeChild(menuItems[i]);
			}.bind(this);
			popup.addEventListener("popuphidden", cleanUp, false);
		}
	},

	/**
	 * Called when the user presses a key in the application window, reacts to our
	 * shortcut keys.
	 */
	onKeyPress: function(/**Event*/ event)
	{
		if (!this.hotkeys)
			this.configureKeys(event.currentTarget);

		for (let key in this.hotkeys)
		{
			if (KeySelector.matchesKey(event, this.hotkeys[key]))
			{
				event.preventDefault();
				let command = event.currentTarget.document.getElementById("abp-command-" + key);
				if (command)
					command.doCommand();
			}
		}
	},

	/**
	 * Checks whether the toolbar icon is currently displayed.
	 */
	isToolbarIconVisible: function() /**Boolean*/
	{
		if (!CustomizableUI)
			return false;
		let placement = CustomizableUI.getPlacementOfWidget("abp-toolbarbutton");
		return !!placement;
	},

	/**
	 * Stores the selected hotkeys, initialized when the user presses a key.
	 */
	hotkeys: null,

	/**
	 * Chooses shortcut keys that are available in the window according to
	 * preferences.
	 */
	configureKeys: function(/**Window*/ window)
	{
		let selector = new KeySelector(window);

		this.hotkeys = {};
		for (let name in Prefs)
		{
			let match = /_key$/.exec(name);
			if (match && typeof Prefs[name] == "string")
			{
				let keyName = match.input.substr(0, match.index);
				this.hotkeys[keyName] = selector.selectKey(Prefs[name]);
			}
		}
	},

	/**
	 * Toggles open/closed state of the blockable items list.
	 */
	toggleBottombar: function(/**Window*/ window)
	{
		if (detachedBottombar && !detachedBottombar.closed)
		{
			detachedBottombar.close();
			detachedBottombar = null;
		}
		else
		{
			let {addBottomBar, removeBottomBar, getBrowser} = require("appSupport");
			let mustDetach = !addBottomBar || !removeBottomBar || !("abp-bottombar-container" in this.overlay);
			let detach = mustDetach || Prefs.detachsidebar;
			if (!detach && window.document.getElementById("abp-bottombar"))
			{
				removeBottomBar(window);

				let browser = (getBrowser ? getBrowser(window) : null);
				if (browser)
					browser.contentWindow.focus();
			}
			else if (!detach)
			{
				addBottomBar(window, this.overlay["abp-bottombar-container"]);
				let element = window.document.getElementById("abp-bottombar");
				if (element)
				{
					element.setAttribute("width", Prefs.blockableItemsSize.width);
					element.setAttribute("height", Prefs.blockableItemsSize.height);

					let splitter = window.document.getElementById("abp-bottombar-splitter");
					if (splitter)
					{
						splitter.addEventListener("command", function()
						{
							Prefs.blockableItemsSize = {width: element.width, height: element.height};
						}, false);
					}
				}
			}
			else
				detachedBottombar = window.openDialog("chrome://adblockplus/content/ui/sidebarDetached.xul", "_blank", "chrome,resizable,dependent,dialog=no", mustDetach);
		}
	},
};
UI.onPopupShowing = UI.onPopupShowing.bind(UI);
UI.onKeyPress = UI.onKeyPress.bind(UI);
UI.onIconClick = UI.onIconClick.bind(UI);
UI.init();

/**
 * List of event handers to be registered for each window. For each event
 * handler the element ID, event and the actual event handler are listed.
 * @type Array
 */
let eventHandlers = [  
	["abp-command-filters", "command", UI.openFiltersDialog.bind(UI)],
	["abp-command-sidebar", "command", UI.toggleBottombar.bind(UI)],
	["abp-command-togglesitewhitelist", "command", function() { UI.toggleFilter(siteWhitelist); }],
	["abp-command-togglepagewhitelist", "command", function() { UI.toggleFilter(pageWhitelist); }],
	["abp-command-toggleobjtabs", "command", UI.togglePref.bind(UI, "frameobjects")],
	["abp-command-togglecollapse", "command", UI.togglePref.bind(UI, "fastcollapse")],
	["abp-command-togglesavestats", "command", UI.toggleSaveStats.bind(UI)],
	["abp-command-togglesync", "command", UI.toggleSync.bind(UI)],
	["abp-command-toggleshowintoolbar", "command", UI.toggleToolbarIcon.bind(UI)],
	["abp-command-toggleshowinstatusbar", "command", UI.togglePref.bind(UI, "showinstatusbar")],
	["abp-command-enable", "command", UI.togglePref.bind(UI, "enabled")],
];

onShutdown.add(function()
{
	for (let window in UI.applicationWindows)
		if (UI.isBottombarOpen(window))
			UI.toggleBottombar(window);
});
