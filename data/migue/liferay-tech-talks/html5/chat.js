var MESSAGE = 'message',
	SYSTEM = 'system',
	USER = 'user';

var YUI = require("yui3").YUI;

var Chat = function(config) {
	this._config = config;
};

Chat.prototype = {
	constructor: Chat,

	run: function(io) {
		YUI().use('escape', function(Y) {
			'use strict';

			var users = [];

			var chatServer = io.of('/chat').on('connection', function(socket) {
				var userName, usersList = [];

				socket.emit(MESSAGE, 'Welcome to the chat server!');
				socket.emit(MESSAGE, 'Please, introduce yourself!');

				users.forEach(function(user) {
					usersList.push('<div>', Y.Escape.html(user), '</div>');
				});

				socket.emit('users', usersList.join(''));

				socket.on(MESSAGE, function(message) {
					if (!userName) {
						userName = message;

						if (users.indexOf(userName) >= 0) {
							userName += '_1';
						}

						users.push(userName);

						socket.set('userName', userName, function () {
							socket.emit('ready');
						});

						var escapedUserName = Y.Escape.html(userName);

						socket.emit(MESSAGE, 'Welcome, ' + escapedUserName + '!');

						socket.broadcast.emit(SYSTEM, '<em>user: <strong>' + escapedUserName + '</strong> connected</em>');

						chatServer.emit(USER, {
							connected: true,
							user: escapedUserName
						});
					} else {
						chatServer.emit(MESSAGE, Y.Escape.html(userName) + ': ' + Y.Escape.html(message));
					}
				});

				socket.on('disconnect', function () {
					socket.get('userName', function(error, userName) {
						var escapedUserName = Y.Escape.html(userName);

						socket.broadcast.emit(SYSTEM, '<em>user: <strong>' + escapedUserName + '</strong> disconnected</em>');

						var index = users.indexOf(userName);

						if (index >= 0) {
							users.splice(index, 1);

							socket.broadcast.emit(USER, {
								connected: false,
								user: escapedUserName
							});
						}
					});
				});
			});
		});
	}
};

module.exports.Chat = Chat;