var tmpFunc = {};
var idHash = {
	'Function': true,
	'return': true,

	'JSON': true,
	'URL': true,

	'btoa': true,
	'atob': true,

	'NaN': true,
	'isNaN': true,
	'Infinity': true,
	'isFinite': true,

	'encodeURI': true,
	'encodeURIComponent': true,
	'decodeUri': true,
	'decodeUriComponent': true,

	'parseInt': true,
	'parseFloat': true,

	'setInterval': true,
	'clearInterval': true,
	'setTimeout': true,
	'clearTimeout': true,
	'setImmediate': true,
	'clearImmediate': true,

	'window': true,
	'document': true,
	'global': true,

	'ArrayBuffer': true,
	'Int8Array': true,
	'Int16Array': true,
	'Int32Array': true,
	'Uint8Array': true,
	'Uint16Array': true,
	'Uint32Array': true,
	'Uint8ClampedArray': true,

	'Array': true,
	'Object': true,
	'RegExp': true,
	'Date': true,
	'Math': true,
	'Set': true,
	'WeakSet': true,
	'Map': true,
	'WeakMap': true,
	'Proxy': true,

	'Error': true,
	'EvalError': true,
	'TypeError': true,
	'SyntaxError': true,
	'URIError': true,
	'RangeError': true,
	'ReferenceError': true,

	'String': true,
	'Number': true,
	'Boolean': true,
	'Symbol': true,

	'true': true,
	'false': true,
	'undefined': true,
	'null': true,

	'yield': true,
	'in': true,
	'new': true,
	'delete': true,
	'void': true,
	'typeof': true,
	'instanceof': true,
	'this': true,

	'el': true,
	'key': true,
	'data': true,
	'i': true,
	'length': true,
	'id': true
};

var symbols = 'a-zA-Zа-яА-ЯёЁ';

//#if unicode
// Эта адская регулярка определяет все юникодные буквы (включая иероглифы)

