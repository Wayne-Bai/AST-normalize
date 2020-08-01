//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var Message = require2('Message'), Actor = require2('Actor'), OptionList = require2('OptionList'), ItemModel = require2('ItemModel'), ItemList = require2('ItemList');
var Main = require3('Main');


var MAX_BANK_SIZE = 75;

Main.ItemList = function(key,list){
	return ItemList.create(key,list);
}

Main.ItemList.compressDb = Main.ItemList.compressDb = function(list){
	return list.data;
}

Main.ItemList.uncompressDb = function(list,key){
	var inv = Main.ItemList(key,list);
	
	//checkIntegrity is done in Sign.in.loadMain
	/*
	if(!Main.ItemList.checkIntegrity(inv)){
		setTimeout(function(){
			if(Main.get(key))
				Message.add(key,'Sorry, we can\'t find the data about one or multiples items you own... :('); 
		},1000);
	}
	*/
	return inv;
}

Main.ItemList.compressClient = function(list){
	return list.data;
}

Main.ItemList.uncompressClient = function(list){
	return ItemList.create(key,list);
}

Main.ItemList.checkIntegrity = function(inv){
	var good = true;
	for(var i in inv.data){
		if(!ItemModel.get(i)){
			ERROR(2,'cant find item',i);
			delete inv.data[i];
			good = false;
		}
	}
	return good;
};

Main.ItemList.loop = function(main){
	if(!main.tradeInfo.otherId) return;
	
	var main2 = Main.getTradingWith(main);
	if(!main2) return Main.stopTrade(main);
	
	var selfInTheory = Main.getTradingWith(main2);
	if(selfInTheory !== main){
		return Main.stopTrade(main);
	}
}

Main.getUpdatedTradeInfo = function(main){
	var main2 = Main.getTradingWith(main);
	if(!main2){
		Main.stopTrade(main);
		return main.tradeInfo;
	}
	return {
		otherId:main2.username,
		data:Main.ItemList.compressClient(main2.tradeList),
		acceptSelf:main.tradeInfo.acceptSelf,
		acceptOther:main.tradeInfo.acceptOther
	}
}


Main.stopTrade = function(main){
	ItemList.transfer(main.tradeList,main.invList,main.tradeList.data,undefined,true);
	Main.closeDialog(main,'trade');
	main.tradeInfo.acceptSelf = false;
	main.tradeInfo.acceptOther = false;
	var main2 = Main.getTradingWith(main);
	main.tradeInfo.otherId = '';
	if(main2){
		main2.tradeInfo.otherId = '';
		Main.stopTrade(main2);	
	}
}

Main.doTrade = function(main){
	var main2 = Main.get(main.tradeInfo.otherId);
	if(!main2) return Main.stopTrade(main);
	
	var trade = Tk.deepClone(main.tradeList.data);
	var trade2 = Tk.deepClone(main2.tradeList.data);
	ItemList.transfer(main.tradeList,main2.invList,trade);
	ItemList.transfer(main2.tradeList,main.invList,trade2);
	Main.stopTrade(main);
	Main.stopTrade(main2);
	Main.addMessage(main,'Successful trade.');
	Main.addMessage(main2,'Successful trade.');
}

Main.getTradingWith = function(main){
	return Main.get(main.tradeInfo.otherId);
}	

Main.setTradeAcceptSelf = function(main,value){
	var main2 = Main.getTradingWith(main);
	if(!main2) return Main.stopTrade(main);
	
	main.tradeInfo.acceptSelf = value;
	main2.tradeInfo.acceptOther = value;
	
	if(main.tradeInfo.acceptSelf && main2.tradeInfo.acceptSelf){
		Main.doTrade(main);
	}	
	Main.setFlag(main,'tradeInfo');
	Main.setFlag(main2,'tradeInfo');
}

Main.startTrade = function(main,main2){	//shoul be requesting first
	main.tradeInfo.otherId = main2.id;
	main2.tradeInfo.otherId = main.id;
	Main.setTradeAcceptSelf(main,false);
	Main.setTradeAcceptSelf(main2,false);
	Main.openDialog(main,'trade');
	Main.openDialog(main2,'trade');
}



Main.isTrading = function(main){
	return !!Main.getTradingWith(main);
}

Main.canUseBank = function(main){
	if(!Actor.isNearBank(Main.getAct(main)))
		return Main.addMessage(main,'Access denied.');
	return true;
}

Main.addItem = function(main,id,amount){
	return ItemList.add(main.invList,id,amount);
}

Main.removeItem = function(main,id,amount){
	return ItemList.remove(main.invList,id,amount);
}

Main.haveItem = function(main,id,amount){
	return ItemList.have(main.invList,id,amount);
}

Main.getItemAmount = function(main,id){
	return ItemList.getAmount(main.invList,id);
}

Main.addItemBank = function(main,id,amount){
	ItemList.add(main.bankList,id,amount);
}

//###########################

Main.transferInvBank = function(main,id,amount){
	if(!Main.canUseBank(main)) return;
	
	if(!ItemModel.get(id)) return;
	if(!ItemModel.get(id).bank) return Main.addMessage(main,'You can\'t bank this item.');
	
	if(main.bankList.data.$keys().length > MAX_BANK_SIZE)
		return Message.addPopup(main.id,'You have too many items in your bank. You need to salvage unused equipments.');
		
	amount = Math.min(amount,Main.getItemAmount(main,id));
	if(amount === 0) return;
	ItemList.transfer(main.invList,main.bankList,id,amount);
}

Main.transferInvBankAll = function(main,id,amount){
	var toTransfer = {};
	for(var i in main.invList.data){
		if(ItemModel.get(i) && ItemModel.get(i).bank)
			toTransfer[i] = main.invList.data[i];
	}
	ItemList.transfer(main.invList,main.bankList,toTransfer);
}

Main.transferBankInv = function(main,id,amount){
	if(!Main.canUseBank(main)) return;
	if(!ItemModel.get(id)) return;
	amount = Math.min(amount,ItemList.getAmount(main.bankList,id));
	if(amount === 0) return;
	ItemList.transfer(main.bankList,main.invList,id,amount);
}

Main.transferInvTrade = function(main,id,amount){
	var main2 = Main.getTradingWith(main);
	if(!main2) return Main.stopTrade(main);
	
	if(!ItemModel.get(id)) return;
	if(!ItemModel.get(id).trade) return Main.addMessage(main,'You can\'t trade this item.');
	amount = Math.min(amount,Main.getItemAmount(main,id));
	if(amount === 0) return;
	ItemList.transfer(main.invList,main.tradeList,id,amount);
	
	Main.setTradeAcceptSelf(main,false);
	Main.setTradeAcceptSelf(main2,false);
	Main.setFlag(main2,'tradeInfo');	//duplicate but makes more sense
}

Main.transferTradeInv = function(main,id,amount){
	var main2 = Main.getTradingWith(main);
	if(!main2) return Main.stopTrade(main);
	
	if(!ItemModel.get(id)) return;
	amount = Math.min(amount,ItemList.getAmount(main.tradeList,id));
	if(amount === 0) return;
	ItemList.transfer(main.tradeList,main.invList,id,amount);
	
	Main.setTradeAcceptSelf(main,false);
	Main.setTradeAcceptSelf(main2,false);
	Main.setFlag(main2,'tradeInfo');	//duplicate but makes more sense
}

Main.useItem = function(main,id,slot){
	if(!Main.haveItem(main,id)) return;
	var item = ItemModel.get(id);
	if(!item) return;
	var option = item.option[slot];
	if(!option) return;
	OptionList.executeOption(main,option);
}



})(); //{











