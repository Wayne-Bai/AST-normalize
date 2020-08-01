var Equip = require2('Equip'), Main = require2('Main');

/*jslint node: true, undef:true, sub:true, asi:true, funcscope:true*/
/*Go to http://jshint.com/ and copy paste your code to spot syntax errors.*/

var s = loadAPI('v1.0','Qsystem',{
	dailyTask:false,
	showInTab:false,
	showWindowComplete:false,
	inMain:false,
	alwaysActive:true,
	admin:true,
});
var m = s.map; var b = s.boss; var g;

(function(){	//Sprite
	if(typeof SERVER === 'undefined') return;
	s.newSprite("mace","actor/main.png",[-12,12,-3,20],{
		size:2.7,side:[1,2,3,0],hpBar:-17,legs:20,hitBox:s.newSprite.hitBox(-12,12,-3,20),
	},[s.newSprite.anim("move",4,24,32,0.5),s.newSprite.anim("attack",4,24,32,0.5)]);	
	
	/*
	var tmp = {
		body:[205,206,207,208,209,210,211,221,222,223,224,225,325,326,327,328,410,411,412,413,680],
		helm:[
			//120,
			132,133,134,135,136,137,138,139,140,141,15085,15088,15191,15192,15193,15194,15195,15196,15197,15198,15199,15200,15201,15202,15203,15204,15205,168,169,170,171,172,173,174,175,176,177,178,179,
			1389,1507,230,253,254,255,256,257,361,641
		],
		skin:[115,291,432,434],
	};
	for(var i in tmp) for(var j in tmp[i]) 
		s.newSprite.player(tmp[i][j],"player/" + i + '/' + tmp[i][j] + ".png");
	*/
	
	var list = {'warrior-male':6,'warrior-female':5,'villager-male':10,'villager-female':9,'villager-child':6,'fairy':8,'bad-monster':3,'bad-human':5};
	for(var i in list)	for(var j = 0; j < list[i]; j++) 
		s.newSprite.rpgvx(i + j,"actor/" + i + j + ".png");

	s.newSprite("slimeJerome","actor/slimeJerome.png",[-55,55,-15,80],{
		size:1,side:[0,1,2,3],hpBar:-110,legs:70,
	},[s.newSprite.anim("move",5,200,200,0.5)]);	
	s.newSprite("troll","actor/troll.png",[-33,33,-30,64],{
		size:1,side:[0,1,2,3],hpBar:-70,legs:35,
	},[s.newSprite.anim("move",9,128,128,0.5)]);
	s.newSprite("orc-magic","actor/orc-magic.png",[-20,20,-10,25],{
		size:2,side:[2,0,1,3],hpBar:-30,legs:25,
	},[s.newSprite.anim("move",4,32,48,0.25)]);
	s.newSprite("orc-melee","actor/orc-melee.png",[-20,20,-10,25],{
		size:2,side:[2,0,1,3],hpBar:-30,legs:25,
	},[s.newSprite.anim("move",4,32,48,0.25)]);
	s.newSprite("orc-range","actor/orc-range.png",[-20,20,-10,25],{
		size:2,side:[2,0,1,3],hpBar:-30,legs:25,
	},[s.newSprite.anim("move",4,32,48,0.25)]);
	s.newSprite.rpgvx("aquanite","actor/aquanite.png");
	s.newSprite.rpgvx("bat","actor/bat.png");
	s.newSprite.rpgvx("bee","actor/bee.png");
	s.newSprite.rpgvx("demon","actor/demon.png");
	s.newSprite.rpgvx("dragon","actor/dragon.png");
	s.newSprite.rpgvx("dragonBaby","actor/dragonBaby.png");
	s.newSprite.rpgvx("death","actor/death.png");
	s.newSprite.rpgvx("larva","actor/larva.png");
	s.newSprite.rpgvx("gargoyle","actor/gargoyle.png");
	s.newSprite.rpgvx("ghost","actor/ghost.png");
	s.newSprite.rpgvx("goblin","actor/goblin.png");
	s.newSprite.rpgvx("goddessFire","actor/goddessFire.png");
	s.newSprite.rpgvx("goddessIce","actor/goddessIce.png");
	s.newSprite.rpgvx("plant","actor/plant.png");
	s.newSprite.rpgvx("mushroom","actor/mushroom.png");
	s.newSprite.rpgvx("skeleton","actor/skeleton.png");
	s.newSprite.rpgvx("mosquito","actor/mosquito.png");
	s.newSprite.rpgvx("spirit","actor/spirit.png");
	s.newSprite("aquagoblin","actor/aquagoblin.png",[-15,15,-15,32],{
		size:2,side:[2,0,1,3],hpBar:-40,legs:35,
	},[s.newSprite.anim("move",3,48,64,0.5)]);	
	s.newSprite("basilisk","actor/basilisk.png",[-15,15,-15,32],{
		size:1,side:[2,0,1,3],hpBar:-40,legs:35,
	},[s.newSprite.anim("move",3,64,64,0.5)]);	
	s.newSprite("draco","actor/draco.png",[-30,30,-30,40],{
		size:1,side:[2,0,1,3],hpBar:-55,legs:50,
	},[s.newSprite.anim("move",3,96,96,0.5)]);	
	s.newSprite("dragonKing","actor/dragonKing.png",[-30,30,-30,40],{
		size:1,side:[2,0,1,3],hpBar:-55,legs:50,
	},[s.newSprite.anim("move",3,96,96,0.5)]);	
	s.newSprite("scorpion","actor/scorpion.png",[-15,15,-15,20],{
		size:2,side:[2,0,1,3],hpBar:-30,legs:50,
	},[s.newSprite.anim("move",3,64,64,0.5)]);
	s.newSprite("mummy","actor/mummy.png",[-30,30,-20,40],{
		size:1.5,side:[2,0,1,3],hpBar:-40,legs:40,
	},[s.newSprite.anim("move",4,80,80,0.5)]);
	s.newSprite("birdBlue","actor/birdBlue.png",[-30,30,-20,40],{
		size:1,side:[2,0,1,3],hpBar:-50,legs:50,
	},[s.newSprite.anim("move",4,96,96,0.5)]);
	s.newSprite("salamander","actor/salamander.png",[-30,30,-20,30],{
		size:2,side:[2,0,1,3],hpBar:-40,legs:40,
	},[s.newSprite.anim("move",3,64,48,0.25)]);	
	s.newSprite("slime","actor/slime.png",[-20,20,-10,20],{
		size:1.5,side:[2,0,1,3],hpBar:-30,legs:30,
	},[s.newSprite.anim("move",3,48,48,0.5)]);
	s.newSprite("snake","actor/snake.png",[-20,20,-10,20],{
		size:1,side:[2,0,1,3],hpBar:-30,legs:30,
	},[s.newSprite.anim("move",3,48,48,0.5)]);
	s.newSprite("birdRed","actor/birdRed.png",[-40,40,-30,40],{
		size:1,side:[2,0,1,3],hpBar:-50,legs:50,
	},[s.newSprite.anim("move",3,96,96,0.5)]);
	s.newSprite("taurus","actor/taurus.png",[-60,60,-40,60],{
		size:1.5,side:[2,0,1,3],hpBar:-55,legs:50,
	},[s.newSprite.anim("move",3,96,96,0.5)]);
	s.newSprite("werewolf","actor/werewolf.png",[-30,30,-20,30],{
		size:2,side:[2,0,1,3],hpBar:-55,legs:50,
	},[s.newSprite.anim("move",3,64,48,0.5)]);

	s.newSprite.bullet("fireball","bullet/fireball.png",32,32,1,1,{size:0.8});
	s.newSprite.bullet("iceshard","bullet/iceshard.png",32,32,1,1,{size:0.8});
	s.newSprite.bullet("lightningball","bullet/lightningball.png",32,32,1,1,{size:0.8});    	
	s.newSprite.bullet("bullet-pony","bullet/bullet-pony.png",32,32,1,0,{side:[0,1]});
	s.newSprite.bullet("bullet-happyface","bullet/bullet-happyface.png",32,32);
	s.newSprite.bullet("bullet-penguin","bullet/bullet-penguin.png",32,32);
	s.newSprite.bullet("arrow","bullet/arrow.png",42,11,1,1,{size:0.9});
	s.newSprite.bullet("bullet-cannon","bullet/bullet-cannon.png",42,11,1,1);
	s.newSprite.bullet("dart","bullet/dart.png",16,16,1,1,{size:2});
	s.newSprite.bullet("boomerang","bullet/boomerang.png",52,52,8);
	s.newSprite.bullet("bone","bullet/bone.png",48,48,8);
	s.newSprite.bullet("spore","bullet/spore.png",48,48,1,0,{size:0.8});
	s.newSprite.bullet("rock","bullet/rock.png",48,48,1,0,{size:0.8});
	s.newSprite.bullet("shadowball","bullet/shadowball.png",48,48,1,0,{size:0.8,link:'http://mohsin-kun.deviantart.com/art/Shadow-Ball-73303663'});
	s.newSprite.bullet("tornado","bullet/tornado.png",48,48,5,0,{size:0.8});


	for(var i = 0 ; i <= 15; i++)
		s.newSprite.picture("number-" + i,"picture/number" + i + ".png",32,32,2,{legs:-100});	//rename to number-flag
	s.newSprite.picture("number-empty","picture/number-empty.png",32,32,2,{legs:-100});	//rename to number-flag
	s.newSprite.picture("number-flag","picture/number-flag.png",32,32,2,{legs:-100});	//rename to number-flag
	s.newSprite.picture("system-sign","picture/sign.png",32,32,2);
	s.newSprite.picture("system-target","picture/target.png",96,96,0.5);
	s.newSprite.picture("pushable-rock1x1","picture/pushable-rock2x2.png",64,64,0.5);

	s.newSprite.picture("waypoint-grave","picture/waypoint-grave.png",32,32,2);
	s.newSprite.picture("loot-chestOn","picture/loot-chestOn.png",32,32,2);
	s.newSprite.picture("loot-chestOff","picture/loot-chestOff.png",32,32,2);
	s.newSprite.picture("tree-down","picture/tree-down.png",64,80,2,{legs:40});
	s.newSprite.picture("tree-red","picture/tree-red.png",64,80,2,{legs:40});
	s.newSprite.picture("rock-down","picture/rock-down.png",64,64,1.5,{legs:30});
	s.newSprite.picture("rock-bronze","picture/rock-bronze.png",64,64,1.5,{legs:30});
	
	
	s.newSprite.picture("green-down","picture/green-down.png",32,32,2,{legs:-1000});
	s.newSprite.picture("green-up","picture/green-up.png",32,32,2,{legs:30});
	s.newSprite.picture("red-down","picture/red-down.png",32,32,2,{legs:-1000});
	s.newSprite.picture("red-up","picture/red-up.png",32,32,2,{legs:30});
	s.newSprite.picture("yellow-down","picture/yellow-down.png",32,32,2,{legs:-1000});
	s.newSprite.picture("yellow-up","picture/yellow-up.png",32,32,2,{legs:30});

	s.newSprite.picture("toggle-greenOn","picture/toggle-greenOn.png",32,32,2);
	s.newSprite.picture("toggle-greenOff","picture/toggle-greenOff.png",32,32,2);
	s.newSprite.picture("toggle-yellowOn","picture/toggle-yellowOn.png",32,32,2);
	s.newSprite.picture("toggle-yellowOff","picture/toggle-yellowOff.png",32,32,2);
	
	s.newSprite.picture("toggle-greenOn-bronze","picture/toggle-greenOn-bronze.png",32,32,2);
	s.newSprite.picture("toggle-greenOff-bronze","picture/toggle-greenOff-bronze.png",32,32,2);
	s.newSprite.picture("toggle-yellowOn-bronze","picture/toggle-yellowOn-bronze.png",32,32,2);
	s.newSprite.picture("toggle-yellowOff-bronze","picture/toggle-yellowOff-bronze.png",32,32,2);
	
	s.newSprite.picture("toggle-boxOn","picture/toggle-boxOn.png",32,32,2);
	s.newSprite.picture("toggle-boxOff","picture/toggle-boxOff.png",32,32,2);
	s.newSprite.picture("toggle-boxOn-bronze","picture/toggle-boxOn-bronze.png",32,32,2);
	s.newSprite.picture("toggle-boxOff-bronze","picture/toggle-boxOff-bronze.png",32,32,2);
	
	s.newSprite.picture("toggle-redOn","picture/toggle-boxOn.png",32,32,2);
	s.newSprite.picture("toggle-redOff","picture/toggle-boxOff.png",32,32,2);
	s.newSprite.picture("toggle-redOn-bronze","picture/toggle-boxOn-bronze.png",32,32,2);
	s.newSprite.picture("toggle-redOff-bronze","picture/toggle-boxOff-bronze.png",32,32,2);
	
	s.newSprite.picture("toggle-wallOff","picture/toggle-wallOff.png",32,32,2);
	s.newSprite.picture("toggle-wallOn","picture/toggle-wallOn.png",32,32,2);
	
	s.newSprite("hunt-squirrel","actor/squirrel.png",[-12,12,-12,12],{
		size:2,side:[1,2,3,0],link:"http://charas-project.net/resources_download.php?id=15580&file=resources%2FCharasets%2F1%2F10052_1098590341.png",
	},[s.newSprite.anim("move",3,24,24,0.4)]);
	s.newSprite.picture("hunt-down","picture/hunt-down.png",32,64,1.5,{legs:35});

	
	s.newSprite.picture("teleport-door","picture/teleport-door.png",32,48,2,{offsetY:-16});
	s.newSprite.picture("teleport-cave","picture/teleport-cave.png",128,102,1,{offsetY:-32});
	
	s.newSprite.picture("teleport-zone","picture/teleport-zone.png",32,32,1.5,{legs:-1000,side:[0,1,2,3]});
	s.newSprite.picture("teleport-zoneLight","picture/teleport-zoneLight.png",32,32,1.5,{legs:-1000,side:[0,1,2,3]});
	s.newSprite.picture("teleport-underground","picture/teleport-underground.png",32,32,2.5);
	s.newSprite.picture("teleport-well","picture/teleport-well.png",48,48,2);
		
	s.newSprite.picture("block-rock1x1","picture/block-rock2x2.png",63,63,0.5);	//size and bumperbox not same
	s.newSprite.picture("block-barrier","picture/block-barrier.png",127,64,1,{hpBar:-40});	//size and bumperbox not same
			
	s.newSprite.picture("block-spike","picture/block-spike1x1.png",16,32,2,{showBorder:false});
	s.newSprite.picture("block-spike1x1","picture/block-spike1x1.png",16,32,2,{showBorder:false});
	s.newSprite.picture("block-spike1x3","picture/block-spike1x3.png",16,64,2,{showBorder:false,offsetY:16});
	s.newSprite.picture("block-spike1x5","picture/block-spike1x5.png",16,96,2,{showBorder:false,offsetY:32});
	s.newSprite.picture("block-spike1x9","picture/block-spike1x9.png",16,160,2,{showBorder:false,offsetY:64});	
	
	s.newSprite.picture("block-spike3x1","picture/block-spike3x1.png",48,32,2,{showBorder:false,offsetX:16});
	s.newSprite.picture("block-spike5x1","picture/block-spike5x1.png",80,32,2,{showBorder:false,offsetX:32});
	s.newSprite.picture("block-spike9x1","picture/block-spike9x1.png",144,32,2,{showBorder:false,offsetX:64});

	s.newSprite.picture("block-bridgeH","picture/block-bridgeH.png",32,32,2,{legs:-50});
	s.newSprite.picture("block-bridgeV","picture/block-bridgeV.png",32,32,2,{legs:-50});
	s.newSprite.picture("invisible","picture/invisible.png",32,32);
	s.newSprite.picture("loot-flowerOn","picture/loot-flowerOn.png",32,32,4);
	s.newSprite.picture("loot-flowerOff","picture/loot-flowerOff.png",32,32,4);

	s.newSprite.picture("tower-green","picture/tower-green.png",64,64);
	s.newSprite.picture("tower-yellow","picture/tower-yellow.png",64,64);
	s.newSprite.picture("tower-red","picture/tower-red.png",64,64);
	s.newSprite.picture("tower-blue","picture/tower-blue.png",64,64);
	s.newSprite.picture("tower-enemy","picture/tower-enemy.png",32,32,2);
})();

