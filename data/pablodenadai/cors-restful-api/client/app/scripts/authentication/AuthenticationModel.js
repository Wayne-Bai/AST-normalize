'use strict';

app.factory('AuthenticationModel', function ($http, $cookieStore) {

	this.user = $cookieStore.get('user');
	this.errorMessage = null;

	this.isSignedIn = function() {
		return !!this.user;
	};

	this.setUser = function(user) {
		this.errorMessage = null;
		this.user = user;
		$cookieStore.put('user', user);
	};

	this.removeUser = function() {
		this.user = null;
		$cookieStore.remove('user');
	};

	return this;

});