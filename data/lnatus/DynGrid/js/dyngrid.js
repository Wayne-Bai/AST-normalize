Modernizr.load({
  			test: Modernizr.mq('only all'),
  			nope: '../js/fallback.js'
});

$(document).ready(function(){
	$('.modal .close').click(function(){
		$(this).offsetParent().fadeOut();
		$("#overlay").remove();
	});
	$('.notify .close').click(function(){
		$(this).offsetParent().fadeOut();
	});
	$('.dropdown').click(function(){
		var menu = $(this).data("menu");
		$(menu).show();
	});
	$('div.checkbox').click(function(){
		$(this).toggleClass("checked");
	});

	$('input:radio').addClass('radio-hidden');
	$('.radio').click(function(){
    	$(this).addClass('selected').siblings().removeClass('selected');
	});
});

$(document).mouseup(function (e){
    var container = $(".menu");
    if (container.has(e.target).length === 0){
        container.hide();
    }
});


var dyngrid = (function(){
	var show = function(modal){
		var modal = $(modal);

		$("body").append("<div id='overlay'></div>");
		modal.fadeIn();	
	}

	var close = function(modal){
		var modal = $(modal);
		modal.fadeOut();
		$('#overlay').remove();
	}

	var notify = function(notify){
		 $(notify).fadeIn();
	}

	var unnotify = function(notify){
 		$(notify).fadeOut();
	}

	return {
		component:{
			modal:{
			show: show,
			close: close
			},
			notification:{
			notify: notify,
			unnotify: unnotify
		   }
		}
	}
})();
