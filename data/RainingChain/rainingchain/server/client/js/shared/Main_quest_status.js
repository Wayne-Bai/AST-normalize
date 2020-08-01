//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var Actor = require2('Actor'), Competition = require2('Competition'), Party = require2('Party'), Debug = require2('Debug'), Main = require2('Main'), Highscore = require2('Highscore'), Message = require2('Message'), Quest = require2('Quest');
var Dialog = require4('Dialog'), ItemList = require4('ItemList'), QueryDb = require4('QueryDb');
var Main = require3('Main');

var REMOVAL_ORB_CHANCE = 0.1;
var CYCLE_REMOVE_SCORE = 1;
var CYCLE_REMOVE_EXP = 0.2;
var CYCLE_REMOVE_ITEM = 0.2;
var CYCLE_MIN_SCORE = 1;
var CYCLE_MIN_EXP = 0;
var CYCLE_MIN_ITEM = 0;


//## START ##################

Main.startQuest = function(main,qid){
	var mq = main.quest[qid];
	if(!mq) return Main.addMessage(main,'Wrong Input.');
	
	if(main.questActive) 
		return Message.addPopup(main.id,'You can only have 1 active quest at once. Finish or abandon the quest "' + Quest.get(main.questActive).name + '" before starting a new one.');
	
	//if(!Party.isLeader(main.id))
	//	return Message.addPopup(main.id,'Only the leader can start a quest.');
	
	var chal = mq._challenge;
	var q = Quest.get(qid);
	
	if(Party.getSize(Main.getParty(main)) > q.maxParty)
		return Message.addPopup(main.id,'Maximum party size: ' + q.maxParty + '.');
	
	Party.forEach(Main.getParty(main),function(key2){
		var main2 = Main.get(key2);
		main2.quest[qid]._challenge = Tk.deepClone(chal);
		
		/* comment => guy never compelted quest but can do chal if leader has done quest
		for(var i in chal) 
			if(chal[i]) 
				if(!Challenge.toggle.test(Challenge.get(i),main2)) return false;
		*/	
		Quest.addQuestVar(q,main2);
		Main.startQuest.action(main2,qid);
	});
	Quest.onStart(q,main);
	
	
	
	
	return true;
}
Main.startQuest.action = function(main,qid){
	var mq = main.quest[qid];
	mq._started = 1;
	mq._startTime = Date.now();
	main.questActive = qid;
	
	Party.setQuest(Main.getParty(main),qid);
	Debug.onStartQuest(main.id,qid);
	Actor.enablePvp(Main.getAct(main),false);
	Actor.fullyRegen(Main.getAct(main));
	Main.closeDialogAll(main);
	Main.setFlag(main,'questActive');
	Main.updateQuestHint(main);
}
//## COMPLETE ##################

Main.completeQuest = function(main){
	var qid = main.questActive;
	if(!qid) return ERROR(3,'no active quest');
	var mq = main.quest[qid];
	var q = Quest.get(qid);
	
	var firstTimeCompleted = mq._complete === 0;
	mq._complete++;
	Main.setFlag(main,'quest',qid);
	Main.displayQuestRating(main,qid);
		
	q.event._complete(main.id);
	
	var challengeSuccess = Quest.getChallengeSuccess(q,main,mq);
	var dailyTaskSucess = Main.verifyDailyTask(main,q,challengeSuccess);
	var rawBonus = Main.quest.updateBonusVar(mq,q,challengeSuccess,dailyTaskSucess);	//format mq.bonus
	var finalBonus = Main.quest.compileBonusVar(rawBonus);	//format Quest.RewardInfo, doesnt have scoreMod
	var scoreMod = Quest.getScoreMod(q,main);
	var reward = Quest.getReward(q,finalBonus,scoreMod,firstTimeCompleted,main.id);
	Main.quest.applyReward(main,reward,mq,q);
	
	var highscoreInfo = Highscore.setNewScore(q,main,mq);	//after reward
	Competition.onQuestComplete(main.id,highscoreInfo);
	Main.completeQuest.updateGlobalHighscore(main);
	
	Main.questCompleteDialog(main,Tk.deepClone(mq),q,challengeSuccess,dailyTaskSucess,rawBonus,finalBonus,reward,scoreMod);
	//Tk.deepClone needed cuz asyn highscore and updateCycle change mq
	
	Main.quest.updateCycle(mq);
	//Main.quest.grantRemovalOrb(main);	//no longer used
	
	Main.resetQuest(main);
	
	if(q.id !== 'Qtutorial' && Math.random() < 1/20)
		Actor.teleport.town(Main.getAct(main));
}
Main.completeQuest.updateGlobalHighscore = function(main){
	for(var i in Quest.DB){
		var q = Quest.get(i);
		if(!q.globalHighscore) continue;
		Highscore.setNewScore(q,main,main.quest[i]);
	}
}


