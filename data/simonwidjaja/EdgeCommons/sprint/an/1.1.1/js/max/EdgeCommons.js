// EdgeCommons for Edge Animate v1.1.1 +++ Visit edgecommons.org for documentation, updates and examples +++ Copyright (c) 2013 by Simon Widjaja +++ Distributed under the terms of the MIT license (http://www.opensource.org/licenses/mit-license.html) +++ This notice shall be included in all copies or substantial portions of the Software.

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
    EdgeCommons.VERSION = "1.1.1";
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
    EC.makeStaticButton = function(sym, label, icon, clickHandler) {
        // Search for optional element "hotspot"
        var hotspot = sym.$("hotspot");
		var hs$ = (hotspot[0]) ? hotspot : sym.getSymbolElement();
		label && sym.$("label").html(label);
        icon && sym.$("icon").css("background-image", "url("+icon+")");
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
			(typeof(clickHandler) === "function") && clickHandler();
		});
	}    

    /**
     * makeAnimatedButton
     * EXAMPLE:
     * TODO
     * Touch enabled
     */
    EC.makeAnimatedButton = function(sym, label, icon, clickHandler) {
        // Search for optional element "hotspot"
        var hotspot = sym.$("hotspot");        
		var hs$ = (hotspot[0]) ? hotspot : sym.getSymbolElement();
		label && sym.$("label").html(label);
        icon && sym.$("icon").css("background-image", "url("+icon+")");
		hs$.css("cursor", "pointer");
        if (!EC.isMobile()) {
            hs$.on("mouseenter", function(e) {
                sym.play();
            });
            hs$.on("mouseleave", function(e) {
                sym.playReverse();
            });
            hs$.on("click", function(e) {
                (typeof(clickHandler) === "function") && clickHandler();
            });            
        }
        else {
            // Initially set state to inactive
            sym.setVariable("animatedButtonState", "inactive");
            hs$.on("touchstart", function(e) {
                var isActive = (sym.getVariable("animatedButtonState") !== "inactive" );
                if (isActive) {
                    (typeof(clickHandler) === "function") && clickHandler();
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

        // e.g. in compositionReady event
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

/**
* SoundJS
* Visit http://createjs.com/ for documentation, updates and examples.
*
* Copyright (c) 2011 gskinner.com, inc.
* 
* Distributed under the terms of the MIT license.
* http://www.opensource.org/licenses/mit-license.html
*
* This notice shall be included in all copies or substantial portions of the Software.
**/

this.createjs=this.createjs||{};
(function(){var a=function(){this.initialize()},d=a.prototype;a.initialize=function(a){a.addEventListener=d.addEventListener;a.removeEventListener=d.removeEventListener;a.removeAllEventListeners=d.removeAllEventListeners;a.hasEventListener=d.hasEventListener;a.dispatchEvent=d.dispatchEvent};d._listeners=null;d.initialize=function(){};d.addEventListener=function(a,c){var b=this._listeners;b?this.removeEventListener(a,c):b=this._listeners={};var e=b[a];e||(e=b[a]=[]);e.push(c);return c};d.removeEventListener=
function(a,c){var b=this._listeners;if(b){var e=b[a];if(e)for(var k=0,f=e.length;k<f;k++)if(e[k]==c){1==f?delete b[a]:e.splice(k,1);break}}};d.removeAllEventListeners=function(a){a?this._listeners&&delete this._listeners[a]:this._listeners=null};d.dispatchEvent=function(a,c){var b=!1,e=this._listeners;if(a&&e){"string"==typeof a&&(a={type:a});a.target=c||this;e=e[a.type];if(!e)return b;for(var e=e.slice(),k=0,f=e.length;k<f;k++){var g=e[k];g instanceof Function?b=b||g.apply(null,[a]):g.handleEvent&&
(b=b||g.handleEvent(a))}}return!!b};d.hasEventListener=function(a){var c=this._listeners;return!(!c||!c[a])};d.toString=function(){return"[EventDispatcher]"};createjs.EventDispatcher=a})();this.createjs=this.createjs||{};
(function(){function a(){throw"Sound cannot be instantiated";}function d(b,a){this.init(b,a)}function l(){}a.DELIMITER="|";a.AUDIO_TIMEOUT=8E3;a.INTERRUPT_ANY="any";a.INTERRUPT_EARLY="early";a.INTERRUPT_LATE="late";a.INTERRUPT_NONE="none";a.PLAY_INITED="playInited";a.PLAY_SUCCEEDED="playSucceeded";a.PLAY_INTERRUPTED="playInterrupted";a.PLAY_FINISHED="playFinished";a.PLAY_FAILED="playFailed";a.SUPPORTED_EXTENSIONS="mp3 ogg mpeg wav m4a mp4 aiff wma mid".split(" ");a.EXTENSION_MAP={m4a:"mp4"};a.FILE_PATTERN=
/(\w+:\/{2})?((?:\w+\.){2}\w+)?(\/?[\S]+\/|\/)?([\w\-%\.]+)(?:\.)(\w+)?(\?\S+)?/i;a.defaultInterruptBehavior=a.INTERRUPT_NONE;a.lastId=0;a.activePlugin=null;a.pluginsRegistered=!1;a.masterVolume=1;a.masterMute=!1;a.instances=[];a.idHash={};a.preloadHash={};a.defaultSoundInstance=null;a.addEventListener=null;a.removeEventListener=null;a.removeAllEventListeners=null;a.dispatchEvent=null;a.hasEventListener=null;a._listeners=null;createjs.EventDispatcher.initialize(a);a.onLoadComplete=null;a.sendLoadComplete=
function(b){if(a.preloadHash[b])for(var e=0,c=a.preloadHash[b].length;e<c;e++){var f=a.preloadHash[b][e],f={target:this,type:"loadComplete",src:f.src,id:f.id,data:f.data};a.preloadHash[b][e]=!0;a.onLoadComplete&&a.onLoadComplete(f);a.dispatchEvent(f)}};a.getPreloadHandlers=function(){return{callback:createjs.proxy(a.initLoad,a),types:["sound"],extensions:a.SUPPORTED_EXTENSIONS}};a.registerPlugin=function(b){a.pluginsRegistered=!0;return null==b?!1:b.isSupported()?(a.activePlugin=new b,!0):!1};a.registerPlugins=
function(b){for(var e=0,c=b.length;e<c;e++)if(a.registerPlugin(b[e]))return!0;return!1};a.initializeDefaultPlugins=function(){return null!=a.activePlugin?!0:a.pluginsRegistered?!1:a.registerPlugins([createjs.WebAudioPlugin,createjs.HTMLAudioPlugin])?!0:!1};a.isReady=function(){return null!=a.activePlugin};a.getCapabilities=function(){return null==a.activePlugin?null:a.activePlugin.capabilities};a.getCapability=function(b){return null==a.activePlugin?null:a.activePlugin.capabilities[b]};a.initLoad=
function(b,e,c,f){b=a.registerSound(b,c,f,!1);return null==b?!1:b};a.registerSound=function(b,e,c,f){if(!a.initializeDefaultPlugins())return!1;b instanceof Object&&(b=b.src,e=b.id,c=b.data);var g=a.parsePath(b,"sound",e,c);if(null==g)return!1;null!=e&&(a.idHash[e]=g.src);var j=null;null!=c&&(isNaN(c.channels)?isNaN(c)||(j=parseInt(c)):j=parseInt(c.channels));var h=a.activePlugin.register(g.src,j);null!=h&&(null!=h.numChannels&&(j=h.numChannels),d.create(g.src,j),null==c||!isNaN(c)?c=g.data=j||d.maxPerChannel():
c.channels=g.data.channels=j||d.maxPerChannel(),null!=h.tag?g.tag=h.tag:h.src&&(g.src=h.src),null!=h.completeHandler&&(g.completeHandler=h.completeHandler),g.type=h.type);!1!=f&&(a.preloadHash[g.src]||(a.preloadHash[g.src]=[]),a.preloadHash[g.src].push({src:b,id:e,data:c}),1==a.preloadHash[g.src].length&&a.activePlugin.preload(g.src,h));return g};a.registerManifest=function(b){for(var a=[],c=0,f=b.length;c<f;c++)a[c]=createjs.Sound.registerSound(b[c].src,b[c].id,b[c].data,b[c].preload);return a};
a.loadComplete=function(b){var e=a.parsePath(b,"sound");b=e?a.getSrcById(e.src):a.getSrcById(b);return!0==a.preloadHash[b][0]};a.parsePath=function(b,e,c,f){"string"!=typeof b&&(b=b.toString());b=b.split(a.DELIMITER);e={type:e||"sound",id:c,data:f};c=a.getCapabilities();f=0;for(var g=b.length;f<g;f++){var d=b[f],h=d.match(a.FILE_PATTERN);if(null==h)return!1;var l=h[4],h=h[5];if(c[h]&&-1<a.SUPPORTED_EXTENSIONS.indexOf(h))return e.name=l,e.src=d,e.extension=h,e}return null};a.play=function(b,e,c,f,
g,d,h){b=a.createInstance(b);a.playInstance(b,e,c,f,g,d,h)||b.playFailed();return b};a.createInstance=function(b){if(!a.initializeDefaultPlugins())return a.defaultSoundInstance;var e=a.parsePath(b,"sound");b=e?a.getSrcById(e.src):a.getSrcById(b);var e=b.lastIndexOf("."),c=b.slice(e+1);-1!=e&&-1<a.SUPPORTED_EXTENSIONS.indexOf(c)?(d.create(b),b=a.activePlugin.create(b)):b=a.defaultSoundInstance;b.uniqueId=a.lastId++;return b};a.setVolume=function(b){if(null==Number(b))return!1;b=Math.max(0,Math.min(1,
b));a.masterVolume=b;if(!this.activePlugin||!this.activePlugin.setVolume||!this.activePlugin.setVolume(b))for(var e=this.instances,c=0,f=e.length;c<f;c++)e[c].setMasterVolume(b)};a.getVolume=function(){return a.masterVolume};a.mute=function(b){this.masterMute=b;if(!this.activePlugin||!this.activePlugin.setMute||!this.activePlugin.setMute(b))for(var a=this.instances,c=0,f=a.length;c<f;c++)a[c].setMasterMute(b)};a.setMute=function(b){if(null==b||void 0==b)return!1;this.masterMute=b;if(!this.activePlugin||
!this.activePlugin.setMute||!this.activePlugin.setMute(b))for(var a=this.instances,c=0,f=a.length;c<f;c++)a[c].setMasterMute(b);return!0};a.getMute=function(){return this.masterMute};a.stop=function(){for(var b=this.instances,a=b.length;0<a;a--)b[a-1].stop()};a.playInstance=function(b,c,k,f,g,d,h){c=c||a.defaultInterruptBehavior;null==k&&(k=0);null==f&&(f=b.getPosition());null==g&&(g=0);null==d&&(d=b.getVolume());null==h&&(h=b.getPan());if(0==k){if(!a.beginPlaying(b,c,f,g,d,h))return!1}else k=setTimeout(function(){a.beginPlaying(b,
c,f,g,d,h)},k),b.delayTimeoutId=k;this.instances.push(b);return!0};a.beginPlaying=function(b,a,c,f,g,j){return!d.add(b,a)?!1:!b.beginPlaying(c,f,g,j)?(b=this.instances.indexOf(b),-1<b&&this.instances.splice(b,1),!1):!0};a.getSrcById=function(b){return null==a.idHash||null==a.idHash[b]?b:a.idHash[b]};a.playFinished=function(b){d.remove(b);b=this.instances.indexOf(b);-1<b&&this.instances.splice(b,1)};a.proxy=function(b,a){return function(){return b.apply(a,arguments)}};createjs.Sound=a;createjs.proxy=
function(b,a){var c=Array.prototype.slice.call(arguments,2);return function(){return b.apply(a,Array.prototype.slice.call(arguments,0).concat(c))}};d.channels={};d.create=function(b,a){return null==d.get(b)?(d.channels[b]=new d(b,a),!0):!1};d.add=function(b,a){var c=d.get(b.src);return null==c?!1:c.add(b,a)};d.remove=function(b){var a=d.get(b.src);if(null==a)return!1;a.remove(b);return!0};d.maxPerChannel=function(){return c.maxDefault};d.get=function(b){return d.channels[b]};var c=d.prototype={src:null,
max:null,maxDefault:100,length:0,init:function(b,a){this.src=b;this.max=a||this.maxDefault;-1==this.max&&this.max==this.maxDefault;this.instances=[]},get:function(b){return this.instances[b]},add:function(b,a){if(!this.getSlot(a,b))return!1;this.instances.push(b);this.length++;return!0},remove:function(b){b=this.instances.indexOf(b);if(-1==b)return!1;this.instances.splice(b,1);this.length--;return!0},getSlot:function(b){for(var c,d,f=0,g=this.max;f<g;f++){c=this.get(f);if(null==c)return!0;if(!(b==
a.INTERRUPT_NONE&&c.playState!=a.PLAY_FINISHED))if(0==f)d=c;else if(c.playState==a.PLAY_FINISHED||c==a.PLAY_INTERRUPTED||c==a.PLAY_FAILED)d=c;else if(b==a.INTERRUPT_EARLY&&c.getPosition()<d.getPosition()||b==a.INTERRUPT_LATE&&c.getPosition()>d.getPosition())d=c}return null!=d?(d.interrupt(),this.remove(d),!0):!1},toString:function(){return"[Sound SoundChannel]"}};a.defaultSoundInstance=new function(){this.isDefault=!0;this.addEventListener=this.removeEventListener=this.removeAllEventListener=this.dispatchEvent=
this.hasEventListener=this._listeners=this.interrupt=this.playFailed=this.pause=this.resume=this.play=this.beginPlaying=this.cleanUp=this.stop=this.setMasterVolume=this.setVolume=this.mute=this.setMute=this.getMute=this.setPan=this.getPosition=this.setPosition=function(){return!1};this.getVolume=this.getPan=this.getDuration=function(){return 0};this.playState=a.PLAY_FAILED;this.toString=function(){return"[Sound Default Sound Instance]"}};l.init=function(){var b=navigator.userAgent;l.isFirefox=-1<
b.indexOf("Firefox");l.isOpera=null!=window.opera;l.isChrome=-1<b.indexOf("Chrome");l.isIOS=-1<b.indexOf("iPod")||-1<b.indexOf("iPhone")||-1<b.indexOf("iPad");l.isAndroid=-1<b.indexOf("Android");l.isBlackberry=-1<b.indexOf("Blackberry")};l.init();createjs.Sound.BrowserDetect=l})();this.createjs=this.createjs||{};
(function(){function a(){this.init()}function d(a,b){this.init(a,b)}function l(a,b){this.init(a,b)}a.capabilities=null;a.isSupported=function(){if("file:"==location.protocol)return!1;a.generateCapabilities();return null==a.context?!1:!0};a.generateCapabilities=function(){if(null==a.capabilities){var c=document.createElement("audio");if(null==c.canPlayType)return null;if(window.webkitAudioContext)a.context=new webkitAudioContext;else if(window.AudioContext)a.context=new AudioContext;else return null;
a.capabilities={panning:!0,volume:!0,tracks:-1};for(var b=createjs.Sound.SUPPORTED_EXTENSIONS,e=createjs.Sound.EXTENSION_MAP,d=0,f=b.length;d<f;d++){var g=b[d],j=e[g]||g;a.capabilities[g]="no"!=c.canPlayType("audio/"+g)&&""!=c.canPlayType("audio/"+g)||"no"!=c.canPlayType("audio/"+j)&&""!=c.canPlayType("audio/"+j)}2>a.context.destination.numberOfChannels&&(a.capabilities.panning=!1);a.dynamicsCompressorNode=a.context.createDynamicsCompressor();a.dynamicsCompressorNode.connect(a.context.destination);
a.gainNode=a.context.createGainNode();a.gainNode.connect(a.dynamicsCompressorNode)}};a.prototype={capabilities:null,volume:1,context:null,dynamicsCompressorNode:null,gainNode:null,arrayBuffers:null,init:function(){this.capabilities=a.capabilities;this.arrayBuffers={};this.context=a.context;this.gainNode=a.gainNode;this.dynamicsCompressorNode=a.dynamicsCompressorNode},register:function(a){this.arrayBuffers[a]=!0;return{tag:new l(a,this)}},isPreloadStarted:function(a){return null!=this.arrayBuffers[a]},
isPreloadComplete:function(a){return!(null==this.arrayBuffers[a]||!0==this.arrayBuffers[a])},removeFromPreload:function(a){delete this.arrayBuffers[a]},addPreloadResults:function(a,b){this.arrayBuffers[a]=b},handlePreloadComplete:function(){createjs.Sound.sendLoadComplete(this.src)},preload:function(a){this.arrayBuffers[a]=!0;a=new l(a,this);a.onload=this.handlePreloadComplete;a.load()},create:function(a){this.isPreloadStarted(a)||this.preload(a);return new d(a,this)},setVolume:function(a){this.volume=
a;this.updateVolume();return!0},updateVolume:function(){var a=createjs.Sound.masterMute?0:this.volume;a!=this.gainNode.gain.value&&(this.gainNode.gain.value=a)},getVolume:function(){return this.volume},setMute:function(){this.updateVolume();return!0},toString:function(){return"[WebAudioPlugin]"}};createjs.WebAudioPlugin=a;d.prototype={src:null,uniqueId:-1,playState:null,owner:null,offset:0,delay:0,volume:1,pan:0,duration:0,remainingLoops:0,delayTimeoutId:null,soundCompleteTimeout:null,panNode:null,
gainNode:null,sourceNode:null,muted:!1,paused:!1,startTime:0,addEventListener:null,removeEventListener:null,removeAllEventListeners:null,dispatchEvent:null,hasEventListener:null,_listeners:null,endedHandler:null,readyHandler:null,stalledHandler:null,onReady:null,onPlaySucceeded:null,onPlayInterrupted:null,onPlayFailed:null,onComplete:null,onLoop:null,sendEvent:function(a){this.dispatchEvent({target:this,type:a})},init:function(a,b){this.owner=b;this.src=a;this.panNode=this.owner.context.createPanner();
this.gainNode=this.owner.context.createGainNode();this.gainNode.connect(this.panNode);this.owner.isPreloadComplete(this.src)&&(this.duration=1E3*this.owner.arrayBuffers[this.src].duration);this.endedHandler=createjs.proxy(this.handleSoundComplete,this);this.readyHandler=createjs.proxy(this.handleSoundReady,this);this.stalledHandler=createjs.proxy(this.handleSoundStalled,this)},cleanUp:function(){this.sourceNode&&this.sourceNode.playbackState!=this.sourceNode.UNSCHEDULED_STATE&&(this.sourceNode.noteOff(0),
this.sourceNode=null);0!=this.panNode.numberOfOutputs&&this.panNode.disconnect(0);clearTimeout(this.delayTimeoutId);clearTimeout(this.soundCompleteTimeout);null!=window.createjs&&createjs.Sound.playFinished(this)},interrupt:function(){this.playState=createjs.Sound.PLAY_INTERRUPTED;if(this.onPlayInterrupted)this.onPlayInterrupted(this);this.sendEvent("interrupted");this.cleanUp();this.paused=!1},handleSoundStalled:function(){if(null!=this.onPlayFailed)this.onPlayFailed(this);this.sendEvent("failed")},
handleSoundReady:function(){null!=window.createjs&&(this.offset>this.getDuration()?this.playFailed():(0>this.offset&&(this.offset=0),this.playState=createjs.Sound.PLAY_SUCCEEDED,this.paused=!1,this.panNode.connect(this.owner.gainNode),this.sourceNode=this.owner.context.createBufferSource(),this.sourceNode.buffer=this.owner.arrayBuffers[this.src],this.duration=1E3*this.owner.arrayBuffers[this.src].duration,this.sourceNode.connect(this.gainNode),this.soundCompleteTimeout=setTimeout(this.endedHandler,
1E3*(this.sourceNode.buffer.duration-this.offset)),this.startTime=this.owner.context.currentTime-this.offset,this.sourceNode.noteGrainOn(0,this.offset,this.sourceNode.buffer.duration-this.offset)))},play:function(a,b,e,d,f,g){this.cleanUp();createjs.Sound.playInstance(this,a,b,e,d,f,g)},beginPlaying:function(a,b,e,d){if(null!=window.createjs&&this.src){this.offset=a/1E3;this.remainingLoops=b;this.setVolume(e);this.setPan(d);if(this.owner.isPreloadComplete(this.src))return this.handleSoundReady(null),
this.onPlaySucceeded&&this.onPlaySucceeded(this),this.sendEvent("succeeded"),1;this.playFailed()}},pause:function(){return!this.paused&&this.playState==createjs.Sound.PLAY_SUCCEEDED?(this.paused=!0,this.offset=this.owner.context.currentTime-this.startTime,this.sourceNode.noteOff(0),0!=this.panNode.numberOfOutputs&&this.panNode.disconnect(),clearTimeout(this.delayTimeoutId),clearTimeout(this.soundCompleteTimeout),!0):!1},resume:function(){if(!this.paused)return!1;this.handleSoundReady(null);return!0},
stop:function(){this.playState=createjs.Sound.PLAY_FINISHED;this.cleanUp();this.offset=0;return!0},setVolume:function(a){if(null==Number(a))return!1;this.volume=a=Math.max(0,Math.min(1,a));this.updateVolume();return!0},updateVolume:function(){var a=this.muted?0:this.volume;return a!=this.gainNode.gain.value?(this.gainNode.gain.value=a,!0):!1},getVolume:function(){return this.volume},mute:function(a){this.muted=a;this.updateVolume();return!0},setMute:function(a){if(null==a||void 0==a)return!1;this.muted=
a;this.updateVolume();return!0},getMute:function(){return this.muted},setPan:function(a){if(this.owner.capabilities.panning)this.panNode.setPosition(a,0,-0.5),this.pan=a;else return!1},getPan:function(){return this.pan},getPosition:function(){return 1E3*(this.paused||null==this.sourceNode?this.offset:this.owner.context.currentTime-this.startTime)},setPosition:function(a){this.offset=a/1E3;this.sourceNode&&this.sourceNode.playbackState!=this.sourceNode.UNSCHEDULED_STATE&&(this.sourceNode.noteOff(0),
clearTimeout(this.soundCompleteTimeout));!this.paused&&this.playState==createjs.Sound.PLAY_SUCCEEDED&&this.handleSoundReady(null);return!0},getDuration:function(){return this.duration},handleSoundComplete:function(){this.offset=0;if(0!=this.remainingLoops){this.remainingLoops--;this.handleSoundReady(null);if(null!=this.onLoop)this.onLoop(this);this.sendEvent("loop")}else if(null!=window.createjs){this.playState=createjs.Sound.PLAY_FINISHED;if(null!=this.onComplete)this.onComplete(this);this.sendEvent("complete");
this.cleanUp()}},playFailed:function(){if(null!=window.createjs){this.playState=createjs.Sound.PLAY_FAILED;if(null!=this.onPlayFailed)this.onPlayFailed(this);this.sendEvent("failed");this.cleanUp()}},toString:function(){return"[WebAudioPlugin SoundInstance]"}};createjs.EventDispatcher.initialize(d.prototype);l.prototype={request:null,owner:null,progress:-1,src:null,result:null,onload:null,onprogress:null,onError:null,init:function(a,b){this.src=a;this.owner=b},load:function(a){null!=a&&(this.src=
a);this.request=new XMLHttpRequest;this.request.open("GET",this.src,!0);this.request.responseType="arraybuffer";this.request.onload=createjs.proxy(this.handleLoad,this);this.request.onError=createjs.proxy(this.handleError,this);this.request.onprogress=createjs.proxy(this.handleProgress,this);this.request.send()},handleProgress:function(a,b){this.progress=a/b;if(null!=this.onprogress)this.onprogress({loaded:a,total:b,progress:this.progress})},handleLoad:function(){a.context.decodeAudioData(this.request.response,
createjs.proxy(this.handleAudioDecoded,this),createjs.proxy(this.handleError,this))},handleAudioDecoded:function(a){this.progress=1;this.result=a;this.owner.addPreloadResults(this.src,this.result);this.onload&&this.onload()},handleError:function(a){this.owner.removeFromPreload(this.src);this.onerror&&this.onerror(a)},toString:function(){return"[WebAudioPlugin WebAudioLoader]"}}})();this.createjs=this.createjs||{};
(function(){function a(){this.init()}function d(a,c){this.init(a,c)}function l(a,c){this.init(a,c)}function c(a){this.init(a)}a.MAX_INSTANCES=30;a.capabilities=null;a.AUDIO_READY="canplaythrough";a.AUDIO_ENDED="ended";a.AUDIO_ERROR="error";a.AUDIO_STALLED="stalled";a.isSupported=function(){if(createjs.Sound.BrowserDetect.isIOS)return!1;a.generateCapabilities();return null==a.tag||null==a.capabilities?!1:!0};a.generateCapabilities=function(){if(null==a.capabilities){var b=a.tag=document.createElement("audio");
if(null==b.canPlayType)return null;a.capabilities={panning:!0,volume:!0,tracks:-1};for(var c=createjs.Sound.SUPPORTED_EXTENSIONS,d=createjs.Sound.EXTENSION_MAP,f=0,g=c.length;f<g;f++){var j=c[f],h=d[j]||j;a.capabilities[j]="no"!=b.canPlayType("audio/"+j)&&""!=b.canPlayType("audio/"+j)||"no"!=b.canPlayType("audio/"+h)&&""!=b.canPlayType("audio/"+h)}}};a.prototype={capabilities:null,audioSources:null,defaultNumChannels:2,init:function(){this.capabilities=a.capabilities;this.audioSources={}},register:function(a,
e){this.audioSources[a]=!0;for(var d=c.get(a),f=null,g=e||this.defaultNumChannels,j=0;j<g;j++)f=this.createTag(a),d.add(f);return{tag:f,numChannels:g}},createTag:function(a){var c=document.createElement("audio");c.autoplay=!1;c.preload="none";c.src=a;return c},create:function(a){if(!this.isPreloadStarted(a)){var e=c.get(a),k=this.createTag(a);e.add(k);this.preload(a,{tag:k})}return new d(a,this)},isPreloadStarted:function(a){return null!=this.audioSources[a]},preload:function(a,c){this.audioSources[a]=
!0;new l(a,c.tag)},toString:function(){return"[HTMLAudioPlugin]"}};createjs.HTMLAudioPlugin=a;d.prototype={src:null,uniqueId:-1,playState:null,owner:null,loaded:!1,offset:0,delay:0,volume:1,pan:0,duration:0,remainingLoops:0,delayTimeoutId:null,tag:null,muted:!1,paused:!1,addEventListener:null,removeEventListener:null,removeAllEventListeners:null,dispatchEvent:null,hasEventListener:null,_listeners:null,onComplete:null,onLoop:null,onReady:null,onPlayFailed:null,onPlayInterrupted:null,onPlaySucceeded:null,
endedHandler:null,readyHandler:null,stalledHandler:null,init:function(a,c){this.src=a;this.owner=c;this.endedHandler=createjs.proxy(this.handleSoundComplete,this);this.readyHandler=createjs.proxy(this.handleSoundReady,this);this.stalledHandler=createjs.proxy(this.handleSoundStalled,this)},sendEvent:function(a){this.dispatchEvent({target:this,type:a})},cleanUp:function(){var a=this.tag;if(null!=a){a.pause();try{a.currentTime=0}catch(e){}a.removeEventListener(createjs.HTMLAudioPlugin.AUDIO_ENDED,this.endedHandler,
!1);a.removeEventListener(createjs.HTMLAudioPlugin.AUDIO_READY,this.readyHandler,!1);c.setInstance(this.src,a);this.tag=null}clearTimeout(this.delayTimeoutId);null!=window.createjs&&createjs.Sound.playFinished(this)},interrupt:function(){if(null!=this.tag){this.playState=createjs.Sound.PLAY_INTERRUPTED;if(this.onPlayInterrupted)this.onPlayInterrupted(this);this.sendEvent("interrupted");this.cleanUp();this.paused=!1}},play:function(a,c,d,f,g,j){this.cleanUp();createjs.Sound.playInstance(this,a,c,d,
f,g,j)},beginPlaying:function(a,e,d){if(null==window.createjs)return-1;var f=this.tag=c.getInstance(this.src);if(null==f)return this.playFailed(),-1;this.duration=1E3*this.tag.duration;f.addEventListener(createjs.HTMLAudioPlugin.AUDIO_ENDED,this.endedHandler,!1);this.offset=a;this.volume=d;this.updateVolume();this.remainingLoops=e;4!==f.readyState?(f.addEventListener(createjs.HTMLAudioPlugin.AUDIO_READY,this.readyHandler,!1),f.addEventListener(createjs.HTMLAudioPlugin.AUDIO_STALLED,this.stalledHandler,
!1),f.load()):this.handleSoundReady(null);this.onPlaySucceeded&&this.onPlaySucceeded(this);this.sendEvent("succeeded");return 1},handleSoundStalled:function(){if(null!=this.onPlayFailed)this.onPlayFailed(this);this.sendEvent("failed");this.cleanUp()},handleSoundReady:function(){null!=window.createjs&&(this.playState=createjs.Sound.PLAY_SUCCEEDED,this.paused=!1,this.tag.removeEventListener(createjs.HTMLAudioPlugin.AUDIO_READY,this.readyHandler,!1),this.offset>=this.getDuration()?this.playFailed():
(0<this.offset&&(this.tag.currentTime=0.0010*this.offset),-1==this.remainingLoops&&(this.tag.loop=!0),this.tag.play()))},pause:function(){return!this.paused&&this.playState==createjs.Sound.PLAY_SUCCEEDED&&null!=this.tag?(this.paused=!0,this.tag.pause(),clearTimeout(this.delayTimeoutId),!0):!1},resume:function(){if(!this.paused||null==this.tag)return!1;this.paused=!1;this.tag.play();return!0},stop:function(){this.offset=0;this.pause();this.playState=createjs.Sound.PLAY_FINISHED;this.cleanUp();return!0},
setMasterVolume:function(){this.updateVolume();return!0},setVolume:function(a){if(null==Number(a))return!1;this.volume=a=Math.max(0,Math.min(1,a));this.updateVolume();return!0},updateVolume:function(){if(null!=this.tag){var a=this.muted||createjs.Sound.masterMute?0:this.volume*createjs.Sound.masterVolume;a!=this.tag.volume&&(this.tag.volume=a);return!0}return!1},getVolume:function(){return this.volume},mute:function(a){this.muted=a;this.updateVolume();return!0},setMasterMute:function(){this.updateVolume();
return!0},setMute:function(a){if(null==a||void 0==a)return!1;this.muted=a;this.updateVolume();return!0},getMute:function(){return this.muted},setPan:function(){return!1},getPan:function(){return 0},getPosition:function(){return null==this.tag?this.offset:1E3*this.tag.currentTime},setPosition:function(a){if(null==this.tag)this.offset=a;else try{this.tag.currentTime=0.0010*a}catch(c){return!1}return!0},getDuration:function(){return this.duration},handleSoundComplete:function(){this.offset=0;if(0!=this.remainingLoops){this.remainingLoops--;
this.tag.play();if(null!=this.onLoop)this.onLoop(this);this.sendEvent("loop")}else if(null!=window.createjs){this.playState=createjs.Sound.PLAY_FINISHED;if(null!=this.onComplete)this.onComplete(this);this.sendEvent("complete");this.cleanUp()}},playFailed:function(){if(null!=window.createjs){this.playState=createjs.Sound.PLAY_FAILED;if(null!=this.onPlayFailed)this.onPlayFailed(this);this.sendEvent("failed");this.cleanUp()}},toString:function(){return"[HTMLAudioPlugin SoundInstance]"}};createjs.EventDispatcher.initialize(d.prototype);
l.prototype={src:null,tag:null,preloadTimer:null,loadedHandler:null,init:function(a,c){this.src=a;this.tag=c;this.preloadTimer=setInterval(createjs.proxy(this.preloadTick,this),200);this.loadedHandler=createjs.proxy(this.sendLoadedEvent,this);this.tag.addEventListener&&this.tag.addEventListener("canplaythrough",this.loadedHandler);this.tag.onreadystatechange=createjs.proxy(this.sendLoadedEvent,this);this.tag.preload="auto";this.tag.src=a;this.tag.load()},preloadTick:function(){var a=this.tag.buffered,
c=this.tag.duration;0<a.length&&a.end(0)>=c-1&&this.handleTagLoaded()},handleTagLoaded:function(){clearInterval(this.preloadTimer)},sendLoadedEvent:function(){this.tag.removeEventListener&&this.tag.removeEventListener("canplaythrough",this.loadedHandler);this.tag.onreadystatechange=null;createjs.Sound.sendLoadComplete(this.src)},toString:function(){return"[HTMLAudioPlugin HTMLAudioLoader]"}};c.tags={};c.get=function(a){var d=c.tags[a];null==d&&(d=c.tags[a]=new c(a));return d};c.getInstance=function(a){a=
c.tags[a];return null==a?null:a.get()};c.setInstance=function(a,d){var k=c.tags[a];return null==k?null:k.set(d)};c.prototype={src:null,length:0,available:0,tags:null,init:function(a){this.src=a;this.tags=[]},add:function(a){this.tags.push(a);this.length++;this.available++},get:function(){if(0==this.tags.length)return null;this.available=this.tags.length;var a=this.tags.pop();null==a.parentNode&&document.body.appendChild(a);return a},set:function(a){-1==this.tags.indexOf(a)&&this.tags.push(a);this.available=
this.tags.length},toString:function(){return"[HTMLAudioPlugin TagPool]"}}})();(function(){var a=this.createjs=this.createjs||{},a=a.SoundJS=a.SoundJS||{};a.version="0.4.0";a.buildDate="Tue, 12 Feb 2013 21:11:51 GMT"})();;/*
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
                width: 700,                     // Width of the overlay
                height: 400,                    // Height of the overlay
                borderWidth: 5,                 // Border width (px)
                borderColor: "#FFF",            // Border color
                type: "image",                  // Media type (image|animate|youtube)
                source: "images/MyImage.png",   // Source to media
                param: {}                       // Additional parameter dependent on type (e.g. autoPlay: true for youtube)
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