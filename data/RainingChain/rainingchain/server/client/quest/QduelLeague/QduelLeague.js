//02/08/2015 1:41 AM
/*jslint node: true, undef:true, sub:true, asi:true, funcscope:true, forin:true, unused:false*//*global True, False, loadAPI*/
/*Go to http://jshint.com/ and copy paste your code to spot syntax errors.*/

'use strict';
var s = loadAPI('v1.0','QduelLeague',{
	name:"Duel League",
	author:"rc",
	thumbnail:true,
	description:"Kill enemies in your zone to send enemies in your rivals' zone until they die.",
	maxParty:4,
	reward:{"ability":{"Qsystem-player-dodgeLife":0.5}},
});
var m = s.map; var b = s.boss; var g;

/* COMMENT:

*/

s.newVariable({
	zone1Key:'',
	zone2Key:'',
	zone3Key:'',
	zone4Key:'',
	partyDeathCount:0
});

s.newChallenge('strongerBoss',"Stronger Boss","The boss has x2 Defence and x2 Damage.",2,function(key){
	return true;
});
s.newChallenge('harderMinions',"Harder Minions","Minions spawned on your side are invincible for 7 seconds.",2,function(key){
	return true;
});
s.newChallenge('speedrun',"Speedrun","Kill the boss in less than 1 min.",2,function(key){
	return s.stopChrono(key,'timer') < 25*60;
});

s.newHighscore('speedrun',"Speedrun","Fastest completion of the quest.",'ascending',function(key){
	if(s.getPartySize(key) !== 1) return null;
	return s.stopChrono(key,'timer');
});



