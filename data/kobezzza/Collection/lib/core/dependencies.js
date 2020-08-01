var Escaper,
	globalEscaper = global.Escaper;

/* istanbul ignore next */
//#include ../../node_modules/escaper/dist/escaper.js

if (IS_NODE) {
	Escaper = exports;
	module['exports'] =
		exports = root;

} else {
	Escaper = global.Escaper;
	global.Escaper = globalEscaper
}
