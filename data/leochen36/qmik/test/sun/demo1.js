$.define("demo/Demo1",function(require, exports, module){
	
	module.exports = {
		doing:function(msg){
			var Common = require("demo/Common");
			var Demo = require("demo/Demo2");
			console.log(Common)
 			Common.doing(msg);
			console.log("doing demo1 ",msg);
  
		}

	};
});