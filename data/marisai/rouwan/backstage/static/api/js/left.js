var $m={
	marr:[
		'About',
		'Get Started',
		'Config',
		'Router',
		{
			'title':'Feature',
			'child':['Log','Mail','Mongo','Template','Validator']
		},
		{
			'title':'API',
			'child':['system.core','system.cache','system.counter','system.http','system.log','system.mail','system.mongo','system.server','system.session','system.template','system.util','system.validator']
		}
	],
	build:function(){
		var obj,v,subobj,ext;
		$('#menu').html('');
		for(obj in $m.marr){
			if(typeof($m.marr[obj])=='string'){
				v=$m.marr[obj].toLowerCase().replace(/\s/g,'');
				$("#menu").append('<li id="p'+obj+'"><a href="./page/'+v+'.html" target="right" onclick="$m.mclick(\'p'+obj+'\')">'+$m.marr[obj]+'</a></li>');
			}else{
				v=$m.marr[obj]['title'].toLowerCase().replace(/\s/g,'');
				$("#menu").append('<li class="par" id="p'+obj+'"><a href="javascript:void(0)" onclick="$m.mextend('+obj+')">'+$m.marr[obj]['title']+'</a></li>');
				for(subobj in $m.marr[obj]['child']){
					v=$m.marr[obj]['child'][subobj].toLowerCase().replace(/\s/g,'');
					$("#menu").append('<li class="sub c'+obj+'" id="c'+obj.toString()+subobj+'"><a href="./page/'+v+'.html" target="right" onclick="$m.mclick(\'c'+obj.toString()+subobj+'\')">'+$m.marr[obj]['child'][subobj]+'</a></li>');
				}
			}
		}
	},
	mclick:function(id){
		$("#menu").children().removeClass('cur');
		$("#"+id).addClass("cur");
	},
	mextend:function(id){
		if($(".c"+id).css("display")=='none'){
			$(".c"+id).show();
		}else{
			$(".c"+id).hide();
		}
	}
};