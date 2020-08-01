/*
 Copyright (c) Shelloid Systems LLP. All rights reserved.
 The use and distribution terms for this software are covered by the
 GNU Lesser General Public License 3.0 (https://www.gnu.org/licenses/lgpl.html)
 which can be found in the file LICENSE at the root of this distribution.
 By using this software in any fashion, you are agreeing to be bound by
 the terms of this license.
 You must not remove this notice, or any other, from this software.
 */
var domain = require('domain');
var os = require("os");

module.exports = function(){
	return extInfo;
} 

var extInfo = 
{
	hooks:[{type: "init", name: "ccs-server", handler: serverInit, 
	priority: sh.hookPriorities.late}, 
	{type: "shutdown", name: "ccs-server-shutdown", 
	handler: serverShutdown}]		
};

function serverInit(done){
	if(!sh.appCtx.config.ccs.enable){
		done();
		return;
	}
	
	var d = require('domain').create();
	d.add(sh);
	d.on('error', function(er) {
		sh.error("Couldn't start CCS server: " + JSON.stringify(er.stack));
		process.exit(0);
	});

	d.run(createServer);

	done();
}

var ccsProc;
var isShuttingDown;

function createServer(){
	var configPath = sh.appCtx.config.ccs.configPath;
	var ccsAppPath = sh.appCtx.config.dirs.ccsApp;
	var spawn = require('child_process').spawn;
	var osType = os.type().toLowerCase();
	
	try{
		if(osType.indexOf("win") >= 0){
			ccsProc  = spawn('cmd.exe', ['/c', 'lein', 'run', configPath], 
							{cwd: ccsAppPath}
						);
		}else{
			ccsProc = spawn('lein', ['run', configPath], 
							{cwd: ccsAppPath}
						);
		}
	}catch(err){
		sh.error("Cannot execute CCS App: " + err);
		setTimeout(5000, function(){//to prevent rapid respawning by monitor
			process.exit(0);
		});
	}

	ccsProc.stdout.on('data', function (data) {
	  console.log('CCS: ' + data);
	});

	ccsProc.stderr.on('data', function (data) {
	  console.log('CCS err: ' + data);
	});

	ccsProc.on('close', function (code) {
		ccsProc = null;
		if(!isShuttingDown){
		  sh.error('CCS Server process exited with code ' + code + " Restarting");
		  setTimeout(createServer, 2000);
		}
	});
}

function serverShutdown(done){
	isShuttingDown = true;
	if(ccsProc){
		ccsProc.kill('SIGTERM');
	}
	done();
}