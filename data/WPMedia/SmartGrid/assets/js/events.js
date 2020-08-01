$.extend( SG.Set, {	 
	bind: function(){
		var _this	 		= this,
			Interaction 	= this.Interaction,
			container   	= this.container,
			scrollActive	= this.scrollActive,
			shim			= this.shim,
			Ooyala			= this.Ooyala,
			cb;
			
	//	this.resize();
		$(window).scroll(function(e){
			if (container.hasClass('fill-screen') || container.hasClass('expanded-sponsor')){	
				return;
			}
			if ($(this).scrollTop() > container.offset().top && container.data('msgTop') !== true){
				Interaction.scroll.aboveHeader();
			}
			
			else if ($(this).scrollTop() < container.offset().top && container.data('msgTop') === true) {
				Interaction.scroll.belowHeader();
			}
			
			if( $(this).scrollTop() + $(this).height() >= $(document).height() * .95){
				Interaction.scroll.pagedown();
			}
			
			_this.scrollActive = true;

// !! DO NO ERASE !!
// AUTO EXPANDS ADS ON SCROLL
			// if ($(this).scrollTop() >= parseInt($('.sponsored').not('.viewed').eq(0).css('top'))  
			// 	//($(document).height() * .25)
			// ){
			// 	_this.msg.top.slideUp();
			// 	_this.expand($('.sponsored').not('.viewed').eq(0));
			// 	$('.sponsored').not('.viewed').eq(0).addClass('viewed');
			// 	container.addClass('expanded-sponsor');

			// }

			$( "header" ).css( "top", ($( 'section' ).scrollTop()  ) +"px" ); 
		});
		
		this.btn.social.click(function(e){
			e.preventDefault();
			window.open($(this).attr('href'));

		});
		this.btn.all.filter('.btn.close').click(function(e){
			e.preventDefault();
			if ($(this).data('activeClip')){
				shim.click();
			}
			
		});
		
		this.btn.all.filter('.pause').click(function(e){
			e.preventDefault();
			Interaction.photogallery.pause(_this.Content.target);
		});
		this.btn.all.filter('.play').click(function(e){
			e.preventDefault();
			Interaction.photogallery.play(_this.Content.target);
		});
		this.msg.top.click(function(){
			$('html, body').animate({scrollTop: 0 }, 1000);
		});
// !! CLICK ON A SHIM !!
		this.shim.click(function(e){
			Interaction.util.closeWindow();
		})
		.hover(function(){
			Interaction.util.closeWindowFocus();
		},
		function(){
			Interaction.util.closeWindowBlur();
		});

// !! CLICK ON A CLIP !!
		$(document).delegate('div.clip', 'click', function(e){
			e.preventDefault();
			var target = $(this);
			if ( container.hasClass('expanded-sponsor') || container.hasClass('fill-screen') || target.hasClass('fill-screen'))
				{return;}
			
			
			

// !! CLICK ON A SOCIAL SHARING LINK !!
			if ($(e.target).hasClass('social')){
				// _this.Interaction.newsclip.socialFrame($(e.target), target);
					window.open($(e.target).attr('href'));
				 	return;
			}				
			
			
			_this.expand(target);
			
			
		});
		
		var expandSponsor = function(e){
			if (!container.hasClass('expanded-sponsor') && !container.hasClass('fill-screen') && _this.scrollActive === false){
				$(this).click();
				container.addClass('expanded-sponsor');
				_this.msg.top.hide();
			}
		},
		collapseSponsor = function(){
			if (container.hasClass('fill-screen')){
				return;
			}
			shim.click();
			_this.scrollActive = false;
		};
// !! HOVER ON A CLIP !!
		$(document).delegate('div.clip', 'mouseover', function(e){
			var target = $(this);
			
			
			target.find('img.w296').stop().animate({opacity:1}, 800, 'linear');
		});
		$(document).delegate('#inline-container', 'click',
			function(){
				_this.expand(Ooyala.inlineContainer.data('target').closest('.clip'));
				
				_this.outofline($(this).data('target')); 
		
			}
		);
		$(document).delegate('#inline-container', 'mouseover',
			function(){
				container.addClass('video-focus'); 
				if (Ooyala.inlineContainer.data('target') && typeof(Ooyala.inlineContainer.data('target')) === 'object'){
						Ooyala.player.play();
					// console.log(Ooyala.inlineContainer.data('target'));
				//	_this.inline(Ooyala.inlineContainer.data('target'));
				}
			}
		);
		$(document).delegate('#inline-container', 'mouseout',
			function(){container.removeClass('video-focus'); _this.outofline($($(this).data('target')));}
		);
// !! HOVER ON A VIDEO CLIP !!
		cb = SG.Set.Interaction.newsclip.videoFocus;
		$('div.clip[contenttype=Video] span.btn-play').hoverIntent({over: function(){
			if (!SG.Set.container.hasClass('fill-screen')){
					SG.Set.inline($(this).closest('div.clip'));
			}
		}, timeout:500 , out:function(){
			if(container.hasClass('fill-screen')){return;}
			
			SG.Set.outofline($(this)); 
		}});


// !! HOVER ON AN AD !!

		$('div.clip.sponsored').hoverIntent({over: expandSponsor, timeout:6, out:function(){return}, sensitivity:6});


// !! HOVER OFF OF A CLIP !!
		$(document).delegate('div.clip', 'mouseout', function(e){
			var target = $(this);
		
			target.find('img.w296').stop().animate({opacity:.8}, 1000);
			
		});

		// $(document).delegate('div.clip a.social', 'click', function(e){
		// 
		// });
		$(document).delegate('div.gallery a.btn', 'click', function(e){
			Interaction.photogallery.prevnext($(this), e);
		});		 
		$(document).delegate('div.gallery a.btn', 'mouseover', function(e){
			Interaction.photogallery.prevnextFocus(e);
		});
		$(document).delegate('div.gallery a.btn', 'mouseout', function(e){
			Interaction.photogallery.prevnextBlur(e);
		});
		$(document).delegate('div.content-wrapper-outer caption', 'mouseover', function(e){
			e.preventDefault();
			$(this).stop().animate({
				opacity: .85
			}, 600);
		
				
		});
		$(document).delegate('div.content-wrapper-outer caption', 'mouseout', function(e){
			e.preventDefault();
			$(this).stop().animate({
				opacity: .6
			}, 600)
		});
		this.header.find('fieldset input').change(function(){
			if (container.data('loading') === true){return;}
			this.contentTypes	= $('fieldset input', this.header).serialize().replace(/=on/g, '').replace(/&/g, ',').replace('+', '%20');
			localStorage.setItem('contenttypes', this.contentTypes);
			document.location.reload();
			// $('form').eq(0).submit();
			// var parent = container.parent();
			// 			$('body').css('min-height', $(window).height()*2)
			// 			_this.unplace();
			// 			container.remove();
			// 			parent.append('<section />');
			// 			container		= $('section').eq(0);
			// 			_this.run();
		});
		
		this.container.on('fetch.open', function(){
			Interaction.dialog.loading();
		});
		this.container.on('fetch.close', function(){
			Interaction.dialog.loadSuccess();
		});
		this.container.on('fetch.fail', function(){
			Interaction.dialog.loadFail();
		});
		
	},
	resize : function(){
		var _this     = this,
			container = this.container;
			//centered  = (this.Display.centered) ? this.Display.centered : false;

		this.container.children().css({'opacity': 0});
		$(window).resize(function() {	
			_this.outofline(_this.Ooyala.inlineContainer.data('target'))
			if ($(this).width() < container.width() + 4 || $(window).width() > container.width() + _this.colWidth + _this.gutter+ 4){			
				setTimeout('SG.Set.place(0, "resize")', 5);
				_this.unplace();
				$(this).unbind('resize');
			}
		});
	}
});