s.newEvent('talkDirewolf',function(key){ //
	s.startDialogue(key,'Direwolf','intro');
});
s.newEvent('startGame',function(key){ //
	s.startChrono(key,'timer',true);
	var list = s.getParty(key);
	if(list.length === 1){
		s.teleport(key,'main','t1','party');
		
		var globalDef = s.isChallengeActive(key,'strongerBoss') ? 20 : 10;
		var globalDmg = s.isChallengeActive(key,'strongerBoss') ? 4 : 2;
		
		var bossKey = s.spawnActor(key,'main','t2','spirit',{
			globalDef:globalDef,
			globalDmg:globalDmg,
			sprite:s.newNpc.sprite('spirit',2),
			atkSpd:3,
			hpRegen:0,
			statusResist:s.newNpc.statusResist(1,1,1,1,1,1),
			deathEvent:'killBoss',
			awareNpc:True,
			combatType:'player',
			targetIf:'npc',
			damageIf:'npc',
			tag:{
				zone1Key:key,
				zone2Key:'BADDD',
			}
		});
		s.set(key,'zone1Key',key);
		s.set(key,'zone2Key',bossKey);
		
		s.callEvent.one('spawnEnemy',key);
		s.callEvent.one('spawnEnemy',key);
		s.callEvent.one('spawnEnemy',bossKey);
		s.callEvent.one('spawnEnemy',bossKey);
	} else {
		s.set(key,'zone1Key',list[0]);
		s.teleport.one(list[0],'main','t1','party');
		s.set(key,'zone2Key',list[1]);
		s.teleport.one(list[1],'main','t2','party');
		if(list[2]){
			s.set(key,'zone3Key',list[2]);
			s.teleport.one(list[2],'main','t3','party');
		}
		if(list[3]){
			s.set(key,'zone4Key',list[3]);
			s.teleport.one(list[3],'main','t4','party');
		}
		
		s.callEvent.one('spawnEnemy',list[0]);
		s.callEvent.one('spawnEnemy',list[0]);
		s.callEvent.one('spawnEnemy',list[1]);
		s.callEvent.one('spawnEnemy',list[1]);
		
		if(list[2]){
			s.callEvent.one('spawnEnemy',list[2]);
			s.callEvent.one('spawnEnemy',list[2]);
		}
		if(list[3]){
			s.callEvent.one('spawnEnemy',list[3]);
			s.callEvent.one('spawnEnemy',list[3]);
		}
	}
});
s.newEvent('_scoreMod',function(key){ //
	if(s.getPartySize(key) > 1){
		var time = s.stopChrono(key,'timer');
		if(time > 5 * 60 * 25)
			return 5;
		if(time > 4 * 60 * 25)
			return 4;
		if(time > 3 * 60 * 25)
			return 3;
		if(time > 2 * 60 * 25)
			return 2;
	}
	return 1;
});
s.newEvent('_death',function(key){ //possible abuse
	var size = s.getPartySize(key);
	if(size === 1)
		s.failQuest(key);
	else {
		s.setRespawn.one(key,'main','g1','party');
		s.add(key,'partyDeathCount',1);
				
		if(s.get(key,'partyDeathCount') >= size-1){	//everyone but 1 dude died
			var time = s.stopChrono(key,'timer');
			if(time > 25*60)
				s.completeQuest(key);
			else {
				s.message(key,'The duel needs to last at least 1 minute to get rewards.');
				s.displayPopup(key,'The duel needs to last at least 1 minute to get rewards.');
				s.failQuest(key);
			}
		} else {
			if(s.get(key,'zone1Key') === key)
				s.set(key,'zone1Key','');
			else if(s.get(key,'zone2Key') === key)
				s.set(key,'zone2Key','');
			else if(s.get(key,'zone3Key') === key)
				s.set(key,'zone3Key','');
			else if(s.get(key,'zone4Key') === key)
				s.set(key,'zone4Key','');
		}
	}
});
s.newEvent('_signOff',function(key){ //
	s.failQuest(key);
});
s.newEvent('_signIn',function(key){ //
	s.failQuest(key);
});
s.newEvent('killEnemy',function(key,eid){ //
	var killerKey = s.getTag(eid).killer;
	var random = Math.random();
	if(random < 1/3){
		s.callEvent.one('spawnBigEnemy',killerKey);
	} else if(random < 2/3){
		s.callEvent.one('spawnEnemy',killerKey);
	} else {
		s.callEvent.one('spawnEnemy',killerKey);
		s.callEvent.one('spawnEnemy',killerKey);
	}
});
s.newEvent('spawnBigEnemy',function(key){ //
	var possible = ['dragon','mummy','taurus','ghost','plant','bat'];
	var chosen = possible.$random();
	var spot = s.callEvent('getSpotLeastEnemy',key,key);
	var getKeyAtSpot = s.callEvent('getKeyAtSpot',key,spot);
	
	var eid = s.spawnActor(key,'main',spot,chosen,{
		v:300,
		deathEvent:'killEnemy',
		sprite:s.newNpc.sprite(chosen,1.5),
		globalDef:2,
		tag:{
			killer:getKeyAtSpot,		
		}
	});
	if(s.isPlayer(getKeyAtSpot) && s.isChallengeActive(getKeyAtSpot,'harderMinions'))
		s.addBoost(eid,'globalDef',100,7*25,'immuneSpawn');
});
s.newEvent('spawnEnemy',function(key){ //
	var possible = ['mushroom','bee','spirit','demon','goblin-melee','goblin-range','goblin-magic','orc-melee','orc-range','orc-magic'];
	var chosen = possible.$random();
	
	var spot = s.callEvent('getSpotLeastEnemy',key,key);
	var getKeyAtSpot = s.callEvent('getKeyAtSpot',key,spot);
	
	var eid = s.spawnActor(key,'main',spot,chosen,{
		v:300,
		deathEvent:'killEnemy',
		tag:{
			killer:getKeyAtSpot,		
		}
	});
	
	if(s.isPlayer(getKeyAtSpot) && s.isChallengeActive(getKeyAtSpot,'harderMinions'))
		s.addBoost(eid,'globalDef',100,7*25,'immuneSpawn');
});
s.newEvent('getSpotLeastEnemy',function(aKey,immune){ //
	var key = s.getRandomPlayer(aKey,'main');
	var possibleSpot = [];
	if(s.get(key,'zone1Key') !== '' && s.get(key,'zone1Key') !== immune)
		possibleSpot.push('t1');
	if(s.get(key,'zone2Key') !== '' && s.get(key,'zone2Key') !== immune)
		possibleSpot.push('t2');
	if(s.get(key,'zone3Key') !== '' && s.get(key,'zone3Key') !== immune)
		possibleSpot.push('t3');
	if(s.get(key,'zone4Key') !== '' && s.get(key,'zone4Key') !== immune)
		possibleSpot.push('t4');
	return possibleSpot.$random();
});
s.newEvent('getKeyAtSpot',function(key,spot){ //
	var randomPlayer = s.getRandomPlayer(key,'main');
	if(spot === 't1') return s.get(randomPlayer,'zone1Key');
	else if(spot === 't2') return s.get(randomPlayer,'zone2Key');
	else if(spot === 't3') return s.get(randomPlayer,'zone3Key');
	else if(spot === 't4') return s.get(randomPlayer,'zone4Key');
	return ERROR(3,'invalid spot',spot);
});
s.newEvent('killBoss',function(killer,eid){ //
	var key = s.getRandomPlayer(eid,'main');
	s.completeQuest(key);
});
s.newEvent('_complete',function(key){ //
	s.callEvent('_abandon',key);
});
s.newEvent('_abandon',function(key){ //
	s.teleport(key,'QfirstTown-eastCave','n1','main');
	s.setRespawn(key,'QfirstTown-eastCave','n1','main');
});
s.newEvent('_start',function(key){ //
	if(s.isAtSpot(key,'QfirstTown-eastCave','n1',200))
		s.callEvent('talkDirewolf',key);
	else s.addQuestMarker(key,'start','QfirstTown-eastCave','n1');
});

