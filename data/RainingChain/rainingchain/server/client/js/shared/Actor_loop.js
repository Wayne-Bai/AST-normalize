//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var Boss = require2('Boss'), Main = require2('Main'), ActiveList = require2('ActiveList'), Collision = require2('Collision'), Sprite = require2('Sprite');
var MapModel = require4('MapModel'), ClientPrediction = require4('ClientPrediction');
var Actor = require3('Actor');

Actor.loop = function(){	//server, for client check below
	Actor.loop.FRAME_COUNT++;
	for (var i in Actor.LIST)   
	    Actor.loop.forEach(Actor.LIST[i]);
	if(Actor.loop.FRAME_COUNT % 2 === 0)
		Actor.setChangeAll();
}

Actor.loop.forEach = function(act){
	if(Actor.testInterval(act,5)) Actor.updateActive(act);
	
	if(!act.active) return;
	act.frame++;
	
	if(act.dead) return Actor.death.loop(act);	
	
	Actor.timeout.loop(act);
	
	
	if(act.awareNpc){
		if(Actor.testInterval(act,25)) Actor.activeList.update(act);
		if(Actor.testInterval(act,10)) Actor.mapMod.update(act);
	}
	 
		
	
	if(act.combat){
		if(act.hp <= 0) 
			return Actor.death.die(act);
		if(act.boss) Boss.loop(act.boss);
		Actor.ability.loop(act);
		Actor.resource.loop(act);    
		Actor.status.loop(act);
		act.staggerTimer--;
		Actor.summon.loop(act);
		Actor.attackReceived.loop(act); 	//used to remove attackReceived if too long
	}
	if(act.combat || act.type === 'player'){	//cuz in town no combat...
		Actor.boost.loop(act);
	}
	
	if(act.combat || act.move)
		Actor.ai.update(act);
	
	if(act.move)
		Actor.move(act);  	//include pushable
}
Actor.loop.FRAME_COUNT = 0;


Actor.activeList = {};
Actor.activeList.update = function(act){
	ActiveList.update(act);
}
Actor.updateActive = function(act){
	act.active = act.alwaysActive || !act.activeList.$isEmpty();	//need to be false for Send ?
}



Actor.timeout = {};
Actor.timeout.loop = function(act){
	//if(!Actor.testInterval(act,1)) return;
	for(var i in act.timeout){
		act.timeout[i].timer -= 1;
		if(act.timeout[i].timer < 0){
			Actor.timeout.loop.main(act,i);	
			delete act.timeout[i];	
		}	
	}
}
Actor.timeout.loop.main = function(act,i){
	try {
		act.timeout[i].func(act.id);
	}catch(err){ 
		ERROR.err(3,err); 
	}
}

Actor.setTimeout = function(act,cb,time,name){
	if(typeof cb !== 'function') return ERROR(3,'no a function',cb);
	if(time <= 0)
		return cb(act.id);

	name = name || Math.randomId();
	act.timeout[name] = Actor.Timeout(time,cb);
}
Actor.Timeout = function(time,func){
	return {timer:time,func:func};
}	

Actor.timeout.remove = function(act,name){
	delete act.timeout[name];
}	



Actor.summon = {};	//Combat.summon should be in more relation with that	Actor.summon.addChild
Actor.summon.loop = function(act){
	var INTERVAL_SUMMON = 5;
    if(!Actor.testInterval(act,INTERVAL_SUMMON)) return;
	
	//(assume act is child)
    if(act.summoned){
		var fat = Actor.get(act.summoned.parent);
		if(!fat || fat.dead) return Actor.death.die(act);	//remove if parent dead
	    
	    //if too far, teleport near master
		if(Collision.getDistancePtPt(act,fat) >= act.summoned.distance){
			act.x = fat.x + Math.randomML()*5;
			act.y = fat.y + Math.randomML()*5;
			Actor.ai.resetSub(act);
			//act.map = fat.map;	//BADDDDDD
			//act.map !== fat.map || 
		}	
		if(act.map !== fat.map){
			Actor.death.die(act);
		}
		
		act.summoned.time -= INTERVAL_SUMMON;
		if(act.summoned.time < 0){
			Actor.remove(act);
		}
	}
}

