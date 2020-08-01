require('chai').should();

var fakeweb = require('node-fakeweb');
var path = require('path');
var helper = require(path.join(__dirname, '..', '..', 'support',
  'locker-helper.js'));

var follows = require(path.join('services', 'instagram', 'follows.js'));
var feed = require(path.join('services', 'instagram', 'feed.js'));

describe("Instagram connector", function () {
  var pinfo;
  var apiBase = "https://api.instagram.com:443/v1/";

  beforeEach(function () {
    fakeweb.allowNetConnect = false;

    pinfo = helper.loadFixture(path.join(__dirname, '..', '..', 'fixtures',
      'connectors', 'instagram.json'));
  });

  afterEach(function () {
    fakeweb.tearDown();
  });

  describe("follows synclet", function () {
    beforeEach(function () {
      fakeweb.registerUri({
        uri: apiBase + '/users/self/follows?access_token=token&count=100',
        file: __dirname + '/../../fixtures/synclets/instagram/follows.json'
      });
    });

    it('can fetch friend information', function (done) {
      follows.sync(pinfo, function (err, response) {
        if (err) return done(err);
        response.data['contact:42@instagram/follows'][0].id.should
          .equal('8327977');
        done();
      });
    });
  });

  describe("feed synclet", function () {
    beforeEach(function () {
      fakeweb.registerUri({
        uri: apiBase + '/users/self/feed?access_token=token&count=100',
        file: __dirname + '/../../fixtures/synclets/instagram/feed.json'
      });
    });

    it('can fetch feed', function (done) {
      pinfo.config = {};
      feed.sync(pinfo, function (err, response) {
        if (err) return done(err);
        response.data['photo:42@instagram/feed'][0].id.should
          .equal('166833681386450342_1802');
        done();
      });
    });
  });
});