//{ General Item
s.newItem('bugged-drop','I AM ERR0R','system.square');
s.newItem('test','Test','system.square');

s.newItem('orb-removal','Orb of Removal','orb.removal',[
	s.newItem.option(function(key){
		Main.reputation.addRemovePt(Main.get(key),1);
		Main.removeItem(Main.get(key),'Qsystem-orb-removal',1);
	},"Use","Get a Reputation Remove Point.")
],null,{destroy:1,trade:1});


//}

//{ Equip
s.newEquip('unarmed','weapon','mace','Mace',1);
s.newEquip('start-body','body','metal','Body',1,[ //{
	s.newEquip.boost('hp-regen',0.05,'*'),
],{ //}
	upgradable:true,
	maxAmount:2,
	upgradeInfo:Equip.UpgradeInfo(1000,Equip.UpgradeInfo.item([['Qsystem-wood-0',1]])),
});
s.newEquip('start-helm','helm','wood','Helm',1,[ //{
	s.newEquip.boost('def-melee-+',0.05,'*'),
],{ //}
	upgradable:true,
	maxAmount:2,
	upgradeInfo:Equip.UpgradeInfo(1000,Equip.UpgradeInfo.item([['Qsystem-wood-0',1]])),
});
s.newEquip('start-amulet','amulet','ruby','Amulet',1,[ //{
	s.newEquip.boost('maxSpd',0.05,'*'),
],{ //}
	upgradable:true,
	maxAmount:2,
	upgradeInfo:Equip.UpgradeInfo(1000,Equip.UpgradeInfo.item([['Qsystem-wood-0',1]])),
});
s.newEquip('start-ring','ring','sapphire','Ring',1,[ //{
	s.newEquip.boost('magicFind-quantity',0.15,'*'),
],{ //}
	upgradable:true,
	maxAmount:2,
	upgradeInfo:Equip.UpgradeInfo(1000,Equip.UpgradeInfo.item([['Qsystem-wood-0',1]])),
});
s.newEquip('start-weapon','weapon','mace','Mace',1,[ //{
	s.newEquip.boost('dmg-melee-+',0.15,'*'),
],{ //}
	upgradable:true,
	maxAmount:2,
	upgradeInfo:Equip.UpgradeInfo(1000,Equip.UpgradeInfo.item([['Qsystem-wood-0',1]])),
});

