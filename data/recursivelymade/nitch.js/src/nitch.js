/**
 * @namespace nitch
 * @description Nitch is designed as a response design HTML5 games framework
 * @externals { "name": "classList.js", "url": "http://github.com/paulirish/matchMedia.js" }
 * @externals { "name": "mediaMatch.js", "url": "http://github.com/eligrey/classList.js" }
**/
nitch = {	
	ready: function(callback) {
		// Catch if browser event has already occurred.
		if ( document.readyState === "complete" ) {
			return setTimeout( function() { 
				nitch.device.ft();
				nitch.device.watchOrientation(); 
				callback();
			}, 1 );
		}
		
		DOMContentLoaded = function() {
			document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
			nitch.device.ft();
			nitch.device.watchOrientation();
			callback();
		};
	
		document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );
	},

/**
 * @namespace nitch.dom
 * @method
 * @description Basic DOM selector using <a href="https://developer.mozilla.org/en/DOM/Document.querySelectorAll">querySelectorAll</a> which can be chained
	@example var main = nitch.dom("#main");
**/
	dom: function (selector) {
		return new nitch.nodeList(selector);
	}
};

nitch.nodeList = function(selector) {
	this.nodeList = Array.prototype.slice.call(document.querySelectorAll(selector));
	
	
	nitch.nodeList.prototype.find = function(selector) {
		this.nodeList = Array.prototype.slice.call( this.nodeList[0].querySelector(selector));
		return this;
	},
	
/**
 * @namespace nitch.css
 * @method
 * @description Sets styles on the nodelist 

 * @example nitch.dom("#main").css("background-color : green; color: #fff;");
**/
    nitch.nodeList.prototype.css = function (v) {
        this.nodeList.forEach.call(this.nodeList, function (i) {
            i.style.cssText = v;
        });

       return this;
    },
    
/**
 * @namespace nitch.getStyle
 * @method
 * @description Gets the style property on the first element in the node list 

 * @example nitch.dom("#main").getStyle("background-color");
**/
    nitch.nodeList.prototype.getStyle = function(style) {
		return document.defaultView.getComputedStyle(this.nodeList[0],null).getPropertyValue(style);
    },

/**
 * @namespace nitch.offset
 * @method
 * @description Returns the offset properties of 
 * @returns {Object} 
 * @example nitch.dom("#main").offset(); // returns { left:10px; top: 10px, width: 200px, height: 200px }
**/    
	nitch.nodeList.prototype.offset = function() {
		var node = this.nodeList[0].getBoundingClientRect();
		return {
			left: node.left + window.pageXOffset,
			top: node.top + window.pageYOffset,
			width: node.width,
			height: node.height
		};
	},
    
/**
 * @namespace nitch.text
 * @function
 * @description Sets or returns the text of nodelist

 * @example nitch.dom("#main").text("Cheese is good");
**/
	nitch.nodeList.prototype.text = function(text) {
		if (text === false) {
			this.nodeList.forEach.call(this.nodeList, function (i) {
				return i.textContent;
			});
		} else {
			this.nodeList.forEach.call(this.nodeList, function (i) {
				i.textContent = text;
			});
			return this;
		}
	},
	
	nitch.nodeList.prototype.each = [].forEach,
	
/**
 * @namespace nitch.hasClass
 * @function
 * @description Returns if the nodelist has a specific class on it

 * @example nitch.dom("#main").hasClass("summer");
**/
	nitch.nodeList.prototype.hasClass = function(className) {
		this.each.call(this.nodeList, function (i) {
			return i.classList.contains(className);
		});
		return this;
	},
	
/**
 * @namespace nitch.addClass
 * @function
 * @description Adds a class to each node in the node list

 * @example nitch.dom("#main").addClass("summer");
**/
	nitch.nodeList.prototype.addClass = function(className) {
		this.each.call(this.nodeList, function (i) {
			i.classList.add(className);
		});
		return this;
	},
	
/**
 * @namespace nitch.removeClass
 * @function
 * @description Removes a class from each node in the node list

 * @example nitch.dom("#main").removeClass("summer");
**/
	nitch.nodeList.prototype.removeClass = function(className) {
		this.each.call(this.nodeList, function (i) {
			i.classList.remove(className);
		});
		return this;
	},
	
/**
 * @namespace nitch.toggleClass
 * @function
 * @description Toggles a class on each node in the node list

 * @example nitch.dom("#main").toggleClass("summer");
**/
	nitch.nodeList.prototype.toggleClass = function(className) {
		this.each.call(this.nodeList, function (i) {
			i.classList.toggle(className);
		});
		return this;
	},
	
/**
 * @namespace nitch.remove
 * @function
 * @description Removes an element from the DOM

 * @example nitch.dom("#main").remove();
**/
	nitch.nodeList.prototype.remove = function() {
		this.each.call(this.nodeList, function (i) {
				i.parentNode.removeChild(i);
		});
		return this;
	},	
/**
 * @namespace nitch.before
 * @function
 * @description Inserts a new element before each element in the nodelist

 * @example nitch.dom("#main").before("&lt;p&gt;Hello&lt;/p&gt;");
**/
	nitch.nodeList.prototype.before = function(elem) {
		this.each.call(this.nodeList, function (i) {
			i.insertAdjacentHTML("beforebegin", elem);
		});
		
		return this;
	},
	
/**
 * @namespace nitch.before
 * @function
 * @description Inserts a new element just inside each element in the nodelist

 * @example nitch.dom("#main").prepend("&lt;p&gt;Hello&lt;/p&gt;");
**/
	nitch.nodeList.prototype.prepend = function(elem) {
		this.each.call(this.nodeList, function (i) {
			i.insertAdjacentHTML("afterbegin", elem);
		});
		return this;
	},
	
/**
 * @namespace nitch.after
 * @function
 * @description Inserts a new element after each element in the nodelist

 * @example nitch.dom("#main").after("&lt;p&gt;Hello&lt;/p&gt;");
**/
	nitch.nodeList.prototype.after = function(elem) {
		this.each.call(this.nodeList, function (i) {
			i.insertAdjacentHTML("afterend", elem);
		});
		return this;
	},
	
	
/**
 * @namespace nitch.append
 * @function
 * @description Inserts a new element after the last child of each element in the nodelist

 * @example nitch.dom("#main").append("&lt;p&gt;Hello&lt;/p&gt;");
**/
	nitch.nodeList.prototype.append = function(elem) {
		this.each.call(this.nodeList, function (i) {
			i.insertAdjacentHTML("beforeend", elem);
		});
		
		return this;
	},
	
/**
 * @name nitch.attr
 * @method
 * @description Get an attribute on each element in the node list. If data is supplied, it will set it as an attribute.

 * @example nitch.dom("img").attr("alt", "Ben's cat Jimmy");
 * nitch.dom("img").attr("alt"); // returns "Ben's cat Jimmy"
**/
    nitch.nodeList.prototype.attr = function (attribute, data) {
		if(data) {
			this.each.call(this.nodeList, function (i) {
				i.setAttribute(attribute, data);
			});
			return this;
		} else {
			return this.nodeList[0].getAttribute(attribute);
		}
    },
    
    

/**
 * @namespace nitch.events
 * @description Events that are attached to nitch.dom
**/

/**
 * @name nitch.events.on
 * @method
 * @description Attaches an event handler to an object
**/
	nitch.nodeList.prototype.on = function(event, callback) {
        this.nodeList.forEach.call(this.nodeList, function (i) {
			i.addEventListener(event, callback, false);
        });
        return this;
	},
	
/**
 * @name nitch.events.once
 * @method
 * @description Attaches an event handler to an object that can only be fired once
**/
	nitch.nodeList.prototype.once = function(event, callback) {
		var that = this;
		this.on(event, function fnc() {
			callback();
			that.detach(event, callback);
		});
	},
	
/**
 * @name nitch.events.detach
 * @method
 * @description Detaches an event handler
**/
	nitch.nodeList.prototype.detach = function(event, callback) {
		console.info("calling detach");
        this.nodeList.forEach.call(this.nodeList, function (i) {
            i.removeEventListener(event, callback, false);
        });
        return this;
	},
	
/**
 * @name nitch.events.fire
 * @method
 * @description Fire a custom event at an object
**/
	nitch.nodeList.prototype.fire = function(event) {
		this.eventStore || (this.eventStore = {});

		if(!this.eventStore[event]) {
			var evt = document.createEvent('CustomEvent');  
			evt.initEvent(event, true, true);
			this.eventStore[event] = evt;
		}
		this.nodeList[0].dispatchEvent(this.eventStore[event]);
        return this;
	},
	
/**
 * @name nitch.events.tap
 * @method
 * @description abstracted click and touchend event for cross device clicking goodness
 * @example nitch.dom("#btn").tap(function() { console.info("I made an innuendo about this method name"); })
**/
	nitch.nodeList.prototype.tap = function(callback) {
		var hasTouch = (typeof window.ontouchstart === "undefined" ? false : true);
		var coordinates = [];
		var lastClick = {};
		
		preventGhostClick = function(event, callback) {
			var time = Date.now();
			
			if (event.type == "touchstart") {
				lastClick.x = event.touches[0].clientX;
				lastClick.y = event.touches[0].clientY;
			} else if (event.type == "touchend") {
				lastClick.time = time;
				callback(event);
				event.preventDefault();
				event.stopPropagation();
				return event;
			} else {
				var timeDiff = time - lastClick.time;
				var xDiff = Math.abs(event.clientX - lastClick.x);
				var yDiff = Math.abs(event.clientY - lastClick.y);
				if ((timeDiff < 500) || (timeDiff < 1500 && xDiff < 25 && yDiff < 25)) {
					callback(event);
					return event;
				} else {
					event.preventDefault();
					event.stopPropagation();
				}
			}
		};
		
		if(!hasTouch) {
		// Must be a desktop browser, please say it's a touch screen....
			this.on('click', function(e) { callback(e); });
			this.on('keydown', function(e) { if(e.keyCode == 32) { callback(e); } });
		} else {
			this.on('touchstart', function(e) { preventGhostClick(e); });
			this.on('touchend', function(e) { preventGhostClick(e, callback); });
			// We need to capture clicks as VoiceOver on iOS sends them instead of touchevents
			this.on('click', function(e) { preventGhostClick(e, callback); });
			
		}
		
		return this;
	},
	

	
/**
 * @name nitch.events.touchandhold
 * @description Creates a touch and hold event. The start and release native events come through as eventStart, and eventRelease. <div class="label label-error">On touchscreens we prevent ghost clicks, which occur after touchend by attaching an empty click eventListner</div>
 * @param {String} elem The element you want the touch and hold event to be associated with
 * @param {Object} opts
 * @param {Function} [opts.start=function(eventStart){}] Fires function at the start of a mousedown / touchstart event
 * @param {Function} [opts.move=function(){}] Fires function during the mousemove / touchmove event
 * @param {Function} [opts.release=function(eventRelease){}] Fires function during the mouseup / touchend event
 * @example nitch.dom(".rotatable").touchandhold({
 * start: function() { console.info("Started holding"); },
 * move: function() { console.info("Started moving"); },
 * release: function() { console.info("Released"); }
 * });
**/	
	nitch.nodeList.prototype.touchandhold = function(elem, opts) {
		if(!elem) { return; }
		var hasTouch = (typeof window.ontouchstart === "undefined" ? false : true);
		var defaults = {
			start: function() { },
			move: function() { },
			release: function() { }
		},
		
		options = nitch.util.apply(defaults, opts);
		var view = nitch.dom(elem);
	
		if(!hasTouch) {
			// Must be a desktop browser, please say doesn't have a touch screen....
			view.on('mousedown', function(eventStart) { 
				options.start(eventStart); 
				window.addEventListener("mousemove", options.move, false); 
				
			});
			var that = this;
			view.on('mouseup', function(eventRelease) { 
				options.release(eventRelease); 
				window.removeEventListener("mousemove", options.move, false); 
			});
	
		} else {
			view.on('touchstart', function(eventStart) {  
				options.start(eventStart); 
				window.addEventListener("touchmove", options.move, false); 
			});
			
			view.on('touchend', function(eventRelease) {
				options.release(eventRelease); 
				window.removeEventListener("touchmove", options.move, false); 
			});
			
			// We may need to capture clicks in the future as VoiceOver on iOS sends them instead of touchevents
			this.on('click', function(){});
		}
	
		return this;
	};
	
	return this;
};

