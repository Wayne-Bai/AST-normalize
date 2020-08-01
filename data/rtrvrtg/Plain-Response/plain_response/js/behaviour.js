(function($){
	
	var Plain_Response_Behaviour = {
	  topFixed: function() {
	    var fixedItems = {};
	    
	    $('.top-fixed').each(function(i){
	    	if (!this.id) {
	    	  this.id = 'top-fixed-' + i;
	    	}
	    	fixedItems[this.id] = this.offsetTop;
	    });
	    
	    $(window).scroll(function(){
	    	for (var i in fixedItems) {
	    		var elem = $('#'+i);
				if (window.scrollY > fixedItems[i]) {
					elem.css({
						'position': 'fixed',
						'top': '0px',
						'zIndex': '10000',
						'background': 'black'
					});
				}
				else {
					elem.css({
						'position': 'static',
						'top': 'auto',
						'zIndex': '1',
						'background': 'inherit'
					});					
				}
	    	}
	    });
	  }
	};
	
	$(document).ready(function(){
	  
	  for (var i in Plain_Response_Behaviour) {
	    Plain_Response_Behaviour[i]();
	  }
	  
	});
	
})(jQuery);