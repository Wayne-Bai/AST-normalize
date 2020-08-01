//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){//}

var Img = require4('Img');
var AnimModel = exports.AnimModel = {};
AnimModel.create = function(id,frame,sfx,spd,layer,extra){
	var tmp = {
		id:id,
		src:'img/anim/' + id + '.png',	
		frame:frame || 10,
		frameX:Math.min(frame,5) || 10,
		spd:spd || 1,
		layer:layer || 'a',
		sfx:sfx || null,	//Sfx.Base {id:'asd',volume:0.5}
		size:4,
		startY:0,
		img:null,	//client side
	};
	for(var i in extra) tmp[i] = extra[i];
	
	if(typeof tmp.spd !== 'number') return ERROR(3,'spd not number');
	if(typeof tmp.layer !== 'string') return ERROR(3,'layer not string');
	if(typeof tmp.frame !== 'number') return ERROR(3,'frame not number');
	
	
	DB[id] = tmp;
	
	if(!SERVER)
		tmp.img = Img.load(tmp.src);
	
	return tmp;
};
var DB = AnimModel.DB = {};

AnimModel.Sfx = function(id,volume){
	return {
		id:id,
		volume:volume || 1,
	}
}

AnimModel.get = function(id){
	return DB[id] || null;
}

AnimModel.init = function(){
	//AnimModel.create('waterBomb',15);
	//AnimModel.create('boostGrey',18,1,'b',AnimModel.Sfx('boost',0.5));
	//AnimModel.create('curseBlue',15,1,'b',AnimModel.Sfx('boost',0.5));
	//AnimModel.create('cursePurple',9,1,'b',AnimModel.Sfx('boost',0.5));
	//AnimModel.create('splashCold',10);
	//AnimModel.create('splashFire',7);
	//AnimModel.create('splashLightning',7);
	//AnimModel.create('splashMelee',9,1,'a',AnimModel.Sfx('splashMelee',0.5));
	
	
	AnimModel.create('strikeHit',3,AnimModel.Sfx('strikeHit',0.5));
	AnimModel.create('arrowHit',3,AnimModel.Sfx('arrowHit',0.5));
	
	AnimModel.create('aura',30,AnimModel.Sfx('aura',0.5),1,'b');
	AnimModel.create('bind',16,AnimModel.Sfx('bind',0.5),1,'b');
	AnimModel.create('heal',13,AnimModel.Sfx('heal',0.5),1,'b');
	AnimModel.create('boostBlue',16,AnimModel.Sfx('boost',0.5),1,'b');
	AnimModel.create('boostPink',16,AnimModel.Sfx('boost',0.5),1,'b');
	AnimModel.create('boostRed',16,AnimModel.Sfx('boost',0.5),1,'b');
	AnimModel.create('boostWhite',10,AnimModel.Sfx('boost',0.5),1,'b');
	AnimModel.create('curseGreen',14,AnimModel.Sfx('curse',0.5),1,'b');
	AnimModel.create('cursePink',14,AnimModel.Sfx('curse',0.5),1,'b');
	AnimModel.create('earthHit',7,AnimModel.Sfx('earthHit',0.5));
	AnimModel.create('earthBomb',7,AnimModel.Sfx('earthBomb',0.5));
	
	AnimModel.create('rangeBomb',10,AnimModel.Sfx('rangeBomb',1),0.5,'a');
	AnimModel.create('magicBomb',9,AnimModel.Sfx('magicBomb',1),0.5);
	AnimModel.create('magicHit',9,AnimModel.Sfx('magicHit',1));
	AnimModel.create('fireBomb',30,AnimModel.Sfx('fireBomb',0.25));
	AnimModel.create('fireBomb2',6,AnimModel.Sfx('fireBomb2',0.25),0.4);
	AnimModel.create('fireHit',12,AnimModel.Sfx('fireHit',0.25));
	AnimModel.create('coldBomb',9,AnimModel.Sfx('coldBomb',1),0.4);
	AnimModel.create('coldHit',16,AnimModel.Sfx('coldHit',0.5));
	AnimModel.create('lightningBomb',12,AnimModel.Sfx('lightningBomb',1));
	AnimModel.create('lightningBomb2',5,AnimModel.Sfx('lightningBomb2',1));
	AnimModel.create('lightningHit',6,AnimModel.Sfx('lightningHit',0.5));
	AnimModel.create('scratch',6,AnimModel.Sfx('scratch',0.2));
	AnimModel.create('scratch2',8,AnimModel.Sfx('scratch2',0.2));
	AnimModel.create('slashCold',13,AnimModel.Sfx('slashCold',0.2));
	AnimModel.create('slashFire',15,AnimModel.Sfx('slashFire',0.5));
	AnimModel.create('slashLightning',14,AnimModel.Sfx('slashLightning',0.5));
	AnimModel.create('slashMelee',6,AnimModel.Sfx('slashMelee',0.25));
	
}
})();


