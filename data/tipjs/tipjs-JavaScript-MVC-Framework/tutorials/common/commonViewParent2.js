tipJS.commonView({
	__name : "commonViewParent2",
	common2 : "commonViewParent2 property",
	commonFn2 : function(){
		tipJS.debug("commonViewParent2.commonFn2()");
		tipJS.debug(this.common2);
		var opt = {
			url:"./views/template.html",
			renderTo:"contents",
			data:["commonViewParent2-1","commonViewParent2-2","commonViewParent2-3"]
		}
		this.renderTemplate(opt);
	}
});
