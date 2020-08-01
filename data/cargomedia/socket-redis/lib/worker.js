var redis = require('redis');
var sockjs = require('sockjs');
var _ = require('underscore');
var validator = require('validator');

module.exports = (function() {

	/**
	 * @type {Object}
	 */
	var channels = {};

	/**
	 * @type {Object}
	 */
	var sockjsServer;

	/**
	 * @param {Number} port
	 * @param {String} [sockjsClientUrl]
	 * @param {Object}  [sslOptions]
	 * @constructor
	 */
	function Worker(port, sockjsClientUrl, sslOptions) {
		var allowedLogs = ['error'];
		var sockjsOptions = {};

		sockjsOptions.log = function(severity, message) {
			if (allowedLogs.indexOf(severity) > -1) {
				console.log(severity + "\t" + message);
			}
		};
		if (sockjsClientUrl) {
			sockjsOptions.sockjs_url = sockjsClientUrl;
		}

		sockjsServer = sockjs.createServer(sockjsOptions);
		listen(port, sslOptions);
	}

	/**
	 * @param {String} type
	 * @param {Object} data
	 */
	Worker.prototype.triggerEventDown = function(type, data) {
		switch (type) {
			case 'down-publish':
				sendDownPublish(data.channel, data.event, data.data);
				break;
			case 'down-status-request':
				sendUpStatusRequest(data.requestId, getChannelsData());
				break;
			default:
				console.log("Invalid down event type: `" + type + "`");
				break;
		}
	};

	/**
	 * @param {String} channelId
	 * @param {String} event
	 * @param {Object} data
	 */
	var sendDownPublish = function(channelId, event, data) {
		var channel = channels[channelId];
		if (!channel) {
			return;
		}
		var content = {channel: channelId, event: event, data: data};
		channel.msgs.push({timestamp: new Date().getTime(), content: content});
		if (channel.msgs.length > 10) {
			channel.msgs.splice(0, channel.msgs.length - 10)
		}
		_.each(channel.subscribers, function(subscriber) {
			subscriber.connection.write(JSON.stringify(content));
		});
	};

	/**
	 * @param {String} clientKey
	 * @param {Object} data
	 */
	var sendUpMessage = function(clientKey, data) {
		process.send({type: 'up-message', data: {clientKey: clientKey, data: data}});
	};

	/**
	 * @param {String} channel
	 * @param {String} clientKey
	 * @param {Object} data
	 */
	var sendUpSubscribe = function(channel, clientKey, data) {
		process.send({type: 'up-subscribe', data: {channel: channel, clientKey: clientKey, data: data}});
	};

	/**
	 * @param {String} channel
	 * @param {String} clientKey
	 */
	var sendUpUnsubscribe = function(channel, clientKey) {
		process.send({type: 'up-unsubscribe', data: {channel: channel, clientKey: clientKey}});
	};

	/**
	 * @param {Number} requestId
	 * @param {Object} channels
	 */
	var sendUpStatusRequest = function(requestId, channels) {
		process.send({type: 'up-status-request', data: {requestId: requestId, channels: channels}});
	};

	/**
	 * @return {Object}
	 */
	var getChannelsData = function() {
		var channelsData = {};
		_.each(channels, function(channel, channelId) {
			channelsData[channelId] = _.map(channel.subscribers, function(subscriber) {
				return {clientKey: subscriber.connection.id, data: subscriber.data, subscribeStamp: subscriber.subscribeStamp};
			});
		});
		return channelsData;
	};

	/**
	 * @param {Number} port
	 * @param {Object}  [sslOptions]
	 */
	var listen = function(port, sslOptions) {
		var self = this;
		sockjsServer.on('connection', function(connection) {
			if (!connection) {
				// See https://github.com/cargomedia/socket-redis/issues/41
				console.error('Empty WebSocket connection');
				return;
			}

			var connectionChannelIds = [];

			/**
			 * @param {String} channelId
			 */
			var unsubscribe = function(channelId) {
				connectionChannelIds = _.without(connectionChannelIds, channelId);
				var channel = channels[channelId];
				if (!channel) {
					return;
				}
				sendUpUnsubscribe(channelId, connection.id);
				channel.subscribers = _.reject(channel.subscribers, function(subscriber) {
					return subscriber.connection === connection;
				});
				if (channel.subscribers.length == 0) {
					channel.closeTimeout = setTimeout(function() {
						delete channels[channelId];
					}, 10000);
				}
			};

			/**
			 * @param {String} channelId
			 * @param {String} data
			 * @param {Number} [msgStartTime]
			 */
			var subscribe = function(channelId, data, msgStartTime) {
				if (_.contains(connectionChannelIds, channelId)) {
					return;
				}
				msgStartTime = msgStartTime || new Date().getTime();
				connectionChannelIds.push(channelId);
				if (!channels[channelId]) {
					channels[channelId] = {subscribers: [], msgs: [], closeTimeout: null};
				}
				var channel = channels[channelId];
				clearTimeout(channel.closeTimeout);
				channel.subscribers.push({connection: connection, data: data, subscribeStamp: new Date().getTime()});
				_.each(channel.msgs, function(msg) {
					if (msg.timestamp > msgStartTime) {
						connection.write(JSON.stringify(msg.content));
					}
				});
				sendUpSubscribe(channelId, connection.id, data);
			};

			/**
			 * @param {String} channelId
			 * @param {String} event
			 * @param {Object} data
			 */
			var publish = function(channelId, event, data) {
				event = 'client-' + event;
				if (!channels[channelId]) {
					return;
				}
				process.send({type: 'publish', data: {channel: channelId, event: event, data: data}});
			};

			/**
			 * @param {String} clientKey
			 * @param {Object} data
			 */
			var message = function(clientKey, data) {
				sendUpMessage(clientKey, data);
			};

			connection.on('data', function(data) {
				try {
					data = JSON.parse(data);

					if (validator.isNull(data.event)) {
						throw new Error('Missing `data.event`: `' + JSON.stringify(data) + '`')
					}
					var eventData = data.data;
					switch (data.event) {
						case 'subscribe':
							if (validator.isNull(eventData.channel) || validator.isNull(eventData.data) || !validator.isInt(eventData.start)) {
								throw new Error('Missing data: `' + JSON.stringify(eventData) + '`')
							}

							subscribe(eventData.channel, eventData.data, eventData.start);
							break;

						case 'unsubscribe':
							if (validator.isNull(eventData.channel)) {
								throw new Error('Missing `data.channel`: `' + JSON.stringify(eventData) + '`')
							}

							unsubscribe(eventData.channel);
							break;

						case 'message':
							if (validator.isNull(eventData.data)) {
								throw new Error('Missing `data.data`: `' + JSON.stringify(eventData) + '`')
							}

							message(connection.id, eventData.data);
							break;

						case 'publish':
							if (validator.isNull(eventData.channel) || validator.isNull(eventData.data) || validator.isNull(eventData.event)) {
								throw new Error('Missing data: `' + JSON.stringify(eventData) + '`')
							}

							publish(eventData.channel, eventData.event, eventData.data);
							break;
					}
				} catch (error) {
					console.error('Error processing WebSocket data: ' + error);
				}
			});
			connection.on('close', function() {
				_.each(connectionChannelIds, function(channelId) {
					unsubscribe(channelId);
				});
			});
		});

		var server;
		if (sslOptions) {
			server = require('https').createServer(sslOptions);
		} else {
			server = require('http').createServer();
		}
		sockjsServer.installHandlers(server);
		server.listen(port);
	};

	return Worker;
})();
