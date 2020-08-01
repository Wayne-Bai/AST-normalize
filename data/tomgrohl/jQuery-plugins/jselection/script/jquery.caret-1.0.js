/*! 
* jQuery Caret Plugin v1.0
* Copyright (c) 2011 Tom Ellis (http://www.webmuse.co.uk)
* MIT Licensed (license.txt).
*/
﻿(function($) {
	
$.fn.caret = function( start, end ) {
	
	var startPos,
		endPos,
		regex,
		text = '',
		selection,
		elem = this[0],
		te,
		re,
		obj;
			
	function makeSelection( elem, startPos, endPos ) {
		
		var s,e;
			
		if( startPos >=0 && endPos >= 0 ) {
			
			if( elem.createTextRange ) {
		
				var selRange = elem.createTextRange();
				selRange.collapse(true);
				selRange.moveStart('character', startPos);
				selRange.moveEnd('character', endPos - startPos);
				selRange.select();
				
				s = startPos;
				e = endPos
			} else {
				elem.selectionStart = s = startPos;
				elem.selectionEnd = e = endPos;
			}
			
		} else {
			
			if( elem.createTextRange ) {

				var selection = document.selection;

				if ( elem.tagName.toLowerCase() != "textarea" ) {	
					
					var val = this.val(),

					range = selection.createRange().duplicate();
					s = range.text === '' ? val.length : val.lastIndexOf( range.text );
	                range = selection.createRange().duplicate();
	                range.moveStart('character', -val.length );
	                e = range.text.length;					
				
				} else {

					var range = selection.createRange(),

				    stored_range = range.duplicate();
				    stored_range.moveToElementText( elem );
				    stored_range.setEndPoint('EndToEnd', range);

				    s = stored_range.text.length - range.text.length;
				   e = s + range.text.length;
				}
				
			} else {
				s = elem.selectionStart;
				e = elem.selectionEnd;	
			}		
			
		}
		
		elem.focus();
		
		return { s : s, e : e  };	
	}
	
	if( arguments.length === 2 ) {
		startPos = start;
		endPos = end;
	} else if ( $.type( start ) === 'string' ) {
		text = start;
		if( ( startPos = elem.value.indexOf( text ) ) > -1 ) { 
			endPos = startPos + text.length;
		}
	} else if ( $.type( start ) === 'regexp' ) {
		regex = start;
		re = regex.exec( elem.value );
		if( re ) {
			startPos = re.index;
			endPos = startPos + re[0].length;
		}
	}

	if( startPos >=0 && endPos >= 0 ) {
		makeSelection( elem, startPos, endPos );
		return this;
	} else {	
		obj = makeSelection( elem, startPos, endPos );
		te = elem.value.substring( obj.s, obj.e );
		return {
			start: obj.s,
			end: obj.e, 
			text: te,
			replace:function( text ) {
				return elem.value.substring(0,obj.s) + text + elem.value.substring( obj.e, elem.value.length )
			}
		};
	}
		
};
	
})(jQuery);