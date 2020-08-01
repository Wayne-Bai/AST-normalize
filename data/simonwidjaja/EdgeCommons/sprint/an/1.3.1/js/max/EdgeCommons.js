// EdgeCommons for Edge Animate v1.3.1 +++ Visit edgecommons.org for documentation, updates and examples +++ Copyright (c) 2013 by Simon Widjaja +++ Distributed under the terms of the MIT license (http://www.opensource.org/licenses/mit-license.html) +++ This notice shall be included in all copies or substantial portions of the Software.

/**
 * Modulog
 * by Simon Widjaja
 **/
(function (window, $) {
    //------------------------------------
    // Constructor
    //------------------------------------
    var C = function () {
    };
    //------------------------------------
    // Public
    //------------------------------------
    C.VERSION = "0.0.2";
    C.$ = $;
    //------------------------------------
    // Private
    //------------------------------------

    //------------------------------------
    // Init
    //------------------------------------
    window.Modulog = C;
})(window, jQuery);


/**
 * ModulogLog
 * by Simon Widjaja
 */
(function (Modulog) {
    //------------------------------------
    // Constructor
    //------------------------------------
    var C = function () {
    };
    //------------------------------------
    // Public
    //------------------------------------
    C.VERSION = "0.0.2";
    C.LEVEL_NONE = 0;
    C.LEVEL_ERROR = 1;
    C.LEVEL_WARN = 2;
    C.LEVEL_INFO = 3;
    C.LEVEL_DEBUG = 4;
    C.level = C.LEVEL_DEBUG; // Default Log level
    //------------------------------------
    // Private
    //------------------------------------
    // jQuery
    var $ = Modulog.$;

    var additionalLogTarget = null;
    //------------------------------------
    // Methods
    //------------------------------------
    C.addLogTarget = function (loggerCallback) {
        if (typeof loggerCallback === "function") {
            additionalLogTarget = loggerCallback;
        }
    };
    C.debug = function (msg, group, object) {
        if (ModulogLog.level >= ModulogLog.LEVEL_DEBUG) {
            var out = "[ DEBUG " + ((group) ? "| " + group + " " : "") + "] " + msg;
            if ((typeof console != "undefined") && (typeof console.debug != "undefined")) {
                (object) ? console.debug(out, object) : console.debug(out);
            } 
            else if ((typeof console != "undefined") && (typeof console.info != "undefined")) {
                (object) ? console.info(out, object) : console.info(out);                
            }
            ModulogLog.__delegate(out, object);
        }
    };
    C.info = function (msg, group, object) {
        if (ModulogLog.level >= ModulogLog.LEVEL_INFO) {
            var out = "[ INFO " + ((group) ? "| " + group + " " : "") + "] " + msg;
            if ((typeof console != "undefined") && (typeof console.info != "undefined")) {
                (object) ? console.info(out, object) : console.info(out);
            }
            ModulogLog.__delegate(out, object);
        }
    };
    C.warn = function (msg, group, object) {
        if (ModulogLog.level >= ModulogLog.LEVEL_WARN) {
            var out = "[ WARN " + ((group) ? "| " + group + " " : "") + "] " + msg;
            if ((typeof console != "undefined") && (typeof console.warn != "undefined")) {
                (object) ? console.warn(out, object) : console.warn(out);
            }
            ModulogLog.__delegate(out, object);
        }
    };
    C.error = function (msg, group, object) {
        if (ModulogLog.level >= ModulogLog.LEVEL_ERROR) {
            var out = "[ ERROR " + ((group) ? "| " + group + " " : "") + "] " + msg;
            if ((typeof console != "undefined") && (typeof console.error != "undefined")) {
                (object) ? console.error(out, object) : console.error(out);
            }
            ModulogLog.__delegate(out, object);
        }
    };
    C.__delegate = function (msg, object) {
        if (additionalLogTarget) {
            (object) ? additionalLogTarget(msg + " : " + object.toString()) : additionalLogTarget(msg);
        }
    };
    //------------------------------------
    // Init
    //------------------------------------
    window.Log = window.MLog = window.ModulogLog = C;
})(window.Modulog);


/**
 * ModulogConfig
 * by Simon Widjaja
 * Usage:
 * - Config.init(configObject);
 * - Config.init(url, callback);
 * - Config.set("topic.subtopic.value", value);
 * - Config.get("topic.subtopic.value");
 */
(function (Modulog) {
    //------------------------------------
    // Constructor
    //------------------------------------
    var C = function () {
    };
    //------------------------------------
    // Public
    //------------------------------------
    C.VERSION = "0.0.1";
    //------------------------------------
    // Private
    //------------------------------------
    // jQuery
    var $ = Modulog.$;
    // Config
    var config = null;
    // Logger
    var Log = ModulogLog;
    var LOG_GROUP = "Modulog | ModulogConfig";

    //------------------------------------
    // Methods
    //------------------------------------
    C.get = function (path) {
        var el = path.split(".");
        var value = config;
        for (var i = 0; i < el.length; i++) {
            var p = el[i];
            if (!value.hasOwnProperty(p)) {
                ModulogLog.warn("Config value not found: " + path, "CONFIG");
            }
            value = value[p];
        }
        return value;
    };
    C.set = function (path, value) {
        var el = path.split(".");
        var target = config;
        for (var i = 0; i < el.length - 1; i++) {
            target = target[el[i]];
        }
        target[el.pop()] = value;
    };
    C.init = function (param, readyCallback) {
        // URL
        if ((typeof(param) === "string") && (jQuery)) {          
            $.getJSON(param, function (data) {
                config = data;
                if (typeof(readyCallback) === "function") {
                    readyCallback();
                }
            });
        }
        // Config Object
        else if (typeof(param) === "object") {
            config = param;
        }
        // Error
        else {
            Log.error("Could not init config. init() function expects config object or url to config.js. " +
                "Latter needs jQuery to be initialized before.", LOG_GROUP);
        }
    };
    //------------------------------------
    // Init
    //------------------------------------
    window.Config = window.MConfig = window.ModulogConfig = C;
})(window.Modulog);


;/*
 * EdgeCommons
 * Dirty little Helpers for Adobe Edge Animate
 * by Simon Widjaja
 *
 * Additional Contributors:
 * Timm Jansen, Johannes Boyne
 *
 * Copyright (c) 2013 Simon Widjaja
 *
 * --------------------------------------------------------------------------------------------------------------------------------------------------
 * Released under MIT license
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR
 * OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * --------------------------------------------------------------------------------------------------------------------------------------------------
 * Additional 3rd party libraries are used. For related credits and license models take a closer look at the affected library.
 * --------------------------------------------------------------------------------------------------------------------------------------------------
 * EdgeCommons uses:
 * - Adobe Edge API
 * - Modulog
 * - YepNope
 * - SoundJS (CreateJS)
 * --------------------------------------------------------------------------------------------------------------------------------------------------
 * Features:
 * #Core
 * - Advanced Logging and Config with Modulog
 * - Loading external Scripts and Style Sheets with YepNope
 * - Injecting Data
 * #Sound
 * - Load and play sounds with SoundJS (CreateJS)
 * #Preload
 * - PreloadJS (uses by SoundJS) (CreateJS)
 */

/**
TODO: DESCRIPTION FOR MASTER

@module EdgeCommons
**/
(function (window, $) {
    //------------------------------------
    // Constructor
    //------------------------------------
    var EdgeCommons = function () {
    };

    //------------------------------------
    // Public
    //------------------------------------
    EdgeCommons.VERSION = "1.3.1";
    EdgeCommons.$ = $;

    //------------------------------------
    // Private
    //------------------------------------
    var LOG_GROUP = "EdgeCommons";

    //------------------------------------
    // Methods
    //------------------------------------

    //------------------------------------
    // Init
    //------------------------------------
    window.EC = window.EdgeCommons = EdgeCommons;
    //Log.debug("v" + VERSION, LOG_GROUP);

})(window, jQuery);
;/**
 * EdgeCommons
 * Dirty little Helpers for Adobe Edge Animate
 * by Simon Widjaja and friends
 *
 * Copyright (c) 2013 Simon Widjaja
 *
 * --------------------------------------------------------------------------------------------------------------------------------------------------
 * Released under MIT license
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR
 * OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * --------------------------------------------------------------------------------------------------------------------------------------------------
 * Additional 3rd party libraries are used. For related credits and license models take a closer look at the affected library.
 * --------------------------------------------------------------------------------------------------------------------------------------------------
 */



/*
 * Module: Core
 */