s.newEquip('start-bow','weapon','bow','Bow',1,[ //{
	s.newEquip.boost('dmg-range-+',0.15,'*'),
],{ //}
	upgradable:true,
	maxAmount:2,
	upgradeInfo:Equip.UpgradeInfo(1000,Equip.UpgradeInfo.item([['Qsystem-wood-0',1]])),
});
s.newEquip('start-staff','weapon','staff','Staff',1,[
	s.newEquip.boost('dmg-magic-+',0.15,'*'),	
],{ //}
	upgradable:true,
	maxAmount:2,
	upgradeInfo:Equip.UpgradeInfo(1000,Equip.UpgradeInfo.item([['Qsystem-wood-0',1]])),
});

//}

//{ Ability

//####################################



s.newAbility('boost','boost',{},{});
s.newAbility('attack','attack',{},{type:'bullet'});
s.newAbility('idle','idle',{},{});
s.newAbility('summon','summon',{},{});
s.newAbility('event','event',{},{});
s.newAbility('heal','heal',{},{});
s.newAbility('dodge','dodge',{},{});

s.newAbility('start-melee','attack',{
	name:'Strike',icon:'attackMelee.cube',
	description:'Regular Melee Strike',
	periodOwn:10,periodGlobal:10,
},{
	type:"strike",width:80,height:80,delay:0,
	initPosition:s.newAbility.initPosition(0,50),
	preDelayAnim:s.newAbility.anim("slashMelee",1,false),
	hitAnim:s.newAbility.anim("slashMelee",0.01),	//for sfx
	dmg:s.newAbility.dmg(500,'melee'),
	knock:s.newAbility.status(1,3,0.1),
});
s.newAbility('start-bullet','attack',{
	name:'Basic Bullet',icon:'attackRange.steady',
	description:'Very fast arrow shooting.',
	periodOwn:10,periodGlobal:10,
},{
	type:"bullet",
	amount:3,angleRange:5,
	sprite:s.newAbility.sprite("arrow",1),
	hitAnim:s.newAbility.anim("arrowHit",0.5),
	dmg:s.newAbility.dmg(100,'range'),	
});
s.newAbility('player-magicBullet','attack',{
	name:'Magic Bullet',icon:'attackMagic.ball',
	description:'Powerful magic spell with increased chance to drain mana.',
	periodOwn:12,periodGlobal:12,
},{
	type:"bullet",
	sprite:s.newAbility.sprite("shadowball",1),
	hitAnim:s.newAbility.anim("lightningHit",0.5),
	dmg:s.newAbility.dmg(300,'magic'),
	drain:s.newAbility.status(0.25,1,1),
});
s.newAbility('player-fireBullet','attack',{
	name:'Fire Ball',icon:'attackMagic.meteor',
	description:'Shoot a single fireball that explodes upon hit.',
	periodOwn:20,periodGlobal:20,
},{
	type:"bullet",
	sprite:s.newAbility.sprite("fireball",1),
	hitAnim:s.newAbility.anim("fireHit",0.5),
	dmg:s.newAbility.dmg(400,'fire'),
	onHit:s.newAbility.onHit(1,{
		type:"strike",width:200,height:200,delay:0,
		preDelayAnim:s.newAbility.anim("fireBomb",1),
		dmg:s.newAbility.dmg(100,'fire'),
	}),
});
s.newAbility('player-coldBullet','attack',{
	name:'Ice Shards',icon:'attackMagic.crystal',
	description:'Shoot multiple ice shards.',
	periodOwn:20,periodGlobal:20,
},{
	type:"bullet",angleRange:5,amount:2,
	sprite:s.newAbility.sprite("iceshard",1),
	hitAnim:s.newAbility.anim("coldHit",0.5),
	dmg:s.newAbility.dmg(300,'cold'),
});
s.newAbility('player-lightningBullet','attack',{
	name:'Lightning Bullet',icon:'attackMagic.static',
	description:'Shoot piercing lightning balls at the speed of light.',
	periodOwn:3,periodGlobal:3,
},{
	type:"bullet",
	sprite:s.newAbility.sprite("lightningball",0.7),
	hitAnim:s.newAbility.anim("lightningHit",0.5),
	dmg:s.newAbility.dmg(125,'lightning'),
	pierce:s.newAbility.pierce(0.5,0.5,5),
});

s.newAbility('player-meleeBig','attack',{
	name:'Bleeding Blow',icon:'attackMelee.cube',
	description:'Powerful Melee Strike with increased bleed chance. Cost life.',
	periodOwn:20,periodGlobal:20,costHp:100,
},{
	type:"strike",width:80,height:80,delay:0,
	initPosition:s.newAbility.initPosition(0,50),
	preDelayAnim:s.newAbility.anim("slashMelee",1),
	hitAnim:s.newAbility.anim("strikeHit",0.2),
	dmg:s.newAbility.dmg(700,'melee'),
	knock:s.newAbility.status(1,3,0.1),
	bleed:s.newAbility.status(0.25,1,1),
});
s.newAbility('player-windKnock','attack',{
	name:'Wind',icon:'attackRange.steady',
	description:'Defensive wind that pushes enemies away.',
	periodOwn:20,periodGlobal:20,costMana:50,
},{
	type:"bullet",angleRange:30,amount:3,
	sprite:s.newAbility.sprite("tornado",1),
	hitAnim:s.newAbility.anim("strikeHit",0.5),
	dmg:s.newAbility.dmg(200,'range'),
	knock:s.newAbility.status(1,1.5,1.5),
});
s.newAbility('player-magicBomb','attack',{
	name:'Magic Explosion',icon:'attackMagic.ball',
	description:'Explosive spell that can leech life.',
	periodOwn:20,periodGlobal:20,costMana:75,
},{
	type:"strike",width:200,height:200,delay:4,
	initPosition:s.newAbility.initPosition(0,200),
	preDelayAnim:s.newAbility.anim("magicBomb",1),
	hitAnim:s.newAbility.anim("lightningHit",0.5),
	dmg:s.newAbility.dmg(1200,'magic'),
	leech:s.newAbility.status(0.25,1,1),
});
s.newAbility('start-fireball','attack',{
	name:'Fireball Boom',icon:'attackMagic.meteor',
	description:'Shoot multiple fireballs.',
	periodOwn:20,periodGlobal:20,costMana:50,
},{
	type:"bullet",angleRange:35,amount:7,
	sprite:s.newAbility.sprite("fireball",1.2),
	hitAnim:s.newAbility.anim("fireHit",0.5),
	dmg:s.newAbility.dmg(150,'fire'),
});
s.newAbility('start-freeze','attack',{
	name:'Freeze Bullet',icon:'attackMagic.crystal',
	description:'Defensive spell that feezes enemies.',
	periodOwn:25,periodGlobal:25,costMana:40,
},{
	type:"bullet",angleRange:25,amount:5,
	sprite:s.newAbility.sprite("iceshard",1),
	hitAnim:s.newAbility.anim("coldHit",0.5),
	dmg:s.newAbility.dmg(200,'cold'),
	chill:s.newAbility.status(0.5,4,1),
});
s.newAbility('player-lightningBomb','attack',{
	name:'Lightning Explosion',icon:'attackMagic.static',
	description:'Explodes in all directions, piercing through enemies.',
	periodOwn:20,periodGlobal:20,costMana:75,
},{
	type:"strike",width:100,height:100,delay:5,
	initPosition:s.newAbility.initPosition(100,150),
	preDelayAnim:s.newAbility.anim("lightningBomb",1),
	dmg:s.newAbility.dmg(400,'lightning'),
	onDamagePhase:s.newAbility.onDamagePhase(1,{
		type:"bullet",angleRange:360,amount:5,
		sprite:s.newAbility.sprite("lightningball",0.8),
		hitAnim:s.newAbility.anim("lightningHit",0.5),
		dmg:s.newAbility.dmg(200,'lightning'),
		pierce:s.newAbility.pierce(1,0.5,5),
	}),
});

s.newAbility('start-heal','heal',{
	name:'Heal',
	description:'Standard healing.',
	periodOwn:250,periodGlobal:50,costMana:30,
},{
	hp:800,
});
s.newAbility('player-healFast','heal',{
	name:'Fast Regen',
	description:'Faster but less powerful healing.',
	periodOwn:100,periodGlobal:50,costMana:30,
},{
	hp:400,
});
s.newAbility('player-healCost','heal',{
	name:'Expensive Regen',
	description:'Mana-expensive but great healing.',
	periodOwn:150,periodGlobal:50,costMana:100,
},{
	hp:1000,
});
s.newAbility('player-healSlowCast','heal',{
	name:'Slow Cast Regen',
	description:'Slow to cast but free healing.',
	periodOwn:150,periodGlobal:50,costMana:0,
},{
	hp:800,
});

s.newAbility('healZone','attack',{
	name:'Heal Zone',icon:'heal.plus',
	periodOwn:50,periodGlobal:50,
},{
	type:"strike",width:400,height:400,delay:0,
	initPosition:s.newAbility.initPosition(0,0),
	postDelayAnim:s.newAbility.anim("aura",2),
	dmg:s.newAbility.dmg(0,'lightning'),
	damageIfMod:1,
	onHitHeal:s.newAbility.onHitHeal(200),
});

s.newAbility('start-dodge','dodge',{
	name:'Invincibility',
	description:'Dodge all damage.',
	bypassGlobalCooldown:true,periodOwn:25,periodGlobal:25,costMana:30,
},{
	time:4,
	distance:200,
});
s.newAbility('player-dodgeFast','dodge',{
	name:'Fast Dodge',
	description:'Faster dodge but more mana-expensive.',
	bypassGlobalCooldown:true,periodOwn:25,periodGlobal:25,costMana:75,
},{
	time:6,
	distance:300,
});
s.newAbility('player-dodgeLife','dodge',{
	name:'Life Dodge',
	description:'Cost Life instead of mana. Invincibility lasts longer.',
	bypassGlobalCooldown:true,periodOwn:25,periodGlobal:25,costHp:100,
},{
	time:6,
	distance:300,
});

