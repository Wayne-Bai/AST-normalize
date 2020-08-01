define("soomlaAndroid", {

    // Note that the store loading process functions `uiReady` and `storeInitialized`
    // aren't implemented here, because they are provided by
    // Android's injected javascript interface

    wantsToLeaveStore : function() {
		this.nativeAPI.wantsToLeaveStore();
	},
	wantsToBuyVirtualGoods : function(model) {
		this.nativeAPI.wantsToBuyVirtualGoods(model.toJSON().itemId);
	},
	wantsToEquipGoods : function(model) {
		this.nativeAPI.wantsToEquipGoods(model.toJSON().itemId);
	},
	wantsToUnequipGoods : function(model) {
		this.nativeAPI.wantsToUnequipGoods(model.toJSON().itemId);
	},

	playSound :function(filePath) {
		filePath || (filePath = "pop.mp3");
		this.nativeAPI.playSound(filePath);
		return this;
	},


	//
	// New Model API
	//
	wantsToBuyItem : function(itemId) {
		this.nativeAPI.wantsToBuyItem(itemId);
	},
	wantsToRestoreTransactions : function() {
		this.nativeAPI.wantsToRestoreTransactions();
	},
	wantsToUpgradeVirtualGood : function(model) {
		this.nativeAPI.wantsToUpgradeVirtualGood(model.toJSON().itemId);
	},
	wantsToInitiateHook : function(provider, options) {
		this.nativeAPI.wantsToInitiateHook(provider, JSON.stringify(options));
	}
});