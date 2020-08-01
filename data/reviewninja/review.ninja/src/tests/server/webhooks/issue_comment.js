'use strict';
// unit test
var assert = require('assert');
var sinon = require('sinon');

// config
global.config = require('../../../config');

// io
global.io = {emit: function() {}};

// documents
var User = require('../../../server/documents/user').User;
var star = require('../../../server/services/star');
// webhooks
var issue_comment = require('../../../server/webhooks/issue_comment');

// services
var url = require('../../../server/services/url');
var github = require('../../../server/services/github');

describe('issue_comment', function(done) {
    it('should add a ninja star on thumbsup or plus-one', function(done) {
        var req = {
            params: {id: 123456},
            args: require('../../fixtures/webhooks/issue_comment/created.json')
        };

        var userStub = sinon.stub(User, 'findOne', function(args, done) {
            assert.equal(args._id, 123456);
            done(null, {
                token: 'token'
            });
        });

        var githubStub = sinon.stub(github, 'call', function(args, done) {
            assert.equal('pullRequests', args.obj);
            assert.equal('get', args.fun);
            assert.equal('reviewninja', args.arg.user);
            assert.equal('foo', args.arg.repo);
            assert.equal('43', args.arg.number);
            done(null, {
                head: {
                    sha: 'sha'
                }
            });
        });

        var starStub = sinon.spy(star, 'create');

        var ioStub = sinon.stub(io, 'emit', function(event, id) {
            assert.equal('reviewninja:foo:issue-comment-46434016', event);
            assert.equal('61271314', id);
        });

        issue_comment(req, {
            end: function() {
                sinon.assert.called(starStub);
                userStub.restore();
                githubStub.restore();
                ioStub.restore();
                done();
            }
        });
    });
});
