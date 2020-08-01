//02/10/2015 12:14 AM
/*jslint node: true, undef:true, sub:true, asi:true, funcscope:true, forin:true, unused:false*//*global True, False, loadAPI*/
/*Go to http://jshint.com/ and copy paste your code to spot syntax errors.*/

'use strict';
var s = loadAPI('v1.0','QcatchThemAll',{
	name:"Catch Them All",
	author:"rc",
	thumbnail:true,
	description:"Catch monsters by first weakening them. When the time runs out, use them to kill the boss.",
	maxParty:4
});
var m = s.map; var b = s.boss; var g;

/* COMMENT:

*/

s.newVariable({
	timeout:False,
	monsterCaught:'',
	lootPot2:False,
	lootPot1:False,
	ownerId:0,
	gameOver:False,
	talkAytia:False,
	killBoss:0,
	deathLess:true,
	monsterCount:0
});

s.newHighscore('mostCaught',"Most Caught","Most monsters caught. Duplicate allowed.",'descending',function(key){
	return s.get(key,'monsterCount');
});
s.newHighscore('speedrun',"Fastest Boss Kill","Fastest Boss Kill",'ascending',function(key){
	if(s.getPartySize(key) === 1)
		return s.stopChrono(key,'boss')*40;
});

s.newChallenge('catchAll',"Catch Them All","Catch every type of monster.",2,function(key){
	var caught = s.get(key,'monsterCaught');
	if(!caught.$contains('dragon')) return false;
	if(!caught.$contains('bee')) return false;
	if(!caught.$contains('bat')) return false;
	if(!caught.$contains('plant')) return false;
	if(!caught.$contains('demon')) return false;
	return true;
});
s.newChallenge('doubleTrouble',"Double Trouble","Fight 2 bosses at once.",2,function(key){
	return true;
});
s.newChallenge('deathLess',"Deathless","No death. That include you and your monsters. No potions allowed.",2,function(key){
	return s.get(key,'deathLess');
});

