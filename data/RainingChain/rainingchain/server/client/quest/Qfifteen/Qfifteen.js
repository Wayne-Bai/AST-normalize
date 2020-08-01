//02/14/2015 5:30 PM
/*jslint node: true, undef:true, sub:true, asi:true, funcscope:true, forin:true, unused:false*//*global True, False, loadAPI*/
/*Go to http://jshint.com/ and copy paste your code to spot syntax errors.*/

'use strict';
var s = loadAPI('v1.0','Qfifteen',{
	name:"15-Puzzle",
	author:"rc",
	thumbnail:true,
	description:"Place 15 blocks in the right order by pushing them.",
	maxParty:1,
	scoreModInfo:"Depends on your time."
});
var m = s.map; var b = s.boss; var g;

/* COMMENT:
16 = empty
*/

s.newVariable({
	pushCount:0,
	goalOrder:'',
	currentOrder:'',
	lastClick:0,
});

s.newHighscore('speedrun',"Fastest Time [Easy]","Fastest Completion",'ascending',function(key){
	return s.stopChrono(key,'timer') * 40;
});
s.newHighscore('speedrunShuffle',"Fastest Time [Shuffle]","Fastest Completion with Challenge Shuffle active.",'ascending',function(key){
	if(!s.isChallengeActive(key,'shuffle')) 
		return null;
	return s.stopChrono(key,'timer') * 40;
});
s.newHighscore('leastPush',"Least Push","Least Amount of Block Pushed",'ascending',function(key){
	return s.get(key,'pushCount');
});

s.newChallenge('speedrun',"Speedrunner","Complete the quest in less than 1 minute.",2,function(key){
	return s.stopChrono(key,'timer') < 25*1*60;
});
s.newChallenge('wise',"Master Mind","Complete the quest in less than 125 moves.",2,function(key){
	return s.get(key,'pushCount') < 125;
});
s.newChallenge('shuffle',"Shuffle","You need to order the numbers in a custom order.",2.5,function(key){
	return true;
});