s.newAbility('superNiceLooking','attack',{
	name:'Basic Bullet',icon:'attackRange.steady',
	description:'Very fast arrow shooting.',
	periodOwn:10,periodGlobal:10,
},{
	type:"bullet",
	amount:1,angleRange:5,
	sprite:s.newAbility.sprite("fireball",1.5),
	hitAnim:s.newAbility.anim("strikeHit",0.5),
	dmg:s.newAbility.dmg(300,'fire'),
	spd:2,
	onMove:s.newAbility.onMove(2,3,{
		sprite:s.newAbility.sprite("fireball",1),
		type:"bullet",
		amount:8,
		spd:5,
		angleRange:360,	
		dmg:s.newAbility.dmg(300,'fire'),
	}),
});



s.newAbility('meleeBullet','attack',{
	name:'Bone Throw',icon:'weapon.boomerang',
	periodOwn:25,periodGlobal:25,
	//spriteFilter:s.newAbility.spriteFilter('green',5),delay:5,
},{
	type:"bullet",
	sprite:s.newAbility.sprite("bone",1),
	hitAnim:s.newAbility.anim("strikeHit",0.5),
	dmg:s.newAbility.dmg(150,'melee'),
});
s.newAbility('rangeBullet','attack',{
	name:'Rock Throw',icon:'offensive.bullet',
	periodOwn:25,periodGlobal:25,
	//spriteFilter:s.newAbility.spriteFilter('green',5),delay:5,
},{
	type:"bullet",
	sprite:s.newAbility.sprite("rock",1),
	hitAnim:s.newAbility.anim("earthBomb",0.4),
	dmg:s.newAbility.dmg(150,'range'),
});
s.newAbility('magicBullet','attack',{
	name:'Magic Bullet',icon:'resource.dodge',
	periodOwn:25,periodGlobal:25,
	//spriteFilter:s.newAbility.spriteFilter('green',5),delay:5,
},{
	type:"bullet",
	sprite:s.newAbility.sprite("shadowball",1),
	hitAnim:s.newAbility.anim("lightningHit",0.5),
	dmg:s.newAbility.dmg(150,'magic'),
});
s.newAbility('fireBullet','attack',{
	name:'Fire Bullet',icon:'attackMagic.fireball',
	periodOwn:25,periodGlobal:25,
	//spriteFilter:s.newAbility.spriteFilter('green',5),delay:5,
},{
	type:"bullet",
	sprite:s.newAbility.sprite("fireball",1.2),
	hitAnim:s.newAbility.anim("fireHit",0.5),
	dmg:s.newAbility.dmg(150,'fire'),
});
s.newAbility('coldBullet','attack',{
	name:'Cold Bullet',icon:'attackMagic.crystal',
	periodOwn:25,periodGlobal:25,
	//spriteFilter:s.newAbility.spriteFilter('green',5),delay:5,
},{
	type:"bullet",
	sprite:s.newAbility.sprite("iceshard",1),
	hitAnim:s.newAbility.anim("coldHit",0.5),
	dmg:s.newAbility.dmg(150,'cold'),
});
s.newAbility('lightningBullet','attack',{
	name:'Lightning Bullet',icon:'attackMagic.static',
	periodOwn:25,periodGlobal:25,
	//spriteFilter:s.newAbility.spriteFilter('green',5),delay:5,
},{
	type:"bullet",
	sprite:s.newAbility.sprite("lightningball",1),
	hitAnim:s.newAbility.anim("lightningHit",0.5),
	dmg:s.newAbility.dmg(150,'lightning'),
});
		
s.newAbility('meleeBomb','attack',{
	name:'Ground Break',icon:'system1.less',
	periodOwn:50,periodGlobal:50,
	spriteFilter:s.newAbility.spriteFilter('green',5),delay:5,
},{
	type:"strike",width:100,height:100,delay:5,
	initPosition:s.newAbility.initPosition(0,200),
	preDelayAnim:s.newAbility.anim("boostWhite",1),
	dmg:s.newAbility.dmg(250,'melee'),
});
s.newAbility('rangeBomb','attack',{
	name:'Tornado',icon:'misc.disync',
	periodOwn:50,periodGlobal:50,
	spriteFilter:s.newAbility.spriteFilter('green',5),delay:5,
},{
	type:"strike",width:100,height:100,delay:5,
	initPosition:s.newAbility.initPosition(0,200),
	preDelayAnim:s.newAbility.anim("rangeBomb",1),
	dmg:s.newAbility.dmg(250,'range'),
});
s.newAbility('magicBomb','attack',{
	name:'Magic Explosion',icon:'attackMagic.fireball',
	periodOwn:50,periodGlobal:50,
	spriteFilter:s.newAbility.spriteFilter('green',5),delay:5,
},{
	type:"strike",width:100,height:100,delay:5,
	initPosition:s.newAbility.initPosition(0,200),
	preDelayAnim:s.newAbility.anim("magicBomb",1),
	dmg:s.newAbility.dmg(250,'magic'),
});
s.newAbility('fireBomb','attack',{
	name:'Fire Explosion',icon:'attackMagic.fireball',
	periodOwn:50,periodGlobal:50,
	spriteFilter:s.newAbility.spriteFilter('green',5),delay:5,
},{
	type:"strike",width:100,height:100,delay:5,
	initPosition:s.newAbility.initPosition(0,200),
	preDelayAnim:s.newAbility.anim("fireBomb",0.6),
	dmg:s.newAbility.dmg(250,'fire'),
});

s.newAbility('coldBomb','attack',{
	name:'Cold Explosion',icon:'attackMagic.crystal',
	periodOwn:50,periodGlobal:50,
	spriteFilter:s.newAbility.spriteFilter('green',5),delay:5,
},{
	type:"strike",width:100,height:100,delay:5,
	initPosition:s.newAbility.initPosition(0,200),
	preDelayAnim:s.newAbility.anim("coldBomb",1),
	dmg:s.newAbility.dmg(250,'cold'),
});	
s.newAbility('lightningBomb','attack',{
	name:'Lightning Explosion',icon:'attackMagic.static',
	periodOwn:50,periodGlobal:50,
	spriteFilter:s.newAbility.spriteFilter('green',5),delay:5,
},{
	type:"strike",width:100,height:100,delay:5,
	initPosition:s.newAbility.initPosition(0,200),
	preDelayAnim:s.newAbility.anim("lightningBomb",1),
	dmg:s.newAbility.dmg(250,'lightning'),
});	
	
s.newAbility('fireNova','attack',{
	name:'Fire Nova',icon:'attackMagic.fireball',
	periodOwn:50,periodGlobal:50,
	spriteFilter:s.newAbility.spriteFilter('blue',5),delay:5,
},{
	type:"bullet",
	sprite:s.newAbility.sprite("fireball",1),
	hitAnim:s.newAbility.anim("fireHit",0.5),
	dmg:s.newAbility.dmg(150,'fire'),
	spd:4,
	onMove:s.newAbility.onMove(1,3,{
		type:"bullet",
		sprite:s.newAbility.sprite("fireball",0.5),
		hitAnim:s.newAbility.anim("fireHit",0.3),
		dmg:s.newAbility.dmg(25,'fire'),
	}),
});
s.newAbility('coldNova','attack',{
	name:'Cold Nova',icon:'attackMagic.crystal',
	periodOwn:50,periodGlobal:50,
	spriteFilter:s.newAbility.spriteFilter('blue',5),delay:5,
},{
	type:"bullet",
	sprite:s.newAbility.sprite("iceshard",1),
	hitAnim:s.newAbility.anim("coldHit",0.5),
	dmg:s.newAbility.dmg(150,'cold'),
	spd:4,
	maxTimer:80,
	onMove:s.newAbility.onMove(4,3,{
		type:"bullet",angleRange:360,amount:4,
		sprite:s.newAbility.sprite("iceshard",0.5),
		hitAnim:s.newAbility.anim("coldHit",0.3),
		dmg:s.newAbility.dmg(25,'cold'),
		maxTimer:10,
	}),
});
s.newAbility('lightningNova','attack',{
	name:'Lightning Nova',icon:'attackMagic.fireball',
	periodOwn:50,periodGlobal:50,
	spriteFilter:s.newAbility.spriteFilter('blue',5),delay:5,
},{
	type:"bullet",
	sprite:s.newAbility.sprite("lightningball",1),
	hitAnim:s.newAbility.anim("lightningHit",0.5),
	dmg:s.newAbility.dmg(150,'lightning'),
	maxTimer:80,
	onMove:s.newAbility.onMove(6,0,{
		type:"strike",width:150,height:150,delay:0,
		initPosition:s.newAbility.initPosition(0,0),
		postDelayAnim:s.newAbility.anim("lightningHit",0.5),
		hitAnim:s.newAbility.anim("lightningHit",0.25),
		dmg:s.newAbility.dmg(200,'lightning'),
	}),
});

