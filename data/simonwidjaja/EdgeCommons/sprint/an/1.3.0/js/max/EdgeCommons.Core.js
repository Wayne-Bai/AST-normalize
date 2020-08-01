// EdgeCommons for Edge Animate v1.3.0 +++ Visit edgecommons.org for documentation, updates and examples +++ Copyright (c) 2013 by Simon Widjaja +++ Distributed under the terms of the MIT license (http://www.opensource.org/licenses/mit-license.html) +++ This notice shall be included in all copies or substantial portions of the Software.

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
    EdgeCommons.VERSION = "1.3.0";
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
            el.html('<iframe id="'+uniqueId+'" src="'+src+'" style="overflow: hidden; width: 100%; height: 100%; margin: auto; border: 0 none; background-color: rgba(255,255,255,0)"></iframe>');
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


})(EdgeCommons);