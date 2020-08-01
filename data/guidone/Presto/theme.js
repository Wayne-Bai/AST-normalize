/*jshint laxbreak: true,eqnull: true,browser: true,jquery: true,devel: true,regexdash: true,multistr: true, white: false */
/*global define: true, require: true, module: true, Ti: true, L: true, Titanium: true, Class: true */

var _ = require('/presto/libs/underscore');
var Class = require('/presto/libs/inheritance').Class;
var jQ = require('/presto/libs/deferred/jquery-deferred');
var logger = require('/presto/logger');

/**
* @class presto.Theme
* Instance of the theme class
*/
var Theme = Class.extend({

	app: null,

	/**
	* @constructor init
	*/
	init: function(app,opts) {

		var default_settings = {
			theme: null
		};
		this._options = _.extend(default_settings,opts);

		this.app = app;


		return this;
	},

	/**
	* @method getPath
	* Get the theme path, with final slash
	* @return {String}
	*/
	getPath: function() {

    var options = this.app.getOptions();
		if (this.app.isTiShadow()) {
			// in tishadow the app path is inside documents
			return Ti.Filesystem.applicationDataDirectory+options.name+'/themes/'+this._options.theme+'/';
		} else {
			return Titanium.Filesystem.resourcesDirectory+'themes/'+this._options.theme+'/';
		}

	}

});

module.exports = Theme;

