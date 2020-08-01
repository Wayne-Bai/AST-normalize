//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var Actor = require4('Actor'), Anim = require4('Anim'), ActiveList = require4('ActiveList'), Main = require4('Main'), Game = require4('Game'), Socket = require4('Socket'), Strike = require4('Strike'), Bullet = require4('Bullet'), Drop = require4('Drop'), Sfx = require4('Sfx');

var Receive = exports.Receive = {};


var SHOW_TIME = false;
var SHOWDATA_ACTIVE = false;
var SHOWDATA_LOG = false;
var START_TIME = 0;
var LAST_TIME = Date.now();
var SERVER_TIMESTAMP = Date.now();


Receive.getStartTime = function(){
	return START_TIME;
}	

Receive.useData = function(data,unfreeze){
	START_TIME = Date.now();
	if(BISON.active) data = BISON.decode(data);
	SERVER_TIMESTAMP = data.timestamp;
	
	Receive.showData(data);
	
	if(!Receive.freeze.onReceive(data)) 
		return Receive.loop();	//cuz still need to run game

	//Update player
	Actor.applyChange(player,data.p);
	
    //Init Anim
	for(var i in data.a) 
		Anim.create(data.a[i]);	
	
	//fix bug if in both list
	for(var i in data.i) 
		if(data.r && data.r[i]) 
			delete data.r[i];	//incase in both list
	
	//Init Full List aka never seen before
	for(var i in data.i) 
		Receive.initEntity(data.i[i],i);
	
	//Update Full List
	for(var i in data.u){	
		var act = ActiveList.get(i);
		if(!act){ ERROR(2,'no act',JSON.stringify(data.u),i); continue;}
		act.toRemove = 0;
		Actor.applyChange(act,data.u[i]); //its not always Actor but doesnt change much,...
	}
   
	for(var i in data.r){	//remove
		var act = ActiveList.get(i);
		if(act && act.sprite){ 
			act.sprite.dead = 1/data.r[i] || 1;	//ratio will impact alpha or fade out
			if(act.isActor)
				act.hp = 0;
		} else {
			ActiveList.removeAny(i);	//ex: strike
		}			
	}
    
	//Update Main List
	Main.applyChange(main,data.m);
	
	//Remove Inactive FullList
	ActiveList.removeInactive();
	
	if(unfreeze !== true) 
		Receive.loop();
	
}

Receive.loop = function(){
	if(!CST.ASYNC_LOOP){
		var delay = (Date.now()-LAST_TIME)/2;
		LAST_TIME = Date.now();
		delay = delay.mm(1,100).r(0);
		if(SHOWDATA_ACTIVE) INFO(delay);
		Game.loop();		//first
		setTimeout(Game.loop,delay);	//second mid way
	}
	if(SHOW_TIME) INFO(Date.now() - START_TIME);
}

Receive.init = function(){	//socket on
	Socket.on('change', function(data){
		try {
			Receive.useData(data);
		} catch (err){ ERROR.err(3,err) }
	});
}

Receive.showData = function(data){
	if(!SHOWDATA_ACTIVE) return;
	var txt = JSON.stringify(data); 
	if(SHOWDATA_LOG) Receive.log += txt;
	else INFO(txt);
}

Receive.getServerTimestamp = function(){
	return SERVER_TIMESTAMP;
}

Receive.initEntity = function(obj,id){
	if(obj[0] === 'b') return Receive.initEntity.bullet(obj,id);
	if(obj[0] === 's') return Receive.initEntity.strike(obj,id);	
	if(obj[0] === 'npc0' || obj[0] === 'npc' || obj[0] === 'player') return Receive.initEntity.actor(obj,id);
	if(obj[0] === 'drop')	return Receive.initEntity.drop(obj,id);
	return ERROR(3,'obj[0] doesnt have good type',obj);
}

Receive.initEntity.actor = function(obj,id){
	var act = Actor.undoInitPack(obj,id);
	Actor.addToList(act);
	ActiveList.addToList(act);
}

Receive.initEntity.strike = function(obj,id){
	var b = Strike.undoInitPack(obj,id);
	Strike.addToList(b);
	ActiveList.addToList(b);
}

Receive.initEntity.bullet = function(obj,id){
	var b = Bullet.undoInitPack(obj,id);
	Bullet.addToList(b);
	ActiveList.addToList(b);
}

Receive.initEntity.drop = function(obj,id){
	var b = Drop.undoInitPack(obj,id);
	if(b.color === 'yellow')
		Sfx.play('explosion');
	Drop.addToList(b);	
	ActiveList.addToList(b);
}

Receive.freeze = function(){
	Receive.freeze.ACTIVE = true;
	Main.screenEffect.add(main,Main.ScreenEffect.fadeout('mapTransition',25));
	setTimeout(function(){
		Receive.unfreeze();
	},500);
}
Receive.freeze.LIST = [];
Receive.unfreeze = function(){
	Receive.freeze.ACTIVE = false;
	for(var i in Receive.freeze.LIST)
		Receive.useData(Receive.freeze.LIST[i],true);
	Receive.freeze.LIST = [];	
}

Receive.freeze.onReceive = function(data){
	if(data.p && data.p.map && typeof data.p.map === 'string' && data.p.map !== player.map){
		setTimeout(function(){
			player.map = data.p.map;
		},250);
		
		Receive.freeze();
	}
	if(Receive.freeze.ACTIVE){
		Receive.freeze.LIST.push(data);
		return false;
	}
	return true;
}

})(); //{




