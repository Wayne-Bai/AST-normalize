global.rw.moduleList={};
global.rw.moduleReloadList={};

function buildErrorData(data){
	return (data.stack+'{LINE}URL: {URL}{LINE}').replace(/ |\n|{LINE}|{URL}/g,function(str){
		switch(str){
			case ' ':
				return '&nbsp;';
				break;
			case '\n':
				return '<br />';
				break;
			case '{URL}':
				return '<div id="jf"><script type="text/javascript">var json='+data.url+';jsonFormat(json);</script>';
				break;
			case '{LINE}':
				return '<div class="line"></div>';
				break;
			default:
				return str;
		}
	});
}

exports.throw=function(id,res,data){
	var tp=__dirname+'/../doc/http/boxpage.html';
	switch(id){
		case 0://HostNameReject
			res.writeHead(200,rw.config.http.header);
			res.end(
				rw.t.render(
					tp,{'TITLE':'Invalid Hostname','HL':'<center>Invalid Hostname</center>','CONTENT':'<center>'+rw.config.http.header.Server+'</center>'},'errorPage0'
				)
			);
			break;
		case 2://Upgrading
			res.writeHead(200,rw.config.http.header);
			res.end(
				rw.t.render(
					tp,{'TITLE':'Upgrading / 正在维护','HL':'<center>Upgrading / 正在维护</center>','CONTENT':'<center>'+rw.config.http.header.Server+'</center>'},'errorPage2'
				)
			);
			break;
		case 3://Empty
			res.writeHead(200,rw.config.http.header);
			res.end();
			break;
		case 302:
			//console.log(res);
			//res.writeHead(302,{'Location':data});
			res.writeHead(200,rw.config.http.header);
			res.end('<script type="text/javascript">location.href="'+data+'";</script>');//cookie fix
			break;
		case 304:
			res.writeHead(304,"Not Modified");
			res.end();
			break;
		case 403:
			if(rw.config.server[res.server].errorPage[403]){
				exports.throw(302,res,'http://'+res.host+'/'+rw.config.server[res.server].errorPage[403]);
				return;
			}
			res.writeHead(403,rw.config.http.header);
			res.end(
				rw.t.render(
					tp,{'TITLE':'403 - Access Denied.','HL':'<center>403 - Access Denied.</center>','CONTENT':'<center>'+rw.config.http.header.Server+'</center>'},'errorPage403'
				)
			);
			break;
		case 404:
			if(rw.config.server[res.server].errorPage[404]){
				exports.throw(302,res,'http://'+res.host+'/'+rw.config.server[res.server].errorPage[404]);
				return;
			}
			res.writeHead(404,rw.config.http.header);
			res.end(
				rw.t.render(
					tp,{'TITLE':'404 - File Not Found.','HL':'<center>404 - File Not Found.</center>','CONTENT':'<center>'+rw.config.http.header.Server+'</center>'},'errorPage404'
				)
			);
			break;
		case 405:
			res.writeHead(405,rw.config.http.header);
			res.end(
				rw.t.render(
					tp,{'TITLE':'405 - Method Not Allowed.','HL':'<center>405 - Method Not Allowed.</center>','CONTENT':'<center>'+rw.config.http.header.Server+'</center>'},'errorPage405'
				)
			);
			break;
		case 500:
			if(data && data.url){
				data.url=JSON.stringify(data.url);
				rw.log.write(data.server+': '+data.url+'\n'+data.stack,'error');
			}
			res.writeHead(500,rw.config.http.header);
			var tobj={'TITLE':'500 - Internal Server Error.','HL':'<center>500 - Internal Server Error.</center>','CONTENT':'<center>'+rw.config.http.header.Server+'</center>'};
			if(rw.config.http.debug && data){
				tobj.CONTENT=buildErrorData(data)+tobj.CONTENT;
			}
			res.end(rw.t.render(tp,tobj));
			break;
		default:
			res.writeHead(200,rw.config.http.header);
			res.end('Nyan~');
	}
	res=null;
	data=null;
};

