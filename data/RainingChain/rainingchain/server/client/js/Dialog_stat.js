//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var Actor = require4('Actor'), Img = require4('Img');
var Dialog = require3('Dialog');

Dialog.create('stat','Combat Stat',Dialog.Size(600,600),Dialog.Refresh(function(){
	Dialog.stat.apply(this,arguments);
},function(){
	return Tk.stringify(player.boost.list) + Tk.stringify(Actor.getEquip(player));
}));
//Dialog.open('stat')


Dialog.stat = function(html,variable){
	variable.OLD = Tk.stringify(player.boost.list);
	
	html.append('<h3>Offensive Stats</h3>');
	var array = [];
	for(var i = 0 ; i <  Line.LIST.offensive.length; i++){
		var line = Line.LIST.offensive[i];
		array.push([
			Img.drawIcon.html(line.icon,24),
			'<span title="' + line.title + '">' + line.name + '</span>',
			line.func(r,player.boost.list),		
		]);
	}
	html.append(Tk.arrayToTable(array,false,false,true));
	//#####
	html.append('<br>');
	html.append('<h3>Defensive Stats</h3>');
	
	var array = [];
	for(var i = 0 ; i <  Line.LIST.defensive.length; i++){
		var line = Line.LIST.defensive[i];
		array.push([
			Img.drawIcon.html(line.icon,24),
			'<span title="' + line.title + '">' + line.name + '</span>',
			line.func(r,player.boost.list),		
		]);
	}
	html.append(Tk.arrayToTable(array,false,false,true));
	
}


//#################################
var r = function(statName,round,round2){
	if(!player.boost.list[statName]) return ERROR(3,'no statName',statName);
	return player.boost.list[statName].base.r(round,round2);
}
	
var Line = function(category,name,title,icon,func){
	Line.LIST[category].push({
		name:name,
		title:title,
		icon:icon,
		func:func,	
	});	
}
Line.LIST = {offensive:[],defensive:[]};

Line.getElementFunc = function(type,name){	//BADD hardcoded
	return function(r,b){
		var el = type + '-' + name + '-+';
		if(type === 'dmg'){
			return 'x' + Tk.round(1+player.boost.list[el].base,2,2);
		} else {
			var totaldef = Actor.getEquip(player).def[name];
			var mod = 1+player.boost.list[el].base;
			
			var num = totaldef*mod;	//3
			var res = 1-1/num;		//1-1/3 = 66% reduc
			res = Math.max(res,0);
			
			var num = Math.max(1,num.r(2));
			var str = num === 1 
				? 'No Damage Reduction.' 
				: 'You will take ' + num + ' times less damage from ' + name.capitalize() + "."
			return $('<span>')
				.append($('<span>')
					.html(Tk.round(totaldef,2,2))
					.attr('title','Raw defence derived from Equipment Power')
				)
				.append($('<span>')
					.html(' * ' + Tk.round(mod,2,2) + ' => ')
					.attr('title','Bonus from reputation and equipment boost.')
				)
				.append($('<u>')
					.html(Tk.round(res*100,1) + "% Dmg Reduc")
					.attr('title',str)
				);
		}
	}
}

Line.getStatusFunc = function(status,magn,time,chance){
	return function(r,b){
		var b0 = r(status + '-chance',2,2);
		var b1 = r(status + '-magn',2,2);
		var magnText = magn || 'Increase the effect of the status.';
		var chanceText = chance || 'Increase the chance to trigger the effect.';
		
		var str = '<span title="Chance: ' + chanceText + '">Chance: ' + b0 + '</span>, ';
		str += '<span title="Magn: ' + magnText + '">Magn: ' + b1 + '</span>, ';
		
		if(time !== false){
			var b2 = r(status + '-time',2,2);
			var timeText = time || 'Increase the duration of the status effect.';
			str += '<span title="Time: ' + timeText + '">Time: ' + b2 + '</span>';
		}
		return str;	
	}
};

