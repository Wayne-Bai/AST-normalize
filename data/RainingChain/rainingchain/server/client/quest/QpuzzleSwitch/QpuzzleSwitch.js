//02/15/2015 1:59 AM
/*jslint node: true, undef:true, sub:true, asi:true, funcscope:true, forin:true, unused:false*//*global True, False, loadAPI*/
/*Go to http://jshint.com/ and copy paste your code to spot syntax errors.*/

'use strict';
var s = loadAPI('v1.0','QpuzzleSwitch',{
	name:"Puzzle & Switch",
	author:"rc",
	thumbnail:"",
	description:"",
	maxParty:2,
	admin:true
});
var m = s.map; var b = s.boss; var g;

/* COMMENT:
POSSIBLE BUG IF LOGOUT AFTER PUSHING
*/

s.newVariable({
	greenActive:False,
	yellowActive:False,
	redActive:False
});

s.newEvent('viewedIfBlock',function(color,base){ //
	return function(key){
		if(base === false)
			return s.get(key,color + 'Active');
		else
			return !s.get(key,color + 'Active');
	}
});
s.newEvent('spawnToggle',function(spot,color){ //
	m.spawnToggle(spot,function(key){
		return s.get(key,color + 'Active')
	},function(key){
		s.set(key,color + 'Active',false);
	},function(key){
		s.set(key,color + 'Active',true);	
	},null,{
		sprite:s.newNpc.sprite('toggle-' + color + 'Off'),
		interactionMaxRange:50,
	},{
		sprite:s.newNpc.sprite('toggle-' + color + 'On'),
		interactionMaxRange:50,
	});
});
s.newEvent('spawnToggleMove',function(spot,color){ //
	var duoId = Math.random();
	
	m.spawnToggle(spot,function(key){
		if(s.getTag(key).isSwitch) return false;
		return s.get(key,color + 'Active')
	},function(key,switch1){
		s.set(key,color + 'Active',false);
		
		s.addBoost(key,'maxSpd',0,10);
		s.callEvent('syncToggle',spot.map);
		
	},function(key,switch1){
		s.set(key,color + 'Active',true);
		s.addBoost(key,'maxSpd',0,10);
		s.callEvent('syncToggle',spot.map);
	},null,{
		nevermove:false,
		tag:{isSwitch:true,state:'off',duoId:duoId},
		pushable:s.newNpc.pushable(8,8,s.callEvent('syncToggle',spot.map)),
		sprite:s.newNpc.sprite('toggle-' + color + 'Off-bronze',1),
		block:s.newNpc.block(s.newNpc.block.size(2,2),1),
		interactionMaxRange:50,
	},{
		nevermove:false,
		tag:{isSwitch:true,state:'on',duoId:duoId},
		pushable:s.newNpc.pushable(8,8,s.callEvent('syncToggle',spot.map)),
		sprite:s.newNpc.sprite('toggle-' + color + 'On-bronze',1),
		block:s.newNpc.block(s.newNpc.block.size(2,2),1),
		interactionMaxRange:50,
	});
});
s.newEvent('spawnButton',function(spot,color,defaultState){ //
	m.spawnActor(spot,'block-rock2x2',{
		sprite:s.newNpc.sprite(color + '-up',1),
		viewedIf:s.callEvent('viewedIfBlock',color,defaultState)
	});
	m.spawnActor(spot,'block-rock2x2',{
		sprite:s.newNpc.sprite(color + '-down',1),
		block:null,
		viewedIf:s.callEvent('viewedIfBlock',color,!defaultState)
	});
});
s.newEvent('spawnPushableRock',function(spot){ //
	m.spawnActor(spot,"pushable-rock2x2",{
		pushable:s.newNpc.pushable(8,8),
	});
});
s.newEvent('spawnWalkableRock',function(spot){ //
	m.spawnActor(spot,"block-rock2x2",{
		viewedIf:'viewPreventBlock'
	});
});
s.newEvent('viewPreventBlock',function(key){ //
	return !s.isPlayer(key);
});
s.newEvent('spawnList',function(list,spot){ //
	for(var i in list.walkableRock){
		s.callEvent('spawnWalkableRock',spot[list.walkableRock[i]]);
	}
	for(var i in list.pushableRock){
		s.callEvent('spawnPushableRock',spot[list.pushableRock[i]]);
	}
	for(var i in list.toggleRed){
		s.callEvent('spawnToggle',spot[list.toggleRed[i]],'red');
	}
	for(var i in list.toggleGreen){
		s.callEvent('spawnToggle',spot[list.toggleGreen[i]],'green');
	}
	for(var i in list.toggleYellow){
		s.callEvent('spawnToggle',spot[list.toggleYellow[i]],'yellow');
	}
	for(var i in list.toggleRedMove){
		s.callEvent('spawnToggleMove',spot[list.toggleRedMove[i]],'red');
	}
	for(var i in list.toggleGreenMove){
		s.callEvent('spawnToggleMove',spot[list.toggleGreenMove[i]],'green');
	}
	for(var i in list.toggleYellowMove){
		s.callEvent('spawnToggleMove',spot[list.toggleYellowMove[i]],'yellow');
	}
	for(var i in list.buttonRedDown){
		s.callEvent('spawnButton',spot[list.buttonRedDown[i]],'red',false);
	}
	for(var i in list.buttonGreenDown){
		s.callEvent('spawnButton',spot[list.buttonGreenDown[i]],'green',false);
	}
	for(var i in list.buttonYellowDown){
		s.callEvent('spawnButton',spot[list.buttonYellowDown[i]],'yellow',false);
	}
	for(var i in list.buttonRedUp){
		s.callEvent('spawnButton',spot[list.buttonRedUp[i]],'red',true);
	}
	for(var i in list.buttonGreenUp){
		s.callEvent('spawnButton',spot[list.buttonGreenUp[i]],'green',true);
	}
	for(var i in list.buttonYellowUp){
		s.callEvent('spawnButton',spot[list.buttonYellowUp[i]],'yellow',true);
	}
});
s.newEvent('resetActive',function(key){ //
	s.set(key,'greenActive',false);
	s.set(key,'yellowActive',false);
	s.set(key,'redActive',false);
});
s.newEvent('syncToggle',function(map){ //
	return function(key,switch1){
		s.setTimeout(key,function(){
			//POSSIBLE BUG IF LOGOUT AFTER PUSHING
			var tag = s.getTag(switch1);
			
			var switch2 = s.getRandomNpc(key,map,{	//idk if works
				duoId:tag.duoId,
				state:tag.state === 'off' ? 'on' : 'off'
			});			
			
			var act = s.getAct(switch1);
			var act2 = s.getAct(switch2);
			
			act2.x = act.x;
			act2.y = act.y;
		},25*2);
	}
});

