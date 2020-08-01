/*
 Copyright 2013 Joshua Marsh. All rights reserved.  Use of this source
 code is governed by a BSD-style license that can be found in the
 LICENSE file.
 */

/* ListsService is an interface to the RESTful List service. We have
 * to use a service here because go and angular don't play nicely
 * together with trailing slashes.
 */
function ListsService($http, Alerts) {
		// Note: All of these functions accept callback
		// functions in which the resulting data from the
		// server is returned.

		// Create a new list.
		this.create = function(data, scall, ecall) {
				var promise = $http.post("/rest/list/", data);
				var error = {
						type: "error",
						strong: "Failed!",
						message: "Could not create a new list. Try again in a few minutes."
				};
				var success = {
						type: "success",
						strong: "Success!",
						message: "Your new list is ready to use."
				};
				Alerts.handle(promise, error, success, scall, ecall);
				
				return promise;
		};

		// Save an existing list.
		this.save = function(data, scall, ecall) {
				var promise = $http.put("/rest/list/" + data.Key + "/", data);
				var error = {
						type: "info",
						strong: "Unable to save!",
						message: "Could not save your list. Try again in a few minutes."
				};
				Alerts.handle(promise, error, undefined, scall, ecall);
				
				return promise;
		};

		// Check to see if a list has been modified.
		this.checkupdate = function(org, call) {
				var date = Math.floor(Date.parseRFC3339(org.LastModified).getTime() 
															/ 1000);
				var promise = $http.get("/rest/list/" + org.Key + "/?date=" + date);

				// We got 2XX, so we should set update.
				var sfunc = function(data, status) {
						call(true);
				};

				var efunc = function(data, status) {
						call(status != 304);
				};
				
				Alerts.handle(promise, undefined, undefined, sfunc, efunc);
				return promise;
		};

		// Delete the list with the given key.
		this.del = function(key, scall, ecall) {
				var promise = $http({
						method: 'DELETE', 
						url:"/rest/list/" + key + "/"}
													 );
				var error = {
						type: "error",
						strong: "Failed!",
						message: "Could not delete the list. Try again in a few minutes."
				};
				var success = {
						type: "success",
						strong: "Success!",
						message: "The list has been deleted."
				};
				Alerts.handle(promise, error, success, scall, ecall);
				
				return promise;
		};
		
		// Get all lists.
		this.getall = function(scall, ecall) {
				var promise = $http.get("/rest/list/");
				var error = {
						type: "warning",
						strong: "Warning!",
						message: "Unable to retrieve lists. Try again in a few minutes."
				};
				Alerts.handle(promise, error, undefined, scall, ecall);
				
				return promise;
		};


		// Get a specific list.
		this.get = function(key, scall, ecall) {
				var promise = $http.get("/rest/list/" + key + "/");
				var error = {
						type: "warning",
						strong: "Warning!",
						message: "Unable to retrieve the list. Try again in a few minutes."
				};
				Alerts.handle(promise, error, undefined, scall, ecall);
				
				return promise;
		};
}
