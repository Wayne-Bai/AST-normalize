/*global html,isHostObjectProperty,isHostMethod */

/*
Description:
Relies on the `el.classList.add`
*/

/*
Degrades:
IE9, IE8, IE7, IE6, IE5.5, IE5, IE4, IE3 Chrome 7, FF3.5, Safari 5.0, Opera 11.1, IOS Safari 4.3, Opera Mini 6.0, Opera Mobile 11.0, Android Safari 2.3
*/

/*
See:
This is the see also section
*/

/*
Author:
Adam Silver
*/

var addClass;

if (html && isHostObjectProperty(html, "classList") && isHostMethod(html.classList, "add") ) {
	addClass = function(el, className) {
		return el.classList.add(className);
	};
}