/**
The core module of EdgeCommons 
Version 1.1.0
@module Core
**/
(function (EC) {
    //------------------------------------
    // Constructor
    //------------------------------------
    var C = function () {
    };

    //------------------------------------
    // Public
    //------------------------------------
    C.VERSION = "1.1.0";

    //------------------------------------
    // Private
    //------------------------------------
    // jQuery
    var $ = EC.$;
    // Logger
    var Log = ModulogLog;
    var LOG_GROUP = "EdgeCommons | Core";
    // Adaptive Layouts
    var _adaptiveLayouts = null;
    var _currentAdaptiveLayout = null;
    var _currentAdaptiveSymbol = null;
    var _adaptiveLayoutCallback = null;


    //------------------------------------
    // Methods
    //------------------------------------
    
    /**
     * Get Symbol Name
     * (if name should be used in sym.getSymbol(NAME) the preceding "#" is necessary)
     * @param sym Reference to a Edge Symbol
     * @param unique (Optional) Return full/unique name (e.g. Stage_ResponsiveElement)
     * @return name of symbol (String) 
     */    
    EC.getSymbolName = function(sym, unique) {
        var name = sym.getVariable("symbolSelector"); // still with #
        if (!unique) {
          var paraentSymbol = sym.getParentSymbol();
          if (paraentSymbol) {
              name = name.replace(paraentSymbol.getVariable("symbolSelector")+"_", "");
          }
        }
        name = name.replace("#", "");
        return name;
    };    
    
    /**
     * Data Injection
     * @param sym Reference to a Edge Symbol (does not matter which one)
     * @param scriptClassSelector Class of the container script-Tag (default: data)
     */
    EC.getInjectedData = function (sym, scriptClassSelector) {
        try {
            // Default scriptClass
            scriptClassSelector = scriptClassSelector || "data";
            // Argument sym is not optional
            if (!sym || !sym.getParentSymbol) {
                Log.error("getInjectedData(): First argument 'sys' is not optional", LOG_GROUP);
            }
            // Alternative
            // var stageElement = sym.getSymbolElement().closest("."+sym.getComposition().compId);
            // Workaround: Get Stage (using getComposition() always results in the first instance of identical instances)
            while (sym.getParentSymbol()) {
                sym = sym.getParentSymbol();
            }
            // Extract injected data
            var injectedDataRaw = sym.getSymbolElement().find("." + scriptClassSelector).html();
            var injectedData = $.parseJSON(injectedDataRaw);
            return injectedData;
        } catch (error) {
            Log.error("Reading injected data failed (scriptClassSelector=" + scriptClassSelector + ")", LOG_GROUP, error);
        }
    };

    /**
     * Adaptive
     * TODO: add flag: compare to width of window/document instead of stage (necessary if stage is fixed and is centered)
     */
    EC.setAdaptiveLayouts = function(adaptiveLayouts, sym, adaptiveContainer, callback) {
        if (!adaptiveLayouts || !adaptiveLayouts.length) {
            Log.error( "Error in setAdaptiveLayouts(). Argument 'layouts' is not optional and has to be an array.", LOG_GROUP );
            return;
        }
        _adaptiveLayouts = adaptiveLayouts;
        
        // backwards compatibilty
        // (adaptive layouts array will be stored, but resize handler will not be added 
        // automatically since in older versions (e.g. 0.4.0 @ Adobe TV) applyAdaptiveLayout() will be called manually
        if (!sym) {
            return;
        }
        
        // Register optional callback
        if (typeof(callback) == "function") {
            _adaptiveLayoutCallback = callback;
        }
        
        // Register event handler for resize, so the right adaptive layout gets displayed
        // whenever the windows is being resized
        $( window ).resize( function(e) {
            EC.applyAdaptiveLayout( sym, adaptiveContainer );
        });
        // Execute initially
        EC.applyAdaptiveLayout( sym, adaptiveContainer );
    };    
    EC.applyAdaptiveLayout = function (sym, adaptiveContainer) {
        try {
            sym.setVariable("doResizing", function(){
                var stage = sym.getComposition().getStage();
                var width = stage.getSymbolElement().width();

                // responsive container
                var container = sym.$( adaptiveContainer );

                var buffer = 0; // before 1.0.3 we had a tolerance of 20px for some special cases
                var calcLayout = null;
                $.each( _adaptiveLayouts, function(index, layout) {
                    if(width >= layout - buffer){
                        calcLayout = layout;
                    }
                });

                if (_currentAdaptiveLayout != calcLayout ) {
                    //Log.debug( "Switching to: layout"+calcLayout, LOG_GROUP );
                    // Clear old layout
                    _currentAdaptiveSymbol && _currentAdaptiveSymbol.deleteSymbol();
                    //console.log("_currentAdaptiveSymbol: ", _currentAdaptiveSymbol);
                    container.html("");
                    // Create new layout
                    var layoutSym = sym.createChildSymbol("layout"+calcLayout, adaptiveContainer);
                    // Remember layout
                    _currentAdaptiveLayout = calcLayout;
                    _currentAdaptiveSymbol = layoutSym;
                    // Optional callback
                    if ( typeof(_adaptiveLayoutCallback) == "function" ) {
                        _adaptiveLayoutCallback( calcLayout, layoutSym );
                    }
                }
                // Display mode (debug only)
                sym.$("currentLayout").html(sym.getVariable("layout"));
                //sym.stop(mode);

            });

            // Execute on startup
            var doResizing = sym.getVariable("doResizing");
            doResizing();

        }
        catch(error) {
            console.error(error);
        }
    };
    
    /**
     * DEPRICATED
     * Center Stage
     * TODO: additional param for horizontal/vertical
     */
    EC.centerStage = function(sym) {
        if (!sym) {
            Log.error( "Error in centerStage(). Argument 'sym' is not optional.", LOG_GROUP );
            return;
        }
        sym.getComposition().getStage().getSymbolElement().css("margin", "0px auto");
    }
        
    /**
     * Composition Loader
     * EXAMPLE:
     * var targetContainer = sym.getSymbol("targetContainer");
     * EC.loadComposition("sub2.html", targetContainer)
	 *   .done( function(comp) {
     *      comp.getStage().$("mytext").html("hello number 2");
     *      comp.getStage().$('targetContainer').append("<hr/>HUHU  222<hr/>");
	 *   });
     */
    EC.loadComposition = function(src, symbolOrElement) {
        // Check arguments 
        if (!src || !symbolOrElement) {
            Log.error( "Error in loadComposition(). Arguments 'src' and 'sym' are not optional.", LOG_GROUP );
            return;
        }
        try {
            // Symbol or Element
            var el;
            if (symbolOrElement instanceof AdobeEdge.Symbol) {
                el = symbolOrElement.getSymbolElement();
            }
            else {
                el = symbolOrElement;
            }
            // Inject IFrame
            var uniqueId = "ec_"+Math.random().toString(36).substring(7);
            //el.html('<iframe id="'+uniqueId+'" src="'+src+'" style="overflow: hidden; width: 100%; height: 100%; margin: auto; border: 0 none; background-color: rgba(255,255,255,0)"></iframe>');
            // Prevent flickering (http://css-tricks.com/prevent-white-flash-iframe/)
            el.html('<iframe id="'+uniqueId+'" src="'+src+'" style="visibility:hidden; overflow: hidden; width: 100%; height: 100%; margin: auto; border: 0 none; background-color: rgba(255,255,255,0)" onload="this.style.visibility=\'visible\';"></iframe>');
            // Create promise
            var promise = new jQuery.Deferred();
            
            // Wait for IFrame to be loaded
            var iframe = jQuery("#"+uniqueId);
            //EC.debug("iframe", LOG_GROUP, iframe);
            var innerWindow = iframe[0].contentWindow;
            //EC.debug("innerWindow", LOG_GROUP, innerWindow);
            iframe.load( function() {
                //EC.debug("iframe load done");
                // Wait for inner composition to be bootstrapped
                innerWindow.AdobeEdge.bootstrapCallback(function (compId) {
                    //EC.debug("Inner composition was bootstrapped: ", LOG_GROUP, compId);
                    // alpha: ignore compId (just one inner comp supported so far)
                    var innerComp = innerWindow.AdobeEdge.getComposition(compId);
                    //EC.debug("innerComp", LOG_GROUP, innerComp);
                    //innerComp.getStage().$('targetContainer').html("<hr/>TEST<hr/>");
                    promise.resolve(innerComp, uniqueId, innerWindow.AdobeEdge);
                });
            });
        } 
        catch (err) {
            EC.error("Error in loadComposition: ", LOG_GROUP, err.toString());
        }
        return promise;
    }  
    
    /**
     * makeStaticButton
     * EXAMPLE:
     * TODO
     * Touch enabled
     */
    EC.makeStaticButton = function(sym, label, icon, clickHandler, data) {
        // Search for optional element "hotspot"
        var hotspot = sym.$("hotspot");
		var hs$ = (hotspot[0]) ? hotspot : sym.getSymbolElement();
		label && sym.$("label").html(label);
        icon && sym.$("icon").css("background-image", "url("+icon+")");
        data && sym.setVariable("data", data);
        // Call when ready
        if (typeof(sym.getVariable("ready")) === "function") {
          sym.getVariable("ready")(data);  
        }
		hs$.css("cursor", "pointer");
        if (!EC.isMobile()) {
            hs$.on("mouseenter", function(e) {
                sym.stop("over");
            });
            hs$.on("mouseleave", function(e) {
                sym.stop("normal");
            });
            hs$.on("mousedown", function(e) {
                sym.stop("down");
            });
            hs$.on("mouseup", function(e) {
                sym.stop("over");
            });
        }
		hs$.on(EC.CLICK_OR_TOUCH, function(e) {
			(typeof(clickHandler) === "function") && clickHandler(sym, data);
		});
	}    

    /**
     * makeAnimatedButton
     * EXAMPLE:
     * TODO
     * Touch enabled
     */
    EC.makeAnimatedButton = function(sym, label, icon, clickHandler, data) {
        // Search for optional element "hotspot"
        var hotspot = sym.$("hotspot");        
		var hs$ = (hotspot[0]) ? hotspot : sym.getSymbolElement();
		label && sym.$("label").html(label);
        icon && sym.$("icon").css("background-image", "url("+icon+")");
        data && sym.setVariable("data", data);
        // Call when ready
        if (typeof(sym.getVariable("ready")) === "function") {
          sym.getVariable("ready")(data);  
        }      
		hs$.css("cursor", "pointer");
        if (!EC.isMobile()) {
            hs$.on("mouseenter", function(e) {
                sym.play();
            });
            hs$.on("mouseleave", function(e) {
                sym.playReverse();
            });
            hs$.on("click", function(e) {
                (typeof(clickHandler) === "function") && clickHandler(sym, data);
            });            
        }
        else {
            // Initially set state to inactive
            sym.setVariable("animatedButtonState", "inactive");
            hs$.on("touchstart", function(e) {
                var isActive = (sym.getVariable("animatedButtonState") !== "inactive" );
                if (isActive) {
                    (typeof(clickHandler) === "function") && clickHandler(sym, data);
                    sym.setVariable("animatedButtonState", "inactive");
                    sym.playReverse();
                }
                else {
                    sym.play();
                    sym.setVariable("animatedButtonState", "active");
                    setTimeout(function() {
                        if (sym.getPosition() > 0) {
                            sym.playReverse();                                                    
                        }
                        sym.setVariable("animatedButtonState", "inactive");
                    }, 2000);
                }
            });            
        }
	}
    
    /**
     * isMobile
     * @return true|false 
     */    
    EC.isMobile = function() {
        return navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/iPhone|iPad|iPod/i) || navigator.userAgent.match(/Opera Mini/i) || navigator.userAgent.match(/IEMobile/i);
    }
    
    /**
     * CLICK_OR_TOUCH (Pseudo Constant)
     * Can be used in click handler to be optimized on touch devices
     * Example:
     * sym.$("myButton").on(EC.CLICK_OR_TOUCH, function() {} );
     * @return click or touchstart
     */        
    EC.CLICK_OR_TOUCH = (EC.isMobile()) ? "touchstart" : "click";
    
    
    /**
     * Read get parameter
     * @param key Name of GET key     
     * @return value of GET key 
     */ 
    EC.readGetParam = function(key){
        var results = new RegExp('[\\?&]' + key + '=([^&#]*)').exec(window.location.href);
        return (results) ? (decodeURIComponent(results[1] || 0)) : null;
    }    
    
    /**
     * Read hash parameter (e.g. for Deep Linking)   
     * Consider implementing "jQuery address" for more advanced power (http://www.asual.com/jquery/address/)
     * Consider concept like http://www.asual.com/jquery/address/samples/crawling/#!/?page=/getting-started
     * // Change hash proprammatically
     * window.location.hash = "simonsays";
     * // Listen for hash change event
     * $(window).on("hashchange", function() {
	 *   console.debug("HASH", window.location.hash);
     * });
     * @return hash or null
     */ 
    EC.readHashFromURL = function(){
        var results = new RegExp('#([^ |^?|^&|^=]*)').exec(window.location.href);
        return (results) ? (decodeURIComponent(results[0])) : null;
    }
    
    //------------------------------------
    // Init
    //------------------------------------
    EC.Core = C;

    // Expose Logging
    EC.Log = Log;
    EC.debug = Log.debug;
    EC.info = Log.info;
    EC.warn = Log.warn;
    EC.error = Log.error;

    // Expose Configuration
    EC.Config = MConfig;

    //Log.debug("v" + C.VERSION, LOG_GROUP);


})(EdgeCommons);;/**
 * EdgeCommons
 * Dirty little Helpers for Adobe Edge
 * by Simon Widjaja
 *
 * Copyright (c) 2013 Simon Widjaja
 *
 * --------------------------------------------------------------------------------------------------------------------------------------------------
 * Released under MIT license
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR
 * OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * --------------------------------------------------------------------------------------------------------------------------------------------------
 * Additional 3rd party libraries are used. For related credits and license models take a closer look at the affected library.
 * --------------------------------------------------------------------------------------------------------------------------------------------------
 */

/**
 * Module: Parallax
 *
 * Horizontal Parallax by Jacques Letesson
 */

/**
Parallax Scrolling for Edge Animate
@module EdgeCommons
@submodule Parallax
@main EdgeCommons
@class Parallax
**/
(function (EC) {
    //------------------------------------
    // Constructor
    //------------------------------------
    var C = function () {
    };

    //------------------------------------
    // Public
    //------------------------------------
    C.VERSION = "1.1.0";
    C.compositions = {};
    
    //------------------------------------
    // Private
    //------------------------------------
    // jQuery
    var $ = EC.$;
    // Logger
    var Log = ModulogLog;
    var LOG_GROUP = "EdgeCommons | Parallax";

    //------------------------------------
    // Methods
    //------------------------------------
    /**
     * Add composition to parallax watcher
     */
    C.addComposition = function(compId) {
      // Cancel if stage is not rendered yet and no height is available (creationComplete instead compositionReady)
      if (!AdobeEdge.getComposition(compId).getStage().getSymbolElement().height()) {
        Log.error("Height of stage is not available yet. Make sure you are using compositionReady instead of creationComplete", LOG_GROUP);
      }
      
      // calculate static composition values
      this.compositions[compId] = {};
      var stage = AdobeEdge.getComposition(compId).getStage();
      this.compositions[compId].stage = stage;
      var stageElement = AdobeEdge.getComposition(compId).getStage().getSymbolElement();
      this.compositions[compId].stageElement = stageElement;
      var stageHeight = stageElement.height();
      var stageWidth = stageElement.width();
      this.compositions[compId].stageHeight = stageHeight;
      this.compositions[compId].stageWidth = stageWidth;
      var stageTop = stageElement.position().top;
      this.compositions[compId].stageTop = stageTop;
      this.compositions[compId].stageMiddle = Math.floor( (stageTop + stageHeight/2) );        
      this.compositions[compId].duration = stage.getDuration();

      // Stop timeline (override autoplay)
      stage.stop(0);
    }
        
    /**
    Setup Parallax Scrolling for a specific composition

        // MUST be in compositionReady (NOT IN creationComplete)
        EC.Parallax.setup( sym );

    @method setup
    @param sym {Symbol} A Symbol within the affected composition  
    @param scrollType {String} A string to define the type of scroll : vertical (default) or horizontal
    **/           
    C.setup = function(sym, scrollType) {
        // Check arguments 
        if (!sym) {
            Log.error( "Error in setup(). Argument 'sym' is not optional.", LOG_GROUP );
            return;
        }
        if(scrollType===undefined){
			scrollType = "vertical";
		}
      
        // Add composition to list (currently only one composition is supported)
        this.addComposition( sym.getComposition().compId );
        
        // Add listener for scroll event on document
        //var throttleIndex = throttleIndexInitial = 2;
        $( document ).scroll( function() {
            // Throttle (disabled)
            //if (throttleIndex != 0) {
            //    throttleIndex--;
            //    return;
            //}
            //throttleIndex = throttleIndexInitial;
			if (scrollType == "vertical") {
				var scrollPos = $(document).scrollTop();
				scrollVertical();
			} else if (scrollType == "horizontal") {
				var scrollPos = $(document).scrollLeft();
				scrollHorizontal()
			}
            
    
            // Update all compositions
            function scrollVertical(){
	        	$.each( EC.Parallax.compositions, function(compId, c) {
	                // Calculate new playhead position
	                var percentage = scrollPos / ( c.stageHeight - $(window).height() );
	                var playheadPos = Math.floor( percentage * c.duration );
	                c.stage.stop( playheadPos );
				});  
            }
            
            function scrollHorizontal(){
	        	$.each( EC.Parallax.compositions, function(compId, c) {
	                // Calculate new playhead position
	                var percentage = scrollPos / ( c.stageWidth - $(window).width() );
	                var playheadPos = Math.floor( percentage * c.duration );
	                c.stage.stop( playheadPos );
				});   
            }
        });
    }

    //------------------------------------
    // Init
    //------------------------------------
    EC.Parallax = C;
    //Log.debug("v" + C.VERSION, LOG_GROUP);

})(EdgeCommons);;/**
 * EdgeCommons
 * Dirty little Helpers for Adobe Edge
 * by Simon Widjaja
 *
 * Copyright (c) 2013 Simon Widjaja
 *
 * --------------------------------------------------------------------------------------------------------------------------------------------------
 * Released under MIT license
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR
 * OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * --------------------------------------------------------------------------------------------------------------------------------------------------
 * Additional 3rd party libraries are used. For related credits and license models take a closer look at the affected library.
 * --------------------------------------------------------------------------------------------------------------------------------------------------
 */

/**
 * Module: Sound
 * Bridge to the great framework by Grant Skinner "CreateJS"
 */

