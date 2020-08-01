$(document).ready(function(){
	$(window).resize(function() {
		if ($(window).width() < 480) {
			$(".dyn1, .dyn2, .dyn3, .dyn4, .dyn5, .dyn6, .dyn7, .dyn8, .dyn9, .dyn10, .dyn11, .dyn12").css("width", "100%");
		}
		else {
			$(".dyn1").css("width", "100%");
			$(".dyn2").css("width", "49.5%");
			$(".dyn3").css("width", "32.66666667%");
			$(".dyn4").css("width", "24.25%");
			$(".dyn5").css("width", "19.2%");
			$(".dyn6").css("width", "15.833333333%");
			$(".dyn7").css("width", "13.42857142%");
			$(".dyn8").css("width", "11.625%");
			$(".dyn9").css("width", "10.22222222%");
			$(".dyn10").css("width", "9.1%");
			$(".dyn11").css("width", "8.1818181818%");
			$(".dyn12").css("width", "7.41666666%");
		}
 	});
});