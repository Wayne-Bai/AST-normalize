/**
 * Safe - support for storing Backbone.Model to localstorage
 * 		  using the 'set' method of Model
 *
 * @constructor - use the key 'safe' to define unique storage key for backbone safe
 *
 * 				examples:
 *
 *				// simple defintion for safe
 *			 	Backbone.Model.extend({ key: 'my-unique-key' });
 *
 * 					// advanced defintion for safe with options
 *	  			Backbone.Model.extend({
 *	  			
 *		 				safe: {
 *		 					key: 'my-unique-key',
 *		 					options: {
 *		 						reload: true
 *		 					}
 *		 				}	
 * 
 *	  			})
 * 
 * @requires Backbone.js, Underscore.js
 * @param {string} uniqueID - the name of the storage you'de like to use
 * @param {object} context  - the Backbone.Model instance reference
 * @param {object} options - (optional) configuration for setting up various features
 *						 - {boolean} reload - true to reload (before initialize) data from local sotrage if exists
 *
 * @author Oren Farhi, http://orizens.com
 *
 * @version 0.3
 *
 */
var _ = require('underscore');
var Backbone = require('backbone');

Backbone.Safe = function(uniqueID, context, options) {

	// parsing options settings
	this._reload = options && options.reload && options.reload === true;

	this.uid = uniqueID;
	this.context = context;
	this.isCollection = !context.set && context.models && context.add;

	// mixins for collection and model
	var collection = {
		
		// events that Safe is listening in order to
		// trigger save to local storage
		events: 'add reset',

		// the value to be used when cleaning the safe
		emptyValue: '[]',

		reload: function() {
			context.add(this.getData());
		},

		toJSON: function(model) {
			return model.collection.toJSON();
		}
	};

	var model = {

		events: 'change',

		emptyValue: '{}',

		reload: function() {
			context.set(this.getData());
		},

		toJSON: function(model) {
			return model.toJSON();
		}
	};

	// attach relevant object to Safe prototype
	_.extend( this, this.isCollection ? collection : model );

	// if the uid doesn't exist, create it
	this.ensureUID();

	// These are the lines that are responsible for
	// loading the saved data from the local storage to the model
	//
	// the data is loaded before the Safe binds to change events
	// storage exist ? -> save to model
	// if it's a collection - use add
	if (this._reload) {
		this.reload();
	}

	// listen to any change event and cache it
	context.on(this.events, this.store, this);
};

Backbone.Safe.prototype = {
	
	/**
	 * creates a local storage item with the provided
	 * UID if not exist
	 */
	ensureUID: function() {
		if (_.isNull(this.getData())){
			this.create();
		}
	},

	create: function() {
		this.storage().setItem(this.uid, this.emptyValue);
	},

	store: function(model) {
		this.storage()
			.setItem(this.uid, JSON.stringify( this.toJSON( model )));
	},

	storage: function() {
		return localStorage;
	},

	/**
	 * returns json object of the local saved data
	 * @return {json}
	 */
	getData: function() {
		// JSON.parse can't be run with an empty string
		this._current = this.storage().getItem(this.uid);
		return this._current ? JSON.parse(this._current) : this._current;
	},

	// set the local storage key to the empty value
	reset: function() {
		this.create();
	},

	// removes the key from teh localstorage
	destroy: function() {
		this.storage().removeItem( this.uniqueID );
	}
};

// adapter
var Safe = function(context) {
	// handle key, value safe
	var storageKey = context.safe.key ? context.safe.key : context.safe;
	var options = context.safe.options || { reload: true };
	if (storageKey && context) {
		context.safe = new Backbone.Safe(storageKey, context, options);
	}
};

var init = function() {
	Backbone.trigger('extend:Model', {
		key: 'safe',
		extension: Safe,
		initialize: function () {
			this.trigger('after:initialize');
		}
	});

	Backbone.trigger('extend:Collection', {
		key: 'safe',
		extension: Safe,
		initialize: function () {
			this.trigger('after:initialize');
		}
	});
};

module.exports = {
	beam: init
}