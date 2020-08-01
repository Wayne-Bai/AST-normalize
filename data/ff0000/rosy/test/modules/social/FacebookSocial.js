define(

	[
		"OxBlood",
		"rosy/base/Class",
		"rosy/modules/Module",
		"rosy/modules/social/FacebookSocial",
		"$"
	],

	function (OxBlood, Class, Module, FacebookSocial, $) {

		/*global describe, expect, it, before, beforeEach, after, afterEach */

		"use strict";

		OxBlood.addModuleTests(function () {

			describe("Module: Facebook Social", function () {

				describe("FacebookSocial", function () {

					var testInstance = new FacebookSocial();

					it("FacebookSocial should be a function", function () {
						expect(FacebookSocial).to.be.a("function");
					});

					it("should instantiate the class", function () {
						expect(testInstance).to.be.an("object");
					});

					it("should be an instance of Module", function () {
						expect(testInstance).to.be.a(Module);
					});

					describe("Notifications", function () {

						it(FacebookSocial.POST, function () {});

						it(FacebookSocial.RENDER, function () {});

						it(FacebookSocial.LOGIN, function () {});

						it(FacebookSocial.LOGOUT, function () {});

						it(FacebookSocial.GET_STATUS, function () {});

						it(FacebookSocial.GET_ME, function () {});

						it(FacebookSocial.SET_ACTION, function () {});

						it(FacebookSocial.HANDLE_ACTION, function () {});

						it(FacebookSocial.HANDLE_ME, function () {});

						it(FacebookSocial.HANDLE_LOGIN, function () {});

						it(FacebookSocial.HANDLE_LOGOUT, function () {});

					});

				});

			});

		});
	}
);
