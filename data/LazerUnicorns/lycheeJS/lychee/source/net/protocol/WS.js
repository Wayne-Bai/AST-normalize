
lychee.define('lychee.net.protocol.WS').exports(function(lychee, global) {

	/*
	 * HELPERS
	 */

	/*
	 * WebSocket Framing Protocol
	 *
	 *  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
	 * +-+-+-+-+-------+-+-------------+-------------------------------+
	 * |F|R|R|R| opcode|M| Payload len |    Extended payload length    |
	 * |I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
	 * |N|V|V|V|       |S|             |   (if payload len==126/127)   |
	 * | |1|2|3|       |K|             |                               |
	 * +-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
	 * |     Extended payload length continued, if payload len == 127  |
	 * + - - - - - - - - - - - - - - - +-------------------------------+
	 * |                               |Masking-key, if MASK set to 1  |
	 * +-------------------------------+-------------------------------+
	 * | Masking-key (continued)       |          Payload Data         |
	 * +-------------------------------- - - - - - - - - - - - - - - - +
	 * :                     Payload Data continued ...                :
	 * + - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
	 * |                     Payload Data continued ...                |
	 * +---------------------------------------------------------------+
	 *
	 */

	var _fragment = {
		operator: 0x00,
		payload:  new Buffer(0)
	};

	var _encode_buffer = function(data, binary) {

		var type           = this.type;
		var buffer         = null;

		var payload_length = data.length;
		var mask           = false;
		var mask_data      = null;
		var payload_data   = null;


		if (type === Class.TYPE.client) {

			mask      = true;
			mask_data = new Buffer(4);

			mask_data[0] = (Math.random() * 0xff) | 0;
			mask_data[1] = (Math.random() * 0xff) | 0;
			mask_data[2] = (Math.random() * 0xff) | 0;
			mask_data[3] = (Math.random() * 0xff) | 0;

			payload_data = data.map(function(value, index) {
				return value ^ mask_data[index % 4];
			});

		} else {

			mask         = false;
			mask_data    = new Buffer(4);
			payload_data = data.map(function(value) {
				return value;
			});

		}


		// 64 Bit Extended Payload Length
		if (payload_length > 0xffff) {

			var lo = payload_length | 0;
			var hi = (payload_length - lo) / 4294967296;

			buffer = new Buffer((mask === true ? 14 : 10) + payload_length);

			buffer[0] = 128 + (binary === true ? 0x02 : 0x01);
			buffer[1] = (mask === true ? 128 : 0) + 127;

			buffer[2] = (hi >> 24) & 0xff;
			buffer[3] = (hi >> 16) & 0xff;
			buffer[4] = (hi >>  8) & 0xff;
			buffer[5] = (hi >>  0) & 0xff;

			buffer[6] = (lo >> 24) & 0xff;
			buffer[7] = (lo >> 16) & 0xff;
			buffer[8] = (lo >>  8) & 0xff;
			buffer[9] = (lo >>  0) & 0xff;


			if (mask === true) {

				mask_data.copy(buffer, 10);
				payload_data.copy(buffer, 14);

			} else {

				payload_data.copy(buffer, 10);

			}


		// 16 Bit Extended Payload Length
		} else if (payload_length > 125) {

			buffer = new Buffer((mask === true ? 8 : 4) + payload_length);

			buffer[0] = 128 + (binary === true ? 0x02 : 0x01);
			buffer[1] = (mask === true ? 128 : 0) + 126;

			buffer[2] = (payload_length >> 8) & 0xff;
			buffer[3] = (payload_length >> 0) & 0xff;


			if (mask === true) {

				mask_data.copy(buffer, 4);
				payload_data.copy(buffer, 8);

			} else {

				payload_data.copy(buffer, 4);

			}


		// 7 Bit Payload Length
		} else {

			buffer = new Buffer((mask === true ? 6 : 2) + payload_length);

			buffer[0] = 128 + (binary === true ? 0x02 : 0x01);
			buffer[1] = (mask === true ? 128 : 0) + payload_length;


			if (mask === true) {

				mask_data.copy(buffer, 2);
				payload_data.copy(buffer, 6);

			} else {

				payload_data.copy(buffer, 2);

			}

		}


		return buffer;

	};

	var _decode_buffer = function(buffer) {

		var parsed_bytes = -1;
		var type         = this.type;


		var fin            = (buffer[0] & 128) === 128;
		// var rsv1        = (buffer[0] & 64) === 64;
		// var rsv2        = (buffer[0] & 32) === 32;
		// var rsv3        = (buffer[0] & 16) === 16;
		var operator       = buffer[0] & 15;
		var mask           = (buffer[1] & 128) === 128;
		var mask_data      = new Buffer(4);
		var payload_length = buffer[1] & 127;
		var payload_data   = null;

		if (payload_length <= 125) {

			if (mask === true) {
				mask_data    = buffer.slice(2, 6);
				payload_data = buffer.slice(6, 6 + payload_length);
				parsed_bytes = 6 + payload_length;
			} else {
				mask_data    = null;
				payload_data = buffer.slice(2, 2 + payload_length);
				parsed_bytes = 2 + payload_length;
			}

		} else if (payload_length === 126) {

			payload_length = (buffer[2] << 8) + buffer[3];

			if (mask === true) {
				mask_data    = buffer.slice(4, 8);
				payload_data = buffer.slice(8, 8 + payload_length);
				parsed_bytes = 8 + payload_length;
			} else {
				mask_data    = null;
				payload_data = buffer.slice(4, 4 + payload_length);
				parsed_bytes = 4 + payload_length;
			}

		} else if (payload_length === 127) {

			var hi = (buffer[2] << 24) + (buffer[3] << 16) + (buffer[4] << 8) + buffer[5];
			var lo = (buffer[6] << 24) + (buffer[7] << 16) + (buffer[8] << 8) + buffer[9];

			payload_length = (hi * 4294967296) + lo;

			if (mask === true) {
				mask_data    = buffer.slice(10, 14);
				payload_data = buffer.slice(14, 14 + payload_length);
				parsed_bytes = 14 + payload_length;
			} else {
				mask_data    = null;
				payload_data = buffer.slice(10, 10 + payload_length);
				parsed_bytes = 10 + payload_length;
			}

		}


		if (mask_data !== null) {

			payload_data = payload_data.map(function(value, index) {
				return value ^ mask_data[index % 4];
			});

		}


		// 0: Continuation Frame (Fragmentation)
		if (operator === 0x00) {

			if (fin === true) {

				if (_fragment.operator === 0x01) {
					this.ondata(_fragment.payload.toString('utf8'));
				} else if (_fragment.operator === 0x02) {
					this.ondata(_fragment.payload.toString('binary'));
				}


				_fragment.operator = 0x00;
				_fragment.payload  = new Buffer(0);

			} else if (payload_data !== null) {

				var payload = new Buffer(_fragment.payload.length + payload_length);

				_fragment.payload.copy(payload, 0);
				payload_data.copy(payload, _fragment.payload.length);

				_fragment.payload = payload;

			}


		// 1: Text Frame
		} else if (operator === 0x01) {

			if (fin === true) {

				this.ondata(payload_data.toString('utf8'));

			} else {

				_fragment.operator = operator;
				_fragment.payload  = payload_data;

			}


		// 2: Binary Frame
		} else if (operator === 0x02) {

			if (fin === true) {

				this.ondata(payload_data.toString('binary'));

			} else {

				_fragment.operator = operator;
				_fragment.payload  = payload_data;

			}


		// 8: Connection Close
		} else if (operator === 0x08) {

			this.close(Class.STATUS.normal_closure);


		// 9: Ping Frame
		} else if (operator === 0x09) {

			this.__lastping = Date.now();

			if (type === Class.TYPE.remote) {
				this.pong();
			}


		// 10: Pong Frame
		} else if (operator === 0x0a) {

			this.__lastpong = Date.now();

			if (type === Class.TYPE.client) {
				_reset_ping.call(this);
			}


		// 3-7: Reserved Non-Control Frames, 11-15: Reserved Control Frames
		} else {

			this.close(Class.STATUS.protocol_error);

		}


		return parsed_bytes;

	};

	var _reset_ping = function() {

		var type = this.type;
		if (type === Class.TYPE.client) {

			if (this.__interval !== null) {
				clearInterval(this.__interval);
			}


			var that = this;

			this.__interval = setInterval(function() {
				that.ping();
			}, 60000);

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(socket, type) {

		type = lychee.enumof(Class.TYPE, type) ? type : null;


		this.socket  = socket;
		this.type    = type;
		this.ondata  = function() {};
		this.onclose = function(err) {};


		this.__lastping = 0;
		this.__lastpong = 0;
		this.__interval = null;
		this.__isClosed = false;



		if (lychee.debug === true) {

			if (this.type === null) {
				console.error('lychee.net.protocol.WS: Invalid (lychee.net.protocol.WS.TYPE) type.');
			}

		}



		/*
		 * INITIALIZATION
		 */

		var that = this;
		var temp = new Buffer(0);

		this.socket.on('data', function(data) {

			if (data.length > Class.FRAMESIZE) {

				that.close(Class.STATUS.message_too_big);

			} else if (that.__isClosed === false) {

				// Use a temporary Buffer for easier parsing
				var tmp = new Buffer(temp.length + data.length);
				temp.copy(tmp);
				data.copy(tmp, temp.length);
				temp = tmp;

				var parsed_bytes = _decode_buffer.call(that, temp);
				if (parsed_bytes !== -1) {

					tmp = new Buffer(temp.length - parsed_bytes);
					temp.copy(tmp, 0, parsed_bytes);
					temp = tmp;

				}

			}

		});

		this.socket.on('error', function() {
			that.close(Class.STATUS.protocol_error);
		});

		this.socket.on('timeout', function() {
			that.close(Class.STATUS.going_away);
		});

		this.socket.on('end', function() {
			that.close(Class.STATUS.normal_closure);
		});

		this.socket.on('close', function() {
			that.close(Class.STATUS.normal_closure);
		});


		_reset_ping.call(this);

	};


	// Class.FRAMESIZE = 32768; // 32kB
	Class.FRAMESIZE = 0x800000; // 8MiB


	Class.STATUS = {

		// IESG_HYBI
		normal_closure:     1000,
		going_away:         1001,
		protocol_error:     1002,
		unsupported_data:   1003,
		no_status_received: 1005,
		abnormal_closure:   1006,
		invalid_payload:    1007,
		policy_violation:   1008,
		message_too_big:    1009,
		missing_extension:  1010,
		internal_error:     1011,

		// IESG_HYBI Current
		service_restart:    1012,
		service_overload:   1013,

		// IESG_HYBI
		tls_handshake:      1015

	};


	Class.TYPE = {
		// 'default': 0, (deactivated)
		'client': 1,
		'remote': 2
	};


	Class.prototype = {

		ping: function() {

			var type = this.type;
			if (type === Class.TYPE.client) {

				if (Date.now() > this.__lastping + 10000) {

					var buffer = new Buffer(6);

					// FIN, Ping
					// Masked, 0 payload

					buffer[0] = 128 + 0x09;
					buffer[1] = 128 + 0x00;

					buffer[2] = (Math.random() * 0xff) | 0;
					buffer[3] = (Math.random() * 0xff) | 0;
					buffer[4] = (Math.random() * 0xff) | 0;
					buffer[5] = (Math.random() * 0xff) | 0;


					return this.socket.write(buffer);


				}

			}


			return false;

		},

		pong: function() {

			var type = this.type;
			if (type === Class.TYPE.remote) {

				if (Date.now() > this.__lastping) {

					var buffer = new Buffer(2);

					// FIN, Pong
					// Unmasked, 0 payload

					buffer[0] = 128 + 0x0a;
					buffer[1] =   0 + 0x00;


					return this.socket.write(buffer);

				}

			}


			return false;

		},

		send: function(payload, binary) {

			binary = binary === true;


			var blob = null;

			if (typeof payload === 'string') {
				blob = new Buffer(payload, 'utf8');
			} else if (payload instanceof Buffer) {
				blob = payload;
			}


			if (blob !== null) {

				if (this.__isClosed === false) {

					var buffer = _encode_buffer.call(this, blob, binary);
					if (buffer !== null) {

						this.socket.write(buffer);

						delete buffer;
						delete blob;

						return true;

					}

				}

			}


			return false;

		},

		close: function(status) {

			status = typeof status === 'number' ? status : Class.STATUS.normal_closure;


			if (this.__isClosed === false) {

				var buffer = new Buffer(4);

				buffer[0]  = 128 + 0x08;
				buffer[1]  =   0 + 0x02;

				buffer.write(String.fromCharCode((status >> 8) & 0xff) + String.fromCharCode((status >> 0) & 0xff), 2, 'binary');


				this.socket.write(buffer);
				this.socket.end();
				this.socket.destroy();


				this.__isClosed = true;
				this.onclose(status);


				return true;

			}


			return false;

		}

	};


	return Class;

});

