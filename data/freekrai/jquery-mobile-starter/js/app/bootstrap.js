(function() {
	var device_ready = false;
	var jqm_mobile_init = false;
	var initApp = function() {
		if ((device_ready && jqm_mobile_init) || (jqm_mobile_init && !mobile_system)) {
			startApp();
		}
	};
	var onDeviceReady = function() {
		device_ready = true;
		//alert('dev ready');
		initApp();
	};
	var onMobileInit = function() {
		$.support.cors = true;
		$.mobile.allowCrossDomainPages = true;
		jqm_mobile_init = true;
		//alert('jqm ready');
		initApp();
	};
	$(document).bind('mobileinit', onMobileInit);
	document.addEventListener("deviceready", onDeviceReady, false);
	$('form').live("submit",function(e){
		var form = $(this).attr('id');
		return checkrequireds(e, form);
	});
})();


function checkrequireds(ev, form){
	var enableSubmitButton = true;
	var missingfields = "";
	$('.hasPlaceHolder').each(function(){ 
		var def = $(this).siblings('span.placeHolderValue').text();
		if( $(this).val() == def ) $(this).val('');
	});
	var first = '';
	$('#'+form+' select.required').each(function(){
		if($(this).val() == '-1' ){
			$(this).parent().addClass('error');
			missingfields+= jQuery('label[for="'+$(this).attr("name")+'"]').text()+"\n";
			enableSubmitButton = false; 
			if( first == '' ) first = $(this);
		}else{
			$(this).parent().removeClass('error');
		}
	});
	$('#'+form+' input.required').each(function(){ 
		if($(this).val() == '' ){
			$(this).parent().addClass('error');
			missingfields+= jQuery('label[for="'+$(this).attr("id")+'"]').text()+"\n";
			enableSubmitButton = false; 
			if( first == '' ) first = $(this);
		}else{
			$(this).parent().removeClass('error');
		}
	});	
	$('#'+form+' textarea.required').each(function(){
		if($(this).val() == '' ){
			$(this).parent().addClass('error');
			missingfields+= jQuery('label[for="'+$(this).attr("name")+'"]').text()+"\n";
			enableSubmitButton = false; 
		}else{
			$(this).parent().removeClass('error');
		}
	});	
	if( enableSubmitButton ){
		return true;
	}else{
		first.focus();
		ev.preventDefault();
	}
	return false;
}