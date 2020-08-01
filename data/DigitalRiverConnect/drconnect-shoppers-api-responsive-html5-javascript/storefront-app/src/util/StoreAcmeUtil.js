String.prototype.QueryStringToJSON = function () {
	href = this;
	qStr = href.replace(/(.*?\?)/, '');
	qArr = qStr.split('&');
	stack = {};
	for (var i in qArr) {
	    var a = qArr[i].split('=');
	    var name = a[0],
	        value = isNaN(a[1]) ? a[1] : parseFloat(a[1]);
	    if (name.match(/(.*?)\[(.*?)]/)) {
	        name = RegExp.$1;
	        name2 = RegExp.$2;
	        //alert(RegExp.$2)
	        if (name2) {
	            if (!(name in stack)) {
	                stack[name] = {};
	            }
	            stack[name][name2] = value;
	        } else {
	            if (!(name in stack)) {
	                stack[name] = [];
	            }
	            stack[name].push(value);
	        }
	    } else {
	        stack[name] = value;
	    }
	}
	return stack;
};

Storage.prototype.setObj = function(key, obj) {
    return this.setItem(key, JSON.stringify(obj))
}
Storage.prototype.getObj = function(key) {
    return JSON.parse(typeof this.getItem(key) != 'undefined' ?  this.getItem(key):"");
}



function namespace(namespaceString) {
    var parts = namespaceString.split('.'),
        parent = window,
        currentPart = '';    

    for(var i = 0, length = parts.length; i < length; i++) {
        currentPart = parts[i];
        parent[currentPart] = parent[currentPart] || {};
        parent = parent[currentPart];
    }

    return parent;
}


function getDate(str_date) {
	
	var m_numbers = new Array("1", "2", "3", 
	"4", "5", "6", "7", "8", "9", 
	"10", "11", "12");
	var d = new Date(str_date);
	var curr_date = d.getDate();
	var curr_month = d.getMonth();
	var curr_year = d.getFullYear();
	
	return curr_year + "-" + m_numbers[curr_month]+ "-" + curr_date ;
	
}

function renderClasses(quantity){		
	if(typeof quantity   != 'undefined' && typeof  quantity == 'number' ){
		
		switch (quantity) {			
			case 1 :
				return "span10 ";
				break;
				
			case 2 :
				return "span5 ";
				break;
				
			case 3 :
				return "span3 ";
				break;
				
			default:
				return "span "
				break;
			}
	}
	
}

function getParamValue(param){
	return  decodeURIComponent($.address.parameter(param));
}

function getSize(totalPage){
	var pages = new Array();
	for(var i=1 ; i<=totalPage;i++){
		pages.push(i);
	}
	return pages;
}
/**
	this function only is applied  to chrome by google web toolkit
*/
function processspeech(){
	if($('.search-query').val() != '' && $('.search-query').val().length >3)
    	$('.navbar-search').attr('action', '#/searchProduct?keyword='+$('.search-query').val()).submit();	
}