/**
TODO: DESCRIPTION FOR SOUND

@module EdgeCommons
@submodule Sound
@main EdgeCommons
**/
(function (EC) {
    //------------------------------------
    // Constructor
    //------------------------------------
    var C = function () {
    };

    //------------------------------------
    // Public
    //------------------------------------
    C.VERSION = "1.0.1";
    C.soundManifest = null;

    //------------------------------------
    // Private
    //------------------------------------
    // jQuery
    var $ = EC.$;
    // Logger
    var Log = ModulogLog;
    var LOG_GROUP = "EdgeCommons | Sound";
    var queue = null;

    //------------------------------------
    // Methods
    //------------------------------------
    /**
    @method getQueue
    Get reference to loading queue. Can be used to register events:
        queue.addEventListener("complete", loadComplete);
        queue.addEventListener("fileload", fileComplete);
        queue.addEventListener("error",handleFileError);
        queue.addEventListener("progress",handleProgress);
    */
    C.getQueue = function() {
        return queue;
    }
    
    /**
    Setup SoundJS and load audio files
    @method setup
    @param manifest {Array} The manifest with all media information
        <pre>
            var manifest = [
                {src: assetsPath + "bassdrum.mp3|" + assetsPath + "bassdrum.ogg", id: "bassdrum"},
                {src: assetsPath + "snaredrum.mp3|" + assetsPath + "snaredrum.ogg", id: 'snaredrum'},
                {src: assetsPath + "the_womb_demons_out.mp3|" + assetsPath + "the_womb_demons_out.ogg", id: 'the_womb_demons_out'}
            ]
        </pre>
    @param [loadComplete] {Object} Callback for complete (loading) event
    @param [handleFileError] {Object} Callback for loading error event
    */
    C.setup = function (manifest, loadComplete, handleFileError) {
        try {
            // Argument manifest is not optional
            if (!manifest) {
                Log.error("Sound.setup() failed: manifest argument is not optional", LOG_GROUP);
                return;
            }
            // Instantiate a queue.
			queue = new createjs.LoadQueue();
			queue.installPlugin(createjs.Sound);
            if ( loadComplete ) {
                queue.addEventListener("complete", loadComplete);
            }
			if (handleFileError) {
                queue.addEventListener("error", handleFileError);
            }
			//queue.addEventListener("fileload", fileComplete);
			//queue.addEventListener("progress",handleProgress);
			queue.loadManifest(manifest);	
        } catch (error) {
            Log.error("Error in setup(): " + error.toString(), LOG_GROUP, error);
        }
    };

    /**
     * Play sound
     * @param soundId
     */
    C.play = function (soundId, completeCallback) {
        var soundInstance = createjs.Sound.play(soundId, createjs.Sound.INTERRUPT_NONE, 0, 0, 0, 1, 0);
        return soundInstance;
    };

    /**
     * Stop sound
     * @param soundId (optional) if omitted all sounds stop
     */
    C.stop = function (soundId) {
        createjs.Sound.stop(soundId);
    };

    //------------------------------------
    // Init
    //------------------------------------
    EC.Sound = C;
    //Log.debug("v" + C.VERSION, LOG_GROUP);

})(EdgeCommons);




//---------------------------------------------------------------------
// Include PreloadJS and SoundJS (by gskinner.com) for offline usage
//---------------------------------------------------------------------


