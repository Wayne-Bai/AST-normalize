/**
 * Copyright (c) 2013-2014 Oculus Info Inc.
 * http://www.oculusinfo.com/
 *
 * Released under the MIT License.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

define(['lib/channels'], function(chan) {

	/*
	 * TODO Make hard-coded stuff configurable
	 */

	var Sandbox = function(spec, parentSandbox) {

			// JQuery element for the given div
		var jqElem = $('#' + spec.div),

			// these all link back to singletons in app. parent pre-empts local
			state  = parentSandbox? parentSandbox.spec.state  : spec.state,
			broker = parentSandbox? parentSandbox.spec.broker : spec.broker,

			listeners = [ /* {
								callback: function(changeEvent),
									variables: ["mode","aoi",...],
									context: object
								}*/
									],

			/**
			 * Runs a jquery scoped to the modules div.  The results will be limited
			 * to the children of the module's sandbox div.
			 *
			 * Idea stolen from backbone.js
			 */
			local$ = function(selector) {
				return $(selector, jqElem);
			},


			/* ------------------------ State / Subscription -------------------------- */

			/**
			 * Subscribes the state change messages.
			 * @param callback the function that will be called on state change.  Should be
			 *		a function that expects two arguments in the form:
			 *		<code>function(changeObject, newState)</code>
			 * @param variables (optional) an array of strings containing the names
			 *		of the state variables that the subscriber wishes to be notified
			 *		about.  If not provided, notifies on all changes.
			 * @param context (optional) if provided, the callback will be called in the
			 *		scope of this object.
			 */
			subscribe = function( callback, variables, context ) {
				var listener = {
					callback : callback,
					variables : variables,
					context : context
				};

				for( var i = listeners.length-1; i > -1; i-- ) {
					var existing = listeners[i];
					if( existing.callback === callback ) {
						// This callback is already registered as a listener, simply
						// update the info and return
						listeners[i] = listener;
						return;
					}
				}

				// Not yet registered, add
				listeners.push(listener);
			},

			/**
			 * Gets the current application state object
			 */
			getState = function() {
				return state;
			},

			/**
			 * Gets the current application ajax broker
			 */
			ajax = function() {
				return broker;
			},

			/**
			 * Unsubscribe method will unsubscribe the provided callback function listener
			 * from change notifications
			 */
			unsubscribe = function( callback ) {
				for( var i = listeners.length-1; i > -1; i-- ) {
					var existing = listeners[i];
					if( existing.callback === callback ) {
						// Found it, remove it
						listeners.splice(i,1);
						return;
					}
				}
			},

			/**
			 * Publishes a state change to the bus.  The object passed in should be
			 * a simple JS object containing just the new components of the state to
			 * change.  Eg:
			 * <code>
			 * publish( { mode:"factors" }
			 * </code>
			 * will change the mode to factors.  There is no need to pass in a full
			 * state object.  If the full object is passed in it may appear to other
			 * listeners that all fields of the state were changed.
			 */
			publish = function( stateChanges ) {
				// Publish event
				aperture.pubsub.publish( chan.STATE_REQUEST, stateChanges );
			},

			/**
			 * Internal function that listens on state changes and keeps local
			 * state object up to date
			 */
			onStateChange = function( channel, changeEvent ) {
				// Update the local state with the new state
				state = _.clone(changeEvent.state);

				var stateChanges = changeEvent.changes;

				// Notify all of this sandbox's listeners
				_.each( listeners, function(listener) {
					var notify = false;
					if( listener.variables ) {
						// Listener has a variable restriction, only notify
						// if one of the variables of interest changed
						for( var i = listener.variables.length-1; i > -1; i-- ) {
							if( stateChanges.hasOwnProperty( listener.variables[i] ) ) {
								notify = true;
								break;
							}
						}
					} else {
						notify = true;
					}

					if( notify ) {
						if( listener.context ) {
							listener.callback.call( listener.context, stateChanges, state );
						} else {
							listener.callback( stateChanges, state );
						}
					}
				} );
			},


			/*
			 * Subscribe to state changes locally
			 */
			myToken = aperture.pubsub.subscribe( chan.STATE, onStateChange ),


			/**
			 * Destroys this sandbox, unhooks subscribers
			 */
			destroy = function() {
				aperture.pubsub.unsubscribe( myToken );
			};

		/*
		 * Expose public API
		 * See jsdocs on functions above
		 */
		this.destroy = destroy;
		this.subscribe = subscribe;
		this.unsubscribe = unsubscribe;
		this.publishState = publish;
		this.state = getState;
		this.ajax = ajax;
		this.$ = local$;

		// Expose access to the div that the module can exist in
		this.dom = jqElem;

		// XXX: Expose spec?
		this.spec = spec;
	};

	return Sandbox;
});
