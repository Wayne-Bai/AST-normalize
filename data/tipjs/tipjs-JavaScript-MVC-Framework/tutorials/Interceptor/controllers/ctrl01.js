tipJS.controller({
	name : "Interceptor.ctrl01",
	invoke:function(params){
		this.getById("screen").innerHTML = "Controller 01";
	}
});
