/**
 * vui client width,height
 * @constructor
 * @author putaoshu@126.com
 * @date 2012-07-12
 * @return {Object} o o.clientWidth 窗口宽, o.clientHeight 窗口高, o.docWidth 整个页面宽, o.docHeight 整个页面高
 * @example vui.pageSize().clientWidth,vui.pageSize().clientHeight,vui.pageSize().docWidth,vui.pageSize().docHeight
 */
vui.pageSize = function (){
	var clientWidth,clientHeight,docWidth,docHeight;	
	
	var doc;
	doc = document.compatMode == "BackCompat" ? document.body : document.documentElement;
	
	clientWidth = doc.clientWidth;
	clientHeight = doc.clientHeight;
	docWidth = Math.max(clientWidth,doc.scrollWidth);
	docHeight = Math.max(clientHeight,doc.scrollHeight);

	var o = {};
	o.clientWidth = clientWidth;
	o.clientHeight = clientHeight;
	o.docWidth = docWidth;
	o.docHeight = docHeight;
	return o;
}

