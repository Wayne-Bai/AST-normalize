/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

/*jslint evil: true, devel: true, node: true, plusplus: true, unparam: false */
/*global mongoose: true, Scheme: true, org: true, core: true, goorm: true, io: true */

var common = require(__path+"plugins/org.goorm.plugin.phonegap/modules/common.js");
var EventEmitter = require("events").EventEmitter

module.exports = {
	do_new: function(req, res) {
		var evt = new EventEmitter();
		var new_project = require(common.path+"modules/project/new_project.js");
		/* req.data = 
		   { 
			project_type,
			project_detailed_type,
			project_author,
			project_name,
			project_desc,
			use_collaboration
		   }
		*/
		
		evt.on("do_new_complete", function (data) {
			res.json(data);
		});
		
		new_project.do_new(req, evt);
	},
	make_template: function(req, res) {
		var evt = new EventEmitter();
		var make_template = require(common.path+"modules/project/new_template.js");

		evt.on("make_template_complete", function (data) {
			res.json(data);
		});
		
		make_template.make_template(req, evt);
	},
	
	debug: function(req, evt) {
		var debug = require(common.path+"modules/project/debug.js");
		
		if(req.mode == "init") {
			debug.init(req, evt);
		}
		else if (req.mode == "close") {
			debug.close();
		}
		else {
			debug.debug(req, evt);
		}
	},
	
	run: function(req, res) {
		var evt = new EventEmitter();
		var run_project = require(common.path+"modules/project/run.js");
		/* req.data = 
		   { 
			project_path
		   }
		*/
		
		evt.on("do_run_complete", function (data) {
			res.json(data);
		});
		
		run_project.run(req, evt);
	}
};