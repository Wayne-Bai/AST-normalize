//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";

//HEAVILY DEPENDS ON Actor.move.client, Input.loop.updateStateWithMouse
(function(){ //}
var Input = require4('Input'), Command = require4('Command'), Main = require4('Main'), Performance = require4('Performance'), Message = require4('Message'), Dialog = require4('Dialog'), Receive = require4('Receive');

var ClientPrediction = exports.ClientPrediction = {};

var ACTIVE = false;	
var ABOVE_THRESHOLD_COUNT = 0;
var MODE = 1; //YES,AUTO,NEVER
var lastX = 0;
var lastY = 0;
var HISTORY_SERVER = [];
var HISTORY_XY = [];
var FRAME = 0;

ClientPrediction.YES = 0;	//CST so ok
ClientPrediction.AUTO = 1;
ClientPrediction.NO = 2;

ClientPrediction.getMode = function(){
	return MODE;
}
ClientPrediction.setMode = function(mode){
	MODE = mode;
	if(MODE === ClientPrediction.YES)
		ClientPrediction.activate();
	if(MODE === ClientPrediction.NO)
		ClientPrediction.deactivate();
}

ClientPrediction.isActive = function(){
	return ACTIVE;
}



ClientPrediction.loop = function(){
	ClientPrediction.updatePosition(player);
	
	if(FRAME++ % (25*4) !== 0) return;
	//Auto activation
	if(MODE !== ClientPrediction.AUTO) return;
	if(!Input.isWindowActive()) return;
	
	
	var thres = Main.getPref(main,'clientPredictionThreshold');
	var latency = Performance.getLatency();
	if(latency > thres)	ABOVE_THRESHOLD_COUNT++;
	else ABOVE_THRESHOLD_COUNT--;
	ABOVE_THRESHOLD_COUNT = Math.max(ABOVE_THRESHOLD_COUNT,-4);
	ABOVE_THRESHOLD_COUNT = Math.min(ABOVE_THRESHOLD_COUNT,4);
	
	if(ABOVE_THRESHOLD_COUNT >= 4 && !ACTIVE){
		ClientPrediction.askForActivation();
	} 
	if(ABOVE_THRESHOLD_COUNT <= -4 && ACTIVE){
		Message.add(key,'The client prediction system was deactivated as it seems you are lagging less.');
		ClientPrediction.deactivate();
	}
}

ClientPrediction.activate = function(){
	ACTIVE = true;
	Input.setUseMouseForMove(true);
	Message.add(key,'The client prediction system was activated. You can deactivate it via the Setting Tab.');
}
ClientPrediction.deactivate = function(){
	ACTIVE = false;
	Input.setUseMouseForMove(false);	
	Message.add(key,'The client prediction system was deactivated.');
}

ClientPrediction.askForActivation = function(){
	Message.addPopup(key,$('<div>')
		.append('It seems you are lagging.<br>')
		.append('Do you want to activate the <u>BETA</u> client prediction system?<br><br>')
		.append('If activated, you will <u>react faster</u> and you will <u>move using the mouse</u> instead of the keyboard.<br><br>')
		.append('You can deactivate it via the Setting Tab.<br>')
		.append($('<button>')
			.addClass('myButtonGreen')
			.html('Yes')
			.click(function(){
				ClientPrediction.activate();
				Dialog.close('questPopup');
			})
		)
		.append($('<button>')
			.addClass('myButtonRed')
			.html('No')
			.click(function(){
				MODE = ClientPrediction.NO;
				Message.add(key,'You can activate the Client Prediction at any time via the Setting Tab.');
				Dialog.close('questPopup');
			})
		)
	);
}

ClientPrediction.updateShadow = function(act){
	//check loop
}
/*
ClientPrediction.getServerXYofLastServerStamp = function(act){
	var ping = exports.Performance.getLatency();
	var timeShadow = Date.now() - ping;
		
	for(var i = 0 ; i < HISTORY_SERVER.length; i++){
		if(HISTORY_SERVER[i].timestamp > timeShadow)
			return HISTORY_SERVER[i];
	}
	return HISTORY_SERVER[0] || {x:0,y:0};
}*/

ClientPrediction.addHistoryXY = function(){
	HISTORY_XY.push({timestamp:Date.now(),x:player.x,y:player.y});
	if(HISTORY_XY.length > 50){
		HISTORY_XY.splice(0,10);
	}
}
ClientPrediction.addHistoryServer = function(){
	HISTORY_SERVER.push({timestamp:Date.now(),x:player.serverX,y:player.serverY});
	if(HISTORY_SERVER.length > 50){
		HISTORY_SERVER.splice(0,10);
	}
}

ClientPrediction.getXYofLastServerStamp = function(){
	var good = null;
	var serverTime = Receive.getServerTimestamp();
	for(var i = 0; i < HISTORY_XY.length; i++){
		if(HISTORY_XY[i].timestamp > serverTime){
			good = HISTORY_XY[i];
			break;
		}				
	}
	return good || HISTORY_XY[HISTORY_XY.length-1];
}
ClientPrediction.getServerXYofLastServerStamp = function(){
	var good = null;
	var serverTime = Receive.getServerTimestamp();
	for(var i = 0; i < HISTORY_SERVER.length; i++){
		if(HISTORY_SERVER[i].timestamp > serverTime){
			good = HISTORY_SERVER[i];
			break;
		}				
	}
	return good || HISTORY_SERVER[HISTORY_SERVER.length-1];
}

ClientPrediction.updatePosition = function(act){
	ClientPrediction.addHistoryXY();
	ClientPrediction.addHistoryServer();
	var good = ClientPrediction.getXYofLastServerStamp();
	var server = ClientPrediction.getServerXYofLastServerStamp();
	
	var targetActive = Input.getState('target').active;
	if(!targetActive){	//to sync with server
		server = HISTORY_SERVER[HISTORY_SERVER.length-1];
		good = player;
	}
	
	if(!good || !server) return;
	
	var diffX = server.x - good.x;	//serverX = where u should be
	var diffY = server.y - good.y;	//good.x = where u are according to client calc
		
	var startX = act.x;
	var startY = act.y;
	
	if(Math.abs(diffX) > (targetActive ? 300 : 200)){
		act.x = server.x;
		Input.resetTarget();
	}
	if(Math.abs(diffY) > (targetActive ? 300 : 200)){
		act.y = server.y;
		Input.resetTarget();
	}
	
	var attraction = targetActive ? 2 : 8; //BAD
	if(diffX > 10){
		act.x += Math.min(diffX/2,attraction);
	}
	if(diffX < -10){
		act.x += Math.max(diffX/2,-attraction);
	}
	if(diffY > 10){
		act.y += Math.min(diffY/2,attraction);
	}
	if(diffY < -10){
		act.y += Math.max(diffY/2,-attraction);
	}
	
	act.spdX = act.x - lastX;
	act.spdY = act.y - lastY;
	
	if(Math.abs(player.y-lastY) < 3 && Math.abs(player.x-lastX) < 3)
		player.moveAngle = player.angle;
	else if(Math.abs(player.y-lastY) > 6 || Math.abs(player.x-lastX) > 6)
		player.moveAngle = Tk.atan2(player.y-lastY + 1,player.x-lastX);	//+2 so stop quickly changing
	//else stay same
	
	lastX = player.x;
	lastY = player.y;
}

})(); //{