s.newAbility('scratch','attack',{
	name:'Scratch',icon:'attackMelee.scar',
	periodOwn:25,periodGlobal:25,
	spriteFilter:s.newAbility.spriteFilter('red',5),delay:10,
},{
	type:"strike",width:100,height:100,
	initPosition:s.newAbility.initPosition(0,50),
	preDelayAnim:s.newAbility.anim("scratch",0.5),
	dmg:s.newAbility.dmg(150,'melee'),
});
s.newAbility('scratchBig','attack',{
	name:'Multi Scratch',icon:'attackMelee.scar',
	periodOwn:50,periodGlobal:50,
	spriteFilter:s.newAbility.spriteFilter('red',5),delay:10,
},{
	type:"strike",width:100,height:100,
	initPosition:s.newAbility.initPosition(0,50),
	preDelayAnim:s.newAbility.anim("scratch2",0.5),
	hitAnim:s.newAbility.anim("strikeHit",0.25),
	dmg:s.newAbility.dmg(200,'melee'),
});	
s.newAbility('arrowBullet','attack',{
	name:'Arrow',icon:'skill.range',
	periodOwn:25,periodGlobal:25,
	spriteFilter:s.newAbility.spriteFilter('green',5),delay:5,
},{
	type:"bullet",
	sprite:s.newAbility.sprite("arrow",1),
	hitAnim:s.newAbility.anim("arrowHit",0.5),
	dmg:s.newAbility.dmg(150,'range'),
});
s.newAbility('dart','attack',{
	name:'Dart',icon:'attackRange.head',
	periodOwn:25,periodGlobal:25,
	spriteFilter:s.newAbility.spriteFilter('green',5),delay:5,
},{
	type:"bullet",
	sprite:s.newAbility.sprite("dart",1),
	hitAnim:s.newAbility.anim("strikeHit",0.5),
	dmg:s.newAbility.dmg(150,'range'),
});	
s.newAbility('windBullet','attack',{
	name:'Wind',icon:'attackRange.head',
	periodOwn:25,periodGlobal:25,
	spriteFilter:s.newAbility.spriteFilter('green',5),delay:5,
},{
	type:"bullet",
	sprite:s.newAbility.sprite("tornado",1),
	hitAnim:s.newAbility.anim("strikeHit",0.5),
	dmg:s.newAbility.dmg(150,'range'),
});

s.newAbility('bind','attack',{
	name:'Binding',icon:'curse.stumble',
	periodOwn:50,periodGlobal:50,
	spriteFilter:s.newAbility.spriteFilter('red',5),delay:10,
},{
	type:"strike",width:50,height:50,delay:5,
	initPosition:s.newAbility.initPosition(0,100),
	preDelayAnim:s.newAbility.anim("bind",1),
	hitAnim:s.newAbility.anim("bind",0.25),
	dmg:s.newAbility.dmg(150,'cold'),
	chill:s.newAbility.status(1,1,1),
});
s.newAbility('mine','attack',{
	name:'Mine',icon:'attackRange.head',
	periodOwn:25,periodGlobal:25,
},{
	type:"bullet",
	spd:0,
	maxTimer:250,
	sprite:s.newAbility.sprite("dart",1),
	hitAnim:s.newAbility.anim("curseGreen",0.5),
	dmg:s.newAbility.dmg(150,'magic'),
});
s.newAbility('boomerang','attack',{
	name:'Boomerang',icon:'weapon.boomerang',
	periodOwn:25,periodGlobal:25,
	spriteFilter:s.newAbility.spriteFilter('green',5),delay:5,
},{
	type:"bullet",
	maxTimer:250,
	sprite:s.newAbility.sprite("bone",1),
	hitAnim:s.newAbility.anim("strikeHit",0.5),
	dmg:s.newAbility.dmg(150,'melee'),
	boomerang:s.newAbility.boomerang(1,1,1,1),
	pierce:s.newAbility.pierce(1,0.8,5),
});
s.newAbility('boneBoomerang','attack',{
	name:'Bone Boomerang',icon:'attackMagic.fireball',
	periodOwn:25,periodGlobal:25,
	spriteFilter:s.newAbility.spriteFilter('green',5),delay:5,
},{
	type:"bullet",
	maxTimer:250,
	sprite:s.newAbility.sprite("bone",1),
	hitAnim:s.newAbility.anim("strikeHit",0.5),
	dmg:s.newAbility.dmg(150,'melee'),
	boomerang:s.newAbility.boomerang(1,1,1,1),
	pierce:s.newAbility.pierce(1,0.8,5),
});

s.newAbility('healModel','heal',{
	name:'Regen',
	description:'Standard healing.',
	periodOwn:250,periodGlobal:50,
},{
	hp:800,
});




//}

//{ NPC needs to be after s.newAbility so can use their templates
s.newNpc("player",{
	type:"player",
	damageIf:'npc',
	awareNpc:1,
	alwaysActive:1,
	minimapIcon:'color.yellow',
	party:'bugged',
	pickRadius:250,
	friction:CST.FRICTION,
});