Main.quest.updateCycle = function(mq){
	mq._bonus.cycle.score = Math.max(mq._bonus.cycle.score-CYCLE_REMOVE_SCORE,CYCLE_MIN_SCORE);
	mq._bonus.cycle.exp = Math.max(mq._bonus.cycle.exp-CYCLE_REMOVE_EXP,CYCLE_MIN_EXP);
	mq._bonus.cycle.item = Math.max(mq._bonus.cycle.item-CYCLE_REMOVE_ITEM,CYCLE_MIN_ITEM);
}

Main.quest.grantRemovalOrb = function(main){
	if(Math.random() < REMOVAL_ORB_CHANCE) 
		Main.addItem(main,'orb-removal',1);
}

Main.quest.applyReward = function(main,reward,mq){
	Main.addItem(main,reward.item);
	Actor.addExp(Main.getAct(main),reward.exp);
	
	mq._rewardScore += reward.score; 
	
	Main.reputation.updatePt(main);
}

Main.quest.updateBonusVar = function(mq,q,challengeSuccess,dailyTaskSuccess){
	var b = mq._bonus;
	b.challenge = Quest.RewardInfo(1,1,1);

	for(var i in challengeSuccess){
		if(challengeSuccess[i]){
			b.challenge.item *= q.challenge[i].bonus.success.item;
			b.challenge.exp *= q.challenge[i].bonus.success.exp;
			b.challenge.score *= q.challenge[i].bonus.success.score;
		} else {
			b.challenge.item *= q.challenge[i].bonus.failure.item;
			b.challenge.exp *= q.challenge[i].bonus.failure.exp;
			b.challenge.score *= q.challenge[i].bonus.failure.score;
		}
	}
	if(dailyTaskSuccess){
		b.challenge.item += 2;
		b.challenge.exp += 4;
		b.challenge.score += 10;
	}
	
	return b;
}

Main.quest.compileBonusVar = function(bonus,includeChallenge){
	var tmp = Quest.RewardInfo(1,1,1);
	for(var i in bonus){
		if(i === 'challenge' && includeChallenge === false) continue;
		for(var j in bonus[i])	// {challenge:{item:1
			tmp[j] *= bonus[i][j];
	}
	return tmp;
}

//## RESET ##################

Main.abandonQuest = function(main){
	if(!main.questActive) return;
	//if(!Party.isLeader(main.id)) return Main.addMessage(main,"Only the leader can abandon a quest.");
	Party.forEach(Main.getParty(main),function(key2){
		Main.abandonQuest.action(Main.get(key2));
	});
}

Main.abandonQuest.action = function(main){
	if(!main.questActive) return;
	var q = Quest.get(main.questActive);
	Quest.onAbandon(q,main);
	Main.resetQuest(main,true);
	Main.addMessage(main,'You failed the quest ' + q.name + '.');
}

Main.resetQuest = function(main,abandon){
	var qid = main.questActive;
	if(!qid) return;
	var q = Quest.get(qid);
	var mq = main.quest[qid];
	
	main.questActive = '';
	Main.setFlag(main,'questActive');
	if(!abandon){
		mq._enemyKilled = 0;
		mq._skillPlot = [0,0,0,0,0,0,0,0];
	}
	
	Quest.onReset(q,main);
	Party.setQuest(Main.getParty(main),null);
	Main.updateQuestHint(main,qid);
}

