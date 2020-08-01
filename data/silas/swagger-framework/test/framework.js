'use strict';

/**
 * Module dependencies.
 */

require('should');

var lodash = require('lodash');
var sinon = require('sinon');

var Api = require('../lib/api');
var Docs = require('../lib/docs');
var Framework = require('../lib/framework');
var Router = require('../lib/framework/router');

var pet = require('./schema/fixtures/pet');

/**
 * Helper functions.
 */

function newSpec() {
  return { basePath: pet.basePath };
}

function newFramework() {
  return new Framework(newSpec());
}

/**
 * Tests
 */

describe('Framework', function() {
  describe('constructor', function() {
    it('should work with new', function(done) {
      var spec = newSpec();

      var framework = new Framework(spec);

      framework.spec.swaggerVersion.should.eql('1.2');
      framework.spec.apis.should.eql([]);
      framework.options.basePath.should.eql(spec.basePath);
      framework.docs.should.be.an.instanceof(Docs);
      framework.router.should.be.an.instanceof(Router);
      framework.apis.should.eql({});
      framework.middleware.should.eql({});

      done();
    });

    it('should work without new', function(done) {
      var spec = newSpec();

      var framework = Framework(spec);  // jshint ignore:line

      framework.spec.swaggerVersion.should.eql('1.2');
      framework.spec.apis.should.eql([]);
      framework.options.basePath.should.eql(spec.basePath);
      framework.docs.should.be.an.instanceof(Docs);
      framework.router.should.be.an.instanceof(Router);
      framework.apis.should.eql({});
      framework.middleware.should.eql({});

      done();
    });
  });

  describe('setup', function() {
    beforeEach(function() {
      this.framework = newFramework();
    });

    it('should setup apis', function(done) {
      var setup = sinon.spy();

      this.framework.apis['/test'] = {
        setup: setup,
      };

      this.framework.setup();

      setup.called.should.eql(true);
      setup.args[0][0].should.eql(this.framework);

      done();
    });
  });

  describe('api', function() {
    beforeEach(function() {
      this.framework = newFramework();
      this.spec = lodash.omit(
        pet,
        'apis',
        'models'
      );
      this.path = this.spec.resourcePath;
    });

    it('should create and register an Api', function(done) {
      this.framework.api(this.spec);

      this.framework.apis.should.have.property(this.path);
      this.framework.apis[this.path].should.be.an.instanceof(Api);
      this.framework.apis[this.path].spec.should.eql(this.spec);

      done();
    });

    it('should register an Api', function(done) {
      var api = new Api(this.spec);

      this.framework.api(api);
      this.framework.apis[this.path].should.eql(api);

      done();
    });
  });

  describe('dispatcher', function() {
    beforeEach(function() {
      this.framework = newFramework();
    });

    it('should call setup', function(done) {
      var setup = sinon.spy();

      this.framework.setup = setup;

      this.framework.dispatcher();

      setup.called.should.eql(true);

      done();
    });

    it('should call router.dispatcher with options', function(done) {
      var dispatcher = sinon.spy();
      var options = {};

      this.framework.router.dispatcher = dispatcher;
      this.framework.setup = sinon.spy();

      this.framework.dispatcher(options);

      dispatcher.called.should.eql(true);
      dispatcher.args[0][0].should.eql(options);

      done();
    });
  });
});
