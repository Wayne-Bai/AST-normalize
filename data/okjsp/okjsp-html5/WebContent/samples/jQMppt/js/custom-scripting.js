
$(document).bind("mobileinit", function(){	
	//alert('mobileinit event start:'+$.mobile.subPageUrlKey);
	var bar = 'tmp';

	//$.mobile object�� �̿��Ͽ� extend ���� ���
	$.extend(  $.mobile , {
	    foo: bar
	});
	//�Ǵ� ���������ε� ���� ����
	$.mobile.foo = bar;
	
});	