exports.get=function(url,callback){
	var hre=rw.hs.get(url,function(re){
		clearTimeout(hret);
		if(re.statusCode==301 || re.statusCode==302){
			exports.get(re.headers.location,callback);
			hre.abort();
			return;
		}
		if(re.statusCode!=200){
			callback(false);
			hre.abort();
			return;
		};
		var chunks=[];
		var size=0;
		re.on("data",function(chunk){
			chunks.push(chunk);
			size+=chunk.length;
			if(size>=20971520){
				re.end();
				chunks=null;
				size=null;
			};
		});
		re.once("end",function(){
			re.removeAllListeners("data");
			var data=null;
			switch(chunks.length) {
				case 0:
					data=new Buffer(0);
					break;
				case 1:
					data=chunks[0];
					break;
				default:
					data=new Buffer(size);
					var i=0,pos=0,l=chunks.length;
					for(i,pos,l;i<l;i++){
						var chunk=chunks[i];
						chunk.copy(data,pos);
						pos+=chunk.length;
					}
					break;
			}
			var ac=re.headers['Content-Encoding']?re.headers['Content-Encoding']:re.headers['content-encoding'];
			if(!ac){ac='';}
			ac=ac.toLocaleLowerCase();
			if(ac.match('gzip')){
				rw.zlib.gunzip(data,function(e,d){
					if(e){callback(false);}else{callback(d);}
					ac=null;
					data=nulll;
				});
			}else if(ac.match('deflate')){
				rw.zlib.inflate(data,function(e,d){
					if(e){callback(false);}else{callback(d);}
					ac=null;
					data=nulll;
				});
			}else{
				callback(data);
				ac=null;
				data=null;
			}
		});
	}).on("error",function(){
		hre.abort();
		callback(false);
	});
	hret=setTimeout(function(){hre.abort();},120000);
};

exports.staticFileRequest=function(req,res){
	var filePath=rw.path.normalize(rw.config.server[req.server].staticPath+req.url.pathname);
	rw.fs.exists(filePath,function(exists){
		if(!exists){
			exports.throw(404,res);
			filePath=null;
			req=null;
			return;
		}
		rw.fs.stat(filePath,function(e,stat){
			if(e){
				exports.throw(404,res);
				filePath=null;
				req=null;
				return;
			}
			if(stat.isDirectory()){
				if(rw.config.server[req.server].indexFile && rw.config.server[req.server].indexFile.length>0){
					exports.throw(302,res,'./'+rw.config.server[req.server].indexFile);
					filePath=null;
					req=null;
					return;
				}else{
					exports.throw(403,res);
					filePath=null;
					req=null;
					return;
				}
			}
			var lastModified=stat.mtime.toUTCString();
			if(req.headers['if-modified-since'] && lastModified==req.headers['if-modified-since']){
				exports.throw(304,res);
				filePath=null;
				req=null;
				return;
			}
			var ext=rw.path.extname(filePath);
			if(!ext && !rw.config.http.allowEmptyExtname){
				exports.throw(403,res);
				filePath=null;
				req=null;
				return;
			}else{
				ext=ext?ext.slice(1):'html';
			}
			if(!rw.config.http.mime[ext]){
				if(!rw.config.http.allowFileDownload){
					exports.throw(403,res);
					filePath=null;
					req=null;
					return ;
				}else{
					ext='download';
				}
			}
			var exp=new Date();
			exp.setTime(exp.getTime()+rw.config.http.maxAge*1000);
			var header={
				'charset':rw.config.http.header.charset,
				'Server':rw.config.http.header.Server,
				'Last-Modified':lastModified,
				'Expires':exp.toUTCString(),
				'Cache-Control':'max-age='+rw.config.http.maxAge,
				'Content-Type':rw.config.http.mime[ext]+';charset='+rw.config.http.header.charset
			};
			if(ext=='download'){
				header['Content-Disposition']='attachment; filename='+rw.path.basename(filePath);
			}
			var rs=rw.fs.createReadStream(filePath);
			if(!req.headers['accept-encoding']){
				res.writeHead(200,header);
				rs.pipe(res);
				rs.once('end',function(){res=null;});
				filePath=null;
				req=null;
				return;
			}
			if(ext.match(new RegExp(rw.config.http.compress.join('|'),'ig'))){
				if(req.headers['accept-encoding'].match(/\bgzip\b/)){
					header['Content-Encoding']='gzip';
					res.writeHead(200,header);
					rs.pipe(rw.zlib.createGzip()).pipe(res);
					rs.once('end',function(){res=null;});
					req=null;
				}else if(req.headers['accept-encoding'].match(/\bdeflate\b/)){
					header['Content-Encoding']='deflate';
					res.writeHead(200,header);
					rs.pipe(rw.zlib.createDeflate()).pipe(res);
					rs.once('end',function(){res=null;});
					req=null;
				}else{
					res.writeHead(200,header);
					rs.pipe(res);
					rs.once('end',function(){res=null;});
					req=null;
				}
			}else{
				res.writeHead(200,header);
				rs.pipe(res);
				rs.once('end',function(){res=null;});
				req=null;
			}
		});
	});
};