symbols =
	'\\u0041-\\u005A\\u0061-\\u007A\\u00AA\\u00B5\\u00BA\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02C1' +
	'\\u02C6-\\u02D1\\u02E0-\\u02E4\\u02EC\\u02EE\\u0370-\\u0374\\u0376\\u0377\\u037A-\\u037D\\u0386\\u0388-\\u038A' +
	'\\u038C\\u038E-\\u03A1\\u03A3-\\u03F5\\u03F7-\\u0481\\u048A-\\u0525\\u0531-\\u0556\\u0559\\u0561-\\u0587' +
	'\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0621-\\u064A\\u066E\\u066F\\u0671-\\u06D3\\u06D5\\u06E5\\u06E6\\u06EE\\u06EF\\u06FA-\\u06FC' +
	'\\u06FF\\u0710\\u0712-\\u072F\\u074D-\\u07A5\\u07B1\\u07CA-\\u07EA\\u07F4\\u07F5\\u07FA\\u0800-\\u0815\\u081A\\u0824' +
	'\\u0828\\u0904-\\u0939\\u093D\\u0950\\u0958-\\u0961\\u0971\\u0972\\u0979-\\u097F\\u0985-\\u098C\\u098F\\u0990' +
	'\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09BD\\u09CE\\u09DC\\u09DD\\u09DF-\\u09E1\\u09F0\\u09F1\\u0A05-\\u0A0A' +
	'\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A59-\\u0A5C\\u0A5E\\u0A72-\\u0A74\\u0A85-\\u0A8D' +
	'\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABD\\u0AD0\\u0AE0\\u0AE1\\u0B05-\\u0B0C\\u0B0F\\u0B10' +
	'\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B35-\\u0B39\\u0B3D\\u0B5C\\u0B5D\\u0B5F-\\u0B61\\u0B71\\u0B83\\u0B85-\\u0B8A\\u0B8E-\\u0B90' +
	'\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB9\\u0BD0\\u0C05-\\u0C0C' +
	'\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C3D\\u0C58\\u0C59\\u0C60\\u0C61\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8' +
	'\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CBD\\u0CDE\\u0CE0\\u0CE1\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D28\\u0D2A-\\u0D39\\u0D3D' +
	'\\u0D60\\u0D61\\u0D7A-\\u0D7F\\u0D85-\\u0D96\\u0D9A-\\u0DB1\\u0DB3-\\u0DBB\\u0DBD\\u0DC0-\\u0DC6\\u0E01-\\u0E30\\u0E32\\u0E33' +
	'\\u0E40-\\u0E46\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5' +
	'\\u0EA7\\u0EAA\\u0EAB\\u0EAD-\\u0EB0\\u0EB2\\u0EB3\\u0EBD\\u0EC0-\\u0EC4\\u0EC6\\u0EDC\\u0EDD\\u0F00\\u0F40-\\u0F47' +
	'\\u0F49-\\u0F6C\\u0F88-\\u0F8B\\u1000-\\u102A\\u103F\\u1050-\\u1055\\u105A-\\u105D\\u1061\\u1065\\u1066' +
	'\\u106E-\\u1070\\u1075-\\u1081\\u108E\\u10A0-\\u10C5\\u10D0-\\u10FA\\u10FC\\u1100-\\u1248\\u124A-\\u124D\\u1250-\\u1256' +
	'\\u1258\\u125A-\\u125D\\u1260-\\u1288\\u128A-\\u128D\\u1290-\\u12B0\\u12B2-\\u12B5\\u12B8-\\u12BE\\u12C0\\u12C2-\\u12C5' +
	'\\u12C8-\\u12D6\\u12D8-\\u1310\\u1312-\\u1315\\u1318-\\u135A\\u1380-\\u138F\\u13A0-\\u13F4\\u1401-\\u166C\\u166F-\\u167F' +
	'\\u1681-\\u169A\\u16A0-\\u16EA\\u1700-\\u170C\\u170E-\\u1711\\u1720-\\u1731\\u1740-\\u1751\\u1760-\\u176C\\u176E-\\u1770' +
	'\\u1780-\\u17B3\\u17D7\\u17DC\\u1820-\\u1877\\u1880-\\u18A8\\u18AA\\u18B0-\\u18F5\\u1900-\\u191C\\u1950-\\u196D' +
	'\\u1970-\\u1974\\u1980-\\u19AB\\u19C1-\\u19C7\\u1A00-\\u1A16\\u1A20-\\u1A54\\u1AA7\\u1B05-\\u1B33\\u1B45-\\u1B4B\\u1B83-\\u1BA0' +
	'\\u1BAE\\u1BAF\\u1C00-\\u1C23\\u1C4D-\\u1C4F\\u1C5A-\\u1C7D\\u1CE9-\\u1CEC\\u1CEE-\\u1CF1\\u1D00-\\u1DBF\\u1E00-\\u1F15' +
	'\\u1F18-\\u1F1D\\u1F20-\\u1F45\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59\\u1F5B\\u1F5D\\u1F5F-\\u1F7D\\u1F80-\\u1FB4\\u1FB6-\\u1FBC' +
	'\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FCC\\u1FD0-\\u1FD3\\u1FD6-\\u1FDB\\u1FE0-\\u1FEC\\u1FF2-\\u1FF4\\u1FF6-\\u1FFC\\u2071\\u207F' +
	'\\u2090-\\u2094\\u2102\\u2107\\u210A-\\u2113\\u2115\\u2119-\\u211D\\u2124\\u2126\\u2128\\u212A-\\u212D\\u212F-\\u2139\\u213C-\\u213F' +
	'\\u2145-\\u2149\\u214E\\u2183\\u2184\\u2C00-\\u2C2E\\u2C30-\\u2C5E\\u2C60-\\u2CE4\\u2CEB-\\u2CEE\\u2D00-\\u2D25\\u2D30-\\u2D65\\u2D6F' +
	'\\u2D80-\\u2D96\\u2DA0-\\u2DA6\\u2DA8-\\u2DAE\\u2DB0-\\u2DB6\\u2DB8-\\u2DBE\\u2DC0-\\u2DC6\\u2DC8-\\u2DCE\\u2DD0-\\u2DD6\\u2DD8-\\u2DDE' +
	'\\u2E2F\\u3005\\u3006\\u3031-\\u3035\\u303B\\u303C\\u3041-\\u3096\\u309D-\\u309F\\u30A1-\\u30FA\\u30FC-\\u30FF\\u3105-\\u312D\\u3131-\\u318E\\u31A0-\\u31B7' +
	'\\u31F0-\\u31FF\\u3400-\\u4DB5\\u4E00-\\u9FCB\\uA000-\\uA48C\\uA4D0-\\uA4FD\\uA500-\\uA60C\\uA610-\\uA61F\\uA62A\\uA62B\\uA640-\\uA65F\\uA662-\\uA66E\\uA67F-\\uA697' +
	'\\uA6A0-\\uA6E5\\uA717-\\uA71F\\uA722-\\uA788\\uA78B\\uA78C\\uA7FB-\\uA801\\uA803-\\uA805\\uA807-\\uA80A\\uA80C-\\uA822\\uA840-\\uA873\\uA882-\\uA8B3\\uA8F2-\\uA8F7' +
	'\\uA8FB\\uA90A-\\uA925\\uA930-\\uA946\\uA960-\\uA97C\\uA984-\\uA9B2\\uA9CF\\uAA00-\\uAA28\\uAA40-\\uAA42\\uAA44-\\uAA4B\\uAA60-\\uAA76\\uAA7A\\uAA80-\\uAAAF\\uAAB1' +
	'\\uAAB5\\uAAB6\\uAAB9-\\uAABD\\uAAC0\\uAAC2\\uAADB-\\uAADD\\uABC0-\\uABE2\\uAC00-\\uD7A3\\uD7B0-\\uD7C6\\uD7CB-\\uD7FB\\uF900-\\uFA2D\\uFA30-\\uFA6D\\uFA70-\\uFAD9' +
	'\\uFB00-\\uFB06\\uFB13-\\uFB17\\uFB1D\\uFB1F-\\uFB28\\uFB2A-\\uFB36\\uFB38-\\uFB3C\\uFB3E\\uFB40\\uFB41\\uFB43\\uFB44\\uFB46-\\uFBB1\\uFBD3-\\uFD3D\\uFD50-\\uFD8F' +
	'\\uFD92-\\uFDC7\\uFDF0-\\uFDFB\\uFE70-\\uFE74\\uFE76-\\uFEFC\\uFF21-\\uFF3A\\uFF41-\\uFF5A\\uFF66-\\uFFBE\\uFFC2-\\uFFC7\\uFFCA-\\uFFCF' +
	'\\uFFD2-\\uFFD7\\uFFDA-\\uFFDC'