/**
 * @name nitch.events.visibly
 * @class
 * @description Wrapper supporting the <a href="https://developer.mozilla.org/en/DOM/Using_the_Page_Visibility_API">Page Visibility API</a>, which will fire events when people hide the window (e.g. change tabs because the boss is coming). <span class="label label-note">We don't support the &quot;prerender&quot; visibility state</span>.
 * @param {Object} opts
 * @param {Function} opts.onVisible Fires when the page becomes visible
 * @param {Function} opts.onHidden Fires when the page becomes visible
 * @example nitch.events.visibly({
 * onVisible: function() { yourGame.restart(); },
 * onHidden: function() { yourGame.pause(); }
 * });
**/
nitch.events = {
	visibly: function(opts) {
		var hidden, visible, visibilityChange;
		
		if (typeof document.hidden !== "undefined") {  
			hidden = "hidden";
			visible = "visible";
			visibilityChange = "visibilitychange";  
		} else if (typeof document.mozHidden !== "undefined") {  
			hidden = "mozHidden";
			visible = "mozVisible";
			visibilityChange = "mozvisibilitychange";  
		} else if (typeof document.msHidden !== "undefined") {  
			hidden = "msHidden";
			visible = "msVisible";
			visibilityChange = "msvisibilitychange";  
		} else if (typeof document.webkitHidden !== "undefined") {  
			hidden = "webkitHidden";
			visible = "webkitVisible";
			visibilityChange = "webkitvisibilitychange";
		} else if (typeof document.oHidden !== "undefined") {  
			hidden = "oHidden";
			visible = "oVisible";
			visibilityChange = "ovisibilitychange";  
		} else {
			return;
		}
		
		visibilityCallback = function() {  
			if (document[hidden]) {  
				options.onHidden(visible);
			} else if(document[visible]) {  
				options.onVisible();
			}  
		};
		
		var defaults = {
			onVisible: function() { },
			onHidden: function() { }
		}
	
		var options = nitch.util.apply(defaults, opts);
		document.addEventListener(visibilityChange, visibilityCallback, false);  
	}
};

