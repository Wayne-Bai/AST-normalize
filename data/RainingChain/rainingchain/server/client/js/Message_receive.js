//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var Dialog = require4('Dialog'), Input = require4('Input'), Command = require4('Command'), Main = require4('Main'), Sfx = require4('Sfx');
var Message = require3('Message');

Message.receive = function(msg){
	msg.text = Message.receive.parseInput(msg.text);
	for(var i in main.social.muteList) if(i === msg.from) return; 
	
	if(msg.type === 'game')	Dialog.chat.addText(msg.text,msg.timer || 25*60); 
	else if(msg.type === 'public') Message.receive.public(msg);
	else if(msg.type === 'input')	Dialog.chat.setInput(msg.text,undefined,msg.add);
	else if(msg.type === 'signNotification') Message.receive.signNotification(msg);
	else if(msg.type === 'pm')	Message.receive.pm(msg);
	
	/*
	else if(msg.type === 'clan') 	Message.receive.clan(msg);
	else if(msg.type === 'contribution') Message.receive.contribution(msg);
	*/

	
}

Message.receive.parseInput = function(text){	//replace [$1] with Input 1 keycode
	if(!text || !text.$contains('[$')) return text;
	for(var i = 0 ; i <= 6; i++){
		var str = '[$' + i + ']';
		while(text.$contains(str))
			text = text.replace(str,Input.getKeyName('ability',i,true));	//replaceall with $ is pain
	}
	return text;
}	

Message.receive.public = function(msg){
	var text = $('<span>')
		.append($('<span>')
			.html(
				(Message.receive.public.SYMBOL_CHART[msg.symbol] || '')
				+ msg.from + ': '
			)
			.attr('title',player.name !== msg.from ? 'Shift-Right to mute' : '')
			.bind('contextmenu',function(ev){
				if(player.name !== msg.from && ev.shiftKey)
					Command.execute('mute',[msg.from]);
			})
		)
		.append($('<span>')
			.html(Message.receive.public.getText(msg))
		);
	
	Dialog.chat.addText(text); 
}

Message.receive.public.SYMBOL_CHART = [ //{
	'',
	'<span title="Admin" style="color:white;">✪</span>',
	'<span title="Bronze Contributor" style="color:#CD7F32;">★</span>',
	'<span title="Silver Contributor" style="color:#C0C0C0;">★</span>',
	'<span title="Gold Contributor" style="color:#FFD700;">★</span>',
	'<span title="Diamond Contributor" style="color:white;">★</span>'
]; //}

Message.receive.public.getText = function(msg){
	var color = 'yellow';
	if(msg.color == '1') color = 'pink';
	if(msg.color == '2') color = '#FF5555';
	if(msg.color == '3') color = 'cyan';
	if(msg.color == '4') color = 'orange';
	if(msg.color == '5') color = '#55FF55';
	if(msg.color == '6') msg.text = Message.receive.public.getText.rainbow(msg.text);
	
	return '<span style="color:' + color + ';">' 
	+ msg.text //Message.receive.public.puush(msg)
	+ "</span>";
}

Message.receive.public.getText.rainbow = function(text){
	var list = ['yellow','cyan','pink','#FF5555;','orange','#55FF55'];
	var t = text.split(' ');
	var str = '';
	var lastcolor = '';
	var limit = 0;
	for(var i in t){
		var color;
		do { color = list.$random();
		} while(lastcolor === color && limit++ < 1000);
		lastcolor = color;
		str += '<span style="color:' + color + ';">' + t[i] + ' ' + '</span>';
	}
	return str;
}

Message.receive.public.puush = function(pack){
	var friend = false;
	for(var i in main.social.friendList) if(i === pack.from) friend = true;
	if(pack.from === player.name) friend = true;
	
	var puush = Main.getPref(main,'puush');
	if(pack.from !== Message.ADMIN_USERNAME && puush === 0 || (puush === 1 && friend === false)){
		return pack.text.replaceAll('a href','span href').replaceAll('</a>','</span>');
	}
	return pack.text;
}

//#######

Message.receive.pm = function(msg){
	//Message.receive.pm({from:'asd',to:'asd',text:'hello!'})
	var text;
	if(msg.from === player.name){	//AKA you just sent a pm to someone
		text = $('<span>')
			.html('To ' + msg.to + ': ' +  msg.text);
	} else {
		var from = msg.from === Message.ADMIN_USERNAME ? Message.receive.public.SYMBOL_CHART[1] + Message.ADMIN_USERNAME : msg.from;
		text = $('<span>')
			.html('From ' + from + ': ' +  msg.text)
			.attr('title','Click to reply')
			.click(function(e){
				e.preventDefault();
				Dialog.chat.setInput('@' + msg.from + ',',true);
				//Message.clickUsername(msg.from);
				return false;
			});
		Message.reply.HISTORY.unshift(msg);
	}

	Dialog.pm.addText(text,25*60*5);
}

Message.receive.clan = function(pack){
	var span = $('<span>')
		.css({color:'#00FFFF'})
		.html('[' + pack.clan + '] ' + pack.from + ': ' + pack.text);
	Dialog.chat.addText(span); 
}


Message.receive.contribution = function(pack){
	return/*
	Mess age.addToHtml($("#contributionLog")[0],pack.text,25*15);	
	$("#contributionLog")[0].scrollIntoView(true);*/
}

Message.receive.signNotification = function(msg){
	if(Main.getPref(main,'signNotification') === 0) return;
	Message.receive(Message.Game(msg.text));	
	if(Main.getPref(main,'signNotification') === 2) Sfx.play('train');
}

Message.ADMIN_USERNAME = 'rc';

Message.clickUsername = function(name){	//in public chat
	/*
	use Message.setInputForPM(key,i);
	Main.setOpti onList(main,OptionList.create(name,[
		OptionList.Option(Dialog.chat.setInput,['@' + name + ','],'Send Message'),
		OptionList.Option(Command.execute,['fl,add',[name]],'Add Friend'),
		OptionList.Option(Command.execute,['mute',[name]],'Mute Player'),
	]));
	*/
}

})(); //{
