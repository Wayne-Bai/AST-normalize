/*
 Copyright (c) Shelloid Systems LLP. All rights reserved.
 The use and distribution terms for this software are covered by the
 GNU Lesser General Public License 3.0 (https://www.gnu.org/licenses/lgpl.html)
 which can be found in the file LICENSE at the root of this distribution.
 By using this software in any fashion, you are agreeing to be bound by
 the terms of this license.
 You must not remove this notice, or any other, from this software.
 */

var app_pkg = lib_require("app_pkg"),
	utils = lib_require("utils");
var fs = require("fs");
var path = require("path");

exports.init = function(serverCtx, done){
	shelloid.db = lib_require("db");
	var databaseSupport = loadDBProxies(serverCtx);
	shelloid.serverCtx.databaseSupport = databaseSupport;
	var types = [];
	var databases = serverCtx.appCtx.config.databases;
	for(var k in  databases){
		if(!databases.hasOwnProperty(k)){
			continue;
		}
		var type = databases[k].type;
		if(!databases[k].ignore && !types.contains(type)){
			if(databaseSupport[type]){
				types.push(type);
			}else{
				shelloid.error("Does not support database type: " + type + " specified in the config");
				serverCtx.appCtx.hasErrors(true);
			}
		}
	}
	if(types.length == 0 || serverCtx.appCtx.hasErrors()){
		process.nextTick(done);
		return;
	}
	
	var dbModulesLoaded = function(){
		for(var k in  databases){
			if(!databases.hasOwnProperty(k) || databases[k].ignore){
				continue;
			}
			var config = databases[k];
			var support = databaseSupport[config.type];
			config.support = support;
			config.pool = support.modProxy.createPool(config);			
		}
		done();
	}
	var barrier = utils.countingBarrier(types.length, dbModulesLoaded);
	
	for(var i=0;i<types.length;i++){
		var support = databaseSupport[types[i]];
		(function(supportThis, supportType){
			supportThis.type = supportType;
			app_pkg.require(supportThis.modName, supportThis.modVersion,
				function(mod){
					supportThis.mod = mod;
					sh.info("Database module type " + supportType + " loaded.");
					barrier.countDown();
				}
			);		
		})(support, types[i]);
	}
}

function loadDBProxies(serverCtx){
	var supports = [];
	var dbPath = path.join(__dirname, "db");
	var files = fs.readdirSync(dbPath);
	for(var i=0;i<files.length;i++){
		if(files[i].endsWith("-proxy.js")){
			var modProxy = lib_require("db/" + files[i]);
			modProxy.support.modProxy = modProxy;//self reference.
			supports[modProxy.support.type] = modProxy.support;
		}
	}
	return supports;
}