/**
* PreloadJS
* Visit http://createjs.com/ for documentation, updates and examples.
*
* Copyright (c) 2011 gskinner.com, inc.
* 
* Distributed under the terms of the MIT license.
* http://www.opensource.org/licenses/mit-license.html
*
* This notice shall be included in all copies or substantial portions of the Software.
**/
(function(){var c=this.createjs=this.createjs||{},c=c.PreloadJS=c.PreloadJS||{};c.version="0.3.0";c.buildDate="Tue, 12 Feb 2013 21:12:02 GMT"})();this.createjs=this.createjs||{};
(function(){var c=function(){this.initialize()},a=c.prototype;c.initialize=function(d){d.addEventListener=a.addEventListener;d.removeEventListener=a.removeEventListener;d.removeAllEventListeners=a.removeAllEventListeners;d.hasEventListener=a.hasEventListener;d.dispatchEvent=a.dispatchEvent};a._listeners=null;a.initialize=function(){};a.addEventListener=function(a,b){var g=this._listeners;g?this.removeEventListener(a,b):g=this._listeners={};var f=g[a];f||(f=g[a]=[]);f.push(b);return b};a.removeEventListener=
function(a,b){var g=this._listeners;if(g){var f=g[a];if(f)for(var e=0,c=f.length;e<c;e++)if(f[e]==b){c==1?delete g[a]:f.splice(e,1);break}}};a.removeAllEventListeners=function(a){a?this._listeners&&delete this._listeners[a]:this._listeners=null};a.dispatchEvent=function(a,b){var g=false,f=this._listeners;if(a&&f){typeof a=="string"&&(a={type:a});a.target=b||this;f=f[a.type];if(!f)return g;for(var f=f.slice(),e=0,c=f.length;e<c;e++){var h=f[e];h instanceof Function?g=g||h.apply(null,[a]):h.handleEvent&&
(g=g||h.handleEvent(a))}}return!!g};a.hasEventListener=function(a){var b=this._listeners;return!(!b||!b[a])};a.toString=function(){return"[EventDispatcher]"};createjs.EventDispatcher=c})();this.createjs=this.createjs||{};
(function(){var c=function(){this.init()};c.prototype={};var a=c.prototype;c.FILE_PATTERN=/(\w+:\/{2})?((?:\w+\.){2}\w+)?(\/?[\S]+\/|\/)?([\w\-%\.]+)(?:\.)(\w+)?(\?\S+)?/i;a.loaded=false;a.canceled=false;a.progress=0;a._item=null;a.onProgress=null;a.onLoadStart=null;a.onComplete=null;a.onError=null;a.addEventListener=null;a.removeEventListener=null;a.removeAllEventListeners=null;a.dispatchEvent=null;a.hasEventListener=null;a._listeners=null;createjs.EventDispatcher.initialize(a);a.getItem=function(){return this._item};
a.init=function(){};a.load=function(){};a.close=function(){};a._sendLoadStart=function(){this._isCanceled()||(this.onLoadStart&&this.onLoadStart({target:this}),this.dispatchEvent("loadStart"))};a._sendProgress=function(a){if(!this._isCanceled()){var b=null;if(typeof a=="number")this.progress=a,b={loaded:this.progress,total:1};else if(b=a,this.progress=a.loaded/a.total,isNaN(this.progress)||this.progress==Infinity)this.progress=0;b.target=this;b.type="progress";this.onProgress&&this.onProgress(b);
this.dispatchEvent(b)}};a._sendComplete=function(){this._isCanceled()||(this.onComplete&&this.onComplete({target:this}),this.dispatchEvent("complete"))};a._sendError=function(a){if(!this._isCanceled())a==null&&(a={}),a.target=this,a.type="error",this.onError&&this.onError(a),this.dispatchEvent(a)};a._isCanceled=function(){return window.createjs==null||this.canceled?true:false};a._parseURI=function(a){return!a?null:a.match(c.FILE_PATTERN)};a.toString=function(){return"[PreloadJS AbstractLoader]"};
createjs.AbstractLoader=c})();this.createjs=this.createjs||{};
(function(){var c=function(b){this.init(b)},a=c.prototype=new createjs.AbstractLoader;c.LOAD_TIMEOUT=8E3;c.BINARY="binary";c.CSS="css";c.IMAGE="image";c.JAVASCRIPT="javascript";c.JSON="json";c.SOUND="sound";c.SVG="svg";c.TEXT="text";c.XML="xml";a.useXHR=true;a.stopOnError=false;a.maintainScriptOrder=true;a.next=null;a.onFileLoad=null;a.onFileProgress=null;a._typeCallbacks=null;a._extensionCallbacks=null;a._loadStartWasDispatched=false;a._maxConnections=1;a._currentlyLoadingScript=null;a._currentLoads=
null;a._loadQueue=null;a._loadQueueBackup=null;a._loadItemsById=null;a._loadItemsBySrc=null;a._loadedResults=null;a._loadedRawResults=null;a._numItems=0;a._numItemsLoaded=0;a._scriptOrder=null;a._loadedScripts=null;a.init=function(b){this._numItems=this._numItemsLoaded=0;this._loadStartWasDispatched=this._paused=false;this._currentLoads=[];this._loadQueue=[];this._loadQueueBackup=[];this._scriptOrder=[];this._loadedScripts=[];this._loadItemsById={};this._loadItemsBySrc={};this._loadedResults={};this._loadedRawResults=
{};this._typeCallbacks={};this._extensionCallbacks={};this.setUseXHR(b)};a.setUseXHR=function(b){return this.useXHR=b!=false&&window.XMLHttpRequest!=null};a.removeAll=function(){this.remove()};a.remove=function(b){var a=null;b&&!(b instanceof Array)?a=[b]:b&&(a=b);b=false;if(a){for(;a.length;){for(var d=a.pop(),e=this.getResult(d),c=this._loadQueue.length-1;c>=0;c--)if(h=this._loadQueue[c].getItem(),h.id==d||h.src==d){this._loadQueue.splice(c,1)[0].cancel();break}for(c=this._loadQueueBackup.length-
1;c>=0;c--)if(h=this._loadQueueBackup[c].getItem(),h.id==d||h.src==d){this._loadQueueBackup.splice(c,1)[0].cancel();break}if(e)delete this._loadItemsById[e.id],delete this._loadItemsBySrc[e.src],this._disposeItem(e);else for(var c=this._currentLoads.length-1;c>=0;c--){var h=this._currentLoads[c].getItem();if(h.id==d||h.src==d){this._currentLoads.splice(c,1)[0].cancel();b=true;break}}}b&&this._loadNext()}else{this.close();for(d in this._loadItemsById)this._disposeItem(this._loadItemsById[d]);this.initialize(this.useXHR)}};
a.reset=function(){this.close();for(var b in this._loadItemsById)this._disposeItem(this._loadItemsById[b]);b=[];for(i=0,l=this._loadQueueBackup.length;i<l;i++)b.push(this._loadQueueBackup[i].getItem());this.loadManifest(b,false)};c.isBinary=function(b){switch(b){case createjs.LoadQueue.IMAGE:case createjs.LoadQueue.BINARY:return true;default:return false}};a.installPlugin=function(b){if(!(b==null||b.getPreloadHandlers==null)){b=b.getPreloadHandlers();if(b.types!=null)for(var a=0,d=b.types.length;a<
d;a++)this._typeCallbacks[b.types[a]]=b.callback;if(b.extensions!=null)for(a=0,d=b.extensions.length;a<d;a++)this._extensionCallbacks[b.extensions[a]]=b.callback}};a.setMaxConnections=function(b){this._maxConnections=b;this._paused||this._loadNext()};a.loadFile=function(b,a){b==null?this._sendError({text:"PRELOAD_NO_FILE"}):(this._addItem(b),a!==false&&this.setPaused(false))};a.loadManifest=function(b,a){var d=null;if(b instanceof Array){if(b.length==0){this._sendError({text:"PRELOAD_MANIFEST_EMPTY"});
return}d=b}else{if(b==null){this._sendError({text:"PRELOAD_MANIFEST_NULL"});return}d=[b]}for(var c=0,o=d.length;c<o;c++)this._addItem(d[c]);a!==false&&this.setPaused(false)};a.load=function(){this.setPaused(false)};a.getItem=function(b){return this._loadItemsById[b]||this._loadItemsBySrc[b]};a.getResult=function(b,a){var d=this._loadItemsById[b]||this._loadItemsBySrc[b];if(d==null)return null;d=d.id;return a&&this._loadedRawResults[d]?this._loadedRawResults[d]:this._loadedResults[d]};a.setPaused=
function(b){(this._paused=b)||this._loadNext()};a.close=function(){for(;this._currentLoads.length;)this._currentLoads.pop().cancel();this._scriptOrder.length=0;this._loadedScripts.length=0;this.loadStartWasDispatched=false};a._addItem=function(b){b=this._createLoadItem(b);if(b!=null){var a=this._createLoader(b);a!=null&&(this._loadQueue.push(a),this._loadQueueBackup.push(a),this._numItems++,this._updateProgress(),this.maintainScriptOrder&&b.type==createjs.LoadQueue.JAVASCRIPT&&a instanceof createjs.XHRLoader&&
(this._scriptOrder.push(b),this._loadedScripts.push(null)))}};a._createLoadItem=function(b){var a=null;switch(typeof b){case "string":a={src:b};break;case "object":a=window.HTMLAudioElement&&b instanceof HTMLAudioElement?{tag:b,src:a.tag.src,type:createjs.LoadQueue.SOUND}:b}b=this._parseURI(a.src);if(b!=null)a.ext=b[5];if(a.type==null)a.type=this._getTypeByExtension(a.ext);if(a.tag==null)a.tag=this._createTag(a.type);if(a.id==null||a.id=="")a.id=a.src;if(b=this._typeCallbacks[a.type]||this._extensionCallbacks[a.ext]){b=
b(a.src,a.type,a.id,a.data);if(b===false)return null;else if(b!==true){if(b.src!=null)a.src=b.src;if(b.id!=null)a.id=b.id;if(b.tag!=null&&b.tag.load instanceof Function)a.tag=b.tag;if(b.completeHandler!=null)a.completeHandler=b.completeHandler}if(b.type)a.type=b.type;b=this._parseURI(a.src);if(b!=null)a.ext=b[5]}this._loadItemsById[a.id]=a;return this._loadItemsBySrc[a.src]=a};a._createLoader=function(a){var d=this.useXHR;switch(a.type){case createjs.LoadQueue.JSON:case createjs.LoadQueue.XML:case createjs.LoadQueue.TEXT:d=
true;break;case createjs.LoadQueue.SOUND:d=false}return d?new createjs.XHRLoader(a):new createjs.TagLoader(a)};a._loadNext=function(){if(!this._paused){if(!this._loadStartWasDispatched)this._sendLoadStart(),this._loadStartWasDispatched=true;if(this._numItems==this._numItemsLoaded)this.loaded=true,this._sendComplete(),this.next&&this.next.load&&this.next.load();for(var a=0,d=this._loadQueue.length;a<d;a++){if(this._currentLoads.length>=this._maxConnections)break;var c=this._loadQueue[a];if(this.maintainScriptOrder&&
c instanceof createjs.TagLoader&&c.getItem().type==createjs.LoadQueue.JAVASCRIPT){if(this._currentlyLoadingScript)continue;this._currentlyLoadingScript=true}this._loadQueue.splice(a,1);this._loadItem(c);a--;d--}}};a._loadItem=function(a){a.addEventListener("progress",createjs.proxy(this._handleProgress,this));a.addEventListener("complete",createjs.proxy(this._handleFileComplete,this));a.addEventListener("error",createjs.proxy(this._handleFileError,this));this._currentLoads.push(a);a.load()};a._handleFileError=
function(a){var d=a.target;this._numItemsLoaded++;this._updateProgress();a={item:d.getItem()};this._sendError(a);this.stopOnError||(this._removeLoadItem(d),this._loadNext())};a._handleFileComplete=function(a){var a=a.target,d=a.getItem();this._loadedResults[d.id]=a.getResult();a instanceof createjs.XHRLoader&&(this._loadedRawResults[d.id]=a.getResult(true));this._removeLoadItem(a);if(this.maintainScriptOrder&&d.type==createjs.LoadQueue.JAVASCRIPT)if(a instanceof createjs.TagLoader)this._currentlyLoadingScript=
false;else{this._loadedScripts[this._scriptOrder.indexOf(d)]=d;this._checkScriptLoadOrder(a);return}this._processFinishedLoad(d)};a._processFinishedLoad=function(a){this._numItemsLoaded++;this._updateProgress();this._sendFileComplete(a);this._loadNext()};a._checkScriptLoadOrder=function(){for(var a=this._loadedScripts.length,d=0;d<a;d++){var c=this._loadedScripts[d];if(c===null)break;c!==true&&(this._processFinishedLoad(c),this._loadedScripts[d]=true,d--,a--)}};a._removeLoadItem=function(a){for(var d=
this._currentLoads.length,c=0;c<d;c++)if(this._currentLoads[c]==a){this._currentLoads.splice(c,1);break}};a._handleProgress=function(a){a=a.target;this._sendFileProgress(a.getItem(),a.progress);this._updateProgress()};a._updateProgress=function(){var a=this._numItemsLoaded/this._numItems,d=this._numItems-this._numItemsLoaded;if(d>0){for(var c=0,e=0,o=this._currentLoads.length;e<o;e++)c+=this._currentLoads[e].progress;a+=c/d*(d/this._numItems)}this._sendProgress(a)};a._disposeItem=function(a){delete this._loadedResults[a.id];
delete this._loadedRawResults[a.id];delete this._loadItemsById[a.id];delete this._loadItemsBySrc[a.src]};a._createTag=function(a){var d=null;switch(a){case createjs.LoadQueue.IMAGE:return document.createElement("img");case createjs.LoadQueue.SOUND:return d=document.createElement("audio"),d.autoplay=false,d;case createjs.LoadQueue.JAVASCRIPT:return d=document.createElement("script"),d.type="text/javascript",d;case createjs.LoadQueue.CSS:return d=this.useXHR?document.createElement("style"):document.createElement("link"),
d.rel="stylesheet",d.type="text/css",d;case createjs.LoadQueue.SVG:return this.useXHR?d=document.createElement("svg"):(d=document.createElement("object"),d.type="image/svg+xml"),d}return null};a._getTypeByExtension=function(a){switch(a){case "jpeg":case "jpg":case "gif":case "png":case "webp":case "bmp":return createjs.LoadQueue.IMAGE;case "ogg":case "mp3":case "wav":return createjs.LoadQueue.SOUND;case "json":return createjs.LoadQueue.JSON;case "xml":return createjs.LoadQueue.XML;case "css":return createjs.LoadQueue.CSS;
case "js":return createjs.LoadQueue.JAVASCRIPT;case "svg":return createjs.LoadQueue.SVG;default:return createjs.LoadQueue.TEXT}};a._sendFileProgress=function(a,d){if(this._isCanceled())this._cleanUp();else{var c={target:this,type:"fileprogress",progress:d,loaded:d,total:1,item:a};this.onFileProgress&&this.onFileProgress(c);this.dispatchEvent(c)}};a._sendFileComplete=function(a){if(!this._isCanceled()){var d={target:this,type:"fileload",item:a,result:this._loadedResults[a.id],rawResult:this._loadedRawResults[a.id]};
a.completeHandler&&a.completeHandler(d);this.onFileLoad&&this.onFileLoad(d);this.dispatchEvent(d)}};a.toString=function(){return"[PreloadJS LoadQueue]"};createjs.proxy=function(a,d){return function(){return a.apply(d,arguments)}};createjs.LoadQueue=c;if(!createjs.proxy)createjs.proxy=function(a,d){var c=Array.prototype.slice.call(arguments,2);return function(){return a.apply(d,Array.prototype.slice.call(arguments,0).concat(c))}};var d=function(){};d.init=function(){var a=navigator.userAgent;d.isFirefox=
a.indexOf("Firefox")>-1;d.isOpera=window.opera!=null;d.isChrome=a.indexOf("Chrome")>-1;d.isIOS=a.indexOf("iPod")>-1||a.indexOf("iPhone")>-1||a.indexOf("iPad")>-1};d.init();createjs.LoadQueue.BrowserDetect=d;if(!Array.prototype.indexOf)Array.prototype.indexOf=function(a){if(this==null)throw new TypeError;var d=Object(this),c=d.length>>>0;if(c===0)return-1;var e=0;arguments.length>1&&(e=Number(arguments[1]),e!=e?e=0:e!=0&&e!=Infinity&&e!=-Infinity&&(e=(e>0||-1)*Math.floor(Math.abs(e))));if(e>=c)return-1;
for(e=e>=0?e:Math.max(c-Math.abs(e),0);e<c;e++)if(e in d&&d[e]===a)return e;return-1}})();this.createjs=this.createjs||{};
(function(){var c=function(a){this.init(a)},a=c.prototype=new createjs.AbstractLoader;a._loadTimeout=null;a._tagCompleteProxy=null;a._isAudio=false;a._tag=null;a.init=function(a){this._item=a;this._tag=a.tag;this._isAudio=window.HTMLAudioElement&&a.tag instanceof HTMLAudioElement;this._tagCompleteProxy=createjs.proxy(this._handleLoad,this)};a.getResult=function(){return this._tag};a.cancel=function(){this.canceled=true;this._clean();this.getItem()};a.load=function(){var a=this._item,b=this._tag;clearTimeout(this._loadTimeout);
this._loadTimeout=setTimeout(createjs.proxy(this._handleTimeout,this),createjs.LoadQueue.LOAD_TIMEOUT);if(this._isAudio)b.src=null,b.preload="auto";b.onerror=createjs.proxy(this._handleError,this);this._isAudio?(b.onstalled=createjs.proxy(this._handleStalled,this),b.addEventListener("canplaythrough",this._tagCompleteProxy,false)):(b.onload=createjs.proxy(this._handleLoad,this),b.onreadystatechange=createjs.proxy(this._handleReadyStateChange,this));switch(a.type){case createjs.LoadQueue.CSS:b.href=
a.src;break;case createjs.LoadQueue.SVG:b.data=a.src;break;default:b.src=a.src}if(a.type==createjs.LoadQueue.SVG||a.type==createjs.LoadQueue.JAVASCRIPT||a.type==createjs.LoadQueue.CSS)(document.body||document.getElementsByTagName("body")[0]).appendChild(b);b.load!=null&&b.load()};a._handleTimeout=function(){this._clean();this._sendError({reason:"PRELOAD_TIMEOUT"})};a._handleStalled=function(){};a._handleError=function(){this._clean();this._sendError()};a._handleReadyStateChange=function(){clearTimeout(this._loadTimeout);
this.getItem().tag.readyState=="loaded"&&this._handleLoad()};a._handleLoad=function(){if(!this._isCanceled()){var a=this.getItem(),b=a.tag;if(!(this.loaded||this.isAudio&&b.readyState!==4))this.loaded=true,a.type==createjs.LoadQueue.SVG&&(document.body||document.getElementsByTagName("body")[0]).removeChild(b),this._clean(),this._sendComplete()}};a._clean=function(){clearTimeout(this._loadTimeout);var a=this.getItem().tag;a.onload=null;a.removeEventListener&&a.removeEventListener("canplaythrough",
this._tagCompleteProxy,false);a.onstalled=null;a.onprogress=null;a.onerror=null;a.parentNode&&a.parentNode.removeChild(a)};a.toString=function(){return"[PreloadJS TagLoader]"};createjs.TagLoader=c})();this.createjs=this.createjs||{};
(function(){var c=function(a){this.init(a)},a=c.prototype=new createjs.AbstractLoader;a._request=null;a._loadTimeout=null;a._xhrLevel=1;a._response=null;a._rawResponse=null;a.init=function(a){this._item=a;this._createXHR(a)};a.getResult=function(a){return a&&this._rawResponse?this._rawResponse:this._response};a.cancel=function(){this.canceled=true;this._clean();this._request.abort()};a.load=function(){if(this._request==null)this._handleError();else{this._request.onloadstart=createjs.proxy(this._handleLoadStart,
this);this._request.onprogress=createjs.proxy(this._handleProgress,this);this._request.onabort=createjs.proxy(this._handleAbort,this);this._request.onerror=createjs.proxy(this._handleError,this);this._request.ontimeout=createjs.proxy(this._handleTimeout,this);if(this._xhrLevel==1)this._loadTimeout=setTimeout(createjs.proxy(this._handleTimeout,this),createjs.LoadQueue.LOAD_TIMEOUT);this._request.onload=createjs.proxy(this._handleLoad,this);if(this._request.onreadystatechange)this._request.onreadystatechange=
this._handleReadyStateChange(this);try{this._request.send()}catch(a){this._sendError({source:a})}}};a._handleProgress=function(a){a.loaded>0&&a.total==0||this._sendProgress({loaded:a.loaded,total:a.total})};a._handleLoadStart=function(){clearTimeout(this._loadTimeout);this._sendLoadStart()};a._handleAbort=function(){this._clean();this._sendError()};a._handleError=function(){this._clean();this._sendError()};a._handleReadyStateChange=function(){this._request.readyState==4&&this._handleLoad()};a._handleLoad=
function(){if(!this.loaded)this.loaded=true,this._checkError()?(this._response=this._getResponse(),this._clean(),this._generateTag()&&this._sendComplete()):this._handleError()};a._handleTimeout=function(){this._clean();this._sendError({reason:"PRELOAD_TIMEOUT"})};a._checkError=function(){switch(parseInt(this._request.status)){case 404:case 0:return false}return true};a._getResponse=function(){if(this._response!=null)return this._response;if(this._request.response!=null)return this._request.response;
try{if(this._request.responseText!=null)return this._request.responseText}catch(a){}try{if(this._request.responseXML!=null)return this._request.responseXML}catch(b){}return null};a._createXHR=function(a){var b=document.createElement("a");b.href=a.src;var c=document.createElement("a");c.href=location.href;b=b.hostname!=""&&(b.port!=c.port||b.protocol!=c.protocol||b.hostname!=c.hostname);c=null;if(b&&window.XDomainRequest)c=new XDomainRequest;else if(window.XMLHttpRequest)c=new XMLHttpRequest;else try{c=
new ActiveXObject("Msxml2.XMLHTTP.6.0")}catch(f){try{c=new ActiveXObject("Msxml2.XMLHTTP.3.0")}catch(e){try{c=new ActiveXObject("Msxml2.XMLHTTP")}catch(o){return false}}}a.type==createjs.LoadQueue.TEXT&&c.overrideMimeType&&c.overrideMimeType("text/plain; charset=x-user-defined");this._xhrLevel=typeof c.responseType==="string"?2:1;c.open("GET",a.src,true);b&&c instanceof XMLHttpRequest&&this._xhrLevel==1&&c.setRequestHeader("Origin",location.origin);if(createjs.LoadQueue.isBinary(a.type))c.responseType=
"arraybuffer";this._request=c;return true};a._clean=function(){clearTimeout(this._loadTimeout);var a=this._request;a.onloadstart=null;a.onprogress=null;a.onabort=null;a.onerror=null;a.onload=null;a.ontimeout=null;a.onloadend=null;a.onreadystatechange=null};a._generateTag=function(){var a=this._item.tag;switch(this._item.type){case createjs.LoadQueue.IMAGE:return a.onload=createjs.proxy(this._handleTagReady,this),a.src=this._item.src,this._rawResponse=this._response,this._response=a,false;case createjs.LoadQueue.JAVASCRIPT:a=
document.createElement("script");this._rawResponse=a.text=this._response;this._response=a;break;case createjs.LoadQueue.CSS:document.getElementsByTagName("head")[0].appendChild(a);if(a.styleSheet)a.styleSheet.cssText=this._response;else{var b=document.createTextNode(this._response);a.appendChild(b)}this._rawResponse=this._response;this._response=a;break;case createjs.LoadQueue.XML:this._response=b=this._parseXML(this._response,"text/xml");break;case createjs.LoadQueue.SVG:b=this._parseXML(this._response,
"image/svg+xml");this._rawResponse=this._response;a.appendChild(b.documentElement);this._response=a;break;case createjs.LoadQueue.JSON:a={};try{a=JSON.parse(this._response)}catch(c){a=null}this._rawResponse=this._response;this._response=a}return true};a._parseXML=function(a,b){var c=null;window.DOMParser?c=(new DOMParser).parseFromString(a,b):(c=new ActiveXObject("Microsoft.XMLDOM"),c.async=false,c.loadXML(a));return c};a._handleTagReady=function(){this._sendComplete()};a.toString=function(){return"[PreloadJS XHRLoader]"};
createjs.XHRLoader=c})();typeof JSON!=="object"&&(JSON={});
(function(){function c(a){return a<10?"0"+a:a}function a(a){g.lastIndex=0;return g.test(a)?'"'+a.replace(g,function(a){var b=o[a];return typeof b==="string"?b:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+a+'"'}function d(b,c){var g,n,m,p,q=f,k,j=c[b];j&&typeof j==="object"&&typeof j.toJSON==="function"&&(j=j.toJSON(b));typeof h==="function"&&(j=h.call(c,b,j));switch(typeof j){case "string":return a(j);case "number":return isFinite(j)?String(j):"null";case "boolean":case "null":return String(j);
case "object":if(!j)return"null";f+=e;k=[];if(Object.prototype.toString.apply(j)==="[object Array]"){p=j.length;for(g=0;g<p;g+=1)k[g]=d(g,j)||"null";m=k.length===0?"[]":f?"[\n"+f+k.join(",\n"+f)+"\n"+q+"]":"["+k.join(",")+"]";f=q;return m}if(h&&typeof h==="object"){p=h.length;for(g=0;g<p;g+=1)typeof h[g]==="string"&&(n=h[g],(m=d(n,j))&&k.push(a(n)+(f?": ":":")+m))}else for(n in j)Object.prototype.hasOwnProperty.call(j,n)&&(m=d(n,j))&&k.push(a(n)+(f?": ":":")+m);m=k.length===0?"{}":f?"{\n"+f+k.join(",\n"+
f)+"\n"+q+"}":"{"+k.join(",")+"}";f=q;return m}}if(typeof Date.prototype.toJSON!=="function")Date.prototype.toJSON=function(){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+c(this.getUTCMonth()+1)+"-"+c(this.getUTCDate())+"T"+c(this.getUTCHours())+":"+c(this.getUTCMinutes())+":"+c(this.getUTCSeconds())+"Z":null},String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(){return this.valueOf()};var b=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
g=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,f,e,o={"\u0008":"\\b","\t":"\\t","\n":"\\n","\u000c":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},h;if(typeof JSON.stringify!=="function")JSON.stringify=function(a,b,c){var g;e=f="";if(typeof c==="number")for(g=0;g<c;g+=1)e+=" ";else typeof c==="string"&&(e=c);if((h=b)&&typeof b!=="function"&&(typeof b!=="object"||typeof b.length!=="number"))throw Error("JSON.stringify");return d("",
{"":a})};if(typeof JSON.parse!=="function")JSON.parse=function(a,c){function d(a,b){var e,g,f=a[b];if(f&&typeof f==="object")for(e in f)Object.prototype.hasOwnProperty.call(f,e)&&(g=d(f,e),g!==void 0?f[e]=g:delete f[e]);return c.call(a,b,f)}var e,a=String(a);b.lastIndex=0;b.test(a)&&(a=a.replace(b,function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)}));if(/^[\],:{}\s]*$/.test(a.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
"]").replace(/(?:^|:|,)(?:\s*\[)+/g,"")))return e=eval("("+a+")"),typeof c==="function"?d({"":e},""):e;throw new SyntaxError("JSON.parse");}})();