s.newEvent('_start',function(key){ //
	if(s.isAtSpot(key,'QfirstTown-south','n1',200))
		s.callEvent('talkAytia',key);
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
s.newEvent('_hint',function(key){ //
	if(!s.get(key,'talkAytia')) return 'Talk with Aytia';
	if(!s.get(key,'timeout')) return 'Weaken monsters with [$0] then catch them with [$1]';
	return 'Kill your rival. Use Hyper Potions if you found any.';
});
s.newEvent('collisionBulletEnemy',function(eid,key){ //
	var ratio = s.getAttr(eid,'hp') / s.getAttr(eid,'hpMax');
	ratio = Math.pow(1 - ratio,3);
	
	//1% hp = 98%, 25% hp = 42%, 50% hp = 13%
	
	if(Math.random() < ratio){
		var caught = s.get.one(key,'monsterCaught').split(',');
		if(!caught[0]) caught.shift();
		
		caught.push(s.getTag(eid).model);
		if(caught.length > 5)
			caught.shift();
		s.set.one(key,'monsterCaught',caught.toString());
		s.message.one(key,'You caught a monster!');	
		s.add.one(key,'monsterCount',1);
		s.killActor(eid);
		s.callEvent.one('updatePermPopup',key);
	} else {
		s.message.one(key,'You failed to catch this monster.');
	}
});
s.newEvent('talkAytia',function(key){ //
	s.startDialogue(key,'Aytia','intro');
});
s.newEvent('updatePermPopup',function(key){ //
	var caught = s.get.one(key,'monsterCaught').split(',');
	var str = 'Caught (Max 5):<br>';
	for(var i = 0 ; i < caught.length; i++)
		if(caught[i])
			str += ' - ' + caught[i].capitalize() + '<br>'
	s.displayPermPopup.one(key,str);
});
s.newEvent('startGame',function(key){ //
	s.set(key,'talkAytia',true);
	s.setTimeout(key,'timeout',25*60);	//TEMP
	s.startChrono(key,'timer');
	s.usePreset(key,'trainer');
	
	var list = s.getParty(key);
	for(var i = 0 ; i < list.length; i++){
		s.set.one(list[i],'ownerId',i);
		s.teleport.one(list[i],'main','t' + (i+1),'party');
		s.setRespawn.one(list[i],'main','t' + (i+1),'party');
		s.callEvent.one('updatePermPopup',list[i]);
	}
});
s.newEvent('timeout',function(key){ //
	s.set(key,'timeout',true);
	s.removeChrono(key,'timer');
	s.enableCombat(key,false);
	
	var helper = function(pokemonOwner){
		return function(defId,atkId){
			return s.getTag(defId).pokemonOwner !== pokemonOwner;
		}
	}
	
	var list = s.getParty(key);
	for(var i = 0 ; i < list.length; i++){
		s.teleport.one(list[i],'fight','t' + (i+1),'party');
		
		var caught = s.get.one(list[i],'monsterCaught').split(',');
		for(var j = 0 ; j < caught.length; j++){
			if(!caught[j]) continue;
			var eid = s.spawnActorOnTop(list[i],'fight',caught[j],{
				awareNpc:True,
				combatType:'player',
				targetIf:helper(i),
				damageIf:helper(i),
				deathEvent:'deathMonster',
				tag:{
					pokemonOwner:i,
				}
			});
		}
	}
	
	if(s.getPartySize(key) === 1){
		s.startChrono(key,'boss');
		
		var count = s.isChallengeActive(key,'doubleTrouble') ? 2 : 1;
		for(var i = 0 ; i < count; i++){
			s.spawnActor(key,'fight','e1','death',{
				sprite:s.newNpc.sprite('death',1.7),
				atkSpd:4,
				globalDef:4,
				hpRegen:0,
				globalDmg:1,
				statusResist:s.newNpc.statusResist(1,1,1,1,1,1),
				deathEvent:'killBoss',
			});
		}
		
	}
});
s.newEvent('itemHyperPotion',function(key){ //
	if(s.isChallengeActive(key,'deathLess'))
		return s.message(key,'You can\'t use potions since you are doing they Deathless Challenge.');
	
	s.removeItem.one(key,'hyperPotion',1);
	if(!s.isInMap(key,'fight')){
		s.message.one(key,'Wait until you fight the boss before using potions.');
		return;
	}
	
	var ownerId = s.get.one(key,'ownerId');
	s.forEachActor(key,'fight',function(key2){
		s.healActor(key2);
	},'npc',null,{pokemonOwner:ownerId});
});
s.newEvent('killBoss',function(eid,bossId){ //
	var key = s.getRandomPlayer(bossId,'fight');
	s.add(key,'killBoss',1)
	if(!s.isChallengeActive(key,'doubleTrouble') && s.get(key,'killBoss') >= 1)
		s.completeQuest(key);
	if(s.isChallengeActive(key,'doubleTrouble') && s.get(key,'killBoss') >= 2)
		s.completeQuest(key);
	
});
s.newEvent('deathMonster',function(killer,eid){ //
	var key = s.getRandomPlayer(eid,'fight');
	s.set(key,'deathLess',false);
});
s.newEvent('_death',function(key){ //
	s.set(key,'deathLess',false);
});

s.newItem('hyperPotion',"Hyper Potion",'heal.vial',[    //{
	s.newItem.option('itemHyperPotion',"Heal Party","Heal all caught monsters.")
],'Heal all caught monsters.'); //}

s.newAbility('pokeball','attack',{
	name:"Pokesphere",
	icon:'skill.mining',
	description:"Throw at weak monsters."
},{
	type:'bullet',
	amount:1,
	dmg:s.newAbility.dmg(1,'magic'),
	hitEvent:s.newAbility.hitEvent('collisionBulletEnemy'),
	sprite:s.newAbility.sprite('shadowball',0.5)
});
s.newAbility('regularAttack','attack',{
	name:"Spore",
	icon:'resource.dodge',
	description:"Weaken monsters.",
	periodOwn:10,
	periodGlobal:10
},{
	type:'bullet',
	amount:3,
	angleRange:15,
	dmg:s.newAbility.dmg(150,'magic'),
	stun:s.newAbility.status(1,1,1),
	onHit:{
		type:'bullet',
		amount:1
	},
	sprite:s.newAbility.sprite('spore',1)
});

s.newPreset('trainer',s.newPreset.ability(['regularAttack','pokeball','','','','']),null,False,True,False,False);

s.newDialogue('Aytia','Aytia','fairy.3',[ //{ 
	s.newDialogue.node('intro',"Hey! I just found something really cool!",[ 
		s.newDialogue.option("What is it?",'intro2','')
	],''),
	s.newDialogue.node('intro2',"I can capture monsters in balls! All I need to do is attack the monster until it reaches low health and then I use the ability Pokesphere (Right-Click) to capture it.",[ 
		s.newDialogue.option("That sounds amazing!",'intro3','')
	],''),
	s.newDialogue.node('intro3',"I can lend you the ability if you want. Only for 1 minute though.",[ 
		s.newDialogue.option("Anything special I need to do?",'intro4','')
	],''),
	s.newDialogue.node('intro4',"Well, try to capture as many monsters as possible within that 1 minute range and then, force them to fight for you against a boss.",[ 
		s.newDialogue.option("Understood. I'm ready!",'','startGame')
	],'')
]); //}

s.newMap('main',{
	name:"Tall Grass",
	lvl:0,
	graphic:'QfirstTown-south',
},{
	spot:{t1:{x:1744,y:176},e1:{x:1264,y:656},q4:{x:2416,y:880},e2:{x:624,y:944},ec:{x:2128,y:1104},q1:{x:144,y:1232},q3:{x:2896,y:1232},t4:{x:1552,y:1264},e3:{x:624,y:1520},e8:{x:2000,y:1648},q5:{x:1008,y:1680},e4:{x:784,y:1712},ed:{x:1136,y:1904},t2:{x:208,y:2192},eb:{x:2704,y:2192},e5:{x:848,y:2256},e6:{x:1584,y:2416},ea:{x:2544,y:2640},t3:{x:2320,y:2960},e7:{x:1168,y:3024},q2:{x:1488,y:3088}},
	load:function(spot){
		var spotList = [
			spot.e1,spot.e2,spot.e3,spot.e4,spot.e5,spot.e6,spot.e7,spot.e8,
			spot.ea,spot.eb,spot.ec,spot.ed
		];
		
		var monsterList = [
			'dragon',
			'demon',
			'plant','plant','plant',
			'bee','bee','bee',
			'bat','bat','bat','bat',
		];
		monsterList.sort(function(){ return Math.random()-0.5 });
		
		for(var i = 0; i < spotList.length; i++){
			m.spawnActor(spotList[i],monsterList[i],{
				tag:{
					model:monsterList[i]
				}	
			});
		}
		
		var firstSpotNum = Math.floor(Math.random()*5) + 1;
		var firstSpot = spot['q' + firstSpotNum];
		
		m.spawnLoot(firstSpot,function(key){
			return !s.get(key,'lootPot1');
		},function(key){
			s.set(key,'lootPot1',true);
			s.addItem.one(key,'hyperPotion',3);
		},'chest');
		
		//###########
		
		var secondSpotNum;
		do {
			secondSpotNum = Math.floor(Math.random()*5) + 1;
		}while(secondSpotNum === firstSpotNum);
		
		
		var secondSpot = spot['q' + secondSpotNum];
		
		m.spawnLoot(secondSpot,function(key){
			return !s.get(key,'lootPot2');
		},function(key){
			s.set(key,'lootPot2',true);
			s.addItem.one(key,'hyperPotion',3);
		},'chest');
	}
});
s.newMapAddon('QfirstTown-south',{
	spot:{n1:{x:368,y:816}},
	load:function(spot){
		m.spawnActor(spot.n1,'npc',{
			sprite:s.newNpc.sprite('fairy3',1),
			name:"Aytia",
			dialogue:'talkAytia'
		});
	}
});
s.newMap('fight',{
	name:"Arena",
	lvl:0,
	graphic:'QcollectFight-fight',
},{
	spot:{t2:{x:1200,y:432},t3:{x:656,y:496},e1:{x:1008,y:656},t1:{x:816,y:784},t4:{x:1072,y:1008},t5:{x:1264,y:1488}},
	load:function(spot){
		
	},
	loop:function(spot){
		if(!m.testInterval(25)) return;
		
		var key = m.getRandomPlayer(spot);
		var partySize = s.getPartySize(key);
		if(s.get(key,'gameOver')) return;
		
		var pokemonCount = [0,0,0,0];
		m.forEachActor(spot,25,function(eid){
			var pokeOwner = s.getTag(eid).pokemonOwner;
			if(pokeOwner !== undefined)	//not boss
				pokemonCount[pokeOwner]++;
		},'npc',null);
		
		if(partySize === 1){
			if(pokemonCount[0] === 0)
				s.failQuest(key);
			return;
		}
		
		var zeroCount = 0;
		var nonZeroId = null;
		for(var i = 0 ; i < partySize; i++){
			if(pokemonCount[i] === 0)
				zeroCount++;
			else
				nonZeroId = i;
		}
		if(zeroCount >= partySize-1){
			s.set(key,'gameOver',true);
			
			var list = s.getParty(key);
			var winner = '';
			
			for(var i = 0 ; i < list.length; i++)
				if(s.get.one(list[i],'ownerId') === nonZeroId)
					winner = s.getAttr(list[i],'name');
			
			s.displayPopup(key,'Winner is: ' + winner + '!');
			s.setTimeout(key,function(){
				s.completeQuest(key);
			},25*3);
		}
	}
});

s.exports(exports);
