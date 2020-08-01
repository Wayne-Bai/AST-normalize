
lychee.define('game.net.Client').requires([
	'lychee.data.BitON',
	'game.net.client.Highscore',
	'game.net.client.Ping'
]).includes([
	'lychee.net.Client'
]).exports(function(lychee, game, global, attachments) {

	var _BitON     = lychee.data.BitON;
	var _highscore = game.net.client.Highscore;
	var _ping      = game.net.client.Ping;


	var Class = function(data) {

		var settings = lychee.extend({
			codec:     _BitON,
			reconnect: 10000
		}, data);


		lychee.net.Client.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('connect', function() {

			this.addService(new _highscore(this));
			this.addService(new _ping(this));

			if (lychee.debug === true) {
				console.log('(Boilerplate) game.net.Client: Remote connected');
			}

		}, this);

		this.bind('disconnect', function(code) {

			if (lychee.debug === true) {
				console.log('(Boilerplate) game.net.Client: Remote disconnected (' + code + ')');
			}

		}, this);


		this.connect();

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			var data = lychee.net.Client.prototype.serialize.call(this);
			data['constructor'] = 'game.net.Client';


			return data;

		}

	};


	return Class;

});

