/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

/*jshint newcap:false, debug:true, unused: true, evil: true, devel: true, plusplus: false, browser: true, jquery: true, undef:false */
/*clientside jslint comment for global */
/*global org: false, core: false */
/*jshint unused: false */



org.goorm.core.object.manager = function () {
	this.table_properties = null;
};

org.goorm.core.object.manager.prototype = {
	init: function (table_properties, canvas) {

		this.table_properties = table_properties;
		this.canvas = canvas;

		if (table_properties === "") {
			this.table_properties = core.module.layout.table_properties;
		}

		this.table_properties.connect_manager(this);
	},

	set: function (object) {
		this.table_properties.set(object);
	},

	unset: function (object) {
		this.table_properties.unset();
	}

};
