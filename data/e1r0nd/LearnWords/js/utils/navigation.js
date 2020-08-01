/**************************************************
* Learn Words // navigation.js
* coded by Anatolii Marezhanyi aka e1r0nd//[CRG] - March 2014
* http://linkedin.com/in/merezhany/ e1r0nd.crg@gmail.com
* Placed in public domain.
**************************************************/
if(typeof(Navigation) == 'undefined' || Navigation == null || !Navigation){
	
	Navigation = {
	
		hashguard: function(init){ //onHashChange
			if (init) this.hash = window.location.hash;
			if (this.hash != window.location.hash){
				$(window).trigger('hashbreak', {"prevhash":this.hash});
				this.hash = window.location.hash;
			}
			setTimeout('Navigation.hashguard(false)', 50);
		},
		
		hashbreak: function(){ //hashchange event
			var hashUrl = window.location.hash.slice(3);
			
			if (hashUrl) {
				$('[data-target=' + window.location.hash.slice(3) + ']').click();
			} else {
				$('[data-target=summary]').click();
			}
		},
		
		navSelect: function(){
			$('[data-toggle=nav]').each(function(){
				$(this).addClass('nodisplay');
			});
			$('[data-type=nav-select-li]').each(function(){
				$(this).removeClass('active');
			});
			$(this).parent().addClass('active');
			$('#'+$(this).data('target')).removeClass('nodisplay');
			Utils.closeMobMenu();
		},
		
		init: function(){
			$(document).on('click touchstart', '[data-type=nav-select]', Navigation.navSelect);
			$(window).bind('hashbreak', Navigation.hashbreak);
			Navigation.hashguard(false);
		}
	};
	
	Navigation.init();
}