global.rw.timeTag={
	s:0,
	c:0,
	t:0,
	m:{
		s:0,
		c:0,
		t:0,
	},
	h:{
		s:0,
		c:0,
		t:0
	},
	d:{
		s:0,
		c:0,
		t:0
	},
	list:[{url:'Log after 30s',module:'default',time:0}]
};
var timeTagSort=function(a,b){return b.time-a.time;}
exports.zout=function(data,req,res,h){
	if(rw.config.backstage.switch.timetag){
		req.timetag.push(process.hrtime());
		var ttms=(req.timetag[1][0]-req.timetag[0][0])*1000;
		ttms+=(req.timetag[1][1]-req.timetag[0][1])*0.000001;
		var d=new Date().getTime();
		if(!rw.timeTag.s){rw.timeTag.s=d;}
		if(!rw.timeTag.m.s){rw.timeTag.m.s=d;}
		if(!rw.timeTag.h.s){rw.timeTag.h.s=d;}
		if(!rw.timeTag.d.s){rw.timeTag.d.s=d;}
		rw.timeTag.c++;
		rw.timeTag.t+=ttms;
		if((d-rw.timeTag.m.s)>600000){
			rw.timeTag.m.s=d;
			rw.timeTag.m.c=0;
			rw.timeTag.m.t=0;
		}
		rw.timeTag.m.c++;
		rw.timeTag.m.t+=ttms;
		if((d-rw.timeTag.h.s)>3600000){
			rw.timeTag.h.s=d;
			rw.timeTag.h.c=0;
			rw.timeTag.h.t=0;
		}
		rw.timeTag.h.c++;
		rw.timeTag.h.t+=ttms;
		if((d-rw.timeTag.d.s)>86400000){
			rw.timeTag.d.s=d;
			rw.timeTag.d.c=0;
			rw.timeTag.d.t=0;
		}
		rw.timeTag.d.c++;
		rw.timeTag.d.t+=ttms;
		if(ttms>rw.timeTag.list[rw.timeTag.list.length-1].time && (d-rw.timeTag.s)>30000){
			rw.timeTag.list.push({url:'http://'+req.headers.host+req.ourl,module:req.server+'.'+req.module,time:ttms});
			rw.timeTag.list.sort(timeTagSort);
			var ttarr=[],nttarr=[],tti=0;
			for(tti;tti<rw.timeTag.list.length;tti++){
				if(ttarr.indexOf(rw.timeTag.list[tti].module)==-1){
					nttarr.push(rw.timeTag.list[tti]);
					ttarr.push(rw.timeTag.list[tti].module);
				}
			}
			rw.timeTag.list=nttarr.splice(0,10);
		}
		nttarr=null;
		ttarr=null;
		tti=null;
		d=null
		ttms=null;
	}
	if(!req.headers['accept-encoding']){
		res.writeHead(200,rw.config.http.header);
		res.end(data);
		res=null;
		req=null;
		data=null;
		return;
	}
	var header;
	if(h){
		header=h;
	}else{
		header={
			'charset':rw.config.http.header.charset,
			'Server':rw.config.http.header.Server,
			'Content-Type':'text/html;charset=utf-8'
		};
	}
	if(req.headers['accept-encoding'].match(/\bgzip\b/)){
		header['Content-Encoding']='gzip';
		res.writeHead(200,header);
		rw.zlib.gzip(data,function(e,d){
			if(e){d=data;}
			res.end(d);
			header=null;
			data=null;
			ac=null;
			res=null;
			req=null;
		});
	}else if(req.headers['accept-encoding'].match(/\bdeflate\b/)){
		header['Content-Encoding']='deflate';
		res.writeHead(200,header);
		rw.zlib.deflate(data,function(e,d){
			if(e){d=data;}
			res.end(d);
			header=null;
			data=null;
			ac=null;
			res=null;
			req=null;
		});
	}else{
		res.writeHead(200,header);
		res.end(data);
		res=null;
		req=null;
		data=null;
	}
};