s.newNpc("bat",{
	name:"Bat",
	sprite:s.newNpc.sprite("bat"),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability(s.newAbility(null,'scratch',{},{
			leech:s.newAbility.status(0.25,25,1),
			hitAnim:s.newAbility.anim('cursePink',1),
		}),[0.2,0,0]),
		s.newNpc.abilityAi.ability('scratch',[0.4,0,0]),
		s.newNpc.abilityAi.ability('lightningBullet',[0.4,0.4,1]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'boost',{},{
			boost:[
				s.newBoost('leech-chance',1000,50,'+'),
				s.newBoost('crit-chance',1000,50,'+'),
			],
		}),[0,0.1,0.2]),
		s.newNpc.abilityAi.ability('idle',[0.4,0.4,1]),
	]),
	mastery:s.newNpc.mastery([2,1,1,1,0.5,1]),
	maxSpd:s.newNpc.maxSpd(2),
	moveRange:s.newNpc.moveRange(0.5,1),	
});
s.newNpc("bee",{
	name:"Bee",
	sprite:s.newNpc.sprite("bee"),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability('scratch',[0.2,0,0]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'scratchBig',{},{
			dmg:s.newAbility.dmg(400,'melee'),delay:10,
		}),[0,0,0]),	//onDeath
		s.newNpc.abilityAi.ability(s.newAbility(null,'dart',{},{
			burn:s.newAbility.status(0.5,1,1),
		}),[0,0.2,0.4]),
		s.newNpc.abilityAi.ability('idle',[0.4,0.4,1]),
	]),
	mastery:s.newNpc.mastery([1,1,2,0.5,1,1]),
	moveRange:s.newNpc.moveRange(0.5,1),
});
s.newNpc("mosquito",{
	name:"Mosquito",
	sprite:s.newNpc.sprite("mosquito"),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability(s.newAbility(null,'dart',{},{
			knock:s.newAbility.status(0.25,1,1),
		}),[1,0.2,0.4]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'lightningBullet',{},{
			amount:3,angleRange:30,
			knock:s.newAbility.status(0.25,1,1),
			sin:s.newAbility.sin(1,1),
		}),[1,0.2,0.4]),
		s.newNpc.abilityAi.ability('idle',[0.4,0.2,0.2]),		
	]),
	mastery:s.newNpc.mastery([1,1,1,1,2,0.5]),
	maxSpd:s.newNpc.maxSpd(2),
	moveRange:s.newNpc.moveRange(2.5,1.5),
});
s.newNpc("mushroom",{
	name:"Mushroom",
	sprite:s.newNpc.sprite("mushroom"),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability(s.newAbility(null,'magicBullet',{},{
			spd:0.1,
			maxTimer:250,
			stun:s.newAbility.status(1,1,1),
			dmg:s.newAbility.dmg(200,'magic'),
			sprite:s.newAbility.sprite('spore',1),
		}),[1,1,1]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'magicBullet',{},{
			stun:s.newAbility.status(0.5,1,1),
			sprite:s.newAbility.sprite('spore',1),
			angleRange:360,amount:5,
		}),[0.5,0.3,0.3]),
		s.newNpc.abilityAi.ability('idle',[0.4,0.2,0.2]),	
	]),
	mastery:s.newNpc.mastery([1,1,2,0.5,1,1]),
	maxSpd:s.newNpc.maxSpd(2),
	moveRange:s.newNpc.moveRange(1,1),
});
s.newNpc("larva",{
	name:"Larva",
	sprite:s.newNpc.sprite("larva"),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability(s.newAbility(null,'fireBomb',{},{
			initPosition:s.newAbility.initPosition(0,50),
			dmg:s.newAbility.dmg(500,'fire'),
		}),[0.1,0.1,0.1]),
		s.newNpc.abilityAi.ability('idle',[0.9,0.9,0.9]),	
	]),
	mastery:s.newNpc.mastery([1,1,1,1,1,1]),
	maxSpd:s.newNpc.maxSpd(0.5),
	hp:10,
	moveRange:s.newNpc.moveRange(0.1,1),
});
s.newNpc("plant",{
	name:"Plant",
	sprite:s.newNpc.sprite("plant"),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability(s.newAbility(null,'scratchBig',{},{
			dmg:s.newAbility.dmg(300,'melee'),
			bleed:s.newAbility.status(1,1,1),
		}),[0.2,1,1]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'dart',{},{
			amount:5,angleRange:25,
			dmg:s.newAbility.dmg(100,'range'),
			bleed:s.newAbility.status(0.2,1,1),
			chill:s.newAbility.status(0.4,1,1),
			parabole:s.newAbility.parabole(1,1,1,1),
			curse:s.newAbility.curse(1,[
				s.newBoost('globalDmg',0.5,50),
				s.newBoost('maxSpd',0.25,50),
			]),
		}),[0.4,0.2,0.2]),
		s.newNpc.abilityAi.ability('idle',[0.2,0.2,0.2]),	
	]),
	mastery:s.newNpc.mastery([1,1,2,0.5,1,1]),
	maxSpd:s.newNpc.maxSpd(0.5),
	moveRange:s.newNpc.moveRange(0.1,1),
});
s.newNpc("slime",{
	name:"Slime",
	sprite:s.newNpc.sprite("slime"),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability(s.newAbility(null,'summon',{},{
			maxChild:5,
			time:20*25,
			distance:500,
			model:s.newAbility.model("slime-child"),
			amount:1,
		}),[0.4,0.4,0.4]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'coldBullet',{},{
			dmg:s.newAbility.dmg(100,'cold'),
			chill:s.newAbility.status(0.2,1,1),
			amount:5,angleRange:25,
		}),[0.2,0.4,0.4]),
		s.newNpc.abilityAi.ability('healZone',[0.1,0.1,0.2]),
		s.newNpc.abilityAi.ability('idle',[0.4,0.2,0.2]),	
	]),
	mastery:s.newNpc.mastery([1,1,0.5,2,1,1]),
	moveRange:s.newNpc.moveRange(1,1),	
}); 
s.newNpc("slime-child",{
	name:"Small Slime",
	sprite:s.newNpc.sprite("slime",0.5),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability(s.newAbility(null,'coldBullet',{},{
			dmg:s.newAbility.dmg(25,'cold'),
			sprite:s.newAbility.sprite('iceshard',0.5),
		}),[1,1,1]),
		s.newNpc.abilityAi.ability('idle',[0.2,0.2,0.2]),
	]),
	mastery:s.newNpc.mastery([1,1,0.5,2,1,1]),
	hp:100,
	moveRange:s.newNpc.moveRange(0.1,1),
});
s.newNpc("salamander",{
	name:"Salamander",
	sprite:s.newNpc.sprite("salamander"),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability(s.newAbility(null,'fireBullet',{},{
			dmg:s.newAbility.dmg(10,'fire'),
			burn:s.newAbility.status(1,5,1),
		}),[1,1,1]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'coldBullet',{},{
			dmg:s.newAbility.dmg(10,'cold'),
			chill:s.newAbility.status(1,1,1),
		}),[1,1,1]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'lightningBullet',{},{
			dmg:s.newAbility.dmg(10,'lightning'),
			stun:s.newAbility.status(1,1,1),
		}),[1,1,1]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'meleeBullet',{},{
			dmg:s.newAbility.dmg(10,'melee'),
			bleed:s.newAbility.status(1,5,1),
		}),[1,1,1]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'magicBullet',{},{
			dmg:s.newAbility.dmg(10,'magic'),
			drain:s.newAbility.status(1,5,1),
		}),[1,1,1]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'rangeBullet',{},{
			dmg:s.newAbility.dmg(10,'range'),
			knock:s.newAbility.status(1,1,1),
		}),[4,1,1]),
		s.newNpc.abilityAi.ability('idle',[4,4,4]),
	]),
	mastery:s.newNpc.mastery([0.5,1,2,1,1,1]),
	moveRange:s.newNpc.moveRange(1.5,1),
});
s.newNpc("goblin-melee",{
	name:"Goblin",
	sprite:s.newNpc.sprite("goblin"),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability(s.newAbility(null,'scratch',{},{
			postDelayAnim:s.newAbility.anim("slashMelee",0.5),
		}),[1,0,0]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'scratchBig',{},{
			bleed:s.newAbility.status(1,2,1),
		}),[1,0,0]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'rangeBullet',{},{
			stun:s.newAbility.status(0.25,1,1),
		}),[0,0,1]),
		s.newNpc.abilityAi.ability('idle',[1,1,1]),
	]),
	mastery:s.newNpc.mastery([1,2,0.5,1,1,1]),
	moveRange:s.newNpc.moveRange(0.5,1),
});
s.newNpc("goblin-range",{
	name:"Goblin",
	sprite:s.newNpc.sprite("goblin"),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability(s.newAbility(null,'arrowBullet',{},{
			angleRange:10,amount:3,aim:25,
		}),[0,0.5,0.5]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'scratchBig',{},{
			knock:s.newAbility.status(1,2,1),
		}),[0,0,1]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'rangeBullet',{},{
			amount:5,angleRange:45,
			parabole:s.newAbility.parabole(),
		}),[0,0,1]),
		s.newNpc.abilityAi.ability('idle',[1,1,1]),
	]),
	mastery:s.newNpc.mastery([0.5,1,2,1,1,1]),
	moveRange:s.newNpc.moveRange(1.5,1),
});
s.newNpc("goblin-magic",{
	name:"Goblin",
	sprite:s.newNpc.sprite("goblin"),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability(s.newAbility(null,'fireBomb',{},{
			burn:s.newAbility.status(1,1,1),
		}),[0,0.5,0.5]),
		s.newNpc.abilityAi.ability('healZone',[0.2,0.2,0.2]),
		s.newNpc.abilityAi.ability('coldNova',[0.5,0.5,0.5]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'scratch',{},{
			burn:s.newAbility.status(1,1,1),
			dmg:s.newAbility.dmg(150,'lightning'),
			postDelayAnim:s.newAbility.anim(100,'slashLightning'),
		}),[1,0,0]),
		s.newNpc.abilityAi.ability('idle',[1,1,1]),
	]),
	mastery:s.newNpc.mastery([2,0.5,1,1,1,1]),
	moveRange:s.newNpc.moveRange(2.5,1),
});
s.newNpc("orc-melee",{
	name:"Orc",
	sprite:s.newNpc.sprite("orc-melee"),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability(s.newAbility(null,'scratch',{},{
			postDelayAnim:s.newAbility.anim("slashMelee",0.5),
		}),[1,0.5,0]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'scratchBig',{},{
			bleed:s.newAbility.status(1,2,1),
		}),[1,0.5,0]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'boost',{},{
			boost:[
				s.newBoost('bleed-chance',1000,100,'+'),
				s.newBoost('atkSpd',3,100),
			],
		}),[0.2,0.4,0.4]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'rangeBullet',{},{
			amount:3,angleRange:30,
		}),[0.5,0.5,1]),
		s.newNpc.abilityAi.ability('idle',[0.5,0.5,0.5]),
	]),
	mastery:s.newNpc.mastery([1,2,0.5,1,1,1]),
	moveRange:s.newNpc.moveRange(0.5,1),
});
s.newNpc("orc-range",{
	name:"Orc",
	sprite:s.newNpc.sprite("orc-range"),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability(s.newAbility(null,'arrowBullet',{},{
			sprite:s.newAbility.sprite("arrow",1.5),
			amount:3,angleRange:30,
			pierce:s.newAbility.pierce(1,0.8,5),
			dmg:s.newAbility.dmg(200,'range'),
		}),[0,0.5,0.5]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'scratch',{},{
			stun:s.newAbility.status(1,2,1),
			postDelayAnim:s.newAbility.anim('slashLightning',0.8),
		}),[1,0,0]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'arrowBullet',{periodOwn:10,periodGlobal:10},{
			amount:5,angleRange:45,
		}),[0,0.5,0.5]),
		s.newNpc.abilityAi.ability('idle',[1,1,1]),
	]),
	mastery:s.newNpc.mastery([0.5,1,2,1,1,1]),
	moveRange:s.newNpc.moveRange(1.5,1),
}); 
s.newNpc("orc-magic",{
	name:"Orc",
	sprite:s.newNpc.sprite("orc-magic"),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability(s.newAbility(null,'coldBomb',{},{
			chill:s.newAbility.status(1,1,1),
		}),[0,0.5,0.5]),
		s.newNpc.abilityAi.ability('healZone',[0.2,0.2,0.2]),
		s.newNpc.abilityAi.ability('lightningNova',[0.5,0.5,0.5]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'scratch',{},{
			burn:s.newAbility.status(0.5,1,1),
			postDelayAnim:s.newAbility.anim('slashFire',0.8),
			dmg:s.newAbility.dmg(150,'fire'),
		}),[1,0,0]),
		s.newNpc.abilityAi.ability('idle',[1,1,1]),
	]),
	mastery:s.newNpc.mastery([2,0.5,1,1,1,1]),
	moveRange:s.newNpc.moveRange(2.5,1),
});
s.newNpc("gargoyle",{
	name:"Gargoyle",
	sprite:s.newNpc.sprite("gargoyle"),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability('lightningBomb',[0.5,0.5,1]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'scratch',{},{
			stun:s.newAbility.status(1,1,1),
		}),[0.5,0,0]),
		s.newNpc.abilityAi.ability('lightningBullet',[1,1,1]),
		s.newNpc.abilityAi.ability('lightningNova',[0,0.4,0.4]),
		s.newNpc.abilityAi.ability('idle',[0.5,0.5,0.5]),
	]),
	mastery:s.newNpc.mastery([1,1,1,1,0.5,2]),
	moveRange:s.newNpc.moveRange(1.5,1),
});
s.newNpc("ghost",{
	name:"Ghost",
	sprite:s.newNpc.sprite("ghost"),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability(s.newAbility(null,'magicBullet',{},{
			curse:s.newAbility.curse(0.25,1,[
				s.newBoost('globalDmg',0.1,50),
			]),
		}),[0.5,0.5,1]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'magicBomb',{},{
			curse:s.newAbility.curse(0.25,1,[
				s.newBoost('globalDef',0.1,50),
			]),
			drain:s.newAbility.status(1,1,1),
		}),[0.3,0.5,0.5]),
		s.newNpc.abilityAi.ability('lightningBullet',[1,1,1]),
		s.newNpc.abilityAi.ability('idle',[0.5,0.5,0.5]),
	]),
	mastery:s.newNpc.mastery([2,1,1,1,0.5,1]),
	moveRange:s.newNpc.moveRange(1.5,1),
});
s.newNpc("death",{
	name:"Death",
	sprite:s.newNpc.sprite("death"),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability(s.newAbility(null,'magicBullet',{},{
			drain:s.newAbility.status(1,1,1),
			curse:s.newAbility.curse(0.25,[
				s.newBoost('hp-regen',0.5,250),
				s.newBoost('mana-regen',0.5,250),
			]),
		}),[0.5,0.5,0.5]),
		
		s.newNpc.abilityAi.ability(s.newAbility(null,'magicBomb',{},{
			aim:25,
			dmg:s.newAbility.dmg(0,'magic'),
			onDamagePhase:s.newAbility.onDamagePhase(1,{
				type:"bullet",angleRange:360,amount:5,
				sprite:s.newAbility.sprite('shadowball',0.8),
				hitAnim:s.newAbility.anim('magicHit',0.5),
				dmg:s.newAbility.dmg(125,'magic'),
			}),
		}),[0.8,0.8,0.8]),
		s.newNpc.abilityAi.ability('coldBullet',[0.1,0.3,0.3]),
		s.newNpc.abilityAi.ability('idle',[0.5,0.5,0.5]),
		
	]),
	mastery:s.newNpc.mastery([2,1,1,1,1,0.5]),
	moveRange:s.newNpc.moveRange(2,1),
});
s.newNpc("skeleton",{
	name:"Skeleton",
	sprite:s.newNpc.sprite("skeleton"),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability(s.newAbility(null,'boneBoomerang',{},{
			amount:3,angleRange:30,
		}),[0.1,0.5,0.5]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'boneBoomerang',{},{
			sprite:s.newAbility.sprite('bone',1.5),
			knock:s.newAbility.status(1,1,1),
			dmg:s.newAbility.dmg(200,'melee'),
		}),[0.1,0.8,0.8]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'scratch',{},{
			knock:s.newAbility.status(0.25,2,1),
		}),[1,0,0]),
		s.newNpc.abilityAi.ability('idle',[0.5,0.5,0.5]),
	]),
	mastery:s.newNpc.mastery([1,2,1,0.5,1,1]),
	moveRange:s.newNpc.moveRange(2,1),
});
s.newNpc("spirit",{
	name:"Spirit",
	sprite:s.newNpc.sprite("spirit"),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability(s.newAbility(null,'fireBomb',{},{
			aim:20,
			onDamagePhase:s.newAbility.onDamagePhase(1,{
				type:"bullet",angleRange:360,amount:8,
				sprite:s.newAbility.sprite('fireball',0.8),
				hitAnim:s.newAbility.anim('fireHit',0.5),
				dmg:s.newAbility.dmg(20,'fire'),
			}),
			
		}),[0.5,0.5,0.5]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'fireBullet',{},{
			amount:3,angleRange:45,
			burn:s.newAbility.status(1,1,1),
		}),[0.4,0.8,0.8]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'fireBomb',{},{
			aim:20,
			onDamagePhase:s.newAbility.onDamagePhase(1,{
				preDelayAnim:s.newAbility.anim('cursePink',0.5),
				dmg:s.newAbility.dmg(10,'fire'),
				curse:s.newAbility.curse(1,[
					s.newBoost('def-fire-mod',0.5,150),
				]),
			}),
		}),[0.3,0.3,0.3]),
		s.newNpc.abilityAi.ability('fireNova',[0,0.4,0.4]),
		s.newNpc.abilityAi.ability('idle',[0.5,0.5,0.5]),
	]),
	mastery:s.newNpc.mastery([1,1,1,2,1,0.5]),
	moveRange:s.newNpc.moveRange(2,1),
});
s.newNpc("demon",{
	name:"Demon",
	sprite:s.newNpc.sprite("demon"),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability('fireNova',[0,0.4,0.4]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'fireBullet',{},{
			amount:7,angleRange:360,
			burn:s.newAbility.status(1,2,1),
		}),[0.4,0.8,0.8]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'scratch',{},{
			dmg:s.newAbility.dmg(150,'fire'),
			postDelayAnim:s.newAbility.anim('slashFire',1),
		}),[0.4,0,0]),
		s.newNpc.abilityAi.ability('idle',[0.5,0.5,0.5]),
	]),
	mastery:s.newNpc.mastery([1,1,0.5,2,1,1]),
	moveRange:s.newNpc.moveRange(2,1),
});
s.newNpc("taurus",{
	name:"Taurus",
	maxSpd:s.newNpc.maxSpd(0.6),
	sprite:s.newNpc.sprite("taurus",0.8),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability(s.newAbility(null,'rangeBullet',{},{
			amount:7,angleRange:160,
			bleed:s.newAbility.status(0.5,1,1),
		}),[0,0.4,0.4]),		
		s.newNpc.abilityAi.ability(s.newAbility(null,'scratchBig',{},{
			postDelayAnim:s.newAbility.anim('scratch2',1.5),
			dmg:s.newAbility.dmg(200,'melee'),
			onDamagePhase:s.newAbility.onDamagePhase(0.5,{
				type:"bullet",angleRange:360,amount:8,
				sprite:s.newAbility.sprite('rock',0.8),
				hitAnim:s.newAbility.anim('earthHit',0.5),
				dmg:s.newAbility.dmg(25,'melee'),			
			}),
		}),[1,0,0]),
		s.newNpc.abilityAi.ability('idle',[0.5,0.5,0.5]),
	]),
	mastery:s.newNpc.mastery([2,1,1,1,1,0.5]),
	moveRange:s.newNpc.moveRange(0.5,1),
});
s.newNpc("mummy",{
	name:"Mummy",
	maxSpd:s.newNpc.maxSpd(0.6),
	sprite:s.newNpc.sprite("mummy",0.8),
	hpRegen:3,
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability(s.newAbility(null,'scratch',{
			spriteFilter:s.newAbility.spriteFilter('red',5),
			delay:5,
		},{
			leech:s.newAbility.status(1,1,1),
			postDelayAnim:s.newAbility.anim('cursePink',1),
		}),[1,0,0]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'scratch',{
			spriteFilter:s.newAbility.spriteFilter('blue',5),
			delay:5,
		},{
			chill:s.newAbility.status(1,1,1),
			postDelayAnim:s.newAbility.anim('slashCold',1),
		}),[0.5,0,0]),
		s.newNpc.abilityAi.ability('coldNova',[0,0.2,0.4]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'magicBomb',{
			spriteFilter:s.newAbility.spriteFilter('green',5),
			delay:5,
		},{
			dmg:s.newAbility.dmg(150,'magic'),
			chill:s.newAbility.status(1,1,1),
			curse:s.newAbility.curse(0.75,[
				s.newBoost('globalDmg',0.5,50),		
			]),
		}),[0,0.5,0.5]),
		s.newNpc.abilityAi.ability('idle',[0.5,0.5,0.5]),
	]),
	mastery:s.newNpc.mastery([1,1,1,0.5,2,1]),
	moveRange:s.newNpc.moveRange(0.5,1),
});
s.newNpc("bird",{ 
	name:"Bird",
	sprite:s.newNpc.sprite("birdRed",0.8),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability('rangeBomb',[0.5,0.5,0.5]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'scratch',{},{
			knock:s.newAbility.status(1,1,1),
			postDelayAnim:s.newAbility.anim('earthHit',1),
		}),[0.5,0,0]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'windBullet',{},{
			knock:s.newAbility.status(0.5,1,1),
			amount:5,angleRange:45,
			sin:s.newAbility.sin(1,1),
		}),[0,0.5,0.5]),
		s.newNpc.abilityAi.ability('idle',[0.5,0.5,0.5]),
	]),
	mastery:s.newNpc.mastery([2,0.5,1,1,1,1]),
	moveRange:s.newNpc.moveRange(2.5,1),
});
s.newNpc("dragon",{
	name:"Dragon",
	sprite:s.newNpc.sprite("dragonKing",0.8),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability(s.newAbility(null,'windBullet',{},{
			angleRange:360,amount:9,
		}),[1,0.5,0.5]),
		s.newNpc.abilityAi.ability('fireNova',[0.5,0.5,0.5]),
		s.newNpc.abilityAi.ability('coldNova',[0.5,0.5,0.5]),
		s.newNpc.abilityAi.ability('lightningNova',[0.5,0.5,0.5]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'scratchBig',{},{
			bleed:s.newAbility.status(1,1,1),
		}),[0.5,0,0]),
		s.newNpc.abilityAi.ability('idle',[0.5,0.5,0.5]),		
	]),
	mastery:s.newNpc.mastery([1,1,1,2,1,0.5],[1.5,1.5,1.5,1.5,1.5,1.5]),
	hp:2000,
	moveRange:s.newNpc.moveRange(2.5,1),
});

