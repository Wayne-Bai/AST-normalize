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



org.goorm.core.layout.workspace = {
	window_manager: null,
	collaboration: null,

	init: function (target) {
		var self = this;

		

		//attaching tab element
		$("#" + target).append("<div id='workspace'></div>");

		//attaching window manager
		this.attach_window_manager('workspace');

		$("#workspace").mousedown(function (e) {
			$("#workspace").find(".hd").each(function (i) {
				$(this).removeClass("activated");
			});
			$("#workspace").find(".bd").each(function (i) {
				$(this).removeClass("activated");
			});
			$("#workspace").find(".ft").each(function (i) {
				$(this).removeClass("activated");
			});
		});
	},

	attach_window_manager: function (target) {
		//attaching window manager
		this.window_manager = org.goorm.core.window.manager;
		this.window_manager.init(target);
	}
};
