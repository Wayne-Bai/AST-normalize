$('document').ready(function(){
	
	var foo=function(_gridc){
		
		var i=0,
			c=0,
			gridc=_gridc,
			gridgw=1,
			gridg,
			gridcw,
			gridt;
		
		gridg=gridc-1;
		gridcw=(100-(gridg*gridgw))/gridc;
		gridt=gridc+gridg;
		
		
		$('#grid-container').remove();
		
		$('<div></div>').
			attr('id','grid-container').
			addClass('grid-container-styling').
			appendTo('body');
			
		$('#grid-container').css('width',$("#slider").slider('value')+'%');
		
		for(;i<gridt;i=i+1){
			$("<div></div>").
				attr('id','grid-div-'+i).
				addClass( i%2?
					'grid-gutter-styling':
					'grid-column-styling'
				).
				css('width',
					(i%2?
					gridgw:
					gridcw)
					+'%'
				).
				css('margin-left',
					c
					+'%'
				).
				css('height',
					'100%'
				).
				appendTo('#grid-container');
				
				c=c+
					(i%2?
					gridgw:
					gridcw);
					
			//console.log($('#grid-div-'+i).css('width'));
		};
	};

	$("#slider").slider({value:100}).on(
		'slide',
		function(event, ui){
			$('#grid-container').css('width',ui.value+'%');
		});
		
	$('button[value=grid-remove]').button().on(
		'click',
		function(event) {
			foo(--c);
		});
		
	$('button[value=grid-add]').button().on(
		'click',
		function(event) {
			foo(++c);
		});

	
	var c=12;
	
	foo(c);
		
});
