
'use strict';

var async = require('async'),

	db = require('../database'),
	topics = require('../topics'),
	user = require('../user'),
	helpers = require('./helpers'),
	groups = require('../groups'),
	categories = require('../categories'),
	plugins = require('../plugins');

module.exports = function(privileges) {

	privileges.topics = {};

	privileges.topics.get = function(tid, uid, callback) {
		var topic;
		async.waterfall([
			async.apply(topics.getTopicFields, tid, ['cid', 'uid', 'locked']),
			function(_topic, next) {
				topic = _topic;
				async.parallel({
					'topics:reply': async.apply(helpers.isUserAllowedTo, 'topics:reply', uid, [topic.cid]),
					read: async.apply(helpers.isUserAllowedTo, 'read', uid, [topic.cid]),
					isOwner: function(next) {
						next(null, parseInt(uid, 10) === parseInt(topic.uid, 10));
					},
					isAdministrator: async.apply(user.isAdministrator, uid),
					isModerator: async.apply(user.isModerator, uid, topic.cid),
					disabled: async.apply(categories.getCategoryField, topic.cid, 'disabled')
				}, next);
			}
		], function(err, results) {
			if (err) {
				return callback(err);
			}

			var disabled = parseInt(results.disabled, 10) === 1;
			var locked = parseInt(topic.locked, 10) === 1;
			var	isAdminOrMod = results.isAdministrator || results.isModerator;
			var editable = isAdminOrMod;
			var deletable = isAdminOrMod || results.isOwner;

			plugins.fireHook('filter:privileges.topics.get', {
				'topics:reply': (results['topics:reply'][0] && !locked) || isAdminOrMod,
				read: results.read[0] || isAdminOrMod,
				view_thread_tools: editable || deletable,
				editable: editable,
				deletable: deletable,
				view_deleted: isAdminOrMod || results.isOwner,
				disabled: disabled,
				tid: tid,
				uid: uid
			}, callback);
		});
	};

	privileges.topics.can = function(privilege, tid, uid, callback) {
		topics.getTopicField(tid, 'cid', function(err, cid) {
			if (err) {
				return callback(err);
			}

			privileges.categories.can(privilege, cid, uid, callback);
		});
	};

	privileges.topics.filter = function(privilege, tids, uid, callback) {
		if (!Array.isArray(tids) || !tids.length) {
			return callback(null, []);
		}

		topics.getTopicsFields(tids, ['tid', 'cid'], function(err, topics) {
			if (err) {
				return callback(err);
			}

			var cids = topics.map(function(topic) {
				return topic.cid;
			});

			privileges.categories.filterCids(privilege, cids, uid, function(err, cids) {
				if (err) {
					return callback(err);
				}

				tids = topics.filter(function(topic) {
					return cids.indexOf(topic.cid) !== -1;
				}).map(function(topic) {
					return topic.tid;
				});

				plugins.fireHook('filter:privileges.topics.filter', {
					privilege: privilege,
					uid: uid,
					tids: tids
				}, function(err, data) {
					callback(err, data ? data.tids : null);
				});
			});
		});
	};

	privileges.topics.canEdit = function(tid, uid, callback) {
		helpers.some([
			function(next) {
				topics.isOwner(tid, uid, next);
			},
			function(next) {
				isAdminOrMod(tid, uid, next);
			}
		], callback);
	};

	privileges.topics.canMove = function(tid, uid, callback) {
		isAdminOrMod(tid, uid, callback);
	};

	function isAdminOrMod(tid, uid, callback) {
		helpers.some([
			function(next) {
				topics.getTopicField(tid, 'cid', function(err, cid) {
					if (err) {
						return next(err);
					}
					user.isModerator(uid, cid, next);
				});
			},
			function(next) {
				user.isAdministrator(uid, next);
			}
		], callback);
	}
};
