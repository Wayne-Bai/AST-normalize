"use strict";

var nconf = require('nconf'),
	path = require('path'),
	winston = require('winston'),
	controllers = require('../controllers'),
	meta = require('../meta'),
	plugins = require('../plugins'),
	express = require('express'),

	metaRoutes = require('./meta'),
	apiRoutes = require('./api'),
	adminRoutes = require('./admin'),
	feedRoutes = require('./feeds'),
	pluginRoutes = require('./plugins'),
	authRoutes = require('./authentication'),
	helpers = require('./helpers');

var setupPageRoute = helpers.setupPageRoute;

function mainRoutes(app, middleware, controllers) {
	setupPageRoute(app, '/', middleware, [], controllers.home);

	var loginRegisterMiddleware = [middleware.redirectToAccountIfLoggedIn];

	setupPageRoute(app, '/login', middleware, loginRegisterMiddleware, controllers.login);
	setupPageRoute(app, '/register', middleware, loginRegisterMiddleware, controllers.register);
	setupPageRoute(app, '/confirm/:code', middleware, [], controllers.confirmEmail);
	setupPageRoute(app, '/outgoing', middleware, [], controllers.outgoing);
	setupPageRoute(app, '/search/:term?', middleware, [middleware.guestSearchingAllowed], controllers.search.search);
	setupPageRoute(app, '/reset/:code?', middleware, [], controllers.reset);
	setupPageRoute(app, '/tos', middleware, [], controllers.termsOfUse);
}

function staticRoutes(app, middleware, controllers) {
	setupPageRoute(app, '/404', middleware, [], controllers.static['404']);
	setupPageRoute(app, '/403', middleware, [], controllers.static['403']);
	setupPageRoute(app, '/500', middleware, [], controllers.static['500']);
}

function topicRoutes(app, middleware, controllers) {
	app.get('/api/topic/teaser/:topic_id', controllers.topics.teaser);

	setupPageRoute(app, '/topic/:topic_id/:slug/:post_index?', middleware, [], controllers.topics.get);
	setupPageRoute(app, '/topic/:topic_id/:slug?', middleware, [], controllers.topics.get);
}

function tagRoutes(app, middleware, controllers) {
	setupPageRoute(app, '/tags/:tag', middleware, [middleware.publicTagListing], controllers.tags.getTag);
	setupPageRoute(app, '/tags', middleware, [middleware.publicTagListing], controllers.tags.getTags);
}

function categoryRoutes(app, middleware, controllers) {
	setupPageRoute(app, '/categories', middleware, [], controllers.categories.list);
	setupPageRoute(app, '/popular/:term?', middleware, [], controllers.categories.popular);
	setupPageRoute(app, '/recent', middleware, [], controllers.categories.recent);
	setupPageRoute(app, '/unread', middleware, [middleware.authenticate], controllers.categories.unread);
	app.get('/api/unread/total', middleware.authenticate, controllers.categories.unreadTotal);

	setupPageRoute(app, '/category/:category_id/:slug/:topic_index', middleware, [], controllers.categories.get);
	setupPageRoute(app, '/category/:category_id/:slug?', middleware, [], controllers.categories.get);
}

function accountRoutes(app, middleware, controllers) {
	var middlewares = [middleware.checkGlobalPrivacySettings];
	var accountMiddlewares = [middleware.checkGlobalPrivacySettings, middleware.checkAccountPermissions];

	setupPageRoute(app, '/user/:userslug', middleware, middlewares, controllers.accounts.getAccount);
	setupPageRoute(app, '/user/:userslug/following', middleware, middlewares, controllers.accounts.getFollowing);
	setupPageRoute(app, '/user/:userslug/followers', middleware, middlewares, controllers.accounts.getFollowers);
	setupPageRoute(app, '/user/:userslug/posts', middleware, middlewares, controllers.accounts.getPosts);
	setupPageRoute(app, '/user/:userslug/topics', middleware, middlewares, controllers.accounts.getTopics);
	setupPageRoute(app, '/user/:userslug/groups', middleware, middlewares, controllers.accounts.getGroups);

	setupPageRoute(app, '/user/:userslug/favourites', middleware, accountMiddlewares, controllers.accounts.getFavourites);
	setupPageRoute(app, '/user/:userslug/watched', middleware, accountMiddlewares, controllers.accounts.getWatchedTopics);
	setupPageRoute(app, '/user/:userslug/edit', middleware, accountMiddlewares, controllers.accounts.accountEdit);
	setupPageRoute(app, '/user/:userslug/settings', middleware, accountMiddlewares, controllers.accounts.accountSettings);

	setupPageRoute(app, '/notifications', middleware, [middleware.authenticate], controllers.accounts.getNotifications);
	setupPageRoute(app, '/chats/:userslug?', middleware, [middleware.redirectToLoginIfGuest], controllers.accounts.getChats);
}

