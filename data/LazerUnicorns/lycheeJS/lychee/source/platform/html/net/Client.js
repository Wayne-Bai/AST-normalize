
lychee.define('lychee.net.Client').tags({
	platform: 'html'
}).requires([
	'lychee.net.protocol.HTTP',
	'lychee.net.protocol.WS'
]).includes([
	'lychee.net.Tunnel'
]).supports(function(lychee, global) {

	if (typeof WebSocket !== 'undefined') {
		return true;
	}


	return false;

}).exports(function(lychee, global, attachments) {

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
			data['constructor'] = 'lychee.net.Client';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		connect: function() {

			if (this.__isConnected === false) {

				var that = this;


				this.__socket = new WebSocket('ws://' + this.host + ':' + this.port, [ 'lycheejs' ]);

				this.__socket.onopen = function() {
					that.trigger('connect', []);
				};

				this.__socket.onmessage = function(event) {
					that.receive(event.data);
				};

				this.__socket.onclose = function(event) {
					that.__socket = null;
					that.trigger('disconnect', [ event.code || null ]);
				};

				this.__socket.onerror = function(event) {
					that.setReconnect(0);
					this.close();
				};


				if (lychee.debug === true) {
					console.log('lychee.net.Client: Connected to ' + this.host + ':' + this.port);
				}


				return true;

			}


			return false;

		},

		disconnect: function() {

			if (this.__isConnected === true) {

				if (lychee.debug === true) {
					console.log('lychee.net.Client: Disconnected from ' + this.host + ':' + this.port);
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

