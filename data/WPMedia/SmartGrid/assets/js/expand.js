$.extend(SG.Set, {
	leftMargins: function(target){

		var diff = target.data('fullWidth') + 10 - target.width(),
			left	= 0 - diff / 2,
			imgLeft = 0 - diff / 2;
			
		if (target.hasClass('left')){
			left 	= 0;
			imgLeft = 0;
		}
		
		else if (target.hasClass('right')) {
			left 	= 0 - diff;
			imgLeft = 0 - diff;
		}
		
		return [left, imgLeft];		
	},
	
	fullMargins: function(target){
		var offset 	 	= this.container.offset(),
			scrollTop	= $(document).scrollTop(),
			position 	= target.position(),
			left  		= 0 - position.left,
			top  		= 0 - target.css('top') - scrollTop;

		return [top, left];
	},
	collapse : function(target, left){

		var target = target;
		if (this.container.hasClass('single-column')){
			$('h1').show();
		}
		if (target.hasClass('exclude'))
			{return;}
		var left 			= (left) ? left : this.leftMargins(target)[1], 
		 	duration 		= this.duration
		 	width 			= this.colWidth,
			translate3d		= this.matrixToArray(target.data('transform')),
			padding 		= 15;
		
		 if (target.hasClass('sponsored')){
			padding = 0;
		 	width += 24;
		}
		
		this.container.removeClass('fill-screen').removeClass('expanded-sponsor').removeClass('exclude').removeClass('open').removeClass('selected');
		target.css({'min-height': 0, zIndex: 1, background: '#FFF'})
				.animate({
					width: width,
    				fontSize: '1.1em',
    				zIndex: 1,
    				borderColor: '#222',
    				marginLeft: 0,
					padding: padding,
    				// top:0,
    				height: target.attr('height'),
    				'box-shadow': 0
				}, 
				duration, 'swing', 
				function(){
					target.removeClass('selected').removeClass('open');
					target.attr('style','-webkit-transform: translate3d('+translate3d[4]+'px, '+translate3d[5]+'px, 0px); -webkit-transition:none; -moz-transform: translate3d('+translate3d[4]+'px, '+translate3d[5]+'px, 0px); -moz-transition:none;  position: absolute; top:0; left:0; width:'+width+'px;')
					//	.css(')
					if ($.browser.webkit){
						target.css('-webkit-transition: inherit');
					}
					else{
						target.css('-moz-transition: inherit');
					}
					//	target.css({width: width, padding:0})
					
				})

			.children().eq(0)
				.animate({
				//	width: 182,
    				opacity:1
    				
				}, 
				duration, 'swing', 
				function(){
				//target.removeClass('selected');
			})
		if (target.hasClass('fill-screen')){
			target.removeClass('fill-screen');
			target.css({position: 'absolute', left: target.data('left'), top: target.data('top')})
			target.find('div.content-frame, div.content-wrapper-outer').fadeOut(1000).remove();
			$('html, body').animate({scrollTop: parseInt(target.css('top')) + 100}, 100, 'linear');
		}
			
		

		target.find('img, iframe')
			.animate({marginLeft: left}, duration, 'swing');
		
		target.children().css('display', '');
		target.unbind('click');
		this.msg.top.show();
		this.modalControl
			.fadeOut(100);
		
		this.typeControl
			.fadeIn(100);
		
		this.btn.contenttype
			.not('.collapse')
			.fadeIn(100);
			if (target.hasClass('sponsored')){
			//	$('a.social').delay(6000).show(10)
			}
		target.find('span.ad-msg').text(this.adExpndMsg);
				},
	showShim: function(target, imgLeft, duration){
		this.shim
		.css('display', 'block')
			.data('activeClip', [target, imgLeft])
			.animate(
				{opacity: 0.7},
				 duration, 
				'swing');
	},
	expand: function(target, transforrmer){
		SG.Set.outofline(target);
			this.Ooyala.inlineContainer
				.css('top', '-1000px')
				.removeClass('active');
			target.find('.content-frame').remove();
		if ($.browser.webkit){
			target.data('transform', target.css('-webkit-transform'));
		}
		else {
			target.data('transform', target.css('-moz-transform'));
		}
		target.css({
			'top': target.data('isotope-item-position' ).y +'px',
			'left': target.data('isotope-item-position' ).x + 'px',
			'-webkit-transform': '',
			'-moz-transform': '',
			'-webkit-transition-property': '',
			'-moz-transition-property': '',
			'-webkit-transition-duration': '0s',
			'-moz-transition-duration': '0s',
			
		});
		if (this.container.hasClass('exclude') || 
			this.container.hasClass('expanded-sponsor') ||
			this.container.hasClass('fill-screen') ||
			target.hasClass('recent'))
				{return;}
		this.container.addClass('exclude');
		var duration 	= this.duration,
			leftMargins = this.leftMargins(target),
			width		= target.data('fullWidth') + 10,
			left		= leftMargins[0],
			imgLeft	    = leftMargins[1],
			height      = target.height(),
			_this 		= this;

		if (this.container.hasClass('single-column')){
			$('h1').hide();
		}
		this.showShim(target, imgLeft, duration);
		if (target.hasClass('sponsored')){
			$('html, body').stop().animate({scrollTop: parseInt(target.css('top')) }, 1500);
		}
			
		target.addClass('open')
				.find('span.ad-msg')
					.text('advertisement')
			.end()
			.css({'height': height, zIndex: 8})
			.attr('height', height)
			.animate({
				    width: width,
					fontSize: '1.2em',
					borderColor: '#2E6D9D',
					marginLeft: left,
					border: '2px solid #111111',
					padding: 0
			}, duration, 'swing', function(){
				if(!target.hasClass('sponsored')){
					_this.fillScreen(target);
				}
			});
		target
			.find('img, iframe')
				.animate({marginLeft: 0}, duration, 'swing')
				.end()
			.addClass('selected');

		if (target.hasClass('sponsored')){
			this.UI.modal.showAdCtrl(target);
		}
		return imgLeft;
		
			
	//	$('body').css('overflow', 'hidden');
	},
	fillScreen: function(target, cb, param){

		if (this.container.hasClass('expanded-sponsor') || this.container.hasClass('expanded-sponsor') || target.hasClass('recent')){return;}

		var duration 		= this.duration,
			margins  		= this.fullMargins(target),
			marginTop		= margins[0],
			marginLeft		= margins[1] + (this.vpGutter),
			width 			= this.container.width() - (this.vpGutter * 2),
			height 			= $(window).height() -90,
			Content  		= this.Content,
			top 			= target.top - $(document).scrollTop() -50,
			contenttype 	= target.attr('contenttype'),
			containerMargin = ($(window).width() - this.container.width()) / 2,
			scrollBar		= this.scrollBar,
			UI 				= this.UI;
		
		if (this.colCount > 3){
			width		=  3 * (this.gutter + this.colWidth)-this.gutter;
			marginLeft	+= (this.container.width() - width) / 2;
		}
		
		//console.log(contenttype);
			//contenttype = contenttype.toLowerCase();
		this.container.addClass('fill-screen').removeClass('exclude');
		this.msg.top.hide();

		target
			.data('top', target.css('top'))
			.data('left', parseInt(target.css('left')))
			.removeClass('open')
			.animate({
				width: 		width,
				marginLeft: marginLeft,
				marginTop: 	0 - top,
				height: 	height,
				background: '#FFFFFF',
			}, duration, 'swing', function(){
				var contenttype = target.attr('contenttype');
				Content.getByType(contenttype, target, [scrollBar]);
				if(cb&&param){cb(param);}
			})
			
			.addClass('fill-screen')
			.children().eq(0).animate({
				opacity: 0
			}, duration, 'swing');
		
		$('html, body').stop().animate({scrollTop: parseInt(target.css('top')) + 100}, 300, 'linear', function(){
			target.css({position: 'fixed', top: 60, left:parseInt(target.css('left')) + (containerMargin /2)})
			UI.modal.show(target, containerMargin);
			
		});
	}
});
