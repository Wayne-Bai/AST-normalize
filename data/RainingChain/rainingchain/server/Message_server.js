//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
var Party = require2('Party'), Account = require2('Account'), ItemModel = require2('ItemModel'), Actor = require2('Actor'), Main = require2('Main');
var Message = require3('Message');
var db;

Message.init = function(dblink){
	db = dblink;
}

Message.add = function(key,textOrMsg){
	Main.addMessage(Main.get(key),textOrMsg);
}

Message.addPopup = function(key,text,time){
	Main.openDialog(Main.get(key),'questPopup',{text:text,time:time || 25*60});
}
		
Message.broadcast = function(text){
	Main.forEach(function(main){
		Main.addMessage(main,text);
	});		
}

//##################

Message.receive = function(key,msg){
	msg.from = Main.get(key).username;
	if(!Message.receive.test(key,msg)) return;
	
	var parse = Message.parseText(msg.text);     	//text
	msg.hasItem = parse.hasItem;
	msg.hasPuush = parse.hasPuush;
	msg.text = parse.text;
	
	
	if(msg.type === 'public') Message.receive.public(key,msg);
	else if(msg.type === 'pm') Message.receive.pm(key,msg); 
	else if(msg.type === 'questionAnswer') Message.receive.question(key,msg); 
	else if(msg.type === 'report') Message.receive.report(key,msg); 
	
	//else if(msg.type === 'clan') Message.receive.clan(key,msg); 
};

Message.receive.test = function(key,msg){
	if(!msg.type || !msg.text || typeof msg.text !== 'string') return false;
	if(msg.to === msg.from) return Message.add(key,"Ever heard of thinking in your head?") || false;
	if(msg.type !== 'feedback' && msg.text.length > 200) return false;	//text too long
	if(Message.receive.ZALGO_REGEX.test(msg.text)) return false;
	if(Main.get(key).social.muted) return false;				//player is muted
	return true;
}

Message.receive.ZALGO_REGEX = /[^\x20-\x7E]/;

Message.receive.public = function(key,msg){
	var act = Actor.get(key);
	var main = Main.get(key);
	
	msg.text = unescape.html(msg.text);	//allow html. but was parsed earlier
	
    if(!msg.hasItem && !msg.hasPuush)
		act.chatHead = Actor.ChatHead(msg.text);
	
	var newMsg = Message.Public(msg.text,msg.from,main.social.customChat);
	Message.add(key,newMsg);
	
	//Send info
	var alreadySentTo = [key];
	for(var i in act.activeList){
		if(!Actor.isPlayer(i)) continue;	//aka non player
		alreadySentTo.push(i);
		Message.add(i,newMsg);
	}
	Party.addMessage(Main.getParty(Main.get(key)),msg,alreadySentTo);

}

Message.receive.pm = function(key,msg){
	if(!Main.canSendMessage(msg.from,msg.to))
		return Message.add(key,"This player is offline.");
	Message.add(Account.getKeyViaName(msg.to),msg);
	Message.add(key,msg);
}

Message.receive.clan = function(key,msg){
	return;/*
    var clanName = Main.get(key).social.clanList[msg.clan];
    if(!clanName) return Message.add(key,'You typed too many \"/\".');
	var clan = Clan.get(clanName);
    if(!clan) return Message.add(key,'This clan doesn\'t exist. Strange...');
    
	var newMsg = Message.Clan(msg.text,msg.from,clan.nick);
	
    for(var i in clan.memberList){	//including speaker
    	if(Actor.isOnline(i))	//is online
			Message.add(Account.getKeyViaUserName(i),newMsg);
    }*/
}    

Message.receive.report = function(key,d){
	if(d.text.length > 1000 && d.title.length > 50) return Message.add(key,'Too long text or title.');
	
	//db.email.report(d.title || '',(d.subcategory || '') + ':' + d.text,name);
	
	return db.report.insert({
		date:new Date().toLocaleString(),
		user:Actor.get(key).username,
		text:d.text,
		title:d.title,
	});
	
}

Message.receive.question = function(key,msg){
	Main.handleQuestionAnswer(Main.get(key),msg);
}

Message.parseText = function(data){	//TODO
	var rawData = data;
	data = Tk.replaceBracketPattern(data,Message.parseText.item);
	
	return {
		text:data,
		hasItem:rawData !== data,
	};	
}

Message.parseText.item = function(id){
	var item = ItemModel.get(id,true);
	if(!item) return '[[' + id + ']]';
	if(item.type !== 'equip') 
		return '[' + item.name + ']';
	
	return '<span ' + 
	'style="color:cyan;cursor:pointer;" ' +
	'onclick="exports.Dialog.open(\'equipPopup\',{id:\'' + item.id + '\',notOwning:true});" ' +
	'>[' + item.name + 
	']</span>';
}




/*
Message.parseText = function(data){
	data = escape.html(data);
	var puush = data;
	data = Tk.replaceCustomPattern(data,'http://puu.sh/','.png',Message.parseText.puush);
	data = Tk.replaceCustomPattern(data,'http://puu.sh/','.jpg',Message.parseText.puush);
	data = Tk.replaceCustomPattern(data,'http://puu.sh/','.txt',Message.parseText.puush);
	var item = data;
	
	return {text:data,item:data !== item,puush:puush !== item};
}


Message.parseText.puush = function(link){
	return	'<a style="color:cyan" href="' + link + '" target="_blank">[' + link.slice(-9,-4) + ']</a>';
}
 

//'http://puu.sh/8H2H1.png'.slice(-9,-4)

*/













