'use strict';

var request = require('supertest'),
    express = require('express'),
    should = require('should'),
    sinon = require('sinon'),
    Q = require('q'),
    GithubProvider = require('../../lib/githubContentProvider.js'),
    paramHandler = require('../../lib/requestParamHandler.js'),
    pagesRequestHandler = require('../../api/pagesrequesthandler');

describe('pagesrequesthandler tests', function () {

  var app;
  var sandbox;
  var provider;

  beforeEach(function () {
    app = express();

    app.get('/api/janbaer/wiki/pages', pagesRequestHandler);

    sandbox = sinon.sandbox.create();

    provider = new GithubProvider('janbaer', 'wiki');
    sandbox.stub(paramHandler, 'createProviderFromRequest').returns(provider);
  });

  describe('When user wants to list all existing pages', function () {
    beforeEach(function () {
      sandbox.stub(provider, 'getPages').returns(new Q([ {name: 'page1'}, {name: 'page2'}, {name: 'index'}, {name: 'home'}, {name: 'readme'}]));
    });

    afterEach(function () {
      sandbox.restore();
    });

    it('should return a list of the pages', function (done) {
      request(app).get('/api/janbaer/wiki/pages')
        .expect('Content-Type', 'application/json')
        .expect(200)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          var pages = res.body;
          should.exists(pages);
          pages.length.should.equal(5);
          done();
        });
    });
  });

});