Actor.summon.removeFromParentList = function(act){	
	var parent = Actor.get(act.summoned.parent);
	if(parent && parent.summon[act.summoned.name]) 
		delete parent.summon[act.summoned.name].child[act.id];
}

Actor.attackReceived = {};
Actor.attackReceived.loop = function(act){
	if(!Actor.testInterval(act,25)) return;
	for(var i in act.attackReceived){
		act.attackReceived[i] -= 25;		//per second. doesnt depend on dmg, set at 500 on hit
		if(act.attackReceived[i] <= 0){
			delete act.attackReceived[i];
		}
	}
}



Actor.freeze = function(act,time,cb){
	act.move = 0;
	var oldcombat = act.combat;
	if(oldcombat) act.combat = 0;
	
	time = time || CST.MIN*10;	
	Actor.setTimeout(act,function(key){
		Actor.get(key).move = 1;
		if(oldcombat) Actor.get(key).combat = 1;
		if(cb) cb(key);
	},time,'freeze');
}

Actor.freeze.remove = function(act){
	if(act.timeout.freeze)
		act.timeout.freeze.timer = -1;
	act.move = 1;
}


Actor.testInterval = function(act,num){
	return act.frame % num === 0;
}
Actor.testInterval.get = function(){	//required cuz goal of testing xya every 2 frames is to not send package every frame...
	return Actor.loop.FRAME_COUNT;
}




if(!SERVER){ //}
	Actor.loop = function(){
		for(var i in Actor.LIST){
			Actor.loop.forEach(Actor.LIST[i]);
		}
		Actor.loop.player();
	}
	Actor.loop.forEach = function(act){
		Actor.loop.updatePosition(act);

		Actor.HitHistoryToDraw.loop(act);
		Sprite.updateAnim(act);
		
		if(act.spriteFilter && --act.spriteFilter.time < 0)
			act.spriteFilter = null;
		
		
		if(act.chatHead){
			act.chatHead.timer = Math.min(act.chatHead.timer,Main.getPref(main,'chatHeadTimer')*25);
			if(--act.chatHead.timer <= 0)	
				act.chatHead = null;	
		}
	}
	
	Actor.loop.player = function(){
		Actor.move.client(player);
		Actor.loop.forEach(player);		
		if(Actor.loop.player.OLD.permBoost !== player.permBoost){
			Actor.loop.player.OLD.permBoost = player.permBoost;
			Actor.permBoost.update(player);	
		}
		
		if(!MapModel.getCurrent().imageLoaded)
			MapModel.initImage(MapModel.getCurrent());
		
		if(Actor.loop.player.OLD.statusClient !== player.statusClient){
			if(player.statusClient[0] == '1' || player.statusClient[3] == '1')	//bleed burn
				player.spriteFilter = Actor.SpriteFilter('red',10000);
			else if(player.statusClient[1] == '1' || player.statusClient[4] == '1')	//knock chill
				player.spriteFilter = Actor.SpriteFilter('blue',10000);
			else if(player.statusClient[2] == '1' || player.statusClient[5] == '1')	//drain stun
				player.spriteFilter = Actor.SpriteFilter('green',10000);
			else 
				player.spriteFilter = null;
		}
		
		
	}
	Actor.loop.player.OLD = {};
	
	Actor.loop.updatePosition = function(act){	//for npc
		if(ClientPrediction.isActive() && act === player) 
			return ClientPrediction.updateShadow(act);
		
		var diffX = act.serverX - act.x;
		var diffY = act.serverY - act.y;
				
		if(CST.ASYNC_LOOP){
			act.x = (act.serverX + act.x)/2;
			act.y = (act.serverY + act.y)/2;
		} else {
			act.x = act.x + diffX/2;
			act.y = act.y + diffY/2;
		}
		act.spdX = diffX;
		act.spdY = diffY;
	}	

	
	
	

	
	
	
	

}
})(); //{

