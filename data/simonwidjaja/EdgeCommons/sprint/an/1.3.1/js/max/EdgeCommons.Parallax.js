// EdgeCommons for Edge Animate v1.3.1 +++ Visit edgecommons.org for documentation, updates and examples +++ Copyright (c) 2013 by Simon Widjaja +++ Distributed under the terms of the MIT license (http://www.opensource.org/licenses/mit-license.html) +++ This notice shall be included in all copies or substantial portions of the Software.

/**
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

})(EdgeCommons);