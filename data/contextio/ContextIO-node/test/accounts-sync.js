var ContextIO = require('../lib/ContextIO.js'),
	hlp = require('./helpers/helpers.js'),
	tData = require('./helpers/data.js').data.accounts.sync,
	vows = require('vows'),
	assert = require('assert'),
	fs = require('fs'),
	path = require('path');

var ctxio = new ContextIO.Client(hlp.apiVersion, 'https://api.context.io', hlp.apiKeys);

vows.describe('ContextIO/accounts/sync').addBatch({
	'Getting sync info': {
		topic: function () {
			ctxio.accounts(tData.accountId).sync().get(this.callback);
		},
		'made the right API call': hlp.macros.assertCall('accounts/'+tData.accountId+'/sync', 'GET'),
		'responds with 200': hlp.macros.assertStatus(200),
		'returns expected data': function (err, r){
			assert.isObject(r.body);
			assert.ok(tData.sourceLabel in r.body);
			assert.ok('last_sync_start' in r.body[tData.sourceLabel].Inbox);
		}
	},
	'Triggering syncs': {
		topic: function () {
			ctxio.accounts(tData.accountId).sync().post(this.callback);
		},
		'made the right API call': hlp.macros.assertCall('accounts/'+tData.accountId+'/sync', 'POST'),
		'responds with 202': hlp.macros.assertStatus(202),
		'returns an object': hlp.macros.assertBodyType('isObject')
	}
}).export(module);