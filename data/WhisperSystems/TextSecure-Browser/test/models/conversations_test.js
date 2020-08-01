/* vim: ts=4:sw=4:expandtab
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

(function () {
    'use strict';
    var attributes = { type: 'outgoing',
                        body: 'hi',
                        conversationId: 'foo',
                        attachments: [],
                        timestamp: new Date().getTime() };
    var conversation_attributes= {
        type: 'private',
        id: '+14155555555'
    };

    describe('ConversationCollection', function() {
        before(clearDatabase);
        after(clearDatabase);

        it('adds without saving', function(done) {

            var convos = new Whisper.ConversationCollection();
            convos.add(conversation_attributes);
            assert.notEqual(convos.length, 0);

            var convos = new Whisper.ConversationCollection();
            convos.fetch().then(function() {
                assert.strictEqual(convos.length, 0);
                done();
            });
        });

        it('saves asynchronously', function(done) {
            new Whisper.ConversationCollection().add(conversation_attributes).save().then(done);
        });

        it('fetches persistent convos', function(done) {
            var convos = new Whisper.ConversationCollection();
            assert.strictEqual(convos.length, 0);
            convos.fetch().then(function() {
                var m = convos.at(0).attributes;
                _.each(conversation_attributes, function(val, key) {
                    assert.deepEqual(m[key], val);
                });
                done();
            });
        });

        it('destroys persistent convos', function(done) {
            var convos = new Whisper.ConversationCollection();
            convos.fetch().then(function() {
                convos.destroyAll().then(function() {
                    var convos = new Whisper.ConversationCollection();
                    convos.fetch().then(function() {
                        assert.strictEqual(convos.length, 0);
                        done();
                    });
                });
            });
        });

        it('should be ordered newest to oldest', function() {
            var conversations = new Whisper.ConversationCollection();
            // Timestamps
            var today = new Date();
            var tomorrow = new Date();
            tomorrow.setDate(today.getDate()+1);

            // Add convos
            conversations.add({ timestamp: today });
            conversations.add({ timestamp: tomorrow });

            var models = conversations.models;
            var firstTimestamp = models[0].get('timestamp').getTime();
            var secondTimestamp = models[1].get('timestamp').getTime();

            // Compare timestamps
            assert(firstTimestamp > secondTimestamp);
        });
    });

    describe('Conversation', function() {
        var attributes = { type: 'private', id: '+18085555555' };
        before(function(done) {
            var convo = new Whisper.ConversationCollection().add(attributes);
            convo.save().then(function() {
                var message = convo.messageCollection.add({
                    body           : 'hello world',
                    conversationId : convo.id,
                    type           : 'outgoing',
                    sent_at        : Date.now(),
                    received_at    : Date.now()
                });
                message.save().then(done)
            });
        });
        after(clearDatabase);

        it('contains its own messages', function (done) {
            var convo = new Whisper.ConversationCollection().add({id: '+18085555555'});
            convo.fetchMessages().then(function() {
                assert.notEqual(convo.messageCollection.length, 0);
                done();
            });
        });

        it('contains only its own messages', function (done) {
            var convo = new Whisper.ConversationCollection().add({id: '+18085556666'});
            convo.fetchMessages().then(function() {
                assert.strictEqual(convo.messageCollection.length, 0);
                done();
            });
        });

        it('adds conversation to message collection upon leaving group', function() {
            var convo = new Whisper.ConversationCollection().add({type: 'group'});
            convo.leaveGroup();
            assert.notEqual(convo.messageCollection.length, 0);
        });

        it('has a title', function() {
            var convos = new Whisper.ConversationCollection();
            var convo = convos.add(attributes);
            assert.equal(convo.getTitle(), convo.id);

            convo = convos.add({type: ''});
            assert.equal(convo.getTitle(), 'Unknown group');

            convo = convos.add({name: 'name'});
            assert.equal(convo.getTitle(), 'name');
        });

        it('returns the number', function() {
            var convos = new Whisper.ConversationCollection();
            var convo = convos.add(attributes);
            assert.equal(convo.getNumber(), convo.id);

            convo = convos.add({type: ''});
            assert.equal(convo.getNumber(), '');
        });

        it('has an avatar URL', function() {
            var convo = new Whisper.ConversationCollection().add(attributes);
            assert.equal(convo.getAvatarUrl(), '/images/default.png');
        });

        it('revokes the avatar URL', function() {
            var convo = new Whisper.ConversationCollection().add(attributes);
            convo.revokeAvatarUrl();
            assert.notOk(convo.avatarUrl);
        });
    });

})();;
