$.define("demo/Demo1",function(require, exports, module){
	module.exports = {
		doing:function(msg){
			var Common = require("demo/Common");
 			Common.doing(msg);
			console.log("doing demo1 ",msg);
  			$("#result").append("<p>doing demo1 "+msg+"</p>");
		}
	};
});