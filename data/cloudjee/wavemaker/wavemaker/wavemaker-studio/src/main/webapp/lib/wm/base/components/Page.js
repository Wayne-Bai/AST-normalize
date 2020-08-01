/*
 *  Copyright (C) 2012-2013 CloudJee, Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

dojo.provide("wm.base.components.Page");

dojo.connect(window, "onresize", function(){ dojo.publish("window-resize"); });

var wmObjectList = [];
wm.getObject = function(inType){
	if (!wmObjectList[inType])
	{
		wmObjectList[inType] = dojo.getObject(inType);
	}

	return wmObjectList[inType];
}

dojo.declare("wm.Page", wm.Component, {
        validateVisibleOnly: false,
        i18n: false,
	name: '',
        deletionDisabled: 1,
        enableMobileFolding: false,
	create: function() {
	    this.inherited(arguments);
	    if (!this.name)
		this.name = this.declaredClass.toLowerCase();

	    wm.Page.registerPage(this);

	    //dojo.addOnLoad(wm.async(dojo.hitch(this, "render")));
	    this.render();
	},
	getMainPage: function() {
	  if (!this.owner)
	  	return null;
	  var owner = this.owner;
	  while(owner.owner) {
	    owner = owner.owner;
	  }
	  if (owner instanceof wm.Application)
	    return owner;
	},
	destroy: function() {
    	this._isUnloading = true;
	    wm.Page.deregisterPage(this);
	  	var owner = this.getMainPage();
	  	if (owner)
			owner.subPageUnloaded(this);
	  	if (window.app)
			window.app.subPageUnloaded(this);
		wm.fire(this.root, "destroy");
		this.inherited(arguments);
		delete this.app;
		delete this.domNode;
		delete this.root;
		owner = null;
		delete this._designee;
	},

	init: function() {
	    this.app = window.app;
	    if (this.owner == app.pageContainer)
		window[this.name] = this;
	    this.owner[this.name] = this;
	    this.inherited(arguments);
	},
	forEachWidget: function(inFunc) {
		if (this.root)
			return wm.forEachWidget(this.root, inFunc);
		// returning pure "false" will halt the forEach, undefined is ok
	},
	render: function() {
		//console.time('renderTime ');
		// FIXME: hiding pages not owned by app when rendered
		// this really only applies to pages loaded into pageContainers
		// however, due to asynchronous rendering it's not convenient to put
		// this code elsewhere right now.
	    var notAppOwned = (this.owner != app.pageContainer);
	    var d = notAppOwned ? this.domNode || document.body : app.appRoot.domNode;
	    var ds = d.style;
		dojo.addClass(d, this.declaredClass);

		// if noAppOwned, we set left to negetive value so that user cannot see
		// the actual rendering. After this is done, we should place this div at
		// the place it was earlier(ie, previousStyleLeft).
		var previousStyleLeft = ds.left;
		if (notAppOwned)
			ds.left = "-100000px";
		wm.timePage && console.time("page.loadComponents");
	    this._loadingPage = true;
	    var startTime = new Date().getTime();
	    var widgets = this.constructor.widgets || this.widgets;
	    if (wm.isEmpty(widgets) && !this.isDesignLoaded()) {
	        console.error("Page " + this.name + " has been corrupted, and no longer has a wm.Layout nor any widgets; please create a new project or edit " + this.name + ".widgets.js by hand");

		/* Some users have asked to have their own error handlers and be able to disable our toasts */
		if (!wm.disablePageLoadingToast)
		    app.toastError(wm.getDictionaryItem("wm.Page.PAGE_ERRORS", {name: this.name}));
            }

	    if (this.owner) {
		this.locationState = (this.owner == app.pageContainer) ? app.locationState : this.owner._locationState;
	    }

	    if (wm.useDojoParser) {
		var oldOwner = wm._dojoParserCurrentOwner;
		wm._dojoParserCurrentOwner = this;
		var loaderNode = this.owner._pageLoader.htmlLoader.getHtmlNode();
		while(loaderNode.childNodes.length) {
		    if (loaderNode.firstChild)
			this.domNode.appendChild(loaderNode.firstChild);
		    else
			loaderNode.removeChild(loaderNode.firstChild);
		}
		var result = dojo.parser.parse(this.domNode);
		wm._dojoParserCurrentOwner = oldOwner;
	    } else {
		if (app.debugDialog) {
		    this.debugId = app.debugDialog.newLogEvent({eventType: "loadComponents",
								                        sourceDescription: "Page Loading",
                                                        resultDescription: this.name + " page's widgets and components initialized",
                        								method: "loadComponents",
                        								affectedId: this.getRuntimeId(),
                        								firingId: this.getRuntimeId()});
		}
		this.loadComponents(widgets, null);
		if (this.debugId) {
		    app.debugDialog.endLogEvent(this.debugId);
		    delete this.debugId;
		}
	    }
	    //this._layoutPanel.parentNode.appendChild(this._layoutPanel.domNode);

		//this.loadCssHtml();
		wm.timePage && console.timeEnd("page.loadComponents");
		var self = this;

		// reverting Michael's change here.
		//if (this.getRoot() instanceof wm.Page && this.getRoot()._loadingPage) {
		//this.postRender();
		//this.onShow();
	    //} else

		dojo.addOnLoad(dojo.hitch(this, function(){
		    this.postRender();
		    if (notAppOwned)
			ds.left = previousStyleLeft;
                    if (!this.root.isAncestorHidden())
			this.onShow();
			this.root.callOnShowParent();
		    //alert("Page rendered in " + ( new Date().getTime() - startTime) + " ms");
		    //console.timeEnd('renderTime ');
		    //console.info('postInitCalled = ' + postInitCalled);
		    //postInitCalled = 0;
		}));

		//console.profile();

	},
	postRender: function() {
		wm.timePage && console.time("root.reflow");
		wm.fire(this.root, "reflow");
		wm.timePage && console.timeEnd("root.reflow");
		/*
		if (this.owner && this.owner.reflowParent)
			this.owner.reflowParent();
		else
			dojo.publish("window-resize");
		*/
		// FIXME: automatically unload support for parts used in the studio interface
		// so as not to conflict with user parts
		wm.fire(this, "unloadSupport");
		try {
	        this._loadingPage = false;
		    if (this.root) {
			//this.root.leafFirstRenderCss();
			this.reflow();
		    }
		    if (app.debugDialog) {
    			this.debugId = app.debugDialog.newLogEvent({eventType: "start",
                                                            sourceDescription: "",
                        								    resultDescription: this.name + ".start()",
                        								    method: "start",
                        								    affectedId: this.getRuntimeId(),
                        								    firingId: this.getRuntimeId()});
		    }

		    var backState = this.owner ? this.owner._restoreBackState : undefined; // owner is PageContainer


		    if (!window["studio"] || !studio.page || this != studio.page && !this.isAncestor(studio.page)) {
			     this.start(backState, this.locationState);
		    }
		    if (this.debugId) {
    			app.debugDialog.endLogEvent(this.debugId);
    			delete this.debugId;
		    }
                    this._startCalled = true;
	        if (wm.debugPerformance) {
	            var timeToLoad = this.stopTimerWithName("LoadPage", "wm.Layout");

		    console.log("PAGE "+ timeToLoad + " ms");
		}
		    //if (!this._isDesignLoaded) {
			     this.onStart();
		    //}

                    /* Moved to Application.pageChanged
		    if (this.owner == app) {
			this.connect(document, "keydown", this, "keydown");
		    }*/
		} catch(e) {
		  console.error("Failed to initialize page " + this.name + "; " + e);
		}

	},
	start: function() {
	},
	reflow: function() {
		wm.fire(this.root, "reflow");
	},
	addComponent: function(inComponent) {
		this[inComponent.name] = inComponent;
		if (inComponent instanceof wm.Control) {
			// FIXME: hack to resolve clickability problem on IE at design-time
			// nodes must have some background or content to receive mouse events
			// on IE.
			if (this._designer && dojo.isIE <= 8) {
				var s = inComponent.domNode && dojo.getComputedStyle(inComponent.domNode);
				if (s && s.backgroundImage=="none"){
					inComponent.domNode.style.backgroundImage = "url(images/blank.gif)";
				}
			}
		/*}else{
			this.inherited(arguments);
		*/
		}
		this.inherited(arguments);
	},
	removeComponent: function(inComponent) {
		delete this[inComponent.name];
		this.inherited(arguments);
	},
	// design support
	isDesignLoaded: function() {
	    //return Boolean(this._designer);
            return this.name == "wip";
	},
	getRoot: function() {
		return this;
	},
	getId: function(inName) {
		return inName;
	},
	getRuntimeId: function(inId) {
		inId = this.name + (inId ? "." + inId : "");
		return this.owner != app.pageContainer ? this.owner.getRuntimeId(inId) : inId;
	},
	getComponent: function(inName) {
		return this.components[inName] || this[inName] || this.owner && this.owner.getComponent(inName);
	},
	_create: function(ctor, props) {
		if (ctor.prototype instanceof dijit._Widget && window.dijit){
			return new wm.DijitWrapper(dojo.mixin(props||{}, { dijitClass: ctor, publishClass: p.declaredClass }));
		}
		return this.inherited(arguments);
	},
	warnDroppedWidgets: function(inName, deviceType, inChildren, parentDropped) {
      	if (parentDropped) {
      		console.warn(inName + " was not loaded because its parent was not loaded");
      	} else {
      		console.warn(inName + " was not loaded because its deviceType property is " + deviceType + " and app is running as " + wm.device);
      	}
      	if (inChildren) {
      		wm.forEachProperty(inChildren, dojo.hitch(this, function(w, inName) {
      			if (inName != "binding") {
      				this.warnDroppedWidgets(inName, deviceType, w[3], true);
      			}
      		}));
      	}
    },
	loadComponent: function(inName, inParent, inType, inProps, inEvents, inChildren, isSecond) {
		if (!this._isDesignLoaded && inProps.deviceType && wm.device && dojo.indexOf(inProps.deviceType, wm.device) == -1) {
			if (djConfig.isDebug) this.warnDroppedWidgets(inName, inProps.deviceType.join(","), inChildren);
			return;
		}
		// Some code for debugging performance; normally skipped
		if (wm.debugPerformance) {
			if (inType == "wm.Layout") {
				if (dojo.isFF) console.groupCollapsed("LOAD COMPONENT " + inType + ": " + inName);
				else console.group("LOAD COMPONENT " + inType + ": " + inName);
			}

			this.startTimerWithName("LoadComponent", inType);
			this.startTimerWithName("LoadPage", inType);
		}

		var ctor = wm.getObject(inType);
		if (!ctor) {
			try {
				wm.getComponentStructure(inType);
				ctor = dojo.getObject(inType);
			} catch (e) {
				console.info('Error : Page.js trying to get component dynamically-------------> ' + e);
			}

			if (!ctor) {
				console.debug('Component type "' + inType + '" is not available.');
				ctor = wm.Box;
			}
		}


		// FIXME: this check really needs to go
		// yuk
		var props = {};
		isWidget = (ctor.prototype instanceof wm.Control || ctor.prototype instanceof dijit._Widget);
		if (isWidget) {
			var parentNode = (inParent ? inParent.containerNode || inParent.domNode : this.domNode);
			props = {
				owner: this,
				parent: inParent,
				domNode: parentNode ? null : document.body,
				parentNode: parentNode
			};
		}


		// props.name should overwrite getUniqueName(inName), which should overwrite inProps.
		if (!props.owner) {
			if (inParent && inParent instanceof wm.Layout) props.owner = inParent.owner;
			else if (inParent) props.owner = inParent;
			else props.owner = this;
		}
	    if (this[inName] instanceof wm.Binding) {
			c = this[inName];
	    } else {
			props = dojo.mixin({}, inProps, {
			    name: props.owner.getUniqueName(inName),
				_designer: this._designer,
				_loading: true
			}, props);
	    }
	    if (!c) {

	        /* This _isDesignLoaded case is a Special case where a Composite being designed opens a
	         * PageDialog at designtime where the PageDialog is itself not being designed but is in fact a wizard
	         */
	        if (inProps._isDesignLoaded === false) delete props._designer;

	        /* isRelativePositioned not currently supported */
			if (this.isRelativePositioned && inType == "wm.Layout") {
				props.isRelativePositioned = true;
			}

			// All custom methods should be page methods; page methods have not been evaled, so
			// can not be defined nor invoked at design time
			if (!this.isDesignLoaded()) {
				for (var p in props) {
					if (p.indexOf("custom") == 0 && dojo.isFunction(ctor.prototype[p])) {
						var owner = props.owner;
						props[p] = dojo.hitch(owner, owner[props[p]]);
					}
				}
			}



			// Calls Component.create, which calls prepare, build, init and postInit
			var c = this._create(ctor, props);


			// FIXME: this initialization should be in Component
			// to remove the distinction between 'loading' and 'creating'
			if (!inParent && isWidget) {
				c.moveable = false;
				this.root = c;
			}
	    }
		this.makeEvents(inEvents, c);
		//if (!(c instanceof wm.Layer) || !c.deferLoading)
		if (inChildren) this.loadComponents(inChildren, c);

		c.loaded(); // Component.loaded calls postInit
		var timeToLoad = this.stopTimerWithName("LoadComponent", inType);
		if (wm.debugPerformance) {
			if (inType == "wm.Layout") {
				console.log(inType + ": " + inName + " TOOK " + timeToLoad + " ms");
				console.groupEnd();
				this.printPagePerformanceData();
				console.log(inType + ": " + inName + " TOOK " + timeToLoad + " ms");
			}
		}

		return c;
	},
		printPagePerformanceData: function() {
	  var totalsByMethod = {};

			    for (var componentType in wm.Component.timingByComponent) {
			      var obj = wm.Component.timingByComponent[componentType];

			      var display = false;
			      for (var i in obj) {
				if (wm.sum(obj[i]) > 10) display = true;
			      }
			      //if (!display) continue;
			      console.group("Timing for " + componentType);
			      for (var i in obj) {
				console.log(i + ": Total: " + wm.sum(obj[i]) + ", Average: " + wm.average(obj[i]) + ", Worst: " + wm.max(obj[i]) + ", Instances: " + obj[i].length);
				if (!totalsByMethod[i]) totalsByMethod[i] = 0;
				totalsByMethod[i] += wm.sum(obj[i]);
			      }
			      console.groupEnd();
			    }
			    for (var i in totalsByMethod) {
			      console.log("TOTAL TIME IN " + i + ": " + totalsByMethod[i]);
			    }

	},

	loadComponents: function(inChildren, inParent) {
		for (var i in inChildren) {
			try
			{
			 this.loadComponent(i, inParent, inChildren[i][0], inChildren[i][1] || {}, inChildren[i][2], inChildren[i][3]);
			} catch(e) {
			  console.error("FAILED TO LOAD " + "[" + inChildren[i][1].name + "] " + i + ": ", e);
			  console.log("COMPONENT:");console.log(inChildren);
			  console.log("PARENT:");console.log(inParent);
			}
		}
	},
	onShow: function() {
	},
	onStart: function(inPage) {
	},
    keydown: function(e) {
        // if there are any modal dialogs showing, do not handle keypress, as
        // that would allow the user to interact with the page which is deliberately
        // blocked
        for (var i = 0; i < wm.dialog.showingList.length; i++) {
            if (wm.dialog.showingList[i].modal) return;
        }

        // only the application's main page should be receiving keyboard events
        if (this.owner != app.pageContainer || this != app._page) return true;

        var isInput = (e.target.tagName == "INPUT");
        var chr = app._keys[e.keyCode];
        var isSpecial = chr && chr.length > 1;

        if (e.keyCode == dojo.keys.ESCAPE) {
            this.onEscapeKey();

        } else if (e.shiftKey) {
            // we get a keyCode for the shiftKey being pressed which we should ignore; and a second keycode when a key is hit while shiftKey is held
            if (e.keyCode != dojo.keys.SHIFT && !isInput) {
                if (this.onShiftKey(chr)) dojo.stopEvent(e);
            }
        } else if (e.ctrlKey) {
            if (e.keyCode != dojo.keys.CTRL) {
                if (this.onCtrlKey(chr)) dojo.stopEvent(e);
            }
        } else if (e.keyCode == dojo.keys.ENTER && !isInput) {
            if (this.onEnterKey()) dojo.stopEvent(e);
        } else if (!isInput && e.keyCode) {
            if (isSpecial) {
                if (this.onMiscKey(chr)) dojo.stopEvent(e);
            } else {
                if (this.onLetterKey(chr)) dojo.stopEvent(e);
            }
        }

    },

        onEnterKey: function() {},
        onShiftKey: function(inCharacter) {},
        onCtrlKey: function(inCharacter) {},
        onEscapeKey: function() {},

        onLetterKey: function(inCharacter) {},
        onMiscKey: function(inCharacter) {},
	// bc only: load page css and html
	/*loadCssHtml: function() {
		var path = wm.pagesFolder + this.declaredClass + "/" + this.declaredClass;
		var hasCssLoader, hasHtmlLoader;
		for (var i in this.$) {
			if (this.$[i] instanceof wm.CssLoader)
				hasCssLoader = true;
			if (this.$[i] instanceof wm.HtmlLoader)
				hasHtmlLoader = true;
		}
		if (!hasCssLoader)
			this.loadComponent("cssLoader", null, "wm.CssLoader", {owner: this, url: path + ".css"});
		if (!hasHtmlLoader)
			this.loadComponent("htmlLoader", null, "wm.HtmlLoader", {owner: this, url: path + ".html"});
	},*/
        toString: function(inText) {
	    var t = inText || "";
	    if (this._loadingPage) {
		t += "; PAGE LOADING";
	    }
	    return this.inherited(arguments, [t]);
	},
	_end: 0
});

