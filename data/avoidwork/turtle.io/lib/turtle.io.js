"use strict";

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/**
 * turtle.io
 *
 * Easy to use web server with virtual hosts & reverse proxies
 *
 * @author Jason Mulligan <jason.mulligan@avoidwork.com>
 * @copyright 2015 Jason Mulligan
 * @license BSD-3 <https://raw.github.com/avoidwork/turtle.io/master/LICENSE>
 * @link http://turtle.io
 * @version 3.2.19
 */
var constants = require("constants"),
    mmh3 = require("murmurhash3js").x86.hash32,
    path = require("path"),
    defaultConfig = require(path.join(__dirname, "../config.json")),
    dtrace = require("dtrace-provider"),
    precise = require("precise"),
    util = require("keigai").util,
    array = util.array,
    clone = util.clone,
    csv = util.csv,
    delay = util.next,
    iterate = util.iterate,
    lru = util.lru,
    number = util.number,
    merge = util.merge,
    parse = util.parse,
    json = util.json,
    request = util.request,
    string = util.string,
    fs = require("fs"),
    http = require("http"),
    https = require("https"),
    mime = require("mime"),
    moment = require("moment"),
    os = require("os"),
    zlib = require("zlib"),
    ALL = "all",
    LOGGING = false,
    STALE = 60000,
    VERBS = ["delete", "get", "post", "put", "patch"],
    LOGLEVEL = undefined;

/**
 * RegExp cache
 *
 * @type {Object}
 */