s.newEvent('_start',function(key){ //
	if(s.isAtSpot(key,'QfirstTown-north','n1',200))
		s.callEvent('startGame',key);
	else s.addQuestMarker(key,'start','QfirstTown-north','n1');
});
s.newEvent('_signIn',function(key){ //
	s.failQuest(key);
});
s.newEvent('_signOff',function(key){ //
	s.failQuest(key);
});
s.newEvent('_abandon',function(key){ //
	s.teleport(key,'QfirstTown-north','n1','main',false);
});
s.newEvent('_complete',function(key){ //
	s.callEvent('_abandon',key);
});
s.newEvent('_death',function(key){ //
	s.failQuest(key);
});
s.newEvent('_hint',function(key){ //
	if(s.isChallengeActive(key,'shuffle')){
		var array;
		try {
			array = JSON.parse(s.get(key,'goalOrder'));
		} catch(err){ return ''; };
	
		return 'Place numbers in this order: <br> ' 
			+ array[0].toString() + '<br> ' 
			+ array[1].toString() + '<br> ' 
			+ array[2].toString() + '<br> ' 
			+ array[3].toString();
	}
	return 'Place the blocks in ascending order.<br>Empty spot should be at bottom right.';
});
s.newEvent('getRandomGrid',function(){ //
	var tmp;
	do {
		tmp = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16].sort(function(){ return Math.randomML(); });
	} while(!s.callEvent('isSolvable',tmp));
	
	var res = [];
	for(var i = 0 ; i < 4 ; i++){
		res[i] = [];
		for(var j = 0 ; j < 4 ; j++){
			res[i][j] = tmp[i*4+j];
		}
	}
	return res;
});
s.newEvent('isSolvable',function(array){ //
	var count = 0;
	for(var i = 0 ; i < array.length; i++)
		for(var j = i ; j < array.length; j++)
			if(array[i] !== 16 && array[i] > array[j]) count++;
			
	if(!(array.indexOf(16) <= 3 || (array.indexOf(16) >= 8 && array.indexOf(16) <= 11)))
		count++;
	return count % 2;
});
s.newEvent('viewPreventBlock',function(key){ //
	return !s.isPlayer(key);
});
s.newEvent('startGame',function(key){ //teleport and spawn enemy
	s.startChrono(key,'timer',true);
	s.teleport(key,'field','t1','party',true);
	s.enableAttack(key,false);
	if(s.isChallengeActive(key,'shuffle'))
		s.displayPopup(key,'Place the blocks in the order specified in the hint below the minimap.');
	else
		s.displayPopup(key,'Place the blocks in ascending order.');
	
	
	var spawnGrid = s.callEvent('getRandomGrid');
	var goalGrid = s.isChallengeActive(key,'shuffle') 
		? s.callEvent('getRandomGrid') 
		: [[1,2,3,4],[5,6,7,8],[9,10,11,12],[13,14,15,16]];
	
	s.set(key,'goalOrder',JSON.stringify(goalGrid));
	s.set(key,'currentOrder',JSON.stringify(spawnGrid));
	
	for(var i = 0; i < spawnGrid.length; i++){
		for(var j = 0; j < spawnGrid.length; j++){
			var num = spawnGrid[i][j];
			if(num === 16) continue;
			var spawnSpot = s.getSpot(key,'field','b1');
			spawnSpot.x += j*64;
			spawnSpot.y += i*64;
			
			m.spawnActor(spawnSpot,'pushable-rock2x2',{
				tag:{
					number:spawnGrid[i][j],
					type:'piece',
				},
				block:s.newNpc.block(s.newNpc.block.size(2,2),1,0,1,0),	//idk
				sprite:s.newNpc.sprite('number-' + spawnGrid[i][j],1),
				pushable:s.newNpc.pushable(8,8,null,true),
				ghost:true,
				onclick:s.newNpc.onclick(
					null,
					null,
					s.newNpc.onclick.side('Push','clickBlock'),
					s.newNpc.onclick.side('Push','clickBlock')
				),
			});
		}
	}
});
s.newEvent('clickBlock',function(key,eid){ //
	if(Date.now() - s.get(key,'lastClick') < 250)
		return;
	s.set(key,'lastClick',Date.now());

	var currentOrder;
	try {
		currentOrder = JSON.parse(s.get(key,'currentOrder'));
	} catch(err){ return; };
	
	var numClicked = s.getTag(eid).number; 
	
	var x;
	var y;
	for(var i = 0 ; i < currentOrder.length; i++){
		for(var j = 0 ; j < currentOrder.length; j++){
			if(currentOrder[i][j] === numClicked){
				x = j;
				y = i;
				break;
			}
		}
	}
	
	if(currentOrder[y][x+1] === 16){
		s.simulatePush(eid,'right');
		currentOrder[y][x+1] = numClicked;
		currentOrder[y][x] = 16;
	}
	else if(currentOrder[y][x-1] === 16){
		s.simulatePush(eid,'left');
		currentOrder[y][x-1] = numClicked;
		currentOrder[y][x] = 16;
	}
	else if(currentOrder[y-1] && currentOrder[y-1][x] === 16){
		s.simulatePush(eid,'up');
		currentOrder[y-1][x] = numClicked;
		currentOrder[y][x] = 16;
	}
	else if(currentOrder[y+1] && currentOrder[y+1][x] === 16){
		s.simulatePush(eid,'down');
		currentOrder[y+1][x] = numClicked;
		currentOrder[y][x] = 16;
	}
	else return; //aka cant push block
	
	s.add(key,'pushCount',1);
	s.set(key,'currentOrder',JSON.stringify(currentOrder));
	
	if(s.get(key,'currentOrder') === s.get(key,'goalOrder')){	//both stringify
		s.setTimeout(key,function(key){
			s.completeQuest(key);
		},25*3);
	}
});

s.newMap('field',{
	name:"15-Puzzle",
	lvl:0,
	grid:["111111111111111111","111111111111111111","111111111111111111","111111111111111111","111111111111111111","111000000000000111","111000000000000111","111000000000000111","111000000000000111","111000000000000111","111000000000000111","111000000000000111","111000000000000111","111000000000000111","111000000000000111","111000000000000111","111000000000000111","111111111111111111","111111111111111111","111111111111111111"],
	tileset:'v1.2'
},{
	spot:{b1:{x:192,y:256},t1:{x:288,y:352}},
	load:function(spot){
		
	}
});
s.newMapAddon('QfirstTown-north',{
	spot:{n1:{x:3152,y:2448}},
	load:function(spot){
		m.spawnTeleporter(spot.n1,'startGame','zone',{
			minimapIcon:'minimapIcon.quest',
			angle:s.newNpc.angle('right'),
		});
	}
});

s.exports(exports);
