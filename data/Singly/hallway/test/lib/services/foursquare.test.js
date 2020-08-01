require('chai').should();

var fakeweb = require('node-fakeweb');
var path = require('path');
var helper = require(path.join(__dirname, '..', '..', 'support',
  'locker-helper.js'));

var friends = require(path.join('services', 'foursquare', 'friends.js'));
var checkins = require(path.join('services', 'foursquare', 'checkins.js'));
var photos = require(path.join('services', 'foursquare', 'photos.js'));
var self = require(path.join('services', 'foursquare', 'self.js'));
var recent = require(path.join('services', 'foursquare', 'recent.js'));

describe("foursquare connector", function () {
  var pinfo;
  var apiBase = "https://api.foursquare.com:443/v2/users/";

  beforeEach(function () {
    fakeweb.allowNetConnect = false;
    pinfo = helper.loadFixture(path.join(__dirname, '..', '..', 'fixtures',
      'connectors', 'foursquare.json'));
  });

  afterEach(function () {
    fakeweb.tearDown();
  });

  describe("self synclet", function () {
    beforeEach(function () {
      fakeweb.registerUri({
        uri: apiBase + 'self?v=20120413&oauth_token=token',
        file: __dirname + '/../../fixtures/synclets/foursquare/self.json'
      });
    });

    it('can fetch self', function (done) {
      self.sync(pinfo, function (err, response) {
        if (err) return done(err);
        response.data['contact:72937@foursquare/self'][0].id.should
          .equal('72937');
        done();
      });
    });
  });

  describe("friends synclet", function () {
    beforeEach(function () {
      fakeweb.registerUri({
        uri: apiBase + 'self/friends?oauth_token=token&limit=100&offset=0',
        file: __dirname + '/../../fixtures/synclets/foursquare/friends.json'
      });

      fakeweb.registerUri({
        uri: 'https://api.foursquare.com:443/v2/multi?oauth_token=token' +
          '&requests=%2Fusers%2F37%2C%2Fusers%2F476%2C%2Fusers%2F516%2C%2Fusers%2F618%2C%2Fusers%2F763',
        file: __dirname + '/../../fixtures/synclets/foursquare/multi.json'
      });

      fakeweb.registerUri({
        uri: 'https://api.foursquare.com:443/v2/multi?oauth_token=token' +
          '&requests=%2Fusers%2F1419%2C%2Fusers%2F2307%2C%2Fusers%2F2928%2C%2Fusers%2F9832%2C%2Fusers%2F11203',
        file: __dirname + '/../../fixtures/synclets/foursquare/none.json'
      });
    });

    it('can fetch friend information', function (done) {
      friends.sync(pinfo, function (err, response) {
        if (err && !response) return done(err);
        response.data['contact:42@foursquare/friends'][0].id.should.equal('37');
        done();
      });
    });
  });

  describe("checkins synclet", function () {
    beforeEach(function () {
      fakeweb.registerUri({
        uri: apiBase + 'self/checkins?limit=250&oauth_token=token&v=20130318',
        file: __dirname + '/../../fixtures/synclets/foursquare/checkins.json'
      });
    });

    it('can fetch checkins', function (done) {
      pinfo.config = {};
      checkins.sync(pinfo, function (err, response) {
        if (err) return done(err);
        response.data['checkin:42@foursquare/checkins'][0].id.should
          .equal('4f8bfeefe4b01f95a53521b9');
        done();
      });
    });
  });

  describe("photos synclet", function () {
    beforeEach(function () {
      fakeweb.registerUri({
        uri: apiBase + 'self/photos?limit=250&offset=0&oauth_token=token',
        file: __dirname + '/../../fixtures/synclets/foursquare/photos.json'
      });
    });

    it('can fetch photos', function (done) {
      pinfo.config = {};
      photos.sync(pinfo, function (err, response) {
        if (err) return done(err);
        response.data['photo:42@foursquare/photos'][0].id.should
          .equal('4f9c352ae4b0e9595aeb8c12');
        done();
      });
    });
  });

  describe("recent synclet", function () {
    beforeEach(function () {
      fakeweb.registerUri({
        uri: 'https://api.foursquare.com:443/v2/checkins/recent' +
          '?limit=100&oauth_token=token',
        file: __dirname + '/../../fixtures/synclets/foursquare/recent.json'
      });
    });

    it('can fetch recents', function (done) {
      pinfo.config = {};
      recent.sync(pinfo, function (err, response) {
        if (err) return done(err);
        response.data['checkin:42@foursquare/recent'][0].id.should
          .equal('4f8c3c3ae4b029818cd11a9d');
        done();
      });
    });
  });
});
