/**
 * 输入框光标位置相关处理
 * @constructor
 * @name vui.inputCursor
 * @author dong
 */
vui.inputCursor = {
	/** @lends vui.inputCursor */
	/**
	 * getSelection 
	 * @name vui.inputCursor.getSelection
	 * @param {Object} el 主对象
	 * @see <a href="http://stackoverflow.com/questions/235411/is-there-an-internet-explorer-approved-substitute-for-selectionstart-and-selecti">stackoverflow</a>
	 */
	getSelection: function(el){
		var start = 0, end = 0, normalizedValue, range,
			textInputRange, len, endRange;

		if (typeof el.selectionStart == "number" && typeof el.selectionEnd == "number") {
			start = el.selectionStart;
			end = el.selectionEnd;
		} else {
			range = document.selection.createRange();

			if (range && range.parentElement() == el) {
				len = el.value.length;
				normalizedValue = el.value.replace(/\r\n/g, "\n");

				// Create a working TextRange that lives only in the input
				textInputRange = el.createTextRange();
				textInputRange.moveToBookmark(range.getBookmark());

				// Check if the start and end of the selection are at the very end
				// of the input, since moveStart/moveEnd doesn't return what we want
				// in those cases
				endRange = el.createTextRange();
				endRange.collapse(false);

				if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
					start = end = len;
				} else {
					start = -textInputRange.moveStart("character", -len);
					start += normalizedValue.slice(0, start).split("\n").length - 1;

					if (textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
						end = len;
					} else {
						end = -textInputRange.moveEnd("character", -len);
						end += normalizedValue.slice(0, end).split("\n").length - 1;
					}
				}
			}
		}

		return {
			start: start,
			end: end
		};
	},
	/**
	 * 获取光标的起始位置
	 * @name vui.inputCursor.getStartPos
	 * @param {Object} obj 主对象
	 */
	getStartPos: function(obj){
		return this.getSelection(obj).start;
	},
	/**
	 * 获取光标的结束位置
	 * @name vui.inputCursor.getEndPos
	 * @param {Object} obj 主对象
	 */
	getEndPos: function(obj){
		return this.getSelection(obj).end;
	},
	/**
	 * 光标处插入字符
	 * @name vui.inputCursor.insert
	 * @param {Object} obj 主对象
	 * @param {String} str 插入的字符
	 */
	insert: function(obj, str){
		if (document.selection) {
			//IE support
			obj.focus();
			sel = document.selection.createRange();
			sel.text = str;
			obj.focus();
		}else if (obj.selectionStart || obj.selectionStart == '0') {
			//MOZILLA/NETSCAPE support
			startPos = obj.selectionStart;
			endPos = obj.selectionEnd;
			scrollTop = obj.scrollTop;
			obj.value = obj.value.substring(0, startPos) + str + obj.value.substring(endPos,obj.value.length);
			obj.focus();
			obj.selectionStart = startPos + str.length;
			obj.selectionEnd = startPos + str.length;
			obj.scrollTop = scrollTop;
		} else {
			obj.value += str;
			obj.focus();
		}
	},
	/**
	 * 选中指定区间
	 * @name vui.inputCursor.select
	 * @param {Object} obj 主对象
	 * @param {Number} start 开始位置
	 * @param {Number} end 结束位置
	 */
	select: function(obj, start, end){
		if(typeof end == 'undefined' || end < start) end = start;
		obj.focus();
		if(document.selection){
			var range = obj.createTextRange();
			range.move('character', start);
			range.moveEnd('character', end);
			range.select();
		}
		else{
			obj.selectionStart = start;
			obj.selectionEnd = end;
		}
	},
	/**
	 * 替换指定区域的文字
	 * @name vui.inputCursor.replace
	 * @param {Object} obj 主对象
	 * @param {Number} start 开始位置
	 * @param {Number} end 结束位置
	 * @param {String} text 替换指定区域的文字
	 * @param {Boolean} focus true 替换指定区域的文字
	 */
	replace: function(obj, start, end, text, focus){
		obj.value = obj.value.substr(0, start) + text + obj.value.substr(end, obj.value.length);
		if(focus){
			this.select(obj, start + text.length);
		}
	}
};

