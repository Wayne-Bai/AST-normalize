var fs = require('fs'),
	walk = require('walk'),
	emitter,
	common = require(__path + "plugins/org.goorm.plugin.jsp/modules/common.js");



module.exports = {
	copy_file_sync : function(srcFile, destFile) {
		BUF_LENGTH = 64*1024;
		buff = new Buffer(BUF_LENGTH);
		fdr = fs.openSync(srcFile, 'r');
		fdw = fs.openSync(destFile, 'w');
		if(fdw) {
			bytesRead = 1;
			pos = 0;
			while (bytesRead > 0) {
				bytesRead = fs.readSync(fdr, buff, 0, BUF_LENGTH, pos);
				fs.writeSync(fdw,buff,0,bytesRead);
				pos += bytesRead;
			}
			fs.closeSync(fdw);
			fs.closeSync(fdr);
		}
		else {
			fs.closeSync(fdr);
			return 0;
		}
		return 1;
	},
	
	run : function(req, evt, reculsive) {
		var self = this;
		var workspace = __workspace + req.data.project_path;
		var target_path = req.data.deploy_path + req.data.project_path;

		if(!fs.existsSync(target_path)) {
			fs.mkdir(target_path, function(err){
				if(err && reculsive){
					evt.emit("do_run_complete", {
						code : 501,
						message : "failure"
					});
					return ;
				} else {
					self.run(req, evt, true);
				}
			});
		}
		else {
			exec('cp -r '+workspace+' '+target_path, function(__err){
				if(__err) console.log(__err);

				evt.emit("do_run_complete", {
					code : 200,
					message : "success"
				});
			});
		}
	}
};