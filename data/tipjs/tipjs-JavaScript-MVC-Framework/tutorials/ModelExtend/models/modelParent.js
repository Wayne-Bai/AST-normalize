tipJS.model({
	__name : "ModelExtend.modelParent",
	__extend:"commonParent",
	parent : "parent property",
	parentFn : function(){
		tipJS.debug("modelParent.parentFn()");
		tipJS.debug(this.parent);
		
		document.getElementById("contents").innerHTML += "<h2>" + this.parent + "</h2>";
	}
});
