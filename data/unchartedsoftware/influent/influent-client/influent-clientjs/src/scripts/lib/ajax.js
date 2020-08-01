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
/**
 * Defines a request broker that caches responses and smartly only makes one request
 * per set of concurrent identical requests.
 *
 * TODO Test case needed!
 * TODO Move error/pending UI out of the broker and into an independent view/broker listener
 */
define(['lib/channels', 'lib/ui/status', 'lib/extern/underscore'], function(chan, statusDialog) {

	/**
	 * Creates a cache with a given size.  If the size is not given, 20 is used.
	 */
	var createBroker = function(maxCacheSize) {
		maxCacheSize = maxCacheSize || 20;
		var that = {},
			cacheFifo = [],
			storedResponses = {},
			pendingResponses = {},
			pendingResponseCount = 0,
			errorResponses = [],

			cacheData = function( key, data ) {
				// Promote the url in the cache fifo to indicate that it's recent
				cacheFifo = _.without(cacheFifo, key);
				cacheFifo.push( key );

				// Kill first in if above max size
				if( cacheFifo.length > maxCacheSize ) {
					var toDelete = cacheFifo.shift();
					delete storedResponses[toDelete];
				}

				storedResponses[key] = data;
			};

		var address = document.URL;

		var endAddress = address.indexOf('#');
		if (endAddress > 0)
			address = address.substr(0, endAddress);

		var statusSpec = {
				resetUrl : address,
				resetLabel : 'Return to home page',
				retryFn : function() {
					var errors = errorResponses;

					// clear this before doing anything so we only process what we have.
					errorResponses = [];

					// Do callbacks
					_.each(errors, function( url ) {
						ajax( url );
					});
				},
				closeFn : function(event, ui) {
					// Clear all error references. Once we close the dialog
					// we release any chance of retrying that set.
					_.each(errorResponses, function( url ) {
						delete pendingResponses[url];
						pendingResponseCount--;
					});

					// clear what we have noted.
					errorResponses = [];
				}
		};

		// Instantiate the dialog but don't open it yet.
		statusDialog.initDialog(statusSpec);

		/**
		 * Show loading status
		 */
		var loading = function() {
			if (errorResponses.length === 0 && !statusDialog.isOpen()){
				statusDialog.loading('Loading...');
			}
		},

		/**
		 * Called when a query completes
		 */
		done = function ( url ) {
			// Kill pendingResponses
			delete pendingResponses[url];
			pendingResponseCount--;

			// Hide status dialog.
			if (pendingResponseCount === 0) {
				statusDialog.close();
			}

			// Send out notification of pendingResponse change on success
			aperture.pubsub.publish(chan.AJAX_RESPONSE,
				{
					broker: that,
					wasSuccess: true,
					activeRequests: pendingResponseCount,
					errorResponses: errorResponses.length
				});
		},

		/**
		 * Called when an error occurs
		 */
		error = function( message, url, allowRetry) {

			// pipe through log
			aperture.log.error( message );

			// don't clear it from pending until we have officially bailed.
			var hasQuery = url && pendingResponses[url];

			if (hasQuery)
				errorResponses.push(url);

			statusDialog.error({
				allowRetry : allowRetry,
				allowReset : hasQuery != null,
				message : message
			});

			// Send out notification of pendingResponse change on error
			aperture.pubsub.publish(chan.AJAX_RESPONSE,
				{
					broker: that,
					wasError: true,
					activeRequests: pendingResponseCount,
					errorResponses: errorResponses.length
				});
		};

		var ajax = function( url ) {
			// only show loading if exceeds a certain amount of time.
			var showLoading = setTimeout(function() {
				if (pendingResponses[url]) {
					loading();
				}

			}, 1000);

			// Make request
			$.ajax( {
				url:  url,
				type: 'GET',
				success: function(data, textStatus, xhr) {
					// Add to cache
					cacheData( url, data );

					// don't need this timeout anymore.
					clearTimeout(showLoading);

					// Do callbacks
					_.each(pendingResponses[url].callbacks, function(fn) {
						fn(data);
					});

					// handle completion.
					done(url);
				},
				error: function (jqXHR, textStatus, optErrorThrown) {
					// Provide callback with data returned by server, if any
					var responseData = jqXHR.responseText;

					// Check content-type for json, parse if json
					var ct = jqXHR.getResponseHeader('content-type');
					if( responseData && ct && ct.indexOf('json') > -1 ) {
						try {
							responseData = jQuery.parseJSON( responseData );
						} catch( e ) {
							// Error parsing JSON returned by HTTP error... go figure
							// TODO log
							responseData = null;
						}
					}

					var message = 'Server Error';

					// If the server has provided an exception
					// message, use that instead. Otherwise
					// default to a generic error message.
					if (responseData != null){
						message += '\n' + responseData.message;
					}
					else {
						message += ' '+ jqXHR.status;

						if (textStatus)
							message += '\n' + textStatus;
						if (optErrorThrown)
							message += '\n' + optErrorThrown;
					}

					aperture.log.error(message);
					message = message.replace('\n', '<br>');

					// handle error display
					error(message, url);
				},
				statusCode : {
					// Specific handler for a 401 unauthorized request
					401: function(data, textStatus, xhr){
						// An AJAX call failed for authentication reasons.  Reload the
						// current page to trigger page (app) access controls that should
						// redirect the user to the login page.
						// XXX Is this hacky?
						window.location.reload();
					}
				}
			} );
		};

		/**
		 * Issues an ajax request for the resource at url, with callback
		 * notification on completion.
		 */
		that.request = function( url, callback ) {

			// Do we have this value cached already?
			if( storedResponses[url] ) {
				// Callback immediately with the value
				callback( storedResponses[url] );
				// TODO promote request in fifo?
				return;
			}

			// Is this request pending?
			if( pendingResponses[url] ) {
				// Add callback to list of callbacks interested in the response value
				pendingResponses[url].callbacks.push( callback );
				return;
			}

			// If we got here this is a new request we haven't seen

			// Record the given callback as the first interested party in the results
			pendingResponses[url] = {
				callbacks: [callback]
			};
			pendingResponseCount++;

			// issue request
			ajax( url );
		};

		// Account for a request that was made outside of the request broker.
		// TODO: Should we treat the JSON params used for the external request
		// as an identifier (e.g. url) so we can keep track of which requests
		// are still pending?
		that.reportExternalRequest = function() {
			pendingResponseCount++;
		};

		that.error = error;

		// Account for the response for an external request that was made
		// without the use of the request broker.
		that.reportExternalResponse = function() {
			// Fire the done method so that we decrement the pending
			// response counter and close any status dialogs that
			// may be open.
			done(null);
		};
		return that;
	};

	return createBroker;
});
