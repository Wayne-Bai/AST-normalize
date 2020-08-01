
lychee.define('sorbet.Main').requires([
	'lychee.Input',
	'lychee.data.JSON',
	'sorbet.data.Host',
	'sorbet.net.Server',
//	'sorbet.mod.Fertilizer',
	'sorbet.mod.Package',
	'sorbet.mod.Server',
	'sorbet.serve.API',
	'sorbet.serve.File',
	'sorbet.serve.Redirect'
]).includes([
	'lychee.event.Emitter'
]).exports(function(lychee, sorbet, global, attachments) {

	var _JSON = lychee.data.JSON;


	/*
	 * HELPERS
	 */

	var _process_admin = function(data, ready) {

		var host = this.hosts['admin'] || null;
		var url  = data.headers.url    || null;

		if (host !== null && url !== null) {

			var parameters = {};

			if (data.headers.method.match(/PUT|POST/)) {
				parameters = _JSON.decode(data.payload) || {};
			}


			var url = data.headers.url.split('?')[0];
			var tmp = data.headers.url.split('?')[1] || '';

			if (tmp.length > 0) {

				tmp.split('&').forEach(function(value) {

					var key = value.split('=')[0];
					var val = value.split('=')[1];


					if (!isNaN(parseInt(val, 10))) {
						parameters[key] = parseInt(val, 10);
					} else if (val === 'true') {
						parameters[key] = true;
					} else if (val === 'false') {
						parameters[key] = false;
					} else if (val === 'null') {
						parameters[key] = null;
					} else {
						parameters[key] = val;
					}

				});

			}


			if (Object.keys(parameters).length > 0) {
				data.headers.parameters = parameters;
			}


			if (sorbet.serve.API.can(host, url) === true) {

				sorbet.serve.API.process(host, url, data, ready);
				return true;

			}

		}


		ready(null);

		return false;

	};

	var _process_server = function(data, ready) {

		var identifier = (data.headers['Host'] || '').split(':')[0];
		var host       = this.hosts[identifier] || null;
		var url        = data.headers.url || null;


		if (identifier !== 'admin' && host !== null && url !== null) {

			var parameters = {};

			var url = data.headers.url.split('?')[0];
			var tmp = data.headers.url.split('?')[1] || '';

			if (tmp.length > 0) {

				tmp.split('&').forEach(function(value) {

					var key = value.split('=')[0];
					var val = value.split('=')[1];


					if (!isNaN(parseInt(val, 10))) {
						parameters[key] = parseInt(val, 10);
					} else if (val === 'true') {
						parameters[key] = true;
					} else if (val === 'false') {
						parameters[key] = false;
					} else if (val === 'null') {
						parameters[key] = null;
					} else {
						parameters[key] = val;
					}

				});

			}


			if (Object.keys(parameters).length > 0) {
				data.headers.parameters = parameters;
			}


			if (sorbet.serve.API.can(host, url) === true) {

				sorbet.serve.API.process(host, url, data, ready);
				return true;

			} else if (sorbet.serve.File.can(host, url) === true) {

				sorbet.serve.File.process(host, url, data, ready);
				return true;

			} else if (sorbet.serve.Redirect.can(host, url) === true) {

				sorbet.serve.Redirect.process(host, url, data, ready);
				return true;

			}

		}


		ready(null);

		return false;

	};



	/*
	 * FEATURE DETECTION
	 */

	var _defaults = {

		port:   null,
		hosts:  null,

		server: {
			host: null,
			port: 8080
		}

	};


	var _project_cache = {};

	(function(projects) {

		projects['lychee'] = new sorbet.data.Project('lychee', '/lychee');


		var root_fs = new sorbet.data.Filesystem('/');
		var ids     = root_fs.dir('/projects').filter(function(value) {
			return value !== 'README.md';
		});

		if (ids.length > 0) {

			ids.forEach(function(id) {

				var info1 = root_fs.info('/projects/' + id + '/index.html');
				var info2 = root_fs.info('/projects/' + id + '/lychee.pkg');
				if ((info1 !== null && info1.type === 'file') || (info2 !== null && info2.type === 'file')) {
					projects[id] = new sorbet.data.Project(id, '/projects/' + id);
				}

			});

		}

	})(_project_cache);



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(settings) {

		this.settings = lychee.extendunlink({}, _defaults, settings);
		this.defaults = lychee.extendunlink({}, this.settings);

		this.hosts     = {};
		this.modules   = {};
		this.server    = null;


		if (settings.hosts instanceof Object) {

			for (var id in settings.hosts) {

				var project = settings.hosts[id];
				if (project === null) {

					this.setHost(id, null);

				} else {

					var cache = _project_cache[project] || null;
					if (cache !== null) {
						this.setHost(id, [ _project_cache['lychee'], cache ]);
					}

				}

			}

		}


		if (typeof settings.port === 'number') {
			this.settings.server.port = (settings.port | 0);
		}


		this.setHost('admin', null);


		lychee.event.Emitter.call(this);


		/*
		 * INITIALIZATION
		 */

		this.bind('load', function() {

		}, this, true);

		this.bind('init', function() {

			var settings = this.settings.server || null;
			if (settings !== null) {

				this.admin  = new sorbet.net.Server({ port: 4848 });
				this.server = new sorbet.net.Server(settings);

				this.admin.bind('serve', function(data, ready) {
					_process_admin.call(this, data, ready);
				}, this);

				this.server.bind('serve', function(data, ready) {
					_process_server.call(this, data, ready);
				}, this);


				var connections = 0;

				this.server.bind('connect', function() {

					connections++;

				});

				this.server.bind('disconnect', function() {

					connections--;

					if (typeof global.gc !== 'undefined') {

						if (connections === 0) {
							gc();
						}

					}

				});


				this.admin.connect();
				this.server.connect();


				var port  = this.server.port;
				var hosts = Object.keys(this.hosts).filter(function(host) {
					return host !== 'admin';
				}).map(function(host) {
					return 'http://' + host + ':' + port;
				});

				console.log('\n\n');
				console.log('Open your web browser and surf to ' + hosts.join(' or '));
				console.log('\n\n');

			}

		}, this, true);


		setTimeout(function() {

			for (var id in _project_cache) {

				var project = _project_cache[id];
				if (sorbet.mod.Server.can(project) === true) {
					sorbet.mod.Server.process(project);
				}

				if (sorbet.mod.Package.can(project) === true) {
					sorbet.mod.Package.process(project);
				}

			}

		}.bind(this), 1000);

	};


	Class.VERSION = 'lycheeJS ' + lychee.VERSION + ' Sorbet (running on NodeJS ' + process.version + ')';


	Class.prototype = {

		/*
		 * MAIN API
		 */

		init: function() {

			this.trigger('load', []);
			this.trigger('init', []);

		},

		destroy: function() {

			for (var id in _project_cache) {

				var project = _project_cache[id];
				if (project.server !== null) {
					project.server.destroy();
				}

			}


			if (this.server !== null) {
				this.server.disconnect();
				this.server = null;
			}


			this.trigger('destroy', []);

		},



		/*
		 * CUSTOM API
		 */

		setHost: function(identifier, projects) {

			identifier = typeof identifier === 'string' ? identifier : null;
			projects   = projects instanceof Array      ? projects   : Object.values(_project_cache);


			if (identifier !== null) {

				this.hosts[identifier] = new sorbet.data.Host({
					projects: projects
				});

				return true;

			}


			return false;

		}

	};


	return Class;

});