wm.Page.extend({
	designCreate: function() {
		this.inherited(arguments);
		this.app = this.isDesignLoaded() ? studio.application : app;
	},
	// FIXME: unload support for parts that are specifically loaded into our development environment
	// this is so that they do not conflict with user named parts with the same names.
	// the "_isWaveMakerStudio" flag is set in studio and is specifically to detect if we're in the real studio.
	unloadSupport: function() {
		if (!this.isDesignLoaded() && window.studio && window.studio._isWaveMakerStudio) {
			this.constructor._supported = false;
			this.constructor.widgets = {};
		}
	},
	generateEventName: function(inEventName) {
	    return inEventName;
	},
	_getProp: function(n) {
	    if (window["studio"] && this == studio.page && this.isEventProp(n))
		return (getEvent(n,studio.getScript())) ? n : "";
	    return this.inherited(arguments);
	},

	writeComponents: function() {
        var result = this.inherited(arguments);
        var nonvisual = [];
        var visual = [];
        dojo.forEach(result, function(item) {
            var	startIndex = item.indexOf('"')+1;
            var	endIndex = item.indexOf('"', startIndex);
            var className = item.substring(startIndex, endIndex);
            var obj = dojo.getObject(className);
            if (obj && obj.prototype instanceof wm.Control) {
                visual.push(item);
            } else {
                nonvisual.push(item);
            }
        });
        return nonvisual.concat(visual);
    },

    /* LOCALIZATION TODO:
       1. If there's a dictionary being written, the page must be set to i18n: true
       2. Must handle app level dictionary and i18n:true as well
       3. Need dictionary for terms used in scripts, and prompt to remind users when a given language they are editting does not yet have a term entered
       3. Remind user to save when changing languages
       4. Handle subcomponents
       */
    installDesignDictionary: function(inDictionary) {
    	var lang = studio.languageSelect.getDisplayValue();
    	var isDefaultLang = lang == "" || lang == "default"

    	this._editLanguage = lang

    	/* 1. Restore the default language so we're editting a fresh copy in the new language
    	 * 2. Create a new set of cache values to store the default language in
    	 */
    	var compList = wm.listComponents([this], wm.Component, false);
    	for (var i = 0; i < compList.length; i++) {
    		var c = compList[i];
    		var props = c.listWriteableProperties();
    		for (var prop in props) {
    			var value = c.getProp(prop);
    			// only do this for non-objects or for objects that aren't dojo objects nor domNodes
    			// typeof null should NOT be "object" :-(
    			if (value === null || typeof value != "object" || value.declaredClass === undefined && !wm.isNode(value)) {
    				//if (typeof value == "string" || typeof value == "boolean" || typeof value == "number") {
    				/* Restore the default values any time we change languages and clear the cache */
    				if (c["_original_i18n_" + prop] !== undefined && c["_original_i18n_" + prop] != value) {
    					c.setProp(prop, c["_original_i18n_" + prop]);
    					value = c["_original_i18n_" + prop];
    					delete c["_original_i18n_" + prop];
    				}
    				if (!isDefaultLang) {
    					c["_original_i18n_" + prop] = (typeof value == "object") ? dojo.clone(value) : value;
    				}
    			}
    		}
    	}


    	this._designDictionary = inDictionary;
    	console.log(inDictionary);
    	for (var component in inDictionary) { /* TODO: component may be a subcomponent, and we may have to parse out the "." */
    		var c = this[component];
    		if (c instanceof wm.Component) {
    			var compDesc = inDictionary[component];
    			for (var prop in compDesc) {
    				c.setProp(prop, compDesc[prop]);
    			}
    		}
    	}
    },
    getLanguageWidgets: function() {
    	var result = {};
    	var compList = wm.listComponents([this], wm.Component, false);
    	for (var i = 0; i < compList.length; i++) {
    		var c = compList[i];
    		var props = c.listWriteableProperties();
    		for (var prop in props) {
    			if (c.hasLocalizedProp(prop)) {
    				if (!result[c.name]) result[c.name] = {};
    				result[c.name][prop] = c.getProp(prop);
    			}
    		}
    	}
    	return result;
    },
    setPageProperty: function(inPropName, inValue) {
    	if (typeof inValue == "string") inValue = '"' + inValue + '"';
    	var text = studio.getScript();
    	var newtext;
    	var regex = new RegExp('"' + inPropName + '": .*,');
    	if (text.match(regex)) {
    		newtext = text.replace(regex, '"' + inPropName + '": ' + inValue + ",")
    	} else {
    		newtext = text.replace(/\{(.*?)\n/, '{$1\n\t"' + inPropName + '": ' + inValue + ',\n');
    	}
    	if (newtext != text) {
        	studio.setScript(newtext);
        }

    },
    getPageProperty: function(inPropName) {
    	if (typeof inValue == "string") inValue = '"' + inValue + '"';
    	var text = studio.getScript();
    	var regex = new RegExp('"' + inPropName + '": (.*),');
    	var matches = text.match(regex);
    	if (matches) {
    		var result = matches[1];
    		result = result.replace(/^\"/, "").replace(/\"$/, "");
    		if (typeof this[inPropName] == "boolean") {
    			result = (result == "true");
    		} else if (typeof this[inPropName] == "number") {
    			result = parseInt(result);
    		}
    		return result;
    	}
    },
    setI18n: function(inValue) {
    	this.i18n = Boolean(inValue);
    	if (this._isDesignLoaded) {
    		this.setPageProperty("i18n", this.i18n);
    	}
    },
    getI18n: function() {
    	return this.getPageProperty("i18n");
    },
    setPreferredDevice: function(inType) {
    	this.preferredDevice = inType;
    	if (this._isDesignLoaded) {
    		this.setPageProperty("preferredDevice", this.preferredDevice);
    	}
    },
    getPreferredDevice: function() {
    	return this.getPageProperty("preferredDevice");
    },
    setValidateVisibleOnly: function(inValue) {
    	this.validateVisibleOnly = Boolean(inValue);
    	if (this._isDesignLoaded) {
    		this.setPageProperty("validateVisibleOnly", this.validateVisibleOnly);
    	}
    },
    getValidateVisibleOnly: function() {
    	return this.getPageProperty("validateVisibleOnly");
    },
    set_enableMobileFolding: function(inFolding) {
    	this.enableMobileFolding = Boolean(inFolding);
    	if (this._isDesignLoaded) {
    		this.setPageProperty("enableMobileFolding", this.enableMobileFolding);
    		if (studio.currentDeviceType == "phone") {
    			studio.mobileFoldingToggleButton.setDisabled(!inFolding);
    		}
    	}
    },
    onMobileFolding: function() {},
    onMobileUnfolding: function() {}
});

wm.Object.extendSchema(wm.Page, {
    onStart: {events: ["js", "disableNoEvent"]},
    onShow: {events: ["js", "disableNoEvent"]},
    onShiftKey: {events: ["js", "disableNoEvent"]},
    onCtrlKey: {events: ["js", "disableNoEvent"]},
    onEscapeKey: {}, // allow all events
    onEnterKey: {}, // allow all events
    onLetterKey: {events: ["js", "disableNoEvent"]},
    onMiscKey: {events: ["js", "disableNoEvent"]},
    i18n: {group: "widgetName"},
    preferredDevice: {hidden:1}, // determines which device type studio should use when opening the page for editing
    validateVisibleOnly: {group: "widgetName"},
    enableMobileFolding: {group: "widgetName"}
});

// bc
wm.Part = wm.Page


dojo.mixin(wm.Page, {
    /* static variable for storing all pages; each element is an array so that there can be
     * multiple "page5" pages at the same time.  Note that if it weren't an array, then when
     * we destroy the page and remove page5 from this list, that we could no longer access ANY page5.
     */
    byName: {},
    getPage: function(inName, inIndex) {
        var page = wm.Page.byName[wm.capitalize(inName)];
        if (page && page.length) {
            if (inIndex === undefined) inIndex = page.length - 1;
            return page[inIndex];
        }
    },
    getPages: function(inName) {
        return wm.Page.byName[wm.capitalize(inName)];
    },
    registerPage: function(inPage) {
        // We'll need the page to
        if (!wm.Page.byName[inPage.declaredClass]) wm.Page.byName[inPage.declaredClass] = [];
        wm.Page.byName[inPage.declaredClass].push(inPage);
    },
    deregisterPage: function(inPage) {
        var a = wm.Page.byName[inPage.declaredClass];
        if (a) wm.Array.removeElement(a, inPage);
    }
});
wm.getPage = wm.Page.getPage;