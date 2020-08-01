var fs = require('fs'),
	walk = require('walk'),
	emitter,
	common = require(__path + "plugins/org.goorm.plugin.php/modules/common.js");

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