;

//#endif

var w = `${symbols}0-9_`;
var startIdTest =
	'(' +
		'(?:' +
			'^:?|' +
			`[^${symbols}$.](?=[${symbols}_$][${w}$]*)` +
		')' +
	'\\s*)'
;

var endIdTest = `(?=\\s|[^${w}$]|$)`;
var idsRgxp = new RegExp(`${startIdTest}[${symbols}_$][${w}$]*${endIdTest}`, 'g'),
	idRgxp = new RegExp(`[${symbols}_0-9$]+`),
	advArgRgxp = /\.\.\.|=|\{/;

var arrFnRgxp = /=>/,
	simpleFnRgxp = /^(\s*return)(?:\s|;|$)/,
	endFnRgxp = /;?\s*}\s*$/,
	simpleEndFnRgxp = /[<>^~\/%*+\-=;,)}\]\s]/,
	sRgxp = /\s/;

var deepFnRgxp = new RegExp(
	'(' +
		'(?:' +
			`(?:function|get|set)(?:\\s+[${w}$]+|)` +
			'|' +
			`(?:^\\s*\\{|,|[=:,(\\[\\w]\\s*\\{)\\s*[${w}$]+` + // shorthand methods
		')\\s*\\(([\\s\\S]*?)\\)\\s*\\{' + // function foo(...) {} || get foo(...) {} || set foo(...) {} || foo(...) {}

		'|' +
		`function(?:\\s+[${w}$]+|)\\s*\\(([\\s\\S]*?)\\)+\\s*(?=[^,]+)` + // function foo(...) ...

		'|' +
		'(\\s*=>\\s*\\{?)' + // (...) => { ... } || (...) => ... || ... => { ... } || ... => ...
	')' +
	'([\\s\\S]*)'
);

/**
 * Вырезать из заданной строки декларации функций
 *
 * @param {string} str - исходная строка
 * @param {Object=} [opt_desc] - объект, в котором будет сохранено описание исходной функции
 * @return {(string|boolean)}
 */
