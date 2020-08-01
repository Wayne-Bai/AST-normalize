/*
 Copyright (c) Shelloid Systems LLP. All rights reserved.
 The use and distribution terms for this software are covered by the
 GNU Lesser General Public License 3.0 (https://www.gnu.org/licenses/lgpl.html)
 which can be found in the file LICENSE at the root of this distribution.
 By using this software in any fashion, you are agreeing to be bound by
 the terms of this license.
 You must not remove this notice, or any other, from this software.
 */
var chokidar = require('chokidar');
var cluster = require('cluster');
var child_process = require('child_process');
var path = require("path");
var utils = lib_require("utils");

var watcher;

exports.init = function (serverCtx){
	var paths = [];
	var config = serverCtx.appCtx.config;
	if(config.autoRestart.appUpdate){
		sh.info("Autorestart enabled on application updates");
		paths.push(path.join(serverCtx.appCtx.basePath, "src"));
		var configPath = utils.envConfig(serverCtx.appCtx, 
										serverCtx.appCtx.basePath, ".json");
		paths.push(configPath);
	}
	if(config.autoRestart.serverUpdate){
		sh.info("Autorestart enabled on server updates");
		paths.push(serverCtx.basePath);
	}
	
	if(paths.length == 0){
		sh.info("Auto restart disabled");
		return;
	}
	
	var pathToPattern = function(p){
		p = utils.replaceAll(p, "\\\\", "\\\\");
		p = utils.replaceAll(p, "\\.", "\\.");
		p = utils.replaceAll(p, "\\$", "\\$");
		p = utils.replaceAll(p, "\\?", "\\?");
		return p + ".*";
	}
	var ignoredList = [config.dirs.pub, config.dirs.pubThemes];
	var ignored = null;
	for(var i=0;i<ignoredList.length;i++){
		var v = pathToPattern(ignoredList[i]);
		if(i > 0){
			ignored = ignored + "|" + "(" + v + ")";
		}else{
			ignored = "(" + v + ")";
		}
	}
	ignored = ignored ? new RegExp(ignored) : null;
	
	watcher = chokidar.watch(paths, {ignored: ignored, persistent: true});
	
	watcher
	.on("change", watchNotification.bind(null, "change"))
	.on("unlink", watchNotification.bind(null, "unlink"))
	.on("unlinkDir", watchNotification.bind(null, "unlinkDir"))
	.on("error", function(error){
		sh.error("File change notification error: " + error);
	});
}

function watchNotification(event, path, stats){

	if(event == "change" && stats.mtime.valueOf() < sh.serverCtx.startTime){
		return;
	}
	sh.info("Shelloid has detected the event: " + event + " in the path : " + 
			path + ". Initiating restart.");
	sh.serverCtx.isRestarting = true;
	watcher.close();

	var hasWorkers = false;
	for(var k in cluster.workers){
		var worker = cluster.workers[k];
		hasWorkers = true;
		worker.kill();
	}
	if(!hasWorkers){
		gracefulShutdown();
	}
}	
 
function gracefulShutdown(){
	sh.info("Graceful shutdown started");
	if(sh.serverCtx.server){
		sh.serverCtx.server.close(function() {
			sh.info("Closed remaining connections.");
			process.exit(0);
		});

		setTimeout(function() {
		   sh.error("Could not close pending connections - forcing shutdown.");
		   process.exit(0);
		}, sh.appCtx.config.shutdownWaitMillis);
	}
}


exports.gracefulShutdown = gracefulShutdown;