function userRoutes(app, middleware, controllers) {
	var middlewares = [middleware.checkGlobalPrivacySettings];

	setupPageRoute(app, '/users', middleware, middlewares, controllers.users.getOnlineUsers);
	setupPageRoute(app, '/users/online', middleware, middlewares, controllers.users.getOnlineUsers);
	setupPageRoute(app, '/users/sort-posts', middleware, middlewares, controllers.users.getUsersSortedByPosts);
	setupPageRoute(app, '/users/sort-reputation', middleware, middlewares, controllers.users.getUsersSortedByReputation);
	setupPageRoute(app, '/users/latest', middleware, middlewares, controllers.users.getUsersSortedByJoinDate);
	setupPageRoute(app, '/users/search', middleware, middlewares, controllers.users.getUsersForSearch);
 }

function groupRoutes(app, middleware, controllers) {
	var middlewares = [middleware.checkGlobalPrivacySettings, middleware.exposeGroupName];

	setupPageRoute(app, '/groups', middleware, middlewares, controllers.groups.list);
	setupPageRoute(app, '/groups/:slug', middleware, middlewares, controllers.groups.details);
	setupPageRoute(app, '/groups/:slug/members', middleware, middlewares, controllers.groups.members);
}

module.exports = function(app, middleware) {
	var router = express.Router(),
		pluginRouter = express.Router(),
		authRouter = express.Router(),
		relativePath = nconf.get('relative_path');

	pluginRouter.render = function() {
		app.render.apply(app, arguments);
	};

	// Set-up for hotswapping (when NodeBB reloads)
	pluginRouter.hotswapId = 'plugins';
	authRouter.hotswapId = 'auth';

	app.use(middleware.maintenanceMode);

	app.all(relativePath + '/api/?*', middleware.prepareAPI);
	app.all(relativePath + '/api/admin/?*', middleware.isAdmin);
	app.all(relativePath + '/admin/?*', middleware.ensureLoggedIn, middleware.applyCSRF, middleware.isAdmin);

	adminRoutes(router, middleware, controllers);
	metaRoutes(router, middleware, controllers);
	apiRoutes(router, middleware, controllers);
	feedRoutes(router, middleware, controllers);
	pluginRoutes(router, middleware, controllers);

	/**
	* Every view has an associated API route.
	*
	*/

	mainRoutes(router, middleware, controllers);
	staticRoutes(router, middleware, controllers);
	topicRoutes(router, middleware, controllers);
	tagRoutes(router, middleware, controllers);
	categoryRoutes(router, middleware, controllers);
	accountRoutes(router, middleware, controllers);
	userRoutes(router, middleware, controllers);
	groupRoutes(router, middleware, controllers);

	app.use(relativePath, pluginRouter);
	app.use(relativePath, router);
	app.use(relativePath, authRouter);

	if (process.env.NODE_ENV === 'development') {
		require('./debug')(app, middleware, controllers);
	}

	app.use(function(req, res, next) {
		if (req.user || parseInt(meta.config.privateUploads, 10) !== 1) {
			return next();
		}
		if (req.path.startsWith('/uploads/files')) {
			return res.status(403).json('not-allowed');
		}
		next();
	});

	app.use(relativePath, express.static(path.join(__dirname, '../../', 'public'), {
		maxAge: app.enabled('cache') ? 5184000000 : 0
	}));

	handle404(app, middleware);
	handleErrors(app, middleware);


	// Add plugin routes
	plugins.init(app, middleware);
	authRoutes.reloadRoutes();
};

function handle404(app, middleware) {
	app.use(function(req, res, next) {
		if (plugins.hasListeners('action:meta.override404')) {
			return plugins.fireHook('action:meta.override404', {
				req: req,
				res: res,
				error: {}
			});
		}

		var relativePath = nconf.get('relative_path');
		var	isLanguage = new RegExp('^' + relativePath + '/language/[\\w]{2,}/.*.json'),
			isClientScript = new RegExp('^' + relativePath + '\\/src\\/.+\\.js');

		if (isClientScript.test(req.url)) {
			res.type('text/javascript').status(200).send('');
		} else if (isLanguage.test(req.url)) {
			res.status(200).json({});
		} else if (req.accepts('html')) {
			if (process.env.NODE_ENV === 'development') {
				winston.warn('Route requested but not found: ' + req.url);
			}

			res.status(404);

			if (res.locals.isAPI) {
				return res.json({path: req.path, error: 'not-found'});
			}

			middleware.buildHeader(req, res, function() {
				res.render('404', {path: req.path});
			});
		} else {
			res.status(404).type('txt').send('Not found');
		}
	});
}

function handleErrors(app, middleware) {
	app.use(function(err, req, res, next) {
		if (err.code === 'EBADCSRFTOKEN') {
			winston.error(req.path + '\n', err.message)
			return res.sendStatus(403);
		}

		winston.error(req.path + '\n', err.stack);

		if (parseInt(err.status, 10) === 302 && err.path) {
			return res.locals.isAPI ? res.status(302).json(err.path) : res.redirect(err.path);
		}

		res.status(err.status || 500);

		if (res.locals.isAPI) {
			return res.json({path: req.path, error: err.message});
		} else {
			middleware.buildHeader(req, res, function() {
				res.render('500', {path: req.path, error: err.message});
			});
		}
	});
}

