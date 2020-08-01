var assert = require('assert')
  , config = require('../config')
  , fixtures = require('../fixtures')
  , nitrogen = require('../../lib');

describe('message', function() {

    it('should send a message and receive it over a subscription', function(done) {
        var service = new nitrogen.Service(config);
        var subscriptionPassed = false;
        var restPassed = false;

        service.connect(fixtures.models.camera, function(err, session) {
            assert.equal(err, null);

            var message = new nitrogen.Message({
                type: 'image',
                body: {
                    url: 'http://localhost:3030/blobs/237849732497982'
                }
            });

            var subId = session.onMessage(function(message) {
                if (message.body.url !== 'http://localhost:3030/blobs/237849732497982') return;

                subscriptionPassed = true;
                session.disconnectSubscription(subId);

                if (subscriptionPassed && restPassed) done();
            });

            setTimeout(function() {
                message.send(session, function(err, messages) {
                    assert.equal(err, null);

                    messages.forEach(function(message) {
                        assert.equal(message.body.url, 'http://localhost:3030/blobs/237849732497982');
                        assert.notEqual(message.id, undefined);
                        assert.equal(message.type, 'image');
                        assert.notEqual(message.ts, undefined);
                        assert.equal(typeof message.ts, 'object');

                        // this should fail since session is not admin.  just test making the request successfully
                        // since service itself has tests to cover functionality.
                        message.remove(session, function(err) {
                            assert.equal(!err, false);

                            restPassed = true;
                            if (subscriptionPassed && restPassed) done();
                        });
                    });

                });
            }, 200);
        });
    });

    it('has a default constructor', function(done) {
        var service = new nitrogen.Service(config);
        service.connect(fixtures.models.camera, function(err, session) {
            var message = new nitrogen.Message();
            assert.notEqual(message.ts, null);

            done();
        });
	});

    it('find with no query returns all messages', function(done) {
        var service = new nitrogen.Service(config);
        service.connect(fixtures.models.camera, function(err, session) {
            nitrogen.Message.find(session, {}, { skip: 0, sort: { ts: 1 } }, function(err, messages) {
                assert(!err);
                assert.equal(messages.length > 0, true);
                done();
            });
        });
    });

});
