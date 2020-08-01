/* global describe, it */

var when = require('when');
var delay = require('when/delay');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;

var tsi = require('./testServerInstance');
var util = require('./util');
var config = require('../config');
var oauth = require('../../oauth');


describe('OAuth Module Test', function (require) {

  this.timeout(config.testTimeout);

  describe('#getAuthUrl()', function() {
    it('should get a proper authorization url (WEB/INSTALLED)', function() {
      var url = oauth.getAuthUrl({
	consumerKey: config.reddit.web.key,
	redirectUri: config.reddit.redirectUri,
	state: 'foo'
      });

      expect(url.indexOf('https://www.reddit.com/api/v1/authorize?')).to.not.equal(-1);
      expect(url.indexOf('client_id=' + config.reddit.web.key)).to.not.equal(-1);
      expect(url.indexOf('state=foo')).to.not.equal(-1);
      expect(url.indexOf('redirect_uri=' + encodeURIComponent(config.reddit.redirectUri))).to.not.equal(-1);
      expect(url.indexOf('duration=temporary')).to.not.equal(-1);
      expect(url.indexOf('response_type=code')).to.not.equal(-1);
      expect(url.indexOf('scope=identity')).to.not.equal(-1);
    });

    it('should get a proper authorization url (mobile friendly) (WEB/INSTALLED)', function() {
      var url = oauth.getAuthUrl({
	consumerKey: config.reddit.web.key,
	redirectUri: config.reddit.redirectUri,
	state: 'foo',
	mobile: true
      });

      expect(url.indexOf('https://www.reddit.com/api/v1/authorize.compact?')).to.not.equal(-1);
      expect(url.indexOf('client_id=' + config.reddit.web.key)).to.not.equal(-1);
      expect(url.indexOf('state=foo')).to.not.equal(-1);
      expect(url.indexOf('redirect_uri=' + encodeURIComponent(config.reddit.redirectUri))).to.not.equal(-1);
      expect(url.indexOf('duration=temporary')).to.not.equal(-1);
      expect(url.indexOf('response_type=code')).to.not.equal(-1);
      expect(url.indexOf('scope=identity')).to.not.equal(-1);
    });

    it('should get back a proper authorization url (multiple scopes) (WEB/INSTALLED)', function() {
      var url = oauth.getAuthUrl({
	consumerKey: config.reddit.web.key,
	redirectUri: config.reddit.redirectUri,
	state: 'foo',
	scope: [ 'identity', 'read', 'subscribe' ]
      });

      expect(url.indexOf('https://www.reddit.com/api/v1/authorize?')).to.not.equal(-1);
      expect(url.indexOf('client_id=' + config.reddit.web.key)).to.not.equal(-1);
      expect(url.indexOf('state=foo')).to.not.equal(-1);
      expect(url.indexOf('redirect_uri=' + encodeURIComponent(config.reddit.redirectUri))).to.not.equal(-1);
      expect(url.indexOf('duration=temporary')).to.not.equal(-1);
      expect(url.indexOf('response_type=code')).to.not.equal(-1);
      expect(url.indexOf('scope=' + encodeURIComponent('identity read subscribe'))).to.not.equal(-1);
    });

  });

  describe('#getExplicitAuthUrl()', function() {
    it('should be the same as getAuthUrl()', function() {
      var url = oauth.getExplicitAuthUrl({
	consumerKey: config.reddit.web.key,
	redirectUri: config.reddit.redirectUri,
	state: 'foo',
	scope: [ 'identity', 'read', 'subscribe' ]
      });

      expect(url.indexOf('https://www.reddit.com/api/v1/authorize?')).to.not.equal(-1);
      expect(url.indexOf('client_id=' + config.reddit.web.key)).to.not.equal(-1);
      expect(url.indexOf('state=foo')).to.not.equal(-1);
      expect(url.indexOf('redirect_uri=' + encodeURIComponent(config.reddit.redirectUri))).to.not.equal(-1);
      expect(url.indexOf('duration=temporary')).to.not.equal(-1);
      expect(url.indexOf('response_type=code')).to.not.equal(-1);
      expect(url.indexOf('scope=' + encodeURIComponent('identity read subscribe'))).to.not.equal(-1);
    });
  });

  describe('#getImplicitAuthUrl()', function() {
    it('should get back an implicit grant authorization url', function() {
      var url = oauth.getImplicitAuthUrl({
	consumerKey: config.reddit.installed.key,
	redirectUri: config.reddit.redirectUri,
	state: 'foo'
      });

      expect(url.indexOf('https://www.reddit.com/api/v1/authorize?')).to.not.equal(-1);
      expect(url.indexOf('client_id=' + config.reddit.installed.key)).to.not.equal(-1);
      expect(url.indexOf('state=foo')).to.not.equal(-1);
      expect(url.indexOf('redirect_uri=' + encodeURIComponent(config.reddit.redirectUri))).to.not.equal(-1);
      expect(url.indexOf('response_type=token')).to.not.equal(-1);
      expect(url.indexOf('scope=' + encodeURIComponent('identity'))).to.not.equal(-1);
    });
  });

  describe('#getAuthData()', function() {

    it('(Explicit) it should get an access token', function() {

      var url = oauth.getAuthUrl({
	consumerKey: config.reddit.web.key,
	redirectUri: config.reddit.redirectUri,
	state: 'foo'
      });

      return tsi.standardServer.allowAuthUrl(url).then(function(params) {

	if (params.error) { throw new Error(params.error); }

	expect(params.state).to.equal('foo');
	expect(params.code).to.be.a('string');

	var authorizationCode = params.code;

	return oauth.getAuthData('explicit', {
	  consumerKey: config.reddit.web.key,
	  consumerSecret: config.reddit.web.secret,
	  authorizationCode: authorizationCode,
	  redirectUri: config.reddit.redirectUri
	});
      }).then(function(authData) {
	expect(authData).to.be.an('object');
	if (authData.error) { throw new Error(authData.error); }

	expect(authData.access_token).to.be.a('string');
	expect(authData.token_type).to.equal('bearer');
	expect(authData.expires_in).to.equal(3600);
	expect(authData.scope).to.equal('identity');
      });
    });

    it('(Script) should get an access token', function() {

      return oauth.getAuthData('script', {
        consumerKey: config.reddit.script.key,
        consumerSecret: config.reddit.script.secret,
        username: config.reddit.login.username,
        password: config.reddit.login.password
      }).then(function(authData) {
        expect(authData).to.be.an('object');

        if (authData.error) { throw new Error(authData.error); }

        expect(authData.access_token).to.be.a('string');
        expect(authData.token_type).to.equal('bearer');
        expect(authData.expires_in).to.equal(3600);
        expect(authData.scope).to.equal('identity');
      });
    });

    it('(Script + 1 scope string) should get an access token', function() {

      return oauth.getAuthData('script', {
	consumerKey: config.reddit.script.key,
        consumerSecret: config.reddit.script.secret,
        username: config.reddit.login.username,
        password: config.reddit.login.password,
        scope: 'flair'
      }).then(function(authData) {
        expect(authData).to.be.an('object');

        if (authData.error) { throw new Error(authData.error); }

        expect(authData.access_token).to.be.a('string');
        expect(authData.token_type).to.equal('bearer');
        expect(authData.expires_in).to.equal(3600);
        expect(authData.scope).to.equal('flair');
      });
    });

    it('(Script + 1 scope array) should get an access token', function() {

      return oauth.getAuthData('script', {
	consumerKey: config.reddit.script.key,
        consumerSecret: config.reddit.script.secret,
        username: config.reddit.login.username,
        password: config.reddit.login.password,
        scope: [ 'flair' ]
      }).then(function(authData) {
        expect(authData).to.be.an('object');

        if (authData.error) { throw new Error(authData.error); }

        expect(authData.access_token).to.be.a('string');
        expect(authData.token_type).to.equal('bearer');
        expect(authData.expires_in).to.equal(3600);
        expect(authData.scope).to.equal('flair');
      });
    });

    it('(Script + multi scope array) should get an access token', function() {

      return oauth.getAuthData('script', {
	consumerKey: config.reddit.script.key,
        consumerSecret: config.reddit.script.secret,
        username: config.reddit.login.username,
        password: config.reddit.login.password,
        scope: [ 'flair', 'identity' ]
      }).then(function(authData) {
        expect(authData).to.be.an('object');

        if (authData.error) { throw new Error(authData.error); }

        expect(authData.access_token).to.be.a('string');
        expect(authData.token_type).to.equal('bearer');
        expect(authData.expires_in).to.equal(3600);
        expect(authData.scope).to.equal('flair identity');
      });
    });

  });

});
