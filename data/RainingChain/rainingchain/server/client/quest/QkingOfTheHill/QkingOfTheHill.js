//02/09/2015 12:30 AM
/*jslint node: true, undef:true, sub:true, asi:true, funcscope:true, forin:true, unused:false*//*global True, False, loadAPI*/
/*Go to http://jshint.com/ and copy paste your code to spot syntax errors.*/

'use strict';
var s = loadAPI('v1.0','QkingOfTheHill',{
	name:"King of the Hill",
	author:"rc",
	thumbnail:true,
	description:"Stay on the hill as long as possible while killing rivals.",
	maxParty:2
});
var m = s.map; var b = s.boss; var g;

/* COMMENT:

*/

s.newVariable({
	pt:0,
	killCount:0,
	gameOver:false,
});

s.newHighscore('leastKill',"Least Kills","Least Kills",'ascending',function(key){
	if(s.getPartySize(key) === 1)
		return s.get(key,'killCount');
});

s.newChallenge('fullTime',"Full Time","Never leave the hill for 90 seconds.",2,function(key){
	return true;
});
s.newChallenge('flowerPower',"Flower Power","You can only kill monsters while under the influence of flowers.",2,function(key){
	return true;
});
s.newChallenge('neverAlone',"Never Alone","A monster needs to be on the hill in order to get points.",2,function(key){
	return true;
});

s.newEvent('talkWushin',function(key){ //
	s.startDialogue(key,'Wushin','intro');
});
s.newEvent('startGame',function(key){ //
	s.teleport(key,'main','t1','party');
	if(s.getPartySize(key) === 1){
		var time = s.isChallengeActive(key,'fullTime') ? 90 : 60;
		s.displayPopup(key,'Stay on the hill for ' + time + ' out of 90 seconds.');
		s.setTimeout(key,function(){
			s.failQuest(key);
		},25*90);
	} else {
		s.enablePvp(key,true);
		s.displayPopup(key,'First to stay on the hill for 60 seconds win.');		
	}
	
	s.startChrono(key,'timer');
	if(s.isChallengeActive(key,'flowerPower')){
		s.addBoost(key,'globalDmg',1/100);
	}
});
s.newEvent('givePt',function(key){ //
	if(s.get(key,'gameOver')) return;
	s.add.one(key,'pt',1);
	
	var ptToGet = s.isChallengeActive(key,'fullTime') ? 89 : 60;
	if(s.get.one(key,'pt') >= ptToGet){
		if(s.getPartySize(key) !== 1){
			s.set(key,'gameOver',true)
			s.displayPopup(key,'Player ' + s.getAttr(key,'name') + ' won!');
			s.setTimeout(key,function(){
				s.completeQuest(key);
			},25*3);
		} else
			s.completeQuest(key);
		return true;
	}
});
s.newEvent('lootFlower',function(key,eid){ //
	if(s.getDistance(key,eid) > 200)
		return s.message.one(key,'You\'re too far to pick the flower.');
	
	if(s.getTag(eid).harvested !== true){
		var boost = s.isChallengeActive(key,'flowerPower') ? 200 : 2;
		s.addBoost.one(key,'globalDmg',boost,25*10,'flower');
		
		s.message.one(key,'The flower increases your damage by x2 for 10 seconds.');
		s.setSprite.one(key,'normal',1.5);
		s.healActor(key);
		s.setTimeout(key,function(){
			s.setSprite.one(key,'normal',1);
		},25*10);
		
		s.setTag(eid,'harvested',true);
		s.killActor(eid); //probably wont work
	}
});
s.newEvent('_death',function(key){ //
	var respawn = ['t2','t3','t4','t5'];
	s.setRespawn.one(key,'main',respawn.$random(),'party');
});
s.newEvent('_hint',function(key){ //
	return 'You have been on the hill for ' + s.get.one(key,'pt') + ' seconds.';
});
s.newEvent('_start',function(key){ //
	if(s.isAtSpot(key,'QfirstTown-south','n1',200))
		s.callEvent('talkWushin',key);
	else s.addQuestMarker(key,'start','QfirstTown-south','n1');
});
s.newEvent('_signIn',function(key,eid){ //
	s.failQuest(key);
});
s.newEvent('_signOff',function(key){ //
	s.failQuest(key);
});
s.newEvent('_abandon',function(key){ //
	s.teleport(key,'QfirstTown-south','n1','main');
	s.setRespawn(key,'QfirstTown-south','n1','main');
});
s.newEvent('_complete',function(key){ //
	s.callEvent('_abandon',key);
});
s.newEvent('killEnemy',function(key){ //
	s.add(key,'killCount',1);
});

s.newDialogue('Wushin','Wushin','fairy.7',[ //{ 
	s.newDialogue.node('intro',"OMG! It's impossible, I can't seem to stay on the hill for long enough...",[ 
		s.newDialogue.option("What's the matter?",'matter',''),
		s.newDialogue.option("HAHA, you suck.",'suck','')
	],''),
	s.newDialogue.node('suck',"Oh really? If it's so easy then show it to me!<br>Stay on the hill for at least 60 seconds out of 90 seconds.",[ 
		s.newDialogue.option("Easy Peasy",'','startGame')
	],''),
	s.newDialogue.node('matter',"I'm trying to stay on the hill for at least 60 out of 90 seconds. But I die too often... Do you think you can do it?",[ 
		s.newDialogue.option("Yes. Yes I can.",'','startGame')
	],'')
]); //}