s.newDialogue('Direwolf','Direwolf','bad-human.0',[ //{ 
	s.newDialogue.node('intro',"You seem very weak... And dumb. You'll never beat that quest.",[ 
		s.newDialogue.option("I'm not weak!",'introNotWeak',''),
		s.newDialogue.option("I'm not dumb!",'introNotDumb','')
	],''),
	s.newDialogue.node('introNotDumb',"Oh, okay. You're just weak then. Are you sure you want to do that quest? You are going to fail miserably I'm sure.",[ 
		s.newDialogue.option("My body is ready!",'introFinal','')
	],''),
	s.newDialogue.node('introNotWeak',"Oh, okay. You're just dumb then. Are you sure you want to do that quest? You are going to fail miserably I'm sure.",[ 
		s.newDialogue.option("My mind is ready!",'introFinal','')
	],''),
	s.newDialogue.node('introFinal',"Then prove yourself in the Battle Arena.<br>Kill monsters in your zone to spawn monsters in your rival's zone.<br>First to die, lose.",[ 
		s.newDialogue.option("Go!",'','startGame')
	],'')
]); //}

s.newMap('main',{
	name:"Arena",
	lvl:0,
	grid:["000000000000000000000000000000000000000000000000000000000000","000111111111111111111111111000000111111111111111111111111111","001111111111111111111111111100001111111111111111111111111110","011111111111111111111111111110011111111111111111111111111110","011111111111111111111111111110011111111111111111111111111110","011000000000000000000001111110011111111110000000000000000110","011000000000000000000001111110011111111110000000000000000110","011000000000000000000000111110011111111100000000000000000110","011000000000000000000000011110011111000000000000000000000110","011000000000000000000000000110011000000000000000000000000110","011000000000000000000000000110011000000000000000000000000110","011000000000000000000000000110011000000000000000000000000110","011000000000000000000000000110011000000000000000000000000110","011000000000000000000000000110011000000000000000000000000110","011000000000000000000000000110011000000000000000000000000110","011000000000000000000000000110011000000000000000000000000110","011000000000000000000000000110011000000000000000000000000110","011000000000000000000000000110011000000000000000000000000110","011000000000000000000000000110011000000000000000000000000110","011000000000000000000000000110011000000000000000000000000110","011000000000000000000000000110011000000000000000000000000110","011000000000000000000000000110011000000000000000000000000110","011000000000000000000000000110011000000000000000000000000110","011000000000000000000000000110011000000000000000000000000110","011000000000000000000000000110011000000000000000000000000110","011000000000000000000000000110011000000000000000000000000110","011000000000000000000000000110011000000000000000000000000110","011111111111111111111111111110011111111111111111111111111100","011111111111111111111111111111111111111111111111111111111100","000000000000000000000000001111111100000000000000000000001111","000000000000000000000000001111111100000000000000000000001111","000111111111111111111111111111111111111111111111111111111111","001111111111111111111111111110011111111111111111111111111111","011111111111111111111111111110011111111111111111111111111110","011111111111111111111111111110011111111111111111111111111110","011111100000000000000000000110011000000000000000000000000110","011111100000000000000000000110011000000000000000000000000110","011110000000000000000000000110011000000000000000000000000110","011110000000000000000000000110011000000000000000000000000110","011000000000000000000000000110011000000000000000000000000110","011000000000000000000000000110011000000000000000000000000110","011000000000000000000000000110011000000000000000000000000110","011000000000000000000000000110011000000000000000000000000110","011000000000000000000000000110011000000000000000000000000110","011000000000000000000000000110011000000000000000000000000110","011000000000000000000000000110011000000000000000000000000110","011000000000000000000000000110011000000000000000000000000110","011000000000000000000000000110011000000000000000000000000110","011000000000000000000000000110011000000000000000000000000110","011000000000000000000000000110011000000000000000000000000110","011000000000000000000000000110011000000000000000000000000110","011000000000000000000000000110011000000000000000000000000110","011000000000000000000000000110011000000000000000000000000110","011000000000000000000000000110011000000000000000000000111110","011000000000000000000000000110011000000000000000000001111110","011000000000000000000000000110011000000000000000000001111110","011000000000000000000000000110011000000000000000000001111110","001111111111111111111111111111111111111111111111111111111100","000111111111111111111111111111111111111111111111111111111000","000000000000000000000000000001110000000000000000000000000000"],
	tileset:'v1.2'
},{
	spot:{q1:{x:96,y:160,width:768,height:704},q2:{x:1056,y:160,width:768,height:704},t1:{x:464,y:496},e1:{x:464,y:528},t2:{x:1456,y:528},e2:{x:1456,y:560},g1:{x:48,y:976},q3:{x:96,y:1120,width:768,height:704},q4:{x:1056,y:1120,width:768,height:704},t4:{x:1456,y:1488},t3:{x:496,y:1520},e4:{x:1456,y:1520},e3:{x:496,y:1552}},
	load:function(spot){
		
	}
});
s.newMapAddon('QfirstTown-eastCave',{
	spot:{n1:{x:48,y:1616}},
	load:function(spot){
		m.spawnActor(spot.n1,'npc',{
			sprite:s.newNpc.sprite('bad-human0',1),
			name:'Direwolf',
			angle:s.newNpc.angle('right'),
			nevermove:true,
			dialogue:'talkDirewolf',
		});
	}
});

s.exports(exports);
