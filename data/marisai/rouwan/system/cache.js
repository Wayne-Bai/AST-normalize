global.rw.cacheData={};

exports.put=function(id,data,expire,save){
	var create=new Date().getTime(),destory;
	if(typeof(save)!='undefined'){save=true;}
	if(!expire){expire=0;}
	if(expire==0){
		destory=0;
	}else{
		destory=create+expire;
	}
	rw.cacheData[id]={
		id:id,
		create:create,
		destory:destory,
		expire:expire,
		expired:false,
		save:save,
		data:data
	};
};

exports.get=function(id){
	if(rw.cacheData[id] && !rw.cacheData[id].expired && (new Date().getTime()>rw.cacheData[id].destory) && rw.cacheData[id].expire!=0){
		rw.cacheData[id].expired=true;
	}
	return rw.cacheData[id];
};

exports.delete=function(id){
	rw.cacheData[id]=null;
	return delete rw.cacheData[id];
};

exports.expire=function(id){
	if(rw.cacheData[id]){
		rw.cacheData[id].expired=true;
	}
};