/*!
* @license SoundJS
* Visit http://createjs.com/ for documentation, updates and examples.
*
* Copyright (c) 2011-2013 gskinner.com, inc.
*
* Distributed under the terms of the MIT license.
* http://www.opensource.org/licenses/mit-license.html
*
* This notice shall be included in all copies or substantial portions of the Software.
*/

/**!
 * SoundJS FlashPlugin also includes swfobject (http://code.google.com/p/swfobject/)
 */

this.createjs=this.createjs||{},function(){var a=createjs.SoundJS=createjs.SoundJS||{};a.version="0.5.2",a.buildDate="Thu, 12 Dec 2013 23:33:37 GMT"}(),this.createjs=this.createjs||{},function(){"use strict";var a=function(){},b=a.prototype;a.initialize=function(a){a.addEventListener=b.addEventListener,a.on=b.on,a.removeEventListener=a.off=b.removeEventListener,a.removeAllEventListeners=b.removeAllEventListeners,a.hasEventListener=b.hasEventListener,a.dispatchEvent=b.dispatchEvent,a._dispatchEvent=b._dispatchEvent,a.willTrigger=b.willTrigger},b._listeners=null,b._captureListeners=null,b.initialize=function(){},b.addEventListener=function(a,b,c){var d;d=c?this._captureListeners=this._captureListeners||{}:this._listeners=this._listeners||{};var e=d[a];return e&&this.removeEventListener(a,b,c),e=d[a],e?e.push(b):d[a]=[b],b},b.on=function(a,b,c,d,e,f){return b.handleEvent&&(c=c||b,b=b.handleEvent),c=c||this,this.addEventListener(a,function(a){b.call(c,a,e),d&&a.remove()},f)},b.removeEventListener=function(a,b,c){var d=c?this._captureListeners:this._listeners;if(d){var e=d[a];if(e)for(var f=0,g=e.length;g>f;f++)if(e[f]==b){1==g?delete d[a]:e.splice(f,1);break}}},b.off=b.removeEventListener,b.removeAllEventListeners=function(a){a?(this._listeners&&delete this._listeners[a],this._captureListeners&&delete this._captureListeners[a]):this._listeners=this._captureListeners=null},b.dispatchEvent=function(a,b){if("string"==typeof a){var c=this._listeners;if(!c||!c[a])return!1;a=new createjs.Event(a)}if(a.target=b||this,a.bubbles&&this.parent){for(var d=this,e=[d];d.parent;)e.push(d=d.parent);var f,g=e.length;for(f=g-1;f>=0&&!a.propagationStopped;f--)e[f]._dispatchEvent(a,1+(0==f));for(f=1;g>f&&!a.propagationStopped;f++)e[f]._dispatchEvent(a,3)}else this._dispatchEvent(a,2);return a.defaultPrevented},b.hasEventListener=function(a){var b=this._listeners,c=this._captureListeners;return!!(b&&b[a]||c&&c[a])},b.willTrigger=function(a){for(var b=this;b;){if(b.hasEventListener(a))return!0;b=b.parent}return!1},b.toString=function(){return"[EventDispatcher]"},b._dispatchEvent=function(a,b){var c,d=1==b?this._captureListeners:this._listeners;if(a&&d){var e=d[a.type];if(!e||!(c=e.length))return;a.currentTarget=this,a.eventPhase=b,a.removed=!1,e=e.slice();for(var f=0;c>f&&!a.immediatePropagationStopped;f++){var g=e[f];g.handleEvent?g.handleEvent(a):g(a),a.removed&&(this.off(a.type,g,1==b),a.removed=!1)}}},createjs.EventDispatcher=a}(),this.createjs=this.createjs||{},function(){"use strict";var a=function(a,b,c){this.initialize(a,b,c)},b=a.prototype;b.type=null,b.target=null,b.currentTarget=null,b.eventPhase=0,b.bubbles=!1,b.cancelable=!1,b.timeStamp=0,b.defaultPrevented=!1,b.propagationStopped=!1,b.immediatePropagationStopped=!1,b.removed=!1,b.initialize=function(a,b,c){this.type=a,this.bubbles=b,this.cancelable=c,this.timeStamp=(new Date).getTime()},b.preventDefault=function(){this.defaultPrevented=!0},b.stopPropagation=function(){this.propagationStopped=!0},b.stopImmediatePropagation=function(){this.immediatePropagationStopped=this.propagationStopped=!0},b.remove=function(){this.removed=!0},b.clone=function(){return new a(this.type,this.bubbles,this.cancelable)},b.toString=function(){return"[Event (type="+this.type+")]"},createjs.Event=a}(),this.createjs=this.createjs||{},function(){"use strict";createjs.indexOf=function(a,b){for(var c=0,d=a.length;d>c;c++)if(b===a[c])return c;return-1}}(),this.createjs=this.createjs||{},function(){"use strict";createjs.proxy=function(a,b){var c=Array.prototype.slice.call(arguments,2);return function(){return a.apply(b,Array.prototype.slice.call(arguments,0).concat(c))}}}(),this.createjs=this.createjs||{},function(){"use strict";function a(){throw"Sound cannot be instantiated"}function b(a,b){this.init(a,b)}function c(){this.isDefault=!0,this.addEventListener=this.removeEventListener=this.removeAllEventListeners=this.dispatchEvent=this.hasEventListener=this._listeners=this._interrupt=this._playFailed=this.pause=this.resume=this.play=this._beginPlaying=this._cleanUp=this.stop=this.setMasterVolume=this.setVolume=this.mute=this.setMute=this.getMute=this.setPan=this.getPosition=this.setPosition=this.playFailed=function(){return!1},this.getVolume=this.getPan=this.getDuration=function(){return 0},this.playState=a.PLAY_FAILED,this.toString=function(){return"[Sound Default Sound Instance]"}}function d(){}var e=a;e.DELIMITER="|",e.INTERRUPT_ANY="any",e.INTERRUPT_EARLY="early",e.INTERRUPT_LATE="late",e.INTERRUPT_NONE="none",e.PLAY_INITED="playInited",e.PLAY_SUCCEEDED="playSucceeded",e.PLAY_INTERRUPTED="playInterrupted",e.PLAY_FINISHED="playFinished",e.PLAY_FAILED="playFailed",e.SUPPORTED_EXTENSIONS=["mp3","ogg","mpeg","wav","m4a","mp4","aiff","wma","mid"],e.EXTENSION_MAP={m4a:"mp4"},e.FILE_PATTERN=/^(?:(\w+:)\/{2}(\w+(?:\.\w+)*\/?))?([/.]*?(?:[^?]+)?\/)?((?:[^/?]+)\.(\w+))(?:\?(\S+)?)?$/,e.defaultInterruptBehavior=e.INTERRUPT_NONE,e.alternateExtensions=[],e._lastID=0,e.activePlugin=null,e._pluginsRegistered=!1,e._masterVolume=1,e._masterMute=!1,e._instances=[],e._idHash={},e._preloadHash={},e._defaultSoundInstance=null,e.addEventListener=null,e.removeEventListener=null,e.removeAllEventListeners=null,e.dispatchEvent=null,e.hasEventListener=null,e._listeners=null,createjs.EventDispatcher.initialize(e),e._sendFileLoadEvent=function(a){if(e._preloadHash[a])for(var b=0,c=e._preloadHash[a].length;c>b;b++){var d=e._preloadHash[a][b];if(e._preloadHash[a][b]=!0,e.hasEventListener("fileload")){var f=new createjs.Event("fileload");f.src=d.src,f.id=d.id,f.data=d.data,e.dispatchEvent(f)}}},e.getPreloadHandlers=function(){return{callback:createjs.proxy(e.initLoad,e),types:["sound"],extensions:e.SUPPORTED_EXTENSIONS}},e.registerPlugin=function(a){try{console.log("createjs.Sound.registerPlugin has been deprecated. Please use registerPlugins.")}catch(b){}return e._registerPlugin(a)},e._registerPlugin=function(a){return e._pluginsRegistered=!0,null==a?!1:a.isSupported()?(e.activePlugin=new a,!0):!1},e.registerPlugins=function(a){for(var b=0,c=a.length;c>b;b++){var d=a[b];if(e._registerPlugin(d))return!0}return!1},e.initializeDefaultPlugins=function(){return null!=e.activePlugin?!0:e._pluginsRegistered?!1:e.registerPlugins([createjs.WebAudioPlugin,createjs.HTMLAudioPlugin])?!0:!1},e.isReady=function(){return null!=e.activePlugin},e.getCapabilities=function(){return null==e.activePlugin?null:e.activePlugin._capabilities},e.getCapability=function(a){return null==e.activePlugin?null:e.activePlugin._capabilities[a]},e.initLoad=function(a,b,c,d,f){a=a.replace(f,"");var g=e.registerSound(a,c,d,!1,f);return null==g?!1:g},e.registerSound=function(a,c,d,f,g){if(!e.initializeDefaultPlugins())return!1;if(a instanceof Object&&(g=c,c=a.id,d=a.data,a=a.src),e.alternateExtensions.length)var h=e._parsePath2(a,"sound",c,d);else var h=e._parsePath(a,"sound",c,d);if(null==h)return!1;null!=g&&(a=g+a,h.src=g+h.src),null!=c&&(e._idHash[c]=h.src);var i=null;null!=d&&(isNaN(d.channels)?isNaN(d)||(i=parseInt(d)):i=parseInt(d.channels));var j=e.activePlugin.register(h.src,i);if(null!=j&&(null!=j.numChannels&&(i=j.numChannels),b.create(h.src,i),null!=d&&isNaN(d)?d.channels=h.data.channels=i||b.maxPerChannel():d=h.data=i||b.maxPerChannel(),null!=j.tag?h.tag=j.tag:j.src&&(h.src=j.src),null!=j.completeHandler&&(h.completeHandler=j.completeHandler),j.type&&(h.type=j.type)),0!=f)if(e._preloadHash[h.src]||(e._preloadHash[h.src]=[]),e._preloadHash[h.src].push({src:a,id:c,data:d}),1==e._preloadHash[h.src].length)e.activePlugin.preload(h.src,j);else if(1==e._preloadHash[h.src][0])return!0;return h},e.registerManifest=function(a,b){for(var c=[],d=0,e=a.length;e>d;d++)c[d]=createjs.Sound.registerSound(a[d].src,a[d].id,a[d].data,a[d].preload,b);return c},e.removeSound=function(a,c){if(null==e.activePlugin)return!1;if(a instanceof Object&&(a=a.src),a=e._getSrcById(a),e.alternateExtensions.length)var d=e._parsePath2(a);else var d=e._parsePath(a);if(null==d)return!1;null!=c&&(d.src=c+d.src),a=d.src;for(var f in e._idHash)e._idHash[f]==a&&delete e._idHash[f];return b.removeSrc(a),delete e._preloadHash[a],e.activePlugin.removeSound(a),!0},e.removeManifest=function(a,b){for(var c=[],d=0,e=a.length;e>d;d++)c[d]=createjs.Sound.removeSound(a[d].src,b);return c},e.removeAllSounds=function(){e._idHash={},e._preloadHash={},b.removeAll(),e.activePlugin.removeAllSounds()},e.loadComplete=function(a){if(e.alternateExtensions.length)var b=e._parsePath2(a,"sound");else var b=e._parsePath(a,"sound");return a=b?e._getSrcById(b.src):e._getSrcById(a),1==e._preloadHash[a][0]},e._parsePath=function(a,b,c,d){"string"!=typeof a&&(a=a.toString());var f=a.split(e.DELIMITER);if(f.length>1)try{console.log('createjs.Sound.DELIMITER "|" loading approach has been deprecated. Please use the new alternateExtensions property.')}catch(g){}for(var h={type:b||"sound",id:c,data:d},i=e.getCapabilities(),j=0,k=f.length;k>j;j++){var l=f[j],m=l.match(e.FILE_PATTERN);if(null==m)return!1;var n=m[4],o=m[5];if(i[o]&&createjs.indexOf(e.SUPPORTED_EXTENSIONS,o)>-1)return h.name=n,h.src=l,h.extension=o,h}return null},e._parsePath2=function(a,b,c,d){"string"!=typeof a&&(a=a.toString());var f=a.match(e.FILE_PATTERN);if(null==f)return!1;for(var g=f[4],h=f[5],i=e.getCapabilities(),j=0;!i[h];)if(h=e.alternateExtensions[j++],j>e.alternateExtensions.length)return null;a=a.replace("."+f[5],"."+h);var k={type:b||"sound",id:c,data:d};return k.name=g,k.src=a,k.extension=h,k},e.play=function(a,b,c,d,f,g,h){var i=e.createInstance(a),j=e._playInstance(i,b,c,d,f,g,h);return j||i.playFailed(),i},e.createInstance=function(c){if(!e.initializeDefaultPlugins())return e._defaultSoundInstance;if(c=e._getSrcById(c),e.alternateExtensions.length)var d=e._parsePath2(c,"sound");else var d=e._parsePath(c,"sound");var f=null;return null!=d&&null!=d.src?(b.create(d.src),f=e.activePlugin.create(d.src)):f=a._defaultSoundInstance,f.uniqueId=e._lastID++,f},e.setVolume=function(a){if(null==Number(a))return!1;if(a=Math.max(0,Math.min(1,a)),e._masterVolume=a,!this.activePlugin||!this.activePlugin.setVolume||!this.activePlugin.setVolume(a))for(var b=this._instances,c=0,d=b.length;d>c;c++)b[c].setMasterVolume(a)},e.getVolume=function(){return e._masterVolume},e.setMute=function(a){if(null==a||void 0==a)return!1;if(this._masterMute=a,!this.activePlugin||!this.activePlugin.setMute||!this.activePlugin.setMute(a))for(var b=this._instances,c=0,d=b.length;d>c;c++)b[c].setMasterMute(a);return!0},e.getMute=function(){return this._masterMute},e.stop=function(){for(var a=this._instances,b=a.length;b--;)a[b].stop()},e._playInstance=function(a,b,c,d,f,g,h){if(b instanceof Object&&(c=b.delay,d=b.offset,f=b.loop,g=b.volume,h=b.pan,b=b.interrupt),b=b||e.defaultInterruptBehavior,null==c&&(c=0),null==d&&(d=a.getPosition()),null==f&&(f=0),null==g&&(g=a.volume),null==h&&(h=a.pan),0==c){var i=e._beginPlaying(a,b,d,f,g,h);if(!i)return!1}else{var j=setTimeout(function(){e._beginPlaying(a,b,d,f,g,h)},c);a._delayTimeoutId=j}return this._instances.push(a),!0},e._beginPlaying=function(a,c,d,e,f,g){if(!b.add(a,c))return!1;var h=a._beginPlaying(d,e,f,g);if(!h){var i=createjs.indexOf(this._instances,a);return i>-1&&this._instances.splice(i,1),!1}return!0},e._getSrcById=function(a){return null==e._idHash||null==e._idHash[a]?a:e._idHash[a]},e._playFinished=function(a){b.remove(a);var c=createjs.indexOf(this._instances,a);c>-1&&this._instances.splice(c,1)},createjs.Sound=a,b.channels={},b.create=function(a,c){var d=b.get(a);return null==d?(b.channels[a]=new b(a,c),!0):!1},b.removeSrc=function(a){var c=b.get(a);return null==c?!1:(c.removeAll(),delete b.channels[a],!0)},b.removeAll=function(){for(var a in b.channels)b.channels[a].removeAll();b.channels={}},b.add=function(a,c){var d=b.get(a.src);return null==d?!1:d.add(a,c)},b.remove=function(a){var c=b.get(a.src);return null==c?!1:(c.remove(a),!0)},b.maxPerChannel=function(){return f.maxDefault},b.get=function(a){return b.channels[a]};var f=b.prototype;f.src=null,f.max=null,f.maxDefault=100,f.length=0,f.init=function(a,b){this.src=a,this.max=b||this.maxDefault,-1==this.max&&(this.max=this.maxDefault),this._instances=[]},f.get=function(a){return this._instances[a]},f.add=function(a,b){return this.getSlot(b,a)?(this._instances.push(a),this.length++,!0):!1},f.remove=function(a){var b=createjs.indexOf(this._instances,a);return-1==b?!1:(this._instances.splice(b,1),this.length--,!0)},f.removeAll=function(){for(var a=this.length-1;a>=0;a--)this._instances[a].stop()},f.getSlot=function(b){for(var c,d,e=0,f=this.max;f>e;e++){if(c=this.get(e),null==c)return!0;(b!=a.INTERRUPT_NONE||c.playState==a.PLAY_FINISHED)&&(0!=e?c.playState==a.PLAY_FINISHED||c.playState==a.PLAY_INTERRUPTED||c.playState==a.PLAY_FAILED?d=c:(b==a.INTERRUPT_EARLY&&c.getPosition()<d.getPosition()||b==a.INTERRUPT_LATE&&c.getPosition()>d.getPosition())&&(d=c):d=c)}return null!=d?(d._interrupt(),this.remove(d),!0):!1},f.toString=function(){return"[Sound SoundChannel]"},a._defaultSoundInstance=new c,d.init=function(){var a=window.navigator.userAgent;d.isFirefox=a.indexOf("Firefox")>-1,d.isOpera=null!=window.opera,d.isChrome=a.indexOf("Chrome")>-1,d.isIOS=a.indexOf("iPod")>-1||a.indexOf("iPhone")>-1||a.indexOf("iPad")>-1,d.isAndroid=a.indexOf("Android")>-1,d.isBlackberry=a.indexOf("Blackberry")>-1},d.init(),createjs.Sound.BrowserDetect=d}(),this.createjs=this.createjs||{},function(){"use strict";function a(){this._init()}var b=a;b._capabilities=null,b.isSupported=function(){var a=createjs.Sound.BrowserDetect.isIOS||createjs.Sound.BrowserDetect.isAndroid||createjs.Sound.BrowserDetect.isBlackberry;return"file:"!=location.protocol||a||this._isFileXHRSupported()?(b._generateCapabilities(),null==b.context?!1:!0):!1},b._isFileXHRSupported=function(){var a=!0,b=new XMLHttpRequest;try{b.open("GET","fail.fail",!1)}catch(c){return a=!1}b.onerror=function(){a=!1},b.onload=function(){a=404==this.status||200==this.status||0==this.status&&""!=this.response};try{b.send()}catch(c){a=!1}return a},b._generateCapabilities=function(){if(null==b._capabilities){var a=document.createElement("audio");if(null==a.canPlayType)return null;if(window.webkitAudioContext)b.context=new webkitAudioContext;else{if(!window.AudioContext)return null;b.context=new AudioContext}b._compatibilitySetUp(),b.playEmptySound(),b._capabilities={panning:!0,volume:!0,tracks:-1};for(var c=createjs.Sound.SUPPORTED_EXTENSIONS,d=createjs.Sound.EXTENSION_MAP,e=0,f=c.length;f>e;e++){var g=c[e],h=d[g]||g;b._capabilities[g]="no"!=a.canPlayType("audio/"+g)&&""!=a.canPlayType("audio/"+g)||"no"!=a.canPlayType("audio/"+h)&&""!=a.canPlayType("audio/"+h)}b.context.destination.numberOfChannels<2&&(b._capabilities.panning=!1),b.dynamicsCompressorNode=b.context.createDynamicsCompressor(),b.dynamicsCompressorNode.connect(b.context.destination),b.gainNode=b.context.createGain(),b.gainNode.connect(b.dynamicsCompressorNode)}},b._compatibilitySetUp=function(){if(!b.context.createGain){b.context.createGain=b.context.createGainNode;var a=b.context.createBufferSource();a.__proto__.start=a.__proto__.noteGrainOn,a.__proto__.stop=a.__proto__.noteOff,this._panningModel=0}},b.playEmptySound=function(){var a=this.context.createBuffer(1,1,22050),b=this.context.createBufferSource();b.buffer=a,b.connect(this.context.destination),b.start(0,0,0)};var c=a.prototype;c._capabilities=null,c._volume=1,c.context=null,c._panningModel="equalpower",c.dynamicsCompressorNode=null,c.gainNode=null,c._arrayBuffers=null,c._init=function(){this._capabilities=b._capabilities,this._arrayBuffers={},this.context=b.context,this.gainNode=b.gainNode,this.dynamicsCompressorNode=b.dynamicsCompressorNode},c.register=function(a){this._arrayBuffers[a]=!0;var b=new createjs.WebAudioPlugin.Loader(a,this);return{tag:b}},c.isPreloadStarted=function(a){return null!=this._arrayBuffers[a]},c.isPreloadComplete=function(a){return!(null==this._arrayBuffers[a]||1==this._arrayBuffers[a])},c.removeSound=function(a){delete this._arrayBuffers[a]},c.removeAllSounds=function(){this._arrayBuffers={}},c.addPreloadResults=function(a,b){this._arrayBuffers[a]=b},c._handlePreloadComplete=function(){createjs.Sound._sendFileLoadEvent(this.src)},c.preload=function(a){this._arrayBuffers[a]=!0;var b=new createjs.WebAudioPlugin.Loader(a,this);b.onload=this._handlePreloadComplete,b.load()},c.create=function(a){return this.isPreloadStarted(a)||this.preload(a),new createjs.WebAudioPlugin.SoundInstance(a,this)},c.setVolume=function(a){return this._volume=a,this._updateVolume(),!0},c._updateVolume=function(){var a=createjs.Sound._masterMute?0:this._volume;a!=this.gainNode.gain.value&&(this.gainNode.gain.value=a)},c.getVolume=function(){return this._volume},c.setMute=function(){return this._updateVolume(),!0},c.toString=function(){return"[WebAudioPlugin]"},createjs.WebAudioPlugin=a}(),function(){"use strict";function a(a,b){this._init(a,b)}var b=a.prototype=new createjs.EventDispatcher;b.src=null,b.uniqueId=-1,b.playState=null,b._owner=null,b._offset=0,b._delay=0,b._volume=1;try{Object.defineProperty(b,"volume",{get:function(){return this._volume},set:function(a){return null==Number(a)?!1:(a=Math.max(0,Math.min(1,a)),this._volume=a,this._updateVolume(),void 0)}})}catch(c){}b._pan=0;try{Object.defineProperty(b,"pan",{get:function(){return this._pan},set:function(a){return this._owner._capabilities.panning&&null!=Number(a)?(a=Math.max(-1,Math.min(1,a)),this._pan=a,this.panNode.setPosition(a,0,-.5),void 0):!1}})}catch(c){}b._duration=0,b._remainingLoops=0,b._delayTimeoutId=null,b._soundCompleteTimeout=null,b.gainNode=null,b.panNode=null,b.sourceNode=null,b._sourceNodeNext=null,b._muted=!1,b._paused=!1,b._startTime=0,b._endedHandler=null,b._sendEvent=function(a){var b=new createjs.Event(a);this.dispatchEvent(b)},b._init=function(a,b){this._owner=b,this.src=a,this.gainNode=this._owner.context.createGain(),this.panNode=this._owner.context.createPanner(),this.panNode.panningModel=this._owner._panningModel,this.panNode.connect(this.gainNode),this._owner.isPreloadComplete(this.src)&&(this._duration=1e3*this._owner._arrayBuffers[this.src].duration),this._endedHandler=createjs.proxy(this._handleSoundComplete,this)},b._cleanUp=function(){this.sourceNode&&this.playState==createjs.Sound.PLAY_SUCCEEDED&&(this.sourceNode=this._cleanUpAudioNode(this.sourceNode),this._sourceNodeNext=this._cleanUpAudioNode(this._sourceNodeNext)),0!=this.gainNode.numberOfOutputs&&this.gainNode.disconnect(0),clearTimeout(this._delayTimeoutId),clearTimeout(this._soundCompleteTimeout),this._startTime=0,null!=window.createjs&&createjs.Sound._playFinished(this)},b._cleanUpAudioNode=function(a){return a&&(a.stop(0),a.disconnect(this.panNode),a=null),a},b._interrupt=function(){this._cleanUp(),this.playState=createjs.Sound.PLAY_INTERRUPTED,this._paused=!1,this._sendEvent("interrupted")},b._handleSoundReady=function(){if(null!=window.createjs){if(1e3*this._offset>this.getDuration())return this.playFailed(),void 0;this._offset<0&&(this._offset=0),this.playState=createjs.Sound.PLAY_SUCCEEDED,this._paused=!1,this.gainNode.connect(this._owner.gainNode);var a=this._owner._arrayBuffers[this.src].duration;this.sourceNode=this._createAndPlayAudioNode(this._owner.context.currentTime-a,this._offset),this._duration=1e3*a,this._startTime=this.sourceNode.startTime-this._offset,this._soundCompleteTimeout=setTimeout(this._endedHandler,1e3*(a-this._offset)),0!=this._remainingLoops&&(this._sourceNodeNext=this._createAndPlayAudioNode(this._startTime,0))}},b._createAndPlayAudioNode=function(a,b){var c=this._owner.context.createBufferSource();return c.buffer=this._owner._arrayBuffers[this.src],c.connect(this.panNode),this._owner.context.currentTime,c.startTime=a+c.buffer.duration,c.start(c.startTime,b,c.buffer.duration-b),c},b.play=function(a,b,c,d,e,f){this._cleanUp(),createjs.Sound._playInstance(this,a,b,c,d,e,f)},b._beginPlaying=function(a,b,c,d){return null!=window.createjs&&this.src?(this._offset=a/1e3,this._remainingLoops=b,this.volume=c,this.pan=d,this._owner.isPreloadComplete(this.src)?(this._handleSoundReady(null),this._sendEvent("succeeded"),1):(this.playFailed(),void 0)):void 0},b.pause=function(){return this._paused||this.playState!=createjs.Sound.PLAY_SUCCEEDED?!1:(this._paused=!0,this._offset=this._owner.context.currentTime-this._startTime,this._cleanUpAudioNode(this.sourceNode),this._cleanUpAudioNode(this._sourceNodeNext),0!=this.gainNode.numberOfOutputs&&this.gainNode.disconnect(),clearTimeout(this._delayTimeoutId),clearTimeout(this._soundCompleteTimeout),!0)},b.resume=function(){return this._paused?(this._handleSoundReady(null),!0):!1},b.stop=function(){return this._cleanUp(),this.playState=createjs.Sound.PLAY_FINISHED,this._offset=0,!0},b.setVolume=function(a){return this.volume=a,!0},b._updateVolume=function(){var a=this._muted?0:this._volume;return a!=this.gainNode.gain.value?(this.gainNode.gain.value=a,!0):!1},b.getVolume=function(){return this.volume},b.setMute=function(a){return null==a||void 0==a?!1:(this._muted=a,this._updateVolume(),!0)},b.getMute=function(){return this._muted},b.setPan=function(a){return this.pan=a,this.pan!=a?!1:void 0},b.getPan=function(){return this.pan},b.getPosition=function(){if(this._paused||null==this.sourceNode)var a=this._offset;else var a=this._owner.context.currentTime-this._startTime;return 1e3*a},b.setPosition=function(a){return this._offset=a/1e3,this.sourceNode&&this.playState==createjs.Sound.PLAY_SUCCEEDED&&(this._cleanUpAudioNode(this.sourceNode),this._cleanUpAudioNode(this._sourceNodeNext),clearTimeout(this._soundCompleteTimeout)),this._paused||this.playState!=createjs.Sound.PLAY_SUCCEEDED||this._handleSoundReady(null),!0},b.getDuration=function(){return this._duration},b._handleSoundComplete=function(){return this._offset=0,0!=this._remainingLoops?(this._remainingLoops--,this._sourceNodeNext?(this._cleanUpAudioNode(this.sourceNode),this.sourceNode=this._sourceNodeNext,this._startTime=this.sourceNode.startTime,this._sourceNodeNext=this._createAndPlayAudioNode(this._startTime,0),this._soundCompleteTimeout=setTimeout(this._endedHandler,this._duration)):this._handleSoundReady(null),this._sendEvent("loop"),void 0):(null!=window.createjs&&(this._cleanUp(),this.playState=createjs.Sound.PLAY_FINISHED,this._sendEvent("complete")),void 0)},b.playFailed=function(){null!=window.createjs&&(this._cleanUp(),this.playState=createjs.Sound.PLAY_FAILED,this._sendEvent("failed"))},b.toString=function(){return"[WebAudioPlugin SoundInstance]"},createjs.WebAudioPlugin.SoundInstance=a}(),function(){"use strict";function a(a,b){this._init(a,b)}var b=a.prototype;b.request=null,b.owner=null,b.progress=-1,b.src=null,b.originalSrc=null,b.result=null,b.onload=null,b.onprogress=null,b.onError=null,b._init=function(a,b){this.src=a,this.originalSrc=a,this.owner=b},b.load=function(a){null!=a&&(this.src=a),this.request=new XMLHttpRequest,this.request.open("GET",this.src,!0),this.request.responseType="arraybuffer",this.request.onload=createjs.proxy(this.handleLoad,this),this.request.onError=createjs.proxy(this.handleError,this),this.request.onprogress=createjs.proxy(this.handleProgress,this),this.request.send()},b.handleProgress=function(a,b){this.progress=a/b,null!=this.onprogress&&this.onprogress({loaded:a,total:b,progress:this.progress})},b.handleLoad=function(){this.owner.context.decodeAudioData(this.request.response,createjs.proxy(this.handleAudioDecoded,this),createjs.proxy(this.handleError,this))},b.handleAudioDecoded=function(a){this.progress=1,this.result=a,this.src=this.originalSrc,this.owner.addPreloadResults(this.src,this.result),this.onload&&this.onload()},b.handleError=function(a){this.owner.removeSound(this.src),this.onerror&&this.onerror(a)},b.toString=function(){return"[WebAudioPlugin Loader]"},createjs.WebAudioPlugin.Loader=a}(),this.createjs=this.createjs||{},function(){"use strict";function a(){this._init()}var b=a;b.MAX_INSTANCES=30,b._AUDIO_READY="canplaythrough",b._AUDIO_ENDED="ended",b._AUDIO_SEEKED="seeked",b._AUDIO_STALLED="stalled",b._capabilities=null,b.enableIOS=!1,b.isSupported=function(){if(createjs.Sound.BrowserDetect.isIOS&&!b.enableIOS)return!1;b._generateCapabilities();var a=b.tag;return null==a||null==b._capabilities?!1:!0},b._generateCapabilities=function(){if(null==b._capabilities){var a=b.tag=document.createElement("audio");if(null==a.canPlayType)return null;b._capabilities={panning:!0,volume:!0,tracks:-1};for(var c=createjs.Sound.SUPPORTED_EXTENSIONS,d=createjs.Sound.EXTENSION_MAP,e=0,f=c.length;f>e;e++){var g=c[e],h=d[g]||g;b._capabilities[g]="no"!=a.canPlayType("audio/"+g)&&""!=a.canPlayType("audio/"+g)||"no"!=a.canPlayType("audio/"+h)&&""!=a.canPlayType("audio/"+h)}}};var c=a.prototype;c._capabilities=null,c._audioSources=null,c.defaultNumChannels=2,c.loadedHandler=null,c._init=function(){this._capabilities=b._capabilities,this._audioSources={}},c.register=function(a,b){this._audioSources[a]=!0;for(var c=createjs.HTMLAudioPlugin.TagPool.get(a),d=null,e=b||this.defaultNumChannels,f=0;e>f;f++)d=this._createTag(a),c.add(d);if(d.id=a,this.loadedHandler=createjs.proxy(this._handleTagLoad,this),d.addEventListener&&d.addEventListener("canplaythrough",this.loadedHandler),null==d.onreadystatechange)d.onreadystatechange=this.loadedHandler;else{var g=d.onreadystatechange;d.onreadystatechange=function(){g(),this.loadedHandler()}}return{tag:d,numChannels:e}},c._handleTagLoad=function(a){a.target.removeEventListener&&a.target.removeEventListener("canplaythrough",this.loadedHandler),a.target.onreadystatechange=null,a.target.src!=a.target.id&&createjs.HTMLAudioPlugin.TagPool.checkSrc(a.target.id)},c._createTag=function(a){var b=document.createElement("audio");return b.autoplay=!1,b.preload="none",b.src=a,b},c.removeSound=function(a){delete this._audioSources[a],createjs.HTMLAudioPlugin.TagPool.remove(a)},c.removeAllSounds=function(){this._audioSources={},createjs.HTMLAudioPlugin.TagPool.removeAll()},c.create=function(a){if(!this.isPreloadStarted(a)){var b=createjs.HTMLAudioPlugin.TagPool.get(a),c=this._createTag(a);c.id=a,b.add(c),this.preload(a,{tag:c})}return new createjs.HTMLAudioPlugin.SoundInstance(a,this)},c.isPreloadStarted=function(a){return null!=this._audioSources[a]},c.preload=function(a,b){this._audioSources[a]=!0,new createjs.HTMLAudioPlugin.Loader(a,b.tag)},c.toString=function(){return"[HTMLAudioPlugin]"},createjs.HTMLAudioPlugin=a}(),function(){"use strict";function a(a,b){this._init(a,b)}var b=a.prototype=new createjs.EventDispatcher;b.src=null,b.uniqueId=-1,b.playState=null,b._owner=null,b.loaded=!1,b._offset=0,b._delay=0,b._volume=1;try{Object.defineProperty(b,"volume",{get:function(){return this._volume},set:function(a){null!=Number(a)&&(a=Math.max(0,Math.min(1,a)),this._volume=a,this._updateVolume())}})}catch(c){}b.pan=0,b._duration=0,b._remainingLoops=0,b._delayTimeoutId=null,b.tag=null,b._muted=!1,b._paused=!1,b._endedHandler=null,b._readyHandler=null,b._stalledHandler=null,b.loopHandler=null,b._init=function(a,b){this.src=a,this._owner=b,this._endedHandler=createjs.proxy(this._handleSoundComplete,this),this._readyHandler=createjs.proxy(this._handleSoundReady,this),this._stalledHandler=createjs.proxy(this._handleSoundStalled,this),this.loopHandler=createjs.proxy(this.handleSoundLoop,this)},b._sendEvent=function(a){var b=new createjs.Event(a);this.dispatchEvent(b)},b._cleanUp=function(){var a=this.tag;if(null!=a){a.pause(),a.removeEventListener(createjs.HTMLAudioPlugin._AUDIO_ENDED,this._endedHandler,!1),a.removeEventListener(createjs.HTMLAudioPlugin._AUDIO_READY,this._readyHandler,!1),a.removeEventListener(createjs.HTMLAudioPlugin._AUDIO_SEEKED,this.loopHandler,!1);try{a.currentTime=0}catch(b){}createjs.HTMLAudioPlugin.TagPool.setInstance(this.src,a),this.tag=null}clearTimeout(this._delayTimeoutId),null!=window.createjs&&createjs.Sound._playFinished(this)},b._interrupt=function(){null!=this.tag&&(this.playState=createjs.Sound.PLAY_INTERRUPTED,this._cleanUp(),this._paused=!1,this._sendEvent("interrupted"))},b.play=function(a,b,c,d,e,f){this._cleanUp(),createjs.Sound._playInstance(this,a,b,c,d,e,f)},b._beginPlaying=function(a,b,c,d){if(null==window.createjs)return-1;var e=this.tag=createjs.HTMLAudioPlugin.TagPool.getInstance(this.src);return null==e?(this.playFailed(),-1):(e.addEventListener(createjs.HTMLAudioPlugin._AUDIO_ENDED,this._endedHandler,!1),this._offset=a,this.volume=c,this.pan=d,this._updateVolume(),this._remainingLoops=b,4!==e.readyState?(e.addEventListener(createjs.HTMLAudioPlugin._AUDIO_READY,this._readyHandler,!1),e.addEventListener(createjs.HTMLAudioPlugin._AUDIO_STALLED,this._stalledHandler,!1),e.preload="auto",e.load()):this._handleSoundReady(null),this._sendEvent("succeeded"),1)},b._handleSoundStalled=function(){this._cleanUp(),this._sendEvent("failed")},b._handleSoundReady=function(){if(null!=window.createjs){if(this._duration=1e3*this.tag.duration,this.playState=createjs.Sound.PLAY_SUCCEEDED,this._paused=!1,this.tag.removeEventListener(createjs.HTMLAudioPlugin._AUDIO_READY,this._readyHandler,!1),this._offset>=this.getDuration())return this.playFailed(),void 0;this._offset>0&&(this.tag.currentTime=.001*this._offset),-1==this._remainingLoops&&(this.tag.loop=!0),0!=this._remainingLoops&&(this.tag.addEventListener(createjs.HTMLAudioPlugin._AUDIO_SEEKED,this.loopHandler,!1),this.tag.loop=!0),this.tag.play()}},b.pause=function(){return this._paused||this.playState!=createjs.Sound.PLAY_SUCCEEDED||null==this.tag?!1:(this._paused=!0,this.tag.pause(),clearTimeout(this._delayTimeoutId),!0)},b.resume=function(){return this._paused&&null!=this.tag?(this._paused=!1,this.tag.play(),!0):!1},b.stop=function(){return this._offset=0,this.pause(),this.playState=createjs.Sound.PLAY_FINISHED,this._cleanUp(),!0},b.setMasterVolume=function(){return this._updateVolume(),!0},b.setVolume=function(a){return this.volume=a,!0},b._updateVolume=function(){if(null!=this.tag){var a=this._muted||createjs.Sound._masterMute?0:this._volume*createjs.Sound._masterVolume;return a!=this.tag.volume&&(this.tag.volume=a),!0}return!1},b.getVolume=function(){return this.volume},b.setMasterMute=function(){return this._updateVolume(),!0},b.setMute=function(a){return null==a||void 0==a?!1:(this._muted=a,this._updateVolume(),!0)},b.getMute=function(){return this._muted},b.setPan=function(){return!1},b.getPan=function(){return 0},b.getPosition=function(){return null==this.tag?this._offset:1e3*this.tag.currentTime},b.setPosition=function(a){if(null==this.tag)this._offset=a;else{this.tag.removeEventListener(createjs.HTMLAudioPlugin._AUDIO_SEEKED,this.loopHandler,!1);try{this.tag.currentTime=.001*a}catch(b){return!1}this.tag.addEventListener(createjs.HTMLAudioPlugin._AUDIO_SEEKED,this.loopHandler,!1)}return!0},b.getDuration=function(){return this._duration},b._handleSoundComplete=function(){this._offset=0,null!=window.createjs&&(this.playState=createjs.Sound.PLAY_FINISHED,this._cleanUp(),this._sendEvent("complete"))},b.handleSoundLoop=function(){this._offset=0,this._remainingLoops--,0==this._remainingLoops&&(this.tag.loop=!1,this.tag.removeEventListener(createjs.HTMLAudioPlugin._AUDIO_SEEKED,this.loopHandler,!1)),this._sendEvent("loop")},b.playFailed=function(){null!=window.createjs&&(this.playState=createjs.Sound.PLAY_FAILED,this._cleanUp(),this._sendEvent("failed"))},b.toString=function(){return"[HTMLAudioPlugin SoundInstance]"},createjs.HTMLAudioPlugin.SoundInstance=a}(),function(){"use strict";function a(a,b){this._init(a,b)}var b=a.prototype;b.src=null,b.tag=null,b.preloadTimer=null,b.loadedHandler=null,b._init=function(a,b){if(this.src=a,this.tag=b,this.preloadTimer=setInterval(createjs.proxy(this.preloadTick,this),200),this.loadedHandler=createjs.proxy(this.sendLoadedEvent,this),this.tag.addEventListener&&this.tag.addEventListener("canplaythrough",this.loadedHandler),null==this.tag.onreadystatechange)this.tag.onreadystatechange=createjs.proxy(this.sendLoadedEvent,this);else{var c=this.tag.onreadystatechange;this.tag.onreadystatechange=function(){c(),this.tag.onreadystatechange=createjs.proxy(this.sendLoadedEvent,this)}
}this.tag.preload="auto",this.tag.load()},b.preloadTick=function(){var a=this.tag.buffered,b=this.tag.duration;a.length>0&&a.end(0)>=b-1&&this.handleTagLoaded()},b.handleTagLoaded=function(){clearInterval(this.preloadTimer)},b.sendLoadedEvent=function(){this.tag.removeEventListener&&this.tag.removeEventListener("canplaythrough",this.loadedHandler),this.tag.onreadystatechange=null,createjs.Sound._sendFileLoadEvent(this.src)},b.toString=function(){return"[HTMLAudioPlugin Loader]"},createjs.HTMLAudioPlugin.Loader=a}(),function(){"use strict";function a(a){this._init(a)}var b=a;b.tags={},b.get=function(c){var d=b.tags[c];return null==d&&(d=b.tags[c]=new a(c)),d},b.remove=function(a){var c=b.tags[a];return null==c?!1:(c.removeAll(),delete b.tags[a],!0)},b.removeAll=function(){for(var a in b.tags)b.tags[a].removeAll();b.tags={}},b.getInstance=function(a){var c=b.tags[a];return null==c?null:c.get()},b.setInstance=function(a,c){var d=b.tags[a];return null==d?null:d.set(c)},b.checkSrc=function(a){var c=b.tags[a];return null==c?null:(c.checkSrcChange(),void 0)};var c=a.prototype;c.src=null,c.length=0,c.available=0,c.tags=null,c._init=function(a){this.src=a,this.tags=[]},c.add=function(a){this.tags.push(a),this.length++,this.available++},c.removeAll=function(){for(;this.length--;)delete this.tags[this.length];this.src=null,this.tags.length=0},c.get=function(){if(0==this.tags.length)return null;this.available=this.tags.length;var a=this.tags.pop();return null==a.parentNode&&document.body.appendChild(a),a},c.set=function(a){var b=createjs.indexOf(this.tags,a);-1==b&&this.tags.push(a),this.available=this.tags.length},c.checkSrcChange=function(){for(var a=this.tags.length-1,b=this.tags[a].src;a--;)this.tags[a].src=b},c.toString=function(){return"[HTMLAudioPlugin TagPool]"},createjs.HTMLAudioPlugin.TagPool=a}();;/*
 * EdgeCommons
 * Dirty little Helpers for Adobe Edge
 * by Simon Widjaja
 *
 * Copyright (c) 2013 Simon Widjaja
 *
 * --------------------------------------------------------------------------------------------------------------------------------------------------
 * Released under MIT license
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR
 * OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * --------------------------------------------------------------------------------------------------------------------------------------------------
 * Additional 3rd party libraries are used. For related credits and license models take a closer look at the affected library.
 * --------------------------------------------------------------------------------------------------------------------------------------------------
 */

