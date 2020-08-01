var ContextIO = require('../lib/ContextIO.js'),
	hlp = require('./helpers/helpers.js'),
	tData = require('./helpers/data.js').data.oauth_providers,
	vows = require('vows'),
	assert = require('assert'),
	fs = require('fs'),
	path = require('path');

var ctxio = new ContextIO.Client(hlp.apiVersion, 'https://api.context.io', hlp.apiKeys);

vows.describe('ContextIO/oauth_providers').addBatch({
	'Listing instances ': {
		topic: function () {
			ctxio.oauthProviders().get(this.callback);
		},
		'made the right API call': hlp.macros.assertCall('oauth_providers', 'GET'),
		'responds with 200': hlp.macros.assertStatus(200),
		'returns an array': hlp.macros.assertBodyType('isArray')
	}
}).addBatch({
	'Manipulating instances ': {
		'by creating one': {
			topic: function () {
				ctxio.oauthProviders().post(tData.createParams, this.callback);
			},
			'made the right API call': hlp.macros.assertCall('oauth_providers', 'POST'),
			'responds with 201': hlp.macros.assertStatus(201),
			
			'and fetching it': {
				topic: function (createResp) {
					ctxio.oauthProviders(createResp.body.provider_consumer_key).get(this.callback);
				},
				'made the right API call': hlp.macros.assertCall('oauth_providers/*', 'GET'),
				'responds with 200': hlp.macros.assertStatus(200),
				'validates the instance has the correct properties': function (err, r) {
					assert.equal(r.body.type.toUpperCase(), tData.createParams.type);
					assert.equal(r.body.provider_consumer_key, tData.createParams.provider_consumer_key);
					assert.equal(r.body.provider_consumer_secret, tData.fetchCreatedExpectedSecret);
				},
				
						
				'then deleting it': {
					topic: function (fetchResp) {
						ctxio.oauthProviders(fetchResp.body.provider_consumer_key).delete(this.callback);
					},
					'made the right API call': hlp.macros.assertCall('oauth_providers/*', 'DELETE'),
					'responds with 200': hlp.macros.assertStatus(200),
					
					'and attempting to fetch it': {
						topic: function (deleteResp, deleteReqInfo, fetchResp) {
							ctxio.oauthProviders(fetchResp.body.provider_consumer_key).get(this.callback);
						},
						'validates the instance has been deleted': hlp.macros.assertStatus(404)
					}
				}
			}
		}
	}
}).export(module);