//#################

s.newNpc("warrior",{
	name:"Ringo",
	sprite:s.newNpc.sprite("warrior-male0"),
	nevercombat:1,
	maxSpd:s.newNpc.maxSpd(0.5),
});
s.newNpc("npc",{
	name:"Ringo",
	sprite:s.newNpc.sprite("villager-male0"),
	nevercombat:1,
	angle:90,
	targetSetting:s.newNpc.targetSetting(null,25*4),
	moveRange:s.newNpc.moveRange(3,1,3),
	maxSpd:s.newNpc.maxSpd(0.35),
	minimapIcon:'color.green',
});
s.newNpc("npc-playerLike",{
	name:"Ringo",
	sprite:s.newNpc.sprite("villager-male0"),
	targetIf:'false',
	maxSpd:s.newNpc.maxSpd(0.35),
	targetSetting:s.newNpc.targetSetting(null,25*4),
	moveRange:s.newNpc.moveRange(3,1,3),
	combatType:'player',
	awareNpc:1,
	angle:90,
	minimapIcon:'color.green',
});



s.newNpc("loot-chestOff",{
	name:"Chest",
	minimapIcon:'minimapIcon.loot',
	sprite:s.newNpc.sprite("loot-chestOff"),
	nevercombat:1,
	nevermove:1,
	block:s.newNpc.block(s.newNpc.block.size(3,3),1),
});
s.newNpc("loot-chestOn",{
	name:"Chest",
	minimapIcon:'minimapIcon.loot',
	sprite:s.newNpc.sprite("loot-chestOn"),
	nevercombat:1,
	nevermove:1,
	block:s.newNpc.block(s.newNpc.block.size(3,3),1),
});
s.newNpc("loot-flowerOff",{
	name:"Flower",
	minimapIcon:'minimapIcon.loot',
	sprite:s.newNpc.sprite("loot-flowerOff"),
	nevercombat:1,
	nevermove:1,
	block:s.newNpc.block(s.newNpc.block.size(1,1),1),
});
s.newNpc("loot-flowerOn",{
	name:"Flower",
	minimapIcon:'minimapIcon.loot',
	sprite:s.newNpc.sprite("loot-flowerOn"),
	nevercombat:1,
	nevermove:1,
	block:s.newNpc.block(s.newNpc.block.size(1,1),1),
});
s.newNpc("toggle-boxOff",{
	name:"Lever",
	minimapIcon:'minimapIcon.toggle',
	sprite:s.newNpc.sprite("toggle-boxOff"),
	nevercombat:1,
	nevermove:1,
	block:s.newNpc.block(s.newNpc.block.size(2,2),1),
});
s.newNpc("toggle-boxOn",{
	name:"Lever",
	minimapIcon:'minimapIcon.toggle',
	sprite:s.newNpc.sprite("toggle-boxOn"),
	nevercombat:1,
	nevermove:1,
	block:s.newNpc.block(s.newNpc.block.size(2,2),1),
});

