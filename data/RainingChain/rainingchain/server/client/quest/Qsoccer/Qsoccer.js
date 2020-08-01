//02/14/2015 4:10 PM
/*jslint node: true, undef:true, sub:true, asi:true, funcscope:true, forin:true, unused:false*//*global True, False, loadAPI*/
/*Go to http://jshint.com/ and copy paste your code to spot syntax errors.*/

'use strict';
var s = loadAPI('v1.0','Qsoccer',{
	name:"Soccer",
	author:"rc",
	thumbnail:true,
	description:"Play soccer against your friends! Push the ball in the goal to score. First to 5 points win.",
	maxParty:4
});
var m = s.map; var b = s.boss; var g;

/* COMMENT:
can right click players, annoying
*/

s.newVariable({
	team1Pt:0,
	team2Pt:0,
	team:1,
	deathCount:0
});

s.newHighscore('speedrun',"speedrun","Fastest Completion of the quest",'ascending',function(key){
	if(s.getPartySize(key) === 1)
		return s.stopChrono(key,'timer');
});

s.newChallenge('speedrun',"Speedrun","Complete the quest in less than 1:30 minute",2,function(key){
	return s.stopChrono(key,'timer') < 25 * 90;
});
s.newChallenge('wind',"Wind Disadvantage","The wind is against you!",2,function(key){
	return true;
});
s.newChallenge('deathless',"Deathless","You have 10 Hp. You can't die.",2,function(key){
	return s.get(key,'deathCount') === 0;
});

s.newEvent('_start',function(key){ //
	if(s.isAtSpot(key,'QfirstTown-south','n1',200))
		s.callEvent('talkJaimaysh',key);
	else s.addQuestMarker(key,'start','QfirstTown-south','n1');
});
s.newEvent('_signIn',function(key){ //
	s.failQuest(key);
});
s.newEvent('_signOff',function(key){ //
	s.failQuest(key);
});
s.newEvent('_abandon',function(key){ //
	s.teleport(key,'QfirstTown-south','n1','main',false);
});
s.newEvent('_complete',function(key){ //
	s.callEvent('_abandon',key);
});
s.newEvent('talkJaimaysh',function(key){ //
	s.startDialogue(key,'Jaimaysh','intro');
});
s.newEvent('spawnBall',function(key){ //
	s.spawnActor(key,'main','e1','bat',{
		name:"Ball",
		targetIf:'false',
		damageIf:'false',
		useUpdateInput:false,
		globalDef:100000000,
		hp:4,
		sprite:s.newNpc.sprite('pushable-rock1x1',1.5),
		statusResist:s.newNpc.statusResist(1,0,1,1,1,1),
		tag:{
			ball:true,
		}
	});
});
s.newEvent('startGame',function(key){ //
	var list = s.getParty(key);
	if(list[0]){
		s.set.one(list[0],'team',1);
		s.teleport.one(list[0],'main','t1','party');
		s.setRespawn.one(list[0],'main','t1','party');
	}
	if(list[1]){
		s.set.one(list[1],'team',2);
		s.teleport.one(list[1],'main','t2','party');
		s.setRespawn.one(list[1],'main','t2','party');
	}
	if(list[2]){
		s.set.one(list[2],'team',1);
		s.teleport.one(list[2],'main','t3','party');
		s.setRespawn.one(list[2],'main','t3','party');
	}
	if(list[3]){
		s.set.one(list[3],'team',2);
		s.teleport.one(list[3],'main','t4','party');
		s.setRespawn.one(list[3],'main','t4','party');
	}
	
	if(list.length === 1){
		for(var i = 0 ; i < 3; i++){
			s.spawnActor(key,'main','t2','defender',{
				damageIf:'true',
				damagedIf:'false',
				globalDef:100000000,
				hp:4,
			});
				
			s.spawnActor(key,'main','t4','defender',{
				damageIf:'true',
				damagedIf:'false',
				globalDef:100000000,
				hp:4,
			});
			
			s.spawnActor(key,'main','t3','skeleton',{
				damagedIf:'false',
				globalDef:100000000,
				hp:4,
			});
		}
	}
	
	s.callEvent('spawnBall',key);
	if(s.getPartySize(key) === 1)
		s.usePreset(key,'soccer');
	else
		s.usePreset(key,'soccerParty');
	s.addBoost(key,'maxSpd',2);
	s.startChrono(key,'timer');
	if(s.isChallengeActive(key,'deathless')){
		s.addBoost(key,'hp-max',0.01);
	}
});
s.newEvent('onGoal',function(key,team){ //
	if(team === 1){
		s.add(key,'team1Pt',1);
		if(s.get(key,'team1Pt') >= 5){
			if(s.getPartySize(key) === 1){
				s.failQuest(key);
				return true;
			} else {
				s.displayPopup(key,'Team 1 won!');
				s.setTimeout(key,function(){
					s.completeQuest(key);
				},25*3);
				return true;
			}
		}
	}
	if(team === 2){
		s.add(key,'team2Pt',1);
		if(s.get(key,'team2Pt') >= 5){
			if(s.getPartySize(key) === 1){
				s.completeQuest(key);
				return true;
			} else {
				s.displayPopup(key,'Team 2 won!');
				s.setTimeout(key,function(){
					s.completeQuest(key);
				},25*3);
				return true;
			}
		}
	}
});
s.newEvent('_hint',function(key){ //
	if(s.get(key,'team') === 1)
		return s.get(key,'team1Pt') + ' - ' + s.get(key,'team2Pt') 
			+ '<br>Push the ball to the LEFT side to score.' ;
	else
		return s.get(key,'team1Pt') + ' - ' + s.get(key,'team2Pt') 
			+ '<br>Push the ball to the RIGHT side to score.' ;
});
s.newEvent('_death',function(key){ //
	s.add(key,'deathCount',1);
});

