var assert = require('assert')
  , config = require('../config')
  , fixtures = require('../fixtures')
  ,	nitrogen = require('../../lib');

describe('service object', function() {

    var service = new nitrogen.Service(config);

    it('should be able to connect device', function(done) {
        service.connect(fixtures.models.camera, function(err, session, camera) {
            assert(!err);
            assert(session);

            session.log.info("i can successfully log too");

            done();
        });
	});

    it('should be able to authenticate user', function(done) {
        service.authenticate(fixtures.models.user, function(err, session, user) {
            assert(!err);
            assert(session);
            assert(user);

            done();
        });
    });

    it('camera should be able to impersonate itself', function(done) {
        service.connect(fixtures.models.camera, function(err, session, camera) {
            assert(!err);
            assert(session);

            session.impersonate(camera.id, function(err, impersonationSession) {
                assert(!err);
                assert(impersonationSession);

                done();
            });
        });
    });

    it('thermometer should be not be able to impersonate the camera', function(done) {
        var thermometer = new nitrogen.Device({
            nickname: "thermometer",
            api_key: fixtures.models.userApiKey.key
        });

        service.connect(thermometer, function(err, session, thermometer) {
            assert(!err);
            assert(session);

            session.impersonate(fixtures.models.camera.id, function(err, impersonationSession) {
                assert.equal(err.statusCode, 403);
                assert(err.message);

                done();
            });
        });
    });

    it('should be able to resume device session with valid accessToken', function(done) {
        var thermometer = new nitrogen.Device({
            nickname: "thermometer2",
            api_key: fixtures.models.userApiKey.key
        });

        service.connect(thermometer, function(err, session, thermometer) {
            assert(!err);
            assert(session);

            var resumedThermometer = new nitrogen.Principal({
                accessToken: {
                    token: session.accessToken.token
                },
                id: thermometer.id,
                nickname: thermometer.nickname
            });

            service.resume(resumedThermometer, function(err, resumedSession) {
                assert(!err);
                assert(resumedSession);

                assert.equal(resumedSession.principal.id, thermometer.id);

                done();
            });
        });
    });
});
