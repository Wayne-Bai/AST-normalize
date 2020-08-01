;
(function($) {
	$.sun.config({
		alias : {
			'mo' : '/test/module/mo.js'
		}
	//,map:[['.js',".min.js"]]
	});
	var selector = "div";
	$(document).ready(function() {
		var heads = $("head");
		$("#click1").on("click", function(e, a) {
			$.nav.use({
				module : "mo",//模块名
				//method : $(this).attr("method"),//方法名
				url : "/test/testSun.html",
				param : [//参数
					"sawr[]{a:'asdf',list:[1,2,3]}", 14
				],
				callback : function(v) {
					$("#show").html("abc");
				}
			});
		}, "a");
		$("#click2").on("click", function() {
			$.nav.use({
				module : "mo",//模块名
				//method : $(this).attr("method"),//方法名
				url : "/test/testSun.html",
				param : [//参数
					"sad%as&der", 29
				]
			});
		});
		$("#click3").on("click", function() {
			$.nav.use({
				module : "mo",//模块名
				//method : $(this).attr("method"),//方法名
				url : "/test/testSun.html",
				param : [//参数
					12
				]
			});
		});
	})
})(Qmik);
