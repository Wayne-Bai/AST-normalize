var $m={
	hitokoto:function(d){
		$("#hitokoto").html('<a href="http://hitokoto.us/view/'+d.id+'.html" target="_blank" title="Cat：'+d.catname+'&#10;From：'+d.source+'&#10;Like：'+d.like+'&#10;Author：'+d.author+' @ '+d.date+'">『'+d.hitokoto+'』</a>');
	},
	resize:function(){
		$("#left,#right").height($(window).height()-160);
		$("#right").width($(window).width()-270);
	}
};