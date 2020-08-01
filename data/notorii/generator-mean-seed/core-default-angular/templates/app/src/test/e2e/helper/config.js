'use strict';

function getCfgJson(params) {
	if(typeof(angular) ==="undefined") {
		browser.get('/');		//need to load a page to have angular be defined
	}
	return browser.executeAsyncScript(function(params, callback) {
		var appConfig = angular.injector(['myApp']).get('appConfig');
		var ret1 ={
			cfgJson: appConfig.cfgJson
		}
		callback(ret1);
	}, params);
}
	
var Config =function() {
	this.defaultPage ='dev-test/test';		//hardcoded2 - the page we should go to by default (i.e. the 'otherwise' route)
	
	this.cfgJson =false;
	
	/**
	@toc 2.
	*/
	this.getCfgJson =function(params) {
		var self =this;
		var deferred =protractor.promise.defer();
		if(!this.cfgJson) {
			getCfgJson(params)
			.then(function(ret1) {
				self.cfgJson =ret1.cfgJson;		//save for next time
				deferred.fulfill(ret1);
			}, function(retErr) {
				deferred.reject(retErr);
			});
		}
		else {
			deferred.fulfill({cfgJson: this.cfgJson});
		}
		return deferred.promise;
	};
};

module.exports = new Config();