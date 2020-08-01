$(document).ready(function(){
	$("#flexyPics").queryLoader2({
		onLoadComplete: function () {
			$('.mask img').each(function(){
				flexy(this);
			});
			delay = 0;
			var imagesArray = $.makeArray($('#flexyPics img'));
			imagesArray.sort(function() { return (Math.round(Math.random())-0.5);});
			$('#loading-mask').fadeOut(900);
			for (i = 0 ; i < imagesArray.length ; i++) {
				$(imagesArray[i]).delay(delay).fadeIn(300);
				delay += 150;
			}
			return;
		}
	});
});
$(window).resize(function() {
	$('.mask img').each(function(){
		flexy(this);
	});
});