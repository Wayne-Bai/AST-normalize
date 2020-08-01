define(

	[
		"../utils/Utils",
		"../polyfills/function-bind"
	],

	function (Utils) {

		"use strict";

		/*=========================== HELPER FUNCTIONS ===========================*/

		var _createSuperFunction = function (fn, superFn) {
			return function () {
				var r, tmp = this.sup || null;

				// Reference the prototypes method, as super temporarily
				this.sup = superFn;

				r = fn.apply(this, arguments);

				// Reset this.sup
				this.sup = tmp;
				return r;
			};
		};

		/*
		If Function.toString() works as expected, return a regex that checks for `sup()`
		otherwise return a regex that passes everything.
		*/

		var _doesCallSuper = (/xyz/).test(function () {
			var xyz;
			xyz = true;
		}) ? (/\bthis\.sup\b/) : (/.*/);

		/*=========================== END OF HELPER FUNCTIONS ===========================*/

		return (function () {

			/**
			* Allows us to store module id's on Classes for easier debugging, See;
			* https://github.com/jrburke/requirejs/wiki/Internal-API:-onResourceLoad
			**/

			require.onResourceLoad = function (context, map) {
				var module = context.require(map.id);

				if (module && module._isRosyClass) {
					module._moduleID = module.prototype._moduleID = map.id;
				}
			};

			// Setup a dummy constructor for prototype-chaining without any overhead.
			var Prototype = function () {};
			var MClass = function () {};

			MClass.extend = function (props) {

				Prototype.prototype = this.prototype;
				var p, proto = Utils.extend(new Prototype(), props);

				function Class(vars) {

					var fn,
						p;

					/**
					* If the prototype has a vars object and the first argument, is an object,
					* deep copy it to this.vars
					**/
					if (this.vars && typeof vars === "object") {
						this.vars = Utils.extend({}, this.vars, vars);
					}

					if (this.opts) {
						this.opts = Utils.extend({}, this.opts);

						if (this.opts.autoProxy === true) {
							for (p in this) {
								if (typeof this[p] === "function") {
									this[p] = this[p].bind(this);
								}
							}
						}
					}

					fn = this.__init || this.init || this.prototype.constructor;
					return fn.apply(this, arguments);
				}

				for (p in props) {
					if (
						p !== "static" &&
						typeof props[p] === "function" &&
						typeof this.prototype[p] === "function" &&
						_doesCallSuper.test(props[p])
					) {
						// this.sup() magic, as-needed
						proto[p] = _createSuperFunction(props[p], this.prototype[p]);
					}

					else if (typeof props[p] === "object") {

						if (props[p] instanceof Array) {
							proto[p] = props[p].concat();
						}

						else if (props[p] !== null) {

							if (p === "vars" || p === "opts") {
								proto[p] = Utils.extend({}, true, this.prototype[p], props[p]);
							}

							else if (p === "static") {
								proto[p] = Utils.extend({}, this.prototype[p], props[p]);
							}

							else {
								proto[p] = Utils.extend({}, props[p]);
							}
						}
					}
				}

				proto.extend = MClass.extend.bind(Class);

				Class.prototype = proto;
				Utils.extend(Class, this, proto["static"]);
				Class._isRosyClass = true;

				Class.prototype.constructor = Class;

				if (typeof Class.prototype.setup === "function") {
					Class.prototype.setup.call(Class);
				}

				return Class;
			};

			return MClass;

		}());
	}
);
