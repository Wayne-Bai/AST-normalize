/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

/*jslint evil: true, devel: true, node: true, plusplus: true, unparam: false */
/*global mongoose: true, Scheme: true, org: true, core: true, goorm: true, io: true */

var fs = require('fs'),
	walk = require('walk'),
	emitter,
	common = require(__path + "plugins/org.goorm.plugin.python/modules/common.js");

var exec = require('child_process').exec;

module.exports = {
	do_new : function(req, evt) {
		var workspace = __workspace + "/" + req.data.project_author + "_" + req.data.project_name;
		var template = common.path + "template";

		
		
		exec('cp -r '+template+'/* '+workspace, function(__err){
			if(__err) console.log(__err);

			evt.emit("do_new_complete", {
				code : 200,
				message : "success"
			});

			
		});
	}
};