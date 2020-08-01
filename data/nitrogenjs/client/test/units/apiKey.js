var assert = require('assert')
  , config = require('../config')
  , fixtures = require('../fixtures')
  , nitrogen = require('../../lib');

describe('apiKey object', function() {
    var service = new nitrogen.Service(config);

    it('should be able to find all api keys for user', function(done) {
        service.authenticate(fixtures.models.user, function(err, session, user) {
            assert(!err);
            assert.notEqual(!session, true);
            assert.notEqual(!user, true);

            nitrogen.ApiKey.find(session, {}, {}, function(err, apiKeys) {
                assert(!err);

                assert(apiKeys.length === 1);
                assert(apiKeys[0].owner === fixtures.models.user.id);

                done();
            });
        });
    });

    it('should be able to create an api key', function(done) {
        service.authenticate(fixtures.models.user, function(err, session, user) {
            assert(!err);
            assert.notEqual(!session, true);
            assert.notEqual(!user, true);

            var apiKey = new nitrogen.ApiKey({
                type: 'app',
                name: 'My App',
                redirect_uri: 'http://myserver'
            });

            apiKey.create(session, function(err, apiKey) {
                assert(!err);
                assert(apiKey.id);

                done();
            });
        });
    });
});
