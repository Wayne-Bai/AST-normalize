/*
 Copyright (c) Shelloid Systems LLP. All rights reserved.
 The use and distribution terms for this software are covered by the
 GNU Lesser General Public License 3.0 (https://www.gnu.org/licenses/lgpl.html)
 which can be found in the file LICENSE at the root of this distribution.
 By using this software in any fashion, you are agreeing to be bound by
 the terms of this license.
 You must not remove this notice, or any other, from this software.
 */
var os = require("os");

module.exports = function(){
	return extInfo;
} 

var extInfo = 
{
	hooks:[
	{type: "init", handler: initNode, priority: 
	sh.hookPriorities.start}
	]
};

function initNode(done){
	discoverNode(sh.appCtx.config);
	done();
}

function discoverNode(config){
	var hostname = os.hostname().toLowerCase();
	var ips = config.node.ips;
	var ifaces = os.networkInterfaces();
	var addressTypes = config.node.addressTypes;
	var interfaces = config.node.interfaces;
	for(var i=0;i<addressTypes.length;i++){
		addressTypes[i] = addressTypes[i].toLowerCase();
	}
	for(var i=0;i<interfaces.length;i++){
		interfaces[i] = interfaces[i].toLowerCase();
	}
	
	Object.keys(ifaces).forEach(function (ifname) {
	  ifaces[ifname].forEach(function (iface) {
		//iface.family not used at the moment.
		var family = iface.family.toLowerCase();
		ifname = ifname.toLowerCase();
		if ( (iface.internal === false) &&  addressTypes.contains(family)){
		  if(interfaces.length === 0 ||
			 interfaces.contains(ifname)){
			  ips.push(iface.address);
		  }
		}
	  });
	});	
		
	Object.keys(config.nodes).forEach(function(name){
		var addr = config.nodes[name];
		if(ips.indexOf(addr) >= 0 || addr.toLowerCase() == hostname){
			config.node.is[name] = true;
			config.node.names.push(name);
		}else{
			config.node.is[name] = false;
		}
	});
}

