$.extend( SG.Set, {	 
	unplace: function(){
		var temp = $('<section />');
		this.Interaction.util.closeWindow();
		
		this.container.children()
			.css({'position': 'static', top: 'auto', left: 'auto'})
			.removeClass('left')
			.removeClass('right')
			.removeClass('selected');
		this.placedClips = [];
	},
	place: function(startAt, callback){
		this.constrainX	= $('html').width() - this.outerGutter;

		var temp 		= this.container,
			width		= this.colWidth,
			gutter		= this.gutter,
			innerWidth  = width + (gutter *2),
			constrainX	= this.constrainX,
			startAt     = (startAt) ? startAt : 0,
			colCount 	= Math.floor((constrainX + gutter) / (width + gutter)),
			_this 		= this,
			skip 		= false,
			containerWidth, docHeight, q;
			
		
			
		this.colCount = colCount; 
		var shortestColumn = function(columns){
				var shortest = {};
				for (i = 0; i < colCount; i++){
					if (!shortest.height && !shortest.pos){
						shortest.height = _this.columns[0].height;
						shortest.pos 	= 0;
					}
					else if (shortest.height > _this.columns[i].height){
						shortest.height = _this.columns[i].height;
						shortest.pos    = i;
					}
				}
				return shortest;
			};
		
		this.Display.fitToScreen(colCount);
			
		if (colCount > 1){
			if (startAt === 0) {
				for (i = 0; i < colCount; i++){
					this.columns.push({height: 0, pos:0});
				}
			}

			$.each(temp.children(), function(i, el){
			   	if (i < startAt) {return;}
		
				var img 	 = $(this).find('img, iframe').eq(0),
					imgWidth = (img.width()) ? img.width() : 296,	
					posLeft, posTop;
					if (i + 1 > colCount) {	
						
						var shortest  = shortestColumn();
						posTop = gutter  + shortest.height;
						column = shortest.pos;
						
					} 
					else {
						posTop = 0;
						column = i;
					}
					
					posLeft = column * (width + gutter);

					$(el).css({'position': 'absolute','top': posTop, 'left': posLeft})
						.animate({'opacity': 1})
						.data('fullWidth', imgWidth);
					if (colCount > 1){
						if (column === 0) {
							$(el).addClass('left');
					  		img.css('margin-left', 0);
						}
						else if(column === colCount-1){
							$(el).addClass('right');
							img.css('margin-left', 0 - (imgWidth - width + gutter));
						}
						else{
							img.css('margin-left', 0 - (imgWidth - width) / 2);
						}
					}
					
					_this.columns[((shortest) ? shortest.pos : i)].height = posTop + $(el).height();
					
			});
		}
		temp.children().css('margin-bottom', '10px').animate({'opacity': 1});
		containerWidth = (colCount * (width + gutter)) - gutter;
		this.header.css('width', containerWidth + 'px');
		this.container.css('width', containerWidth + 'px')
			.data('loading', false);
		if (callback){
			this[callback]();
		}
	}
});