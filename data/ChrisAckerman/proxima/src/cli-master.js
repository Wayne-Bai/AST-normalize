"use strict";

exports.init = function()
{
	var proxima = require('../');
	var core = require('./jscore');
	var path = require('path');
	var constants = require('./Constants.js');
	var util = require('./cli-util.js');

	var argv = require('optimist')
		.usage(core.str.trim(constants.usage))
		.options('help', {
			'boolean': true,
			'description': 'Display this help text.'
		})
		.options('verbose', {
			'alias': 'v',
			'boolean': true,
			'description': 'Print log messages to stderr.'
		})
		.options('quiet', {
			'alias': 'q',
			'boolean': true,
			'description': 'Do not print log messages to stderr.'
		})
		.options('uid', {
			'alias': 'u',
			'description': 'User ID to use after listeners have been bound.'
		})
		.options('gid', {
			'alias': 'g',
			'description': 'Group ID to use after listeners have been bound.'
		})
		.options('workers', {
			'alias': 'w',
			'description': 'How many worker processes to spawn.'
		})
		.options('config', {
			'alias': 'c',
			'description': 'Set the configuration file path.',
			'default': './proxima.json'
		})
		.argv;

	if (argv.help)
	{
		require('optimist').showHelp();
		process.exit();
	}

	var options = {
		'verbose': !!argv.verbose,
		'workers': 0,
		'uid': null,
		'gid': null,
		'listeners': [8080],
		'routes': [],
		'404': true,
		'500': true,
		'504': true,
		'specTimeout': 1000
	};

	function log(message)
	{
		if (options.verbose && message != null)
			console.error('' + message);
	}

	var configPath = path.resolve(argv.config);

	try
	{
		options = core.util.jsonConfig(configPath, options);
	}
	catch (err)
	{
		log(err.message + ': ' + configPath);
		configPath = null;
	}

	options.verbose = argv.quiet ? false : !!options.verbose;

	options.workers = parseInt(options.workers, 10) || 0;
	if (options.workers < 0)
		options.workers = 0;

	var routes = [];
	var errors = [];
	var listeners = [];

	try
	{
		if (argv.hasOwnProperty('uid'))
		{
			options.uid = util.parseUID(argv.uid);
			if (!options.uid)
				throw new Error("uid argument expects a value");
		}
		else
		{
			options.uid = util.parseUID(options.uid);
		}

		if (argv.hasOwnProperty('gid'))
		{
			options.gid = util.parseUID(argv.gid);
			if (!options.gid)
				throw new Error("gid argument expects a value");
		}
		else
		{
			options.gid = util.parseUID(options.gid);
		}

		if (configPath)
			log('Config: ' + configPath);

		if (typeof options.specTimeout !== 'number' || options.specTimeout < 0)
			throw new Error("specTimeout expects an integer");

		log('Routes:');

		util.eachRoute(options.routes, function(hostname, to)
		{
			if (hostname.is === 'regex')
				log(' from ' + hostname.value + ' to ' + proxima.endpoint.pretty(to));
			else
				log(' from "' + hostname.value + '" to ' + proxima.endpoint.pretty(to));

			routes.push({ hostname: hostname, to: to });
		});

		util.eachError(options, function(code, value)
		{
			if (value === true)
				return;

			log(' error ' + code + ' to ' + (value ? proxima.endpoint.pretty(value) : 'disconnect'));
			errors.push({ code: code, value: value });
		});

		if (routes.length + errors.length === 0)
			log(' <none>');

		log('Listeners:');

		util.eachListener(options.listeners, function(listenerArgs)
		{
			log(' ' + proxima.endpoint.pretty(listenerArgs));
			listeners.push(listenerArgs);
		});
	}
	catch (err)
	{
		console.error('Error: ' + err.message);
		process.exit(1);
	}

	log('Options:');

	log(' Speculative Timeout: ' + (options.specTimeout / 1000) + 's');

	log(' Workers: ' + options.workers);

	if (options.uid)
		log(' UID: ' + options.uid);
	else
		log(' UID: ' + process.getuid());

	if (options.gid)
		log(' GID: ' + options.gid);
	else
		log(' GID: ' + process.getgid());

	log('');

	return {
		verbose: options.verbose,
		workerCount: options.workers,
		worker: {
			verbose: options.verbose,
			routes: routes,
			errors: errors,
			listeners: listeners,
			uid: options.uid,
			gid: options.gid,
			specTimeout: options.specTimeout
		}
	};
};