function hideDeepFunctions(str, opt_desc) {
	opt_desc = opt_desc || {};

	var init = false;
	var simpleEndMap = {
		';': true,
		',': true,
		'}': true,
		')': true
	};

	var pOpenMap = {
		'(': true,
		'[': true
	};

	var pCloseMap = {
		']': true,
		')': true
	};

	while (true) {
		let arr = deepFnRgxp.exec(str);

		let bOpen = 1,
			pOpen = 0;

		let start = null,
			end = null;

		if (arr) {
			let adv = arr[1],
				index = arr.index;

			let args = [],
				arg = '';

			if (arr[4]) {
				if (init && !opt_desc.arrFn) {
					opt_desc.hasThis = true;
				}

				let j = 0,
					simple = null;

				for (let i = index; i--;) {
					let el = str.charAt(i);

					if (simple === null) {
						simple = !pCloseMap[el];

						if (!simple) {
							j++;
							adv = el + adv;
							pOpen++;
							continue;
						}
					}

					if (simple) {
						if (simpleEndFnRgxp.test(el)) {
							break;
						}

						j++;
						adv = el + adv;
						arg = el + arg;

					} else {
						j++;
						adv = el + adv;

						if (pCloseMap[el]) {
							pOpen++;

						} else if (pOpenMap[el]) {
							pOpen--;

							if (!pOpen) {
								break;
							}
						}

						if (el === ',' && pOpen === 1) {
							args.unshift(arg);
							arg = '';

						} else {
							arg = el + arg;
						}
					}
				}

				index -= j;

				if (arg) {
					args.unshift(arg);
				}

			} else {
				let argStr = arr[3] || arr[2] || '';

				for (let i = -1, length = argStr.length; ++i < length;) {
					let el = argStr.charAt(i);

					if (pOpenMap[el]) {
						pOpen++;

					} else if (pCloseMap[el]) {
						pOpen--;
					}

					if (el === ',' && !pOpen) {
						args.push(arg);
						arg = '';

					} else {
						arg += el;
					}
				}

				if (arg) {
					args.push(arg);
				}
			}

			for (let i = -1, length = args.length; ++i < length;) {
				if (advArgRgxp.test(args[i])) {
					opt_desc.subs = true;
					break;

				} else {
					args[i] = args[i].trim();
				}
			}

			opt_desc.args = args;
			pOpen = 0;

			let simple = adv.slice(-1) !== '{',
				tmp = arr[5];

			start = index;
			end = start + adv.length;

			if (init) {
				for (let i = -1, length = tmp.length; ++i < length;) {
					let el = tmp.charAt(i);

					if (simple) {
						if (pOpenMap[el]) {
							pOpen++;

						} else if (pCloseMap[el]) {
							pOpen--;
						}

						if ((!pOpen && simpleEndMap[el]) || i === length - 1) {
							end += i + 1;
							break;
						}

					} else {
						if (el === '{') {
							bOpen++;

						} else if (el === '}') {
							bOpen--;

							if (!bOpen) {
								end += i + 1;
								break;
							}
						}
					}
				}
			}

			if (start !== null) {
				if (init) {
					if (arrFnRgxp.test(adv)) {
						str = str.substring(0, start) + str.substring(start + adv.length, end - 1) + str.substring(end);

					} else {
						str = str.substring(0, start) + str.substring(end);
					}

					opt_desc.subs = true;

				} else {
					init = true;
					opt_desc.arrFn = arrFnRgxp.test(adv);

					let returnAdv = 0,
						returnVal = !simple && simpleFnRgxp.exec(tmp);

					if (returnVal) {
						returnAdv = returnVal[1].length;
						simple = true;
					}

					opt_desc.simple = simple;
					str = str.substring(0, start) + str.substring(end + returnAdv).replace(endFnRgxp, '');
				}

			} else {
				break;
			}

		} else {
			break;
		}
	}

	return init && str;
}

var thisRgxp = new RegExp(`${startIdTest}this${endIdTest}`, 'g'),
	yieldRgxp = new RegExp(`${startIdTest}(?:\$cYield|\$cSleep)${endIdTest}`, 'g'),
	argsRgxp = new RegExp(`${startIdTest}(el|key|data|i|length|id|callee|this)${endIdTest}`, 'g');

var returnRgxp = new RegExp(`${startIdTest}return${endIdTest}`, 'g'),
	calleeRgxp = new RegExp(`${startIdTest}callee${endIdTest}`, 'g');

