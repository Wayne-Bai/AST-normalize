//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
//"use strict";
var SERVER = false;
var key = '';
var player = {};
var main = {};

var exports = {};
exports.m = function(){ for(var i in this) window[i] = exports[i]; }
var require4List = {};

var require = function(){}	//server
	
var require3 = function(str){	//instant request
	if(!exports[str]) exports[str] = {}; // for Combat_client...
	return exports[str];	
}

var require2 = require4 = function(str){	//works because if declated=>good, if not, then when declaring, it will overwrite value
	if(require4List[str])
		return require4List[str];
	require4List[str] = {};
	return require4List[str];
	
	//return window[str];
}	


var initRequire4 = function(){
	for(var i in exports){
		for(var j in exports[i]){
			if(require4List[i])	//case CST...
				require4List[i][j] = exports[i][j];				
		}
	}
}

$(document).ready(function() {
	initRequire4();
	
	exports.Sign.init();
	$(document).tooltip({
		items: '*:not(.ui-dialog-titlebar-close)',
		show:false,
		hide:false,
		tooltipClass: "toolTipDetails",
	});
});








