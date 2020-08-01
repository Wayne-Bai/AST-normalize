var FocusEvents = {
	FOCUSIN: "focusin",
	FOCUSOUT: "focusout"
};
var MouseEvents = {
	CLICK: "click",
	DBCLICK: "dbclick",
	HOVER: "hover",
	MOUSEDOWN: "mousedown",
	MOUSEENTER: "mouseenter",
	MOUSELEAVE: "mouseleave",
	MOUSEMOVE: "mousemove",
	MOUSEOUT: "mouseout",
	MOUSEOVER: "mouseover",
	MOUSEUP: "mouseup"
};
$.extend(MouseEvents, FocusEvents);
var KeyboardEvents = {
	KEYDOWN: "keydown",
	KEYPRESS: "keypress",
	KEYUP: "keyup"
};
$.extend(KeyboardEvents, FocusEvents);
var FormEvents = {
	BLUR: "blur",
	CHANGE: "change",
	FOCUS: "focus",
	SELECT: "select",
	SUBMIT: "submit"
};
var StateEvents = {
	EXITSTATE: "exitstate",
	ENTERSTATE: "enterstate",
	ENDSTATE: "endstate"
};
var UIComponentEvents = {
	STARTRENDERING: "startrendering",
	FINISHRENDERING: "finishrendering"
};
