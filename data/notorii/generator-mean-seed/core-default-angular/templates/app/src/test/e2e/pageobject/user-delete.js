'use strict';

var config =require('../helper/config.js');

var UserDelete =function() {
	this.nav =function() {
		browser.get('/user-delete');
		expect(browser.getCurrentUrl()).toContain("/"+config.defaultPage);		//should go to default page after logout is complete
	};
};

module.exports = new UserDelete();