s.newAbility('pushBall','attack',{
	name:"Tornado",
	icon:'blessing.cycle',
	periodOwn:10,
	periodGlobal:10,
	delay:0
},{
	type:'bullet',
	amount:1,
	dmg:s.newAbility.dmg(1,'range'),
	knock:s.newAbility.status(1,2,0.25),
	sprite:s.newAbility.sprite('tornado',1)
});
s.newAbility('closeBall','attack',{
	periodOwn:10,
	periodGlobal:10
},{
	type:'strike',
	amount:1,
	dmg:s.newAbility.dmg(1,'melee'),
	knock:s.newAbility.status(1,3,0.7),
	initPosition:s.newAbility.initPosition(0,50),
	preDelayAnim:s.newAbility.anim('slashMelee',1)
});
s.newAbility('pushBallNpc','attack',{
	name:"Tornado",
	icon:'blessing.cycle',
	periodOwn:35,
	periodGlobal:35,
	delay:0
},{
	type:'bullet',
	amount:8,
	angleRange:360,
	dmg:s.newAbility.dmg(1,'range'),
	knock:s.newAbility.status(1,2,0.25),
	sprite:s.newAbility.sprite('tornado',1)
});

s.newAbility('closeBallParty','attack',{
	periodOwn:10,
	periodGlobal:10
},{
	type:'strike',
	amount:1,
	dmg:s.newAbility.dmg(1,'melee'),
	knock:s.newAbility.status(1,6,0.7),
	initPosition:s.newAbility.initPosition(0,50),
	preDelayAnim:s.newAbility.anim('slashMelee',1)
});
s.newAbility('pushBallParty','attack',{
	name:"Tornado",
	icon:'blessing.cycle',
	periodOwn:10,
	periodGlobal:10,
	delay:0
},{
	type:'bullet',
	amount:1,
	dmg:s.newAbility.dmg(1,'range'),
	knock:s.newAbility.status(1,4,0.25),
	sprite:s.newAbility.sprite('tornado',1)
});



s.newPreset('soccer',s.newPreset.ability(['closeBall','pushBall','','','','']),null,False,False,False,False);
s.newPreset('soccerParty',s.newPreset.ability(['closeBallParty','pushBallParty','','','','']),null,False,False,False,False);

s.newDialogue('Jaimaysh','Jaimaysh','warrior-female.4',[ //{ 
	s.newDialogue.node('intro',"I'm petting a bunch of ghosts and they are bored all the time. Do you want to entertain them for me?",[ 
		s.newDialogue.option("Sure.",'intro2',''),
		s.newDialogue.option("What do ghosts like to do?",'intro2','')
	],''),
	s.newDialogue.node('intro2',"Their favorite activity is playing soccer. Use your abilities to push the ball in their zone. And beware of my Skeleton pets, they don't like strangers much. Good luck.",[ 
		s.newDialogue.option("Okay, I'm up for the task.",'','startGame')
	],'')
]); //}

