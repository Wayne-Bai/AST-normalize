tipJS.model({
	__name : "Model.modelB",
	proper : "modelB property",
	methodB : function(){
		tipJS.debug("modelB.methodB()");
		tipJS.debug(this.proper);
		
		return this.loadModel("modelA").methodA();
	}
});
