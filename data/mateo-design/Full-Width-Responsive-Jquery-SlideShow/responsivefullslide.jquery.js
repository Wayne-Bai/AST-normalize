(function($){
	
	$.fn.responsiveFullSlide = function(speed, easing){
		

	var self=this;
	this.sliders = this.find("#slider-window");
	this.img = this.find(".slide");
	$('#slider-window').css({
		width : self.img.length * 100+'%'
	}); 
	this.largeurCache = this.width();
	this.hauteur = this.height();
	this.largeur=this.img.length;
	this.find(".slide").each(function(){
		$(this).css({width:$(document).width()});
		
	})
	

	
	this.prev = this.find("#leftArrow");
	this.next = this.find("#rightArrow");
	 
	this.nbJump =  (this.img.length)-1;
	this.curent = 0;
	
	this.next.click(function(){
		if(self.curent<self.nbJump){
		self.curent++;
		self.sliders.animate({
			left : -self.curent*self.largeurCache
		}, speed, easing)}
		self.stop();
	});
	
	this.prev.click(function(){
		if(self.curent>0){
		self.curent--;
		self.sliders.animate({
			left : -self.curent*self.largeurCache
		}, speed, easing)}
		self.stop();
	});
	
	$(window).resize(function(){ 
        
        self.largeurCache = self.width();
        self.largeurImg = self.img.width();
        self.find(".slide").each(function(){
		$(this).css({width:$(window).width()});
		})
		self.sliders.css({
			left : -self.largeurImg*self.curent
		});
		
		$('#leftArrow').css("left","0");
		$('#rightArrow').css("right","0");
    });
	}
})(jQuery);