/**
 * @namespace nitch.util
 * @description Language utilities
**/
nitch.util = {
/**
 * @name nitch.util.apply
 * @method
 * @description Copies properties from one object to another. All properties from 'source' will be copied onto 'destination', potentially overwriting existing properties on 'destination'. Properties from 'source's prototype chain will not be copied.
* @param {Object} [destination] Destination object. If this object is undefined or falsey, a new object will be created.
* @param {Object} [source] Properties of this object will be copied onto the destination. If this object is undefined or falsey, a new object will be created.
* @returns {Object} The destination object.
* @example var obj = nitch.util.apply({foo: "hello", bar: "world"}, {bar: "everyone"});
//results in {foo: "hello", bar: "everyone"}
**/
	apply: function(destination, source) {
		var destination = destination || {};
		var source = source || {};

		for (var i in source) {
			if ( source.hasOwnProperty(i) ) {
				destination[i] = source[i];
			}
		}
		return destination;
	},
	
/**
 * @name nitch.util.delay
 * @method
 * @description  Delays a function for the given number of milliseconds
 * @example nitch.util.delay(1000, function() { alert("delayed"); })
**/
	delay: function(wait, func) {
		return setTimeout(function(){ return func.apply(null, []); }, wait);
	},

/**
 * @name nitch.util.defer
 * @method
 * @description Defers a function, scheduling it to run after the current call stack has cleared.
 * @example nitch.util.defer(function() { alert("deferred"); })
**/
	defer: function(func) {
		return util.delay.apply(nitch, [func, 1].concat(slice.call(arguments, 1)));
	}
};