Main.getSimpleQuestBonus = function(main,quest){	//for enemy killed and skilplot
	return Main.quest.compileBonusVar(main.quest[quest]._bonus,false);
}

Main.questCompleteDialog = function(main,mq,q,challengeSuccess,dailytaskSuccess,rawBonus,finalBonus,reward,scoreMod){
	if(!q.showWindowComplete) return;
	var tmp = {	//window quest complete will be send to client
		quest:q.id,
		scoreModInfo:q.scoreModInfo,
		maxReputationPt:q.reward.reputation.max,
		scoreBase:q.reward.reputation.mod,
		
		challengeSuccess:challengeSuccess,
		dailytaskSuccess:dailytaskSuccess,
		rawBonus:rawBonus,
		finalBonus:finalBonus,
		reward:reward,
		scoreMod:scoreMod,
		
		highscoreScore:{},
		
		_complete:mq._complete,
		_rewardScore:mq._rewardScore,
		_challengeDone:mq._challengeDone,
		
	};	
	
	var count = 0;
	var maxcount = 0;
	if(q.highscore.$isEmpty())
		return Main.openDialog(main,'questComplete',tmp);
	
	
	var helper = function(i){
		return function(score){
			tmp.highscoreScore[i] = score;
			if(++count === maxcount){
				if(!Main.get(main.id)) return;	//case player dced
				Main.openDialog(main,'questComplete',tmp);
			}
		}
	}
	for(var i in q.highscore){
		maxcount++;
		Highscore.fetchScore(i,main.username,helper(i));
	}
	
	
}

