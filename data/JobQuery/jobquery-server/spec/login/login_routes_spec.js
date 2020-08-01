'use strict'

var loginRoutes = require('../../server/login/login_routes.js');

describe("login loginRoutes", function () {
  var router;
  var express;

  beforeEach(function () {
    express = require('express');
    router = express.Router();
    router.route = jasmine.createSpy("route() spy").andCallFake(function(path) {
        return this;
    });

    router.post = jasmine.createSpy("post() spy").andCallFake(function(path) {
        return this;
    });

  });

  it("check loginRoutes is a function", function () {
    expect(typeof loginRoutes).toEqual("function");
  });

  it("check / route is been set", function () {
    loginRoutes(router);
    expect(router.route).toHaveBeenCalledWith('/');
  });

  it("check post route has been set", function () {
    loginRoutes(router);
    expect(router.post).toHaveBeenCalled();
  });


});