exports.receivePostData=function(req,res,callback){
	var chunks=[];
	var size=0;
	req.on("data",function(chunk){
		chunks.push(chunk);
		size+=chunk.length;
		if(size>=rw.config.http.maxPostSize){
			exports.throw(405,res);
			chunks=null;
			size=null;
			req=null;
			res=null;
			callback=null;
			return;
		};
	});
	req.once("end",function(){
		req.removeAllListeners("data");
		var data=null;
		switch(chunks.length) {
			case 0:
				data=new Buffer(0);
				break;
			case 1:
				data=chunks[0];
				break;
			default:
				data=new Buffer(size);
				var i=0,pos=0,l=chunks.length;
				for(i,pos,l;i<l;i++){
					var chunk=chunks[i];
					chunk.copy(data,pos);
					pos+=chunk.length;
				}
				break;
		}
		try{
			req.post=JSON.parse(data.toString());
		}catch(e){
			try{
				req.post=rw.querystring.parse(data.toString());
			}catch(e){
				exports.throw(500,res,{server:req.server,url:req.url,stack:e.stack});
			}
		}
		try{
			if(rw.config.http.printPostData){
				console.log(req.post);
			}
			callback(req,res);
		}catch(e){
			exports.throw(500,res,{server:req.server,url:req.url,stack:e.stack});
		}
		chunks=null;
		size=null;
		req=null;
		res=null;
		callback=null;
		data=null;
	});
};

exports.runModule=function(req,res){
	if(rw.config.backstage.switch.timetag){
		req.timetag=[process.hrtime()];
	}
	var m=req.server+'.'+req.module;
	if(!rw.moduleList[m]){
		try{
			var mp=rw.path.normalize(rw.config.server[req.server].root+req.module+'.js');
			if(mp[0]=='.'){mp=rw.path.normalize(__dirname+'/'+mp);}
			buildModuleReloadObject(m,mp);
			rw.moduleReloadList[m].d();
		}catch(e){
			exports.throw(500,res,{server:req.server,url:req.url,stack:e.stack});
			if(rw.initList[req.server].onError){
				rw.initList[req.server].onError(e);
			}
			res=null;
			req=null;
			return;
		}
	}
	try{
		rw.moduleList[m].run(req,res);
	}catch(e){
		exports.throw(500,res,{server:req.server,url:req.url,stack:e.stack});
		if(rw.initList[req.server].onError){
			rw.initList[req.server].onError(e);
		}
		res=null;
		req=null;
	}
};

function buildModuleReloadObject(m,mp){
	rw.moduleReloadList[m]={};
	rw.moduleReloadList[m].r=function(){
		delete require.cache[mp];
		rw.moduleList[m]=require(mp);
		rw.log.write('Module File Updated ['+m+'] => ['+mp+'].','system');
		//mp=null;
		//m=null;
	};
	rw.moduleReloadList[m].d=function(e){
		if(rw.moduleReloadList[m].w){rw.moduleReloadList[m].w.close();}
		rw.moduleReloadList[m].w=rw.fs.watch(mp,{persistent:false},rw.moduleReloadList[m].d);
		if(e=='change'){
			if(rw.moduleReloadList[m].s){clearTimeout(rw.moduleReloadList[m].s);}
			rw.moduleReloadList[m].s=setTimeout(rw.moduleReloadList[m].r,rw.config.reloadInt);
		}else if(!e){
			rw.moduleList[m]=require(mp);
		}
		//mp=null;
		//m=null;
	};
}