s.newNpc("waypoint-grave",{
	name:"Grave",
	minimapIcon:'minimapIcon.waypoint',
	sprite:s.newNpc.sprite("waypoint-grave"),
	waypoint:1,
	nevercombat:1,
	nevermove:1,
	block:s.newNpc.block(s.newNpc.block.size(2,2),1),
}); 
s.newNpc("target",{
	name:"Target",
	sprite:s.newNpc.sprite("system-target"),
	nevermove:1,
	hp:1,
}); 
s.newNpc("system-sign",{
	name:"Sign",
	sprite:s.newNpc.sprite("system-sign"),
	minimapIcon:'minimapIcon.loot',
	nevermove:1,
	nevercombat:1,
	block:s.newNpc.block(s.newNpc.block.size(2,2),1),
});
s.newNpc("system-bank",{
	name:"Bank",
	minimapIcon:'minimapIcon.loot',
	sprite:s.newNpc.sprite("loot-chestOff",1.5),
	nevercombat:1,
	nevermove:1,
	block:s.newNpc.block(s.newNpc.block.size(3,3),1),
	bank:1,
});

s.newNpc("pushable-rock2x2",{
	name:"Block",
	minimapIcon:'',
	sprite:s.newNpc.sprite("pushable-rock1x1",2),
	nevercombat:1,
	useUpdateInput:0,
	move:1,
	block:s.newNpc.block(s.newNpc.block.size(2,2),1),
	pushable:s.newNpc.pushable(4,16),
	bounce:0,
});
s.newNpc("pushable-bridgeH",{
	name:"",
	minimapIcon:'',
	sprite:s.newNpc.sprite("block-bridgeH"),
	nevercombat:1,
	useUpdateInput:0,
	move:1,
	block:s.newNpc.block(s.newNpc.block.size(2,2),1),
	pushable:s.newNpc.pushable(4,16),
	bounce:0,
});
s.newNpc("pushable-bridgeV",{ 
	name:"",
	minimapIcon:'',
	sprite:s.newNpc.sprite("block-bridgeV"),
	nevercombat:1,
	useUpdateInput:0,
	move:1,
	block:s.newNpc.block(s.newNpc.block.size(2,2),1),
	pushable:s.newNpc.pushable(4,16),
	bounce:0,
});
s.newNpc("block-template",{	//used for quest when want change sprite
	name:"",
	minimapIcon:'',
	sprite:s.newNpc.sprite("invisible"),
	nevercombat:1,
	nevermove:1,
	block:s.newNpc.block(s.newNpc.block.size(2,2),1),
});
s.newNpc("block-rock2x2",{ 
	name:"Block",
	minimapIcon:'',
	sprite:s.newNpc.sprite("block-rock1x1",2),
	nevercombat:1,
	nevermove:1,
	block:s.newNpc.block(s.newNpc.block.size(2,2),1),
});
s.newNpc("block-barrier",{ 
	name:"Barrier",
	minimapIcon:'',
	sprite:s.newNpc.sprite("block-barrier",1.5),
	nevercombat:1,
	nevermove:1,
	block:s.newNpc.block(s.newNpc.block.size(5,3),1),
});
s.newNpc("block-spike",{
	name:"Spike",
	minimapIcon:'',
	sprite:s.newNpc.sprite("block-spike"),
	nevercombat:1,
	nevermove:1,
	block:s.newNpc.block(s.newNpc.block.size(1,1),1),
});
s.newNpc("block-invisible",{
	name:"Spike",
	minimapIcon:'',
	sprite:s.newNpc.sprite("invisible"),
	nevercombat:1,
	nevermove:1,
	block:s.newNpc.block(s.newNpc.block.size(1,1),1),
});
s.newNpc("block-bridgeH",{
	name:"",
	minimapIcon:'',
	sprite:s.newNpc.sprite("block-bridgeH"),
	nevercombat:1,
	nevermove:1,
	block:s.newNpc.block(s.newNpc.block.size(2,2),0),
});
s.newNpc("block-bridgeV",{
	name:"",
	minimapIcon:'',
	sprite:s.newNpc.sprite("block-bridgeV"),
	nevercombat:1,
	nevermove:1,
	block:s.newNpc.block(s.newNpc.block.size(2,2),0),
});

s.newNpc("tree-red",{
	name:"Red Tree",
	minimapIcon:'minimapIcon.tree',
	sprite:s.newNpc.sprite("tree-red"),
	nevercombat:1,
	nevermove:1,
	block:s.newNpc.block(s.newNpc.block.size(3,2,-1,0),1),
});
s.newNpc("tree-down",{
	name:"Cut Tree",
	minimapIcon:'minimapIcon.tree',
	sprite:s.newNpc.sprite("tree-down"),
	nevercombat:1,
	nevermove:1,
	block:s.newNpc.block(s.newNpc.block.size(2,2,0,0),1),
});
s.newNpc("rock-bronze",{
	name:"Bronze Rock",
	minimapIcon:'minimapIcon.rock',
	sprite:s.newNpc.sprite("rock-bronze"),
	nevercombat:1,
	nevermove:1,
	block:s.newNpc.block(s.newNpc.block.size(3,2),1),
});
s.newNpc("rock-down",{
	name:"Empty Rock",
	minimapIcon:'minimapIcon.rock',
	sprite:s.newNpc.sprite("rock-down"),
	nevercombat:1,
	nevermove:1,
	block:s.newNpc.block(s.newNpc.block.size(3,2),1),
});
s.newNpc("hunt-squirrel",{
	name:"Squirrel",
	minimapIcon:'minimapIcon.trap',
	sprite:s.newNpc.sprite("hunt-squirrel"),
	nevercombat:1,
	maxSpd:s.newNpc.maxSpd(0.5),
});
s.newNpc("hunt-down",{
	name:"Creature Grave",
	minimapIcon:'minimapIcon.trap',
	sprite:s.newNpc.sprite("hunt-down"),
	nevercombat:1,
	nevermove:1,
	block:s.newNpc.block(s.newNpc.block.size(2,2),1),
});

s.newNpc("teleport-door",{
	name:"Door",
	minimapIcon:'minimapIcon.door',
	sprite:s.newNpc.sprite("teleport-door"),
	nevercombat:1,
	nevermove:1,
});
s.newNpc("teleport-zone",{  
	name:"Map Transition",
	minimapIcon:'minimapIcon.door',
	sprite:s.newNpc.sprite("teleport-zone",1.5),
	nevercombat:1,
	nevermove:1,
});
s.newNpc("teleport-zoneLight",{  
	name:"Map Transition",
	minimapIcon:'minimapIcon.door',
	sprite:s.newNpc.sprite("teleport-zoneLight",1.5),
	nevercombat:1,
	nevermove:1,
});
s.newNpc("teleport-underground",{
	name:"Underground",
	minimapIcon:'minimapIcon.door',
	sprite:s.newNpc.sprite("teleport-underground"),
	nevercombat:1,
	nevermove:1,
}); 
s.newNpc("teleport-well",{
	name:"Well",
	minimapIcon:'minimapIcon.door',
	sprite:s.newNpc.sprite("teleport-well"),
	nevercombat:1,
	nevermove:1,
	block:s.newNpc.block(s.newNpc.block.size(3,3),1),
});
s.newNpc("teleport-cave",{
	name:"Cave",
	minimapIcon:'minimapIcon.door',
	sprite:s.newNpc.sprite("teleport-cave"),
	nevercombat:1,
	nevermove:1,
});
//}

s.exports(exports);

