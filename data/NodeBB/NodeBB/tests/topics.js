'use strict';
/*global require, before, beforeEach, after*/

var	assert = require('assert'),
	db = require('./mocks/databasemock'),
	topics = require('../src/topics'),
	categories = require('../src/categories'),
	User = require('../src/user');

describe('Topic\'s', function() {
	var topic,
		categoryObj;

	before(function(done) {
		var userData = {
				username: 'John Smith',
				password: 'swordfish',
				email: 'john@example.com',
				callback: undefined
			};

		User.create({username: userData.username, password: userData.password, email: userData.email}, function(err, uid) {
			categories.create({
				name: 'Test Category',
				description: 'Test category created by testing script',
				icon: 'fa-check',
				blockclass: 'category-blue',
				order: '5'
			}, function(err, category) {
				categoryObj = category;

				topic = {
					userId: uid,
					categoryId: categoryObj.cid,
					title: 'Test Topic Title',
					content: 'The content of test topic'
				};
				done();
			});
		});


	});

	describe('.post', function() {

		it('should create a new topic with proper parameters', function(done) {
			topics.post({uid: topic.userId, title: topic.title, content: topic.content, cid: topic.categoryId}, function(err, result) {
				assert.equal(err, null, 'was created with error');
				assert.ok(result);

				done();
			});
		});

		it('should fail to create new topic with invalid user id', function(done) {
			topics.post({uid: null, title: topic.title, content: topic.content, cid: topic.categoryId}, function(err, result) {
				assert.equal(err.message, '[[error:no-privileges]]');
				done();
			});
		});

		it('should fail to create new topic with empty title', function(done) {
			topics.post({uid: topic.userId, title: '', content: topic.content, cid: topic.categoryId}, function(err, result) {
				assert.ok(err);
				done();
			});
		});

		it('should fail to create new topic with empty content', function(done) {
			topics.post({uid: topic.userId, title: topic.title, content: '', cid: topic.categoryId}, function(err, result) {
				assert.ok(err);
				done();
			});
		});

		it('should fail to create new topic with non-existant category id', function(done) {
			topics.post({uid: topic.userId, title: topic.title, content: topic.content, cid: 99}, function(err, result) {
				assert.equal(err.message, '[[error:no-category]]', 'received no error');
				done();
			});
		});
	});

	describe('.reply', function() {
		var newTopic;
		var newPost;

		before(function(done) {
			topics.post({uid: topic.userId, title: topic.title, content: topic.content, cid: topic.categoryId}, function(err, result) {
				newTopic = result.topicData;
				newPost = result.postData;
				done();
			});
		});

		it('should create a new reply with proper parameters', function(done) {
			topics.reply({uid: topic.userId, content: 'test post', tid: newTopic.tid}, function(err, result) {
				assert.equal(err, null, 'was created with error');
				assert.ok(result);

				done();
			});
		});

		it('should fail to create new reply with invalid user id', function(done) {
			topics.reply({uid: null, content: 'test post', tid: newTopic.tid}, function(err, result) {
				assert.equal(err.message, '[[error:no-privileges]]');
				done();
			});
		});

		it('should fail to create new reply with empty content', function(done) {
			topics.reply({uid: topic.userId, content: '', tid: newTopic.tid}, function(err, result) {
				assert.ok(err);
				done();
			});
		});

		it('should fail to create new reply with invalid topic id', function(done) {
			topics.reply({uid: null, content: 'test post', tid: 99}, function(err, result) {
				assert.equal(err.message, '[[error:no-topic]]');
				done();
			});
		});
	});

	describe('Get methods', function() {
		var	newTopic;
		var newPost;

		beforeEach(function(done) {
			topics.post({uid: topic.userId, title: topic.title, content: topic.content, cid: topic.categoryId}, function(err, result) {
				newTopic = result.topicData;
				newPost = result.postData;
				done();
			});
		});

		describe('.getTopicData', function() {
			it('should not receive errors', function(done) {
				topics.getTopicData(newTopic.tid, done);
			});
		});
	});

	after(function() {
		db.flushdb();
	});
});
