'use strict';

var e2e =require('./e2e.js');

var LoginGoogle =function() {
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
		
		//click google button
		browser.findElement(by.css('.login-form .social-auth-btn-buttons a.social-auth-btn-button-google')).click();
		
		//https://github.com/angular/protractor/issues/334
		browser.getAllWindowHandles()
		.then(function(handles) {
			//wait for facebook page to load
			browser.sleep(1500);
			
			//switch to pop-up
			// browser.switchTo().window(handles[1]);
			
			//fill in login form
			browser.driver.findElement(by.id('Email')).sendKeys(user1.email);
			browser.driver.findElement(by.id('Passwd')).sendKeys(user1.password);
			
			//click login button / submit form
			browser.driver.findElement(by.id('signIn')).click();
			
			//click approve / allow button
			if(1) {		//only need to do this the first time; will create error all other times; so just do this manually before running the test the first time		//UPDATE 2015.01.02 - with new google login flow it always needs to be approved??
			browser.sleep(1000);		//need to wait for button to become clickable
			browser.driver.findElement(by.id('submit_approve_access')).click();
			}
			
			//switch back to original window
			// browser.switchTo().window(handles[0]);
			
			//need to sleep long enough for the above to finish.. since leaves Angular so timing / waiting gets messed up?
			//@todo - make this more robust rather than guessing a time to sleep..
			browser.sleep(3000);
			
			//now that logged in, get user info (since can not really get it from the social login process directly?)
			e2e.nav({})
			.then(function(retE2e) {
				ret.user =retE2e.user;
				deferred.fulfill(ret);
			});
			
		});
		
		return deferred.promise;
	};
};

module.exports = new LoginGoogle();