/**
 * 深度copy
 * @param {Function} obj 要copy的函数
 */
vui.clone = function(obj) {
	if(typeof(obj) != 'object' || obj == null){
		return obj;
	}
	var new_obj = new Object();
	for(var i in obj){
		new_obj[i] = vui.clone(obj[i]);
	}
	return new_obj;
}