var varRgxp = /(?:#|\$)\{([^}]*)}/g,
	fLengthRgxp = new RegExp(`${startIdTest}length${endIdTest}`, 'g');

var argOrder = {
	'this': 0,
	'return': 0,
	'el': 1,
	'key': 2,
	'data': 3,
	'i': 4,
	'length': 5,
	'callee': 6
};

var filterArgs = [
	'el',
	'key',
	'data',
	'i',
	'fLength',
	'callee'
];

var filterArgsCache = {};

/**
 * Вернуть true, если в указанной строке по заданным координатам значение
 * не является get / set, shorthand методом или свойством литерала
 *
 * @param {string} str - исходная строка
 * @param {number} start - позиция начала
 * @param {number} end - позиция конца
 * @return {boolean}
 */
function testVal(str, start, end) {
	var ternar;

	while (start > 0) {
		let el = str.charAt(start);
		if (!sRgxp.test(el)) {
			if (el === 't') {
				return false;
			}

			ternar = el === '?';
			break;
		}

		start--;
	}

	var length = str.length,
		bOpen = 0,
		bStart = false;

	while (end < length) {
		let el = str.charAt(end);

		if (!sRgxp.test(el)) {
			if (el === '(') {
				bOpen++;
				bStart = true;

			} else {
				if (!bOpen) {
					if (el === '{' || !bStart && !ternar && el === ':') {
						return false;
					}

					break;

				} else if (el === ')') {
					bOpen--;
				}
			}
		}

		end++;
	}

	return true;
}

/**
 * Вернуть true, если по заданному регулярному выражению
 * в указанной строке будут найдены совпадения
 *
 * @param {!RegExp} rgxp - регулярное выражение
 * @param {string} str - исходная строка
 * @return {boolean}
 */
function search(rgxp, str) {
	var el,
		res = false;

	while ((el = rgxp.exec(str))) {
		res = testVal(str, el.index, rgxp.lastIndex);

		if (res) {
			break;
		}
	}

	rgxp.lastIndex = 0;
	return res;
}

/**
 * Вернуть строку для инлайнинга функции или false
 *
 * @param {!Array} args - массив аргументов функции
 * @param {string} body - тело функции (без декларации)
 * @return {(string|boolean)}
 */
function optimize(args, body) {
	var lengthReplace = false;
	var argsRes = true,
		selfArgs = filterArgs.slice();

	// Допустим функция задана как function (elem, iteration),
	// заменяем входные параметры на el, i, data и т.д.,
	// а в случае, если эти параметры используются как локальные переменные,
	// то сбрасываем обработку
	for (let i = 0; i < args.length; i++) {
		let el = args[i].trim();

		if (!el) {
			continue;
		}

		if (el !== selfArgs[i]) {
			let tmp = `${startIdTest}${selfArgs[i]}${endIdTest}`,
				rgxp = filterArgsCache[tmp] =
					filterArgsCache[tmp] || new RegExp(tmp, 'g');

			if (search(rgxp, body)) {
				argsRes = false;
				break;
			}

			if (selfArgs[i] === 'fLength') {
				lengthReplace = true;
			}

			let arg = selfArgs[i];

			body = body.replace(
				new RegExp(`${startIdTest}${el}${endIdTest}`, 'g'),
				(sstr, $1, pos) => {
					if (testVal(body, pos, pos + sstr.length)) {
						return $1 + arg;
					}

					return sstr;
				}
			);

			delete selfArgs[i];

		} else {
			delete selfArgs[i];
		}
	}

	if (argsRes) {
		// Если остались не использованные системные переменные, вроде el, i и т.д.,
		// то проверяем не используются ли они локально
		for (let i = 0; i < selfArgs.length; i++) {
			let el = selfArgs[i];
			if (el && new RegExp(`${startIdTest}${el}${endIdTest}`).test(body)) {
				argsRes = false;
				break;
			}
		}
	}

	if (argsRes) {
		let obj = body.match(idsRgxp),
			canStr = true;

		if (obj) {
			// Проверяем тело функции на использование внешних параметров
			// и если таковые есть и они не входят в idHash,
			// то сбрасываем обработку
			for (let i = 0; i < obj.length; i++) {
				let el = idRgxp.exec(obj[i])[0];
				if (!idHash[el] && el.indexOf('__ESCAPER_QUOT__') !== 0) {
					if (el === 'fLength' && lengthReplace) {
						continue;
					}

					canStr = false;
					break;
				}
			}
		}

		return canStr ? Escaper.paste(body.trim()) : false;
	}

	return false;
}

var nRgxp = /(?:\r?\n|\r)+/g,
	stRgxp = /[ \t]+/g,
	defExprRgxp = /^:/;

function cutNextLine(str) {
	if (!isString(str)) {
		return str;
	}

	return str.replace(nRgxp, '');
}

/**
 * Анализировать тело заданной функции на возможность оптимизации
 *
 * @param {!Function} fn - исходная функция
 * @return {!Function}
 */
function prepareFn(fn) {
	var fnString = fn.toString(),
		cache = tmpFunc[fnString];

	if (cache) {
		fn['__COLLECTION_TMP__source'] = cache.source;
		fn['__COLLECTION_TMP__withThis'] = cache.withThis;
		fn['__COLLECTION_TMP__withReturn'] = cache.withReturn;
		fn['__COLLECTION_TMP__withYield'] = cache.withYield;

	} else {
		let desc = {};
		let fnSource = hideDeepFunctions(
			Escaper.replace(fnString, {'@all': true, '@comments': -1})
				.replace(nRgxp, '\n')
				.replace(stRgxp, ' '),

			desc
		);

		if (fnSource !== false) {
			if (isNativeRgxp.test(fnSource)) {
				fn['__COLLECTION_TMP__withThis'] = false;
				fn['__COLLECTION_TMP__withReturn'] = true;
				fn['__COLLECTION_TMP__withYield'] = false;

			} else {
				let withReturn = desc.simple ||
					search(returnRgxp, String(fnSource));

				if (!withReturn && !desc.subs) {
					let str = optimize(desc.args, String(fnSource));
					if (str !== false) {
						fn['__COLLECTION_TMP__source'] = str + (str.slice(-1) !== ';' ? ';' : '');
					}
				}

				fn['__COLLECTION_TMP__withThis'] = !desc.arrFn &&
					(desc.hasThis || search(thisRgxp, String(fnSource)));

				fn['__COLLECTION_TMP__withReturn'] = withReturn;
				fn['__COLLECTION_TMP__withYield'] = search(yieldRgxp, String(fnSource));
			}
		}

		tmpFunc[fnString] = {
			source: fn['__COLLECTION_TMP__source'] || null,
			withThis: fn['__COLLECTION_TMP__withThis'],
			withReturn: fn['__COLLECTION_TMP__withReturn'],
			withYield: fn['__COLLECTION_TMP__withYield']
		};
	}

	return fn;
}

//#if filter.string

/**
 * Компилировать строку в функцию (если нужно)
 * или подготовить к инлайнингу
 *
 * @param {string} str - исходная строка функции
 * @return {(!Object|!Function)}
 */
function compileFunc(str) {
	var key = str;

	if (tmpLinkFilter[key]) {
		return tmpLinkFilter[key];
	}

	str = Escaper.replace(str, true)
		.replace(nRgxp, '\n')
		.replace(stRgxp, ' ');

	var inline = !search(calleeRgxp, str);

	str = str
		.replace(varRgxp, 'this.getVar(\'$1\')');

	var withThis = false,
		fnCompileArgs = $C(filterArgs).map(() => 'null');

	var sysEl,
		maxLength = 0;

	while ((sysEl = argsRgxp.exec(str))) {
		let el = sysEl[2];

		if (!testVal(str, sysEl.index, argsRgxp.lastIndex)) {
			continue;
		}

		if (argOrder[el]) {
			let order = argOrder[el];

			fnCompileArgs[order - 1] = el === 'length' ?
				'fLength' : el;

			if (maxLength < order) {
				maxLength = order;
			}
		}

		if (el === 'this') {
			withThis = true;
		}
	}

	var fn;

	if (inline) {
		str = str.replace(fLengthRgxp, (sstr, $1, pos) => {
			if (testVal(str, pos, pos + sstr.length)) {
				return $1 + 'fLength';
			}

			return sstr;
		});

		fn = {
			'__COLLECTION_TMP__source': Escaper.paste(str),
			'__COLLECTION_TMP__withYield': search(yieldRgxp, str.substring(1)),

			call: true,
			inline: true,
			length: maxLength
		};

	} else {
		let code = Escaper.paste(str);
		fn = Function.apply(Function, filterArgs.concat(`return ${code.replace(defExprRgxp, '')};`));

		fn['__COLLECTION_TMP__args'] = fnCompileArgs;
		fn['__COLLECTION_TMP__source'] = code;

		fn['__COLLECTION_TMP__withThis'] = withThis;
		fn['__COLLECTION_TMP__withYield'] = search(yieldRgxp, str);
		fn['__COLLECTION_TMP__withReturn'] = true;
	}

	tmpLinkFilter[key] = fn;
	return fn;
}

Collection.prototype._compileFunc = compileFunc;

//#endif
//#include ./filter.js
