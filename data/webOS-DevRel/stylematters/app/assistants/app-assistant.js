function AppAssistant(appController) {
	this.mainstageController;
}
		
AppAssistant.prototype.handleLaunch = function(params) {

	if(params && this.mainstageController){
		Mojo.Log.info("Style matters relaunch with arguments: ");
		this.mainstageController.assistant.launchWithParams(params, stageController);
	}else if(this.mainstageController){
		Mojo.Log.info("Style matters relaunch without arguments: ");
		this.mainstageController.activate();
	}
};

AppAssistant.prototype.launchWithParams = function(params, stageController) {
	stageController.popScenesTo('list');
	
};