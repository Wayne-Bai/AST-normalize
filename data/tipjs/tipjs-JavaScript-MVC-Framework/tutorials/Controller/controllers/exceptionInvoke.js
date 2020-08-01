tipJS.controller({
	name : "Controller.exceptionInvoke",
	beforeInvoke:function(){
		tipJS.debug(this.name + ".beforeInvoke");
		document.getElementById("contents").innerHTML = "<h1>beforeInvoke</h1>";
	},
	invoke:function(params){
		tipJS.debug(this.name + ".invoke");
		document.getElementById("contents").innerHTML = "<h1>invoke</h1>";
	},
	afterInvoke:function(){
		tipJS.debug(this.name + ".afterInvoke");
		document.getElementById("contents").innerHTML = "<h1>afterInvoke</h1>";
	},
	exceptionInvoke:function(){
		tipJS.debug(this.name + ".exceptionInvoke");
		document.getElementById("contents").innerHTML = "<h1>exceptionInvoke</h1>";
	}
});
