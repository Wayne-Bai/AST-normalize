require('chai').should();

var fakeweb = require('node-fakeweb');
var path = require('path');
var helper = require(path.join(__dirname, '..', '..', 'support',
  'locker-helper.js'));

var groups = require(path.join('services', 'yammer', 'groups.js'));
var messages = require(path.join('services', 'yammer', 'messages.js'));
var self = require(path.join('services', 'yammer', 'self.js'));
var users = require(path.join('services', 'yammer', 'users.js'));

describe('Yammer connector', function () {
  var apiBase = 'https://www.yammer.com:443/api/v1/';
  var pi;

  beforeEach(function () {
    fakeweb.allowNetConnect = false;
    pi = helper.loadFixture(path.join(__dirname, '..', '..', 'fixtures',
      'synclets', 'yammer', 'yammer.json'));
    pi.config = {};
  });

  afterEach(function () {
    fakeweb.tearDown();
  });

  describe('self synclet', function () {
    var apiSuf = 'users/';

    it('handles invalid data', function (done) {
      fakeweb.registerUri({
        uri: apiBase + apiSuf + pi.auth.token.user.id + '.json?access_token=' +
          pi.auth.token.access_token.token,
        body: "{this: 'is invalid'}"
      });

      self.sync(pi, function (err) {
        done(err);
      });
    });

    it('handles blank data', function (done) {
      fakeweb.registerUri({
        uri: apiBase + apiSuf + pi.auth.token.user.id + '.json?access_token=' +
          pi.auth.token.access_token.token,
        body: ''
      });

      self.sync(pi, function (err) {
        done(err);
      });
    });
  });

  var synclets = [messages, users, groups];
  var suffixes = ['messages', 'users', 'groups'];

  synclets.forEach(function (synclet, i) {
    describe(suffixes[i] + ' synclet', function () {
      it('handles invalid data', function (done) {
        fakeweb.registerUri({
          uri: apiBase + suffixes[i] + '.json?access_token=' +
            pi.auth.token.access_token.token,
          body: "{this: 'is invalid'}"
        });

        synclet.sync(pi, function (err) {
          done(err);
        });
      });

      it('handles blank data', function (done) {
        fakeweb.registerUri({
          uri: apiBase + suffixes[i] + '.json?access_token=' +
            pi.auth.token.access_token.token,
          body: ''
        });

        synclet.sync(pi, function (err) {
          done(err);
        });
      });
    });
  });
});
