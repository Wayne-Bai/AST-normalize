var pid=process.argv[2];
var script=process.argv[3];

var killed=function(){
	var execFile=require('child_process').execFile;
	execFile(script);
	process.exit();
};

var checkPid=function(){
	var f=true;
	try{
		process.kill(pid,'SIGINT')
	}catch(e){
		f=false;
		killed();
	}
	if(f){
		setTimeout(checkPid,100);
	}
};

process.kill(pid,'SIGINT');
checkPid();