var regex = {
	body: /^(put|post|patch)$/i,
	comp: /javascript|json|text|xml/,
	csv: /text\/csv/,
	del: /^delete$/i,
	end_slash: /\/$/,
	ext: /\.[\w+]{1,}$/, // 1 is for source code files, etc.
	head: /^(head|options)$/i,
	head_key: /:.*/,
	head_value: /.*:\s+/,
	get: /^(get|head|options)$/i,
	get_only: /^get$/i,
	def: /deflate/,
	dir: /\/$/,
	gzip: /gz/,
	ie: /msie/i,
	indent: /application\/json\;\sindent=(\d+)/,
	json: /json/,
	json_wrap: /^[\[\{]/,
	next: /\..*/,
	nocache: /no-store|no-cache/i,
	nval: /;.*/,
	number: /\d{1,}/,
	put: /^put/i,
	post: /^post/i,
	"private": /private/,
	options: /^options/i,
	refused: /ECONNREFUSED/,
	rename: /^rename$/,
	root: /^\//,
	space: /\s+/,
	stream: /application|audio|chemical|conference|font|image|message|model|xml|video/
};

/**
 * HTTP status codes
 *
 * @type {Object}
 */
var CODES = {
	CONTINUE: 100,
	SWITCH_PROTOCOL: 101,
	SUCCESS: 200,
	CREATED: 201,
	ACCEPTED: 202,
	NON_AUTHORITATIVE: 203,
	NO_CONTENT: 204,
	RESET_CONTENT: 205,
	PARTIAL_CONTENT: 206,
	MULTIPLE_CHOICE: 300,
	MOVED: 301,
	FOUND: 302,
	SEE_OTHER: 303,
	NOT_MODIFIED: 304,
	USE_PROXY: 305,
	REDIRECT: 307,
	PERM_REDIRECT: 308,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	NOT_ALLOWED: 405,
	NOT_ACCEPTABLE: 406,
	PROXY_AUTH: 407,
	REQUEST_TIMEOUT: 408,
	CONFLICT: 409,
	GONE: 410,
	LENGTH_REQUIRED: 411,
	FAILED: 412,
	REQ_TOO_LARGE: 413,
	URI_TOO_LONG: 414,
	UNSUPPORTED_MEDIA: 415,
	NOT_SATISFIABLE: 416,
	EXPECTATION_FAILED: 417,
	SERVER_ERROR: 500,
	NOT_IMPLEMENTED: 501,
	BAD_GATEWAY: 502,
	SERVICE_UNAVAILABLE: 503,
	GATEWAY_TIMEOUT: 504,
	HTTP_NOT_SUPPORTED: 505
};

/**
 * Log levels
 *
 * @type {Array}
 */
var LEVELS = ["emerg", "alert", "crit", "error", "warn", "notice", "info", "debug"];

/**
 * HTTP (semantic) status messages
 *
 * @type {Object}
 */
var MESSAGES = {
	CONTINUE: "Continue",
	SWITCH_PROTOCOL: "Switching protocols",
	SUCCESS: "Success",
	CREATED: "Created",
	ACCEPTED: "Accepted",
	NON_AUTHORITATIVE: "Non-Authoritative Information",
	NO_CONTENT: "",
	RESET_CONTENT: "Reset Content",
	PARTIAL_CONTENT: "Partial Content",
	MULTIPLE_CHOICE: "Multiple Choices",
	MOVED: "Moved Permanently",
	FOUND: "Found",
	SEE_OTHER: "See Other",
	NOT_MODIFIED: "Not Modified",
	USE_PROXY: "Use Proxy",
	REDIRECT: "Temporary Redirect",
	PERM_REDIRECT: "Permanent Redirect",
	BAD_REQUEST: "Bad Request",
	UNAUTHORIZED: "Unauthorized",
	FORBIDDEN: "Forbidden",
	NOT_FOUND: "Not Found",
	NOT_ALLOWED: "Method Not Allowed",
	NOT_ACCEPTABLE: "Not Acceptable",
	PROXY_AUTH: "Proxy Authentication Required",
	REQUEST_TIMEOUT: "Request Timeout",
	CONFLICT: "Conflict",
	GONE: "Gone",
	LENGTH_REQUIRED: "Length Required",
	FAILED: "Precondition Failed",
	REQ_TOO_LARGE: "Request Entity Too Large",
	URI_TOO_LONG: "Request-URI Too Long",
	UNSUPPORTED_MEDIA: "Unsupported Media Type",
	NOT_SATISFIABLE: "Requested Range Not Satisfiable",
	EXPECTATION_FAILED: "Expectation Failed",
	SERVER_ERROR: "Internal Server Error",
	NOT_IMPLEMENTED: "Not Implemented",
	BAD_GATEWAY: "Bad Gateway",
	SERVICE_UNAVAILABLE: "Service Unavailable",
	GATEWAY_TIMEOUT: "Gateway Timeout",
	HTTP_NOT_SUPPORTED: "HTTP Version Not Supported"
};

var TurtleIO = (function () {
	/**
  * TurtleIO
  *
  * @constructor
  */

	function TurtleIO() {
		_classCallCheck(this, TurtleIO);

		this.config = {};
		this.codes = CODES;
		this.dtp = null;
		this.etags = lru(1000);
		this.levels = LEVELS;
		this.messages = MESSAGES;
		this.middleware = { all: {} };
		this.permissions = lru(1000);
		this.routeCache = lru(5000); // verbs * etags
		this.pages = { all: {} };
		this.server = null;
		this.vhosts = [];
		this.vhostsRegExp = [];
		this.watching = {};
	}

	_createClass(TurtleIO, [{
		key: "allowed",

		/**
   * Verifies a method is allowed on a URI
   *
   * @method allowed
   * @param  {String}  method   HTTP verb
   * @param  {String}  uri      URI to query
   * @param  {String}  host     Hostname
   * @param  {Boolean} override Overrides cached version
   * @return {Boolean}          Boolean indicating if method is allowed
   */
		value: function allowed(method, uri, host, override) {
			var _this = this;

			var timer = precise().start();
			var result = this.routes(uri, host, method, override).filter(function (i) {
				return _this.config.noaction[i.hash || _this.hash(i)] === undefined;
			});

			timer.stop();

			this.signal("allowed", function () {
				return [host, uri, method.toUpperCase(), timer.diff()];
			});

			return result.length > 0;
		}
	}, {
		key: "allows",

		/**
   * Determines which verbs are allowed against a URL
   *
   * @method allows
   * @param  {String}  uri      URI to query
   * @param  {String}  host     Hostname
   * @param  {Boolean} override Overrides cached version
   * @return {String}           Allowed methods
   */
		value: function allows(uri, host, override) {
			var _this2 = this;

			var timer = precise().start(),
			    result = !override ? this.permissions.get(host + "_" + uri) : undefined;

			if (override || !result) {
				result = VERBS.filter(function (i) {
					return _this2.allowed(i, uri, host, override);
				});

				result = result.join(", ").toUpperCase().replace("GET", "GET, HEAD, OPTIONS");
				this.permissions.set(host + "_" + uri, result);
			}

			timer.stop();

			this.signal("allows", function () {
				return [host, uri, timer.diff()];
			});

			return result;
		}
	}, {
		key: "blacklist",

		/**
   * Adds a function the middleware 'no action' hash
   *
   * @method blacklist
   * @param  {Function} fn Function to add
   * @return {Object}      TurtleIO instance
   */
		value: function blacklist(fn) {
			var hfn = fn.hash || this.hash(fn.toString());

			if (this.config.noaction === undefined) {
				this.config.noaction = {};
			}

			if (!this.config.noaction[hfn]) {
				this.config.noaction[hfn] = 1;
			}

			return this;
		}
	}, {
		key: "compress",

		/**
   * Pipes compressed asset to Client
   *
   * @method compressed
   * @param  {Object}  req     HTTP(S) request Object
   * @param  {Object}  res     HTTP(S) response Object
   * @param  {Object}  body    Response body
   * @param  {Object}  type    gzip (gz) or deflate (df)
   * @param  {String}  etag    Etag
   * @param  {Boolean} file    Indicates `body` is a file path
   * @param  {Object}  options Stream options
   * @param  {Number}  status  HTTP status
   * @param  {Object}  headers HTTP headers
   * @return {Object}          TurtleIO instance
   */
		value: function compress(req, res, body, type, etag, file, options, status, headers) {
			var _this3 = this;

			var timer = precise().start(),
			    method = regex.gzip.test(type) ? "createGzip" : "createDeflate",
			    sMethod = method.replace("create", "").toLowerCase(),
			    fp = etag ? path.join(this.config.tmp, etag + "." + type) : null;

			var next = function next(exist) {
				if (!file) {
					// Pipe Stream through compression to Client & disk
					if (typeof body.pipe == "function") {
						if (!res._header && !res._headerSent) {
							headers["transfer-encoding"] = "chunked";
							delete headers["content-length"];
							res.writeHead(status, headers);
						}

						body.pipe(zlib[method]()).pipe(res);
						body.pipe(zlib[method]()).pipe(fs.createWriteStream(fp));

						timer.stop();

						_this3.signal("compress", function () {
							return [etag, fp, timer.diff()];
						});
					}
					// Raw response body, compress and send to Client & disk
					else {
						zlib[sMethod](body, function (e, data) {
							if (e) {
								_this3.log(new Error("[client " + (req.headers["x-forwarded-for"] ? array.last(string.explode(req.headers["x-forwarded-for"])) : req.connection.remoteAddress) + "] " + e.message), "error");
								_this3.unregister(req.parsed.href);
								_this3.error(req, res, CODES.SERVER_ERROR);
							} else {
								if (!res._header && !res._headerSent) {
									headers["content-length"] = data.length;
									headers["transfer-encoding"] = "identity";
									res.writeHead(status, headers);
								}

								res.end(data);

								if (fp) {
									fs.writeFile(fp, data, "utf8", function (e) {
										if (e) {
											_this3.log(new Error("[client " + (req.headers["x-forwarded-for"] ? array.last(string.explode(req.headers["x-forwarded-for"])) : req.connection.remoteAddress) + "] " + e.message), "error");
											_this3.unregister(req.parsed.href);
										}
									});
								}

								timer.stop();

								_this3.signal("compress", function () {
									return [etag, fp || "dynamic", timer.diff()];
								});
							}
						});
					}
				} else {
					if (!res._header && !res._headerSent) {
						headers["transfer-encoding"] = "chunked";
						delete headers["content-length"];
						res.writeHead(status, headers);
					}

					// Pipe compressed asset to Client
					fs.createReadStream(body, options).on("error", function (e) {
						_this3.log(new Error("[client " + (req.headers["x-forwarded-for"] ? array.last(string.explode(req.headers["x-forwarded-for"])) : req.connection.remoteAddress) + "] " + e.message), "error");
						_this3.unregister(req.parsed.href);
						_this3.error(req, res, CODES.SERVER_ERROR);
					}).pipe(zlib[method]()).pipe(res);

					// Pipe compressed asset to disk
					if (exist === false) {
						fs.createReadStream(body).on("error", function (e) {
							_this3.log(new Error("[client " + (req.headers["x-forwarded-for"] ? array.last(string.explode(req.headers["x-forwarded-for"])) : req.connection.remoteAddress) + "] " + e.message), "error");
						}).pipe(zlib[method]()).pipe(fs.createWriteStream(fp));
					}

					timer.stop();

					_this3.signal("compress", function () {
						return [etag, fp, timer.diff()];
					});
				}
			};

			if (fp) {
				fs.exists(fp, function (exist) {
					// Pipe compressed asset to Client
					if (exist) {
						fs.lstat(fp, function (e, stats) {
							if (e) {
								_this3.error(req, res, e);
							} else {
								if (!res._header && !res._headerSent) {
									headers["transfer-encoding"] = "chunked";
									delete headers["content-length"];

									if (options) {
										headers["content-range"] = "bytes " + options.start + "-" + options.end + "/" + stats.size;
									}

									res.writeHead(status, headers);
								}

								fs.createReadStream(fp, options).on("error", function (e) {
									_this3.log(new Error("[client " + (req.headers["x-forwarded-for"] ? array.last(string.explode(req.headers["x-forwarded-for"])) : req.connection.remoteAddress) + "] " + e.message), "error");
									_this3.unregister(req.parsed.href);
									_this3.error(req, res, CODES.SERVER_ERROR);
								}).pipe(res);

								timer.stop();

								_this3.signal("compress", function () {
									return [etag, fp, timer.diff()];
								});
							}
						});
					} else {
						next(exist);
					}
				});
			} else {
				next(false);
			}

			return this;
		}
	}, {
		key: "compression",

		/**
   * Determines what/if compression is supported for a request
   *
   * @method compression
   * @param  {String} agent    User-Agent header value
   * @param  {String} encoding Accept-Encoding header value
   * @param  {String} mimetype Mime type of response body
   * @return {Mixed}           Supported compression or null
   */
		value: function compression(agent, encoding, mimetype) {
			var timer = precise().start(),
			    result = null,
			    encodings = typeof encoding == "string" ? string.explode(encoding) : [];

			// No soup for IE!
			if (this.config.compress === true && regex.comp.test(mimetype) && !regex.ie.test(agent)) {
				// Iterating supported encodings
				array.each(encodings, function (i) {
					if (regex.gzip.test(i)) {
						result = "gz";
					}

					if (regex.def.test(i)) {
						result = "zz";
					}

					// Found a supported encoding
					if (result !== null) {
						return false;
					}
				});
			}

			timer.stop();

			this.signal("compression", function () {
				return [agent, timer.diff()];
			});

			return result;
		}
	}, {
		key: "encode",

		/**
   * Encodes `arg` as JSON if applicable
   *
   * @method encode
   * @param  {Mixed}  arg    Object to encode
   * @param  {String} accept Accept HTTP header
   * @return {Mixed}         Original Object or JSON string
   */
		value: function encode(arg, accept) {
			var header = undefined,
			    indent = undefined;

			// Do not want to coerce this Object to a String!
			if (arg instanceof Buffer || typeof arg.pipe == "function") {
				return arg;
			}
			// Converting to JSON
			else if (arg instanceof Array || arg instanceof Object) {
				header = regex.indent.exec(accept);
				indent = header !== null ? parseInt(header[1], 10) : this.config.json;

				return JSON.stringify(arg, null, indent);
			}
			// Nothing to do, leave it as it is
			else {
				return arg;
			}
		}
	}, {
		key: "error",

		/**
   * Error handler for requests
   *
   * @method error
   * @param  {Object} req    Request Object
   * @param  {Object} res    Response Object
   * @param  {Number} status [Optional] HTTP status code
   * @param  {String} msg    [Optional] Response body
   * @return {Object}        TurtleIO instance
   */
		value: function error(req, res, status, msg) {
			var timer = precise().start(),
			    method = req.method.toLowerCase(),
			    host = req.parsed ? req.parsed.hostname : ALL,
			    kdx = -1,
			    body = undefined;

			if (isNaN(status)) {
				status = CODES.NOT_FOUND;

				// If valid, determine what kind of error to respond with
				if (!regex.get.test(method)) {
					if (this.allowed(method, req.parsed.pathname, req.vhost)) {
						status = CODES.SERVER_ERROR;
					} else {
						status = CODES.NOT_ALLOWED;
					}
				}
			}

			body = this.page(status, host);

			array.each(array.cast(CODES), function (i, idx) {
				if (i === status) {
					kdx = idx;
					return false;
				}
			});

			if (msg === undefined) {
				msg = kdx ? array.cast(MESSAGES)[kdx] : "Unknown error";
			}

			this.log(new Error("[client " + (req.headers["x-forwarded-for"] ? array.last(string.explode(req.headers["x-forwarded-for"])) : req.connection.remoteAddress) + "] " + msg), "debug");

			timer.stop();

			this.signal("error", function () {
				return [req.headers.host, req.parsed.path, status, msg, timer.diff()];
			});

			return this.respond(req, res, body, status, {
				"cache-control": "no-cache",
				"content-length": Buffer.byteLength(body)
			});
		}
	}, {
		key: "etag",

		/**
   * Generates an Etag
   *
   * @method etag
   * @param  {String} url      URL requested
   * @param  {Number} size     Response size
   * @param  {Number} modified Modified time
   * @param  {Object} body     [Optional] Response body
   * @return {String}          Etag value
   */
		value: function etag() {
			for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			}

			return this.hash(args.join("-"));
		}
	}, {
		key: "handle",

		/**
   * Handles the request
   *
   * @method handle
   * @param  {Object}  req   HTTP(S) request Object
   * @param  {Object}  res   HTTP(S) response Object
   * @param  {String}  path  File path
   * @param  {String}  url   Requested URL
   * @param  {Boolean} dir   `true` is `path` is a directory
   * @param  {Object}  stat  fs.Stat Object
   * @return {Object}        TurtleIO instance
   */
		value: function handle(req, res, path, url, dir, stat) {
			var _this4 = this;

			var allow = undefined,
			    del = undefined,
			    etag = undefined,
			    headers = undefined,
			    method = undefined,
			    mimetype = undefined,
			    modified = undefined,
			    size = undefined,
			    write = undefined;

			allow = req.allow;
			write = allow.indexOf(dir ? "POST" : "PUT") > -1;
			del = allow.indexOf("DELETE") > -1;
			method = req.method;

			// File request
			if (!dir) {
				if (regex.get.test(method)) {
					mimetype = mime.lookup(path);
					size = stat.size;
					modified = stat.mtime.toUTCString();
					etag = "\"" + this.etag(url, size, stat.mtime) + "\"";
					headers = {
						allow: allow,
						"content-length": size,
						"content-type": mimetype,
						etag: etag,
						"last-modified": modified
					};

					if (regex.get_only.test(method)) {
						// Decorating path for watcher
						req.path = path;

						// Client has current version
						if (req.headers["if-none-match"] === etag || !req.headers["if-none-match"] && Date.parse(req.headers["if-modified-since"]) >= stat.mtime) {
							this.respond(req, res, MESSAGES.NO_CONTENT, CODES.NOT_MODIFIED, headers, true);
						}
						// Sending current version
						else {
							this.respond(req, res, path, CODES.SUCCESS, headers, true);
						}
					} else {
						this.respond(req, res, MESSAGES.NO_CONTENT, CODES.SUCCESS, headers, true);
					}
				} else if (regex.del.test(method) && del) {
					this.unregister(this.url(req));

					fs.unlink(path, function (e) {
						if (e) {
							_this4.error(req, req, CODES.SERVER_ERROR);
						} else {
							_this4.respond(req, res, MESSAGES.NO_CONTENT, CODES.NO_CONTENT, {});
						}
					});
				} else if (regex.put.test(method) && write) {
					this.write(req, res, path);
				} else {
					this.error(req, req, CODES.SERVER_ERROR);
				}
			}
			// Directory request
			else {
				if ((regex.post.test(method) || regex.put.test(method)) && write) {
					this.write(req, res, path);
				} else if (regex.del.test(method) && del) {
					this.unregister(req.parsed.href);

					fs.unlink(path, function (e) {
						if (e) {
							_this4.error(req, req, CODES.SERVER_ERROR);
						} else {
							_this4.respond(req, res, MESSAGES.NO_CONTENT, CODES.NO_CONTENT, {});
						}
					});
				} else {
					this.error(req, req, CODES.NOT_ALLOWED);
				}
			}

			return this;
		}
	}, {
		key: "hash",

		/**
   * Creates a hash of arg
   *
   * @method hash
   * @param  {Mixed}  arg String or Buffer
   * @return {String} Hash of arg
   */
		value: function hash(arg) {
			return mmh3(arg, this.config.seed);
		}
	}, {
		key: "headers",

		/**
   * Sets response headers
   *
   * @method headers
   * @param  {Object}  req      Request Object
   * @param  {Object}  rHeaders Response headers
   * @param  {Number}  status   HTTP status code, default is 200
   * @return {Object}           Response headers
   */
		value: (function (_headers) {
			function headers(_x2, _x3, _x4) {
				return _headers.apply(this, arguments);
			}

			headers.toString = function () {
				return _headers.toString();
			};

			return headers;
		})(function (req, rHeaders, status) {
			var timer = precise().start(),
			    get = regex.get.test(req.method),
			    headers = undefined;

			// Decorating response headers
			if (status !== CODES.NOT_MODIFIED && status >= CODES.MULTIPLE_CHOICE && status < CODES.BAD_REQUEST) {
				headers = rHeaders;
			} else if (rHeaders instanceof Object) {
				headers = clone(this.config.headers, true);
				merge(headers, rHeaders);
				headers.allow = req.allow;

				if (!headers.date) {
					headers.date = new Date().toUTCString();
				}

				if (req.cors) {
					if ((regex.options.test(req.method) || req.headers["x-requested-with"]) && headers["access-control-allow-origin"] === "*") {
						headers["access-control-allow-origin"] = req.headers.origin || req.headers.referer.replace(/\/$/, "");
						headers["access-control-allow-credentials"] = "true";
					}

					headers["access-control-allow-methods"] = headers.allow;
				} else {
					delete headers["access-control-allow-origin"];
					delete headers["access-control-expose-headers"];
					delete headers["access-control-max-age"];
					delete headers["access-control-allow-credentials"];
					delete headers["access-control-allow-methods"];
					delete headers["access-control-allow-headers"];
				}

				// Decorating "Transfer-Encoding" header
				if (!headers["transfer-encoding"]) {
					headers["transfer-encoding"] = "identity";
				}

				// Removing headers not wanted in the response
				if (!get || status >= CODES.BAD_REQUEST || headers["x-ratelimit-limit"]) {
					delete headers["cache-control"];
					delete headers.etag;
					delete headers["last-modified"];
				}

				if (headers["x-ratelimit-limit"]) {
					headers["cache-control"] = "no-cache";
				}

				if (status === CODES.NOT_MODIFIED) {
					delete headers["last-modified"];
				}

				if (status === CODES.NOT_FOUND && headers.allow || status >= CODES.SERVER_ERROR) {
					delete headers["accept-ranges"];
				}

				if (!headers["last-modified"]) {
					delete headers["last-modified"];
				}
			}

			headers.status = status + " " + http.STATUS_CODES[status];

			timer.stop();

			this.signal("headers", function () {
				return [status, timer.diff()];
			});

			return headers;
		})
	}, {
		key: "host",

		/**
   * Registers a virtual host
   *
   * @method host
   * @param  {String} arg Virtual host
   * @return {Object}     TurtleIO instance
   */
		value: function host(arg) {
			if (!array.contains(this.vhosts, arg)) {
				this.vhosts.push(arg);
				this.vhostsRegExp.push(new RegExp("^" + arg.replace(/\*/g, ".*") + "$"));
			}

			return this;
		}
	}, {
		key: "log",

		/**
   * Logs a message
   *
   * @method log
   * @param  {Mixed}  arg   Error Object or String
   * @param  {String} level [Optional] `level` must match a valid LogLevel - http://httpd.apache.org/docs/1.3/mod/core.html#loglevel, default is `notice`
   * @return {Object}       TurtleIO instance
   */
		value: function log(arg, level) {
			var _this5 = this;

			var timer = undefined,
			    e = undefined;

			if (LOGGING) {
				timer = precise().start();
				e = arg instanceof Error;
				level = level || "notice";

				if (this.config.logs.stdout && LEVELS.indexOf(level) <= LOGLEVEL) {
					if (e) {
						console.error("[" + moment().format(this.config.logs.time) + "] [" + level + "] " + (arg.stack || arg.message || arg));
					} else {
						console.log(arg);
					}
				}

				timer.stop();

				this.signal("log", function () {
					return [level, _this5.config.logs.stdout, false, timer.diff()];
				});
			}

			return this;
		}
	}, {
		key: "page",

		/**
   * Gets an HTTP status page
   *
   * @method page
   * @param  {Number} code HTTP status code
   * @param  {String} host Virtual hostname
   * @return {String}      Response body
   */
		value: function page(code, host) {
			host = host && this.pages[host] ? host : ALL;

			return this.pages[host][code] || this.pages[host]["500"] || this.pages.all["500"];
		}
	}, {
		key: "probes",

		/**
   * Registers dtrace probes
   *
   * @method probes
   * @return {Object} TurtleIO instance
   */
		value: function probes() {
			this.dtp.addProbe("allowed", "char *", "char *", "char *", "int");
			this.dtp.addProbe("allows", "char *", "char *", "int");
			this.dtp.addProbe("compress", "char *", "char *", "int");
			this.dtp.addProbe("compression", "char *", "int");
			this.dtp.addProbe("error", "char *", "char *", "int", "char *", "int");
			this.dtp.addProbe("headers", "int", "int");
			this.dtp.addProbe("log", "char *", "int", "int", "int");
			this.dtp.addProbe("proxy", "char *", "char *", "char *", "char *", "int");
			this.dtp.addProbe("middleware", "char *", "char *", "int");
			this.dtp.addProbe("request", "char *", "int");
			this.dtp.addProbe("respond", "char *", "char *", "char *", "int", "int");
			this.dtp.addProbe("status", "int", "int", "int", "int", "int");
			this.dtp.addProbe("write", "char *", "char *", "char *", "char *", "int");
			this.dtp.enable();
		}
	}, {
		key: "prep",

		/**
   * Preparing log message
   *
   * @method prep
   * @param  {Object} req     HTTP(S) request Object
   * @param  {Object} res     HTTP(S) response Object
   * @param  {Object} headers HTTP(S) response headers
   * @return {String}         Log message
   */
		value: function prep(req, res, headers) {
			var msg = this.config.logs.format,
			    user = req.parsed ? req.parsed.auth.split(":")[0] || "-" : "-";

			msg = msg.replace("%v", req.headers.host).replace("%h", req.ip || "-").replace("%l", "-").replace("%u", user).replace("%t", "[" + moment().format(this.config.logs.time) + "]").replace("%r", req.method + " " + req.url + " HTTP/1.1").replace("%>s", res.statusCode).replace("%b", headers["content-length"] || "-").replace("%{Referer}i", req.headers.referer || "-").replace("%{User-agent}i", req.headers["user-agent"] || "-");

			return msg;
		}
	}, {
		key: "proxy",

		/**
   * Proxies a URL to a route
   *
   * @method proxy
   * @param  {String}  route  Route to proxy
   * @param  {String}  origin Host to proxy (e.g. http://hostname)
   * @param  {String}  host   [Optional] Hostname this route is for (default is all)
   * @param  {Boolean} stream [Optional] Stream response to client (default is false)
   * @return {Object}         TurtleIO instance
   */
		value: function proxy(route, origin, host) {
			var _this6 = this;

			var stream = arguments[3] === undefined ? false : arguments[3];

			/**
    * Response handler
    *
    * @method handle
    * @private
    * @param  {Object} req HTTP(S) request Object
    * @param  {Object} res HTTP(S) response Object
    * @param  {Mixed}  arg Proxy response
    * @param  {Object} xhr XmlHttpRequest
    * @return {Undefined}  undefined
    */
			var handle = function handle(req, res, arg, xhr) {
				var etag = "",
				    regexOrigin = new RegExp(origin.replace(regex.end_slash, ""), "g"),
				    url = req.parsed.href,
				    stale = STALE,
				    get = regex.get_only.test(req.method),
				    rewriteOrigin = req.parsed.protocol + "//" + req.parsed.host + (route == "/" ? "" : route),
				    cached = undefined,
				    resHeaders = undefined,
				    rewrite = undefined;

				resHeaders = headers(xhr.getAllResponseHeaders());
				resHeaders.via = (resHeaders.via ? resHeaders.via + ", " : "") + resHeaders.server;
				resHeaders.server = _this6.config.headers.server;

				// Something went wrong
				if (xhr.status < CODES.CONTINUE) {
					_this6.error(req, res, CODES.BAD_GATEWAY);
				} else if (xhr.status >= CODES.SERVER_ERROR) {
					_this6.error(req, res, xhr.status);
				} else {
					// Determining if the response will be cached
					if (get && (xhr.status === CODES.SUCCESS || xhr.status === CODES.NOT_MODIFIED) && !regex.nocache.test(resHeaders["cache-control"]) && !regex["private"].test(resHeaders["cache-control"])) {
						// Determining how long rep is valid
						if (resHeaders["cache-control"] && regex.number.test(resHeaders["cache-control"])) {
							stale = number.parse(regex.number.exec(resHeaders["cache-control"])[0], 10);
						} else if (resHeaders.expires !== undefined) {
							stale = new Date(resHeaders.expires);
							stale = number.diff(stale, new Date());
						}

						// Removing from LRU when invalid
						if (stale > 0) {
							setTimeout(function () {
								_this6.unregister(url);
							}, stale * 1000);
						}
					}

					if (xhr.status !== CODES.NOT_MODIFIED) {
						rewrite = regex.rewrite.test((resHeaders["content-type"] || "").replace(regex.nval, ""));

						// Setting headers
						if (get && xhr.status === CODES.SUCCESS) {
							etag = resHeaders.etag || "\"" + _this6.etag(url, resHeaders["content-length"] || 0, resHeaders["last-modified"] || 0, _this6.encode(arg)) + "\"";

							if (resHeaders.etag !== etag) {
								resHeaders.etag = etag;
							}
						}

						if (resHeaders.allow === undefined || string.isEmpty(resHeaders.allow)) {
							resHeaders.allow = resHeaders["access-control-allow-methods"] || "GET";
						}

						// Determining if a 304 response is valid based on Etag only (no timestamp is kept)
						if (get && req.headers["if-none-match"] === etag) {
							cached = _this6.etags.get(url);

							if (cached) {
								resHeaders.age = parseInt(new Date().getTime() / 1000 - cached.value.timestamp, 10);
							}

							_this6.respond(req, res, MESSAGES.NO_CONTENT, CODES.NOT_MODIFIED, resHeaders);
						} else {
							if (regex.head.test(req.method.toLowerCase())) {
								arg = MESSAGES.NO_CONTENT;
							}
							// Fixing root path of response
							else if (rewrite) {
								// Changing the size of the response body
								delete resHeaders["content-length"];

								if (arg instanceof Array || arg instanceof Object) {
									arg = json.encode(arg, req.headers.accept).replace(regexOrigin, rewriteOrigin);

									if (route !== "/") {
										arg = arg.replace(/"(\/[^?\/]\w+)\//g, "\"" + route + "$1/");
									}

									arg = json.decode(arg);
								} else if (typeof arg == "string") {
									arg = arg.replace(regexOrigin, rewriteOrigin);

									if (route !== "/") {
										arg = arg.replace(/(href|src)=("|')([^http|mailto|<|_|\s|\/\/].*?)("|')/g, "$1=$2" + route + "/$3$4").replace(new RegExp(route + "//", "g"), route + "/");
									}
								}
							}

							_this6.respond(req, res, arg, xhr.status, resHeaders);
						}
					} else {
						_this6.respond(req, res, arg, xhr.status, resHeaders);
					}
				}
			};

			/**
    * Converts HTTP header String to an Object
    *
    * @method headers
    * @private
    * @param  {Object} args Response headers
    * @return {Object}      Reshaped response headers
    */
			var headers = function headers(args) {
				var result = {};

				if (!string.isEmpty(args)) {
					array.each(string.trim(args).split("\n"), function (i) {
						var header = undefined,
						    value = undefined;

						value = i.replace(regex.headVAL, "");
						header = i.replace(regex.headKEY, "").toLowerCase();
						result[header] = !isNaN(value) ? Number(value) : value;
					});
				}

				return result;
			};

			/**
    * Wraps the proxy request
    *
    * @method wrapper
    * @private
    * @param  {Object} req HTTP(S) request Object
    * @param  {Object} res HTTP(S) response Object
    * @return {Undefined}  undefined
    */
			var wrapper = function wrapper(req, res) {
				var timer = precise().start(),
				    url = origin + (route !== "/" ? req.url.replace(new RegExp("^" + route), "") : req.url),
				    method = req.method.toLowerCase(),
				    headerz = clone(req.headers, true),
				    parsed = parse(url),
				    cached = _this6.etags.get(url),
				    streamd = stream === true,
				    mimetype = cached ? cached.mimetype : mime.lookup(!regex.ext.test(parsed.pathname) ? "index.htm" : parsed.pathname),
				    defer = undefined,
				    fn = undefined,
				    options = undefined,
				    proxyReq = undefined,
				    xhr = undefined;

				// Facade to handle()
				fn = function (arg) {
					timer.stop();

					_this6.signal("proxy", function () {
						return [req.headers.host, req.method, route, origin, timer.diff()];
					});

					handle(req, res, arg, xhr);
				};

				// Streaming formats that do not need to be rewritten
				if (!streamd && (regex.ext.test(parsed.pathname) && !regex.json.test(mimetype)) && regex.stream.test(mimetype)) {
					streamd = true;
				}

				// Identifying proxy behavior
				headerz["x-host"] = parsed.host;
				headerz["x-forwarded-for"] = headerz["x-forwarded-for"] ? headerz["x-forwarded-for"] + ", " + req.ip : req.ip;
				headerz["x-forwarded-proto"] = parsed.protocol.replace(":", "");
				headerz["x-forwarded-server"] = _this6.config.headers.server;

				if (!headerz["x-real-ip"]) {
					headerz["x-real-ip"] = req.ip;
				}

				// Streaming response to Client
				if (streamd) {
					headerz.host = req.headers.host;

					options = {
						headers: headerz,
						hostname: parsed.hostname,
						method: req.method,
						path: parsed.path,
						port: parsed.port || 80
					};

					if (!string.isEmpty(parsed.auth)) {
						options.auth = parsed.auth;
					}

					proxyReq = http.request(options, function (proxyRes) {
						res.writeHeader(proxyRes.statusCode, proxyRes.headers);
						proxyRes.pipe(res);
					});

					proxyReq.on("error", function (e) {
						_this6.error(req, res, regex.refused.test(e.message) ? CODES.SERVER_UNAVAILABLE : CODES.SERVER_ERROR);
					});

					if (regex.body.test(req.method)) {
						proxyReq.write(req.body);
					}

					proxyReq.end();
				}
				// Acting as a RESTful proxy
				else {
					// Removing support for compression so the response can be rewritten (if textual)
					delete headerz["accept-encoding"];

					defer = request(url, method, req.body, headerz);
					xhr = defer.xhr;

					defer.then(fn, fn);
				}
			};

			// Setting route
			array.each(VERBS, function (i) {
				if (route === "/") {
					_this6[i]("/.*", wrapper, host);
				} else {
					_this6[i](route, wrapper, host);
					_this6[i](route + "/.*", wrapper, host);
				}
			});

			return this;
		}
	}, {
		key: "redirect",

		/**
   * Redirects GETs for a route to another URL
   *
   * @method redirect
   * @param  {String}  route     Route to redirect
   * @param  {String}  url       URL to redirect the Client to
   * @param  {String}  host      [Optional] Hostname this route is for (default is all)
   * @param  {Boolean} permanent [Optional] `true` will indicate the redirection is permanent
   * @return {Object}            instance
   */
		value: function redirect(route, url, host, permanent) {
			var _this7 = this;

			var code = CODES[permanent === true ? "MOVED" : "REDIRECT"],
			    pattern = new RegExp("^" + route + "$");

			this.get(route, function (req, res) {
				var rewrite = (pattern.exec(req.url) || []).length > 0;

				_this7.respond(req, res, MESSAGES.NO_CONTENT, code, {
					Location: rewrite ? req.url.replace(pattern, url) : url,
					"Cache-Control": "no-cache"
				});
			}, host);

			return this;
		}
	}, {
		key: "register",

		/**
   * Registers an Etag in the LRU cache
   *
   * @method register
   * @param  {String}  url   URL requested
   * @param  {Object}  state Object describing state `{etag: $etag, mimetype: $mimetype}`
   * @param  {Boolean} stale [Optional] Remove cache from disk
   * @return {Object}        TurtleIO instance
   */
		value: function register(url, state, stale) {
			var cached = undefined;

			// Removing stale cache from disk
			if (stale === true) {
				cached = this.etags.cache[url];

				if (cached && cached.value.etag !== state.etag) {
					this.unregister(url);
				}
			}

			// Updating LRU
			this.etags.set(url, state);

			return this;
		}
	}, {
		key: "request",

		/**
   * Request handler which provides RESTful CRUD operations
   *
   * @method request
   * @public
   * @param  {Object} req HTTP(S) request Object
   * @param  {Object} res HTTP(S) response Object
   * @return {Object}     TurtleIO instance
   */
		value: function request(req, res) {
			var _this8 = this;

			var timer = precise().start(),
			    method = req.method,
			    handled = false,
			    host = req.vhost,
			    pathname = req.parsed.pathname.replace(regex.root, ""),
			    invalid = (pathname.replace(regex.dir, "").split("/").filter(function (i) {
				return i != ".";
			})[0] || "") == "..",
			    out_dir = !invalid ? (pathname.match(/\.{2}\//g) || []).length : 0,
			    in_dir = !invalid ? (pathname.match(/\w+?(\.\w+|\/)+/g) || []).length : 0,
			    count = undefined,
			    lpath = undefined,
			    nth = undefined,
			    root = undefined;

			var end = function end() {
				timer.stop();
				_this8.signal("request", function () {
					return [req.parsed.href, timer.diff()];
				});
			};

			// If an expectation can't be met, don't try!
			if (req.headers.expect) {
				end();
				return this.error(req, res, CODES.EXPECTATION_FAILED);
			}

			// Are we still in the virtual host root?
			if (invalid || out_dir > 0 && out_dir >= in_dir) {
				end();
				return this.error(req, res, CODES.NOT_FOUND);
			}

			// Preparing file path
			root = path.join(this.config.root, this.config.vhosts[host]);
			lpath = path.join(root, req.parsed.pathname.replace(regex.dir, ""));

			// Determining if the request is valid
			fs.lstat(lpath, function (e, stats) {
				if (e) {
					end();
					_this8.error(req, res, CODES.NOT_FOUND);
				} else if (!stats.isDirectory()) {
					end();
					_this8.handle(req, res, lpath, req.parsed.href, false, stats);
				} else if (regex.get.test(method) && !regex.dir.test(req.parsed.pathname)) {
					end();
					_this8.respond(req, res, MESSAGES.NO_CONTENT, CODES.REDIRECT, { Location: (req.parsed.pathname != "/" ? req.parsed.pathname : "") + "/" + req.parsed.search });
				} else if (!regex.get.test(method)) {
					end();
					_this8.handle(req, res, lpath, req.parsed.href, true);
				} else {
					count = 0;
					nth = _this8.config.index.length;

					array.each(_this8.config.index, function (i) {
						var npath = path.join(lpath, i);

						fs.lstat(npath, function (e, stats) {
							if (!e && !handled) {
								handled = true;
								end();
								_this8.handle(req, res, npath, (req.parsed.pathname != "/" ? req.parsed.pathname : "") + "/" + i + req.parsed.search, false, stats);
							} else if (++count === nth && !handled) {
								end();
								_this8.error(req, res, CODES.NOT_FOUND);
							}
						});
					});
				}
			});

			return this;
		}
	}, {
		key: "respond",

		/**
   * Send a response
   *
   * @method respond
   * @param  {Object}  req     Request Object
   * @param  {Object}  res     Response Object
   * @param  {Mixed}   body    Primitive, Buffer or Stream
   * @param  {Number}  status  [Optional] HTTP status, default is `200`
   * @param  {Object}  headers [Optional] HTTP headers
   * @param  {Boolean} file    [Optional] Indicates `body` is a file path
   * @return {Object}          TurtleIO instance
   */
		value: function respond(req, res, body, _x6, headers) {
			var _this9 = this;

			var status = arguments[3] === undefined ? CODES.SUCCESS : arguments[3];
			var file = arguments[5] === undefined ? false : arguments[5];

			var head = regex.head.test(req.method),
			    timer = precise().start(),
			    ua = req.headers["user-agent"],
			    encoding = req.headers["accept-encoding"],
			    type = undefined,
			    options = undefined;

			var finalize = function finalize() {
				var cheaders = undefined,
				    cached = undefined;

				if (status === CODES.NOT_MODIFIED || status < CODES.MULTIPLE_CHOICE || status >= CODES.BAD_REQUEST) {
					// req.parsed may not exist if coming from `error()`
					if (req.parsed) {
						if (regex.get_only.test(req.method) && status === CODES.SUCCESS) {
							// Updating cache
							if (!regex.nocache.test(headers["cache-control"]) && !regex["private"].test(headers["cache-control"])) {
								if (headers.etag === undefined) {
									headers.etag = "\"" + _this9.etag(req.parsed.href, body.length || 0, headers["last-modified"] || 0, body || 0) + "\"";
								}

								cheaders = clone(headers, true);

								delete cheaders["access-control-allow-origin"];
								delete cheaders["access-control-expose-headers"];
								delete cheaders["access-control-max-age"];
								delete cheaders["access-control-allow-credentials"];
								delete cheaders["access-control-allow-methods"];
								delete cheaders["access-control-allow-headers"];

								cached = _this9.etags.get(req.parsed.href);

								if (!cached) {
									_this9.register(req.parsed.href, {
										etag: cheaders.etag.replace(/"/g, ""),
										headers: cheaders,
										mimetype: cheaders["content-type"],
										timestamp: parseInt(new Date().getTime() / 1000, 10)
									}, true);
								}
							}

							// Setting a watcher on the local path
							if (req.path) {
								_this9.watch(req.parsed.href, req.path);
							}
						}
					} else {
						delete headers.allow;
						delete headers["access-control-allow-methods"];
					}
				}
			};

			if (body === null || body === undefined) {
				body = MESSAGES.NO_CONTENT;
			}

			headers = this.headers(req, headers || { "content-type": "text/plain" }, status);

			if (head) {
				delete headers.etag;
				delete headers["last-modified"];
			}

			if (!file && body !== MESSAGES.NO_CONTENT) {
				body = this.encode(body, req.headers.accept);

				if (headers["content-length"] === undefined) {
					if (body instanceof Buffer) {
						headers["content-length"] = Buffer.byteLength(body.toString());
					} else if (typeof body == "string") {
						headers["content-length"] = Buffer.byteLength(body);
					}
				}

				headers["content-length"] = headers["content-length"] || 0;

				if (head) {
					body = MESSAGES.NO_CONTENT;

					if (regex.options.test(req.method)) {
						headers["content-length"] = 0;
						delete headers["content-type"];
					}
				}

				// Ensuring JSON has proper mimetype
				if (regex.json_wrap.test(body)) {
					headers["content-type"] = "application/json";
				}

				if (regex.get_only.test(req.method)) {
					// CSV hook
					if (status === CODES.SUCCESS && body && headers["content-type"] === "application/json" && req.headers.accept && regex.csv.test(string.explode(req.headers.accept)[0].replace(regex.nval, ""))) {
						headers["content-type"] = "text/csv";

						if (!headers["content-disposition"]) {
							headers["content-disposition"] = "attachment; filename=\"" + req.parsed.pathname.replace(/.*\//g, "").replace(/\..*/, "_") + req.parsed.search.replace("?", "").replace(/\&/, "_") + ".csv\"";
						}

						body = csv.encode(body);
					}
				}
			}

			// Fixing 'accept-ranges' for non-filesystem based responses
			if (!file) {
				delete headers["accept-ranges"];
			}

			if (status === CODES.NOT_MODIFIED) {
				delete headers["accept-ranges"];
				delete headers["content-encoding"];
				delete headers["content-length"];
				delete headers["content-type"];
				delete headers.date;
				delete headers["transfer-encoding"];
			}

			// Clean up, in case it these are still hanging around
			if (status === CODES.NOT_FOUND) {
				delete headers.allow;
				delete headers["access-control-allow-methods"];
			}

			// Setting `x-response-time`
			headers["x-response-time"] = ((req.timer.stopped === null ? req.timer.stop() : req.timer).diff() / 1000000).toFixed(2) + " ms";

			// Setting the partial content headers
			if (req.headers.range) {
				options = {};

				array.each(req.headers.range.match(/\d+/g) || [], function (i, idx) {
					options[idx === 0 ? "start" : "end"] = parseInt(i, 10);
				});

				if (options.end === undefined) {
					options.end = headers["content-length"];
				}

				if (isNaN(options.start) || isNaN(options.end) || options.start >= options.end) {
					delete req.headers.range;
					return this.error(req, res, CODES.NOT_SATISFIABLE);
				}

				status = CODES.PARTIAL_CONTENT;
				headers.status = status + " " + http.STATUS_CODES[status];
				headers["content-range"] = "bytes " + options.start + "-" + options.end + "/" + headers["content-length"];
				headers["content-length"] = number.diff(options.end, options.start) + 1;
			}

			// Determining if response should be compressed
			if (ua && (status === CODES.SUCCESS || status === CODES.PARTIAL_CONTENT) && body !== MESSAGES.NO_CONTENT && this.config.compress && (type = this.compression(ua, encoding, headers["content-type"])) && type !== null) {
				headers["content-encoding"] = regex.gzip.test(type) ? "gzip" : "deflate";

				if (file) {
					headers["transfer-encoding"] = "chunked";
					delete headers["content-length"];
				}

				finalize();

				this.compress(req, res, body, type, headers.etag ? headers.etag.replace(/"/g, "") : undefined, file, options, status, headers);
			} else if ((status === CODES.SUCCESS || status === CODES.PARTIAL_CONTENT) && file && regex.get_only.test(req.method)) {
				headers["transfer-encoding"] = "chunked";
				delete headers["content-length"];

				finalize();

				if (!res._header && !res._headerSent) {
					res.writeHead(status, headers);
				}

				fs.createReadStream(body, options).on("error", function (e) {
					_this9.log(new Error("[client " + (req.headers["x-forwarded-for"] ? array.last(string.explode(req.headers["x-forwarded-for"])) : req.connection.remoteAddress) + "] " + e.message), "error");
					_this9.error(req, res, CODES.SERVER_ERROR);
				}).pipe(res);
			} else {
				finalize();

				if (!res._header && !res._headerSent) {
					res.writeHead(status, headers);
				}

				res.end(status === CODES.PARTIAL_CONTENT ? body.slice(options.start, options.end) : body);
			}

			timer.stop();

			this.signal("respond", function () {
				return [req.headers.host, req.method, req.url, status, timer.diff()];
			});

			return this.log(this.prep(req, res, headers), "info");
		}
	}, {
		key: "restart",

		/**
   * Restarts the instance
   *
   * @method restart
   * @return {Object} TurtleIO instance
   */
		value: function restart() {
			var config = this.config;

			return this.stop().start(config);
		}
	}, {
		key: "route",

		/**
   * Routes a request to a handler
   *
   * @method route
   * @param  {Object} req Request Object
   * @param  {Object} res Response Object
   * @return {Object}     TurtleIO instance
   */
		value: function route(req, res) {
			var _this10 = this;

			var url = this.url(req),
			    method = req.method.toLowerCase(),
			    parsed = parse(url),
			    update = false,
			    payload = undefined;

			if (regex.head.test(method)) {
				method = "get";
			}

			// Decorating parsed Object on request
			req.parsed = parsed;
			req.query = parsed.query;
			req.ip = req.headers["x-forwarded-for"] ? array.last(string.explode(req.headers["x-forwarded-for"])) : req.connection.remoteAddress;
			req.server = this;
			req.timer = precise().start();

			// Finding a matching vhost
			array.each(this.vhostsRegExp, function (i, idx) {
				if (i.test(parsed.hostname)) {
					return !(req.vhost = _this10.vhosts[idx]);
				}
			});

			req.vhost = req.vhost || this.config["default"];

			// Adding middleware to avoid the round trip next time
			if (!this.allowed("get", req.parsed.pathname, req.vhost)) {
				this.get(req.parsed.pathname, function (req, res) {
					_this10.request(req, res);
				}, req.vhost);

				update = true;
			}

			req.allow = this.allows(req.parsed.pathname, req.vhost, update);
			req.body = "";

			// Decorating response
			res.redirect = function (uri) {
				_this10.respond(req, res, MESSAGES.NO_CONTENT, CODES.FOUND, { location: uri });
			};

			res.respond = function (arg, status, headers) {
				_this10.respond(req, res, arg, status, headers);
			};

			res.error = function (status, arg) {
				_this10.error(req, res, status, arg);
			};

			// Mimic express for middleware interoperability
			res.locals = {};
			res.header = res.setHeader;

			// Setting listeners if expecting a body
			if (regex.body.test(method)) {
				req.setEncoding("utf-8");

				req.on("data", function (data) {
					payload = payload === undefined ? data : payload + data;

					if (_this10.config.maxBytes > 0 && Buffer.byteLength(payload) > _this10.config.maxBytes) {
						req.invalid = true;
						_this10.error(req, res, CODES.REQ_TOO_LARGE);
					}
				});

				req.on("end", function () {
					if (!req.invalid) {
						if (payload) {
							req.body = payload;
						}

						_this10.run(req, res, req.vhost, method);
					}
				});
			}
			// Running middleware
			else {
				this.run(req, res, req.vhost, method);
			}

			return this;
		}
	}, {
		key: "routes",

		/**
   * Returns middleware for the uri
   *
   * @method result
   * @param  {String}  uri      URI to query
   * @param  {String}  host     Hostname
   * @param  {String}  method   HTTP verb
   * @param  {Boolean} override Overrides cached version
   * @return {Array}
   */
		value: function routes(uri, host, method, override) {
			var id = method + ":" + host + ":" + uri,
			    cached = override !== true && this.routeCache.get(id),
			    all = undefined,
			    h = undefined,
			    result = undefined;

			if (cached) {
				return cached;
			}

			all = this.middleware.all || {};
			h = this.middleware[host] || {};
			result = [];

			try {
				array.each([all.all, all[method], h.all, h[method]], function (c) {
					if (c) {
						array.each(array.keys(c).filter(function (i) {
							return new RegExp("^" + i + "$", "i").test(uri);
						}), function (i) {
							result = result.concat(c[i]);
						});
					}
				});
			} catch (e) {
				result = [];
			}

			this.routeCache.set(id, result);

			return result;
		}
	}, {
		key: "run",

		/**
   * Runs middleware in a chain
   *
   * @method run
   * @param  {Object} req    Request Object
   * @param  {Object} res    Response Object
   * @param  {String} host   [Optional] Host
   * @param  {String} method HTTP method
   * @return {Object}        TurtleIO instance
   */
		value: function run(req, res, host, method) {
			var _this11 = this;

			var middleware = array.iterator(this.routes(req.parsed.pathname, host, method));

			var get_arity = function get_arity(arg) {
				return arg.toString().replace(/(^.*\()|(\).*)|(\n.*)/g, "").split(",").length;
			};

			var stop = function stop(timer) {
				if (timer.stopped === null) {
					timer.stop();
					_this11.signal("middleware", function () {
						return [host, req.url, timer.diff()];
					});
				}
			};

			var last = function last(timer, err) {
				var status = undefined;

				stop(timer);

				if (!err) {
					if (regex.get.test(method)) {
						_this11.request(req, res);
					} else if (_this11.allowed("get", req.parsed.pathname, req.vhost)) {
						_this11.error(req, res, CODES.NOT_ALLOWED);
					} else {
						_this11.error(req, res, CODES.NOT_FOUND);
					}
				} else {
					status = res.statusCode >= CODES.BAD_REQUEST ? res.statusCode : CODES[(err.message || err).toUpperCase()] || CODES.SERVER_ERROR;
					_this11.error(req, res, status, err);
				}
			};

			var next = (function (_next) {
				function next(_x) {
					return _next.apply(this, arguments);
				}

				next.toString = function () {
					return _next.toString();
				};

				return next;
			})(function (err) {
				delay(function () {
					var timer = precise().start(),
					    arity = 3,
					    item = middleware.next();

					if (!item.done) {
						if (err) {
							// Finding the next error handling middleware
							arity = get_arity(item.value);
							do {
								arity = get_arity(item.value);
							} while (arity < 4 && (item = middleware.next()) && !item.done);
						}

						stop(timer);

						if (!item.done) {
							if (err) {
								if (arity === 4) {
									try {
										item.value(err, req, res, next);
									} catch (e) {
										next(e);
									}
								} else {
									last(timer, err);
								}
							} else {
								try {
									item.value(req, res, next);
								} catch (e) {
									next(e);
								}
							}
						} else {
							last(timer, err);
						}
					} else if (!res._header && _this11.config.catchAll) {
						last(timer, err);
					}
				});
			});

			next();

			return this;
		}
	}, {
		key: "signal",

		/**
   * Signals a probe
   *
   * @method signal
   * @param  {String}   name Name of probe
   * @param  {Function} fn   DTP handler
   * @return {Object}        TurtleIO instance
   */
		value: function signal(name, fn) {
			if (this.config.logs.dtrace) {
				this.dtp.fire(name, fn);
			}

			return this;
		}
	}, {
		key: "start",

		/**
   * Starts the instance
   *
   * @method start
   * @param  {Object}   config Configuration
   * @param  {Function} err    Error handler
   * @return {Object}          TurtleIO instance
   */
		value: function start(cfg, err) {
			var _this12 = this;

			var config = undefined,
			    headers = undefined,
			    pages = undefined;

			config = clone(defaultConfig, true);

			// Merging custom with default config
			merge(config, cfg || {});

			this.dtp = dtrace.createDTraceProvider(config.id || "turtle-io");

			// Duplicating headers for re-decoration
			headers = clone(config.headers, true);

			// Overriding default error handler
			if (typeof err == "function") {
				this.error = err;
			}

			// Setting configuration
			if (!config.port) {
				config.port = 8000;
			}

			merge(this.config, config);

			// Setting temp folder
			this.config.tmp = this.config.tmp || os.tmpdir();

			pages = this.config.pages ? path.join(this.config.root, this.config.pages) : path.join(__dirname, "../pages");
			LOGLEVEL = LEVELS.indexOf(this.config.logs.level);
			LOGGING = this.config.logs.dtrace || this.config.logs.stdout;

			// Looking for required setting
			if (!this.config["default"]) {
				this.log(new Error("[client 0.0.0.0] Invalid default virtual host"), "error");
				process.exit(1);
			}

			// Lowercasing default headers
			delete this.config.headers;
			this.config.headers = {};

			iterate(headers, function (value, key) {
				_this12.config.headers[key.toLowerCase()] = value;
			});

			// Setting `Server` HTTP header
			if (!this.config.headers.server) {
				this.config.headers.server = "turtle.io/3.2.19";
				this.config.headers["x-powered-by"] = "node.js/" + process.versions.node.replace(/^v/, "") + " " + string.capitalize(process.platform) + " V8/" + string.trim(process.versions.v8.toString());
			}

			// Creating regex.rewrite
			regex.rewrite = new RegExp("^(" + this.config.proxy.rewrite.join("|") + ")$");

			// Setting default routes
			this.host(ALL);

			// Registering DTrace probes
			this.probes();

			// Registering virtual hosts
			array.each(array.cast(config.vhosts, true), function (i) {
				_this12.host(i);
			});

			// Loading default error pages
			fs.readdir(pages, function (e, files) {
				if (e) {
					_this12.log(new Error("[client 0.0.0.0] " + e.message), "error");
				} else if (array.keys(_this12.config).length > 0) {
					array.each(files, function (i) {
						_this12.pages.all[i.replace(regex.next, "")] = fs.readFileSync(path.join(pages, i), "utf8");
					});

					// Starting server
					if (_this12.server === null) {
						// For proxy behavior
						if (https.globalAgent.maxSockets < _this12.config.proxy.maxConnections) {
							https.globalAgent.maxConnections = _this12.config.proxy.maxConnections;
						}

						if (http.globalAgent.maxSockets < _this12.config.proxy.maxConnections) {
							http.globalAgent.maxConnections = _this12.config.proxy.maxConnections;
						}

						if (_this12.config.ssl.cert !== null && _this12.config.ssl.key !== null) {
							// POODLE
							_this12.config.secureProtocol = "SSLv23_method";
							_this12.config.secureOptions = constants.SSL_OP_NO_SSLv3 | constants.SSL_OP_NO_SSLv2;

							// Reading files
							_this12.config.ssl.cert = fs.readFileSync(_this12.config.ssl.cert);
							_this12.config.ssl.key = fs.readFileSync(_this12.config.ssl.key);

							// Starting server
							_this12.server = https.createServer(merge(_this12.config.ssl, {
								port: _this12.config.port,
								host: _this12.config.address,
								secureProtocol: _this12.config.secureProtocol,
								secureOptions: _this12.config.secureOptions
							}), function (req, res) {
								_this12.route(req, res);
							}).listen(_this12.config.port, _this12.config.address);
						} else {
							_this12.server = http.createServer(function (req, res) {
								_this12.route(req, res);
							}).listen(_this12.config.port, _this12.config.address);
						}
					} else {
						_this12.server.listen(_this12.config.port, _this12.config.address);
					}

					// Dropping process
					if (_this12.config.uid && !isNaN(_this12.config.uid)) {
						process.setuid(_this12.config.uid);
					}

					_this12.log("Started " + _this12.config.id + " on port " + _this12.config.port, "debug");
				}
			});

			// Something went wrong, server must restart
			process.on("uncaughtException", function (e) {
				_this12.log(e, "error");
				process.exit(1);
			});

			return this;
		}
	}, {
		key: "status",

		/**
   * Returns an Object describing the instance's status
   *
   * @method status
   * @public
   * @return {Object} Status
   */
		value: function status() {
			var timer = precise().start(),
			    ram = process.memoryUsage(),
			    uptime = process.uptime(),
			    state = { config: {}, etags: {}, process: {}, server: {} },
			    invalid = /^(auth|session|ssl)$/;

			// Startup parameters
			iterate(this.config, function (v, k) {
				if (!invalid.test(k)) {
					state.config[k] = v;
				}
			});

			// Process information
			state.process = {
				memory: ram,
				pid: process.pid
			};

			// Server information
			state.server = {
				address: this.server.address(),
				uptime: uptime
			};

			// LRU cache
			state.etags = {
				items: this.etags.length,
				bytes: Buffer.byteLength(array.cast(this.etags.cache).map(function (i) {
					return i.value;
				}).join(""))
			};

			timer.stop();

			this.signal("status", function () {
				return [state.server.connections, uptime, ram.heapUsed, ram.heapTotal, timer.diff()];
			});

			return state;
		}
	}, {
		key: "stop",

		/**
   * Stops the instance
   *
   * @method stop
   * @return {Object} TurtleIO instance
   */
		value: function stop() {
			var port = this.config.port;

			this.log("Stopping " + this.config.id + " on port " + port, "debug");

			this.config = {};
			this.dtp = null;
			this.etags = lru(1000);
			this.pages = { all: {} };
			this.permissions = lru(1000);
			this.routeCache = lru(5000); // verbs * etags
			this.vhosts = [];
			this.vhostsRegExp = [];
			this.watching = {};

			if (this.server !== null) {
				this.server.close();
				this.server = null;
			}

			return this;
		}
	}, {
		key: "unregister",

		/**
   * Unregisters an Etag in the LRU cache and
   * removes stale representation from disk
   *
   * @method unregister
   * @param  {String} url URL requested
   * @return {Object}     TurtleIO instance
   */
		value: function unregister(url) {
			var _this13 = this;

			var cached = this.etags.cache[url],
			    lpath = this.config.tmp,
			    ext = ["gz", "zz"];

			if (cached) {
				lpath = path.join(lpath, cached.value.etag);
				this.etags.remove(url);
				array.each(ext, function (i) {
					var lfile = lpath + "." + i;

					fs.exists(lfile, function (exists) {
						if (exists) {
							fs.unlink(lfile, function (e) {
								if (e) {
									_this13.log(e);
								}
							});
						}
					});
				});
			}

			return this;
		}
	}, {
		key: "url",

		/**
   * Constructs a URL
   *
   * @method url
   * @param  {Object} req Request Object
   * @return {String}     Requested URL
   */
		value: function url(req) {
			var header = req.headers.authorization || "",
			    auth = "",
			    token = undefined;

			if (!string.isEmpty(header)) {
				token = header.split(regex.space).pop() || "", auth = new Buffer(token, "base64").toString();

				if (!string.isEmpty(auth)) {
					auth += "@";
				}
			}

			return "http" + (this.config.ssl.cert ? "s" : "") + "://" + auth + req.headers.host + req.url;
		}
	}, {
		key: "use",

		/**
   * Adds middleware to processing chain
   *
   * @method use
   * @param  {String}   path   [Optional] Path the middleware applies to, default is `/*`
   * @param  {Function} fn     Middlware to chain
   * @param  {String}   host   [Optional] Host
   * @param  {String}   method [Optional] HTTP method
   * @return {Object}          TurtleIO instance
   */
		value: function use(path, fn, host, method) {
			if (typeof path != "string") {
				host = fn;
				fn = path;
				path = "/.*";
			}

			host = host || ALL;
			method = method || ALL;

			if (typeof fn != "function" && (fn && typeof fn.handle != "function")) {
				throw new Error("Invalid middleware");
			}

			if (!this.middleware[host]) {
				this.middleware[host] = {};
			}

			if (!this.middleware[host][method]) {
				this.middleware[host][method] = {};
			}

			if (!this.middleware[host][method][path]) {
				this.middleware[host][method][path] = [];
			}

			if (fn.handle) {
				fn = fn.handle;
			}

			// hash for permission checks
			fn.hash = this.hash(fn.toString());

			this.middleware[host][method][path].push(fn);

			return this;
		}
	}, {
		key: "all",

		/**
   * Sets a handler for all methods
   *
   * @method all
   * @param  {String}   route RegExp pattern
   * @param  {Function} fn    Handler
   * @param  {String}   host  [Optional] Virtual host, default is `all`
   * @return {Object}         TurtleIO instance
   */
		value: function all(route, fn, host) {
			var _this14 = this;

			array.each(VERBS, function (i) {
				_this14.use(route, fn, host, i);
			});

			return this;
		}
	}, {
		key: "del",

		/**
   * Sets a DELETE handler
   *
   * @method delete
   * @param  {String}   route RegExp pattern
   * @param  {Function} fn    Handler
   * @param  {String}   host  [Optional] Virtual host, default is `all`
   * @return {Object}         TurtleIO instance
   */
		value: function del(route, fn, host) {
			return this.use(route, fn, host, "delete");
		}
	}, {
		key: "delete",

		/**
   * Sets a DELETE handler
   *
   * @method delete
   * @param  {String}   route RegExp pattern
   * @param  {Function} fn    Handler
   * @param  {String}   host  [Optional] Virtual host, default is `all`
   * @return {Object}         TurtleIO instance
   */
		value: function _delete(route, fn, host) {
			return this.use(route, fn, host, "delete");
		}
	}, {
		key: "get",

		/**
   * Sets a GET handler
   *
   * @method delete
   * @param  {String}   route RegExp pattern
   * @param  {Function} fn    Handler
   * @param  {String}   host  [Optional] Virtual host, default is `all`
   * @return {Object}         TurtleIO instance
   */
		value: function get(route, fn, host) {
			return this.use(route, fn, host, "get");
		}
	}, {
		key: "patch",

		/**
   * Sets a PATCH handler
   *
   * @method delete
   * @param  {String}   route RegExp pattern
   * @param  {Function} fn    Handler
   * @param  {String}   host  [Optional] Virtual host, default is `all`
   * @return {Object}         TurtleIO instance
   */
		value: function patch(route, fn, host) {
			return this.use(route, fn, host, "patch");
		}
	}, {
		key: "post",

		/**
   * Sets a POST handler
   *
   * @method delete
   * @param  {String}   route RegExp pattern
   * @param  {Function} fn    Handler
   * @param  {String}   host  [Optional] Virtual host, default is `all`
   * @return {Object}         TurtleIO instance
   */
		value: function post(route, fn, host) {
			return this.use(route, fn, host, "post");
		}
	}, {
		key: "put",

		/**
   * Sets a PUT handler
   *
   * @method delete
   * @param  {String}   route RegExp pattern
   * @param  {Function} fn    Handler
   * @param  {String}   host  [Optional] Virtual host, default is `all`
   * @return {Object}         TurtleIO instance
   */
		value: function put(route, fn, host) {
			return this.use(route, fn, host, "put");
		}
	}, {
		key: "watch",

		/**
   * Watches `path` for changes & updated LRU
   *
   * @method watcher
   * @param  {String} url      LRUItem url
   * @param  {String} path     File path
   * @param  {String} mimetype Mimetype of URL
   * @return {Object}          TurtleIO instance
   */
		value: function watch(url, path) {
			var _this15 = this;

			var watcher = undefined;

			/**
    * Cleans up caches
    *
    * @method cleanup
    * @private
    * @return {Undefined} undefined
    */
			var cleanup = function cleanup() {
				watcher.close();
				_this15.unregister(url);
				delete _this15.watching[path];
			};

			if (!this.watching[path]) {
				// Tracking
				this.watching[path] = 1;

				// Watching path for changes
				watcher = fs.watch(path, function (ev) {
					if (regex.rename.test(ev)) {
						cleanup();
					} else {
						fs.lstat(path, function (e, stat) {
							var value = undefined;

							if (e) {
								_this15.log(e);
								cleanup();
							} else if (_this15.etags.cache[url]) {
								value = _this15.etags.cache[url].value;
								value.etag = _this15.etag(url, stat.size, stat.mtime);
								value.timestamp = parseInt(new Date().getTime() / 1000, 10);
								_this15.register(url, value, true);
							} else {
								cleanup();
							}
						});
					}
				});
			}

			return this;
		}
	}, {
		key: "write",

		/**
   * Writes files to disk
   *
   * @method write
   * @param  {Object} req  HTTP request Object
   * @param  {Object} res  HTTP response Object
   * @param  {String} path File path
   * @return {Object}      TurtleIO instance
   */
		value: function write(req, res, path) {
			var _this16 = this;

			var timer = precise().start(),
			    put = regex.put.test(req.method),
			    body = req.body,
			    allow = req.allow,
			    del = this.allowed("DELETE", req.parsed.pathname, req.vhost),
			    status = undefined;

			if (!put && regex.end_slash.test(req.url)) {
				status = del ? CODES.CONFLICT : CODES.SERVER_ERROR;

				timer.stop();

				this.signal("write", function () {
					return [req.headers.host, req.url, req.method, path, timer.diff()];
				});

				this.respond(req, res, this.page(status, this.hostname(req)), status, { allow: allow }, false);
			} else {
				allow = array.remove(string.explode(allow), "POST").join(", ");

				fs.lstat(path, function (e, stat) {
					if (e) {
						_this16.error(req, res, CODES.NOT_FOUND);
					} else {
						var etag = "\"" + _this16.etag(req.parsed.href, stat.size, stat.mtime) + "\"";

						if (!req.headers.hasOwnProperty("etag") || req.headers.etag === etag) {
							fs.writeFile(path, body, function (e) {
								if (e) {
									_this16.error(req, req, CODES.SERVER_ERROR);
								} else {
									status = put ? CODES.NO_CONTENT : CODES.CREATED;
									_this16.respond(req, res, _this16.page(status, _this16.hostname(req)), status, { allow: allow }, false);
								}
							});
						} else if (req.headers.etag !== etag) {
							_this16.respond(req, res, MESSAGES.NO_CONTENT, CODES.FAILED, {}, false);
						}
					}
				});

				timer.stop();

				this.signal("write", function () {
					return [req.headers.host, req.url, req.method, path, timer.diff()];
				});
			}

			return this;
		}
	}]);

	return TurtleIO;
})();

/**
 * TurtleIO factory
 *
 * @method factory
 * @return {Object} TurtleIO instance
 */
function factory() {
	var obj = new TurtleIO();

	function cors(req, res, next) {
		req.cors = req.headers.origin !== undefined;
		next();
	}

	function etag(req, res, next) {
		var cached = undefined,
		    headers = undefined;

		if (regex.get_only.test(req.method) && !req.headers.range) {
			cached = obj.etags.get(req.parsed.href);

			// Sending a 304 if Client is making a GET & has current representation
			if (cached && (req.headers["if-none-match"] || "").replace(/\"/g, "") === cached.etag) {
				headers = clone(cached.headers, true);
				headers.age = parseInt(new Date().getTime() / 1000 - cached.timestamp, 10);
				return obj.respond(req, res, MESSAGES.NO_CONTENT, CODES.NOT_MODIFIED, obj.headers(req, headers, CODES.NOT_MODIFIED));
			} else {
				next();
			}
		} else {
			next();
		}
	}

	obj.use(cors).blacklist(cors);
	obj.use(etag).blacklist(etag);

	return obj;
}

module.exports = factory;