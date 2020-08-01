/* globals require: true, module: true */
"use strict";

var nemo,
	NemoView = require("nemo-view"),
	SubView = require("./mySubView"),
	subView,
	self;

function MyOtherView(config) {
	nemo = config;
	this.name = "myOtherView";
	(new NemoView()).init(this, config);
	subView = new SubView(config);
	self = this;
}

MyOtherView.prototype = {
	tellLifeStory: function () {
		return nemo.driver.get("http://accessify.com/features/tutorials/accessible-forms/form-examples.htm").
			then(function () {
				self.cityOptionPresent().
					then(function (present) {
						self.cityOption().click();
					}).
					then(function () {
						nemo.driver.sleep(4000);
					});
			});

	}

};

module.exports = MyOtherView;