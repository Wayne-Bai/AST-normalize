var ContextIO = require('../lib/ContextIO.js'),
	hlp = require('./helpers/helpers.js'),
	tData = require('./helpers/data.js').data.accounts.connect_tokens,
	tDataBase = require('./helpers/data.js').data.connect_tokens,
	vows = require('vows'),
	assert = require('assert'),
	fs = require('fs'),
	path = require('path');

var ctxio = new ContextIO.Client(hlp.apiVersion, 'https://api.context.io', hlp.apiKeys);

vows.describe('ContextIO/accounts/connect_tokens').addBatch({
	'A list': {
		'being fetched': {
			topic: function () {
				ctxio.accounts(tData.account_id).connectTokens().get(this.callback);
			},
			'made the right API call': hlp.macros.assertCall('accounts/'+tData.account_id+'/connect_tokens', 'GET'),
			'responds with 200': hlp.macros.assertStatus(200),
			'returns an array': hlp.macros.assertBodyType('isArray')
		}
	}
}).addBatch({
	'Manipulating instances ': {
		'by creating one': {
			topic: function () {
				ctxio.accounts(tData.account_id).connectTokens().post(tDataBase.createParams, this.callback);
			},
			'made the right API call': hlp.macros.assertCall('accounts/'+tData.account_id+'/connect_tokens', 'POST'),
			'responds with 201': hlp.macros.assertStatus(201),
			
			'and fetching it': {
				topic: function (createResp) {
					ctxio.accounts(tData.account_id).connectTokens(createResp.body.token).get(this.callback);
				},
				'made the right API call': hlp.macros.assertCall('accounts/'+tData.account_id+'/connect_tokens/*', 'GET'),
				'responds with 200': hlp.macros.assertStatus(200),
				'returns an object': hlp.macros.assertBodyType('isObject'),
				'validates the instance has the correct properties': function (err, r) {
					assert.equal(r.body.first_name, tDataBase.createParams.first_name);
					assert.equal(r.body.last_name, tDataBase.createParams.last_name);
					assert.equal(r.body.callback_url, tDataBase.createParams.callback_url);
					assert.equal(r.body.service_level.toLowerCase(), tDataBase.createParams.service_level.toLowerCase());
				},
				
						
				'then deleting it': {
					topic: function (fetchResp) {
						ctxio.accounts(tData.account_id).connectTokens(fetchResp.body.token).delete(this.callback);
					},
					'made the right API call': hlp.macros.assertCall('accounts/'+tData.account_id+'/connect_tokens/*', 'DELETE'),
					'responds with 200': hlp.macros.assertStatus(200),
					
					'and attempting to fetch it': {
						topic: function (deleteResp, deleteReqInfo, fetchResp) {
							ctxio.accounts(tData.account_id).connectTokens(fetchResp.body.token).get(this.callback);
						},
						'made the right API call': hlp.macros.assertCall('accounts/'+tData.account_id+'/connect_tokens/*', 'GET'),
						'validates the instance has been deleted': hlp.macros.assertStatus(404)
					}
				}
			}
		}
	}
}).export(module);