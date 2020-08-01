
lychee.define('lychee.net.Remote').tags({
	platform: 'nodejs'
}).requires([
	'lychee.net.protocol.HTTP',
	'lychee.net.protocol.WS'
]).includes([
	'lychee.net.Tunnel'
]).supports(function(lychee, global) {

	if (typeof process !== 'undefined') {
		return true;
	}


	return false;

}).exports(function(lychee, global, attachments) {

	var _BitON = lychee.data.BitON;
	var _JSON  = lychee.data.JSON;



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.__socket      = null;
		this.__isConnected = false;


		lychee.net.Tunnel.call(this, settings);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('connect', function() {
			this.__isConnected = true;
		}, this);

		this.bind('disconnect', function() {
			this.__isConnected = false;
		}, this);

		this.bind('send', function(blob) {

			if (this.__socket !== null) {
				this.__socket.send(blob);
			}

		}, this);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			var data = lychee.net.Tunnel.prototype.serialize.call(this);
			data['constructor'] = 'lychee.net.Remote';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		connect: function(socket) {

			if (this.__isConnected === false) {

				var that = this;


				this.__socket = new lychee.net.protocol.WS(socket, lychee.net.protocol.WS.TYPE.remote);

				this.__socket.ondata = function(blob) {
					that.receive(blob);
				};

				this.__socket.onclose = function(code) {
					that.__socket = null;
					that.trigger('disconnect', [ code ]);
				};


				if (lychee.debug === true) {
					console.log('lychee.net.Remote: Connected to ' + this.host + ':' + this.port);
				}


				return true;

			}


			return false;

		},

		disconnect: function() {

			if (this.__isConnected === true) {

				if (lychee.debug === true) {
					console.log('lychee.net.Remote: Disconnected from ' + this.host + ':' + this.port);
				}

				if (this.__socket !== null) {
					this.__socket.close();
				}


				return true;

			}


			return false;

		}

	};


	return Class;

});

