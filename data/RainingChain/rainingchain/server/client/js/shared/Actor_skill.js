//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var Main = require2('Main'), Message = require2('Message');
var Actor = require3('Actor');
Actor.Skill = function(exp,lvl){
	return {
		exp:exp||0,	
		lvl:lvl || 0,
	}
}

Actor.SkillPlot = function(quest,num,type){
	return {
		quest:quest,
		num:num,
		type:type
	};	
}


//###############

Actor.getCombatLevel = function(act){
	return Actor.getMain(act).reputation.lvl;
}

Actor.addExp = function(act,num,useGEM){
	if(typeof num !== 'number' || isNaN(num)) return ERROR(4,'num is not number');
	
	
	if(useGEM === undefined && num < 0){
		//do nothing
	} else if(useGEM !== false){
		num *= Actor.getGEM(act);
	}
	
	
	act.skill.exp += num || 0;
	Actor.setFlag(act,'skill');
}

Actor.getExp = function(act){
	return act.skill.exp;
}


Actor.getGEM = function(act){
	var main = Actor.getMain(act);
	
	var count = 0;
	for(var i in main.quest){
		if(main.quest[i]._rewardScore > 1)
			count += Actor.getGEM.scoreToGEM(main.quest[i]._rewardScore);	
	}
	return 1 + count;
}
Actor.getGEM.scoreToGEM = function(score){
	return Math.log10(score)/10 || 0;	
}

Actor.getLevelUpCost = function(act){
	var lvl = Actor.getLevel(act);
	return CST.exp[lvl+1] - CST.exp[lvl];
}

Actor.getLevel = function(act){
	return act.skill.lvl;
}

Actor.levelUp = function(act){
	if(Actor.getExp(act) < Actor.getLevelUpCost(act)){
		return Message.add(act.id,'You don\'t have enough exp to level up.');
	}
	Actor.addExp(act,-Actor.getLevelUpCost(act),false);
	act.skill.lvl++;
	Message.addPopup(act.id,'Level up! You are now level ' + act.skill.lvl + '.<br>You gained an additional Reputation Point',25*60);
	Main.reputation.updatePt(Actor.getMain(act));
}

})(); //{