s.newMap('lvl1',{
	name:"Level 1",
	lvl:0,
	grid:["111111000000001000011111111110","111111000000001000011111111110","111111000000001000011111111111","111111000000011000011111111111","111111111111111000011111111111","001111111111001100110011111110","001111111111001100110001111110","001111111111001100110001000000","001111111111001100110001000000","001000111111111100111111000000","001000111111111100111111000000","001000110011000000001111111100","001000110011000000001111111100","001111000000000000001111111100","001111000000000000001111111100","001000111100000000001111111100","001000111100000000001111000000","001000001111111100111111000000","001100001111111100111111000000","000110001111111100111110000000","000011111111111100111100000000","000001111111111100111000000000","000000001111000000000000011110","000000001111000000000000011110","000000000000000000000000011110","111000000000000000000000000000","111001111000000000001111000000","111111111000000000001111000000","111111111000000000001111000000","111110000000000000000000000000"],
	tileset:'v1.2'
},{
	spot:{t2:{x:544,y:48},a:{x:544,y:192},b:{x:544,y:256},c:{x:544,y:320},f:{x:288,y:384},e:{x:416,y:384},d:{x:544,y:384},g:{x:288,y:448},h:{x:352,y:448},t1:{x:512,y:912}},
	load:function(spot){
		var toSpawn = {
			walkableRock:['h'],
			pushableRock:['g'],
			toggleRed:['f'],
			toggleGreen:['e'],
			toggleYellow:[],
			toggleRedMove:[],
			toggleGreenMove:[],
			toggleYellowMove:['d'],
			buttonRedUp:['a'],
			buttonGreenUp:['c'],
			buttonYellowUp:['b'],
			buttonRedDown:[],
			buttonGreenDown:[],
			buttonYellowDown:[],
		}
		
		s.callEvent('spawnList',toSpawn,spot);
		
		m.spawnTeleporter(spot.t1,null,'zone',{
			angle:s.newNpc.angle('down'),
		});
		m.spawnTeleporter(spot.t2,function(key){
			s.teleport(key,'lvl2','t1');
			s.callEvent('resetActive',key);
		},'zone',{
			angle:s.newNpc.angle('up'),
		});
	}
});
s.newMapAddon('QfirstTown-main',{
	spot:{q1:{x:1168,y:1648}},
	load:function(spot){
		//talk with this npc will teleport the player to the map 'main'
		/*m.spawnActor(spot.q1,'npc',{
			name:'QpuzzleSwitch',
			dialogue:function(key){
				s.teleport(key,'lvl1','t1','party');
				s.setRespawn(key,'lvl1','t1','party',true);
			},
			sprite:s.newNpc.sprite('skeleton',1),
		});*/
	}
});
s.newMap('lvl2',{
	name:"Level 2",
	lvl:0,
	grid:["1111111100000100001000000000","1111111100000100001000000000","1111111111000100001000000000","1111111111001100001100011110","1111111111111100001111111110","1111111111100110011001111110","1111111111100110011001100000","0011110001111110011111100000","0011110001111110011111100000","0000110011111000011111100000","0000111111111000011111111111","0001111111111000011111111111","0001111111111000011111111111","0001111000000000000111111111","0001111000000000000111111111","0001111001111110011111111111","0001111001111110011111111111","0001111000000000000111111111","0001111000000000000111111111","0001111001111110011111100000","0001111001111110011111100000","0001111000000000000111100000","0001111000000000000111100000","0001111001111110011111100000","0001111001111110011111111100","0001111000000000000111111100","0001111000000000000111100000","0001111111111110000111100000","0001111111111110000111111111","0001110000111110011111111111","0000110000111110011111111111","0000011111100110011111100000","1111001111100110011111100000","1111001111100110011001100000","1111111111100110011001100000","0000011111110000000011000000","0000011110011000000110011110","0000000000001100001100011110","0000000000000100001000011110","0000000000000100001000000000"],
	tileset:'v1.2'
},{
	spot:{t2:{x:512,y:48},a:{x:512,y:256},b:{x:512,y:320},c:{x:320,y:448},d:{x:384,y:448},e:{x:448,y:448},f:{x:512,y:448},g:{x:320,y:576},h:{x:384,y:576},i:{x:448,y:576},j:{x:512,y:576},k:{x:320,y:704},l:{x:384,y:704},m:{x:448,y:704},n:{x:512,y:704},o:{x:512,y:768},p:{x:512,y:832},q:{x:576,y:832},r:{x:576,y:896},t1:{x:512,y:1232}},
	load:function(spot){
		var toSpawn = {
			walkableRock:['p'],
			pushableRock:['f','j','n'],
			toggleRed:['r'],
			toggleGreen:['q'],
			toggleYellow:[],
			toggleRedMove:[],
			toggleGreenMove:[],
			toggleYellowMove:['o'],
			buttonRedUp:['c','k'],
			buttonGreenUp:['e','i'],
			buttonYellowUp:['a','l'],
			buttonRedDown:['g'],
			buttonGreenDown:['m'],
			buttonYellowDown:['h','b','d'],
		}
		
		s.callEvent('spawnList',toSpawn,spot);
		
		m.spawnTeleporter(spot.t1,null,'zone',{
			angle:s.newNpc.angle('down'),
		});
		m.spawnTeleporter(spot.t2,function(key){
			s.teleport(key,'lvl3','t1');
			s.callEvent('resetActive',key);
		},'zone',{
			angle:s.newNpc.angle('up'),
		});
	}
});
s.newMap('lvl4',{
	name:"Level 4",
	lvl:0,
	grid:["0000000000000000000000000010000100000000","0000000000000111100000000010000100000000","0000000111100111100111100010000100011110","0000000111100111100111100010000100011110","0011111111100000000111100110000110011110","0011111111100000000111111110000111110000","0011111111111111111111100011001100110000","0000001111111111111111100011001100110000","0000001111111111111111111111001111110000","0000001111111111111111111111001111110000","0000001111000000000000001111000011110000","0011001111000000000000001111000011110000","0111111111000000000000001111110011110011","0000001111000000000000001111110011110011","0000001111000000000000001111110011110000","0000001111000000000000001111100011110000","0000001111000000000000000000000011110000","1111001111000000000000000000000011110000","1111001111000000000000111111111111110000","1111001111000000000000111111111111110000","0000001111000000000000001111111111100000","0000001111000000000000001111111111000000","0000001111000000000000001111111110000000","0000001111000000000000001111000000011110","0000001111111111110011111111000000011110","1111001111111111110011111111111110011110","1111001100011110000000111111111110000000","1111001100011110000000111001111110000000","0000000110011110000000000001000000000000","0000000011111000000000000011000000000000","0000000001111000000000000110000000000000","0000000000001000001111111100000110011110","0000011110001000011111111000001111111110","0000011110001000010000000000000000011110","0000011110001000010000000011110000000000","0000000000001000010000000011110000000000","0000000000001000010000000011110000000000","0000000000001000010000000000000000000000"],
	tileset:'v1.2'
},{
	spot:{t2:{x:928,y:48},a:{x:352,y:352},b:{x:416,y:352},c:{x:480,y:352},d:{x:544,y:352},e:{x:608,y:352},f:{x:672,y:352},g:{x:736,y:352},i:{x:352,y:416},j:{x:416,y:416},k:{x:480,y:416},l:{x:544,y:416},m:{x:608,y:416},n:{x:672,y:416},o:{x:736,y:416},p:{x:352,y:480},q:{x:416,y:480},r:{x:480,y:480},s:{x:544,y:480},t:{x:608,y:480},u:{x:672,y:480},v:{x:736,y:480},w:{x:352,y:544},x:{x:416,y:544},A:{x:480,y:544},B:{x:672,y:544},C:{x:736,y:544},D:{x:800,y:544},E:{x:864,y:544},G:{x:352,y:608},H:{x:416,y:608},I:{x:544,y:608},J:{x:608,y:608},K:{x:672,y:608},L:{x:352,y:672},M:{x:416,y:672},N:{x:480,y:672},O:{x:544,y:672},P:{x:608,y:672},Q:{x:672,y:672},R:{x:736,y:672},S:{x:352,y:736},T:{x:416,y:736},U:{x:480,y:736},V:{x:544,y:736},W:{x:672,y:736},X:{x:736,y:736},e1:{x:608,y:800},e2:{x:608,y:864},e3:{x:736,y:928},t1:{x:480,y:1168}},
	load:function(spot){
		var toSpawn = {
			walkableRock:['q','p'],
			pushableRock:['r','s','A','J'],
			toggleRed:[],
			toggleGreen:['e3'],
			toggleYellow:[],
			toggleRedMove:['t'],
			toggleGreenMove:[],
			toggleYellowMove:['I'],
			buttonRedUp:['D','T'],
			buttonGreenUp:[
				'a','b','c','d','e','f','g','i','o','p',
				'v','w','G','L','S','V','W','X','R','C'
			],
			buttonYellowUp:['E'],
			buttonRedDown:['e2'],
			buttonGreenDown:[
				'j','k','l','m','n','u','B','K','Q','O','N','M','H','x'
			],
			buttonYellowDown:['e1','U'],
		}
		
		s.callEvent('spawnList',toSpawn,spot);
		
		m.spawnTeleporter(spot.t1,null,'zone',{
			angle:s.newNpc.angle('down'),
		});
		m.spawnTeleporter(spot.t2,null,'zone',{
			angle:s.newNpc.angle('up'),
		});
	}
});
s.newMap('lvl3',{
	name:"Level 3",
	lvl:0,
	grid:["0000000000000000000000010000100000000000","1111000000000000001100010000100111100000","1111000000110000001100010000100111100110","1111111111110000000000110000111111100110","0000011110000111100011111001111000000000","0000011110000111100111111001111000000000","0000000000000111100111111001111000111100","0000000000000111111111111001111000111100","0000001111111111111111111001111000111100","0000001111111111111111111001111000000110","0111100010011111111111111001111000000110","0111100010011111111111111001111100000100","0111100010011000000000000001100111111100","0000000010011000000000000001100111111110","0000000010011000011111111001111111110010","0000000110011000011111111001111111110010","0111111100011110000000000000011111110010","0111100100011110000000000000011111110010","0001100111111110011111100110011111111110","0001111111111100011111100110011111111110","0001111110000000011111100110011110011110","0001001110000000011111100110011100011110","0001001110000001111111100110000000011110","0001111110000001111111000110000000011110","0001111110000000000000000000000000011110","0001111100000000000000000000000000011110","0001111000000000000000000000000001111110","0001111000000000000000000000000001111110","1111100111111110000001111111111111100110","1111100111111110000001111111111111100110","0000111111111110000001111111111111111100","0000011111111110000001111111111111111100","0000001111111111000011111111111111111111","0000001100011001000011111100000001111111","0000111100011001000011111100000001111111","0000111100000001000011111100001111100000","0000111100000001000011111100001100000000","0000000000000001000010000000000000000000"],
	tileset:'v1.2'
},{
	spot:{t2:{x:832,y:48},a:{x:832,y:352},f:{x:448,y:416},b:{x:832,y:416},g:{x:448,y:480},c:{x:832,y:480},d:{x:832,y:544},e:{x:896,y:544},h:{x:512,y:608},j:{x:448,y:672},i:{x:512,y:672},o:{x:896,y:672},w:{x:1088,y:672},v:{x:1024,y:736},l:{x:320,y:800},n:{x:576,y:800},p:{x:832,y:800},r:{x:896,y:800},s:{x:960,y:800},k:{x:256,y:864},m:{x:320,y:864},q:{x:832,y:864},t:{x:960,y:864},u:{x:1024,y:864},t1:{x:576,y:1168}},
	load:function(spot){
		var toSpawn = {
			walkableRock:['t','u'],
			pushableRock:['v','s','r'],
			toggleRed:['l','w'],
			toggleGreen:[],
			toggleYellow:['k'],
			toggleRedMove:[],
			toggleGreenMove:['n'],
			toggleYellowMove:[],
			buttonRedUp:['c','p','q','h'],
			buttonGreenUp:['a','e','m'],
			buttonYellowUp:['d'],
			buttonRedDown:['g','o'],
			buttonGreenDown:['j','f','b'],
			buttonYellowDown:['i'],
		}
		
		s.callEvent('spawnList',toSpawn,spot);
		
		m.spawnTeleporter(spot.t1,null,'zone',{
			angle:s.newNpc.angle('down'),
		});
		m.spawnTeleporter(spot.t2,function(key){
			s.teleport(key,'lvl4','t1');
			s.callEvent('resetActive',key);
		},'zone',{
			angle:s.newNpc.angle('up'),
		});
	}
});

s.exports(exports);
