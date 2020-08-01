/**
 * 截取字符串(默认为10个字符)
 * @param string str 传入的字符
 * @param int len 截取长度(单位为汉字，即2个字符)
 * @param boolean hasDot 是否加上...
 * @return string
 */

vui.substr=function(str, len, hasDot){ 
	if (str==null) return;
	if(typeof len=='undefined') len=10;
	len*=2;
	if(typeof hasDot=='undefined') hasDot=true;
	var newLength = 0; 
	var newStr = ""; 
	var chineseRegex = /[^\x00-\xff]/g;
	var singleChar = ""; 
	var strLength = str.replace(chineseRegex,"**").length; 
	for(var i = 0;i < strLength;i++) { 
		singleChar = str.charAt(i).toString(); 
		if(singleChar.match(chineseRegex) != null){ 
			newLength += 2; 
		}else{ 
			newLength++; 
		} 
		if(newLength > len){ 
			break; 
		}
		newStr += singleChar; 
	} 
	 
	if(hasDot && strLength > len){ 
		newStr += "..."; 
	} 
	return newStr; 
}