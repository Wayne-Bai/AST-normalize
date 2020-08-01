
(function(lychee, global) {

	/*
	 * HELPERS
	 */

	var _load_asset = function(settings, callback, scope) {

		var proto = settings.url.split(':')[0];
		if (proto === 'file') {

			callback.call(scope, null);

		} else {

			var xhr = new XMLHttpRequest();

			xhr.open('GET', settings.url, true);


			if (settings.headers instanceof Object) {

				for (var header in settings.headers) {
					xhr.setRequestHeader(header, settings.headers[header]);
				}

			}


			xhr.onload = function() {

				try {
					callback.call(scope, xhr.responseText || xhr.responseXML);
				} catch(err) {
					lychee.Debugger.report(lychee.environment, err, null);
				} finally {
					xhr = null;
				}

			};

			xhr.onerror = xhr.ontimeout = function() {

				try {
					callback.call(scope, null);
				} catch(err) {
					lychee.Debugger.report(lychee.environment, err, null);
				} finally {
					xhr = null;
				}

			};


			xhr.send(null);

		}

	};



	/*
	 * POLYFILLS
	 */

	var _log = console.log || function() {};


	if (typeof console.info === 'undefined') {

		console.info = function() {

			var al   = arguments.length;
			var args = new Array(al);
			for (var a = 0; a < al; a++) {
				args[a] = arguments[a];
			}


			args.reverse();
			args.push('[INFO]');
			args.reverse();

			_log.apply(console, args);

		};

	}


	if (typeof console.warn === 'undefined') {

		console.warn = function() {

			var al   = arguments.length;
			var args = new Array(al);
			for (var a = 0; a < al; a++) {
				args[a] = arguments[a];
			}

			args.reverse();
			args.push('[WARN]');
			args.reverse();

			_log.apply(console, args);

		};

	}


	if (typeof console.error === 'undefined') {

		console.error = function() {

			var al   = arguments.length;
			var args = new Array(al);
			for (var a = 0; a < al; a++) {
				args[a] = arguments[a];
			}

			args.reverse();
			args.push('[ERROR]');
			args.reverse();

			_log.apply(console, args);

		};

	}



	/*
	 * FEATURE DETECTION
	 */

	var _audio_supports_ogg = false;
	var _audio_supports_mp3 = false;

	(function() {

		var _buffer_cache = {};
		var _load_buffer  = function(url) {

			var cache = _buffer_cache[url] || null;
			if (cache === null) {

				var xhr = new XMLHttpRequest();

				xhr.open('GET', url, true);
				xhr.responseType = 'arraybuffer';
				xhr.onload = function() {

					var bytes  = new Uint8Array(xhr.response);
					var buffer = new Buffer(bytes.length);

					for (var b = 0, bl = bytes.length; b < bl; b++) {
						buffer[b] = bytes[b];
					}

					cache = _buffer_cache[url] = buffer;

				};
				xhr.send(null);

			}

			return cache;

		};


		var consol = 'console' in global && typeof console !== 'undefined';
		var audio  = 'Audio' in global && typeof Audio !== 'undefined';
		var buffer = true;
		var image  = 'Image' in global && typeof Image !== 'undefined';


		if (consol) {

		} else {

			console = {};

		}


		if (audio) {

			var audiotest = new Audio();

			[ 'application/ogg', 'audio/ogg', 'audio/ogg; codecs=theora, vorbis' ].forEach(function(variant) {

				if (audiotest.canPlayType(variant)) {
					_audio_supports_ogg = true;
				}

			});

			[ 'audio/mpeg' ].forEach(function(variant) {

				if (audiotest.canPlayType(variant)) {
					_audio_supports_mp3 = true;
				}

			});

		} else {

			Audio = function() {

				this.src         = '';
				this.currentTime = 0;
				this.volume      = 0;
				this.autobuffer  = false;
				this.preload     = false;

				this.onload  = null;
				this.onerror = null;

			};


			Audio.prototype = {

				load: function() {

					if (this.onerror !== null) {
						this.onerror.call(this);
					}

				},

				play: function() {

				},

				pause: function() {

				},

				addEventListener: function() {

				}

			};

		}


		Audio.prototype.toString = function(encoding) {

			if (encoding === 'base64') {

				var url = this.src;
				if (url !== '' && url.substr(0, 5) !== 'data:') {

					var buffer = _load_buffer(url);
					if (buffer !== null) {
						return buffer.toString('base64');
					}

				}

				var index = url.indexOf('base64,') + 7;
				if (index > 7) {
					url = url.substr(index, url.length - index);
				}

				return url;

			} else {

				return Object.prototype.toString.call(this);

			}

		};


		if (image) {

		} else {

			Image = function() {

				this.src    = '';
				this.width  = 0;
				this.height = 0;

				this.onload  = null;
				this.onerror = null;

			};


			Image.prototype = {

				load: function() {

					if (this.onerror !== null) {
						this.onerror.call(this);
					}

				}

			};

		}


		Image.prototype.toString = function(encoding) {

			if (encoding === 'base64') {

				var url = this.src;
				if (url !== '' && url.substr(0, 5) !== 'data:') {

					var buffer = _load_buffer(url);
					if (buffer !== null) {
						return buffer.toString('base64');
					}

				}

				var index = url.indexOf('base64,') + 7;
				if (index > 7) {
					url = url.substr(index, url.length - index);
				}

				return url;

			} else {

				return Object.prototype.toString.call(this);

			}

		};


		if (lychee.debug === true) {

			var methods = [];

			if (consol) methods.push('console');
			if (audio)  methods.push('Audio');
			if (buffer) methods.push('Buffer');
			if (image)  methods.push('Image');

			if (methods.length === 0) {
				console.error('bootstrap.js: Supported methods are NONE');
			} else {
				console.info('bootstrap.js: Supported methods are ' + methods.join(', '));
			}

		}

	})();



	/*
	 * BUFFER IMPLEMENTATION
	 */

	var _coerce = function(num) {
		num = ~~Math.ceil(+num);
		return num < 0 ? 0 : num;
	};

	var _clean_base64 = function(str) {

		str = str.trim().replace(/[^+\/0-9A-z]/g, '');

		while (str.length % 4 !== 0) {
			str = str + '=';
		}

		return str;

	};

	var _utf8_to_bytes = function(str) {

		var bytes = [];

		for (var s = 0; s < str.length; s++) {

			var byt = str.charCodeAt(s);
			if (byt <= 0x7F) {
				bytes.push(byt);
			} else {

				var start = s;
				if (byt >= 0xD800 && byt <= 0xDFF) s++;

				var tmp = encodeURIComponent(str.slice(start, s + 1)).substr(1).split('%');
				for (var t = 0; t < tmp.length; t++) {
					bytes.push(parseInt(tmp[t], 16));
				}

			}

		}

		return bytes;

	};

	var _decode_utf8_char = function(str) {

		try {
			return decodeURIComponent(str);
		} catch(e) {
			return String.fromCharCode(0xFFFD);
		}

	};

	var _utf8_to_string = function(buffer, start, end) {

		end = Math.min(buffer.length, end);


		var str = '';
		var tmp = '';

		for (var b = start; b < end; b++) {

			if (buffer[b] <= 0x7F) {
				str += _decode_utf8_char(tmp) + String.fromCharCode(buffer[b]);
				tmp = '';
			} else {
				tmp += '%' + buffer[b].toString(16);
			}

		}

		return str + _decode_utf8_char(tmp);

	};

	var _base64_to_bytes = function(str) {

		if (str.length % 4 === 0) {

			// TODO: Might get performance increase switching to lastIndexOf('=');
			var length       = str.length;
			var placeholders = '=' === str.charAt(length - 2) ? 2 : '=' === str.charAt(length - 1) ? 1 : 0;

			var bytes = new Array(length * 3/4 - placeholders);
			var l     = placeholders > 0 ? str.length - 4 : str.length;


			var _decode = (function() {

				var _PLUS   = '+'.charCodeAt(0);
				var _SLASH  = '/'.charCodeAt(0);
				var _NUMBER = '0'.charCodeAt(0);
				var _LOWER  = 'a'.charCodeAt(0);
				var _UPPER  = 'A'.charCodeAt(0);

				return function(elt) {

					var code = elt.charCodeAt(0);

					if (code === _PLUS)        return 62;
					if (code === _SLASH)       return 63;
					if (code  <  _NUMBER)      return -1;
					if (code  <  _NUMBER + 10) return code - _NUMBER + 26 + 26;
					if (code  <  _UPPER  + 26) return code - _UPPER;
					if (code  <  _LOWER  + 26) return code - _LOWER  + 26;

				};

			})();


			var tmp;
			var b = 0;

			for (var i = 0; i < l; i += 4) {

				tmp = (_decode(str.charAt(i)) << 18) | (_decode(str.charAt(i + 1)) << 12) | (_decode(str.charAt(i + 2)) << 6) | (_decode(str.charAt(i + 3)));

				bytes[b++] = (tmp & 0xFF0000) >> 16;
				bytes[b++] = (tmp & 0xFF00)   >>  8;
				bytes[b++] =  tmp & 0xFF;

			}


			if (placeholders === 2) {

				tmp = (_decode(str.charAt(i)) << 2)  | (_decode(str.charAt(i + 1)) >> 4);

				bytes[b++] = tmp        & 0xFF;

			} else if (placeholders === 1) {

				tmp = (_decode(str.charAt(i)) << 10) | (_decode(str.charAt(i + 1)) << 4) | (_decode(str.charAt(i + 2)) >> 2);

				bytes[b++] = (tmp >> 8) & 0xFF;
				bytes[b++] =  tmp       & 0xFF;

			}


			return bytes;

		}


		return [];

	};

	var _base64_to_string = function(buffer, start, end) {

		var bytes      = buffer.slice(start, end);
		var extrabytes = bytes.length % 3;
		var l          = bytes.length - extrabytes;
		var str        = '';


		var _encode = (function() {

			var _TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

			return function(num) {
				return _TABLE.charAt(num);
			};

		})();


		var tmp;

		for (var i = 0; i < l; i += 3) {

			tmp = (bytes[i] << 16) + (bytes[i + 1] << 8) + (bytes[i + 2]);

			str += (_encode(tmp >> 18 & 0x3F) + _encode(tmp >> 12 & 0x3F) + _encode(tmp >> 6 & 0x3F) + _encode(tmp & 0x3F));

		}


		if (extrabytes === 2) {

			tmp = (bytes[bytes.length - 2] << 8) + (bytes[bytes.length - 1]);

			str += _encode( tmp >> 10);
			str += _encode((tmp >>  4) & 0x3F);
			str += _encode((tmp <<  2) & 0x3F);
			str += '=';

		} else if (extrabytes === 1) {

			tmp = bytes[bytes.length - 1];

			str += _encode( tmp >>  2);
			str += _encode((tmp <<  4) & 0x3F);
			str += '==';

		}


		return str;

	};

	var _binary_to_bytes = function(str) {

		var bytes = [];

		for (var s = 0; s < str.length; s++) {
			bytes.push(str.charCodeAt(s) & 0xFF);
		}

		return bytes;

	};

	var _binary_to_string = function(buffer, start, end) {

		end = Math.min(buffer.length, end);


		var str = '';

		for (var b = start; b < end; b++) {
			str += String.fromCharCode(buffer[b]);
		}

		return str;

	};

	var _copy_buffer = function(source, target, offset, length) {

		var i = 0;

		for (i = 0; i < length; i++) {

			if (i + offset >= target.length) break;
			if (i >= source.length)          break;

			target[i + offset] = source[i];

		}

		return i;

	};


	var Buffer = function(subject, encoding) {

		var type = typeof subject;
		if (type === 'string' && encoding === 'base64') {
			subject = _clean_base64(subject);
		}


		this.length = 0;


		if (Buffer.isBuffer(subject)) {

			this.length = subject.length;

			for (var b = 0; b < this.length; b++) {
				this[b] = subject[b];
			}

		} else if (type === 'string') {

			this.length = Buffer.byteLength(subject, encoding);

			this.write(subject, 0, encoding);

		} else if (type === 'number') {

			this.length = _coerce(subject);

			for (var n = 0; n < this.length; n++) {
				this[n] = 0;
			}

		}


		return this;

	};

	Buffer.byteLength = function(str, encoding) {

		str      = typeof str === 'string'      ? str      : '';
		encoding = typeof encoding === 'string' ? encoding : 'utf8';


		var length = 0;

		if (encoding === 'utf8') {
			length = _utf8_to_bytes(str).length;
		} else if (encoding === 'base64') {
			length = _base64_to_bytes(str).length;
		} else if (encoding === 'binary') {
			length = str.length;
		}

		return length;

	};

	Buffer.isBuffer = function(buffer) {
		return buffer instanceof Buffer;
	};

	Buffer.prototype = {

		serialize: function() {

			return {
				'constructor': 'Buffer',
				'arguments':   [ this.toString('base64'), 'base64' ]
			};

		},

		copy: function(target, target_start, start, end) {

			target_start = typeof target_start === 'number' ? (target_start | 0) : 0;
			start        = typeof start === 'number'        ? (start | 0)        : 0;
			end          = typeof end === 'number'          ? (end   | 0)        : this.length;


			if (start === end)       return;
			if (target.length === 0) return;
			if (this.length === 0)   return;


			end = Math.min(end, this.length);

			var diff        = end - start;
			var target_diff = target.length - target_start;
			if (target_diff < diff) {
				end = target_diff + start;
			}


			for (var b = 0; b < diff; b++) {
				target[b + target_start] = this[b + start];
			}

		},

		map: function(callback) {

			callback = callback instanceof Function ? callback : function(value) { return value; };


			var clone = new Buffer(this.length);

			for (var b = 0; b < this.length; b++) {
				clone[b] = callback(this[b], b);
			}

			return clone;

		},

		slice: function(start, end) {

			var length = this.length;

			start = typeof start === 'number' ? (start | 0) : 0;
			end   = typeof end === 'number'   ? (end   | 0) : length;

			start = Math.min(start, length);
			end   = Math.min(end,   length);


			var diff  = end - start;
			var clone = new Buffer(diff);

			for (var b = 0; b < diff; b++) {
				clone[b] = this[b + start];
			}

			return clone;

		},

		write: function(str, offset, length, encoding) {

			offset   = typeof offset === 'number'   ? offset   : 0;
			encoding = typeof encoding === 'string' ? encoding : 'utf8';


			var remaining = this.length - offset;
			if (typeof length === 'string') {
				encoding = length;
				length   = remaining;
			}

			if (length > remaining) {
				length = remaining;
			}


			var diff = 0;

			if (encoding === 'utf8') {
				diff = _copy_buffer(_utf8_to_bytes(str),   this, offset, length);
			} else if (encoding === 'base64') {
				diff = _copy_buffer(_base64_to_bytes(str), this, offset, length);
			} else if (encoding === 'binary') {
				diff = _copy_buffer(_binary_to_bytes(str), this, offset, length);
			}


			return diff;

		},

		toString: function(encoding, start, end) {

			encoding = typeof encoding === 'string' ? encoding : 'utf8';
			start    = typeof start === 'number'    ? start    : 0;
			end      = typeof end === 'number'      ? end      : this.length;


			if (start === end) {
				return '';
			}


			var str = '';

			if (encoding === 'utf8') {
				str = _utf8_to_string(this,   start, end);
			} else if (encoding === 'base64') {
				str = _base64_to_string(this, start, end);
			} else if (encoding === 'binary') {
				str = _binary_to_string(this, start, end);
			}

			return str;

		}

	};



	/*
	 * CONFIG IMPLEMENTATION
	 */

	var _config_cache = {};


	var _clone_config = function(origin, clone) {

		if (origin.buffer !== null) {

			clone.buffer = JSON.parse(JSON.stringify(origin.buffer));

			clone.__load = false;

		}

	};


	var Config = function(url) {

		url = typeof url === 'string' ? url : null;


		this.url    = url;
		this.onload = null;
		this.buffer = null;

		this.__load = true;


		if (url !== null) {

			if (_config_cache[url] !== undefined) {
				_clone_config(_config_cache[url], this);
			} else {
				_config_cache[url] = this;
			}

		}

	};


	Config.prototype = {

		deserialize: function(blob) {

			if (typeof blob.buffer === 'string') {
				this.buffer = JSON.parse(new Buffer(blob.buffer.substr(29), 'base64').toString('utf8'));
			}

		},

		serialize: function() {

			var blob = {};


			if (this.buffer !== null) {
				blob.buffer = 'data:application/json;base64,' + new Buffer(JSON.stringify(this.buffer), 'utf8').toString('base64');
			}


			return {
				'constructor': 'Config',
				'arguments':   [ this.url ],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

		},

		load: function() {

			if (this.__load === false) {

				if (this.onload instanceof Function) {
					this.onload(true);
					this.onload = null;
				}

				return;

			}


			_load_asset({
				url:     this.url,
				headers: {
					'Content-Type': 'application/json; charset=utf8'
				}
			}, function(raw) {

				var data = null;
				try {
					data = JSON.parse(raw);
				} catch(e) {
				}


				this.buffer = data;
				this.__load = false;


				if (data !== null) {

				} else {

					if (lychee.debug === true) {
						console.error('bootstrap.js: Config at "' + this.url + '" is invalid');
					}

				}


				if (this.onload instanceof Function) {
					this.onload(data !== null);
					this.onload = null;
				}

			}, this);

		}

	};



	/*
	 * FONT IMPLEMENTATION
	 */

	var _parse_font = function() {

		var data = this.__buffer;

		if (typeof data.kerning === 'number' && typeof data.spacing === 'number') {

			if (data.kerning > data.spacing) {
				data.kerning = data.spacing;
			}

		}


		if (data.texture !== undefined) {
			this.texture = new Texture(data.texture);
			this.texture.load();
		}


		this.baseline   = typeof data.baseline === 'number'    ? data.baseline   : this.baseline;
		this.charset    = typeof data.charset === 'string'     ? data.charset    : this.charset;
		this.spacing    = typeof data.spacing === 'number'     ? data.spacing    : this.spacing;
		this.kerning    = typeof data.kerning === 'number'     ? data.kerning    : this.kerning;
		this.lineheight = typeof data.lineheight === 'number'  ? data.lineheight : this.lineheight;


		if (data.map instanceof Array) {

			var offset = this.spacing;

			for (var c = 0, cl = this.charset.length; c < cl; c++) {

				var id  = this.charset[c];
				var chr = {
					width:      data.map[c] + this.spacing * 2,
					height:     this.lineheight,
					realwidth:  data.map[c],
					realheight: this.lineheight,
					x:          offset - this.spacing,
					y:          0
				};

				offset += chr.width;


				this.__charset[id] = chr;

			}

		}


		if (this.texture === null) {

			if (lychee.debug === true) {
				console.error('bootstrap.js: Font at "' + this.url + '" is invalid (No FNT file)');
			}

		}

	};


	var _font_cache = {};


	var _clone_font = function(origin, clone) {

		if (origin.__buffer !== null) {

			clone.__buffer = origin.__buffer;
			clone.__load   = false;

			_parse_font.call(clone);

		}

	};


	var Font = function(url) {

		url = typeof url === 'string' ? url : null;


		this.url        = url;
		this.onload     = null;
		this.texture    = null;

		this.baseline   = 0;
		this.charset    = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';
		this.spacing    = 0;
		this.kerning    = 0;
		this.lineheight = 0;

		this.__buffer   = null;
		this.__load     = true;

		this.__charset     = {};
		this.__charset[''] = {
			width:      0,
			height:     this.lineheight,
			realwidth:  0,
			realheight: this.lineheight,
			x:          0,
			y:          0
		};


		if (url !== null) {

			if (_font_cache[url] !== undefined) {
				_clone_font(_font_cache[url], this);
			} else {
				_font_cache[url] = this;
			}

		}

	};


	Font.prototype = {

		deserialize: function(blob) {

			if (typeof blob.buffer === 'string') {
				this.__buffer = JSON.parse(new Buffer(blob.buffer.substr(29), 'base64').toString('utf8'));
				_parse_font.call(this);
			}

		},

		serialize: function() {

			var blob = {};


			if (this.__buffer !== null) {
				blob.buffer = 'data:application/json;base64,' + new Buffer(JSON.stringify(this.__buffer), 'utf8').toString('base64');
			}


			return {
				'constructor': 'Font',
				'arguments':   [ this.url ],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

		},

		measure: function(text) {

			text = typeof text === 'string' ? text : null;


			if (text !== null) {

				if (text.length === 1) {

					if (this.__charset[text] !== undefined) {
						return this.__charset[text];
					}

				} else if (text.length > 1) {

					var data = this.__charset[text] || null;
					if (data === null) {

						var width = 0;

						for (var t = 0, tl = text.length; t < tl; t++) {
							var chr = this.measure(text[t]);
							width  += chr.realwidth + this.kerning;
						}


						// TODO: Embedded Font ligatures will set x and y values based on settings.map

						data = this.__charset[text] = {
							width:      width,
							height:     this.lineheight,
							realwidth:  width,
							realheight: this.lineheight,
							x:          0,
							y:          0
						};

					}


					return data;

				}

			}


			return this.__charset[''];

		},

		load: function() {

			if (this.__load === false) {

				if (this.onload instanceof Function) {
					this.onload(true);
					this.onload = null;
				}

				return;

			}


			_load_asset({
				url:     this.url,
				headers: {
					'Content-Type': 'application/json; charset=utf8'
				}
			}, function(raw) {

				var data = null;
				try {
					data = JSON.parse(raw);
				} catch(e) {
				}


				if (data !== null) {

					this.__buffer = data;
					this.__load   = false;

					_parse_font.call(this);

				}


				if (this.onload instanceof Function) {
					this.onload(data !== null);
					this.onload = null;
				}

			}, this);

		}

	};



	/*
	 * MUSIC IMPLEMENTATION
	 */

	var _music_cache = {};


	var _clone_music = function(origin, clone) {

		if (origin.buffer !== null) {

			clone.buffer            = new Audio();
			clone.buffer.autobuffer = true;
			clone.buffer.preload    = true;
			clone.buffer.src        = origin.buffer.src;
			clone.buffer.load();

			clone.buffer.addEventListener('ended', function() {
				clone.play();
			}, true);

			clone.__buffer.ogg = origin.__buffer.ogg;
			clone.__buffer.mp3 = origin.__buffer.mp3;
			clone.__load       = false;

		}

	};


	var Music = function(url) {

		url = typeof url === 'string' ? url : null;


		this.url      = url;
		this.onload   = null;
		this.buffer   = null;
		this.volume   = 1.0;
		this.isIdle   = true;

		this.__buffer = { ogg: null, mp3: null };
		this.__load   = true;


		if (url !== null) {

			if (_music_cache[url] !== undefined) {
				_clone_music(_music_cache[url], this);
			} else {
				_music_cache[url] = this;
			}

		}

	};


	Music.prototype = {

		deserialize: function(blob) {

			if (blob.buffer instanceof Object) {

				var url  = null;
				var type = null;

				if (_audio_supports_ogg === true) {

					if (typeof blob.buffer.ogg === 'string') {
						url  = url  || blob.buffer.ogg;
						type = type || 'ogg';
					}

				} else if (_audio_supports_mp3 === true) {

					if (typeof blob.buffer.mp3 === 'string') {
						url  = url  || blob.buffer.mp3;
						type = type || 'mp3';
					}

				}


				if (url !== null && type !== null) {

					var that   = this;
					var buffer = new Audio();

					buffer.addEventListener('ended', function() {
						that.play();
					}, true);

					buffer.autobuffer = true;
					buffer.preload    = true;
					buffer.src        = url;
					buffer.load();

					this.buffer         = buffer;
					this.__buffer[type] = buffer;
					this.__load         = false;

				}

			}

		},

		serialize: function() {

			var blob = {};


			if (this.__buffer.ogg !== null || this.__buffer.mp3 !== null) {

				blob.buffer = {};

				if (this.__buffer.ogg !== null) {
					blob.buffer.ogg = 'data:application/ogg;base64,' + this.__buffer.ogg.toString('base64');
				}

				if (this.__buffer.mp3 !== null) {
					blob.buffer.mp3 = 'data:audio/mp3;base64,' + this.__buffer.mp3.toString('base64');
				}

			}


			return {
				'constructor': 'Music',
				'arguments':   [ this.url ],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

		},

		load: function() {

			if (this.__load === false) {

				if (this.onload instanceof Function) {
					this.onload(true);
					this.onload = null;
				}

				return;

			}


			var url  = this.url;
			var type = null;

			if (_audio_supports_ogg === true) {
				type = type || 'ogg';
			} else if (_audio_supports_mp3 === true) {
				type = type || 'mp3';
			}


			if (url !== null && type !== null) {

				var that   = this;
				var buffer = new Audio();

				buffer.onload = function() {

					that.buffer         = this;
					that.__buffer[type] = this;

					this.toString('base64');
					this.__load = false;

					if (that.onload instanceof Function) {
						that.onload(true);
						that.onload = null;
					}

				};

				buffer.onerror = function() {

					if (that.onload instanceof Function) {
						that.onload(false);
						that.onload = null;
					}

				};

				buffer.addEventListener('ended', function() {
					that.play();
				}, true);

				buffer.autobuffer = true;
				buffer.preload    = true;
				buffer.src        = url + '.' + type;
				buffer.load();


				// TODO: Evaluate if buffer.onload() is necessary
				buffer.onload();

			} else {

				if (this.onload instanceof Function) {
					this.onload(false);
					this.onload = null;
				}

			}

		},

		clone: function() {
			return new Music(this.url);
		},

		play: function() {

			if (this.buffer !== null) {

				try {
					this.buffer.currentTime = 0;
				} catch(e) {
				}

				if (this.buffer.currentTime === 0) {
					this.buffer.play();
					this.isIdle = false;
				}

			}

		},

		pause: function() {

			if (this.buffer !== null) {
				this.buffer.pause();
				this.isIdle = true;
			}

		},

		resume: function() {

			if (this.buffer !== null) {
				this.buffer.play();
				this.isIdle = false;
			}

		},

		stop: function() {

			if (this.buffer !== null) {

				this.buffer.pause();
				this.isIdle = true;

				try {
					this.buffer.currentTime = 0;
				} catch(e) {
				}

			}

		},

		setVolume: function(volume) {

			volume = typeof volume === 'number' ? volume : null;


			if (volume !== null && this.buffer !== null) {

				volume = Math.min(Math.max(0, volume), 1);

				this.buffer.volume = volume;
				this.volume        = volume;

				return true;

			}


			return false;

		}

	};



	/*
	 * SOUND IMPLEMENTATION
	 */

	var _sound_cache = {};


	var _clone_sound = function(origin, clone) {

		if (origin.buffer !== null) {

			clone.buffer            = new Audio();
			clone.buffer.autobuffer = true;
			clone.buffer.preload    = true;
			clone.buffer.src        = origin.buffer.src;
			clone.buffer.load();

			clone.buffer.addEventListener('ended', function() {
				clone.isIdle = true;
				clone.stop();
			}, true);

			clone.__buffer.ogg = origin.__buffer.ogg;
			clone.__buffer.mp3 = origin.__buffer.mp3;
			clone.__load       = false;

		}

	};


	var Sound = function(url) {

		url = typeof url === 'string' ? url : null;


		this.url      = url;
		this.onload   = null;
		this.buffer   = null;
		this.volume   = 1.0;
		this.isIdle   = true;

		this.__buffer = { ogg: null, mp3: null };
		this.__load   = true;


		if (url !== null) {

			if (_sound_cache[url] !== undefined) {
				_clone_sound(_sound_cache[url], this);
			} else {
				_sound_cache[url] = this;
			}

		}

	};


	Sound.prototype = {

		deserialize: function(blob) {

			if (blob.buffer instanceof Object) {

				var url  = null;
				var type = null;

				if (_audio_supports_ogg === true) {

					if (typeof blob.buffer.ogg === 'string') {
						url  = url  || blob.buffer.ogg;
						type = type || 'ogg';
					}

				} else if (_audio_supports_mp3 === true) {

					if (typeof blob.buffer.mp3 === 'string') {
						url  = url  || blob.buffer.mp3;
						type = type || 'mp3';
					}

				}


				if (url !== null && type !== null) {

					var that   = this;
					var buffer = new Audio();

					buffer.addEventListener('ended', function() {
						that.stop();
					}, true);

					buffer.autobuffer = true;
					buffer.preload    = true;
					buffer.src        = url;
					buffer.load();

					this.buffer         = buffer;
					this.__buffer[type] = buffer;
					this.__load         = false;

				}

			}

		},

		serialize: function() {

			var blob = {};


			if (this.__buffer.ogg !== null || this.__buffer.mp3 !== null) {

				blob.buffer = {};

				if (this.__buffer.ogg !== null) {
					blob.buffer.ogg = 'data:application/ogg;base64,' + this.__buffer.ogg.toString('base64');
				}

				if (this.__buffer.mp3 !== null) {
					blob.buffer.mp3 = 'data:audio/mp3;base64,' + this.__buffer.mp3.toString('base64');
				}

			}


			return {
				'constructor': 'Sound',
				'arguments':   [ this.url ],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

		},

		load: function() {

			if (this.__load === false) {

				if (this.onload instanceof Function) {
					this.onload(true);
					this.onload = null;
				}

				return;

			}


			var url  = this.url;
			var type = null;

			if (_audio_supports_ogg === true) {
				type = type || 'ogg';
			} else if (_audio_supports_mp3 === true) {
				type = type || 'mp3';
			}


			if (url !== null && type !== null) {

				var that   = this;
				var buffer = new Audio();

				buffer.onload = function() {

					that.buffer         = this;
					that.__buffer[type] = this;

					this.toString('base64');
					this.__load = false;

					if (that.onload instanceof Function) {
						that.onload(true);
						that.onload = null;
					}

				};

				buffer.onerror = function() {

					if (that.onload instanceof Function) {
						that.onload(false);
						that.onload = null;
					}

				};

				buffer.addEventListener('ended', function() {
					that.isIdle = true;
					that.stop();
				}, true);

				buffer.autobuffer = true;
				buffer.preload    = true;
				buffer.src        = url + '.' + type;
				buffer.load();


				// TODO: Evaluate if buffer.onload() is necessary
				buffer.onload();

			} else {

				if (this.onload instanceof Function) {
					this.onload(false);
					this.onload = null;
				}

			}

		},

		clone: function() {
			return new Sound(this.url);
		},

		play: function() {

			if (this.buffer !== null) {

				try {
					this.buffer.currentTime = 0;
				} catch(e) {
				}

				if (this.buffer.currentTime === 0) {
					this.buffer.play();
					this.isIdle = false;
				}

			}

		},

		pause: function() {

			if (this.buffer !== null) {
				this.buffer.pause();
				this.isIdle = true;
			}

		},

		resume: function() {

			if (this.buffer !== null) {
				this.buffer.play();
				this.isIdle = false;
			}

		},

		stop: function() {

			if (this.buffer !== null) {

				this.buffer.pause();
				this.isIdle = true;

				try {
					this.buffer.currentTime = 0;
				} catch(e) {
				}

			}

		},

		setVolume: function(volume) {

			volume = typeof volume === 'number' ? volume : null;


			if (volume !== null && this.buffer !== null) {

				volume = Math.min(Math.max(0, volume), 1);

				this.buffer.volume = volume;
				this.volume        = volume;

				return true;

			}


			return false;

		}

	};



	/*
	 * TEXTURE IMPLEMENTATION
	 */

	var _texture_id    = 0;
	var _texture_cache = {};


	var _clone_texture = function(origin, clone) {

		// Keep reference of Texture ID for OpenGL alike platforms
		clone.id = origin.id;


		if (origin.buffer !== null) {

			clone.buffer = origin.buffer;
			clone.width  = origin.width;
			clone.height = origin.height;

			clone.__load = false;

		}

	};


	var Texture = function(url) {

		url = typeof url === 'string' ? url : null;


		this.id     = _texture_id++;
		this.url    = url;
		this.onload = null;
		this.buffer = null;
		this.width  = 0;
		this.height = 0;

		this.__load = true;


		if (url !== null && url.substr(0, 10) !== 'data:image') {

			if (_texture_cache[url] !== undefined) {
				_clone_texture(_texture_cache[url], this);
			} else {
				_texture_cache[url] = this;
			}

		}

	};


	Texture.prototype = {

		deserialize: function(blob) {

			if (typeof blob.buffer === 'string') {

				var that  = this;
				var image = new Image();

				image.onload = function() {
					that.buffer = this;
					that.width  = this.width;
					that.height = this.height;
				};

				image.src   = blob.buffer;
				this.__load = false;

			}

		},

		serialize: function() {

			var blob = {};


			if (this.buffer !== null) {
				blob.buffer = 'data:image/png;base64,' + this.buffer.toString('base64');
			}


			return {
				'constructor': 'Texture',
				'arguments':   [ this.url ],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

		},

		load: function() {

			if (this.__load === false) {

				if (this.onload instanceof Function) {
					this.onload(true);
					this.onload = null;
				}

				return;

			}


			var buffer;
			var that = this;

			var url  = this.url;
			if (url.substr(0, 5) === 'data:') {

				if (url.substr(0, 15) === 'data:image/png;') {

					buffer = new Image();

					buffer.onload = function() {

						that.buffer = this;
						that.width  = this.width;
						that.height = this.height;

						that.__load = false;
						that.buffer.toString('base64');


						var is_power_of_two = (this.width & (this.width - 1)) === 0 && (this.height & (this.height - 1)) === 0;
						if (lychee.debug === true && is_power_of_two === false) {
							console.warn('bootstrap.js: Texture at data:image/png; is NOT power-of-two');
						}


						if (that.onload instanceof Function) {
							that.onload(true);
							that.onload = null;
						}

					};

					buffer.onerror = function() {

						if (that.onload instanceof Function) {
							that.onload(false);
							that.onload = null;
						}

					};

					buffer.src = url;

				} else {

					if (lychee.debug === true) {
						console.error('bootstrap.js: Texture at "' + url.substr(0, 15) + '" is invalid (no PNG file)');
					}


					if (this.onload instanceof Function) {
						this.onload(false);
						this.onload = null;
					}

				}

			} else {

				if (url.split('.').pop() === 'png') {

					buffer = new Image();

					buffer.onload = function() {

						that.buffer = this;
						that.width  = this.width;
						that.height = this.height;

						that.__load = false;
						that.buffer.toString('base64');


						var is_power_of_two = (this.width & (this.width - 1)) === 0 && (this.height & (this.height - 1)) === 0;
						if (lychee.debug === true && is_power_of_two === false) {
							console.warn('bootstrap.js: Texture at ' + this.url + ' is NOT power-of-two');
						}


						if (that.onload instanceof Function) {
							that.onload(true);
							that.onload = null;
						}

					};

					buffer.onerror = function() {

						if (that.onload instanceof Function) {
							that.onload(false);
							that.onload = null;
						}

					};

					buffer.src = url;

				} else {

					if (lychee.debug === true) {
						console.error('bootstrap.js: Texture at "' + this.url + '" is invalid (no PNG file)');
					}


					if (this.onload instanceof Function) {
						this.onload(false);
						this.onload = null;
					}

				}

			}

		}

	};



	/*
	 * PRELOADER IMPLEMENTATION
	 */

	var Stuff = function(url) {

		this.url    = url;
		this.onload = null;
		this.buffer = null;

	};


	Stuff.prototype = {

		serialize: function() {

			// var buffer = null;
			// if (this.buffer !== null) {
			// 	buffer = lychee.serialize(new Buffer(this.buffer, 'utf8'));
			// }


			return {
				'constructor': 'Object',
				'arguments':   [{
					'url':    this.url,
					'buffer': this.buffer
				}]
			};

		},

		load: function() {

			if (this.buffer !== null) {
				return;
			}


			var that = this;
			var type = this.url.split('/').pop().split('.').pop();
			if (type === 'js') {

				this.buffer            = document.createElement('script');
				this.buffer.__filename = this.url;
				this.buffer.async      = true;

				this.buffer.onload = function() {

					that.buffer = '';

					if (that.onload instanceof Function) {
						that.onload(true);
						that.onload = null;
					}

					// Don't move this, it's causing serious bugs in Blink
					document.body.removeChild(this);

				};
				this.buffer.onerror = function() {

					that.buffer = '';

					if (that.onload instanceof Function) {
						that.onload(false);
						that.onload = null;
					}

					// Don't move this, it's causing serious bugs in Blink
					document.body.removeChild(this);

				};
				this.buffer.src = this.url;

				document.body.appendChild(this.buffer);

			} else if (type === 'css') {

				this.buffer = document.createElement('link');
				this.buffer.rel  = 'stylesheet';
				this.buffer.href = this.url;
				this.buffer.onload = function() {

					var rules = [].slice.call(this.sheet.rules);
					if (rules.length > 0) {

						var buffer = '';

						rules.forEach(function(rule) {
							buffer += rule.cssText + '\n';
						});

						that.buffer = buffer;

					}

				};

				document.head.appendChild(this.buffer);


				// CSS files can't fail
				if (this.onload instanceof Function) {
					this.onload(true);
					this.onload = null;
				}

			} else {

				_load_asset({
					url: this.url
				}, function(raw) {

					this.buffer = raw;

					if (this.onload instanceof Function) {
						this.onload(raw !== null);
						this.onload = null;
					}

				}, this);

			}

		}

	};



	/*
	 * EXPORTS
	 */

	global.Buffer  = Buffer;
	global.Config  = Config;
	global.Font    = Font;
	global.Music   = Music;
	global.Sound   = Sound;
	global.Texture = Texture;

	global.Stuff   = Stuff;


	Object.defineProperty(lychee.Environment, '__FILENAME', {

		get: function() {

			if (document.currentScript) {
				return document.currentScript.__filename;
			}

			return null;

		},

		set: function() {
			return false;
		}

	});


})(this.lychee, this);

