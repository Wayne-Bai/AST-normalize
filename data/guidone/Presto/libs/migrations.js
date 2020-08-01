/*jshint laxbreak: true,eqnull: true,browser: true,jquery: true,devel: true,regexdash: true,multistr: true, white: false */
/*global define: true, require: true, module: true, Ti: true, L: true, Titanium: true, Class: true */


var Inheritance = require('/common/inheritance').Class;
var _ = require('/common/underscore');
var Stackable = require('/common/stackable');

var _currentVersion = Ti.App.version;

var Migration = Inheritance.extend({
	
	
	_database: null,
	_ups: [],
	_downs: [],
	_ups_unversioned: [],
	
	
	/**
	* @constructor
	* Init the migrator
	* @param {String} database Name of the database
	* @param {String} version Initial version in case db version is empty
	*/
	init: function(database,version) {
		
		this._database = database;
		
		// create table if not exists, and set current 
		this._createVersionTable();
		if (!this._versionExists()) {
			this.setVersion(version != null ? version : _currentVersion);
		}	
		
	},
	
	_createVersionTable: function() {
			
		var db = Titanium.Database.open(this._database);
		
		// create table if not exists
		var query = 'CREATE TABLE IF NOT EXISTS migration_version (version Varchar(255))';
		db.execute(query);
		db.close();
		
	},
	
	/**
	* @method setCurrentVersion
	* Set the current version of the app, this is useful, for example, in TiShadow, where the app version is actually
	* the version of the TiShadow client
	* @param {String} version
	* @chainable
	*/
	setCurrentVersion: function(version) {
		_currentVersion = version;
		return this;
	},
	
	
	/**
	* @method _versionExists
	* Check if db version exists
	* @return {Boolean}
	* @private
	*/
	_versionExists: function() {

		var query = 'select * from migration_version';
		var db = Titanium.Database.open(this._database);
		
		var rows = db.execute(query);
		
		var result = rows.isValidRow() && rows.fieldByName('version') != null;
		
		rows.close();
		db.close();

		return result;		
	},

	/**
	* @method getVersion
	* Get the db version
	* @return {Object}
	*/
	getVersion: function() {

		var query = 'select * from migration_version';
		var db = Titanium.Database.open(this._database);
		
		var rows = db.execute(query);		
		var result = null;
				
		if (rows.isValidRow()) {
			// prova a decodificare
			result = rows.fieldByName('version');
		}
		
		rows.close();
		db.close();

		return result;
	},
	
	/**
	* @method setVersion
	* Set the db version
	* @param {String} version
	* @chainable
	*/
	setVersion: function(version) {

		var db = Titanium.Database.open(this._database);
		var query = null;
		
		if (this._versionExists()) {
			query = 'UPDATE migration_version SET version = ?';
			db.execute(query,[version]);
		} else {			
			query = 'INSERT INTO migration_version(version) VALUES(?)';
			db.execute(query,[version]);
		}
	
		db.close();

		return this;
	},

	
	/**
	* @method _versionToNumber
	* Convert a version number to integer
	* @private
	* @param {String} version Version in x.y.z format
	* @return {Number}
	*/
	_versionToNumber: function(version) {
	
		var split = version.split('.');
		
		while (split.length < 3) {
			split.push('0');
		}

		if (split.length != 3) {
			throw {
				code: '500',
				description: 'Wrong format version, must be something like 1.2.3'
			};
		} 
		
		return parseInt(split[0],10)*10000+parseInt(split[1],10)*100+parseInt(split[2],10);
		
	},
		
	
	/**
	* @method update
	* Update the database if needed
	* @param {String} version The target version
	* @chainable
	*/
	update: function(toVersion) {
	
		var that = this;
				
		var current = that._versionToNumber(that.getVersion());		
		if (toVersion == null) {
			toVersion = _currentVersion;
		}
		var target = that._versionToNumber(toVersion);

		Ti.API.info('Migrations: updating database('+that._database+') from '+that.getVersion()+' to '+toVersion);
		//Ti.API.info('Migration: updating database('+that._database+') from '+current+' to '+target);
		
		// select which direction
		var filtered = null;
		var stack = new Stackable();
		var _appendItemToStack = function(item) {
			
			if (_.isFunction(item.callback)) {
				stack.push(function(database) {
					
					var deferred = Ti.App.jQuery.Deferred();
					
					Ti.API.info('Upgrading database to '+item.version);
					try {
						
						// execute the upgrader
						item.callback.call(that,database);					
						// set the version of this step
						that.setVersion(item.version);
						// ok, resolve
						deferred.resolve();
						
					} catch(e) {
						
						Ti.API.info('Migrations: Patch to '+item.version+'failed: '+JSON.stringify(e));
						deferred.reject();
						
					}
										
					return deferred.promise();
				});
			} // end if function
			
		};

		if (current < target) {
			
			filtered = _(that._ups).filter(function(item) {
				return that._versionToNumber(item.version) > current;
			});
			
		} else {

			filtered = _(that._downs).filter(function(item) {
				var itemVersion = that._versionToNumber(item.version);
				return  itemVersion <= current && itemVersion > target;
			});
			
			filtered = _(filtered).reverse();
		}

		Ti.API.info('Migrations: applying '+filtered.length+' patches');
	
		
		// add all unversioned upgrade
		if (current < target) {
			_(that._ups_unversioned).each(_appendItemToStack);		
		}
		
		// add all filtered
		_(filtered).each(_appendItemToStack); // end each
		
		if (stack.length() == 0) {
		
			Ti.API.info('Migration: Nothing to update');
			var deferred = Ti.App.jQuery.Deferred();
			that.setVersion(toVersion);
			deferred.resolve();
			return deferred.promise();
			
		} else {
			// open the database
			var database = Titanium.Database.open(that._database);
			return stack.serial(database)
				.done(function() {
					that.setVersion(toVersion);
				})
				.always(function() {
					// always close db
					database.close();
				});
		}				
	},
	
	/**
	* @method up
	* Sql to execute when upping
	* @param {String} [version] Version of the ugrade, in the format x.y.z, if missing, callback will be execute for every
	* upgrade
	* @param {Fucntion} callback Callback to execute, the first parameter is the database object
	* @chainable
	*/
	up: function(version,callback) {
		
		var that = this;
		
		if (version != null && callback != null) {
			that._ups.push({
				version: version,
				callback: callback
			});
			
			that._ups = _(this._ups).sortBy(function(item) {
				return that._versionToNumber(item.version);
			});
		} else if (version != null) {
			
			callback = version;
			that._ups_unversioned.push({
				version: 'x.x.x',
				callback: callback
			});
			
		}
		return that;
	},
	
	/**
	* @method down
	* Sql to execute when downing
	* @chainable
	*/
	down: function(version,callback) {
		
		var that = this;
		that._downs.push({
			version: version,
			callback: callback
		});
		
		that._downs = _(this._downs).sortBy(function(item) {
			return that._versionToNumber(item.version);
		});
		
		return that;
	}	
	
	
});

module.exports = Migration;