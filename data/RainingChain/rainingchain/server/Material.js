//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
var ItemModel = require2('ItemModel'), Message = require2('Message'), Main = require2('Main'), Quest = require2('Quest');

var DB = {};

var Material = exports.Material = {};
Material.create = function(type,name,icon,skill,lvl){
	var id = type + '-' + lvl;
	var tmp = {
		type:type,
		id:id,
		name:name || '',
		icon:icon || '',
		skill:skill || '',
		lvl:lvl || 0
	}
	ItemModel.create('Qsystem',Quest.addPrefix('Qsystem',id),tmp.name,tmp.icon,[
		ItemModel.Option(Message.add,'Examine',null,['A material used to craft equipments.']),
		ItemModel.Option(Material.upgrade,'Upgrade',null,[id]),
	],'Crafting Material',{type:'material'});

	
	
	DB[id] = tmp;
}

Material.upgrade = function(key,what){
	var mat = Material.get(what);
	if(mat.lvl >= 80) 
		return Message.add(key,'This material is already fully upgraded.');
		
	var nextLvl = Material.get(mat.type + '-' + (mat.lvl+20));
	
	var main = Main.get(key);
	if(!Main.haveItem(main,what,10))
		return Message.addPopup(key,'x10 ' + mat.name + ' is needed to create x1 ' + nextLvl.name + '.');
	
	Main.question(main,function(key,answer){
		if(answer === 'No') return;
		
		var amount = answer === 'Yes' ? 1 : 10000;
		while(amount-- > 0){
			if(!Main.haveItem(main,what,10))
				return;
			Main.removeItem(main,what,10);
			Main.addItem(main,nextLvl.id);
		}
	},'Convert x10 ' + mat.name + ' into x1 ' + nextLvl.name + '?','option',['Yes','No','Convert All']);
}

Material.get = function(id){
	return DB[id];
}
Material.getRandom = function(lvl){
	//0, 20, 40, 60, 80
	
	if(random < 0.01){
		lvl += 40;
	} else if(random < 0.1){
		lvl += 20;
	}
	
	lvl = Material.roundLevel(lvl);
	
	var random = Material.DROP_RATE.$random();
	return random + '-' + lvl;
}

Material.getMaterialRelatedToSkill = function(skill,lvl){
	lvl = Material.roundLevel(lvl);
	if(skill === 'metalwork') return 'metal-' + lvl;
	if(skill === 'woodwork') return 'wood-' + lvl;
	if(skill === 'leatherwork') return 'bone-' + lvl;
	
	return Material.getRandom(lvl);	
}

Material.roundLevel = function(lvl){
	lvl = Math.min(lvl,80);
	return Math.round((lvl ||0)/20)*20;
}	

Material.DROP_RATE = {
	metal:1/4,
	wood:1/4,
	bone:1/4,
	ruby:1/12,
	topaz:1/12,
	sapphire:1/12,
};

Material.init = function(){	//init requires cuz call ItemModel which require st00f
	Material.create('metal','Bronze Metal','metal.metal','mining',0);
	Material.create('metal','Iron Metal','metal.metal','mining',20);
	Material.create('metal','Steel Metal','metal.metal','mining',40);
	Material.create('metal','Gold Metal','metal.metal','mining',60);
	Material.create('metal','Crystal Metal','metal.metal','mining',80);

	Material.create('wood','Red Wood','wood.wood','woodcutting',0);
	Material.create('wood','Yellow Wood','wood.wood','woodcutting',20);
	Material.create('wood','Blue Wood','wood.wood','woodcutting',40);
	Material.create('wood','Grey Wood','wood.wood','woodcutting',60);
	Material.create('wood','Dark Wood','wood.wood','woodcutting',80);

	Material.create('bone','Squirrel Bone','bone.bone','hunting',0);
	Material.create('bone','Rabbit Bone','bone.bone','hunting',20);
	Material.create('bone','Fox Bone','bone.bone','hunting',40);
	Material.create('bone','Wolf Bone','bone.bone','hunting',60);
	Material.create('bone','Dragon Bone','bone.bone','hunting',80);

	Material.create('ruby','Chipped Ruby','orb.ruby','',0);
	Material.create('ruby','Flawed Ruby','orb.ruby','',20);
	Material.create('ruby','Normal Ruby','orb.ruby','',40);
	Material.create('ruby','Flawless Ruby','orb.ruby','',60);
	Material.create('ruby','Perfect Ruby','orb.ruby','',80);

	Material.create('sapphire','Chipped Sapphire','orb.sapphire','',0);
	Material.create('sapphire','Flawed Sapphire','orb.sapphire','',20);
	Material.create('sapphire','Normal Sapphire','orb.sapphire','',40);
	Material.create('sapphire','Flawless Sapphire','orb.sapphire','',60);
	Material.create('sapphire','Perfect Sapphire','orb.sapphire','',80);

	Material.create('topaz','Chipped Topaz','orb.topaz','',0);
	Material.create('topaz','Flawed Topaz','orb.topaz','',20);
	Material.create('topaz','Normal Topaz','orb.topaz','',40);
	Material.create('topaz','Flawless Topaz','orb.topaz','',60);
	Material.create('topaz','Perfect Topaz','orb.topaz','',80);
}



