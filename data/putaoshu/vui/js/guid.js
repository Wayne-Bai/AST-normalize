/**
 * 返回一个当前页面的唯一标识字符串
 * @constructor
 * @name vui.guid
 * @author putaoshu@126.com
 * @date 2013-4-4
 * @returns {String} 当前页面的唯一标识字符串
 * @example vui.guid(); //返回vui_2
 */

window.guid = 1;
vui.guid = function () {
	window.guid++;
	return 'vui_' + window.guid;
}

