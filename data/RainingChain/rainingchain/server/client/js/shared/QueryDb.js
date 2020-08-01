//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var Quest = require2('Quest'), Equip = require2('Equip'), Main = require2('Main'), Ability = require2('Ability'), Highscore = require2('Highscore'), ItemModel = require2('ItemModel');
var Socket = require4('Socket');

var QueryDb = exports.QueryDb = {};
QueryDb.create = function(db,id){
	return {
		db:db,
		id:id,
	}
}

var QueryResponse = function(db,id,value){
	return {
		db:db,
		id:id,
		value:value,
	}
}



//The client can make a query to the server database.
//used when the client wants to draw something but doesnt have info about it
QueryDb.respond = function(key,query,cb){
	if(query.db === 'highscore'){ //async
		return QueryDb.respond.highscore(key,query,cb);
	}	
	if(query.db === 'equip'){
		var el = Equip.get(query.id);
		if(!el) return;
		var value = Equip.compressClient(Tk.deepClone(el));
		return cb(QueryResponse(query.db,query.id,value));
	}
	if(query.db === 'ability'){
		var el = Ability.get(query.id);
		if(!el) return;
		var value = Ability.compressClient(Tk.deepClone(el));
		return cb(QueryResponse(query.db,query.id,value));
	}
	if(query.db === 'quest'){
		var el = Quest.get(query.id);
		if(!el) return;
		var value = Quest.compressClient(Tk.deepClone(el),true);
		return cb(QueryResponse(query.db,query.id,value));
	}
	if(query.db === 'item'){
		var el = ItemModel.get(query.id,true);
		if(!el) return;
		var value = ItemModel.compressClient(Tk.deepClone(el),true);
		return cb(QueryResponse(query.db,query.id,value));
	}
	//invalid query
	
}
	
QueryDb.respond.highscore = function(key,query,cb){
	var highscore = Highscore.get(query.id);
	if(!highscore) return;
	var main = Main.get(key);
	if(!main.quest[highscore.quest]) return ERROR(3,'main doesnt have highscore',query.id);
	
	Highscore.fetchTop15AndUser(query.id,main.username,function(res){
		cb(QueryResponse(query.db,query.id,Highscore.compressClient(highscore,res)));
	});
};

//##############################################

//QueryDb.get('item','Qsystem-DEV_TOOL')
if(SERVER) return;
var DB = QueryDb.DB = {};

var QueryDbModel = function(db,alreadyThere,get,set){
	DB[db] = {
		db:db,
		data:{},
		callback:{},
		alreadyThere:alreadyThere || function(id){
			return !!DB[db].data[id];
		},
		get:get || function(id){
			return DB[db].data[id];
		},
		set:set || function(id,value){
			DB[db].data[id] = value
		},
	}	
}

QueryDbModel('equip');
QueryDbModel('ability');
QueryDbModel('item',null,null,function(id,value){
	DB.item.data[id] = ItemModel.uncompressClient(value);
});
QueryDbModel('quest',function(id){
	return !!DB.quest.data[id] && !DB.quest.data[id].isPartialVersion;
},null,function(id,value){
	DB.quest.data[id] = QueryDb.uncompressQuest(value); 
});
QueryDbModel('highscore',function(id){
	return !!DB.highscore.data[id] && !DB.highscore.data[id].isPartialVersion;
},function(id){
	if(Date.now() - DB.highscore.data[id].timestamp > CST.MIN)	//refresh highscore if too old
		QueryDb.get('highscore',id,null,true);	//request refresh
	return DB.highscore.data[id];
},function(id,value){
	DB.highscore.data[id] = QueryDb.uncompressHighscore(value); 
});

//##################

QueryDb.get = function(db,id,cb,forceUpdate){	//update forces the query
	if(!id || !db) return;
	var model = DB[db];
	
	var alreadyThere = model.alreadyThere(id);
		
	if(!forceUpdate && alreadyThere){
		return model.get(id);
	}
	
	if(forceUpdate || (!alreadyThere && !model.callback[id])){
		model.callback[id] = cb || true;
		Socket.emit('queryDb', QueryDb.create(db,id));
	}
}

QueryDb.getQuestName = function(id){
	if(!DB.quest.data[id]) return ERROR(3,'no quest with that id',id);
	return DB.quest.data[id].name || '';
}
QueryDb.getQuestShowInTab = function(id){
	if(id === 'Qtutorial') return false;	//BAD hardcoded
	return DB.quest.data[id].showInTab || false;
}
QueryDb.getPartialQuest = function(id){
	return DB.quest.data[id];
}
QueryDb.getHighscoreForQuest = function(id){
	var list = {};
	for(var i in DB.highscore.data)
		if(i.$contains(id)) list[i] = 1;
	return list;
}
QueryDb.getHighscoreQuestList = function(){
	var list = {};
	for(var i in DB.highscore.data)
		list[DB.highscore.data[i].quest] = 1;
	return list;
}

QueryDb.getHighscoreName = function(id){
	return DB.highscore.data[id].name || '';
}
QueryDb.getHighscoreDescription = function(id){
	return DB.highscore.data[id].description || '';
}
QueryDb.useSignInPack = function(quest,highscore,item,equip){
	for(var i in quest)
		DB.quest.data[i] = QueryDb.uncompressQuest(quest[i]);
	for(var i in highscore)
		DB.highscore.data[i] = QueryDb.uncompressHighscore(highscore[i]);
	for(var i in item)
		DB.item.data[i] = ItemModel.uncompressClient(item[i]);
	for(var i in equip)
		DB.equip.data[i] = equip[i];
}


QueryDb.uncompressQuest = function(quest){
	return {
		id:quest[0],
		name:quest[1],
		icon:quest[2],
		reward:quest[3],
		description:quest[4],
		thumbnail:quest[5],
		variable:quest[6],
		author:quest[7],
		challenge:quest[8],
		highscore:quest[9],
		lvl:quest[10],
		difficulty:quest[11],
		rating:quest[12],
		statistic:quest[13],
		playerComment:quest[14],
		showInTab:quest[15],
		isPartialVersion:quest[16],
		category:quest[17],
	};
}
QueryDb.uncompressHighscore = function(highscore){
	return {
		name:highscore[0],
		description:highscore[1],
		quest:highscore[2],
		id:highscore[3],
		score:highscore[4],
		isPartialVersion:highscore[5],
		timestamp:highscore[6],
	}
}




//##########

QueryDb.init = function(){
	Socket.on('queryDb', function (d) {
		var model = DB[d.db];
		model.set(d.id,d.value);
		if(typeof model.callback[d.id] === 'function')
			model.callback[d.id](d.value);
	});
}
	
})(); //{








