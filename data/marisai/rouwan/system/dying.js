exports.dying=function(sig){
	rw.log.write('Dying SIG ['+sig+'].','system',true);
	if(rw.config.dying.session.save && rw.sessionLoaded){
		rw.log.write('Saving Session...','system',true);
		try{
			rw.fs.writeFileSync(rw.config.dying.session.path+'session.json',JSON.stringify(rw.session));
		}catch(xe){
			rw.log.write('[Dying Fail] Session Save Failed.','error',true);
		}
		rw.log.write('Session Saved ['+rw.config.dying.session.path+'].','system',true);
	}
	if(rw.config.dying.cache.save && rw.cacheData){
		rw.log.write('Saving Cache...','system',true);
		var i,cache={};
		for(i in rw.cacheData){
			if(rw.cacheData[i].save){
				cache[i]=rw.cacheData[i];
			}
		}
		try{
			rw.fs.writeFileSync(rw.config.dying.cache.path+'cache.json',JSON.stringify(rw.cacheData));
		}catch(xe){
			rw.log.write('[Dying Fail] Cache Save Failed.','error',true);
		}
		rw.log.write('Cache Saved ['+rw.config.dying.cache.path+'].','system',true);
	}
	rw.log.write(' - Last Tick - ','system',true);
	process.exit();
};