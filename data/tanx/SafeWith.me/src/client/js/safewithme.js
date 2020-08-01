/*
 * SafeWith.me - store and share your files with OpenPGP encryption on any device via HTML5
 *
 * Copyright (c) 2012 Tankred Hase
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, version 3 of the License.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 */

'use strict';

/**
 * SafeWith.me uses the model-view-presenter (MVP) pattern to seperate 'view'
 * (DOM manipulation) logic from 'presenter' (business) logic. Dependency
 * injection is used to keep presenters decoupled and testable. The
 * 'model' is implemented using a json filesystem called 'BucketFS', which is
 * encrypted before being persisted on the server. This way the server has
 * no knowledge of file meta-data such as filenames.
 */
var SAFEWITHME = (function (window, document, $) {
	var self = {};
	
	/**
	 * Single point of entry for the application
	 */
	self.init = function() {
		// set jqm to display loading texts
		$.mobile.loadingMessageTextVisible = true;
		
		//
		// init modules with dependency injection
		//
		
		// check if the browser supports all necessary HTML5 Apis
		var util = new Util(window, uuid);
		if (!util.checkRuntime()) { return; }
		
		// init presenters
		var cache = new Cache(window);	
		var server = new Server(util);
		var menu = new Menu(server, cache);
		var bucketCache = new BucketCache(cache, server);
		var crypto = new Crypto(window, openpgp, util, server);
		var fs = new FS(crypto, server, util, cache,  bucketCache);
		
		// init views
		var menuView = new MenuView(window, $, menu, server);
		var cryptoView = new CryptoView(window, $, crypto, cache);
		var fsView = new FSView(window, document, $, fs);
		
		//
		// start the application
		//

		// init menu
		menuView.init('/app/', function(loginInfo) {
			// init crypto
			cryptoView.init(loginInfo, function() {
				// init filesystem
				fsView.init(loginInfo, function() {
					// init successful
				});
			});
		});
	};
	
	return self;
}(window, document, $));