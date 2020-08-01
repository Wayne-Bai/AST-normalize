/*jshint laxbreak: true,eqnull: true,browser: true,jquery: true,devel: true,regexdash: true,multistr: true, white: false */
/*global define: true, require: true, module: true, Ti: true, L: true, Titanium: true, Class: true */

var _ = require('/presto/libs/underscore');
var Class = require('/presto/libs/inheritance').Class;
var jQ = require('/presto/libs/deferred/jquery-deferred');
var Cloud = require('ti.cloud');
var logger = require('/presto/logger');

/**
* @class presto.Session
* Instance of the session class
*/
var Session = Class.extend({
	
	app: null,
	
	/**
	* @property {presto.models.User} ?user
	* @private
	* Return the current user
	*/
	_user: null,
	
	/**
	* @property {String} _session_id
	* @private
	* Valid current session, it's not null only if there'a a valid online session (means verified online)
	*/
	_session_id: null,
	
	/**
	* @constructor init
	*/
	init: function(app,opts) {
		
		var default_settings = {
			
			/**
			* @cfg {Boolean} useOAuth
			* Use OAuth for authentication
			*/
			useOAuth: false
			
		};
		this._options = _.extend(default_settings,opts);
		// store the app
		this.app = app;
		// register config params
		app.config.registerParam('session','session_id','string');
		app.config.registerParam('session','user','object');
		
		// try to get the session id if any
		var session_id = app.config.get('session','session_id');
		Cloud.sessionId = session_id;
		
		return this;
	},
	
	/**
	* @method whoami
	* Detect the current user
	* @deferred
	*/
	whoami: function() {
		
		var deferred = jQ.Deferred();
		var that = this;
		
		Cloud.Users.showMe(function(result) {
			
			logger.info('whoami@Login -> '+JSON.stringify(result));
			if (result.success) {
				deferred.resolve(result);
			} else {
				deferred.reject({
					code: that.app.ERROR_AUTHENTICATION_FAILED,
					message: 'Authentication error, wrong username or password'
				});
			}
			
		});
		
		return deferred.promise();
	},
	
	/**
	* @method logout
	* Logout user
	* @deferred
	*/
	logout: function() {
		
		var that = this;
		var deferred = jQ.Deferred();
		
		that.app.loader.show();
		
		Cloud.Users.logout(function (e) {
			that.app.loader.hide();
			if (e.success) {
				// void the data
				that.app.config.set('session','session_id',null);
				that.app.config.set('session','user',null);
				that._session_id = null;
				that._user = null;
				// resolve
				deferred.resolve();
			} else {
				deferred.reject();
			}
		});
		
		return deferred.promise();
	},
	
	/**
	* @method login
	* Login user
	* @param {String} username
	* @param {String} password
	* @deferred
	*/
	login: function(username,password) {
	
		var that = this;
		var deferred = jQ.Deferred();

		logger.info('login in');
		
		that.app.loader.show();
		
		// !todo check connection
		
		Cloud.Users.login({
			login: username,
			password: password
		},function(result) {
			
			that.app.loader.hide();
			logger.info('result -> '+JSON.stringify(result));
			
			if (result.success) {
				
				// store user and session id
				that._user = result.users[0];
				that._session_id = result.meta.session_id;
				// store the session id somewhere
				that.app.config.set('session','session_id',result.meta.session_id);
				that.app.config.set('session','user',that._user);

				// fire event on session
				deferred.resolve(result);
				
			} else {
			
				// fail
				deferred.reject({
					code: that.app.ERROR_AUTHENTICATION_FAILED,
					message: 'Authentication error, wrong username or password'
				});
			}
						
		});
		
		return deferred.promise();
	},	
	
	loginWithFacebook: function(appToken) {

		var that = this;
		var deferred = jQ.Deferred();
		
		that.app.loader.show();
		Cloud.SocialIntegrations.externalAccountLogin({
			type: 'facebook',
			token: appToken
		},function(result) {
			that.app.loader.hide();
			Ti.API.info('accesso con fb '+JSON.stringify(result));
			if (result.success) {

				// store user and session id
				that._user = result.users[0];
				that._session_id = result.meta.session_id;
				// store the session id somewhere
				that.app.config.set('session','session_id',result.meta.session_id);
				that.app.config.set('session','user',that._user);
				// fire event on session
				deferred.resolve(result);
				
			} else {			
				// fail
				deferred.reject({
					code: that.app.ERROR_AUTHENTICATION_FAILED,
					message: 'Authentication with Facebook failed'
				});
			}
		});		
		
		return deferred.promise();		
	},
	
	
	
	/**
	* @method hasSessionOrToken
	* Tells if there's a local session id or token, than doesn't mean the user is currently logged, it's not (yet) verified
	* online
	* @return {Boolean}
	*/	
	hasSessionOrToken: function() {
		
		return this.app.config.has('session','session_id');
		
	},
	
	/**
	* @method isLogged
	* Tells if there's a valid session
	* @return {Boolean}
	*/
	isLogged: function() {

		var that = this;
		if (that.session_id != null) {
			return true;
		} else {
			return false;
		}
		
	}
	
});


/**
* @property {presto.models.User} user
* Return the current user
*/
Object.defineProperty(Session.prototype,'user',{
	get: function() {
		if (this._user != null) {
			return this._user;
		} else {
			return this.app.config.get('session','user');
		} 
	},
	enumerable: true,
	configurable: false
});

/**
* @property {String} session_id
* Valid current session, it's not null only if there'a a valid online session (means verified online)
*/
Object.defineProperty(Session.prototype,'session_id',{
	get: function() {
		if (this._user != null) {
			return this._session_id;
		} else {
			return this.app.config.get('session','session_id');
		} 
	},
	enumerable: true,
	configurable: false
});


module.exports = Session;