(function(){ //init Line
	Line('offensive','Melee','Increase Melee damage dealt by ability','element.melee',(function(){ 
		return Line.getElementFunc('dmg','melee');
	})());
	Line('offensive','Range','Increase Range damage dealt by ability','element.range',(function(){ 
		return Line.getElementFunc('dmg','range');
	})());
	Line('offensive','Magic','Increase Magic damage dealt by ability','element.magic',(function(){ 
		return Line.getElementFunc('dmg','magic');
	})());
	Line('offensive','Fire','Increase Fire damage dealt by ability','element.fire',(function(){ 
		return Line.getElementFunc('dmg','fire');
	})());
	Line('offensive','Cold','Increase Cold damage dealt by ability','element.cold',(function(){ 
		return Line.getElementFunc('dmg','cold');
	})());
	Line('offensive','Lightning','Increase Lightning damage dealt by ability','element.lightning',(function(){ 
		return Line.getElementFunc('dmg','lightning');
	})());

	Line('offensive','Bleed (Melee)','Damage over time.','status.bleed',(function(){ 
		return Line.getStatusFunc(
			'knock',
			'Damage dealt every frame. (Total damage = Magn * Time)'
		);
	})());
	Line('offensive','Knockback (Range)','Push target away.','status.knock',(function(){ 
		return Line.getStatusFunc(
			'knock',
			'Distance in pixel at which the target will move per frame. (Total distance = Magn * Time)',
			'Amount of frames at which the target is pushed.'
		);
	})());
	Line('offensive','Drain (Magic)','Replenish mana when hitting an enemy.','status.bleed',(function(){ 
		return Line.getStatusFunc(
			'drain',
			'Amount of mana leeched.',
			false
		);
	})());
	Line('offensive','Burn (Fire)','Damage over time based on remaining life.','status.burn',(function(){ 
		return Line.getStatusFunc(
			'burn',
			'% of remaining life lost every frame'
		);
	})());
	Line('offensive','Chill (Cold)','Reduce speed and attack speed.','status.chill',(function(){ 
		return Line.getStatusFunc(
			'chill',
			'Movement speed and attack speed will be divide by this value.'
		);
	})());
	Line('offensive','Stun (Lightning)','Stop target movement. His ability charges are reduced.','status.stun',(function(){ 
		return Line.getStatusFunc(
			'stun',
			'Movement speed and attack speed will be divide by this value.',
			'Time before target can move normally again.'
		);
	})());
	
	Line('offensive','Melee Weapon','Increase damage dealt if using these weapons','element.melee2',function(r,b){
		return 'Mace: ' + r('weapon-mace',2,1) + ', Spear: ' + r('weapon-spear',2,1) + ', Sword: ' + r('weapon-sword',2,1);
	});
	Line('offensive','Range Weapon','Increase damage dealt if using these weapons','element.range2',function(r,b){
		return 'Bow: ' + r('weapon-bow',2,1) + ', Boomerang: ' + r('weapon-boomerang',2,1) + ', Crossbow: ' + r('weapon-crossbow',2,1);
	});
	Line('offensive','Magic Weapon','Increase damage dealt if using these weapons','element.range2',function(r,b){
		return 'Staff: ' + r('weapon-staff',2,1) + ', Wand: ' + r('weapon-wand',2,1) + ', Orb: ' + r('weapon-orb',2,1);
	});

	Line('offensive','Leech Hp','Replenish life when hitting an enemy.','resource.hp',(function(){ 
		return Line.getStatusFunc(
			'leech',
			'The amount of life leeched.',
			false
		);
	})());
	Line('offensive','Critical','Dealt more damage than usual.','resource.hp',(function(){ 
		return Line.getStatusFunc(
			'crit',
			'Damage dealt will be multiplied by this value.',
			false
		);
	})());
	Line('offensive','Bullet','Impact bullet behaviour. (Ex: Arrow)','offensive.bullet',function(r,b){
		var str = '<span title="Amount:Chance to shoot an additional bullet.">Amount: ' + r('bullet-amount',2,2) + '</span>, ';
		str += '<span title="Spd: Multiply the bullet travelling speed by this value.">Spd: ' + r('bullet-spd',2,2) + '</span>';
		return str;
	});
	Line('offensive','Strike','Impact strike behaviour. (Ex: Slash)','offensive.bullet',function(r,b){
		var str = '<span title="AoE:Increase the region of the strike that deals damage.">AoE: ' + r('strike-size',2,2) + '</span>, ';
		str += '<span title="Range:Increase the max distance between you and the strike region center.">Range: ' + r('strike-range',2,2) + '</span>, ';
		//str += '<span title="#:Allow a single attack to damage more monsters.">#: ' + r('strike-maxHit',2,2) + '</span>';
		return str;
	});
	Line('offensive','Summon','Impact summon behaviour. (Ex: Slash)','summon.wolf',function(r,b){
		var str = '<span title="Atk:Increase the damage dealt by summons.">Atk: ' + r('summon-atk',2,2) + '</span>, ';
		str += '<span title="Def: Increase the defence of your summons.">Def: ' + r('summon-def',2,2) + '</span>, ';
		str += '<span title="#:Increase max amount of summon you can have at once.">#: ' + r('summon-amount',2,2) + '</span>';
		return str;
	});
	Line('offensive','Atk Spd','Decrease the delay between your attacks.','offensive.atkSpd',function(r,b){
		return r('atkSpd',2,2);
	});
	//################



	Line('defensive','Melee','Increase Melee defence.','element.melee',(function(){ 
		return Line.getElementFunc('def','melee');
	})());
	Line('defensive','Range','Increase Range defence.','element.range',(function(){ 
		return Line.getElementFunc('def','range');
	})());
	Line('defensive','Magic','Increase Magic defence.','element.magic',(function(){ 
		return Line.getElementFunc('def','magic');
	})());
	Line('defensive','Fire','Increase Fire defence.','element.fire',(function(){ 
		return Line.getElementFunc('def','fire');
	})());
	Line('defensive','Cold','Increase Cold defence.','element.cold',(function(){ 
		return Line.getElementFunc('def','cold');
	})());
	Line('defensive','Lightning','Increase Lightning defence.','element.lightning',(function(){ 
		return Line.getElementFunc('def','lightning');
	})());

	Line('defensive','Speed','Increase movement speed.','defensive.speed',function(r,b){
		return r('maxSpd',2,2);
	});
	Line('defensive','Pickup Radius','Increase distance at which you can pick items on the ground.','defensive.pickup',function(r,b){
		return r('pickRadius',0,0);
	});
	Line('defensive','Item Find','Impact items you receive as loot.','defensive.magicFind',function(r,b){
		var str = '<span title="Quantity:Increase the chance to get a loot.">Quantity: ' + r('magicFind-quantity',2,2) + '</span>, ';
		str += '<span title="Quality: Impact Equip Only. Higher quality increases equip boost value.">Quality: ' + r('magicFind-quality',2,2) + '</span>, ';
		str += '<span title="Rarity: Impact Equip Only. Higher rarity increases the quantity of boost on the equip.">Rarity: ' + r('magicFind-rarity',2,2) + '</span>';
		return str;
	});
	Line('defensive','Life','Impact your life. If it reaches 0, you die.','resource.hp',function(r,b){
		var str = '<span title="Max:Increase the maximum life you can have at once.">Max: ' + r('hp-max',0,1) + '</span>, ';
		str += '<span title="Regen: How much life you replenish every second.">Regen: ' + (b['hp-regen'].base*25).r(2,2) + '</span>';
		return str;
	});
	Line('defensive','Mana','Impact your mana used for Abilities.','resource.hp',function(r,b){
		var str = '<span title="Max:Increase the maximum mana you can have at once.">Max: ' + r('mana-max',0,1) + '</span>, ';
		str += '<span title="Regen: How much mana you replenish every second.">Regen: ' + (b['mana-regen'].base*25).r(2,2) + '</span>';
		return str;
	});
})();

})();