s.newNpc('defender',{
	name:"Defender",
	sprite:s.newNpc.sprite('ghost',1),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability('pushBallNpc',[1,1,1])
	])
});

s.newMap('main',{
	name:"Soccer Field",
	lvl:0,
	grid:["000000000011110000000001100000000000000000011000000000000000","000110000011110000000011110000000000000000011000000000000000","001111000011110000000011110000000000000000011000000000111100","000001111111111111111111111111111111111111111111111111111100","000001111111111111111111111111111111111111111111111111111100","000011111111111111111111111111111111111111111111111111100000","000011111111111111111111111111111111111111111111111111100000","000011000000000000000000000000000000000000000000000001100000","011111000000000000000000000000000000000000000000000001111100","011111000000000000000000000000000000000000000000000001111100","000011000000000000000000000000000000000000000000000001100000","000011000000000000000000000000000000000000000000000001100000","000011000000000000000000000000000000000000000000000001100000","000011000000000000000000000000000000000000000000000001100000","000011000000000000000000000000000000000000000000000001100000","000011000000000000000000000000000000000000000000000001100000","000011000000000000000000000000000000000000000000000001111100","000011000000000000000000000000000000000000000000000001111100","000011000000000000000000000000000000000000000000000001100000","000011000000000000000000000000000000000000000000000001100000","111111000000000000000000000000000000000000000000000001100000","111111000000000000000000000000000000000000000000000001100000","111111000000000000000000000000000000000000000000000001100110","000011000000000000000000000000000000000000000000000001100110","000011000000000000000000000000000000000000000000000001100000","000001111111111111111111111111111111111111111111111111111000","000001111111111111111111111111111111111111111111111111111000","000011000011000011110000001100000000000001100000011001111000","000011000011000011110000000000000000000001100000011000000000","000000000000000011110000000000000000000000000000111100000000"],
	tileset:'v1.2'
},{
	spot:{b3:{x:192,y:224,width:1504,height:64},t2:{x:528,y:368},t1:{x:1392,y:368},b1:{x:192,y:416,width:160,height:160},b2:{x:1536,y:416,width:160,height:160},e1:{x:976,y:496},t4:{x:528,y:592},t3:{x:1392,y:592},b4:{x:192,y:736,width:1504,height:64}},
	load:function(spot){
		
	},
	loop:function(spot){
		m.forEachActor(spot,10,function(eid){
			s.moveActor(eid,0,16);
		},'npc',spot.b3,{ball:true});
		
		m.forEachActor(spot,10,function(eid){
			s.moveActor(eid,0,-16);
		},'npc',spot.b4,{ball:true});
		
		var stop = false;
		m.forEachActor(spot,10,function(eid){
			s.killActor(eid);
			
			var key = m.getRandomPlayer(spot);
			s.callEvent('spawnBall',key);
			stop = s.callEvent('onGoal',key,2);
		},'npc',spot.b1,{ball:true});
		
		if(stop) return;
		
		m.forEachActor(spot,10,function(eid){
			s.killActor(eid);
			
			var key = m.getRandomPlayer(spot);
			s.callEvent('spawnBall',key);
			stop = s.callEvent('onGoal',key,1);
		},'npc',spot.b2,{ball:true});
		
		m.forEachActor(spot,2,function(eid){
			var key = m.getRandomPlayer(spot);
			if(s.isChallengeActive(key,'wind'))
				s.moveActor(eid,6,0);
		},'npc',null,{ball:true});
	}
});
s.newMapAddon('QfirstTown-south',{
	spot:{n1:{x:48,y:2192}},
	load:function(spot){
		m.spawnActor(spot.n1,'npc',{
			dialogue:'talkJaimaysh',
			angle:s.newNpc.angle('right'),
			name:'Jaimaysh',
			nevermove:true,
			sprite:s.newNpc.sprite('warrior-female4',1),
		});
	}
});

s.exports(exports);
