/**
 * Watch utility, useful while debugging to trace how properties are getting changed
 */
/*
 * object.watch polyfill
 *
 * 2012-04-03
 * https://gist.github.com/384583
 * By Eli Grey, http://eligrey.com
 * Public Domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

// object.watch
(function() {
    if (!Object.prototype.watch) {
        Object.prototype.alreadyUnderWatch = false;

	    Object.defineProperty(Object.prototype, "watch", {
		    enumerable: false
		    , configurable: true
		    , writable: false
		    , value: function (prop, handler) {
			    var
			    oldval = this[prop]
			    , newval = oldval
			    , getter, setter;

                if (this.alreadyUnderWatch === false) {
                    getter = function () {
				        return newval;
			        };
			        setter = function (val) {
				        oldval = newval;
				        return newval = handler.call(this, prop, oldval, val);
			        };

			        if (delete this[prop]) { // can't watch constants
				        Object.defineProperty(this, prop, {
					        get: getter
					        , set: setter
					        , enumerable: true
					        , configurable: true
				        });
			        }
                    this.alreadyUnderWatch = true;
                }
		    }
	    });
    }

    // object.unwatch
    if (!Object.prototype.unwatch) {
	    Object.defineProperty(Object.prototype, "unwatch", {
		    enumerable: false
		    , configurable: true
		    , writable: false
		    , value: function (prop) {
			    var val = this[prop];
			    delete this[prop]; // remove accessors
			    this[prop] = val;
		    }
	    });
    }
})();


function changeLogger(prop, oldval, val) {
    console.error("Property "+prop +" changed from "+oldval +"  to "+val);
    return val;
}