Main.quest.init = function(){
	Dialog.create('questComplete','Quest Complete!',Dialog.Size(600,550),Dialog.Refresh(function(html,variable,param){
		var q = QueryDb.get('quest',param.quest,function(){
			Dialog.refresh('questComplete',param);
		});
		if(!q) return false;
		
		if(!param.reward.item.$isEmpty()){
			var item = ItemList.stringify(param.reward.item,function(){
				Dialog.refresh('questComplete',param);
			});
			if(!item) return false;
		}
		
		html.append('<h2 class="u">Quest "' + q.name + '" Complete!</h2>');
		
		if(param.dailytaskSuccess) 
			html.append('<h4 class="u">Daily Task Completed!</h4>');
		
		//Score
		html.append($('<div>')
			.append($('<u>Reward: </u>').css({fontSize:'1.4em'}))
			.append(' ',$('<button>')
				.addClass('myButton skinny')
				.html('Expands')
				.click(function(){
					contentScore.toggle();
				})
			)
		);
		
		html.append($('<span>')
			.attr('title','Score impacts GEM. Score result depends Performance and Score Bonus.')
			.html('Score: ' + param.reward.score.r(0) + '<br>' )
			.css({marginLeft:'20px'})
		);
		html.append($('<span>')
			.attr('title','Exp gained')
			.html('Exp: +' + param.reward.exp.r(0) + ' exp<br>' )
			.css({marginLeft:'20px'})
		);
				
		html.append($('<span>')
			.attr('title','Item gained')
			.html('Item: ' + (ItemList.stringify(param.reward.item) || 'None') + '<br>' )	//TEMP BAD
			.css({marginLeft:'20px'})
		);
		
		
		var contentScore = $('<div>');
		contentScore.append($('<span>')
			.attr('title','Base Score for this quest. Always the same.')
			.html('Base: ' + param.scoreBase + '<br>')
			.css({marginLeft:'20px'})
		);
		contentScore.append($('<span>')
			.attr('title',param.scoreModInfo)
			.html('Performance Bonus: x' + param.scoreMod.r(2) + '<br>')
			.css({marginLeft:'20px'})
		);
		
		contentScore.append($('<span>')
			.attr('title','Sum of all Quest Scores for this quest. Repeat the quest to increase it as many times as you want.')
			.html('Cumulative Quest Score: ' + param._rewardScore.r(0) + ' / 10000<br>')
			.css({marginLeft:'20px'})
		);
		
		
		html.append(contentScore);
		contentScore.hide();
		html.append('<br>');
		
		
		//Reward Bonus
		html.append($('<div>')
			.append($('<u>Reward Bonus:</u>').css({fontSize:'1.4em'}))
			.append(' ',$('<button>')
				.addClass('myButton skinny')
				.html('Expands')
				.click(function(){
					contentReward.toggle();
				})
			)
		);
		
		var contentReward = Dialog.quest.generateBonusArray(param.rawBonus,param.challengeSuccess,param._challengeDone);
		var score = Tk.arrayToTable.access(contentReward,1,4).replace('<u>','').replace('</u>','');
		var exp = Tk.arrayToTable.access(contentReward,2,4).replace('<u>','').replace('</u>','');
		var item = Tk.arrayToTable.access(contentReward,3,4).replace('<u>','').replace('</u>','');
		html.append($('<span>')
			.html('Score: ' + score + ', Exp: ' + exp + ', Item: ' + item)
			.css({marginLeft:'20px'})
		);
		contentReward.hide();
		
		html.append(contentReward);
		html.append('<br>');
		html.append('<br>');
		
		
		//Challenge
		html.append($('<div>')
			.append($('<u>Challenge Status:</u>').css({fontSize:'1.4em'}))
			.append(' ',$('<button>')
				.addClass('myButton skinny')
				.html('Show')
				.click(function(){
					contentChallenge.toggle();
				})
			)
		);
		var array = [];
		for(var i in param.challengeSuccess){
			var success = param.challengeSuccess[i];
			
			var star = $('<span>')
				.css({color:param._challengeDone[i] ? 'orange': 'gray'})
				.attr('title',param._challengeDone[i] ? 'Completed at least once': 'Never completed')
				.html(CST.STAR);
			//####
			var name = $('<span>')
				.css({color:success ? '#00AA00' : '#FF0000'})
				.html($('<b>')
					.html(q.challenge[i].name + ': ')
					.attr('title',q.challenge[i].description)
				);
			//####
			var str;
			if(success === null) str = 'Not Active';
			else {
				if(success)	str = 'Success! => x' + q.challenge[i].bonus.success.score;
				else str = 'Failure...';
			}
			
			var sucessHtml = $('<span>')
				.css({color:success ? '#00AA00' : '#FF0000'})
				.html(str);
			//####		
			var perm = $('<span>')
				.css({color:param._challengeDone[i] ? '#00AA00' : '#FF0000'})
				.html(param._challengeDone[i] ? 'Perm Bonus: x' + q.challenge[i].bonus.perm.score : ' No Perm Bonus')
				.attr('title','Bonus for completing the challenge at least once.')
			
			array.push([
				star,
				name,
				sucessHtml,
				perm		
			]);
			
		}
		var contentChallenge = Tk.arrayToTable(array,false,false,false,'10px 0');
		contentChallenge.hide();
		html.append(contentChallenge);
		html.append('<br>');
		
		
		
		
		
		
		//Highscore
		html.append($('<div>')
			.append($('<u>Highscore:</u>').css({fontSize:'1.4em'}))
			.append(' ',$('<button>')
				.addClass('myButton skinny')
				.html('Show')
				.click(function(){
					contentHighscore.toggle();
				})
			)
		);
		var contentHighscore = $('<div>');
		var helper = function(i){
			return function(){
				Dialog.open('highscore',i);
			}
		}
		for(var i in param.highscoreScore){
			var c = param.highscoreScore[i];
			var high = $('<a>')
				.attr('title','Open Highscore Window')
				.html('<b>' + QueryDb.getHighscoreName(i) + ' - </b>Score: ' + c.value + ' | Rank: ' + c.rank)
				.click(helper(i));
			contentHighscore.append(high);
			contentHighscore.append('<br>');
		}
		contentHighscore.hide();
		html.append(contentHighscore);
		
		
		
		
	}));
}

})(); //{















