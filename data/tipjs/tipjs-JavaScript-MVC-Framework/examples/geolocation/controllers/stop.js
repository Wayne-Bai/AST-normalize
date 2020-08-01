tipJS.controller({
	name : "geolocation.stop",
	invoke:function(params){
		tipJS.debug(this.name + " Start");
		// load Model on synchronized Mode
		var globalModel = this.loadModel("globalModelVO", true);
		// globalWatchID
		if(globalModel.watchID == null){
			alert("do nothing");
			return;
		}
		navigator.geolocation.clearWatch(globalModel.watchID);
		// clear
		globalModel.watchID = null;
		
		tipJS.debug(this.name + " Done");
	}
});