/*
 * Module: Spotlight
 * TODO: config for background color
 */

/**
Spotlight: Overlay for media (e.g. Images, YouTube) or external Edge Animate compositions

@module EdgeCommons
@submodule Spotlight
@main EdgeCommons
@class Spotlight
**/
(function (EC) {
    //------------------------------------
    // Constructor
    //------------------------------------
    var C = function () {
    };

    //------------------------------------
    // Public
    //------------------------------------
    C.VERSION = "1.0.0";
    
    //------------------------------------
    // Private
    //------------------------------------
    // jQuery
    var $ = EC.$;
    // Logger
    var Log = ModulogLog;
    var LOG_GROUP = "EdgeCommons | Spotlight";

    //------------------------------------
    // Methods
    //------------------------------------

    /**
    Open a spotlight overlay by passing in a configuration object
    @method open
    @param config {Object} The configuration object  
        <pre>
            var config = {
                width: 700,                                   // Width of the overlay
                height: 400,                                  // Height of the overlay
                borderWidth: 5,                               // Border width (px)
                borderColor: "#FFF",                          // Border color
                type: "image",                                // Media type (image|animate|youtube)
                source: "images/MyImage.png",                 // Source to media
                onClose: function(config, documentContext) {} // Callback for close button
                param: {}                                     // Additional parameter dependent on type (e.g. autoPlay: true for youtube)
            }
        </pre>
    @param [documentContext=window.top.document] {Object} The parent context for the spotlight overlay (e.g. window.document or window.parent.document)
    @return {Boolean} returns <code>true</code> whenever the opening of the spotlight overlay was successfull otherwise <code>false</code>
    **/    
    C.open = function(config, documentContext) {
        try {
            // Check arguments 
            if (config.type != "image" && config.type != "animate" && config.type != "youtube") {
                Log.error( "Error in open(). Unsupported type: "+config.type, LOG_GROUP );
                return;
            }
            if (documentContext == undefined) {                
                documentContext = window.top.document;
            }
            
            // Set defaults
            config.width = config.width || 400;
            config.height = config.height || 600;
            config.borderWidth = config.borderWidth || 5;
            config.borderColor = config.borderColor || "#FFF";
            
            // Add DOM elements
            var tpl = '<div id="spotlight"> <div class="background"> </div> </div>';
            $("body", documentContext).append(tpl);
            var tpl = '<div class="base"></div>';
            $("#spotlight .background", documentContext).append(tpl);
            var tpl = '<div class="close-button"></div>';
            $("#spotlight .background", documentContext).append(tpl);
            
            // Place close button
            var closeButton = $("#spotlight .close-button", documentContext);
            closeButton.css("margin-left", (0.5*config.width) - 15 + (config.borderWidth) )
                .css("margin-top", (-0.5*config.height) - 15 );
                
            // Set width and height and center
            var base = $("#spotlight .base", documentContext);
            base.css("width", 0)
                .css("height", 0)
                .css("margin-left", 0)
                .css("margin-top", 0)
                .css("border-width", config.borderWidth)
                .css("border-color", config.borderColor)
                .css("border-radius", 5);
            
            base.animate({
                    width: config.width,
                    "margin-left": -0.5 * config.width,
                    height: config.height,
                    "margin-top": -0.5 * config.height
                },
                400,
                "easeOutBack",
                function() {
                    $("#spotlight .content", documentContext).css("display", "inline");
                    $("#spotlight .fader", documentContext).fadeOut(2000);
                    $("#spotlight .close-button", documentContext).fadeIn();
                }
            );
            
            // Inject content
            base.append('<div class="content"></div>');
            var content = $("#spotlight .content", documentContext);
            
            // Base Url (if composition is running in iframe but spotlight's context is top document)
            var hrefArray = document.location.href.split("/");
            var lastHrefElement = hrefArray[ hrefArray.length-1 ];
            if (lastHrefElement.indexOf(".") != -1) { hrefArray.pop(); }
            var baseUrl = hrefArray.join("/");
            
            // Media Types
            switch (config.type) {
                case "image":
                    var src = (config.source.indexOf("http:") == -1 ) ? baseUrl + "/" + config.source : config.source;
                    content.append('<img src="'+src+'" />');                    
                    break;
                case "animate":
                    var src = (config.source.indexOf("http:") == -1 ) ? baseUrl + "/" + config.source : config.source;
                    content.append('<iframe src="'+src+'" style="overflow: hidden; width: 100%; height: 100%; margin: auto; border: 0 none;"></iframe>');                    
                    break;
                case "youtube":
                    content.append('<iframe width="'+config.width+'" height="'+config.height+'" '
                        +'src="http://www.youtube.com/embed/'+config.source+'?autoplay='+((config.param && config.param.autoPlay)?"1":"0")+'" '
                        +'frameborder="0" allowfullscreen></iframe>');
                    break;
            }

            content.append('<div class="fader"></div>');
            var fader = $("#spotlight .fader", documentContext);
            
            // On click
            $("#spotlight .background", documentContext).click( function() {
                EC.Spotlight.close( config, documentContext );
            });
            return true;
        }
        catch( err ) {
            Log.error(err.toString());
            return false;
        }
    };

    /**
    Close an existing spotlight overlay  
    (This function usually gets called by the internal close button)
    @method close
    @param [documentContext=window.top.document] {Object} The parent context for the spotlight overlay (e.g. window.document or window.parent.document)
    **/     
    C.close = function(config, documentContext) {
        if (documentContext == undefined) {                
            documentContext = window.top.document;
        }
        
        $("#spotlight .content", documentContext).remove();
        $("#spotlight .close-button", documentContext).remove();
        $("#spotlight .background", documentContext).fadeOut(400);
        
        var base = $("#spotlight .base", documentContext);
        base.animate({
                width: 0,
                "margin-left": 0,
                height: 0,
                "margin-top": 0,
                opacity: 0
            },
            400,
            "easeOutCubic",
            function() {
                $("#spotlight", documentContext).remove();
                if (typeof(config.onClose) === "function") {
                  config.onClose(config, documentContext);
                }
            }
        );        
    }
        
    //------------------------------------
    // Init
    //------------------------------------
    EC.Spotlight = C;
    //Log.debug("v" + C.VERSION, LOG_GROUP);

})(EdgeCommons);;/*
 * EdgeCommons
 * Dirty little Helpers for Adobe Edge
 * by Simon Widjaja
 *
 * Copyright (c) 2013 Simon Widjaja
 *
 * --------------------------------------------------------------------------------------------------------------------------------------------------
 * Released under MIT license
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR
 * OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * --------------------------------------------------------------------------------------------------------------------------------------------------
 * Additional 3rd party libraries are used. For related credits and license models take a closer look at the affected library.
 * --------------------------------------------------------------------------------------------------------------------------------------------------
 */

