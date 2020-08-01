define(

	[
		"./AbstractClass",
		"./NotificationManager",
		"../polyfills/function-bind",
		"../polyfills/array-indexof"
	],

	function (AbstractClass, NotificationManager) {

		"use strict";

		return AbstractClass.extend({

			opts : {
				autoProxy : true
			},

			init : function () {},

			/**
			* Subscribes to a notification.
			*/
			subscribe : function (name, handler, priority) {
				this._interestHandlers = this._interestHandlers || {};

				if (handler && !this._interestHandlers[name]) {
					handler = handler;
					NotificationManager.subscribe(name, handler, priority);
					this._interestHandlers[name] = handler;
				}
			},

			/**
			* Unsubscribes from a notification.
			*/
			unsubscribe : function (name) {
				if (!name) {
					return this.unsubscribeAll();
				}

				if (this._interestHandlers && this._interestHandlers[name]) {
					var handler = this._interestHandlers[name];
					this._interestHandlers[name] = null;
					delete this._interestHandlers[name];
					NotificationManager.unsubscribe(name, handler);
				}
			},

			/**
			* Unsubscribes from all notifications registered via this.subscribe();
			*/
			unsubscribeAll : function () {
				for (var interest in this._interestHandlers) {
					if (this._interestHandlers.hasOwnProperty(interest)) {
						this.unsubscribe(interest);
					}
				}
				this._interestHandlers = [];
			},

			/**
			* Publishes a notification with the specified data.
			*/
			publish : function (/*name, arg1, arg2, arg3..., callback*/) {
				var args = Array.prototype.slice.call(arguments);
				NotificationManager.publish.apply(NotificationManager, [].concat(args, this));
			},

			/**
			* Cross-browser shorthand for func.bind(this)
			* or rather, $.proxy(func, this) in jQuery terms
			*/
			proxy : function (fn) {
				return fn ? fn.bind(this) : fn;
			},

			/**
			* Middleware setTimeout method. Allows for scope retention inside timers.
			*/
			setTimeout : function (func, delay) {
				return window.setTimeout(this.proxy(func), delay);
			},

			/**
			* Middleware setInterval method. Allows for scope retention inside timers.
			*/
			setInterval : function (func, delay) {
				return window.setInterval(this.proxy(func), delay);
			},

			/**
			* Add pseudo event listener
			*/
			on : function (name, fn) {
				var listeners = this["on_" + name] = (this["on_" + name] || []);
				listeners.push(fn);
				return true;
			},

			/**
			* Remove pseudo event listener
			*/
			off : function (name, fn) {

				var listeners = this["on_" + name],
					i;

				if (listeners) {

					if (!fn) {
						this["on_" + name] = [];
						return true;
					}

					i = listeners.indexOf(fn);
					while (i > -1) {
						listeners.splice(i, 1);
						i = listeners.indexOf(fn);
					}
					return true;
				}
			},

			/**
			* Trigger pseudo event
			*/
			trigger : function () {

				var listeners,
					evt,
					i,
					l,
					args = Array.prototype.slice.call(arguments),
					name = args.splice(0, 1)[0].split(":");

				while (name.length) {

					evt = name.join(":");
					listeners = this["on_" + evt];

					if (listeners && listeners.length) {

						args = [].concat(evt, this, (args || []));

						for (i = 0, l = listeners.length; i < l; i ++) {
							listeners[i].apply(null, args);
						}
					}

					name.pop();
				}
			},

			destroy : function () {

				var p;

				for (p in this) {
					if (p.indexOf("on_") >= 0) {
						this.off(p.replace("on_"));
					}
				}

				this.unsubscribe();
			}
		});
	}
);
