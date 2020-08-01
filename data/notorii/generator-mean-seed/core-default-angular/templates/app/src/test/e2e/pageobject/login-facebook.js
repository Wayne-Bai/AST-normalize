'use strict';

var e2e =require('./e2e.js');

var LoginFacebook =function() {
	/**
	@toc 1.
	@method nav
	@param {Object} user1
		@param {String} email
		@param {String} password
	@return {Object} (via Promise)
		@param {Object} user
			@param {String} _id
			@param {String} sess_id
	*/
	this.nav =function(user1, params) {
		var ret ={user: {}};
		var deferred =protractor.promise.defer();
		
		browser.get('/login');
		expect(browser.getCurrentUrl()).toContain("/login");
		
		//click facebook button
		browser.findElement(by.css('.login-form .social-auth-btn-buttons a.social-auth-btn-button-facebook')).click();
		
		//switch to pop up window
		browser.getAllWindowHandles()
		.then(function(handles) {
			//wait for facebook page to load
			browser.sleep(2000);
			
			//switch to pop-up
			// browser.switchTo().window(handles[1]);
			
			//https://github.com/angular/protractor/issues/334
			//fill in login form
			browser.driver.findElement(by.id('email')).sendKeys(user1.email);
			browser.driver.findElement(by.id('pass')).sendKeys(user1.password);
			
			//click login button / submit form
			browser.driver.findElement(by.id('loginbutton')).click();
			
			//switch back to original window
			// browser.switchTo().window(handles[0]);
			
			//need to sleep long enough for the above to finish.. since leaves Angular so timing / waiting gets messed up?
			//@todo - make this more robust rather than guessing a time to sleep..
			browser.sleep(3000);
			
			//now that logged in, get user info (since can not really get it from the Facebook login process directly?)
			e2e.nav({})
			.then(function(retE2e) {
				ret.user =retE2e.user;
				deferred.fulfill(ret);
			});
		});
		
		return deferred.promise;
	};
};

module.exports = new LoginFacebook();