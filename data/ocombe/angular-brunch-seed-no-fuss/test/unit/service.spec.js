'use strict';
describe("service", function() {
	beforeEach(module("app"));
	return describe("$version", function() {
		return it("should return current version", inject(function($version) {
			return expect($version).toEqual("0.7.0");
		}));
	});
});