/*
 * Module: SVG
 */

/**
SVG: Interactive SVG within you Edge Animate compositions

@module EdgeCommons
@submodule SVG
@main EdgeCommons
@class SVG
**/
(function (EC) {
    //------------------------------------
    // Constructor
    //------------------------------------
    var C = function () {
    };

    //------------------------------------
    // Public
    //------------------------------------
    C.VERSION = "1.0.0";
    
    //------------------------------------
    // Private
    //------------------------------------
    // jQuery
    var $ = EC.$;
    // Logger
    var Log = ModulogLog;
    var LOG_GROUP = "EdgeCommons | SVG";

    //------------------------------------
    // Methods
    //------------------------------------  
    /**
    Convert SVG to be accessible
        <pre>
		EC.SVG.accessSVG( sym.$("pie") )
			.done(function(svgDocument, svgElement, uniqueId){
				EC.debug("DONE");
				var el = svgDocument.getElementById("Cyan");
				$(el).attr({fill: "#000"});
				$(el).click(function(){
					alert("DYNAMIC CLICK ON INNER PATH");
				});				
			});  
        </pre>
    **/
    C.accessSVG = function(element) {
        if (element.is("div")) {
			var imgSrc = element.css("background-image").replace("url(","").replace(")","");
			// Remove "" in IE
			imgSrc = imgSrc.replace("\"", "");
		}
        else if (element.is("img")) {
			var imgSrc = element.attr("src");
		}
		//TODO: Check if is SVG

		// Replace with real SVG
		// TODO: improve flicker (maybe set invisible during loading and wait for complete)
		element.css("background-image", "");
        var uniqueId = "ec_"+Math.random().toString(36).substring(7);
		element.append('<embed id="'+uniqueId+'" src="'+imgSrc+'" type="image/svg+xml" width="100%" height="100%" />');
        
		// Create promise
		var promise = new jQuery.Deferred();

		// Wait for Embed to be loaded
		//var embed = jQuery("#svgEmbed");
        
        var svgElement = document.getElementById(uniqueId);

		svgElement.onload = function() {
            var svgDocument = svgElement.getSVGDocument();
            // Update (Inject notify function. Makes svg.js obsolete)
            svgDocument.notify = function (ref, type) {
                 var event = document.createEvent("CustomEvent");
                 event.initEvent(type,true,true);
                 ref.dispatchEvent(event);
            }
			// TODO return id
			promise.resolve( svgDocument, svgElement, uniqueId );
		};
        
        return promise;
    }
        
    //------------------------------------
    // Init
    //------------------------------------
    EC.SVG = C;
    //Log.debug("v" + C.VERSION, LOG_GROUP);

})(EdgeCommons);