s.newMap('main',{
	name:"The Hill",
	lvl:0,
	grid:["11111111111111111111111111111111111111111111111111","11111111111111111111111111111111111111111111111111","11111111111111111111111111111111111111111111111111","11111111111111111111111111111111111111111111111111","11111111111111111111111111111111111111111111111111","11111111111111111111111111111111111111111111111111","11111111111111111111111111111111111111111111111111","11111111111111111100000000000000001111111111111111","11111111111111111100000000000000001111111111111111","00110000000000000000000000000000000000000000000110","00110000000000000000000000000000000000000000000110","01111000000000000000000000000000000000000000000110","00000000000000000000000000000000000000000000000000","00000000000000000000000000000000000000000000000000","20000000011000000001100000000001100000110000000000","22000000011000000011100000000001110000110000000000","22200000000000000111100000000001111000000000000002","22200000000000000100000000000000001000000000000022","22200000000000000000000000000000000000000000000222","22200000000000000000000000000000000000000000000222","22200000000000000000000000000000000000000000000222","22200000000000000000000000000000000000000000000222","22200000000000000000000000000000000000000000000222","22200000000000000000000000000000000000000000000222","22200000000000000000000000000000000000000000000222","22200000000000000000000000000000000000000000000222","22220000000000000001100000000001100000000000000222","22220000000000000111100000000001111000000000002222","22220000000000000111100000000001111000000000002222","22220000000000000011110000000011110000000000022222","22220001100000000001110000000011100000000000022222","22220001100000000000110000000011000000000000022222","22220000000000000000010000000010000000000000022222","22220000000000000000000000000000000000000000022222","22220000000000000000000000000000000000000000022222","22220000000000000000000000000000000000000000022222","22220000000000000000000000000000000000000000022222","22222000000000000000000000000000000000000000022222","22222200000000000000000000000000000000000000022222","22222200011000000000000000000000000000000000022222","22222220011000000000000000000000000000001100022222","22222220000000000000000000000000000000001100022222","22222222000000000000000000000000000000000000222222","22222222200000000000000000000000000000000002222222","22222222222222200000000000000000000000000022222222","22222222222222222000000000000000000000222222222222","22222222222222222222222222222222222222222222222222","22222222222222222222222222222222222222222222222222","22222222222222222222222222222222222222222222222222","22222222222222222222222222222222222222222222222222"],
	tileset:'v1.2'
},{
	spot:{q2:{x:976,y:336},e1:{x:848,y:368},t4:{x:464,y:432},t5:{x:1360,y:496},b1:{x:608,y:544,width:448,height:384},q3:{x:368,y:656},e3:{x:400,y:720},t1:{x:816,y:720},e2:{x:1232,y:720},q1:{x:1328,y:912},t3:{x:368,y:1136},e4:{x:816,y:1136},q4:{x:688,y:1264},t2:{x:1136,y:1264}},
	load:function(spot){
		
	},
	loop:function(spot){
		var bool = true;
		var guyInZone = false;
		var monsterInZone = false;
		
		m.forEachActor(spot,25,function(key){
			if(s.isPlayer(key))
				guyInZone = true;
			else
				monsterInZone = true;
		},'actor',spot.b1);
		
		if(m.testInterval(25*4)){
			var randomPlayer = m.getRandomPlayer(spot);
			if(guyInZone && s.getPartySize(randomPlayer) === 1){
				var mySpot = [spot.e1,spot.e2,spot.e3,spot.e4];
				var myModel = ['dragon','bee','bat','mushroom','gargoyle','bird','demon'];
				m.spawnActor(mySpot.$random(),myModel.$random(),{
					deathEvent:'killEnemy'
				});
			}
		}
		
		if(m.testInterval(25*10)){
			var mySpot = [spot.q1,spot.q2,spot.q3,spot.q4];
			m.spawnActor(mySpot.$random(),'loot-flowerOff',{
				onclick:s.newNpc.onclick(
					null,
					null,
					s.newNpc.onclick.side('Pick Boost','lootFlower'),
					null
				),
			});
		}
		
		m.forEachActor(spot,25,function(key){	//must be last
			if(!bool) return;
			if(!s.isChallengeActive(key,'neverAlone') || monsterInZone){
				if(s.callEvent.one('givePt',key))
					bool = false;
			}
		},'player',spot.b1);
	}
});
s.newMapAddon('QfirstTown-south',{
	spot:{n1:{x:3152,y:1712}},
	load:function(spot){
		m.spawnActor(spot.n1,'npc',{
			name:"Wushin",
			sprite:s.newNpc.sprite('fairy7',1),
			dialogue:'talkWushin',
			angle:s.newNpc.angle('left'),
			nevermove:true,
		});
	}
});

s.exports(exports);
