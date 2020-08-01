/*!
 * Collection v5.5.5
 * https://github.com/kobezzza/Collection
 *
 * Released under the MIT license
 * https://github.com/kobezzza/Collection/blob/master/LICENSE
 *
 * Date: Sat, 17 Jan 2015 09:13:38 GMT
 */

(function (root) {
"use strict";

/*!
 * Функции для работы с GCC
 */

/**
 * Экспортировать свойство объекта для GCC
 *
 * @param {?} a - вариант 1
 * @param {?} b - вариант 2
 * @return {?}
 */
function _(a, b) {
  if (a !== void 0) {
    return a;
  }

  return b;
}

/**
 * Вернуть заданный объект с указанием произвольного типа
 * (для приведения типа в GCC)
 *
 * @param {?} val - исходное значение
 * @return {?}
 */
_.any = function (val) {
  return val;
};
/*!
 * Глобальные переменные замыкания
 */

var global = this;
var toString = Object.prototype.toString,
    objectCreate = Object.create;

var slice = Array.prototype.slice,
    splice = Array.prototype.splice;

var unshift = Array.prototype.unshift,
    push = Array.prototype.push;

var reverse = Array.prototype.reverse,
    sort = Array.prototype.sort;

var definePropery = Object.defineProperty,
    getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor,
    getPrototypeOf = Object.getPrototypeOf;
/*!
 * Определение типов данных
 */

/**
 * Вернуть true, если заданный тип не undefined
 *
 * @param {string} type - исходный тип
 * @return {boolean}
 */
function isNotUndef(type) {
  return type !== "undefined";
}

/**
 * Вернуть true, если заданный объект является логическим
 *
 * @param {?} obj - исходный объект
 * @return {boolean}
 */
function isBoolean(obj) {
  return typeof obj === "boolean";
}

/**
 * Вернуть true, если заданный объект является строкой
 *
 * @param {?} obj - исходный объект
 * @return {boolean}
 */
function isString(obj) {
  return typeof obj === "string";
}

/**
 * Вернуть true, если заданный объект является числом
 *
 * @param {?} obj - исходный объект
 * @return {boolean}
 */
function isNumber(obj) {
  return typeof obj === "number";
}

/**
 * Вернуть true, если заданный объект является функцией
 *
 * @param {?} obj - исходный объект
 * @return {boolean}
 */
function isFunction(obj) {
  return typeof obj === "function";
}

/**
 * Вернуть true, если заданный объект является Map коллекцией
 *
 * @param {?} obj - исходный объект
 * @return {boolean}
 */
function isMap(obj) {
  return obj instanceof Map;
}

/**
 * Вернуть true, если заданный объект является WeakMap коллекцией
 *
 * @param {?} obj - исходный объект
 * @return {boolean}
 */
function isWeakMap(obj) {
  return obj instanceof WeakMap;
}

/**
 * Вернуть true, если заданный объект является Set коллекцией
 *
 * @param {?} obj - исходный объект
 * @return {boolean}
 */
function isSet(obj) {
  return obj instanceof Set;
}

/**
 * Вернуть true, если заданный объект является WeakSet коллекцией
 *
 * @param {?} obj - исходный объект
 * @return {boolean}
 */
function isWeakSet(obj) {
  return obj instanceof WeakSet;
}

/**
 * Вернуть true, если заданный объект является экземпляром Link
 *
 * @param {?} obj - исходный объект
 * @return {boolean}
 */
function isLink(obj) {
  return obj instanceof Link;
}

/**
 * Вернуть true, если заданный объект является объектом
 *
 * @param {?} obj - исходный объект
 * @return {boolean}
 */
function isObject(obj) {
  return Boolean(obj) && obj.constructor === Object;
}

/**
 * Вернуть true, если заданный объект является экземпляром Object
 *
 * @param {?} obj - исходный объект
 * @return {boolean}
 */
function isObjectInstance(obj) {
  return obj instanceof Object;
}

var isArray = Array.isArray,
    isFuncRgxp = /\[object Function]/;

/**
 * Вернуть true, если заданный объект является массивом или массиво-подобным объектом
 *
 * @param {?} obj - исходный объект
 * @return {boolean}
 */
function isLikeArray(obj) {
  var res = isArray(obj) || obj &&

  // Костыль для PhantomJS,
  // т.к. в нём HTMLCollection и NodeList
  // typeof 'function' && instanceof Function = false
  isObjectInstance(obj) && !isFuncRgxp.test(toString.call(obj)) && (
  // Проверка объекта на схожесть с массивом
  obj.length > 0 && 0 in obj || obj.length === 0);

  return Boolean(res);
}

/**
 * Вернуть true, если заданный объект является генератором
 *
 * @param {?} obj - исходный объект
 * @return {boolean}
 */
function isGenerator(obj) {
  return isFunction(obj) && obj.constructor.name === "GeneratorFunction";
}

/**
 * Вернуть тип данных заданного объекта
 *
 * @param {!Object} obj - исходный объекты
 * @param {?string=} [opt_use] - тип используемого цикла внутри итератора: for, for of или for in
 * @return {string}
 */
function getType(obj, opt_use) {
  var type = "object";

  if (!obj) {
    return type;
  }

  if (CALLEE_SUPPORT && "callee" in obj && "length" in obj) {
    return "array";
  }

  switch (opt_use) {
    case "for":
      type = "array";
      break;

    case "for of":
      type = "iterator";
      break;

    case "for in":
      type = "object";
      break;

    default:
      if (isMap(obj)) {
        type = "map";
      } else if (isWeakMap(obj)) {
        type = "weakMap";
      } else if (isSet(obj)) {
        type = "set";
      } else if (isWeakSet(obj)) {
        type = "weakSet";
      } else if (isGenerator(obj)) {
        type = "generator";
      } else if (isLikeArray(obj)) {
        type = "array";
      } else if (iterator(obj)) {
        type = "iterator";
      }
  }

  return type;
}

var tmpTypeLink = {};
var isFilterRgxp = /&&|\|\||:|!/,
    isNativeRgxp = /\[native code]/,
    isStringExpressionRgxp = /^\s*:/;

/**
 * Вернуть true, если указанная строка является фильтром
 *
 * @private
 * @param {string} str - исходная строка
 * @return {boolean}
 */
Collection.prototype._isFilter = function (str) {
  var cache = tmpTypeLink[str];

  if (cache) {
    return cache;
  }

  tmpTypeLink[str] = cache = str === "active" || this._isExistsInCluster("filter", str) || isFilterRgxp.test(str);

  return cache;
};

var nativeNames = {
  "Number": true,
  "String": true,
  "Boolean": true,
  "Symbol": true,

  "Function": true,
  "Date": true,
  "RegExp": true,
  "Blob": true,

  "Array": true,
  "ArrayBuffer": true,

  "Uint8ClampedArray": true,
  "Uint8Array": true,
  "Uint16Array": true,
  "Uint32Array": true,

  "Int8Array": true,
  "Int16Array": true,
  "Int32Array": true,

  "Map": true,
  "WeakMap": true,

  "Set": true,
  "WeakSet": true,

  "Error": true,
  "EvalError": true,
  "TypeError": true,
  "SyntaxError": true,
  "URIError": true,
  "RangeError": true,
  "ReferenceError": true
};

/**
 * Вернуть true, если заданный объект может быть расширен
 *
 * @param {?} obj - исходный объект
 * @return {boolean}
 */
function isExtensible(obj) {
  if (!obj) {
    return false;
  }

  if (isArray(obj)) {
    return true;
  }

  var constr = obj.constructor;

  if (!isFunction(constr)) {
    return false;
  }

  if (constr === Object) {
    return true;
  }

  if (nativeNames[constr.name]) {
    return false;
  }

  return !isNativeRgxp.test(Escaper.replace(constr.toString(), true));
}

/*!
 * Полифилы
 */

Array.isArray = Array.isArray || function (obj) {
  return toString.call(obj) === "[object Array]";
};

String.prototype.trim = String.prototype.trim || function () {
  var str = this.replace(/^\s\s*/, ""),
      i = str.length;

  for (var rgxp = /\s/; rgxp.test(str.charAt(--i));) {}
  return str.substring(0, i + 1);
};

Object.create = Object.create || function (proto) {
  /** @constructor */
  var F = function () {};
  F.prototype = proto;
  return new F();
};

if (!isFunction(Object.getPrototypeOf)) {
  if (typeof "test".__proto__ === "object") {
    Object.getPrototypeOf = function (object) {
      return object.__proto__;
    };
  } else {
    Object.getPrototypeOf = function (object) {
      return object.constructor.prototype;
    };
  }
}

var spliceTest = {
  0: 1,
  1: 2,
  length: 2
};

splice.call(spliceTest, 1, 1);
if (spliceTest[1] !== void 0 || spliceTest.length !== 1) {
  splice = function (from, pos) {
    if (isArray(this)) {
      return this.splice(from, pos);
    }

    var res = [];
    for (; from <= pos; from++) {
      res.push(this[from]);
      delete this[from];
      this.length--;
    }

    return res;
  };
}

var globalDefine = global["define"];
global["define"] = void 0;

// Данная глобальная ссылка нужна,
// чтобы при AMD подключении библиотеки
// мог подтянуться кеш
var namespace = "__COLLECTION_NAMESPACE__https_github_com_kobezzza_Collection";
global[namespace] = Collection;

/**
 * Создать новый экземпляр Collection
 *
 * @constructor
 * @implements {$$Collection}
 *
 * @param {$$CollectionType=} [opt_collection] - новая коллекция:
 *     в случае указания строки, то она преобразуется в массив через .split('')
 *
 * @param {Object=} [opt_dObj] - таблица свойств экземпляра
 *     (если используются статичные свойства)
 */
function Collection(opt_collection, opt_dObj) {
  this.dObj = opt_dObj || extend(true, {}, dObj);

  if (opt_dObj) {
    var _dObj2 = this.dObj = objectCreate(this.dObj);

    _dObj2.sys = objectCreate(_dObj2.sys);
    _dObj2.active = objectCreate(_dObj2.active);
  }

  this.__sys = this.dObj.sys;
  this.__flags = this.__sys.flags;
  this.__use = this.__flags.use;

  this.__active = this.dObj.active;
  this.__active.collection = this._modVal(opt_collection, "collection");
}

var _dObj;

/**
 * Создать новый экземпляр Collection
 * (вызов без new, статичные свойства)
 *
 * @see Collection
 * @param {$$CollectionType=} [opt_collection] - новая коллекция:
 *     в случае указания строки, то она преобразуется в массив через .split('')
 *
 * @return {!Collection}
 */
function $C(opt_collection) {
  if (!_dObj) {
    _dObj = extend(true, {}, dObj);
  }

  return new Collection(opt_collection, _dObj);
}

/*!
 * Основные константы
 */

/** @const */
Collection.prototype.NAME = "Collection";

/** @const */
Collection.prototype.VERSION = [5, 5, 5];

var NULL = {};
var CACHE_VERSION = 14;
var CLUSTER = ["namespace", "collection", "filter", "context", "var"];

/**
 * Вернуть строку: название + версия библиотеки
 * @return {string}
 */
Collection.prototype.collection = function () {
  return this.NAME + " " + this.VERSION.join(".");
};

/*!
 * Различные hack константы
 */

var IS_NODE = false,
    JSON_SUPPORT = false;

try {
  IS_NODE = typeof process === "object" && toString.call(process) === "[object process]";
  JSON_SUPPORT = JSON.parse(JSON.stringify({ foo: "bar" })).foo === "bar";
} catch (ignore) {}

var IS_BROWSER = !IS_NODE && isNotUndef(typeof window);
var ITERATOR_KEY = isNotUndef(typeof Symbol) && Symbol["iterator"];

var MAP_SUPPORT = isFunction(global["Map"]);
var SET_SUPPORT = isFunction(global["Set"]);

var DESCRIPTORS_SUPPORT = isFunction(Object.getOwnPropertyDescriptor);
var BLOB_SUPPORT = isNotUndef(typeof Blob) && isNotUndef(typeof URL);
var LOCAL_STORAGE_SUPPORT = isNotUndef(typeof localStorage);

var CALLEE_SUPPORT = eval( /* cbws */"(function () {'use strict';var res = true;try {arguments.callee;} catch (ignore) {res = false;}return res;})()");
var Escaper, globalEscaper = global.Escaper;

/* istanbul ignore next */
/*!
 * Escaper v2.1.10
 * https://github.com/kobezzza/Escaper
 *
 * Released under the MIT license
 * https://github.com/kobezzza/Escaper/blob/master/LICENSE
 *
 * Date: Sat, 17 Jan 2015 08:43:18 GMT
 */

(function () {
  "use strict";

  var Escaper = {
    VERSION: [2, 1, 11]
  };

  if (typeof define === "function" && define.amd) {
    define([], function () {
      return Escaper;
    });
  } else if (typeof exports === "object") {
    module.exports = exports = Escaper;
  } else {
    this.Escaper = Escaper;
  }

  var stringLiterals = {
    "\"": true,
    "'": true,
    "`": true
  };

  var literals = {
    "/": true
  };

  for (var key in stringLiterals) {
    if (!stringLiterals.hasOwnProperty(key)) {
      continue;
    }

    literals[key] = true;
  }

  var singleComments = {
    "//": true
  };

  var multComments = {
    "/*": true,
    "/**": true,
    "/*!": true
  };

  var keyArr = [],
      finalMap = {};

  for (var key in literals) {
    if (!literals.hasOwnProperty(key)) {
      continue;
    }

    keyArr.push(key);
    finalMap[key] = true;
  }

  for (var key in singleComments) {
    if (!singleComments.hasOwnProperty(key)) {
      continue;
    }

    keyArr.push(key);
    finalMap[key] = true;
  }

  for (var key in multComments) {
    if (!multComments.hasOwnProperty(key)) {
      continue;
    }

    keyArr.push(key);
    finalMap[key] = true;
  }

  var rgxpFlagsMap = {
    "g": true,
    "m": true,
    "i": true,
    "y": true,
    "u": true
  };

  var rgxpFlags = [];
  for (var key in rgxpFlagsMap) {
    if (!rgxpFlagsMap.hasOwnProperty(key)) {
      continue;
    }

    rgxpFlags.push(key);
  }

  var escapeEndMap = {
    "-": true,
    "+": true,
    "*": true,
    "%": true,
    "~": true,
    ">": true,
    "<": true,
    "^": true,
    ",": true,
    ";": true,
    "=": true,
    "|": true,
    "&": true,
    "!": true,
    "?": true,
    ":": true,
    "(": true,
    "{": true,
    "[": true
  };

  var escapeEndWordMap = {
    "typeof": true,
    "void": true,
    "instanceof": true,
    "delete": true,
    "in": true,
    "new": true,
    "of": true
  };

  var cache = {},
      content = [];

  /**
   * @param {!Object} obj
   * @param {!Object} p
   * @param {(boolean|number)} val
   */
  function mix(obj, p, val) {
    for (var key in obj) {
      if (!obj.hasOwnProperty(key)) {
        continue;
      }

      if (key in p === false) {
        p[key] = val;
      }
    }
  }

  /**
   * Стек содержимого
   * @type {!Array}
   */
  Escaper.quotContent = content;

  var uSRgxp = /[^\s\/]/,
      wRgxp = /[a-z]/,
      sRgxp = /\s/,
      nRgxp = /\r|\n/;

  var symbols, snakeskinRgxp;

  Escaper.symbols = null;
  Escaper.snakeskinRgxp = null;

  /**
   * Заметить блоки вида ' ... ', " ... ", ` ... `, / ... /, // ..., /* ... *\/ на
   * __ESCAPER_QUOT__номер_ в указанной строке
   *
   * @param {string} str - исходная строка
   * @param {(Object.<string, boolean>|boolean)=} opt_withCommentsOrParams - таблица вырезаемых последовательностей:
   *
   *     (если установить значение параметру -1, то он будет полностью вырезаться,
   *     т.е. без возможности обратной замены, иначе true/false - включить/исключить последовательность)
   *
   *     *) @all - вырезаются все последовательности
   *     *) @comments - вырезаются все виды комментариев
   *     *) @strings - вырезаются все виды литералов строк
   *     *) @literals - вырезаются все виды литералов строк и регулярных выражений
   *     *) `
   *     *) '
   *     *) "
   *     *) /
   *     *) //
   *     *) /*
   *     *) /**
   *     *) /*!
   *
   *     ИЛИ если логическое значение, то вырезаются литералы с комментариями (true) / литералы (false)
   *
   * @param {Array=} opt_quotContent - стек содержимого
   * @param {?boolean=} [opt_snakeskin] - если true, то при экранировании учитываются конструкции Snakeskin
   * @return {string}
   */
  Escaper.replace = function (str, opt_withCommentsOrParams, opt_quotContent, opt_snakeskin) {
    symbols = symbols || Escaper.symbols || "a-z";

    snakeskinRgxp = snakeskinRgxp || Escaper.snakeskinRgxp || new RegExp("[!$" + symbols + "_]", "i");

    var isObj = opt_withCommentsOrParams instanceof Object;
    var p = isObj ? Object(opt_withCommentsOrParams) : {};

    var withComments = false;
    if (typeof opt_withCommentsOrParams === "boolean") {
      withComments = Boolean(opt_withCommentsOrParams);
    }

    if ("@comments" in p) {
      mix(multComments, p, p["@comments"]);
      mix(singleComments, p, p["@comments"]);
      delete p["@comments"];
    }

    if ("@strings" in p) {
      mix(stringLiterals, p, p["@strings"]);
      delete p["@strings"];
    }

    if ("@literals" in p) {
      mix(literals, p, p["@literals"]);
      delete p["@literals"];
    }

    if ("@all" in p) {
      mix(finalMap, p, p["@all"]);
      delete p["@all"];
    }

    var cacheKey = "";
    for (var i = -1; ++i < keyArr.length;) {
      var el = keyArr[i];

      if (multComments[el] || singleComments[el]) {
        p[el] = withComments || p[el];
      } else {
        p[el] = p[el] || !isObj;
      }

      cacheKey += "" + p[el] + ",";
    }

    var initStr = str;
    var stack = opt_quotContent || content;

    if (stack === content && cache[cacheKey] && cache[cacheKey][initStr]) {
      return cache[cacheKey][initStr];
    }

    var begin = false,
        end = true;

    var escape = false,
        comment = false;

    var selectionStart = 0,
        block = false;

    var templateVar = 0,
        filterStart = false;

    var cut, label;

    var part = "",
        rPart = "";

    for (var i = -1; ++i < str.length;) {
      var el = str.charAt(i),
          next = str.charAt(i + 1);

      var word = str.substr(i, 2),
          extWord = str.substr(i, 3);

      if (!comment) {
        if (!begin) {
          if (el === "/") {
            if (singleComments[word] || multComments[word]) {
              if (singleComments[extWord] || multComments[extWord]) {
                comment = extWord;
              } else {
                comment = word;
              }
            }

            if (comment) {
              selectionStart = i;
              continue;
            }
          }

          if (escapeEndMap[el] || escapeEndWordMap[rPart]) {
            end = true;
            rPart = "";
          } else if (uSRgxp.test(el)) {
            end = false;
          }

          if (wRgxp.test(el)) {
            part += el;
          } else {
            rPart = part;
            part = "";
          }

          var skip = false;
          if (opt_snakeskin) {
            if (el === "|" && snakeskinRgxp.test(next)) {
              filterStart = true;
              end = false;
              skip = true;
            } else if (filterStart && sRgxp.test(el)) {
              filterStart = false;
              end = true;
              skip = true;
            }
          }

          if (!skip) {
            if (escapeEndMap[el]) {
              end = true;
            } else if (uSRgxp.test(el)) {
              end = false;
            }
          }
        }

        // Блоки [] внутри регулярного выражения
        if (begin === "/" && !escape) {
          if (el === "[") {
            block = true;
          } else if (el === "]") {
            block = false;
          }
        }

        if (!begin && templateVar) {
          if (el === "}") {
            templateVar--;
          } else if (el === "{") {
            templateVar++;
          }

          if (!templateVar) {
            el = "`";
          }
        }

        if (begin === "`" && !escape && word === "${") {
          el = "`";
          i++;
          templateVar++;
        }

        if (finalMap[el] && (el !== "/" || end) && !begin) {
          begin = el;
          selectionStart = i;
        } else if (begin && (el === "\\" || escape)) {
          escape = !escape;
        } else if (finalMap[el] && begin === el && !escape && (begin !== "/" || !block)) {
          if (el === "/") {
            for (var j = -1; ++j < rgxpFlags.length;) {
              if (rgxpFlagsMap[str.charAt(i + 1)]) {
                i++;
              }
            }
          }

          begin = false;
          end = false;

          if (p[el]) {
            cut = str.substring(selectionStart, i + 1);

            if (p[el] === -1) {
              label = "";
            } else {
              label = "__ESCAPER_QUOT__" + stack.length + "_";
              stack.push(cut);
            }

            str = str.substring(0, selectionStart) + label + str.substring(i + 1);
            i += label.length - cut.length;
          }
        }
      } else if (nRgxp.test(next) && singleComments[comment] || multComments[el + str.charAt(i - 1)] && i - selectionStart > 2 && multComments[comment]) {
        if (p[comment]) {
          cut = str.substring(selectionStart, i + 1);

          if (p[comment] === -1) {
            label = "";
          } else {
            label = "__ESCAPER_QUOT__" + stack.length + "_";
            stack.push(cut);
          }

          str = str.substring(0, selectionStart) + label + str.substring(i + 1);
          i += label.length - cut.length;
        }

        comment = false;
      }
    }

    if (stack === content) {
      cache[cacheKey] = cache[cacheKey] || {};
      cache[cacheKey][initStr] = str;
    }

    return str;
  };

  var pasteRgxp = /__ESCAPER_QUOT__(\d+)_/g;

  /**
   * Заметить __ESCAPER_QUOT__номер_ в указанной строке на реальное содержимое
   *
   * @param {string} str - исходная строка
   * @param {Array=} opt_quotContent - стек содержимого
   * @return {string}
   */
  Escaper.paste = function (str, opt_quotContent) {
    var stack = opt_quotContent || content;
    return str.replace(pasteRgxp, function (sstr, pos) {
      return stack[pos];
    });
  };
}).call(new Function("return this")());

if (IS_NODE) {
  Escaper = exports;
  module["exports"] = exports = root;
} else {
  Escaper = global.Escaper;
  global.Escaper = globalEscaper;
}
/**
 * Конструктор объекта-указателя Collection
 *
 * @constructor
 * @param {$$CollectionLink} link - указатель
 */
function Link(link) {
  this.link = isArray(link) ? [link] : link;
}

/**
 * Вернуть значение указателя
 * @return {$$CollectionLink}
 */
Link.prototype.valueOf = function () {
  return this.link;
};

/**
 * Декларировать указатель
 *
 * @param {$$CollectionLink} link - указатель
 * @return {!Link}
 */
Collection.prototype.link = function (link) {
  return new Link(link);
};

root.$cLink = Collection.prototype.link;

/*!
 * API для экранирования в запросах и указателях
 */

/**
 * Универсальная функция для экранирования символов внутри блоков [].
 * Для экранирования символа ] внутри блока [] необходимо использовать \\
 *
 * @param {string} str - исходная строка
 * @param {function(string, number, string): boolean} rule - условие проверки
 * @param {function(string, number, string): {i: number, result: string}} action - функция обработки
 * @return {string}
 */
function escapeBlock(str, rule, action) {
  var bOpen = false,
      escape = false;

  for (var i = -1; ++i < str.length;) {
    var el = str.charAt(i);

    if (el === "\\") {
      escape = !escape;

      if (!escape) {
        str = str.substring(0, i - 1) + str.substring(i);
        i--;
      }

      continue;
    }

    if (el === "[") {
      bOpen = true;
    } else if (el === "]" && bOpen) {
      if (!escape) {
        bOpen = false;
      } else {
        str = str.substring(0, i - 1) + str.substring(i);
      }
    } else if (bOpen && rule(el, i, str)) {
      var tmp = action(el, i, str);
      str = tmp.result;
      i = tmp.i;
    }
  }

  return str;
}

var escapeGtBackRgxp = /__COLLECTION_ESCAPE__GT/g;

/**
 * @see splitPath
 * @param {string} str
 * @param {?boolean=} [opt_withoutCut]
 * @return {(!Array)}
 */
Collection.splitPath = splitPath;

/**
 * Экранировать заданную строку указателя контекста
 * и вернуть результат разбиения по разделителю (>)
 *
 * @param {string} str - исходная строка
 * @param {?boolean=} [opt_withoutCut] - если true, то из строки не вырезаются экранирующие блоки []
 * @return {!Array}
 */
function splitPath(str, opt_withoutCut) {
  str = escapeBlock(str, function (el, i, str) {
    return el === ">";
  }, function (el, i, str) {
    return {
      result: "" + str.substring(0, i) + "__COLLECTION_ESCAPE__GT" + str.substring(i + 1),
      i: i
    };
  });

  /** @type {!Array.<?>} */
  var strList = _.any(str.split(">"));
  var escaped = false;

  // Очистка "мёртвых" ссылок (например, id>>eq(-1)>)
  // и замена спец символов
  for (var i = strList.length; i--;) {
    strList[i] = strList[i].trim();
    var el = strList[i];

    if (!opt_withoutCut && el.charAt(0) === "[") {
      el = el.slice(1, -1);
      escaped = true;
    } else {
      escaped = false;
    }

    if (el === "") {
      strList.splice(i, 1);
    } else {
      strList[i] = el.replace(escapeGtBackRgxp, ">");

      if (escaped) {
        strList[i] = Object(strList[i]);
        strList[i]["__COLLECTION_ESCAPED__"] = true;
      }
    }
  }

  return strList;
}

/**
 * Вернуть заданный контекст в форме массива
 *
 * @private
 * @see Collection.prototype.byLink
 * @param {$$CollectionLink} context - указатель
 * @return {!Array}
 */
Collection.prototype._returnContext = function (context) {
  var ctxIsLink = isLink(context);

  if (ctxIsLink) {
    context = context.valueOf();
  }

  if (isString(context)) {
    context = this.splitPath(context);
  } else if (ctxIsLink || context !== void 0) {
    context = isArray(context) ? context : [context];
  } else {
    context = [];
  }

  return context;
};

/**
 * Объединить заданные указатели
 *
 * @private
 * @param {...$$CollectionLink} contexts - указатели
 * @return {!Array}
 */
Collection.prototype._joinContexts = function (contexts) {
  var _this = this;
  var res = [];

  $C(arguments).forEach(function (context) {
    res = res.concat(_this._returnContext(context));
  });

  return res;
};

var tmpLink = {},
    linkRgxp = /^\s*\[|]\s*$/g;

/**
 * @see byLink
 * @param {?} obj
 * @param {$$CollectionLink} link
 * @param {?=} [opt_val]
 * @param {?boolean=} opt_delete
 * @param {?boolean=} opt_create
 * @param {?boolean=} opt_test
 * @return {?}
 */
Collection.prototype.byLink = byLink;

/**
 * Установить новое значение свойства объекта по заданному указателю или получить/удалить свойство.
 * Для экранирования указателей используется [], например: [a>] > [ a d].
 *
 * При изменение / удалении свойства возвращается объект вида:
 *
 *     {
 *         result: boolean,
 *         key: ?,
 *         value: ?
 *     }
 *
 * @param {?} obj - исходный объект
 * @param {$$CollectionLink} link - указатель:
 *     УКАЗАТЕЛЬ-СТРОКА:
 *     a > foo > [ bar [] ] ~ obj['a']['foo'][' bar [] ']
 *     0 > eq(-1) ~ obj[0][первый с конца элемент]
 *
 *     УКАЗАТЕЛЬ-МАССИВ (тип данных ключа сохраняется, актуально для Map/Set):
 *     [{}, 1, null] ~ obj[{}][1][null]
 *     ['[eq(-1)]', 'eq(-1)'] ~ obj['eq(-1)'][первый с конца элемент]
 *
 * @param {?=} [opt_val] - новое значение для установки
 *
 * @param {?boolean=} opt_delete - если true, то запрашиваемое свойство удаляется
 * @param {?boolean=} opt_create - если true, то в случае отсутствия
 *     запрашиваемого свойства - оно будет создано
 *
 * @param {?boolean=} opt_test - если true, то в случае отсутствия
 *     запрашиваемого свойства функция вернёт false, или же true, если таковое есть
 *
 * @return {({key, result: boolean, value}|?)}
 */
function byLink(obj, link, opt_val, opt_delete, opt_create, opt_test) {
  var objLink = false, linkList;

  if (isLink(link)) {
    link = link.valueOf();
  }

  if (isString(link)) {
    linkList = tmpLink[link];

    if (!tmpLink[link]) {
      tmpLink[link] = linkList = splitPath(link);
    }
  } else if (!isArray(link)) {
    linkList = [link];
  } else {
    objLink = true;
    linkList = link;
  }

  var length = linkList.length,
      last = length - 1;

  var pre, preKey;

  for (var i = -1; ++i < length;) {
    var el = linkList[i];

    if (obj == null) {
      if (opt_test) {
        return false;
      }

      throw new ReferenceError("" + el + " is not defined!");
    }

    var partIsString = isString(el),
        isTest = i === last && opt_test;

    if (isTest) {
      pre = obj;
      preKey = el;
    }

    var objIsMap = isMap(obj),
        objIsSet = isSet(obj);

    var isAMap = objIsMap || isWeakMap(obj),
        isASet = objIsSet || isWeakSet(obj);

    // Дочерние свойства (>)
    if (!partIsString || el.indexOf("eq(") !== 0) {
      if (partIsString && objLink) {
        el = el.replace(linkRgxp, "");
      } else if (el instanceof String && el["__COLLECTION_ESCAPED__"]) {
        el = String(el);
      }

      // Установка значения или удаление
      if (!isTest && i === last && (opt_delete || opt_val !== void 0)) {
        var cache = {
          key: isASet ? null : el,
          result: isAMap || isASet ? obj.has(el) : el in obj,

          value: isAMap ? obj.get(el) : isASet ? el : obj[el]
        };

        if (opt_delete) {
          if (cache.result) {
            if (isAMap || isASet) {
              obj.delete(el);
              cache.result = !obj.has(el);
            } else {
              if (isLikeArray(obj) && !isNaN(Number(el))) {
                splice.call(obj, el, 1);
              } else {
                delete obj[el];
              }

              cache.result = el in obj === false || obj[el] !== cache.value;
            }
          }
        } else {
          if (isAMap) {
            if (obj.get(el) !== opt_val) {
              obj.set(el, opt_val);
              cache.result = obj.get(el) === opt_val;
            } else {
              cache.result = false;
            }
          } else if (isASet) {
            var has = obj.has(el);

            cache.result = false;
            cache.value = has ? el : void 0;

            if (!obj.has(opt_val)) {
              if (has) {
                obj.delete(el);
              }

              obj.add(opt_val);
              cache.result = obj.has(opt_val);
            }
          } else {
            if (isLikeArray(obj) && !isNaN(Number(cache.key))) {
              cache.key = Number(cache.key);
            } else {
              cache.key = String(cache.key);
            }

            if (obj[el] !== opt_val) {
              obj[el] = opt_val;
              cache.result = obj[el] === opt_val;
            } else {
              cache.result = false;
            }
          }
        }

        return cache;

        // Возврат значения
      } else {
        if (isAMap) {
          obj = obj.get(el);
        } else if (isASet) {
          if (obj.has(el)) {
            obj = el;
          } else {
            obj = void 0;
          }
        } else {
          if (opt_create && obj[el] === void 0) {
            obj[el] = {};
          }

          obj = obj[el];
        }
      }

      // Выбор по порядку (eq)
    } else {
      var pos = Number(el.slice(3, -1)),
          customIterator = iterator(obj);

      if (!isLikeArray(obj) && !isAMap && !isASet && (isGenerator(obj) || customIterator)) {
        var res = [];
        var cursor = customIterator ? customIterator() : obj();

        var j = pos > 0 ? pos + 1 : 0;

        for (var key = cursor.next(); !key.done; key = cursor.next()) {
          res.push(key.value);
          j--;

          if (!j) {
            break;
          }
        }

        obj = res;

        if (isTest) {
          pre = obj;
        }
      }

      if (isLikeArray(obj)) {
        var size = obj.length;

        pos = pos >= 0 ? pos : size + pos;

        if (pos < 0) {
          if (isTest) {
            return false;
          }

          if (opt_delete || opt_val !== void 0) {
            return {
              key: void 0,
              value: void 0,
              result: false
            };
          }

          obj = void 0;
          continue;
        }

        if (isTest) {
          preKey = pos;

          // Установка значения или удаление
        } else if (i === last && (opt_delete || opt_val !== void 0)) {
          var cache = {
            key: pos,
            value: obj[pos],
            result: pos in obj
          };

          if (opt_delete) {
            if (cache.result) {
              splice.call(obj, pos, 1);
              cache.result = obj[pos] !== cache.value;
            }
          } else {
            if (obj[pos] !== opt_val) {
              obj[pos] = opt_val;
              cache.result = obj[pos] === opt_val;
            } else {
              cache.result = false;
            }
          }

          return cache;

          // Возврат значения
        } else {
          if (opt_create && obj[pos] === void 0) {
            obj[pos] = {};
          }

          obj = obj[pos];
        }
      } else {
        var size = 0,
            map = void 0;

        if (objIsMap || objIsSet) {
          size = obj.size;
        } else {
          if (isAMap || isASet) {
            throw new TypeError("Incorrect data type");
          }

          if (keys) {
            map = keys(obj);
            size = map.length;
          } else {
            for (var key in obj) {
              if (!obj.hasOwnProperty(key)) {
                continue;
              }

              size = true;
              break;
            }
          }
        }

        // Расчёт позиции для обратного порядка
        if (pos < 0) {
          if (!map && !objIsMap && !objIsSet) {
            size = 0;

            for (var key in obj) {
              if (!obj.hasOwnProperty(key)) {
                continue;
              }

              size++;
            }
          }

          pos += size;
        }

        if (size !== true && (!size || pos < 0 || pos > size)) {
          if (isTest) {
            return false;
          }

          if (opt_delete || opt_val !== void 0) {
            return {
              key: void 0,
              value: void 0,
              result: false
            };
          }

          obj = void 0;
          continue;
        }

        var j = 0;

        if (objIsMap) {
          var _keys = obj.keys();

          for (var step = _keys.next(); !step.done; step = _keys.next()) {
            var key = step.value;

            if (pos === j) {
              if (isTest) {
                preKey = key;
              } else if (i === last && (opt_delete || opt_val !== void 0)) {
                var cache = {
                  key: key,
                  value: obj.get(key),
                  result: obj.has(key)
                };

                if (opt_delete) {
                  if (cache.result) {
                    obj.delete(key);
                    cache.result = !obj.has(key);
                  }
                } else {
                  if (obj.get(key) !== opt_val) {
                    obj.set(key, opt_val);
                    cache.result = obj.get(key) === opt_val;
                  } else {
                    cache.result = false;
                  }
                }

                return cache;
              } else {
                obj = obj.get(key);
              }

              j++;
              break;
            }

            j++;
          }
        } else if (objIsSet) {
          var _keys2 = obj.keys();

          for (var step = _keys2.next(); !step.done; step = _keys2.next()) {
            var key = step.value;

            if (pos === j) {
              if (isTest) {
                preKey = key;
              } else if (i === last && (opt_delete || opt_val !== void 0)) {
                var cache = {
                  key: null,
                  value: key
                };

                if (opt_delete) {
                  cache.result = obj.has(key);
                  if (cache.result) {
                    obj.delete(key);
                    cache.result = !obj.has(key);
                  }
                } else {
                  var has = obj.has(key);

                  cache.result = false;
                  cache.value = has ? key : void 0;

                  if (!obj.has(opt_val)) {
                    if (has) {
                      obj.delete(key);
                    }

                    obj.add(opt_val);
                    cache.result = obj.has(opt_val);
                  }
                }

                return cache;
              } else {
                obj = key;
              }

              j++;
              break;
            }

            j++;
          }
        } else {
          if (map) {
            var key = map[pos];

            if (isTest) {
              preKey = key;
            } else if (opt_delete || opt_val !== void 0) {
              var cache = {
                key: key,
                value: obj[key],
                result: key in obj
              };

              if (opt_delete) {
                if (cache.result) {
                  delete obj[key];
                  cache.result = obj[key] !== cache.value;
                }
              } else {
                if (obj[key] !== opt_val) {
                  obj[key] = opt_val;
                  cache.result = obj[key] === opt_val;
                } else {
                  cache.result = false;
                }
              }

              return cache;
            } else {
              if (opt_create && obj[key] === void 0) {
                obj[key] = {};
              }

              obj = obj[key];
            }
          } else {
            for (var key in obj) {
              if (!obj.hasOwnProperty(key)) {
                continue;
              }

              if (pos === j) {
                if (isTest) {
                  preKey = key;
                } else if (i === last && (opt_delete || opt_val !== void 0)) {
                  var cache = {
                    key: key,
                    value: obj[key],
                    result: key in obj
                  };

                  if (opt_delete) {
                    if (cache.result) {
                      delete obj[key];
                      cache.result = key in obj === false;
                    }
                  } else {
                    if (obj[key] !== opt_val) {
                      obj[key] = opt_val;
                      cache.result = obj[key] === opt_val;
                    } else {
                      cache.result = false;
                    }
                  }

                  return cache;
                } else {
                  if (opt_create && obj[key] === void 0) {
                    obj[key] = {};
                  }

                  obj = obj[key];
                }

                j++;
                break;
              }

              j++;
            }
          }
        }

        if (!map && pos !== j - 1) {
          if (isTest) {
            return false;
          }

          if (opt_delete || opt_val !== void 0) {
            return {
              key: void 0,
              value: void 0,
              result: false
            };
          }

          obj = void 0;
        }
      }
    }
  }

  if (opt_test) {
    if (isMap(pre) || isWeakMap(pre) || isSet(pre) || isWeakSet(pre)) {
      return pre.has(preKey);
    }

    return preKey in pre;
  }

  return obj;
}

/**
 * Вернуть true, если в указанном объекте
 * существует свойство по заданному указателю
 *
 * @see byLink
 * @param {$$CollectionLink} link - указатель
 * @param {!Object} obj - исходный объект
 * @return {boolean}
 */
Collection.in = function (link, obj) {
  return byLink(obj, link, void 0, null, null, true);
};

/**
 * Вернуть true, если в коллекции
 * существует свойство по заданному указателю
 *
 * @see byLink
 * @param {$$CollectionLink} link - указатель
 * @param {?string=} opt_id - ИД коллекции
 * @return {boolean}
 */
Collection.prototype.in = function (link, opt_id) {
  return byLink(this._getOne(void 0, opt_id), link, void 0, null, null, true);
};


/*!
 * Дополнительные функции и методы для работы с объектами
 */

/**
 * Клонировать заданный объект
 *
 * @param {?} obj - исходный объект
 * @return {?}
 */
Collection.clone = function (obj) {
  return JSON.parse(JSON.stringify(obj));
};

if (!JSON_SUPPORT) {
  Collection.clone = function () {
    throw new ReferenceError("Object JSON is not defined!");
  };
}

if (isNativeRgxp.test(Object.keys && Object.keys.toString())) {
  var keys = Collection.prototype["_keys"] = Object.keys;
}

/**
 * @see extend
 * @param {(boolean|?$$Collection_extend)} deepOrParams
 * @param {Object} target
 * @param {...Object} args
 * @return {!Object}
 */
Collection.extend = extend;

/**
 * Расширить заданный объект свойствами других объектов
 *
 * @param {(boolean|?$$Collection_extend)} deepOrParams - если true, то свойства копируются рекурсивно
 *     ИЛИ объект параметров расширения:
 *
 *     *) [withAccessors = false] - если true,
 *            то расширение идёт вместе с аксессорами свойств
 *
 *     *) [withProto = false] - если true,
 *            то расширение идёт с учётом прототипов
 *
 *     *) [deepOrParams.concatArray = false] - если true,
 *            то при расширение массива массивом происходит конкатенация
 *
 *     *) [deepOrParams.traits = false] - если true, то подмешиваются только новые свойства,
 *            а если -1, то только старые
 *
 *     *) [deepOrParams.deep = false] - если true, то свойства копируются рекурсивно
 *
 * @param {Object} target - расширяемый объект
 * @param {...Object} args - расширяющие объекты
 *
 * @return {!Object}
 */
function extend(deepOrParams, target, args) {
  var concatArray = false,
      params = deepOrParams;

  var withAccessors = false,
      withProto = false;

  var traits = false, deep;

  if (deepOrParams && !isBoolean(deepOrParams)) {
    /** @type {$$Collection_extend} */
    var p = _.any(deepOrParams);

    withProto = p.withProto;
    withAccessors = p.withAccessors && DESCRIPTORS_SUPPORT;

    concatArray = Boolean(p.concatArray);
    traits = p.traits || false;
    deep = Boolean(p.deep);
  } else {
    deep = deepOrParams || false;
  }

  var i = 1,
      length = arguments.length;

  /** @type {!Object} */
  var current = _.any(isObjectInstance(target) ? target : isArray(arguments[2]) ? [] : {});

  while (++i < length) {
    var arg = arguments[i];

    if (arg) {
      for (var key in arg) {
        if (withAccessors) {
          var descriptor = getOwnPropertyDescriptor(arg, key);
          if (descriptor && (descriptor.set || descriptor.get)) {
            definePropery(current, key, {
              get: descriptor.get,
              set: descriptor.set
            });

            continue;
          }
        }

        var src = current[key],
            copy = arg[key];

        if (current === copy || copy === arg) {
          continue;
        }

        var copyIsArray = void 0;
        if (deep && copy && typeof copy === "object" && ((copyIsArray = isArray(copy)) || isExtensible(copy))) {
          var isObj = src && typeof src === "object",
              isPlainObj = isObj && isExtensible(src);

          if (withProto && isPlainObj && !current.hasOwnProperty(key)) {
            if (isArray(current[key])) {
              current[key] = src = current[key].slice();
            } else {
              current[key] = src = objectCreate(current[key]);
            }
          }

          var clone = void 0;
          if (copyIsArray) {
            var srcIsArray = isArray(src);
            var isProto = false,
                constr = void 0;

            if (!srcIsArray && withProto && concatArray) {
              constr = isObj && getPrototypeOf(src);

              srcIsArray = constr && isArray(constr) && (isProto = true);
            }

            if (srcIsArray) {
              if (concatArray) {
                current[key] = (isProto ? constr : src).concat(copy);
                continue;
              } else {
                clone = src;
              }
            } else {
              clone = [];
            }
          } else {
            if (src && isPlainObj && !isArray(src)) {
              clone = src;
            } else {
              clone = {};
            }
          }

          current[key] = extend(params, clone, copy);
        } else if (copy !== void 0) {
          if (traits) {
            if (key in current === (traits === -1)) {
              current[key] = copy;
            }
          } else {
            current[key] = copy;
          }
        }
      }
    }
  }

  return current;
}


/**
 * Преобразовать заданный массиво-подобный объект в массив
 *
 * @param {!Object} obj - исходный объект
 * @return {!Array}
 */
Collection.toArray = function (obj) {
  var v = _.any(obj);

  if (v.length) {
    return slice.call(v);
  }

  var arr = [];

  if (keys) {
    var list = keys(v),
        length = list.length;

    for (var i = -1; ++i < length;) {
      arr[i] = v[list[i]];
    }
  } else {
    var i = 0;

    for (var key in v) {
      if (!v.hasOwnProperty(key)) {
        continue;
      }

      arr[i] = v[key];
      i++;
    }
  }

  return arr;
};

/*!
 * Поддержка Map и Set
 */

var Map = MAP_SUPPORT ? global["Map"] : function () {};

var WeakMap = global["WeakMap"] ? global["WeakMap"] : function () {};

var Set = SET_SUPPORT ? global["Set"] : function () {};

var WeakSet = global["WeakSet"] ? global["WeakSet"] : function () {};

var STRUCT_OPT = false;

// Оптимизация (+ полифил) итераций по Map / Set

if (MAP_SUPPORT) {
  (function () {
    STRUCT_OPT = true;

    global["Map"] = function (opt_iterable) {
      var obj = new Map();

      obj.constructor = global["Map"];
      obj._keys = obj["_keys"] = [];
      obj._keysMap = new Map();

      $C(opt_iterable).forEach(function (el) {
        obj.set(el[0], el[1]);
      });

      return obj;
    };

    global["Map"].prototype = Map.prototype;

    var mapSet = Map.prototype.set;
    Map.prototype.set = function (key, val) {
      if (this._keysMap && !this.has(key)) {
        this._keysMap.set(key, this._keys.push(key) - 1);
      }

      return mapSet.apply(this, arguments);
    };

    var mapDelete = Map.prototype.delete;
    Map.prototype.delete = function (key) {
      if (this._keysMap && this.has(key)) {
        var _keys3 = this._keys,
            map = this._keysMap,
            pos = map.get(key);

        if (pos === _keys3.length - 1) {
          _keys3.pop();
        } else {
          _keys3[pos] = NULL;
        }

        map.delete(key);
      }

      return mapDelete.apply(this, arguments);
    };

    var mapClear = Map.prototype.clear;
    Map.prototype.clear = function () {
      var _this2 = this;
      if (this._keysMap) {
        (function () {
          var map = _this2._keysMap;

          $C(_this2._keys).forEach(function (el, i, keys) {
            map.delete(el);
            keys.pop();
          }, { reverse: true });
        })();
      }

      return mapClear.apply(this, arguments);
    };

    /** @return {{next: function(): {value, done: boolean}}} */
    Map.prototype.keys = function () {
      var keys = this._keys,
          i = 0;

      return {
        next: function next() {
          var current, res = false;

          while (i !== keys.length) {
            current = keys[i];
            i++;

            if (current !== NULL) {
              res = true;
              break;
            }
          }

          return {
            value: res ? current : void 0,

            done: !res
          };
        }
      };
    };
  })();
}

if (SET_SUPPORT) {
  (function () {
    global["Set"] = function (opt_iterable) {
      var obj = new Set();

      obj.constructor = global["Set"];
      obj._keys = obj["_keys"] = [];
      obj._keysMap = new Map();

      $C(opt_iterable).forEach(function (el) {
        obj.add(el);
      });

      return obj;
    };

    global["Set"].prototype = Set.prototype;

    var setAdd = Set.prototype.add;
    Set.prototype.add = function (val) {
      if (!this.has(val)) {
        this._keysMap.set(val, this._keys.push(val) - 1);
      }

      return setAdd.apply(this, arguments);
    };

    var setDelete = Set.prototype.delete;
    Set.prototype.delete = function (val) {
      if (this.has(val)) {
        var _keys4 = this._keys,
            map = this._keysMap,
            pos = map.get(val);

        if (pos === _keys4.length - 1) {
          _keys4.pop();
        } else {
          _keys4[pos] = NULL;
        }

        map.delete(val);
      }

      return setDelete.apply(this, arguments);
    };

    var setClear = Set.prototype.clear;
    Set.prototype.clear = function () {
      var map = this._keysMap;

      $C(this._keys).forEach(function (el, i, keys) {
        map.delete(el);
        keys.pop();
      }, { reverse: true });

      return setClear.apply(this, arguments);
    };

    /** @return {{next: function(): {value, done: boolean}}} */
    Set.prototype.values = function () {
      var keys = this._keys,
          i = 0;

      return {
        next: function next() {
          var current, res = false;

          while (i !== keys.length) {
            current = keys[i];
            i++;

            if (current !== NULL) {
              res = true;
              break;
            }
          }

          return {
            value: res ? current : void 0,

            done: !res
          };
        }
      };
    };

    /** @return {{next: function(): {value, done: boolean}}} */
    Set.prototype.keys = Set.prototype.values;
  })();
}

/*!
 * Инициализация служебных свойств
 */

var defs = {
  "namespace": "nm",
  "collection": null,
  "filter": false,
  "context": "",
  "var": null
};

var dObj = {
  active: extend(false, {}, defs),
  sys: {
    flags: {
      use: {
        "context": true,
        "filter": true
      }
    }
  }
};

for (var i = CLUSTER.length; i--;) {
  var key = toUpperCase(CLUSTER[i], 1);
  dObj.sys["active" + key + "Id"] = null;
  dObj.sys["tmp" + key] = {};
}
Collection.Drivers = {};

var convertor = Collection.Drivers.Convertor = {

  /**
   * Название используемого модуля для конвертации данных
   * @type {string}
   */
  lib: "JSON",

  /**
   * Импортировать указанные данные в Collection
   *
   * @param {{lib: (?string|undefined), data}} params - импортируемые данные
   * @return {$$CollectionType}
   */
  importData: function importData(params) {
    return this.Engines[params.lib || this.lib].importData(params.data);
  },

  /**
   * Экспортировать указанные данные из Collection
   *
   * @param {{lib: (?string|undefined), data}} params - данные для экспорта
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_native_JSON#The_replacer_parameter
   * @param {(function(?, ?): ?|Array)=} [opt_replacer]
   * @param {(string|number|null)=} [opt_space]
   *
   * @return {?}
   */
  exportData: function exportData(params, opt_replacer, opt_space) {
    return this.Engines[params.lib || this.lib].exportData(params.data, opt_replacer, opt_space);
  },

  Engines: {
    JSON: {
      importData: function importData(data) {
        if (!JSON_SUPPORT) {
          throw new ReferenceError("Object JSON is not defined!");
        }

        return JSON.parse(data);
      },

      exportData: function exportData(data, opt_replacer, opt_space) {
        if (!JSON_SUPPORT) {
          throw new ReferenceError("Object JSON is not defined!");
        }

        return JSON.stringify(data, opt_replacer, opt_space);
      }
    }
  }
};
/**
 * Изменить значение заданного активного кластерного параметра
 *
 * @private
 * @param {string} clusterName - название кластерного параметра
 *     (например: 'collection', 'parser', 'filter', и т.д.)
 *
 * @param {?} newVal - новое значение
 * @return {!Collection}
 */
Collection.prototype._new = function (clusterName, newVal) {
  this.__active[clusterName] = this._modVal(newVal, clusterName);
  this.__sys["active" + toUpperCase(clusterName, 1) + "Id"] = null;
  return this;
};

/**
 * Изменить значение активной коллекции
 *
 * @param {$$CollectionType} val - новая коллекция
 * @return {!Collection}
 */
Collection.prototype.newCollection = function (val) {
  return this._new("collection", val);
};

/**
 * Изменить значение активного фильтра
 *
 * @param {!$$CollectionFilter} val - новый фильтр
 * @return {!Collection}
 */
Collection.prototype.newFilter = function (val) {
  return this._new("filter", val);
};

/**
 * Изменить значение активного контекста
 *
 * @param {$$CollectionLink} val - новый контекст
 * @return {!Collection}
 */
Collection.prototype.newContext = function (val) {
  return this._new("context", val);
};

/**
 * Изменить значение активной переменной
 *
 * @param {?} val - новая переменная
 * @return {!Collection}
 */
Collection.prototype.newVar = function (val) {
  return this._new("var", val);
};

/**
 * Изменить значение активного пространства имён
 *
 * @param {string} val - новое пространство имён
 * @return {!Collection}
 */
Collection.prototype.newNamespace = function (val) {
  return this._new("namespace", val);
};
/**
 * Обновить заданный активный кластерный параметр
 *
 * @private
 * @param {string} clusterName - название кластерного параметра
 *     (например: 'collection', 'parser', 'filter', и т.д.)
 *
 * @param {?} newVal - новое значение
 * @return {!Collection}
 */
Collection.prototype._update = function (clusterName, newVal) {
  var activeId = this._active(clusterName);
  this.__active[clusterName] = this._modVal(newVal, clusterName);

  if (activeId) {
    this.__sys["tmp" + toUpperCase(clusterName, 1)][activeId] = this.__active[clusterName];
  }

  return this;
};

/**
 * Обновить активную коллекцию
 *
 * @param {$$CollectionType} val - новая коллекция
 * @return {!Collection}
 */
Collection.prototype.updateCollection = function (val) {
  return this._update("collection", val);
};

/**
 * Обновить активный фильтр
 *
 * @param {!$$CollectionFilter} val - новый фильтр
 * @return {!Collection}
 */
Collection.prototype.updateFilter = function (val) {
  return this._update("filter", val);
};

/**
 * Обновить активный контекст
 *
 * @param {$$CollectionLink} val - новый контекст
 * @return {!Collection}
 */
Collection.prototype.updateContext = function (val) {
  return this._update("context", val);
};

/**
 * Обновить активную переменную
 *
 * @param {?} val - новая переменная
 * @return {!Collection}
 */
Collection.prototype.updateVar = function (val) {
  return this._update("var", val);
};

/**
 * Обновить активное пространство имён
 *
 * @param {string} val - новое пространство имён
 * @return {!Collection}
 */
Collection.prototype.updateNamespace = function (val) {
  return this._update("namespace", val);
};

/**
 * Добавить один или несколько параметров в кластер
 *
 * @private
 * @param {string} clusterName - название кластерного параметра
 *     (например: 'collection', 'parser', 'filter', и т.д.)
 *
 * @param {(string|!Object)} objId - ИД параметра в кластере или объект (ИД: значение)
 * @param {?=} [opt_newVal] - новое значение (перегрузка)
 *
 * @return {!Collection}
 */
Collection.prototype._add = function (clusterName, objId, opt_newVal) {
  var _this3 = this;
  var cluster = this.__sys["tmp" + toUpperCase(clusterName, 1)],
      activeId = this._active(clusterName);

  if (isString(objId)) {
    objId = String(objId);
    opt_newVal = this._modVal(opt_newVal, clusterName, objId);

    if (objId === "active") {
      this._update(clusterName, opt_newVal);
    } else {
      if (cluster[objId] && activeId && activeId === objId) {
        this._update(clusterName, opt_newVal);
      } else {
        cluster[objId] = opt_newVal;
      }
    }
  } else {
    $C(objId).forEach(function (el, key) {
      el = _this3._modVal(el, clusterName, key);

      if (key === "active") {
        _this3._update(clusterName, el);
      } else {
        if (cluster[key] && activeId && activeId === key) {
          _this3._update(clusterName, el);
        } else {
          cluster[key] = el;
        }
      }
    });
  }

  return this;
};

/**
 * Добавить одну или несколько коллекций в кластер
 * (можно использовать константу 'active',
 *     если коллекция с таким ИД уже существует, то она будет обновлёна)
 *
 * @param {(string|!Object.<$$CollectionType>)} objId - ИД коллекции или объект (ИД: значение)
 * @param {$$CollectionType=} [opt_val] - новая коллекция (перегрузка)
 * @return {!Collection}
 */
Collection.prototype.addCollection = function (objId, opt_val) {
  return this._add("collection", objId, opt_val);
};

/**
 * Добавить один или несколько фильтров в кластер
 * (можно использовать константу 'active',
 *     если фильтр с таким ИД уже существует, то он будет обновлён)
 *
 * @param {(string|!Object.<$$CollectionFilter>)} objId - ИД фильтра или объект (ИД: значение)
 * @param {$$CollectionFilter=} [opt_val] - новый фильтр (перегрузка)
 * @return {!Collection}
 */
Collection.prototype.addFilter = function (objId, opt_val) {
  return this._add("filter", objId, opt_val);
};

/**
 * Добавить один или несколько контекстов в кластер
 * (можно использовать константу 'active',
 *     если контекст с таким ИД уже существует, то он будет обновлён)
 *
 * @param {(string|!Object.<$$CollectionLink>)} objId - ИД контекста или объект (ИД: значение)
 * @param {$$CollectionLink=} [opt_val] - новый контекст (перегрузка)
 * @return {!Collection}
 */
Collection.prototype.addContext = function (objId, opt_val) {
  return this._add("context", objId, opt_val);
};

/**
 * Добавить одну или несколько переменных в кластер
 * (можно использовать константу 'active',
 *     если переменная с таким ИД уже существует, то она будет обновлёна)
 *
 * @param {(string|!Object.<?>)} objId - ИД переменной или объект (ИД: значение)
 * @param {?=} [opt_val] - значение новой переменной (перегрузка)
 * @return {!Collection}
 */
Collection.prototype.addVar = function (objId, opt_val) {
  return this._add("var", objId, opt_val);
};

/**
 * Добавить одно или несколько пространств имён в кластер
 * (можно использовать константу 'active',
 *     если пространство имён с таким ИД уже существует, то оно будет обновлёно)
 *
 * @param {(string|!Object.<string>)} objId - ИД пространства имён или объект (ИД: значение)
 * @param {?string=} [opt_val] - новое пространство имён (перегрузка)
 * @return {!Collection}
 */
Collection.prototype.addNamespace = function (objId, opt_val) {
  return this._add("namespace", objId, opt_val);
};

/**
 * Установить новый активный кластерный параметр
 *
 * @private
 * @param {string} clusterName - название кластерного параметра
 *     (например: 'collection', 'parser', 'filter', и т.д.)
 *
 * @param {?string=} [opt_id] - ИД параметра в кластере
 * @return {!Collection}
 */
Collection.prototype._set = function (clusterName, opt_id) {
  if (opt_id == null || opt_id === "active") {
    return this;
  }

  var key = toUpperCase(clusterName, 1);

  if (!this._isExistsInCluster(clusterName, opt_id)) {
    throw new ReferenceError("The object \"" + opt_id + "\" (" + clusterName + ") doesn't exist in the cluster!");
  }

  this.__sys["active" + key + "Id"] = opt_id;
  this.__active[clusterName] = this.__sys["tmp" + key][opt_id];

  return this;
};

/**
 * Установить новую активную коллекцию
 *
 * @param {string} id - ИД коллекции
 * @return {!Collection}
 */
Collection.prototype.setCollection = function (id) {
  return this._set("collection", id);
};

/**
 * Добавить новую коллекцию в кластер и установить её активной
 *
 * @param {string} id - ИД коллекции
 * @param {$$CollectionType} val - значение
 * @return {!Collection}
 */
Collection.prototype.addAndSetCollection = function (id, val) {
  return this._add("collection", id, val)._set("collection", id);
};

/**
 * Установить новый активный фильтр
 *
 * @param {string} id - ИД фильтра
 * @return {!Collection}
 */
Collection.prototype.setFilter = function (id) {
  return this._set("filter", id);
};

/**
 * Добавить новый фильтр в кластер и установить его активным
 *
 * @param {string} id - ИД фильтра
 * @param {!$$CollectionFilter} val - значение
 * @return {!Collection}
 */
Collection.prototype.addAndSetFilter = function (id, val) {
  return this._add("filter", id, val)._set("filter", id);
};

/**
 * Установить новый активный контекст
 *
 * @param {string} id - ИД контекста
 * @return {!Collection}
 */
Collection.prototype.setContext = function (id) {
  return this._set("context", id);
};

/**
 * Добавить новый контекст в кластер и установить его активным
 *
 * @param {string} id - ИД контекста
 * @param {$$CollectionLink} val - значение
 * @return {!Collection}
 */
Collection.prototype.addAndSetContext = function (id, val) {
  return this._add("context", id, val)._set("context", id);
};

/**
 * Установить новую активную переменную
 *
 * @param {string} id - ИД переменной
 * @return {!Collection}
 */
Collection.prototype.setVar = function (id) {
  return this._set("var", id);
};

/**
 * Добавить новую переменную в кластер и установить её активной
 *
 * @param {string} id - ИД переменной
 * @param {?} val - значение
 * @return {!Collection}
 */
Collection.prototype.addAndSetVar = function (id, val) {
  return this._add("var", id, val)._set("var", id);
};

/**
 * Установить новое активное пространство имён
 *
 * @param {string} id - ИД пространства имён
 * @return {!Collection}
 */
Collection.prototype.setNamespace = function (id) {
  return this._set("namespace", id);
};

/**
 * Добавить новое пространство имён в кластер и установить его активным
 *
 * @param {string} id - ИД пространства имён
 * @param {string} val - значение
 * @return {!Collection}
 */
Collection.prototype.addAndSetNamespace = function (id, val) {
  return this._add("namespace", id, val)._set("namespace", id);
};

var dateCache = {};

/**
 * Сохранить указанную коллекцию в хранилище
 *
 * @param {(string|?$$Collection_save)=} opt_idOrParams - ИД коллекции
 *     ИЛИ объект, свойствами которого указаны параметры метода (приставки opt_ отбрасываются)
 *
 * @param {?function(this:Collection, ?)=} [opt_onSuccess] - функция обратного вызова на успешную операцию
 * @param {?function(this:Collection, !Error)=} [opt_onError] - функция обратного вызова на случай ошибки
 *
 * @param {?string=} [opt_namespace] - название используемого пространства имён
 * @param {?=} [opt_params] - дополнительные параметры для драйвера
 *
 * @param {?string=} [opt_lib] - название используемого модуля для работы с хранилищем
 * @param {?string=} [opt_convertor] - название используемого модуля для конвертации данных
 *
 * @param {Array=} [opt_stack] - стек данных для сохранения
 * @param {?boolean=} [opt_apply] - если true и указан стек, то он сохраняется в хранилище
 *
 * @return {!Collection}
 */
Collection.prototype.save = function (opt_idOrParams, opt_onSuccess, opt_onError, opt_namespace, opt_params, opt_lib, opt_convertor, opt_stack, opt_apply) {
  var _this4 = this;
  if (opt_stack && opt_apply) {
    storage.set(opt_stack, opt_onSuccess, opt_onError);
    return this;
  }

  if (isObject(opt_idOrParams)) {
    /** @type {$$Collection_save} */
    var p = _.any(opt_idOrParams || {});
    opt_onSuccess = _(opt_onSuccess, p.onSuccess);
    opt_onError = _(opt_onError, p.onError);
    opt_namespace = _(opt_namespace, p.namespace);
    opt_params = _(opt_params, p.params);
    opt_lib = _(opt_lib, p.lib);
    opt_convertor = _(opt_convertor, p.convertor);
    opt_idOrParams = _.any(p.id);
  }

  var id = opt_idOrParams || "active";

  var nm = opt_namespace || this._get("namespace");

  var activeId = String(opt_idOrParams ? this._active("collection", opt_idOrParams) ? "active" : "" : this._active("collection") || "");

  var data = {
    id: id,
    activeId: activeId,

    lib: opt_lib,
    params: opt_params,
    namespace: nm,

    data: convertor.exportData({
      lib: opt_convertor,
      data: this._get("collection", id)
    }),

    date: new Date().toString()
  };

  dateCache["" + nm + "_" + id] = data.date;

  if (opt_stack) {
    opt_stack.push(data);
  } else {
    storage.set(data, function () {
      for (var _len = arguments.length,
          args = Array(_len),
          _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      if (opt_onSuccess) {
        opt_onSuccess.apply(_this4, args);
      }
    }, function () {
      for (var _len2 = arguments.length,
          args = Array(_len2),
          _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      if (opt_onError) {
        opt_onError.apply(_this4, args);
      }
    });
  }

  return this;
};

/**
 * Сохранить все коллекции в хранилище
 *
 * @param {(function(this:Collection, ?)|?$$Collection_saveAll)=} [opt_onSuccessOrParams] - функция обратного вызова
 *     на успешную операцию ИЛИ объект, свойствами которого указаны параметры метода (приставки opt_ отбрасываются)
 *
 * @param {?function(this:Collection, !Error)=} [opt_onError] - функция обратного вызова на случай ошибки
 *
 * @param {?string=} [opt_namespace] - название используемого пространства имён
 * @param {?=} [opt_params] - дополнительные параметры для драйвера
 *
 * @param {?string=} [opt_lib] - название используемого модуля для работы с хранилищем
 * @param {?string=} [opt_convertor] - название используемого модуля для конвертации данных
 *
 * @return {!Collection}
 */
Collection.prototype.saveAll = function (opt_onSuccessOrParams, opt_onError, opt_namespace, opt_params, opt_lib, opt_convertor) {
  var _this5 = this;
  if (isObject(opt_onSuccessOrParams)) {
    /** @type {$$Collection_saveAll} */
    var p = _.any(opt_onSuccessOrParams || {});
    opt_onError = _(opt_onError, p.onError);
    opt_namespace = _(opt_namespace, p.namespace);
    opt_params = _(opt_params, p.params);
    opt_lib = _(opt_lib, p.lib);
    opt_convertor = _(opt_convertor, p.convertor);
    opt_onSuccessOrParams = _.any(p.onSuccess);
  }

  var active = false,
      stack = [];

  $C(this.__sys["tmpCollection"]).forEach(function (el, key) {
    if (_this5._active("collection", key)) {
      active = true;
    }

    _this5.save(key, null, null, opt_namespace, opt_params, opt_lib, opt_convertor, stack);
  });

  if (!active) {
    this.save(null, null, null, opt_namespace, opt_params, opt_lib, opt_convertor, stack);
  }

  return this.save(null, function () {
    for (var _len3 = arguments.length,
        args = Array(_len3),
        _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    if (opt_onSuccessOrParams) {
      opt_onSuccessOrParams.apply(_this5, args);
    }
  }, function () {
    for (var _len4 = arguments.length,
        args = Array(_len4),
        _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }

    if (opt_onError) {
      opt_onError.apply(_this5, args);
    }
  }, null, null, null, null, stack, true);
};

/**
 * Загрузить указанную коллекцию из хранилища
 *
 * @param {(string|?$$Collection_load)=} opt_idOrParams - ИД коллекции
 *     ИЛИ объект, свойствами которого указаны параметры метода (приставки opt_ отбрасываются)
 *
 * @param {?function(this:Collection, $$Collection_storageGetOutput)=} [opt_onSuccess] - функция обратного вызова на
 *     успешную операцию
 *
 * @param {?function(this:Collection, !Error)=} [opt_onError] - функция обратного вызова на случай ошибки
 *
 * @param {?string=} [opt_namespace] - название используемого пространства имён
 * @param {?=} [opt_params] - дополнительные параметры для драйвера
 *
 * @param {?string=} [opt_lib] - название используемого модуля для работы с хранилищем
 * @param {?string=} [opt_convertor] - название используемого модуля для конвертации данных
 *
 * @return {!Collection}
 */
Collection.prototype.load = function (opt_idOrParams, opt_onSuccess, opt_onError, opt_namespace, opt_params, opt_lib, opt_convertor) {
  var _this6 = this;
  if (isObject(opt_idOrParams)) {
    /** @type {$$Collection_load} */
    var p = _.any(opt_idOrParams || {});
    opt_onSuccess = _(opt_onSuccess, p.onSuccess);
    opt_onError = _(opt_onError, p.onError);
    opt_namespace = _(opt_namespace, p.namespace);
    opt_params = _(opt_params, p.params);
    opt_lib = _(opt_lib, p.lib);
    opt_convertor = _(opt_convertor, p.convertor);
    opt_idOrParams = _.any(p.id);
  }

  var id = opt_idOrParams || "active";

  var nm = opt_namespace || this._get("namespace");

  var request = {
    id: id,
    namespace: nm,
    lib: opt_lib,
    params: opt_params
  };

  storage.get(request, function (data) {
    var params = {
      lib: opt_convertor,
      data: data.data
    };

    if (id === "active") {
      _this6._new("collection", convertor.importData(params));
    } else {
      _this6._add("collection", id, convertor.importData(params));
    }

    if (data.activeId === "active") {
      _this6._set("collection", id);
    } else if (data.activeId) {
      _this6._add("collection", data.activeId, _this6._get("collection"))._set("collection", data.activeId);
    }

    dateCache["" + nm + "_" + id] = data.date;

    if (opt_onSuccess) {
      opt_onSuccess.call(_this6, data);
    }
  }, function () {
    for (var _len5 = arguments.length,
        args = Array(_len5),
        _key5 = 0; _key5 < _len5; _key5++) {
      args[_key5] = arguments[_key5];
    }

    if (opt_onError) {
      opt_onError.apply(_this6, args);
    }
  });

  return this;
};

/**
 * Загрузить все коллекции из хранилища
 *
 * @param {(function(this:Collection, $$Collection_storageGetAllOutput)|?$$Collection_loadAll)=} [opt_onSuccessOrParams] -
 *     функция обратного вызова на успешную операцию ИЛИ объект,
 *     свойствами которого указаны параметры метода (приставки opt_ отбрасываются)
 *
 * @param {?function(this:Collection, !Error)=} [opt_onError] - функция обратного вызова на случай ошибки
 *
 * @param {?string=} [opt_namespace] - название используемого пространства имён
 * @param {?=} [opt_params] - дополнительные параметры для драйвера
 *
 * @param {?string=} [opt_lib] - название используемого модуля для работы с хранилищем
 * @param {?string=} [opt_convertor] - название используемого модуля для конвертации данных
 *
 * @return {!Collection}
 */
Collection.prototype.loadAll = function (opt_onSuccessOrParams, opt_onError, opt_namespace, opt_params, opt_lib, opt_convertor) {
  var _this7 = this;
  if (isObject(opt_onSuccessOrParams)) {
    /** @type {$$Collection_loadAll} */
    var p = _.any(opt_onSuccessOrParams || {});
    opt_onError = _(opt_onError, p.onError);
    opt_namespace = _(opt_namespace, p.namespace);
    opt_params = _(opt_params, p.params);
    opt_lib = _(opt_lib, p.lib);
    opt_convertor = _(opt_convertor, p.convertor);
    opt_onSuccessOrParams = _.any(p.onSuccess);
  }

  var nm = opt_namespace || this._get("namespace");

  var request = {
    namespace: nm,
    lib: opt_lib,
    params: opt_params
  };

  storage.getAll(request, function (data) {
    $C(data).forEach(function (el) {
      var params = {
        lib: opt_convertor,
        data: el.data
      };

      if (el.id === "active") {
        _this7._new("collection", convertor.importData(params));
      } else {
        _this7._add("collection", el.id, convertor.importData(params));
      }

      if (el.activeId === "active") {
        _this7._set("collection", el.id);
      } else if (el.activeId) {
        _this7._add("collection", el.activeId, _this7._get("collection"))._set("collection", el.activeId);
      }

      dateCache["" + nm + "_" + el.id] = el.date;
    });

    if (opt_onSuccessOrParams) {
      opt_onSuccessOrParams.call(_this7, data);
    }
  }, function () {
    for (var _len6 = arguments.length,
        args = Array(_len6),
        _key6 = 0; _key6 < _len6; _key6++) {
      args[_key6] = arguments[_key6];
    }

    if (opt_onError) {
      opt_onError.apply(_this7, args);
    }
  });

  return this;
};

/**
 * Вернуть время сохранения указанной коллекции
 *
 * @param {(string|?$$Collection_loadDate)} idOrParams - ИД коллекции
 *     ИЛИ объект, свойствами которого указаны параметры метода (приставки opt_ отбрасываются)
 *
 * @param {function(this:Collection, Date)} onSuccess - функция обратного вызова на успешную операцию
 * @param {?function(this:Collection, !Error)=} [opt_onError] - функция обратного вызова на случай ошибки
 *
 * @param {?string=} [opt_namespace] - название используемого пространства имён
 * @param {?=} [opt_params] - дополнительные параметры для драйвера
 *
 * @param {?string=} [opt_lib] - название используемого модуля для работы с хранилищем
 * @return {!Collection}
 */
Collection.prototype.loadDate = function (idOrParams, onSuccess, opt_onError, opt_namespace, opt_params, opt_lib) {
  var _this8 = this;
  if (isObject(idOrParams)) {
    /** @type {$$Collection_loadDate} */
    var p = _.any(idOrParams || {});
    opt_onError = _(opt_onError, p.onError);
    opt_namespace = _(opt_namespace, p.namespace);
    opt_params = _(opt_params, p.params);
    opt_lib = _(opt_lib, p.lib);
    idOrParams = _.any(p.id);
  }

  storage.getDate({
    id: idOrParams || "active",
    namespace: opt_namespace || this._get("namespace"),
    lib: opt_lib,
    params: opt_params

  }, function () {
    for (var _len7 = arguments.length,
        args = Array(_len7),
        _key7 = 0; _key7 < _len7; _key7++) {
      args[_key7] = arguments[_key7];
    }

    onSuccess.apply(_this8, args);
  }, function () {
    for (var _len8 = arguments.length,
        args = Array(_len8),
        _key8 = 0; _key8 < _len8; _key8++) {
      args[_key8] = arguments[_key8];
    }

    if (opt_onError) {
      opt_onError.apply(_this8, args);
    }
  });

  return this;
};

/**
 * Проверить срок годности хранилища
 *
 * @param {number} time - время в миллисекундах
 * @param {(string|?$$Collection_isExpired)} idOrParams - ИД коллекции
 *     ИЛИ объект, свойствами которого указаны параметры метода (приставки opt_ отбрасываются)
 *
 * @param {function(this:Collection, boolean)} onSuccess - функция обратного вызова на успешную операцию
 * @param {?function(this:Collection, !Error)=} [opt_onError] - функция обратного вызова на случай ошибки
 *
 * @param {?string=} [opt_namespace] - название используемого пространства имён
 * @param {?=} [opt_params] - дополнительные параметры для драйвера
 *
 * @param {?string=} [opt_lib] - название используемого модуля для работы с хранилищем
 * @return {!Collection}
 */
Collection.prototype.isExpired = function (time, idOrParams, onSuccess, opt_onError, opt_namespace, opt_params, opt_lib) {
  var _this9 = this;
  if (isObject(idOrParams)) {
    /** @type {$$Collection_isExpired} */
    var p = _.any(idOrParams || {});
    opt_onError = _(opt_onError, p.onError);
    opt_namespace = _(opt_namespace, p.namespace);
    opt_params = _(opt_params, p.params);
    opt_lib = _(opt_lib, p.lib);
    idOrParams = _.any(p.id);
  }

  var id = idOrParams || "active";

  var nm = opt_namespace || this._get("namespace");

  var key = "" + id + "_" + nm;

  if (dateCache[key] !== void 0) {
    onSuccess.call(this, dateCache[key] ? new Date(new Date() - dateCache[key]) > time : true);
    return this;
  }

  storage.getDate({
    id: id,
    namespace: nm,
    lib: opt_lib,
    params: opt_params

  }, function (date) {
    dateCache[key] = date;
    onSuccess.call(_this9, date ? new Date(new Date() - date) > time : true);
  }, function () {
    for (var _len9 = arguments.length,
        args = Array(_len9),
        _key9 = 0; _key9 < _len9; _key9++) {
      args[_key9] = arguments[_key9];
    }

    if (opt_onError) {
      opt_onError.apply(_this9, args);
    }
  });

  return this;
};

/**
 * Удалить указанную коллекцию из хранилища
 *
 * @param {(string|?$$Collection_drop)=} opt_idOrParams - ИД коллекции
 *     ИЛИ объект, свойствами которого указаны параметры метода (приставки opt_ отбрасываются)
 *
 * @param {?function(this:Collection, ?)=} [opt_onSuccess] - функция обратного вызова на успешную операцию
 * @param {?function(this:Collection, !Error)=} [opt_onError] - функция обратного вызова на случай ошибки
 *
 * @param {?string=} [opt_namespace] - название используемого пространства имён
 * @param {?=} [opt_params] - дополнительные параметры для драйвера
 * @param {?string=} [opt_lib] - название используемого модуля для работы с хранилищем
 *
 * @param {Array=} [opt_stack] - стек данных для удаления
 * @param {?boolean=} [opt_apply] - если true и указан стек, то он удаляется из хранилища
 *
 * @return {!Collection}
 */
Collection.prototype.drop = function (opt_idOrParams, opt_onSuccess, opt_onError, opt_namespace, opt_params, opt_lib, opt_stack, opt_apply) {
  var _this10 = this;
  if (opt_stack && opt_apply) {
    storage.remove(opt_stack, opt_onSuccess, opt_onError);
    return this;
  }

  if (isObject(opt_idOrParams)) {
    /** @type {$$Collection_drop} */
    var p = _.any(opt_idOrParams || {});
    opt_onSuccess = _(opt_onSuccess, p.onSuccess);
    opt_onError = _(opt_onError, p.onError);
    opt_namespace = _(opt_namespace, p.namespace);
    opt_params = _(opt_params, p.params);
    opt_lib = _(opt_lib, p.lib);
    opt_idOrParams = _.any(p.id);
  }

  var request = {
    id: opt_idOrParams || "active",
    namespace: opt_namespace || this._get("namespace"),
    lib: opt_lib,
    params: opt_params
  };

  if (opt_stack) {
    opt_stack.push(request);
  } else {
    storage.remove(request, function () {
      for (var _len10 = arguments.length,
          args = Array(_len10),
          _key10 = 0; _key10 < _len10; _key10++) {
        args[_key10] = arguments[_key10];
      }

      if (opt_onSuccess) {
        opt_onSuccess.apply(_this10, args);
      }
    }, function () {
      for (var _len11 = arguments.length,
          args = Array(_len11),
          _key11 = 0; _key11 < _len11; _key11++) {
        args[_key11] = arguments[_key11];
      }

      if (opt_onError) {
        opt_onError.apply(_this10, args);
      }
    });
  }

  return this;
};

/**
 * Удалить все коллекции из хранилища
 *
 * @param {(function(this:Collection, ?)|?$$Collection_dropAll)=} [opt_onSuccessOrParams] - функция обратного вызова на
 *     успешную операцию ИЛИ объект, свойствами которого указаны параметры метода (приставки opt_ отбрасываются)
 *
 * @param {?function(this:Collection, !Error)=} [opt_onError] - функция обратного вызова на случай ошибки
 *
 * @param {?string=} [opt_namespace] - название используемого пространства имён
 * @param {?=} [opt_params] - дополнительные параметры для драйвер
 *
 * @param {?string=} [opt_lib] - название используемого модуля для работы с хранилищем
 * @return {!Collection}
 */
Collection.prototype.dropAll = function (opt_onSuccessOrParams, opt_onError, opt_namespace, opt_params, opt_lib) {
  var _this11 = this;
  if (isObject(opt_onSuccessOrParams)) {
    /** @type {$$Collection_dropAll} */
    var p = _.any(opt_onSuccessOrParams || {});
    opt_onError = _(opt_onError, p.onError);
    opt_namespace = _(opt_namespace, p.namespace);
    opt_params = _(opt_params, p.params);
    opt_lib = _(opt_lib, p.lib);
    opt_onSuccessOrParams = _.any(p.onSuccess);
  }

  var active = false,
      stack = [];

  $C(this.__sys["tmpCollection"]).forEach(function (el, key) {
    if (_this11._active("collection", key)) {
      active = true;
    }

    _this11.drop(key, null, null, opt_namespace, opt_params, opt_lib, stack);
  });

  if (!active) {
    this.drop(null, null, null, opt_namespace, opt_params, opt_lib, stack);
  }

  this.drop(null, function () {
    for (var _len12 = arguments.length,
        args = Array(_len12),
        _key12 = 0; _key12 < _len12; _key12++) {
      args[_key12] = arguments[_key12];
    }

    if (opt_onSuccessOrParams) {
      opt_onSuccessOrParams.apply(_this11, args);
    }
  }, function () {
    for (var _len13 = arguments.length,
        args = Array(_len13),
        _key13 = 0; _key13 < _len13; _key13++) {
      args[_key13] = arguments[_key13];
    }

    if (opt_onError) {
      opt_onError.apply(_this11, args);
    }
  }, null, null, null, stack, true);

  return this;
};

var storage = Collection.Drivers.Storage = {

  /**
   * Название используемого модуля для работы с хранилищем
   * @type {string}
   */
  lib: "localStorage",

  /**
   * Вернуть данные из хранилища по указанному запросу
   *
   * @param {$$Collection_storageGet} request - объект запроса
   * @param {function($$Collection_storageGetOutput)} onSuccess - функция обратного вызова на успешную операцию
   * @param {?function(!Error)=} [opt_onError] - функция обратного вызова на случай ошибки
   */
  get: function get(request, onSuccess, opt_onError) {
    this.Engines[request.lib || this.lib].get(request, onSuccess, opt_onError);
  },

  /**
   * Вернуть все данные из хранилища
   *
   * @param {$$Collection_storageGetAll} request - объект запроса
   * @param {function($$Collection_storageGetAllOutput)} onSuccess - функция обратного вызова на успешную операцию
   * @param {?function(!Error)=} [opt_onError] - функция обратного вызова на случай ошибки
   */
  getAll: function getAll(request, onSuccess, opt_onError) {
    this.Engines[request.lib || this.lib].getAll(request, onSuccess, opt_onError);
  },

  /**
   * Вернуть дату сохранения коллекции из хранилища
   * по указанному запросу
   *
   * @param {$$Collection_storageGet} request - объект запроса
   * @param {function(Date)} onSuccess - функция обратного вызова на успешную операцию
   * @param {?function(!Error)=} [opt_onError] - функция обратного вызова на случай ошибки
   */
  getDate: function getDate(request, onSuccess, opt_onError) {
    this.Engines[request.lib || this.lib].getDate(request, onSuccess, opt_onError);
  },

  /**
   * Сохранить указанные данные в хранилище
   *
   * @param {($$Collection_storageSet|!Array.<$$Collection_storageSet>)} data - объект данных:
   *     {
   *         id: ИД коллекции,
   *         activeId: ИД коллекции, если в id указана активная коллекция,
   *             которая есть в кластере, иначе пустая строка,
   *
   *         namespace: пространство имён,
   *         lib: название используемого модуля для работы с хранилищем,
   *         params: дополнительные параметры для драйвера,
   *
   *         data: данные,
   *         date: дата сохранения
   *     }
   *
   *     ИЛИ массив таких объектов
   *
   * @param {?function(?)=} [opt_onSuccess] - функция обратного вызова на успешную операцию
   * @param {?function(!Error)=} [opt_onError] - функция обратного вызова на случай ошибки
   */
  set: function set(data, opt_onSuccess, opt_onError) {
    data = isArray(data) ? data : [data];
    this.Engines[data[0].lib || this.lib].set(data, opt_onSuccess, opt_onError);
  },

  /**
   * Удалить данные из хранилища по указанному запросу
   *
   * @param {($$Collection_storageRemove|!Array.<$$Collection_storageRemove>)} request - объект запроса
   *     или массив таких объектов
   *
   * @param {?function(?)=} [opt_onSuccess] - функция обратного вызова на успешную операцию
   * @param {?function(!Error)=} [opt_onError] - функция обратного вызова на случай ошибки
   */
  remove: function remove(request, opt_onSuccess, opt_onError) {
    request = isArray(request) ? request : [request];
    this.Engines[request[0].lib || this.lib].remove(request, opt_onSuccess, opt_onError);
  },

  Engines: {
    indexedDB: {
      _init: function Init(opt_onError) {
        var idb = indexedDB.open("__COLLECTION_STORE__", 2);

        idb.onupgradeneeded = function () {
          var collections = this.result.createObjectStore("collections", { keyPath: "name" });

          collections.createIndex("id", "id", { unique: false });
          collections.createIndex("activeId", "activeId", { unique: false });

          collections.createIndex("namespace", "namespace", { unique: false });
          collections.createIndex("date", "date", { unique: false });
          collections.createIndex("data", "data", { unique: false });
        };

        idb.onerror = opt_onError;
        return idb;
      },

      get: function get(request, onSuccess, opt_onError) {
        var idb = this._init(opt_onError);

        idb.onsuccess = function (e) {
          var tr = e.target.result.transaction(["collections"]);

          tr.onerror = opt_onError;
          var collections = tr.objectStore("collections");

          collections.get("" + request.namespace + ":" + request.id).onsuccess = function (e) {
            var val = e.target.result || {};

            onSuccess({
              activeId: val["activeId"],
              data: val["data"],
              date: val["date"]
            });
          };
        };
      },

      getAll: function getAll(request, onSuccess, opt_onError) {
        var idb = this._init(opt_onError),
            data = [];

        idb.onsuccess = function (e) {
          var tr = e.target.result.transaction(["collections"]);

          tr.onerror = opt_onError;
          var collections = tr.objectStore("collections");

          collections.index("namespace").openCursor(IDBKeyRange.only(request.namespace)).onsuccess = function (e) {
            var cursor = e.target.result,
                val = cursor && cursor.value;

            if (cursor) {
              data.push({
                id: val["id"],
                activeId: val["activeId"],
                data: val["data"],
                date: val["date"]
              });

              cursor.continue();
            } else {
              onSuccess(data);
            }
          };
        };
      },

      getDate: function getDate(request, onSuccess, opt_onError) {
        this.get(request, function (data) {
          if (onSuccess) {
            onSuccess(data && data.date ? new Date(data.date) : null);
          }
        }, opt_onError);
      },

      set: function set(data, opt_onSuccess, opt_onError) {
        var idb = this._init(opt_onError);

        idb.onsuccess = function (e) {
          var tr = e.target.result.transaction(["collections"], "readwrite");

          tr.onerror = opt_onError;
          tr.oncomplete = opt_onSuccess;

          var collections = tr.objectStore("collections");
          $C(data).forEach(function (el) {
            collections.put({
              "name": "" + el.namespace + ":" + el.id,
              "id": el.id,
              "namespace": el.namespace,
              "date": el.date,
              "activeId": el.activeId,
              "data": el.data
            });
          });
        };
      },

      remove: function remove(request, opt_onSuccess, opt_onError) {
        var idb = this._init(opt_onError);

        idb.onsuccess = function (e) {
          var tr = e.target.result.transaction(["collections"], "readwrite");

          tr.onerror = opt_onError;
          tr.oncomplete = opt_onSuccess;

          var collections = tr.objectStore("collections");

          $C(request).forEach(function (el) {
            collections.delete("" + el.namespace + ":" + el.id);
          });
        };
      }
    },


    localStorage: {
      get: function get(request, onSuccess, opt_onError) {
        var lsStorage = global[request.lib || storage.lib];

        var nm = "__COLLECTION__" + request.namespace,
            data = {};

        try {
          data.activeId = lsStorage.getItem("" + nm + "__ACTIVE_ID:" + request.id);

          data.date = lsStorage.getItem("" + nm + "__DATE:" + request.id);

          data.data = lsStorage.getItem("" + nm + ":" + request.id);

          onSuccess(data);
        } catch (err) {
          if (opt_onError) {
            opt_onError(err);
          }
        }
      },

      getAll: function getAll(request, onSuccess, opt_onError) {
        var lsStorage = global[request.lib || storage.lib];

        var nm = "__COLLECTION__" + request.namespace,
            data = [];

        try {
          // Фикс перебора localStorage для старых браузеров
          try {
            for (var key in lsStorage) {
              if (!lsStorage.hasOwnProperty(key)) {
                continue;
              }

              var id = key.split(":");
              if (id[0] === nm) {
                data.push({
                  id: id[1],
                  activeId: lsStorage.getItem("" + nm + "__ACTIVE_ID:" + id[1]),

                  data: lsStorage.getItem("" + nm + ":" + id[1]),

                  date: lsStorage.getItem("" + nm + "__DATE:" + id[1])
                });
              }
            }
          } catch (ignore) {
            var i = lsStorage.length;
            while (i--) {
              var id = lsStorage[i].split(":");
              if (id[0] === nm) {
                data.push({
                  id: id[1],
                  activeId: lsStorage.getItem("" + nm + "__ACTIVE_ID:" + id[1]),

                  data: lsStorage.getItem("" + nm + ":" + id[1]),

                  date: lsStorage.getItem("" + nm + "__DATE:" + id[1])
                });
              }
            }
          }

          onSuccess(data);
        } catch (err) {
          if (opt_onError) {
            opt_onError(err);
          }
        }
      },

      getDate: function getDate(request, onSuccess, opt_onError) {
        var lsStorage = global[request.lib || storage.lib];

        try {
          if (onSuccess) {
            var date = lsStorage.getItem("__COLLECTION__" + request.namespace + "__DATE:" + request.id);

            onSuccess(date ? new Date(date) : null);
          }
        } catch (err) {
          if (opt_onError) {
            opt_onError(err);
          }
        }
      },

      set: function set(data, opt_onSuccess, opt_onError) {
        var lsStorage = global[data[0] && data[0].lib ? data[0].lib : storage.lib];

        try {
          $C(data).forEach(function (el) {
            var nm = "__COLLECTION__" + el.namespace;

            lsStorage.setItem("" + nm + ":" + el.id, el.data);
            lsStorage.setItem("" + nm + "__DATE:" + el.id, el.date);
            lsStorage.setItem("" + nm + "__ACTIVE_ID:" + el.id, el.activeId);
          });

          if (opt_onSuccess) {
            opt_onSuccess(data);
          }
        } catch (err) {
          if (opt_onError) {
            opt_onError(err);
          }
        }
      },

      remove: function remove(request, opt_onSuccess, opt_onError) {
        var lsStorage = global[request[0] && request[0].lib ? request[0].lib : storage.lib];

        try {
          $C(request).forEach(function (el) {
            var nm = "__COLLECTION__" + el.namespace;

            lsStorage.removeItem("" + nm + ":" + el.id);
            lsStorage.removeItem("" + nm + "__DATE:" + el.id);
            lsStorage.removeItem("" + nm + "__ACTIVE_ID:" + el.id);
          });

          if (opt_onSuccess) {
            opt_onSuccess(request);
          }
        } catch (err) {
          if (opt_onError) {
            opt_onError(err);
          }
        }
      }
    }

  }
};

storage.Engines.sessionStorage = storage.Engines.localStorage;


/**
 * Вернуть строковое представление коллекции
 *
 * @param {(string|?$$Collection_toString)=} opt_idOrParams - ИД коллекции
 *     ИЛИ объект, свойствами которого указаны параметры метода (приставки opt_ отбрасываются)
 *
 * @param {$$CollectionLink=} [opt_context] - дополнительный контекст
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_native_JSON#The_replacer_parameter
 * @param {(function(?, ?): ?|Array)=} [opt_replacer]
 * @param {(string|number|null)=} [opt_space]
 *
 * @param {?string=} [opt_lib] - название используемого модуля для конвертации данных
 * @return {string}
 */
Collection.prototype.toString = function (opt_idOrParams, opt_context, opt_replacer, opt_space, opt_lib) {
  if (isObject(opt_idOrParams)) {
    /** @type {$$Collection_toString} */
    var p = _.any(opt_idOrParams);
    opt_context = _(opt_context, p.context);
    opt_replacer = _(opt_replacer, p.replacer);
    opt_space = _(opt_space, p.space);
    opt_lib = _(opt_lib, p.lib);
    opt_idOrParams = _.any(p.id);
  }

  var res = convertor.exportData({
    lib: opt_lib,
    data: this._getOne(opt_context, opt_idOrParams)

  }, opt_replacer, opt_space);

  return String(res);
};


/**
 * Вернуть длину активной коллекции
 * @return {(number|Object)}
 */
Collection.prototype.valueOf = function () {
  if (arguments[0] === "object") {
    return this;
  }

  return this.length();
};

/*!
 * Различные вспомогательные функции и методы
 */

/**
 * Вернуть ссылку на функцию-итератор заданного объекта
 *
 * @param {!Object} obj - исходный объект
 * @return {function(): Iterator}
 */
function iterator(obj) {
  return obj["@@iterator"] || obj[ITERATOR_KEY];
}

/**
 * Вернуть целое случайное число в заданном диапазоне
 *
 * @param {number} min - минимум
 * @param {number} max - максимум
 * @return {number}
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Перевести заданную строку в верхний регистр
 *
 * @param {string} str - исходная строка
 * @param {?number=} opt_max - максимальное количество переводимых символов
 * @param {?number=} opt_from - начальная позиция
 * @return {string}
 */
function toUpperCase(str, opt_max, opt_from) {
  opt_from = opt_from || 0;
  opt_max = opt_max != null ? opt_from + opt_max : str.length;

  return str.substring(0, opt_from) + str.substring(opt_from, opt_max).toUpperCase() + str.substring(opt_max);
}

/**
 * Вернуть активное значение заданного кластерного параметра
 *
 * @private
 * @param {string} name - название параметра
 * @return {?}
 */
Collection.prototype._getActiveParam = function (name) {
  return this.__use[name] ? this.__active[name] : defs[name];
};

/**
 * Включить указанные опции Collection
 *
 * @param {...string} args - название флагов
 * @return {!Collection}
 */
Collection.prototype.enable = function (args) {
  var _this12 = this;
  $C(arguments).forEach(function (el) {
    _this12.__use[el] = true;
  });

  return this;
};

/**
 * Отключить указанные опции Collection
 *
 * @param {...string} args - название флагов
 * @return {!Collection}
 */
Collection.prototype.disable = function (args) {
  var _this13 = this;
  $C(arguments).forEach(function (el) {
    _this13.__use[el] = false;
  });

  return this;
};
/*!
 * Псевдонимы функций
 */

/**
 * @see {Collection.clone}
 * @param {?} obj
 * @return {?}
 */
$C.clone = Collection.clone;

/**
 * @see {Collection.prototype.VERSION}
 * @const
 */
Collection.VERSION = Collection.prototype.VERSION;

/**
 * @see {Collection.prototype.VERSION}
 * @const
 */
$C.VERSION = Collection.prototype.VERSION;

/**
 * @see Collection.in
 * @param {$$CollectionLink} link
 * @param {!Object} obj
 * @return {boolean}
 */
Collection.exists = Collection.in;

/**
 * @see Collection.in
 * @param {$$CollectionLink} link
 * @param {!Object} obj
 * @return {boolean}
 */
$C.in = Collection.in;

/**
 * @see Collection.in
 * @param {$$CollectionLink} link
 * @param {!Object} obj
 * @return {boolean}
 */
$C.exists = Collection.in;

/**
 * @see Collection.prototype.in
 * @param {$$CollectionLink} link
 * @param {?string=} opt_id
 * @return {boolean}
 */
Collection.prototype.exists = Collection.prototype.in;

/**
 * @see extend
 * @param {(boolean|?$$Collection_extend)} deepOrParams
 * @param {Object} target
 * @param {...Object} args
 * @return {!Object}
 */
$C.extend = Collection.extend;

/**
 * @see splitPath
 * @param {string} str
 * @param {?boolean=} [opt_withoutCut]
 * @return {(!Array)}
 */
$C.splitPath = Collection.splitPath;

/**
 * @see splitPath
 * @param {string} str
 * @param {?boolean=} [opt_withoutCut]
 * @return {(!Array)}
 */
Collection.prototype.splitPath = Collection.splitPath;

/**
 * @see Collection.toArray
 * @param {!Object} obj
 * @return {!Array}
 */
$C.toArray = Collection.toArray;

/**
 * @see NULL
 * @type {!Object}
 */
Collection.prototype.NULL = NULL;

/**
 * Установить новое значение элементу по заданному указателю
 *
 * @private
 *
 * @see Collection.prototype.byLink
 * @param {$$CollectionLink} context - указатель
 *
 * @param {?} val - новое значение
 * @param {?string=} opt_id - ИД коллекции
 * @param {?boolean=} opt_create - если true, то в случае отсутствия
 *     запрашиваемого свойства - оно будет создано
 *
 * @return {{result: boolean, key, value}}
 */
Collection.prototype._setOne = function (context, val, opt_id, opt_create) {
  if (context === void 0) {
    context = "";
  } else if (isLink(context)) {
    context = context.valueOf();
  }

  var contextIsArray = isArray(context);

  if (!isString(context) && !contextIsArray) {
    context = [context];
    contextIsArray = true;
  }

  var activeContext = this._getActiveParam("context"),
      activeContextIsArray = isArray(activeContext);

  if ((!context || !context.length) && (!activeContext || !activeContext.length)) {
    if (opt_id && opt_id !== "active") {
      this._add("collection", opt_id, val);
    } else {
      this._update("collection", val);
    }

    return {
      key: void 0,
      value: val,
      result: true
    };
  }

  var link;

  if (contextIsArray || activeContextIsArray) {
    if (!contextIsArray) {
      context = this.splitPath(context);
    }

    if (!activeContextIsArray) {
      activeContext = this.splitPath(activeContext);
    }

    link = [].concat(activeContext).concat(context);
  } else {
    link = "" + activeContext + " > " + context;
  }

  return byLink(this._get("collection", opt_id), link, val, null, opt_create);
};

/**
 * Вернуть элемент по заданному указателю
 *
 * @private
 *
 * @see Collection.prototype.byLink
 * @param {$$CollectionLink} [opt_context] - указатель
 *
 * @param {?string=} opt_id - ИД коллекции
 * @param {?boolean=} opt_create - если true, то в случае отсутствия
 *     запрашиваемого свойства - оно будет создано
 *
 * @return {?}
 */
Collection.prototype._getOne = function (opt_context, opt_id, opt_create) {
  if (opt_context === void 0) {
    opt_context = "";
  } else if (isLink(opt_context)) {
    opt_context = opt_context.valueOf();
  }

  var contextIsArray = isArray(opt_context);

  if (!isString(opt_context) && !contextIsArray) {
    opt_context = [opt_context];
    contextIsArray = true;
  }

  var activeContext = this._getActiveParam("context"),
      activeContextIsArray = isArray(activeContext);

  if ((!opt_context || !opt_context.length) && (!activeContext || !activeContext.length)) {
    return this._get("collection", opt_id);
  }

  var link;

  if (contextIsArray || activeContextIsArray) {
    if (!contextIsArray) {
      opt_context = this.splitPath(opt_context);
    }

    if (!activeContextIsArray) {
      activeContext = this.splitPath(activeContext);
    }

    link = [].concat(activeContext).concat(opt_context);
  } else {
    link = "" + activeContext + " > " + opt_context;
  }

  return byLink(this._get("collection", opt_id), link, void 0, null, opt_create);
};


/**
 * Удалить элемент коллекции по заданному указателю
 *
 * @private
 *
 * @see Collection.prototype.byLink
 * @param {$$CollectionLink=} [opt_context] - указатель
 *
 * @param {?string=} opt_id - ИД коллекции
 * @return {{result: boolean, key, value}}
 */
Collection.prototype._removeOne = function (opt_context, opt_id) {
  if (opt_context === void 0) {
    opt_context = "";
  } else if (isLink(opt_context)) {
    opt_context = opt_context.valueOf();
  }

  var contextIsArray = isArray(opt_context);

  if (!isString(opt_context) && !contextIsArray) {
    opt_context = [opt_context];
    contextIsArray = true;
  }

  var activeContext = this._getActiveParam("context"),
      activeContextIsArray = isArray(activeContext);

  if ((!opt_context || !opt_context.length) && (!activeContext || !activeContext.length)) {
    var tmp = this._getOne(void 0, opt_id);
    this._setOne(void 0, null, opt_id);

    return {
      key: void 0,
      value: tmp,
      result: true
    };
  }

  var link;

  if (contextIsArray || activeContextIsArray) {
    if (!contextIsArray) {
      opt_context = this.splitPath(opt_context);
    }

    if (!activeContextIsArray) {
      activeContext = this.splitPath(activeContext);
    }

    link = [].concat(activeContext).concat(opt_context);
  } else {
    link = "" + activeContext + " > " + opt_context;
  }

  return byLink(this._get("collection", opt_id), link, null, true);
};


/**
 * Добавить новый элемент в коллекцию
 *
 * @param {?} val - новый элемент
 * @param {(?|?$$Collection_add)=} [opt_keyOrParams] - ключ добавляемого свойства (только для объектов)
 *     ИЛИ объект, свойствами которого указаны параметры метода (приставки opt_ отбрасываются)
 *
 * @param {?boolean=} opt_unshift - если true, то свойство добавляется в начало коллекции
 * @param {?string=} opt_id - ИД коллекции
 *
 * @see Collection.prototype.byLink
 * @param {$$CollectionLink=} [opt_context] - дополнительный контекст
 *
 * @param {?boolean=} opt_create - если false, то в случае отсутствия
 *     запрашиваемого свойства будет сгенерировано исключение,
 *     иначе оно будет создано
 *
 * @return {{result: boolean, key, value}}
 */
Collection.prototype.add = function (val, opt_keyOrParams, opt_unshift, opt_id, opt_context, opt_create) {
  if (isObject(opt_keyOrParams)) {
    /** @type {$$Collection_add} */
    var p = _.any(opt_keyOrParams || {});
    opt_unshift = _(opt_unshift, p.unshift);
    opt_id = _(opt_id, p.id);
    opt_context = _(opt_context, p.context);
    opt_create = _(opt_create, p.create);
    opt_keyOrParams = _.any(p.key === void 0 ? p.name : p.key);
  }

  var data = this._getOne(opt_context, opt_id, opt_create !== false);

  if (!isObjectInstance(data)) {
    throw new TypeError("Unable to set property");
  }

  var cache = {
    result: true
  };

  if (isLikeArray(data) && opt_keyOrParams == null) {
    if (opt_unshift) {
      unshift.call(data, val);
      cache.key = 0;
    } else {
      cache.key = push.call(data, val) - 1;
    }

    cache.result = data[cache.key] === val;
  } else {
    (function () {
      var dataIsMap = isMap(data) || isWeakMap(data),
          dataIsSet = isSet(data) || isWeakSet(data);

      if (opt_unshift) {
        (function () {
          var newObj = dataIsMap || dataIsSet ? new data.constructor() : {};

          if (dataIsMap) {
            cache.key = opt_keyOrParams;
            newObj.set(opt_keyOrParams, val);

            $C(data).forEach(function (el, key) {
              newObj.set(key, el);
              data.delete(key);
            });

            $C(newObj).forEach(function (el, key) {
              data.set(key, el);
            });

            cache.result = data.get(opt_keyOrParams) === val;
          } else if (dataIsSet) {
            cache.key = null;
            newObj.add(val);

            $C(data).forEach(function (el) {
              newObj.add(el);
              data.delete(el);
            });

            $C(newObj).forEach(function (el) {
              data.add(el);
            });

            cache.result = data.has(val);
          } else {
            cache.key = opt_keyOrParams;
            newObj[opt_keyOrParams] = val;

            $C(data).forEach(function (el, key) {
              newObj[key] = el;
              delete data[key];
            });

            $C(newObj).forEach(function (el, key) {
              data[key] = el;
            });

            cache.result = opt_keyOrParams in data;
          }
        })();
      } else {
        if (dataIsMap) {
          cache.key = opt_keyOrParams;
          data.set(opt_keyOrParams, val);
          cache.result = data.get(opt_keyOrParams) === val;
        } else if (dataIsSet) {
          cache.key = null;
          data.add(val);
          cache.result = data.has(val);
        } else {
          cache.key = opt_keyOrParams;
          data[opt_keyOrParams] = val;
          cache.result = data[opt_keyOrParams] === val;
        }
      }
    })();
  }

  cache.value = val;
  return cache;
};

/**
 * Конкатенировать коллекцию с заданным объектом
 *
 * @param {?} obj - объект для конкатенации
 * @param {?string=} opt_id - ИД коллекции, с которой осуществляется конкатенация
 *
 * @see Collection.prototype.byLink
 * @param {$$CollectionLink=} [opt_context] - дополнительный контекст
 *
 * @return {?}
 */
Collection.prototype.concat = function (obj, opt_id, opt_context) {
  var data = this._getOne(opt_context, opt_id);

  if (!isObjectInstance(data)) {
    throw new TypeError("Incorrect data type");
  }

  if (isArray(data) && isArray(obj)) {
    this._setOne(opt_context, data.concat(obj), opt_id);
  } else if (isLikeArray(data)) {
    if (isLikeArray(obj)) {
      $C(obj).forEach(function (el) {
        push.call(data, el);
      });
    } else {
      push.call(data, obj);
    }
  } else if (isObjectInstance(obj) || isString(obj)) {
    (function () {
      var $ = $C(data);
      $C(obj).forEach(function (el, key) {
        $.add(el, { key: key });
      });
    })();
  } else {
    $C(data).add(obj);
  }

  return this._getOne(void 0, opt_id);
};



/**
 * Добавить новый элемент в конец коллекции,
 * аналог Array.prototype.push
 *
 * @param {?} val - новый элемент
 * @param {(?|?$$Collection_push)=} [opt_keyOrParams] - ключ добавляемого свойства (только для объектов)
 *     ИЛИ объект, свойствами которого указаны параметры метода (приставки opt_ отбрасываются)
 *
 * @param {?string=} opt_id - ИД коллекции
 *
 * @see Collection.prototype.byLink
 * @param {$$CollectionLink=} [opt_context] - дополнительный контекст
 *
 * @return {{result: boolean, key: number, value}}
 */
Collection.prototype.push = function (val, opt_keyOrParams, opt_id, opt_context) {
  if (isObject(opt_keyOrParams)) {
    /** @type {$$Collection_push} */
    var p = _.any(opt_keyOrParams || {});
    opt_id = _(opt_id, p.id);
    opt_context = _(opt_context, p.context);
    opt_keyOrParams = _.any(p.key);
  }

  return this.add(val, opt_keyOrParams, false, opt_id, opt_context, false);
};


/**
 * Добавить новый элемент в начало коллекции,
 * аналог Array.prototype.unshift
 *
 * @param {?} val - новый элемент
 * @param {(?|?$$Collection_unshift)=} [opt_keyOrParams] - ключ добавляемого свойства (только для объектов)
 *     ИЛИ объект, свойствами которого указаны параметры метода (приставки opt_ отбрасываются)
 *
 * @param {?string=} opt_id - ИД коллекции
 *
 * @see Collection.prototype.byLink
 * @param {$$CollectionLink=} [opt_context] - дополнительный контекст
 *
 * @return {{result: boolean, key: number, value}}
 */
Collection.prototype.unshift = function (val, opt_keyOrParams, opt_id, opt_context) {
  if (isObject(opt_keyOrParams)) {
    /** @type {$$Collection_unshift} */
    var p = _.any(opt_keyOrParams || {});
    opt_id = _(opt_id, p.id);
    opt_context = _(opt_context, p.context);
    opt_keyOrParams = _.any(p.key);
  }

  return this.add(val, opt_keyOrParams, true, opt_id, opt_context, false);
};


/**
 * Проверить существование заданного параметра в кластере
 *
 * @private
 * @param {string} clusterName - название кластерного параметра
 *     (например: 'collection', 'parser', 'filter', и т.д.)
 *
 * @param {?string=} opt_id - ИД параметра в кластере
 * @return {boolean}
 */
Collection.prototype._isExistsInCluster = function (clusterName, opt_id) {
  if ((opt_id == null || opt_id === "active") && this._active(clusterName)) {
    return true;
  }

  return opt_id in this.__sys["tmp" + toUpperCase(clusterName, 1)];
};

/**
 * Проверить существование коллекции в кластере
 *
 * @param {?string=} opt_id - ИД коллекции
 * @return {boolean}
 */
Collection.prototype.isCollectionExists = function (opt_id) {
  return this._isExistsInCluster("collection", opt_id);
};

/**
 * Проверить существование фильтра в кластере
 *
 * @param {?string=} opt_id - ИД фильтра
 * @return {boolean}
 */
Collection.prototype.isFilterExists = function (opt_id) {
  return this._isExistsInCluster("filter", opt_id);
};

/**
 * Проверить существование контекста в кластере
 *
 * @param {?string=} opt_id - ИД контекста
 * @return {boolean}
 */
Collection.prototype.isContextExists = function (opt_id) {
  return this._isExistsInCluster("context", opt_id);
};

/**
 * Проверить существование переменной в кластере
 *
 * @param {?string=} opt_id - ИД переменной
 * @return {boolean}
 */
Collection.prototype.isVarExists = function (opt_id) {
  return this._isExistsInCluster("var", opt_id);
};

/**
 * Проверить существование пространства имён в кластере
 *
 * @param {?string=} opt_id - ИД пространства имён
 * @return {boolean}
 */
Collection.prototype.isNamespaceExists = function (opt_id) {
  return this._isExistsInCluster("namespace", opt_id);
};
/**
 * Проверить заданный кластерный параметр на активность или вернуть ИД активного кластерного параметра
 *
 * @private
 * @param {string} clusterName - название кластерного параметра
 *     (например: 'collection', 'parser', 'filter', и т.д.)
 *
 * @param {?string=} [opt_id] - ИД параметра в кластере
 * @return {(boolean|string|null)}
 */
Collection.prototype._active = function (clusterName, opt_id) {
  var val = this.__sys["active" + toUpperCase(clusterName, 1) + "Id"];

  if (opt_id == null) {
    return val;
  }

  return opt_id === val;
};

/**
 * Проверить коллекцию на активность или вернуть ИД активной коллекции
 *
 * @param {?string=} [opt_id] - ИД коллекции
 * @return {(boolean|string|null)}
 */
Collection.prototype.activeCollection = function (opt_id) {
  return this._active("collection", opt_id);
};

/**
 * Проверить фильтр на активность или вернуть ИД активного фильтра
 *
 * @param {?string=} [opt_id] - ИД фильтра
 * @return {(boolean|string|null)}
 */
Collection.prototype.activeFilter = function (opt_id) {
  return this._active("filter", opt_id);
};

/**
 * Проверить контекст на активность или вернуть ИД активного контекста
 *
 * @param {?string=} [opt_id] - ИД контекста
 * @return {(boolean|string|null)}
 */
Collection.prototype.activeContext = function (opt_id) {
  return this._active("context", opt_id);
};

/**
 * Проверить переменную на активность или вернуть ИД активной переменной
 *
 * @param {?string=} [opt_id] - ИД переменной
 * @return {(boolean|string|null)}
 */
Collection.prototype.activeVar = function (opt_id) {
  return this._active("var", opt_id);
};

/**
 * Проверить пространство имён на активность или вернуть ИД активного пространства имён
 *
 * @param {?string=} [opt_id] - ИД пространства имён
 * @return {(boolean|string|null)}
 */
Collection.prototype.activeNamespace = function (opt_id) {
  return this._active("namespace", opt_id);
};
/**
 * Вернуть заданный кластерный параметр
 *
 * @private
 * @param {string} clusterName - название кластерного параметра
 *     (например: 'collection', 'parser', 'filter', и т.д.)
 *
 * @param {?string=} opt_id - ИД параметра в кластере
 * @return {?}
 */
Collection.prototype._get = function (clusterName, opt_id) {
  if (opt_id != null && opt_id !== "active") {
    if (!this._isExistsInCluster(clusterName, opt_id)) {
      throw new ReferenceError("The object \"" + opt_id + "\" (" + clusterName + ") doesn't exist in the cluster!");
    }

    return this.__sys["tmp" + toUpperCase(clusterName, 1)][opt_id];
  }

  return this.__active[clusterName];
};

/**
 * Вернуть коллекцию по заданному ИД
 * (можно использовать константу 'active')
 *
 * @param {?string=} opt_id - ИД коллекции
 * @return {Object}
 */
Collection.prototype.getCollection = function (opt_id) {
  return this._get("collection", opt_id);
};

/**
 * Вернуть все коллекции в кластере
 * @return {!Object.<Object>}
 */
Collection.prototype.getCollections = function () {
  return this.__sys["tmpCollection"];
};

/**
 * Вернуть фильтр по заданному ИД
 * (можно использовать константу 'active')
 *
 * @param {?string=} opt_id - ИД фильтра
 * @return {!$$CollectionFilter}
 */
Collection.prototype.getFilter = function (opt_id) {
  return this._get("filter", opt_id);
};

/**
 * Вернуть все фильтры в кластере
 * @return {!Object.<!$$CollectionFilter>}
 */
Collection.prototype.getFilters = function () {
  return this.__sys["tmpFilter"];
};

/**
 * Вернуть контекст по заданному ИД
 * (можно использовать константу 'active')
 *
 * @param {?string=} opt_id - ИД контекста
 * @return {$$CollectionLink}
 */
Collection.prototype.getContext = function (opt_id) {
  return this._get("context", opt_id);
};

/**
 * Вернуть все контексты в кластере
 * @return {!Object.<$$CollectionLink>}
 */
Collection.prototype.getContexts = function () {
  return this.__sys["tmpContext"];
};

/**
 * Вернуть переменную по заданному ИД
 * (можно использовать константу 'active')
 *
 * @param {?string=} opt_id - ИД переменной
 * @return {?}
 */
Collection.prototype.getVar = function (opt_id) {
  return this._get("var", opt_id);
};

/**
 * Вернуть все переменные в кластере
 * @return {!Object.<?>}
 */
Collection.prototype.getVars = function () {
  return this.__sys["tmpVar"];
};

/**
 * Вернуть пространство имён по заданному ИД
 * (можно использовать константу 'active')
 *
 * @param {?string=} opt_id - ИД пространства имён
 * @return {string}
 */
Collection.prototype.getNamespace = function (opt_id) {
  return this._get("namespace", opt_id);
};

/**
 * Вернуть все пространства имён в кластере
 * @return {!Object.<string>}
 */
Collection.prototype.getNamespaces = function () {
  return this.__sys["tmpNamespace"];
};



/**
 * Удалить заданные параметры из кластера
 *
 * @private
 * @param {string} clusterName - название кластерного параметра
 *     (например: 'collection', 'parser', 'filter', и т.д.)
 *
 * @param {Array=} opt_objId - массив удаляемых ИД-ов
 * @param {?=} opt_deleteVal - значение, которое будет установлено активному параметру после удаления
 *
 * @return {!Collection}
 */
Collection.prototype._drop = function (clusterName, opt_objId, opt_deleteVal) {
  opt_deleteVal = opt_deleteVal === void 0 ? null : opt_deleteVal;

  var key = toUpperCase(clusterName, 1),
      activeId = this._active(clusterName);

  var active = this.__active,
      sys = this.__sys;

  var tmpActiveIdStr = "active" + key + "Id",
      tmpTmpStr = "tmp" + key;

  $C(!opt_objId || !opt_objId[0] ? ["active"] : opt_objId).forEach(function (el) {
    if (!el || el === "active") {
      // Если параметр существует в кластере,
      // то удаляем его тоже
      if (activeId) {
        delete sys[tmpTmpStr][activeId];
      }

      sys[tmpActiveIdStr] = null;
      active[clusterName] = opt_deleteVal;
    } else {
      delete sys[tmpTmpStr][el];

      // Если параметр является активным,
      // то активная ссылка тоже удаляется
      if (activeId && el === activeId) {
        sys[tmpActiveIdStr] = null;
        active[clusterName] = opt_deleteVal;
      }
    }
  });

  return this;
};

/**
 * Удалить коллекцию/и из кластера
 * (можно использовать константу 'active')
 *
 * @param {...string} ids - ИД-ы удаляемых коллекций
 * @return {!Collection}
 */
Collection.prototype.dropCollection = function (ids) {
  return this._drop("collection", slice.call(arguments));
};

/**
 * Удалить фильтр/ы из кластера
 * (можно использовать константу 'active')
 *
 * @param {...string} ids - ИД-ы удаляемых фильтров
 * @return {!Collection}
 */
Collection.prototype.dropFilter = function (ids) {
  return this._drop("filter", slice.call(arguments), false);
};

/**
 * Удалить контекст/ы из кластера
 * (можно использовать константу 'active')
 *
 * @param {...string} ids - ИД-ы удаляемых контекстов
 * @return {!Collection}
 */
Collection.prototype.dropContext = function (ids) {
  return this._drop("context", slice.call(arguments), "");
};

/**
 * Удалить переменную/ые из кластера
 * (можно использовать константу 'active')
 *
 * @param {...string} ids - ИД-ы удаляемых переменных
 * @return {!Collection}
 */
Collection.prototype.dropVar = function (ids) {
  return this._drop("var", slice.call(arguments));
};

/**
 * Удалить пространство/а имён из кластера
 * (можно использовать константу 'active')
 *
 * @param {...string} ids - ИД-ы удаляемых пространств имён
 * @return {!Collection}
 */
Collection.prototype.dropNamespace = function (ids) {
  return this._drop("namespace", slice.call(arguments), "nm");
};


/**
 * Вернуть родительский контекст
 *
 * @param {?number=} opt_n - родительский уровень
 * @param {?string=} opt_id - ИД контекста
 * @return {(!Array|string)}
 */
Collection.prototype.parentContext = function (opt_n, opt_id) {
  var context = this._get("context", opt_id),
      contextIsArray = isArray(context);

  var list = contextIsArray ? context.slice() : this.splitPath(context, true);

  for (var i = opt_n || 1; i--;) {
    list.pop();
  }

  return contextIsArray ? list : list.join(" > ");
};

/**
 * Изменить контекст на родительский
 *
 * @param {?number=} opt_n - родительский уровень
 * @param {?string=} opt_id - ИД контекста
 * @return {(!Array|string)}
 */
Collection.prototype.parent = function (opt_n, opt_id) {
  var ctx = this.parentContext(opt_n, opt_id);

  if (opt_id != null) {
    this._add("context", String(opt_id), ctx);
  } else {
    this._update("context", ctx);
  }

  return ctx;
};

/**
 * Модифицировать значение заданного параметра
 * (для фильтров делается компиляция и т.д.)
 *
 * @private
 * @param {?} val - исходное значение
 * @param {string} clusterName - название кластерного параметра
 *     (например: 'collection', 'parser', 'filter', и т.д.)
 *
 * @param {?string=} [opt_key] - кластерный ИД
 * @return {?}
 */
Collection.prototype._modVal = function (val, clusterName, opt_key) {
  switch (clusterName) {
    case "context":
      if (isLink(val)) {
        val = val.valueOf();
      }

      if (!isString(val) && !isArray(val)) {
        val = [val];
      }

      break;

    case "collection":
      if (isString(val)) {
        val = val.split("");
      } else if (isNumber(val) || isBoolean(val)) {
        val = [val];
      }

      val = val || defs[clusterName];
      break;

    case "filter":
      val = this._prepareFilter(val, Boolean(opt_key && tmpLinkFilter[opt_key]));
      break;
  }

  return val;
};


/**
 * Использовать заданное пространство имён
 *
 * @param {string} id - пространство имён (точка разделитель)
 * @return {!Collection}
 */
Collection.prototype.use = function (id) {
  var _this14 = this;
  $C(CLUSTER).forEach(function (el) {
    if (_this14._isExistsInCluster(el, id)) {
      _this14._set(el, id);
    } else {
      var nm = id.split(".");

      for (var i = nm.length; i--;) {
        nm.splice(i, 1);
        var tmpNm = nm.join(".");

        if (_this14._isExistsInCluster(el, tmpNm)) {
          _this14._set(el, tmpNm);
          break;
        }
      }
    }
  });

  return this;
};

var tmpFunc = {};
var idHash = {
  "Function": true,
  "return": true,

  "JSON": true,
  "URL": true,

  "btoa": true,
  "atob": true,

  "NaN": true,
  "isNaN": true,
  "Infinity": true,
  "isFinite": true,

  "encodeURI": true,
  "encodeURIComponent": true,
  "decodeUri": true,
  "decodeUriComponent": true,

  "parseInt": true,
  "parseFloat": true,

  "setInterval": true,
  "clearInterval": true,
  "setTimeout": true,
  "clearTimeout": true,
  "setImmediate": true,
  "clearImmediate": true,

  "window": true,
  "document": true,
  "global": true,

  "ArrayBuffer": true,
  "Int8Array": true,
  "Int16Array": true,
  "Int32Array": true,
  "Uint8Array": true,
  "Uint16Array": true,
  "Uint32Array": true,
  "Uint8ClampedArray": true,

  "Array": true,
  "Object": true,
  "RegExp": true,
  "Date": true,
  "Math": true,
  "Set": true,
  "WeakSet": true,
  "Map": true,
  "WeakMap": true,
  "Proxy": true,

  "Error": true,
  "EvalError": true,
  "TypeError": true,
  "SyntaxError": true,
  "URIError": true,
  "RangeError": true,
  "ReferenceError": true,

  "String": true,
  "Number": true,
  "Boolean": true,
  "Symbol": true,

  "true": true,
  "false": true,
  "undefined": true,
  "null": true,

  "yield": true,
  "in": true,
  "new": true,
  "delete": true,
  "void": true,
  "typeof": true,
  "instanceof": true,
  "this": true,

  "el": true,
  "key": true,
  "data": true,
  "i": true,
  "length": true,
  "id": true
};

var symbols = "a-zA-Zа-яА-ЯёЁ";

// Эта адская регулярка определяет все юникодные буквы (включая иероглифы)

symbols = "\\u0041-\\u005A\\u0061-\\u007A\\u00AA\\u00B5\\u00BA\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02C1" + "\\u02C6-\\u02D1\\u02E0-\\u02E4\\u02EC\\u02EE\\u0370-\\u0374\\u0376\\u0377\\u037A-\\u037D\\u0386\\u0388-\\u038A" + "\\u038C\\u038E-\\u03A1\\u03A3-\\u03F5\\u03F7-\\u0481\\u048A-\\u0525\\u0531-\\u0556\\u0559\\u0561-\\u0587" + "\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0621-\\u064A\\u066E\\u066F\\u0671-\\u06D3\\u06D5\\u06E5\\u06E6\\u06EE\\u06EF\\u06FA-\\u06FC" + "\\u06FF\\u0710\\u0712-\\u072F\\u074D-\\u07A5\\u07B1\\u07CA-\\u07EA\\u07F4\\u07F5\\u07FA\\u0800-\\u0815\\u081A\\u0824" + "\\u0828\\u0904-\\u0939\\u093D\\u0950\\u0958-\\u0961\\u0971\\u0972\\u0979-\\u097F\\u0985-\\u098C\\u098F\\u0990" + "\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09BD\\u09CE\\u09DC\\u09DD\\u09DF-\\u09E1\\u09F0\\u09F1\\u0A05-\\u0A0A" + "\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A59-\\u0A5C\\u0A5E\\u0A72-\\u0A74\\u0A85-\\u0A8D" + "\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABD\\u0AD0\\u0AE0\\u0AE1\\u0B05-\\u0B0C\\u0B0F\\u0B10" + "\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B35-\\u0B39\\u0B3D\\u0B5C\\u0B5D\\u0B5F-\\u0B61\\u0B71\\u0B83\\u0B85-\\u0B8A\\u0B8E-\\u0B90" + "\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB9\\u0BD0\\u0C05-\\u0C0C" + "\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C3D\\u0C58\\u0C59\\u0C60\\u0C61\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8" + "\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CBD\\u0CDE\\u0CE0\\u0CE1\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D28\\u0D2A-\\u0D39\\u0D3D" + "\\u0D60\\u0D61\\u0D7A-\\u0D7F\\u0D85-\\u0D96\\u0D9A-\\u0DB1\\u0DB3-\\u0DBB\\u0DBD\\u0DC0-\\u0DC6\\u0E01-\\u0E30\\u0E32\\u0E33" + "\\u0E40-\\u0E46\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5" + "\\u0EA7\\u0EAA\\u0EAB\\u0EAD-\\u0EB0\\u0EB2\\u0EB3\\u0EBD\\u0EC0-\\u0EC4\\u0EC6\\u0EDC\\u0EDD\\u0F00\\u0F40-\\u0F47" + "\\u0F49-\\u0F6C\\u0F88-\\u0F8B\\u1000-\\u102A\\u103F\\u1050-\\u1055\\u105A-\\u105D\\u1061\\u1065\\u1066" + "\\u106E-\\u1070\\u1075-\\u1081\\u108E\\u10A0-\\u10C5\\u10D0-\\u10FA\\u10FC\\u1100-\\u1248\\u124A-\\u124D\\u1250-\\u1256" + "\\u1258\\u125A-\\u125D\\u1260-\\u1288\\u128A-\\u128D\\u1290-\\u12B0\\u12B2-\\u12B5\\u12B8-\\u12BE\\u12C0\\u12C2-\\u12C5" + "\\u12C8-\\u12D6\\u12D8-\\u1310\\u1312-\\u1315\\u1318-\\u135A\\u1380-\\u138F\\u13A0-\\u13F4\\u1401-\\u166C\\u166F-\\u167F" + "\\u1681-\\u169A\\u16A0-\\u16EA\\u1700-\\u170C\\u170E-\\u1711\\u1720-\\u1731\\u1740-\\u1751\\u1760-\\u176C\\u176E-\\u1770" + "\\u1780-\\u17B3\\u17D7\\u17DC\\u1820-\\u1877\\u1880-\\u18A8\\u18AA\\u18B0-\\u18F5\\u1900-\\u191C\\u1950-\\u196D" + "\\u1970-\\u1974\\u1980-\\u19AB\\u19C1-\\u19C7\\u1A00-\\u1A16\\u1A20-\\u1A54\\u1AA7\\u1B05-\\u1B33\\u1B45-\\u1B4B\\u1B83-\\u1BA0" + "\\u1BAE\\u1BAF\\u1C00-\\u1C23\\u1C4D-\\u1C4F\\u1C5A-\\u1C7D\\u1CE9-\\u1CEC\\u1CEE-\\u1CF1\\u1D00-\\u1DBF\\u1E00-\\u1F15" + "\\u1F18-\\u1F1D\\u1F20-\\u1F45\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59\\u1F5B\\u1F5D\\u1F5F-\\u1F7D\\u1F80-\\u1FB4\\u1FB6-\\u1FBC" + "\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FCC\\u1FD0-\\u1FD3\\u1FD6-\\u1FDB\\u1FE0-\\u1FEC\\u1FF2-\\u1FF4\\u1FF6-\\u1FFC\\u2071\\u207F" + "\\u2090-\\u2094\\u2102\\u2107\\u210A-\\u2113\\u2115\\u2119-\\u211D\\u2124\\u2126\\u2128\\u212A-\\u212D\\u212F-\\u2139\\u213C-\\u213F" + "\\u2145-\\u2149\\u214E\\u2183\\u2184\\u2C00-\\u2C2E\\u2C30-\\u2C5E\\u2C60-\\u2CE4\\u2CEB-\\u2CEE\\u2D00-\\u2D25\\u2D30-\\u2D65\\u2D6F" + "\\u2D80-\\u2D96\\u2DA0-\\u2DA6\\u2DA8-\\u2DAE\\u2DB0-\\u2DB6\\u2DB8-\\u2DBE\\u2DC0-\\u2DC6\\u2DC8-\\u2DCE\\u2DD0-\\u2DD6\\u2DD8-\\u2DDE" + "\\u2E2F\\u3005\\u3006\\u3031-\\u3035\\u303B\\u303C\\u3041-\\u3096\\u309D-\\u309F\\u30A1-\\u30FA\\u30FC-\\u30FF\\u3105-\\u312D\\u3131-\\u318E\\u31A0-\\u31B7" + "\\u31F0-\\u31FF\\u3400-\\u4DB5\\u4E00-\\u9FCB\\uA000-\\uA48C\\uA4D0-\\uA4FD\\uA500-\\uA60C\\uA610-\\uA61F\\uA62A\\uA62B\\uA640-\\uA65F\\uA662-\\uA66E\\uA67F-\\uA697" + "\\uA6A0-\\uA6E5\\uA717-\\uA71F\\uA722-\\uA788\\uA78B\\uA78C\\uA7FB-\\uA801\\uA803-\\uA805\\uA807-\\uA80A\\uA80C-\\uA822\\uA840-\\uA873\\uA882-\\uA8B3\\uA8F2-\\uA8F7" + "\\uA8FB\\uA90A-\\uA925\\uA930-\\uA946\\uA960-\\uA97C\\uA984-\\uA9B2\\uA9CF\\uAA00-\\uAA28\\uAA40-\\uAA42\\uAA44-\\uAA4B\\uAA60-\\uAA76\\uAA7A\\uAA80-\\uAAAF\\uAAB1" + "\\uAAB5\\uAAB6\\uAAB9-\\uAABD\\uAAC0\\uAAC2\\uAADB-\\uAADD\\uABC0-\\uABE2\\uAC00-\\uD7A3\\uD7B0-\\uD7C6\\uD7CB-\\uD7FB\\uF900-\\uFA2D\\uFA30-\\uFA6D\\uFA70-\\uFAD9" + "\\uFB00-\\uFB06\\uFB13-\\uFB17\\uFB1D\\uFB1F-\\uFB28\\uFB2A-\\uFB36\\uFB38-\\uFB3C\\uFB3E\\uFB40\\uFB41\\uFB43\\uFB44\\uFB46-\\uFBB1\\uFBD3-\\uFD3D\\uFD50-\\uFD8F" + "\\uFD92-\\uFDC7\\uFDF0-\\uFDFB\\uFE70-\\uFE74\\uFE76-\\uFEFC\\uFF21-\\uFF3A\\uFF41-\\uFF5A\\uFF66-\\uFFBE\\uFFC2-\\uFFC7\\uFFCA-\\uFFCF" + "\\uFFD2-\\uFFD7\\uFFDA-\\uFFDC";


var w = "" + symbols + "0-9_";
var startIdTest = "(" + "(?:" + "^:?|" + ("[^" + symbols + "$.](?=[" + symbols + "_$][" + w + "$]*)") + ")" + "\\s*)";

var endIdTest = "(?=\\s|[^" + w + "$]|$)";
var idsRgxp = new RegExp("" + startIdTest + "[" + symbols + "_$][" + w + "$]*" + endIdTest, "g"),
    idRgxp = new RegExp("[" + symbols + "_0-9$]+"),
    advArgRgxp = /\.\.\.|=|\{/;

var arrFnRgxp = /=>/,
    simpleFnRgxp = /^(\s*return)(?:\s|;|$)/,
    endFnRgxp = /;?\s*}\s*$/,
    simpleEndFnRgxp = /[<>^~\/%*+\-=;,)}\]\s]/,
    sRgxp = /\s/;

var deepFnRgxp = new RegExp("(" + "(?:" + ("(?:function|get|set)(?:\\s+[" + w + "$]+|)") + "|" + ("(?:^\\s*\\{|,|[=:,(\\[\\w]\\s*\\{)\\s*[" + w + "$]+") + // shorthand methods
")\\s*\\(([\\s\\S]*?)\\)\\s*\\{" + // function foo(...) {} || get foo(...) {} || set foo(...) {} || foo(...) {}

"|" + ("function(?:\\s+[" + w + "$]+|)\\s*\\(([\\s\\S]*?)\\)+\\s*(?=[^,]+)") + // function foo(...) ...

"|" + "(\\s*=>\\s*\\{?)" + // (...) => { ... } || (...) => ... || ... => { ... } || ... => ...
")" + "([\\s\\S]*)");

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
    ";": true,
    ",": true,
    "}": true,
    ")": true
  };

  var pOpenMap = {
    "(": true,
    "[": true
  };

  var pCloseMap = {
    "]": true,
    ")": true
  };

  while (true) {
    var arr = deepFnRgxp.exec(str);

    var bOpen = 1,
        pOpen = 0;

    var start = null,
        end = null;

    if (arr) {
      var adv = arr[1],
          index = arr.index;

      var args = [],
          arg = "";

      if (arr[4]) {
        if (init && !opt_desc.arrFn) {
          opt_desc.hasThis = true;
        }

        var j = 0,
            _simple = null;

        for (var i = index; i--;) {
          var el = str.charAt(i);

          if (_simple === null) {
            _simple = !pCloseMap[el];

            if (!_simple) {
              j++;
              adv = el + adv;
              pOpen++;
              continue;
            }
          }

          if (_simple) {
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

            if (el === "," && pOpen === 1) {
              args.unshift(arg);
              arg = "";
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
        var argStr = arr[3] || arr[2] || "";

        for (var i = -1,
            length = argStr.length; ++i < length;) {
          var el = argStr.charAt(i);

          if (pOpenMap[el]) {
            pOpen++;
          } else if (pCloseMap[el]) {
            pOpen--;
          }

          if (el === "," && !pOpen) {
            args.push(arg);
            arg = "";
          } else {
            arg += el;
          }
        }

        if (arg) {
          args.push(arg);
        }
      }

      for (var i = -1,
          length = args.length; ++i < length;) {
        if (advArgRgxp.test(args[i])) {
          opt_desc.subs = true;
          break;
        } else {
          args[i] = args[i].trim();
        }
      }

      opt_desc.args = args;
      pOpen = 0;

      var simple = adv.slice(-1) !== "{",
          tmp = arr[5];

      start = index;
      end = start + adv.length;

      if (init) {
        for (var i = -1,
            length = tmp.length; ++i < length;) {
          var el = tmp.charAt(i);

          if (simple) {
            if (pOpenMap[el]) {
              pOpen++;
            } else if (pCloseMap[el]) {
              pOpen--;
            }

            if (!pOpen && simpleEndMap[el] || i === length - 1) {
              end += i + 1;
              break;
            }
          } else {
            if (el === "{") {
              bOpen++;
            } else if (el === "}") {
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

          var returnAdv = 0,
              returnVal = !simple && simpleFnRgxp.exec(tmp);

          if (returnVal) {
            returnAdv = returnVal[1].length;
            simple = true;
          }

          opt_desc.simple = simple;
          str = str.substring(0, start) + str.substring(end + returnAdv).replace(endFnRgxp, "");
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

var thisRgxp = new RegExp("" + startIdTest + "this" + endIdTest, "g"),
    yieldRgxp = new RegExp("" + startIdTest + "(?:$cYield|$cSleep)" + endIdTest, "g"),
    argsRgxp = new RegExp("" + startIdTest + "(el|key|data|i|length|id|callee|this)" + endIdTest, "g");

var returnRgxp = new RegExp("" + startIdTest + "return" + endIdTest, "g"),
    calleeRgxp = new RegExp("" + startIdTest + "callee" + endIdTest, "g");

var varRgxp = /(?:#|\$)\{([^}]*)}/g,
    fLengthRgxp = new RegExp("" + startIdTest + "length" + endIdTest, "g");

var argOrder = {
  "this": 0,
  "return": 0,
  "el": 1,
  "key": 2,
  "data": 3,
  "i": 4,
  "length": 5,
  "callee": 6
};

var filterArgs = ["el", "key", "data", "i", "fLength", "callee"];

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
    var el = str.charAt(start);
    if (!sRgxp.test(el)) {
      if (el === "t") {
        return false;
      }

      ternar = el === "?";
      break;
    }

    start--;
  }

  var length = str.length,
      bOpen = 0,
      bStart = false;

  while (end < length) {
    var el = str.charAt(end);

    if (!sRgxp.test(el)) {
      if (el === "(") {
        bOpen++;
        bStart = true;
      } else {
        if (!bOpen) {
          if (el === "{" || !bStart && !ternar && el === ":") {
            return false;
          }

          break;
        } else if (el === ")") {
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
  var el, res = false;

  while (el = rgxp.exec(str)) {
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
  _loop: for (var i = 0; i < args.length; i++) {
    var _ret7 = (function () {
      var el = args[i].trim();

      if (!el) {
        return "continue";
      }

      if (el !== selfArgs[i]) {
        var _ret8 = (function () {
          var tmp = "" + startIdTest + "" + selfArgs[i] + "" + endIdTest,
              rgxp = filterArgsCache[tmp] = filterArgsCache[tmp] || new RegExp(tmp, "g");

          if (search(rgxp, body)) {
            argsRes = false;
            return {
              v: "break"
            };
          }

          if (selfArgs[i] === "fLength") {
            lengthReplace = true;
          }

          var arg = selfArgs[i];

          body = body.replace(new RegExp("" + startIdTest + "" + el + "" + endIdTest, "g"), function (sstr, $1, pos) {
            if (testVal(body, pos, pos + sstr.length)) {
              return $1 + arg;
            }

            return sstr;
          });

          delete selfArgs[i];
        })();

        if (typeof _ret8 === "object") return _ret8.v;
      } else {
        delete selfArgs[i];
      }
    })();

    switch (_ret7) {
      case "break":
        break _loop;
      case "continue":
        continue _loop;
    }
  }


  if (argsRes) {
    // Если остались не использованные системные переменные, вроде el, i и т.д.,
    // то проверяем не используются ли они локально
    for (var i = 0; i < selfArgs.length; i++) {
      var el = selfArgs[i];
      if (el && new RegExp("" + startIdTest + "" + el + "" + endIdTest).test(body)) {
        argsRes = false;
        break;
      }
    }
  }

  if (argsRes) {
    var obj = body.match(idsRgxp),
        canStr = true;

    if (obj) {
      // Проверяем тело функции на использование внешних параметров
      // и если таковые есть и они не входят в idHash,
      // то сбрасываем обработку
      for (var i = 0; i < obj.length; i++) {
        var el = idRgxp.exec(obj[i])[0];
        if (!idHash[el] && el.indexOf("__ESCAPER_QUOT__") !== 0) {
          if (el === "fLength" && lengthReplace) {
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

  return str.replace(nRgxp, "");
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
    fn["__COLLECTION_TMP__source"] = cache.source;
    fn["__COLLECTION_TMP__withThis"] = cache.withThis;
    fn["__COLLECTION_TMP__withReturn"] = cache.withReturn;
    fn["__COLLECTION_TMP__withYield"] = cache.withYield;
  } else {
    var desc = {};
    var fnSource = hideDeepFunctions(Escaper.replace(fnString, { "@all": true, "@comments": -1 }).replace(nRgxp, "\n").replace(stRgxp, " "), desc);

    if (fnSource !== false) {
      if (isNativeRgxp.test(fnSource)) {
        fn["__COLLECTION_TMP__withThis"] = false;
        fn["__COLLECTION_TMP__withReturn"] = true;
        fn["__COLLECTION_TMP__withYield"] = false;
      } else {
        var withReturn = desc.simple || search(returnRgxp, String(fnSource));

        if (!withReturn && !desc.subs) {
          var str = optimize(desc.args, String(fnSource));
          if (str !== false) {
            fn["__COLLECTION_TMP__source"] = str + (str.slice(-1) !== ";" ? ";" : "");
          }
        }

        fn["__COLLECTION_TMP__withThis"] = !desc.arrFn && (desc.hasThis || search(thisRgxp, String(fnSource)));

        fn["__COLLECTION_TMP__withReturn"] = withReturn;
        fn["__COLLECTION_TMP__withYield"] = search(yieldRgxp, String(fnSource));
      }
    }

    tmpFunc[fnString] = {
      source: fn["__COLLECTION_TMP__source"] || null,
      withThis: fn["__COLLECTION_TMP__withThis"],
      withReturn: fn["__COLLECTION_TMP__withReturn"],
      withYield: fn["__COLLECTION_TMP__withYield"]
    };
  }

  return fn;
}


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

  str = Escaper.replace(str, true).replace(nRgxp, "\n").replace(stRgxp, " ");

  var inline = !search(calleeRgxp, str);

  str = str.replace(varRgxp, "this.getVar('$1')");

  var withThis = false,
      fnCompileArgs = $C(filterArgs).map(function () {
    return "null";
  });

  var sysEl, maxLength = 0;

  while (sysEl = argsRgxp.exec(str)) {
    var el = sysEl[2];

    if (!testVal(str, sysEl.index, argsRgxp.lastIndex)) {
      continue;
    }

    if (argOrder[el]) {
      var order = argOrder[el];

      fnCompileArgs[order - 1] = el === "length" ? "fLength" : el;

      if (maxLength < order) {
        maxLength = order;
      }
    }

    if (el === "this") {
      withThis = true;
    }
  }

  var fn;

  if (inline) {
    str = str.replace(fLengthRgxp, function (sstr, $1, pos) {
      if (testVal(str, pos, pos + sstr.length)) {
        return $1 + "fLength";
      }

      return sstr;
    });

    fn = {
      "__COLLECTION_TMP__source": Escaper.paste(str),
      "__COLLECTION_TMP__withYield": search(yieldRgxp, str.substring(1)),

      call: true,
      inline: true,
      length: maxLength
    };
  } else {
    var code = Escaper.paste(str);
    fn = Function.apply(Function, filterArgs.concat("return " + code.replace(defExprRgxp, "") + ";"));

    fn["__COLLECTION_TMP__args"] = fnCompileArgs;
    fn["__COLLECTION_TMP__source"] = code;

    fn["__COLLECTION_TMP__withThis"] = withThis;
    fn["__COLLECTION_TMP__withYield"] = search(yieldRgxp, str);
    fn["__COLLECTION_TMP__withReturn"] = true;
  }

  tmpLinkFilter[key] = fn;
  return fn;
}

Collection.prototype._compileFunc = compileFunc;

var tmpLinkFilter = Collection.prototype["_tmpLinkFilter"] = {},
    tmpFilter = {},
    tmpStrFilter = {};

{
  (function () {
    /**
     * Анализировать тело заданного фильтра на возможность оптимизации
     *
     * @private
     * @param {(string|!Function)} fn - исходный фильтр
     * @param {?boolean=} opt_update - если true, то сбрасывается кеш фильтров
     * @return {(string|!Function)}
     */
    Collection.prototype._prepareFilter = function (fn, opt_update) {
      if (opt_update) {
        tmpStrFilter = {};
        tmpLinkFilter = Collection.prototype["_tmpLinkFilter"] = {};
      }

      if (fn.call) {
        var fnString = fn.toString(),
            cache = tmpFilter[fnString];

        if (cache) {
          fn["__COLLECTION_TMP__source"] = cache.source;
          fn["__COLLECTION_TMP__withThis"] = cache.withThis;
          fn["__COLLECTION_TMP__withYield"] = cache.withYield;
        } else {
          var desc = {};
          var fnSource = hideDeepFunctions(Escaper.replace(fnString, { "@all": true, "@comments": -1 }).replace(nRgxp, "\n").replace(stRgxp, " "), desc);

          if (fnSource !== false) {
            if (isNativeRgxp.test(fnSource)) {
              fn["__COLLECTION_TMP__withThis"] = false;
              fn["__COLLECTION_TMP__withYield"] = false;
            } else {
              if (!desc.subs && desc.simple) {
                if (fnSource.slice(-1) === ";") {
                  fnSource = fnSource.slice(0, -1);
                }

                var str = optimize(desc.args, String(fnSource));

                if (str !== false) {
                  fn["__COLLECTION_TMP__source"] = ":" + str;
                }
              }

              fn["__COLLECTION_TMP__withThis"] = !desc.arrFn && (desc.hasThis || search(thisRgxp, String(fnSource)));

              fn["__COLLECTION_TMP__withYield"] = search(yieldRgxp, String(fnSource));
            }
          }

          tmpFilter[fnString] = {
            source: fn["__COLLECTION_TMP__source"] || null,
            withThis: fn["__COLLECTION_TMP__withThis"],
            withYield: fn["__COLLECTION_TMP__withYield"]
          };
        }
      }

      return fn;
    };


    /**
     * Раскрыть ссылку на фильтр
     * (метод раскрывает ссылки: a -> b -> function и
     * если нужно производит компиляцию фильтра с последующим кешированием)
     *
     * @private
     * @param {(string|boolean|Function)} filter - исходный фильтр
     * @return {{filter: (string|boolean|!Function), key: string}}
     */
    Collection.prototype._expandFilter = function (filter) {
      var fin = filter;

      if (fin && fin !== true && !fin.call) {
        if (tmpLinkFilter[fin] !== void 0) {
          fin = tmpLinkFilter[fin];
        } else {
          while (fin && fin !== true && !fin.call) {
            if (isStringExpressionRgxp.test(fin)) {
              fin = compileFunc(fin);
              break;
            } else {
              if (isFilterRgxp.test(fin)) {
                break;
              }

              fin = this._get("filter", fin);
            }
          }

          tmpLinkFilter[filter] = fin;
        }
      }

      return {
        filter: fin || true,
        key: String(filter)
      };
    };


    /**
     * Анализировать развёрнутое дерево фильтров
     * и произвести инлайнинг
     *
     * @private
     * @param {!Array} tree - дерево исходного фильтра
     * @return {{filter: string, length: number, withYield: boolean}}
     */
    Collection.prototype._concatFilter = function (tree) {
      var chainLength = tree.length;
      var res = "",
          maxLength = 0,
          withYield = false;

      for (var i = -1; ++i < chainLength;) {
        var el = tree[i];
        var _logic = el.logic ? " " + el.logic + " " : "";

        var inverse = el.inverse ? "!" : "";

        res += _logic;
        if (isArray(el)) {
          var deep = this._concatFilter(el);

          if (deep.length > maxLength) {
            maxLength = deep.length;
          }

          res += "" + inverse + "(" + deep.filter + ")";
        } else {
          res += "(" + (inverse ? "!" : "") + "(f = ";
          var filter = void 0;

          if (el.str) {
            var fn = el.str;
            filter = compileFunc(fn);

            if (filter.inline) {
              res += filter["__COLLECTION_TMP__source"].substring(1);
            } else {
              res += "this._tmpLinkFilter['" + fn + "']";

              if (filter["__COLLECTION_TMP__withThis"]) {
                res += ".call(this, ";
              } else {
                res += "(";
              }

              if (filter.length === filterArgs.length) {
                filter["__COLLECTION_TMP__args"][filter["__COLLECTION_TMP__args"].length - 1] = "this._tmpLinkFilter['" + fn + "']";
              }

              res += "" + filter["__COLLECTION_TMP__args"] + ")";
            }
          } else {
            var key = el.fnKey;
            filter = tmpLinkFilter[key] = this._get("filter", key);

            res += "this._tmpLinkFilter['" + key + "']";

            if (filter["__COLLECTION_TMP__withThis"]) {
              res += ".call(this, ";
            } else {
              res += "(";
            }

            if (filter["__COLLECTION_TMP__args"]) {
              if (filter.length === filterArgs.length) {
                filter["__COLLECTION_TMP__args"][filter["__COLLECTION_TMP__args"].length - 1] = "this._tmpLinkFilter['" + key + "']";
              }

              res += "" + filter["__COLLECTION_TMP__args"] + ")";
            } else {
              var a = filterArgs.slice();
              a[a.length - 1] = "this._tmpLinkFilter['" + key + "']";
              res += "" + a.slice(0, filter.length) + ")";
            }
          }

          if (!withYield) {
            withYield = filter["__COLLECTION_TMP__withYield"];
          }

          if (maxLength < filter.length) {
            maxLength = filter.length;
          }

          res += ") && f !== FALSE || f === TRUE)";
        }
      }

      return {
        filter: res,
        length: maxLength,
        withYield: withYield
      };
    };


    /**
     * Рассчитать заданный вложенный фильтр
     * (метод возвращает объект вложенных элементов)
     *
     * @param {!Array} array - массив атомов
     * @param {number} iter - номер итерации
     * @return {?{result: !Array, iteration: number}}
     */
    function calculateDeepFilter(array, iter) {
      var length = array.length;
      var pos = 0,
          res = [];

      for (var i = -1; ++i < length;) {
        iter++;

        if (array[i] === "(" || array[i] === "!(") {
          pos++;
        }

        if (array[i] === ")") {
          if (pos === 0) {
            return {
              result: res,
              iteration: iter
            };
          } else {
            pos--;
          }
        }

        res.push(array[i]);
      }

      return null;
    }


    var fPartsRgxp = /\s*(\|\||&&|\(|\))\s*/g,
        reverseRgxp = /!\s*/g;

    var logic = {
      "||": true,
      "&&": true
    };

    var open = {
      "(": true,
      "!(": true
    };

    var ufilter = {
      ")": true,
      "||": true,
      "&&": true
    };

    /**
     * Скомпилировать сложный фильтр
     * (метод проводит полный анализ фильтра, инлайнинг и функциональную декомпозицию)
     *
     * @private
     * @param {(string|!Function|boolean|!Array)} filter -
     *     1) функция-фильтр;
     *     2) строковое выражение (запись эквивалентна: return + строковое выражение);
     *     3) true (если фильтр отключён)
     *
     * @param {Array=} [opt_tree] - дерево исходного фильтра
     * @param {?boolean=} [opt_subFunc] - если true, то вызов функции считается дочерним
     * @param {?string=} [opt_fnKey] - ключ функции из кеша
     * @return {({filter: string, length: number, withYield: boolean}|undefined)}
     */
    Collection.prototype._compileFilter = function (filter, opt_tree, opt_subFunc, opt_fnKey) {
      var key = filter;

      if (tmpStrFilter[key] && !opt_subFunc) {
        return tmpStrFilter[key];
      }

      /** @type {?} */
      var tree = opt_subFunc ? opt_tree : [];

      if (filter.call || isBoolean(filter)) {
        tree.push({
          str: filter["__COLLECTION_TMP__source"],
          fnKey: opt_fnKey
        });

        if (!opt_subFunc) {
          var desc = this._concatFilter(tree);
          desc.filter = Escaper.paste(desc.filter);
          return desc;
        }

        return;
      }


      if (!isArray(filter)) {
        filter = filter.trim();

        if (isStringExpressionRgxp.test(filter)) {
          var fn = compileFunc(filter);

          if (!opt_subFunc && fn.inline) {
            return {
              filter: fn["__COLLECTION_TMP__source"].substring(1),
              withYield: fn["__COLLECTION_TMP__withYield"],
              length: fn.length
            };
          } else {
            tree.push({
              str: fn["__COLLECTION_TMP__source"]
            });

            if (!opt_subFunc) {
              return this._concatFilter(tree);
            }
          }

          return;
        }

        // Подготовка строки условия:
        // строка вида (a&&(!b)) станет ( a && ( ! b ) )
        filter = Escaper.replace(filter, true).replace(fPartsRgxp, " $1 ").replace(reverseRgxp, "!").split(" ");

        for (var i = filter.length; i--;) {
          if (filter[i] === "") {
            filter.splice(i, 1);
          }
        }
      }

      var length = filter.length;
      var rel = "",
          inverse = false;

      for (var i = -1; ++i < length;) {
        if (open[filter[i]]) {
          inverse = filter[i].charAt(0) === "!";

          if (inverse) {
            filter[i] = filter[i].substring(1);
          }

          var stack = [];
          tree.push(stack);

          var deep = calculateDeepFilter(filter.slice(i + 1), i);
          i = deep.iteration;

          this._compileFilter(deep.result.join(" "), stack, true);

          stack.inverse = inverse;
          stack.logic = rel;
        } else if (!ufilter[filter[i]]) {
          inverse = filter[i].charAt(0) === "!";

          if (inverse) {
            filter[i] = filter[i].substring(1);
          }

          var desc = this._expandFilter(filter[i]),
              fnKey = desc.key;

          if (desc.filter !== true) {
            var stack = void 0;

            if (isString(desc.filter) || desc.filter["__COLLECTION_TMP__source"]) {
              stack = [];
              tree.push(stack);
            }

            this._compileFilter(desc.filter, stack || tree, true, fnKey);
          }

          if (tree.length) {
            var pos = tree.length - 1;
            tree[pos].inverse = inverse;
            tree[pos].logic = rel;
          }
        } else if (logic[filter[i]]) {
          rel = filter[i];
        }
      }

      if (!opt_subFunc) {
        var desc = this._concatFilter(tree);

        // String() враппер, т.к. ругается GCC
        desc.filter = Escaper.paste(String(desc.filter));
        tmpStrFilter[key] = desc;

        return desc;
      }
    };
  })();
}
Collection.prototype["_global"] = root;

var tmpCycle = Collection["_tmpCycle"] = {};

var iStack = Collection.prototype["_iStack"] = [];

/**
 * Перебрать коллекцию,
 * аналог Array.prototype.forEach
 *
 * @param {$$CollectionCallback} callback - функция, которая вызывается
 *     для каждого элемента коллекции прошедшего фильтр (return false сбрасывает операцию)
 *
 * @param {($$CollectionFilter|?$$CollectionIteratorInterface)=} opt_filterOrParams -
 *     1) функция-фильтр;
 *     2) строковое выражение (запись эквивалентна: return + строковое выражение);
 *     3) true (если фильтр отключён).
 *     ИЛИ объект, свойствами которого указаны параметры функции (приставки opt_ отбрасываются)
 *
 * @param {?string=} opt_id - ИД коллекции
 * @param {?boolean=} opt_mult - если false, то после первой успешной итерации цикл прерывается
 *
 * @param {(number|boolean|null)=} [opt_count] - максимальное количество элементов в ответе (по умолчанию весь объект)
 * @param {(number|boolean|null)=} opt_from - количество пропускаемых успешных итераций
 * @param {(number|boolean|null)=} opt_startIndex - начальная позиция поиска
 * @param {(number|boolean|null)=} [opt_endIndex] - конечная позиция поиска (включается)
 *
 * @param {?boolean=} opt_reverse - если true, то обход коллекции идёт с хвоста (спуск)
 * @param {?boolean=} opt_inverseFilter - если true,
 *     то успешной итерацией считается отрицательный результат
 *
 * @param {(boolean|number|null)=} opt_notOwn - если true,
 *     то итерации по объекту идут с учётом свойств прототипа,
 *     a если -1, то только свойства прототипа
 *
 * @param {?boolean=} opt_live - если true, то начальная длина коллекции не кешируется,
 *     т.е. добавленные во время операции элементы будут участвовать в обходе
 *     (только для массивов, массиво-подобных объектов, Map, Set и opt_reverse = false)
 *
 * @param {?string=} [opt_use] - тип используемого цикла внутри итератора: for, for of или for in
 * @param {Object=} [opt_vars] - объект добавляемых переменных в кластер
 *
 * @see Collection.prototype.byLink
 * @param {$$CollectionLink=} [opt_context] - дополнительный контекст
 *
 * @param {?=} [opt_inject] - параметр для передачи в стек исполнения итератора
 * @param {?boolean=} opt_thread - если true, то операция разбивается на части и выполняется отложено,
 *     а сам метод вернёт ссылку на объект-генератор
 *
 * @param {?string=} opt_priority - приоритет отложенной задачи (low, normal, hight, critical)
 * @param {?function(this:Collection, ?)=} [opt_onIterationEnd] - функция обратного вызова на завершение итерации
 * @param {?function(this:Collection, ?)=} [opt_onComplete] - функция обратного вызова на завершение операции
 * @param {?function(this:Collection, ?)=} [opt_onChunk] - функция обратного вызова на
 *     завершение части отложенной операции
 *
 * @param {?boolean=} [opt_generator] - если true, то операция компилируется как генератор
 * @return {(!Collection|!Generator)}
 */
Collection.prototype.forEach = function (callback, opt_filterOrParams, opt_id, opt_mult, opt_count, opt_from, opt_startIndex, opt_endIndex, opt_reverse, opt_inverseFilter, opt_notOwn, opt_live, opt_use, opt_vars, opt_context, opt_inject, opt_thread, opt_priority, opt_onIterationEnd, opt_onComplete, opt_onChunk, opt_generator) {
  var _this15 = this;
  if (isObject(opt_filterOrParams)) {
    /** @type {$$CollectionIteratorInterface} */
    var p = _.any(opt_filterOrParams || {});
    opt_id = _(opt_id, p.id);
    opt_mult = _(opt_mult, p.mult);
    opt_count = _(opt_count, p.count);
    opt_from = _(opt_from, p.from);
    opt_startIndex = _(opt_startIndex, p.startIndex);
    opt_endIndex = _(opt_endIndex, p.endIndex);
    opt_reverse = _(opt_reverse, p.reverse);
    opt_inverseFilter = _(opt_inverseFilter, p.inverseFilter);
    opt_notOwn = _(opt_notOwn, p.notOwn);
    opt_live = _(opt_live, p.live);
    opt_use = _(opt_use, p.use);
    opt_vars = _(opt_vars, p.vars);
    opt_context = _(opt_context, p.context);
    opt_inject = _(opt_inject, p.inject);
    opt_thread = _(opt_thread, p.thread);
    opt_priority = _(opt_priority, p.priority);
    opt_onIterationEnd = _(opt_onIterationEnd, p.onIterationEnd);
    opt_onComplete = _(opt_onComplete, p.onComplete);
    opt_onChunk = _(opt_onChunk, p.onChunk);
    opt_generator = _(opt_generator, p.generator);
    opt_filterOrParams = _.any(p.filter);
  }

  opt_mult = opt_mult !== false;
  opt_count = parseInt(opt_count, 10) >= 0 ? parseInt(opt_count, 10) : false;

  opt_from = parseInt(opt_from, 10) || false;
  opt_startIndex = parseInt(opt_startIndex, 10) || false;

  opt_endIndex = parseInt(opt_endIndex, 10);
  opt_endIndex = isNaN(opt_endIndex) ? false : opt_endIndex;

  opt_reverse = Boolean(opt_reverse);
  opt_inverseFilter = Boolean(opt_inverseFilter);

  opt_notOwn = opt_notOwn || false;
  opt_live = Boolean(opt_live);

  opt_thread = opt_thread || false;
  opt_priority = priority[opt_priority] ? opt_priority : "normal";

  if (opt_notOwn) {
    opt_use = "for in";
  }

  if (opt_vars) {
    this._add("var", opt_vars);
  }

  prepareFn(callback);
  var callbackLength = callback["__COLLECTION_TMP__length"] || callback.length;

  var oldFilter = opt_filterOrParams, objFilter;

  if (opt_filterOrParams != null && !isBoolean(opt_filterOrParams)) {
    if (opt_filterOrParams.call) {
      opt_filterOrParams = this._prepareFilter(opt_filterOrParams);

      // Оптимизация, если есть возможность заинлайнить функцию
      if (opt_filterOrParams.length < filterArgs.length && opt_filterOrParams["__COLLECTION_TMP__source"]) {
        objFilter = { length: opt_filterOrParams.length };
        opt_filterOrParams = opt_filterOrParams["__COLLECTION_TMP__source"].substring(1);
      }
    } else {
      objFilter = this._compileFilter(opt_filterOrParams);
    }
  } else {
    opt_filterOrParams = true;
  }

  var aFilter = this._getActiveParam("filter"), objAFilter;

  // Если установлен активный фильтр,
  // то пытаемся развернуть его,
  // чтобы не делать этого потом в цикле
  if (oldFilter !== true && oldFilter !== "active" && aFilter != null && !isBoolean(aFilter)) {
    if (aFilter.call) {
      aFilter = this._prepareFilter(aFilter);

      // Оптимизация, если есть возможность заинлайнить функцию
      if (aFilter.length < filterArgs.length && aFilter["__COLLECTION_TMP__source"]) {
        objAFilter = { length: opt_filterOrParams.length };
        aFilter = aFilter["__COLLECTION_TMP__source"].substring(1);
      }
    } else {
      objAFilter = this._compileFilter(aFilter);
    }
  } else {
    aFilter = true;
  }

  var rFilter = objFilter && objFilter.filter ? objFilter.filter : opt_filterOrParams;

  var raFilter = objAFilter && objAFilter.filter ? objAFilter.filter : aFilter;

  // Если true, то все фильтры отключены
  var trueFilter = rFilter === true && (raFilter === true || oldFilter === "active");

  var data = this._getOne(opt_context, opt_id);

  if (data === null) {
    return this;
  }

  var type = getType(data, opt_use);

  if (!isObjectInstance(data) || type === "weakMap" || type === "weakSet") {
    throw new TypeError("Incorrect data type");
  }

  if (callbackLength > 3) {
    var length = function (opt_reset) {
      if (!length.value || opt_reset) {
        length.value = _this15.length(oldFilter, opt_id, null, null, null, null, null, opt_inverseFilter, opt_notOwn, null, opt_use, null, opt_context, opt_thread, null, function (val) {
          length.value = val;
        });
      }

      return length.value;
    };
  }

  if (rFilter.length > 3 || raFilter.length > 3) {
    var fLength = function (opt_reset) {
      if (!fLength.value || opt_reset) {
        fLength.value = _this15.length(true, opt_id, null, null, null, null, null, null, opt_notOwn, null, opt_use, null, opt_context, opt_thread, null, function (val) {
          fLength.value = val;
        });
      }

      return fLength.value;
    };
  }

  opt_filterOrParams = rFilter;
  aFilter = raFilter;

  // Если нет фильтров и запрашивается длина,
  // то возвращается свойство length / size (если таковое поддерживается типом данных)
  if (trueFilter && callback["__COLLECTION_TMP__lengthQuery"]) {
    if (type === "array") {
      callback["__COLLECTION_TMP__lengthQuery"] = (opt_startIndex !== false || opt_endIndex !== false ? slice.call(data, opt_startIndex || 0, opt_endIndex !== false ? opt_endIndex + 1 : data.length) : data).length;

      return this;
    } else if ((type === "map" || type === "set") && opt_startIndex === false && opt_endIndex === false) {
      callback["__COLLECTION_TMP__lengthQuery"] = data.size;
      return this;
    }
  }

  var fArgs = [opt_filterOrParams.call ? opt_filterOrParams.length : objFilter ? objFilter.length : null, aFilter.call ? aFilter.length : objAFilter ? objAFilter.length : null];

  var fThis = [opt_filterOrParams["__COLLECTION_TMP__withThis"], aFilter["__COLLECTION_TMP__withThis"]];

  var withYield = isBoolean(opt_generator) ? opt_generator : callback["__COLLECTION_TMP__withYield"];

  if (!withYield) {
    withYield = opt_filterOrParams.call ? opt_filterOrParams["__COLLECTION_TMP__withYield"] : objFilter ? objFilter.withYield : false;

    if (!withYield) {
      withYield = aFilter.call ? aFilter["__COLLECTION_TMP__withYield"] : objAFilter ? objAFilter.withYield : false;
    }
  }

  var fnArgsKey = [STRUCT_OPT, callbackLength, cutNextLine(callback["__COLLECTION_TMP__source"]), callback["__COLLECTION_TMP__withThis"], withYield, opt_thread, callback["__COLLECTION_TMP__withReturn"], trueFilter || [opt_filterOrParams.call ? void 0 : cutNextLine(opt_filterOrParams), aFilter.call ? void 0 : cutNextLine(aFilter)], fArgs, fThis, opt_notOwn, opt_live, opt_inverseFilter, type, opt_reverse, opt_mult, opt_count, opt_from, opt_startIndex, opt_endIndex].join();

  var fn = tmpCycle[fnArgsKey];
  if (!fn) {
    fn = this._compileCycle(fnArgsKey, callbackLength, callback["__COLLECTION_TMP__source"], callback["__COLLECTION_TMP__withThis"], withYield, opt_thread, callback["__COLLECTION_TMP__withReturn"], trueFilter || [opt_filterOrParams, aFilter], fArgs, fThis, opt_notOwn, opt_live, opt_inverseFilter, type, opt_reverse, opt_mult, opt_count, opt_from, opt_startIndex, opt_endIndex);
  }

  var link = {};
  var res = fn.call(this, data, length, fLength, callback, aFilter, opt_filterOrParams, opt_id, opt_inject, link, opt_onIterationEnd, opt_onComplete);

  link.self = res;
  if (link.pause) {
    link.self.pause = true;
  }


  if (opt_thread) {
    var sLength = iStack.length;
    var cursor = void 0,
        pos = 1;

    while (cursor = iStack[sLength - pos]) {
      if (cursor.thread) {
        cursor.thread.children.push(res);
        break;
      }

      pos++;
    }

    this._addToStack(opt_priority, res, opt_onComplete, opt_onChunk);
  }

  if (withYield || opt_thread) {
    return res;
  }


  return this;
};

function returnCache(cache) {
  var text = "";

  for (var key in cache) {
    if (!cache.hasOwnProperty(key)) {
      continue;
    }

    text += cache[key];
  }

  return text;
}

if (IS_BROWSER && JSON_SUPPORT && LOCAL_STORAGE_SUPPORT) {
  try {
    if (document.readyState === "loading") {
      var cache = localStorage.getItem("__COLLECTION_CACHE__"),
          version = localStorage.getItem("__COLLECTION_CACHE_VERSION__");

      if (cache && version == CACHE_VERSION) {
        cache = JSON.parse(cache);
        tmpCycleStr = cache;
        document.write("<script type=\"text/javascript\">" + returnCache(cache) + namespace + "._ready = true;" + "</script>");
      } else {
        localStorage.removeItem("__COLLECTION_CACHE__");
        localStorage.removeItem("__COLLECTION_CACHE_VERSION__");
        Collection["_ready"] = true;
      }
    }
  } catch (ignore) {}
} else if (IS_NODE) {
  try {
    var cache = require(require("path").join(__dirname, "collection.tmp.js"));

    if (cache["version"] === CACHE_VERSION) {
      cache["exec"]();
      tmpCycleStr = cache["cache"];
    }
  } catch (ignore) {} finally {
    Collection["_ready"] = true;
  }
}
var tmpCycleStr = {};

{
  (function () {
    var callbackArgs = ["el", "key", "data", "i", "length", "filter"];

    var qRgxp = /"/g,
        timeout = void 0;

    /**
     * Компилировать цикл по заданным параметрам
     *
     * @private
     * @param {string} key - ключ, под которым цикл будет хранится в кеше
     *
     * @param {number} callbackArgsLength - количество аргументов в функции callback
     * @param {?string} callbackStr - строка для инлайнинга функции
     * @param {boolean} callbackWithThis - если true, то используется this внутри callback
     * @param {boolean} callbackWithYield - если true, то используется yield внутри callback
     * @param {boolean} thread - если true, то операция разбивается на части и выполняется отложено
     * @param {boolean} callbackWithReturn - если true, то используется return внутри callback
     *
     * @param {(!Array|boolean)} filters - массив фильтров:
     *     [0] - заданный фильтр,
     *     [1] - активный фильтр
     *
     * @param {!Array} filterArgsLength - количество аргументов в заданных фильтрах (см. filters)
     * @param {!Array} filterWithThis - использование this в фильтрах (см. filters)
     *
     * @param {(boolean|number)} notOwn - если true,
     *     то итерации по объекту идут с учётом свойств прототипа,
     *     a если -1, то только свойства прототипа
     *
     * @param {boolean} live - если true, то длина коллекции не кешируется
     *     (только для массивов и массиво-подобных объектов)
     *
     * @param {boolean} inverseFilter - если true,
     *     то успешной итерацией считается отрицательный результат
     *
     * @param {string} type - тип данных коллекции:
     *     array - массивы и массиво-подобные объекты,
     *     map - экземпляры Map,
     *     set - экземпляры Set,
     *     iterator - объекты-итераторы или объекты с методом @@iterator,
     *     generator - функции-генераторы
     *
     * @param {boolean} reverse - если true, то обход коллекции идёт с хвоста (спуск)
     * @param {boolean} mult - если false, то после первой успешной итерации цикл прерывается
     *
     * @param {(number|boolean)} count - максимальное количество элементов в ответе (по умолчанию весь объект)
     * @param {(number|boolean)} from - количество пропускаемых успешных итераций
     * @param {(number|boolean)} startIndex - начальная позиция поиска
     * @param {(number|boolean)} endIndex - конечная позиция поиска
     *
     * @return {Function}
     */
    Collection.prototype._compileCycle = function (key, callbackArgsLength, callbackStr, callbackWithThis, callbackWithYield, thread, callbackWithReturn, filters, filterArgsLength, filterWithThis, notOwn, live, inverseFilter, type, reverse, mult, count, from, startIndex, endIndex) {
      var isGenerator = callbackWithYield || thread,
          isMapSet = type === "map" || type === "set";

      var cantModi = isMapSet && STRUCT_OPT || type !== "array" && (type === "object" && (notOwn || !keys) || !reverse && (type !== "object" || !keys || notOwn));

      var iFn = /* cbws */"var that = this;function decl() {var last = that._iStack[that._iStack.length - 1];function empty() {return false;}that.yield =that._global.$cYield = last ?last.yield : empty;that.sleep =that._global.$cSleep = last ?last.sleep : empty;that.next =that._global.$cNext = last ?last.next : empty;that.wait =that._global.$cWait = last ?last.wait : empty;that.onComplete =that._global.$cOnComplete = last ?last.onComplete : empty;that['break'] =that.brk =that._global.$cBreak =that._global.$cBrk = last ?last.breaker : empty;that.modi =that.i =that._global.$cModi =that._global.$cI = last ?last.modi : empty;that.jump =that._global.$cJump = last ?last.jump : empty;that.reset =that._global.$cReset = last ?last.reset : empty;that.$ = last ?last.cache : null;that._ = last ?last.info : null;that.result = last && last.inject;}";

      var pop = /* cbws */"if (" + thread + ") {link.self.result = that.result;}that._iStack.pop();decl();";

      var push = /* cbws */"that._iStack.push(stackObj);decl();";

      iFn += /* cbws */"var wait = 0,onGlobalComplete;var i = -1,j = 0;var n = null,breaker = false;var results = [];var yielder = false,yieldVal;var timeStart,timeEnd,time = 0;var limit = 1,looper = 0;var aLength,f;var TRUE = this.TRUE,FALSE = this.FALSE;var NULL = this.NULL;var el,key;var arr = [],tmp = {};var info = {startIndex: " + startIndex + ",endIndex: " + endIndex + ",from: " + from + ",count: " + count + ",live: " + live + ",reverse: " + reverse + ",notOwn: " + notOwn + ",inverseFilter: " + inverseFilter + ",type: '" + type + "',thread: " + thread + " && link.self,id: id};var stackObj = {cache: tmp,info: info,inject: inject,yield: function (opt_val) {if (" + !isGenerator + ") {return false;}yielder = true;yieldVal = opt_val;return true;},next: function () {if (" + !isGenerator + ") {return false;}link.self.next();return true;},sleep: function (time, opt_test, opt_interval) {if (" + !isGenerator + ") {return false;}stackObj.yield();link.self.sleep = setTimeout(function () {if (opt_test) {" + push + "var test = opt_test.call(that);" + pop + "if (test) {link.self.next();} else if (opt_interval) {stackObj.sleep(time, opt_test, opt_interval);}} else {link.self.next();}}, time);return link.self.sleep;},wait: function (thread, opt_onComplete) {if (!thread || !thread.thread) {if (opt_onComplete) {opt_onComplete.call(that, thread);}results.push(thread);if (!wait) {if (onGlobalComplete) {onGlobalComplete.call(that, results);onGlobalComplete = null;}results = [];}return false;}stackObj.yield();wait++;var onComplete = thread.onComplete;thread.onComplete = function (val) {if (wait) {wait--;}results.push(val);" + push + "if (opt_onComplete) {opt_onComplete.call(that, val);}if (onComplete) {onComplete.call(that, val);}if (!wait) {yielder = false;if (onGlobalComplete) {onGlobalComplete.call(that, results);onGlobalComplete = null;}results = [];" + pop + "if (!yielder) {stackObj.next();}} else {" + pop + "}};return true;},onComplete: function (callback) {if (!wait) {callback.call(that, results);results = [];return false;}onGlobalComplete = callback;return true;},breaker: function () {breaker = true;return true;},jump: function (val) {if (" + cantModi + ") {return false;}n = val - 1;return n;},modi: function (val) {if (" + cantModi + ") {return false;}n += val;return n;},reset: function () {breaker = true;limit++;return true;}};";

      if (thread) {
        iFn += "stackObj.thread = link.self;";
      }

      startIndex = startIndex || 0;
      var enabledActiveFilter = filters[1] && !isBoolean(filters[1]);

      var enabledFilter = filters[0] && !isBoolean(filters[0]);

      /** @type {!Array} */
      var cbArgs = _.any(callbackArgs.slice());
      var maxArgsLength = Math.max(callbackArgsLength, filterArgsLength[0] || 0, filterArgsLength[1] || 0);

      // Замена вызов callee
      // и оптимизация arguments
      cbArgs[cbArgs.length - 1] = "callback";
      cbArgs = cbArgs.slice(0, callbackArgsLength);

      if (from) {
        iFn += "var from = " + from + ";";
      }

      var threadStart = "",
          threadEnd = "";

      if (thread) {
        threadStart = /* cbws */"if (timeStart == null) {" + push + "timeStart = new Date().valueOf();}";

        threadEnd = /* cbws */"timeEnd = new Date().valueOf();time += timeEnd - timeStart;timeStart = timeEnd;if (time > this._priority[link.self.priority]) {" + pop + "yield n;time = 0;timeStart = null;}";
      } else {
        iFn += push;
      }

      iFn += "while (limit !== looper) {";

      switch (type) {
        case "array":
          iFn += /* cbws */"var cloneObj,dLength = data.length - 1;cloneObj = data;";

          if (reverse) {
            iFn += "cloneObj = arr.slice.call(cloneObj).reverse();";
          }

          if ((reverse || !live) && (startIndex || endIndex !== false)) {
            iFn += /* cbws */"cloneObj = arr.slice.call(cloneObj, " + startIndex + ", " + (endIndex !== false ? endIndex + 1 : "data.length") + ");";
          }

          if (!reverse && live) {
            iFn += "for (n = " + (startIndex - 1) + "; ++n < cloneObj.length;) {";

            if (startIndex) {
              iFn += /* cbws */"if (n < " + startIndex + ") {continue;}";
            }

            if (endIndex !== false) {
              iFn += /* cbws */"if (n > " + endIndex + ") {break;};";
            }
          } else {
            iFn += /* cbws */"aLength = cloneObj.length;for (n = -1; ++n < aLength;) {";
          }

          if (maxArgsLength) {
            if (maxArgsLength > 1) {
              if (startIndex) {
                // Индекс элемента,
                // т.к. значение i может не совпадать (если указан startIndex)
                iFn += "key = " + (reverse ? "dLength - (" : "") + " n + " + (startIndex + (reverse ? ")" : "")) + ";";
              } else {
                iFn += "key = " + (reverse ? "dLength - " : "") + " n;";
              }
            }

            iFn += "el = cloneObj[n];";

            if (maxArgsLength > 3) {
              iFn += "i = n + " + startIndex + ";";
            }
          }

          break;

        case "object":
          if (reverse || keys && !notOwn) {
            iFn += "var tmpArray;";

            if (!notOwn && keys && !thread) {
              iFn += "tmpArray = this._keys(data);";
            } else {
              iFn += "tmpArray = [];";

              if (notOwn) {
                if (notOwn === -1) {
                  iFn += /* cbws */"for (var key in data) {" + threadStart + "if (data.hasOwnProperty(key)) {continue;}tmpArray.push(key);" + threadEnd + "}";
                } else {
                  iFn += /* cbws */"for (var key in data) {" + threadStart + "tmpArray.push(key);" + threadEnd + "}";
                }
              } else {
                iFn += /* cbws */"for (var key in data) {" + threadStart + "if (!data.hasOwnProperty(key)) {continue;}tmpArray.push(key);" + threadEnd + "}";
              }
            }

            if (reverse) {
              iFn += "tmpArray.reverse();";
            }

            if (startIndex || endIndex !== false) {
              iFn += /* cbws */"tmpArray = tmpArray.slice(" + startIndex + "," + (endIndex !== false ? endIndex + 1 : "tmpArray.length") + ");";
            }

            iFn += /* cbws */"aLength = tmpArray.length;for (n = -1; ++n < aLength;) {key = tmpArray[n];if (key in data === false) {continue;}" + (maxArgsLength > 3 ? "i = n + " + startIndex + ";" : "") + "";
          } else {
            iFn += /* cbws */"for (key in data) {" + (notOwn === false ? "if (!data.hasOwnProperty(key)) {continue;}" : notOwn === -1 ? "if (data.hasOwnProperty(key)) {continue;}" : "") + "" + (maxArgsLength > 3 || startIndex || endIndex !== false ? "i++" : "") + ";";

            if (startIndex) {
              iFn += /* cbws */"if (i < " + startIndex + ") {continue;}";
            }

            if (endIndex !== false) {
              iFn += /* cbws */"if (i > " + endIndex + ") {break;};";
            }
          }

          if (maxArgsLength) {
            iFn += "el = data[key];";
          }

          break;

        case "map":
        case "set":
        case "generator":
        case "iterator":
          if (isMapSet && STRUCT_OPT) {
            iFn += /* cbws */"var tmpArray = data._keys,skip = 0;";

            if (!live && !reverse) {
              iFn += "var size = data.size;";
            }

            if (!live) {
              iFn += "tmpArray = tmpArray.slice();";
            }

            if (reverse) {
              if (live) {
                iFn += "tmpArray = tmpArray.slice().reverse();";
              } else {
                iFn += "tmpArray.reverse();";
              }
            }

            iFn += /* cbws */"aLength = tmpArray.length;for (n = " + (startIndex - 1) + "; ++n < " + (!reverse && live ? "tmpArray.length" : "aLength") + ";) {key = tmpArray[n];if (key === NULL) {skip++;continue;}i = n - skip;";

            if (startIndex) {
              iFn += /* cbws */"if (i < " + startIndex + ") {continue;}";
            }

            if (endIndex !== false) {
              iFn += /* cbws */"if (i > " + endIndex + ") {break;};";
            }
          } else {
            (function () {
              var gen = function () {
                if (isMapSet) {
                  iFn += "var cursor = data.keys();";

                  if (!live && !reverse) {
                    iFn += "var size = data.size;";
                  }
                } else if (type === "generator") {
                  iFn += "var cursor = data();";
                } else {
                  iFn += /* cbws */"var iteratorKey = typeof Symbol !== 'undefined' && Symbol['iterator'],cursor;if ('next' in data) {cursor = data;} else {cursor = data[\"@@iterator\"] ?data[\"@@iterator\"]() : iteratorKey ? data[iteratorKey]() || data : data;}";
                }
              };

              if (reverse) {
                gen();
                iFn += /* cbws */"var tmpArray = [];for (var step = cursor.next(); !step.done; step = cursor.next()) {" + threadStart + "tmpArray.push(step.value);" + threadEnd + "}tmpArray.reverse();var size = tmpArray.length;";

                if (startIndex || endIndex !== false) {
                  iFn += /* cbws */"tmpArray = tmpArray.slice(" + startIndex + "," + (endIndex !== false ? endIndex + 1 : "tmpArray.length") + ");";
                }

                iFn += /* cbws */"aLength = tmpArray.length;for (n = -1; ++n < aLength;) {" + (maxArgsLength ? "key = tmpArray[n];" : "") + "i = n + " + startIndex + ";";
              } else {
                gen();

                iFn += /* cbws */"for (key = cursor.next(); !key.done; key = cursor.next()) {" + (maxArgsLength ? "key = key.value;" : "") + "i++;";

                if (startIndex) {
                  iFn += /* cbws */"if (i < " + startIndex + ") {continue;}";
                }

                if (endIndex !== false) {
                  iFn += /* cbws */"if (i > " + endIndex + ") {break;};";
                }
              }
            })();
          }

          if (maxArgsLength) {
            if (type === "map") {
              iFn += "el = data.get(key);";
            } else {
              iFn += "el = key;";

              if (maxArgsLength > 1) {
                if (type === "set") {
                  iFn += "key = null;";
                } else if (reverse) {
                  iFn += "key = size - i - 1;";
                } else {
                  iFn += "key = i;";
                }
              }
            }
          }

          break;
      }

      iFn += threadStart;

      if (count) {
        iFn += /* cbws */"if (j === " + count + ") {break;}";
      }

      if (enabledActiveFilter || enabledFilter) {
        iFn += "if (";

        // Активный фильтр
        if (filters[1].call) {
          var args = filterArgs.slice(0, filterArgsLength[1]);
          filterArgs[filterArgs.length - 1] = "aFilter";

          if (enabledFilter) {
            iFn += "(";
          }

          if (inverseFilter) {
            iFn += "!";
          }

          iFn += "aFilter" + (filterWithThis[1] ? ".call(this" : "(");

          if (filterWithThis[1] && args.length) {
            iFn += ",";
          }

          iFn += args + ")";

          if (enabledFilter) {
            iFn += ") && ";
          }
        } else if (enabledActiveFilter) {
          if (enabledFilter) {
            iFn += inverseFilter ? "!(" : "(";
          } else if (inverseFilter) {
            iFn += "!(";
          }

          iFn += filters[1];

          if (enabledFilter) {
            iFn += ") && ";
          } else if (inverseFilter) {
            iFn += ")";
          }
        }

        // Заданный фильтр
        if (filters[0].call) {
          var args = filterArgs.slice(0, filterArgsLength[0]);
          filterArgs[filterArgs.length - 1] = "filter";

          if (enabledActiveFilter) {
            iFn += "(";
          }

          if (inverseFilter) {
            iFn += "!";
          }

          iFn += "filter" + (filterWithThis[0] ? ".call(this" : "(");

          if (filterWithThis[0] && args.length) {
            iFn += ",";
          }

          iFn += args + ")";

          if (enabledActiveFilter) {
            iFn += ")";
          }
        } else if (enabledFilter) {
          if (enabledActiveFilter) {
            iFn += inverseFilter ? "!(" : "(";
          } else if (inverseFilter) {
            iFn += "!(";
          }

          iFn += filters[0];

          if (enabledActiveFilter || inverseFilter) {
            iFn += ")";
          }
        }

        iFn += ") {";
      }

      var tmp = "";

      if (!mult) {
        tmp += "callback";

        tmp += callbackWithThis ? ".call(this" : "(";

        tmp += callbackWithThis && cbArgs.length ? "," : "";

        tmp += cbArgs;
        tmp += "); breaker = true;";
      } else {
        if (callbackWithReturn) {
          tmp += "if (callback";

          tmp += callbackWithThis ? ".call(this" : "(";

          if (callbackWithThis && cbArgs.length) {
            tmp += ",";
          }

          tmp += cbArgs;
          tmp += ") === false) { breaker = true; }";
        } else {
          if (callbackStr) {
            tmp += callbackStr;
          } else {
            tmp += "callback";

            tmp += callbackWithThis ? ".call(this" : "(";

            if (callbackWithThis && cbArgs.length) {
              tmp += ",";
            }

            tmp += cbArgs;
            tmp += ");";
          }
        }
      }

      if (count) {
        tmp += "j++;";
      }

      if (from) {
        iFn += /* cbws */"if (from !== 0) {from--;} else {" + tmp + "}";
      } else {
        iFn += tmp;
      }

      if (enabledActiveFilter || enabledFilter) {
        iFn += "}";
      }

      var yielder = /* cbws */"if (yielder) {" + pop + "yielder = false;if (link.self) {link.self.pause = true;} else {link.pause = true;}yield yieldVal;link.self.pause = false;delete link.pause;yieldVal = void 0;" + push + "}";

      if (isGenerator) {
        iFn += yielder;
      }

      if (!live && !reverse && isMapSet) {
        iFn += /* cbws */"size--;if (!size) {break;}";
      }

      iFn += /* cbws */"if (breaker) {break;}" + threadEnd + "}breaker = false;looper++;if (onIterationEnd) {onIterationEnd.call(this, this.result);}";

      if (isGenerator) {
        iFn += yielder;
      }

      iFn += /* cbws */"}var final = this.result;" + pop + "if (onComplete) {onComplete.call(this, final);}return final;";

      if (isGenerator) {
        tmpCycle[key] = eval( /* cbws */"(function *(data,length,fLength,callback,afilter,filter,id,inject,link,onIterationEnd,onComplete) { " + iFn + " })");
      } else {
        tmpCycle[key] = new Function("data", "length", "fLength", "callback", "aFilter", "filter", "id", "inject", "link", "onIterationEnd", "onComplete", iFn);
      }

      if (Collection["_ready"]) {
        (function () {
          var text = /* cbws */"" + namespace + "._tmpCycle[\"" + key.replace(qRgxp, "\\\"") + "\"] = " + tmpCycle[key].toString() + ";";

          tmpCycleStr[key] = text;
          if (IS_BROWSER && LOCAL_STORAGE_SUPPORT) {
            clearTimeout(timeout);
            timeout = setTimeout(function () {
              try {
                localStorage.setItem("__COLLECTION_CACHE__", JSON.stringify(tmpCycleStr));
                localStorage.setItem("__COLLECTION_CACHE_VERSION__", CACHE_VERSION);

                if (BLOB_SUPPORT) {
                  var code = new Blob([text], {
                    type: "application/javascript"
                  });

                  var script = document.createElement("script");
                  script.src = URL.createObjectURL(code);
                  document.head.appendChild(script);
                }
              } catch (ignore) {}
            }, 15);
          } else if (IS_NODE) {
            clearTimeout(timeout);
            timeout = setTimeout(function () {
              require("fs").writeFile(require("path").join(__dirname, "collection.tmp.js"), "\n\t\t\t\t\t\t\texports.version = " + CACHE_VERSION + ";\n\t\t\t\t\t\t\texports.cache = " + JSON.stringify(tmpCycleStr) + ";\n\t\t\t\t\t\t\texports.exec = function () {\n\t\t\t\t\t\t\t\t" + returnCache(tmpCycleStr) + "\n\t\t\t\t\t\t\t};\n\t\t\t\t\t\t", function () {});
            }, 15);
          }
        })();
      }

      return tmpCycle[key];
    };
  })();
}
/**
 * Кластер для мемоизации внутри итератора
 * @type {Object}
 */
Collection.prototype.$ = null;

/**
 * Кластер для параметров итератора
 * @type {Object}
 */
Collection.prototype._ = null;

/**
 * Ссылка на значение операции итератора
 * @type {?}
 */
Collection.prototype.result = void 0;

/**
 * Константа для сброса фильтра
 * (если фильтр возвращает это значение,
 * то оно всегда трактуется как true)
 * @type {!Object}
 */
Collection.prototype.TRUE = {};
root.$cTRUE = Collection.prototype.TRUE;

/**
 * Константа для сброса фильтра
 * (если фильтр возвращает это значение,
 * то оно всегда трактуется как false)
 * @type {!Object}
 */
Collection.prototype.FALSE = {};
root.$cFALSE = Collection.prototype.FALSE;

/**
 * Приостановить текущую итерационную операцию
 * (применяется после выполнения callback)
 *
 * @abstract
 * @params {?=} [opt_val] - значение для yield
 * @return {boolean}
 */
Collection.prototype.yield = function (opt_val) {
  return false;
};

/**
 * На время приостановить текущую итерационную операцию
 * (применяется после выполнения callback)
 *
 * @abstract
 * @params {number} time - время в мс
 * @params {?function(this:Collection): ?=} [opt_test] - функция проверки, если вернёт true,
 *     то операция "проснётся"
 *
 * @params {?boolean} [opt_interval=false] - если true и opt_test вернул false,
 *     то операция будет повторятся (с интервалом time) до тех пор, пока opt_test не вернёт true
 *
 * @return {(number|!Object|boolean)}
 */
Collection.prototype.sleep = function (time, opt_test, opt_interval) {
  return false;
};

/**
 * Продолжить выполнение текущей операции
 *
 * @abstract
 * @return {boolean}
 */
Collection.prototype.next = function () {
  return false;
};

/**
 * Приостановить текущую итерационную операцию до тех пор,
 * пока не выполнится заданный поток (применяется после выполнения callback).
 *
 * Если методу передать не поток, то будет немедленно вызван обработчик (если он есть)
 * и в качестве параметра будет передано само значение,
 * также значение будет добавлено в массив результатов для onComplete.
 *
 * @abstract
 * @params {(Generator|?)} thread - поток Collection или любое другое значение
 * @params {?function(this:Collection, ?)=} [opt_onComplete] - функция обратного вызова
 * @return {boolean}
 */
Collection.prototype.wait = function (thread, opt_onComplete) {
  return false;
};

/**
 * Выполнить заданную функцию после того,
 * как выполнятся все потоки в wait
 *
 * @abstract
 * @params {function(this:Collection, !Array)} callback - функция обратного вызова
 * @return {boolean}
 */
Collection.prototype.onComplete = function (callback) {
  return false;
};

/**
 * Сбросить текущую итерационную операцию
 * (применяется после выполнения callback)
 *
 * @abstract
 * @return {boolean}
 */
Collection.prototype.break = function () {
  return false;
};

/**
 * @see Collection.prototype.break
 * @return {boolean}
 */
Collection.prototype.brk = Collection.prototype.break;

/**
 * Перейти со следующей итерации к заданному итерационному индексу
 * (только для массивов, массиво-подобных объектов, реверсивных операций и
 * для перебора объектов без родительских свойств (только если поддерживается нативный Object.create))
 *
 * @abstract
 * @param {number} iteration - номер итерации для перехода
 * @return {(number|boolean)}
 */
Collection.prototype.jump = function (iteration) {
  return false;
};

/**
 * Перейти со следующей итерации к модифицированному итерационному индексу:
 * указанное значение плюсуется с текущим индексом
 * (только для массивов, массиво-подобных объектов, реверсивных операций и
 * для перебора объектов без родительских свойств (только если поддерживается нативный Object.create))
 *
 * @abstract
 * @param {number} val - значение-модификатор
 * @return {(number|boolean)}
 */
Collection.prototype.modi = function (val) {
  return false;
};

/**
 * @see Collection.prototype.modi
 * @param {number} val
 * @return {(number|boolean)}
 */
Collection.prototype.i = Collection.prototype.modi;

/**
 * Сбросить текущие выполнение итератора
 * и начать операцию заново
 *
 * @abstract
 * @return {boolean}
 */
Collection.prototype.reset = function () {
  return false;
};

/**
 * @private
 * @param {?} val
 * @param {?} chain
 * @return {?}
 */
Collection.prototype._chain = function (val, chain) {
  if (chain) {
    this._new("collection", val);
    return this;
  }

  return val;
};
var maxPriority = 40;
var priority = {
  "low": maxPriority / 8,
  "normal": maxPriority / 4,
  "hight": maxPriority / 2,
  "critical": maxPriority
};

/**
 * Удалить элемент/ы из коллекции по заданному условию или указателю
 *
 * @param {($$CollectionFilter|$$CollectionLink|?$$CollectionIteratorInterface)=} opt_filterOrParams -
 *     1) функция-фильтр;
 *     2) строковое выражение (запись эквивалентна: return + строковое выражение);
 *     3) true (если фильтр отключён);
 *     4) указатель (перегрузка).
 *     ИЛИ объект, свойствами которого указаны параметры функции (приставки opt_ отбрасываются)
 *
 * @param {?string=} opt_id - ИД коллекции
 * @param {?boolean=} opt_mult - если false, то после первой успешной итерации цикл прерывается
 *
 * @param {?number=} [opt_count] - максимальное количество удалений (по умолчанию весь объект)
 * @param {?number=} opt_from - количество пропускаемых успешных итераций
 * @param {?number=} opt_startIndex - начальная позиция поиска
 * @param {?number=} [opt_endIndex] - конечная позиция поиска (включается)
 *
 * @param {?boolean=} opt_reverse - если true, то обход коллекции идёт с хвоста (спуск)
 * @param {?boolean=} opt_inverseFilter - если true,
 *     то успешной итерацией считается отрицательный результат
 *
 * @param {(boolean|number|null)=} opt_notOwn - если true,
 *     то итерации по объекту идут с учётом свойств прототипа,
 *     a если -1, то только свойства прототипа
 *
 * @param {?boolean=} opt_live - если true, то начальная длина коллекции не кешируется,
 *     т.е. добавленные во время операции элементы будут участвовать в обходе
 *     (только для массивов, массиво-подобных объектов, Map, Set и opt_reverse = false)
 *
 * @param {?string=} [opt_use] - тип используемого цикла: for или for in
 * @param {Object=} [opt_vars] - объект добавляемых переменных в кластер
 *
 * @see Collection.prototype.byLink
 * @param {$$CollectionLink=} [opt_context] - дополнительный контекст
 *
 * @param {?boolean=} opt_chain - если true, то метод установит полученную коллекцию активной
 *     и вернёт ссылку на экземпляр Collection (только в случае синхронной операции)
 *
 * @param {?boolean=} opt_thread - если true, то операция разбивается на части и выполняется отложено,
 *     а сам метод вернёт ссылку на объект-генератор
 *
 * @param {?string=} opt_priority - приоритет отложенной задачи (low, normal, hight, critical)
 * @param {?function(this:Collection, ?)=} [opt_onIterationEnd] - функция обратного вызова на завершение итерации
 * @param {?function(this:Collection, ?)=} [opt_onComplete] - функция обратного вызова на завершение операции
 * @param {?function(this:Collection, ?)=} [opt_onChunk] - функция обратного вызова на
 *     завершение части отложенной операции
 *
 * @param {?boolean=} [opt_generator] - если true, то операция компилируется как генератор
 * @return {(!Collection|!Generator|!Array|{result: boolean, key, value})}
 */
Collection.prototype.remove = function (opt_filterOrParams, opt_id, opt_mult, opt_count, opt_from, opt_startIndex, opt_endIndex, opt_reverse, opt_inverseFilter, opt_notOwn, opt_live, opt_use, opt_vars, opt_context, opt_chain, opt_thread, opt_priority, opt_onIterationEnd, opt_onComplete, opt_onChunk, opt_generator) {
  var old = opt_filterOrParams;

  if (isObject(opt_filterOrParams)) {
    /** @type {$$CollectionIteratorInterface} */
    var p = _.any(opt_filterOrParams || {});
    opt_id = _(opt_id, p.id);
    opt_mult = _(opt_mult, p.mult);
    opt_reverse = _(opt_reverse, p.reverse);
    opt_live = _(opt_live, p.live);
    opt_context = _(opt_context, p.context);
    opt_chain = _(opt_chain, p.chain);
    opt_onComplete = _(opt_onComplete, p.onComplete);
    opt_filterOrParams = _.any(p.filter);
  }

  if (opt_filterOrParams != null && !isFunction(opt_filterOrParams) && (isString(opt_filterOrParams) && !this._isFilter(opt_filterOrParams) || isArray(opt_filterOrParams) || isNumber(opt_filterOrParams) || isLink(opt_filterOrParams))) {
    var tmp = this._chain(this._removeOne(this._joinContexts(opt_context, opt_filterOrParams), opt_id), opt_chain);

    if (opt_onComplete) {
      opt_onComplete.call(this, tmp);
    }

    return tmp;
  }

  var data = this._getOne(opt_context, opt_id),
      type = getType(data, opt_use);

  if (type === "iterator" || type === "generator") {
    throw new TypeError("Incorrect data type");
  }

  var action, res = [];

  switch (type) {
    case "map":
      action = function (el, key, data) {
        data.delete(key);

        res.push({
          result: !data.has(key),
          key: key,
          value: el
        });
      };

      break;

    case "set":
      action = function (el, key, data) {
        data.delete(el);

        res.push({
          result: !data.has(el),
          key: null,
          value: el
        });
      };

      break;

    case "array":
      if (opt_reverse) {
        action = function (el, key, data) {
          splice.call(data, key, 1);

          res.push({
            result: data[key] !== el,
            key: key,
            value: el
          });
        };
      } else {
        (function () {
          var rm = 0;

          if (opt_live) {
            action = function (el, key, data) {
              splice.call(data, key, 1);
              this.modi(-1);

              res.push({
                result: data[key] !== el,
                key: key + rm,
                value: el
              });

              rm++;
            };
          } else {
            action = function (el, key, data, i, length) {
              var _this16 = this;
              var ln = length();
              var fn = function (length) {
                if (rm === length) {
                  return false;
                }

                splice.call(data, key, 1);
                _this16.i(-1);

                res.push({
                  result: data[key] !== el,
                  key: key + rm,
                  value: el
                });

                rm++;
              };

              if (isNumber(ln)) {
                fn(ln);
              } else {
                this.wait(ln, fn);
              }
            };
          }
        })();
      }

      break;

    default:
      action = function (el, key, data) {
        delete data[key];

        res.push({
          result: key in data === false,
          key: key,
          value: el
        });
      };
  }

  var returnVal = this.forEach(action, old, opt_id, opt_mult, opt_count, opt_from, opt_startIndex, opt_endIndex, opt_reverse, opt_inverseFilter, opt_notOwn, opt_live, opt_use, opt_vars, opt_context, res, opt_thread, opt_priority, opt_onIterationEnd, function () {
    if (opt_mult === false) {
      if (0 in res) {
        res = res[0];
      } else {
        res = {
          result: false,
          key: type === "set" ? null : void 0,

          value: void 0
        };
      }
    }

    this._chain(res, opt_chain);

    if (opt_onComplete) {
      opt_onComplete.call(this, res);
    }
  }, opt_onChunk, opt_generator);

  if (returnVal !== this) {
    return returnVal;
  }

  return opt_chain ? this : res;
};

{
  (function () {
    var intervals = [[0, 40], [41, 160], [161, 500], [501, 2000]];

    /** @private */
    Collection.prototype["_priority"] = priority;
    var lastPos = {};

    $C(priority).forEach(function (el, key) {
      lastPos[key] = 0;
    });

    var execStack = {},
        exec = 0;

    $C(priority).forEach(function (el, key) {
      execStack[key] = [];
    });

    /**
     * Вернуть план работы для текущей итерации событийного цикла
     * @return {!Object}
     */
    function getTasks() {
      var tasks = {},
          total = 0,
          count = 0;

      var exec = $C.extend(false, {}, execStack);
      var tmp = {},
          mods = {};

      $C(exec).forEach(function (el, key) {
        tmp[key] = $C(el).map(function (el, key) {
          return key;
        });
        mods[key] = 0;
        count++;
      }, function (el) {
        return el.length;
      });

      _loop2: while (total <= maxPriority) {
        var _ret15 = (function () {
          var rands = [];

          $C(exec).forEach(function (el, key) {
            rands.push({
              key: key,
              value: priority[key]
            });
          }, function (el) {
            return el.length;
          });

          $C(rands).sort({
            field: "value",
            reverse: true
          });

          var pos = rands.length - 1,
              max = 0;

          $C(rands).forEach(function (el, i) {
            var interval = intervals[pos];

            if (interval[1] > max) {
              max = interval[1];
            }

            rands[i].value = interval;
            pos--;
          });

          var rand = getRandomInt(0, max);

          $C(rands).forEach(function (el) {
            var key = el.key,
                val = el.value,
                arr = tmp[key];

            if (rand >= val[0] && rand <= val[1]) {
              tasks[key] = tasks[key] || [];
              var _pos = lastPos[key];

              if (arr[_pos] == null) {
                lastPos[key] = _pos = 0;
                mods[key] = 0;
              }

              if (!exec[key][arr[_pos]].pause) {
                mods[key]++;
                tasks[key].push(arr[_pos]);
                total += priority[key];
              }

              arr.splice(_pos, 1);
              if (!arr.length) {
                delete exec[key];
                count--;
              }

              return false;
            }
          });

          if (!count) {
            return "break";
          }
        })();

        if (_ret15 === "break") break _loop2;
      }


      $C(mods).forEach(function (el, key) {
        lastPos[key] += el;
      });

      return tasks;
    }

    /**
     * Добавить задачу в стек исполнения
     *
     * @private
     * @param {string} priority - приоритет задачи
     * @param {!Generator} obj - объект-генератор
     * @param {?function(this:Collection, ?)} [opt_onComplete] - функция обратного вызова на
     *     завершение отложенной операции
     *
     * @param {?function(this:Collection, ?)} [opt_onChunk] - функция обратного вызова на
     *     завершение части отложенной операции
     */
    Collection.prototype._addToStack = function (priority, obj, opt_onComplete, opt_onChunk) {
      obj.thread = true;
      obj.priority = priority;

      obj.destroy = function () {
        return Collection.destroy(obj);
      };

      obj.onComplete = opt_onComplete;
      obj.onChunk = opt_onChunk;

      obj.pause = false;
      obj.sleep = null;
      obj.children = [];

      var next = obj.next;

      // В strictMode в Chrome (баг?) данный метод нельзя установить через obj.next =
      Object.defineProperty(obj, "next", {
        value: function value() {
          if (obj.sleep !== null) {
            clearTimeout(obj.sleep);
            obj.sleep = null;
          }

          return next.apply(this, arguments);
        }
      });

      exec++;
      execStack[priority].push(obj);

      var that = this;
      function loop() {
        $C(getTasks()).forEach(function (el, key) {
          var prop = execStack[key];

          $C(el).forEach(function (el, i, data) {
            var obj = prop[el],
                res = obj.next();

            if (res.done) {
              prop.splice(el, 1);

              $C(data).forEach(function (el, i) {
                if (el) {
                  data[i]--;
                }
              }, { startIndex: i + 1 });

              exec--;

              if (obj.onComplete && obj.onComplete !== opt_onComplete) {
                obj.onComplete.call(that, obj.result);
              }
            } else if (obj.onChunk) {
              obj.onChunk.call(that, obj.result);
            }
          });
        }, { str: true });

        if (exec) {
          setTimeout(loop, maxPriority);
        }
      }

      if (exec === 1) {
        if (isNotUndef(typeof setImmediate)) {
          setImmediate(loop);
        } else {
          setTimeout(loop, 0);
        }
      }
    };

    /**
     * Уничтожить заданный поток Collection
     * (если методу передать не поток, то он просто вернёт false)
     *
     * @param {(Generator|?)} obj - поток Collection или любое другое значение
     * @return {boolean}
     */
    Collection.destroy = function (obj) {
      if (!obj || !obj.thread) {
        return false;
      }

      clearTimeout(obj.sleep);
      $C(obj.children).forEach(function (child) {
        Collection.destroy(child);
      });

      $C(execStack[obj.priority]).remove({
        filter: function (el) {
          return el === obj;
        },
        mult: false
      });

      return true;
    };
  })();
}

/**
 * Вернуть количество элементов в коллекции по заданному условию
 *
 * @param {($$CollectionFilter|?$$CollectionIteratorInterface)=} opt_filterOrParams -
 *     1) функция-фильтр;
 *     2) строковое выражение (запись эквивалентна: return + строковое выражение);
 *     3) true (если фильтр отключён).
 *     ИЛИ объект, свойствами которого указаны параметры функции (приставки opt_ отбрасываются)
 *
 * @param {?string=} opt_id - ИД коллекции
 * @param {?number=} [opt_count] - максимальное количество элементов в ответе (по умолчанию весь объект)
 * @param {?number=} opt_from - количество пропускаемых успешных итераций
 * @param {?number=} opt_startIndex - начальная позиция поиска
 * @param {?number=} [opt_endIndex] - конечная позиция поиска (включается)
 *
 * @param {?boolean=} opt_reverse - если true, то обход коллекции идёт с хвоста (спуск)
 * @param {?boolean=} opt_inverseFilter - если true,
 *     то успешной итерацией считается отрицательный результат
 *
 * @param {(boolean|number|null)=} opt_notOwn - если true,
 *     то итерации по объекту идут с учётом свойств прототипа,
 *     a если -1, то только свойства прототипа
 *
 * @param {?boolean=} opt_live - если true, то начальная длина коллекции не кешируется,
 *     т.е. добавленные во время операции элементы будут участвовать в обходе
 *     (только для массивов, массиво-подобных объектов, Map, Set и opt_reverse = false)
 *
 * @param {?string=} [opt_use] - тип используемого цикла внутри итератора: for, for of или for in
 * @param {Object=} [opt_vars] - объект добавляемых переменных в кластер
 *
 * @see Collection.prototype.byLink
 * @param {$$CollectionLink=} [opt_context] - дополнительный контекст
 *
 * @param {?boolean=} opt_thread - если true, то операция разбивается на части и выполняется отложено,
 *     а сам метод вернёт ссылку на объект-генератор
 *
 * @param {?string=} opt_priority - приоритет отложенной задачи (low, normal, hight, critical)
 * @param {?function(this:Collection, ?)=} [opt_onIterationEnd] - функция обратного вызова на завершение итерации
 * @param {?function(this:Collection, ?)=} [opt_onComplete] - функция обратного вызова на завершение операции
 * @param {?function(this:Collection, ?)=} [opt_onChunk] - функция обратного вызова на
 *     завершение части отложенной операции
 *
 * @param {?boolean=} [opt_generator] - если true, то операция компилируется как генератор
 * @return {(!Generator|number)}
 */
Collection.prototype.length = function (opt_filterOrParams, opt_id, opt_count, opt_from, opt_startIndex, opt_endIndex, opt_reverse, opt_inverseFilter, opt_notOwn, opt_live, opt_use, opt_vars, opt_context, opt_thread, opt_priority, opt_onIterationEnd, opt_onComplete, opt_onChunk, opt_generator) {
  var _this17 = this;
  if (isObject(opt_filterOrParams)) {
    /** @type {$$CollectionIteratorInterface} */
    var p = _.any(opt_filterOrParams || {});
    opt_onComplete = _(opt_onComplete, p.onComplete);
  }

  var length = 0;
  var calc = function () {
    length++;
    _this17.result = length;
  };

  // Запрос на возврат длины
  // (чтобы не делать лишних итераций)
  calc["__COLLECTION_TMP__lengthQuery"] = true;

  /** @type {?} */
  var returnVal = this.forEach(calc, opt_filterOrParams, opt_id, true, opt_count, opt_from, opt_startIndex, opt_endIndex, opt_reverse, opt_inverseFilter, opt_notOwn, opt_live, opt_use, opt_vars, opt_context, length, opt_thread, opt_priority, opt_onIterationEnd, opt_onComplete, opt_onChunk, opt_generator);

  if (calc["__COLLECTION_TMP__lengthQuery"] !== true) {
    this.result = length = calc["__COLLECTION_TMP__lengthQuery"];

    if (opt_onComplete) {
      opt_onComplete.call(this, length);
    }
  }

  if (returnVal !== this) {
    return returnVal;
  }

  return length;
};

/**
 * Вернуть true, если есть хотя бы один элемент коллекции, который подходит под заданное условие,
 * аналог Array.prototype.some
 *
 * @param {($$CollectionFilter|?$$CollectionIteratorInterface)=} opt_filterOrParams -
 *     1) функция-фильтр;
 *     2) строковое выражение (запись эквивалентна: return + строковое выражение);
 *     3) true (если фильтр отключён).
 *     ИЛИ объект, свойствами которого указаны параметры функции (приставки opt_ отбрасываются)
 *
 * @param {?string=} opt_id - ИД коллекции
 * @param {?number=} opt_from - количество пропускаемых успешных итераций
 * @param {?number=} opt_startIndex - начальная позиция поиска
 * @param {?number=} [opt_endIndex] - конечная позиция поиска (включается)
 *
 * @param {?boolean=} opt_reverse - если true, то обход коллекции идёт с хвоста (спуск)
 * @param {?boolean=} opt_inverseFilter - если true,
 *     то успешной итерацией считается отрицательный результат
 *
 * @param {(boolean|number|null)=} opt_notOwn - если true,
 *     то итерации по объекту идут с учётом свойств прототипа,
 *     a если -1, то только свойства прототипа
 *
 * @param {?boolean=} opt_live - если true, то начальная длина коллекции не кешируется,
 *     т.е. добавленные во время операции элементы будут участвовать в обходе
 *     (только для массивов, массиво-подобных объектов, Map, Set и opt_reverse = false)
 *
 * @param {?string=} [opt_use] - тип используемого цикла внутри итератора: for, for of или for in
 * @param {Object=} [opt_vars] - объект добавляемых переменных в кластер
 *
 * @see Collection.prototype.byLink
 * @param {$$CollectionLink=} [opt_context] - дополнительный контекст
 *
 * @param {?boolean=} opt_thread - если true, то операция разбивается на части и выполняется отложено,
 *     а сам метод вернёт ссылку на объект-генератор
 *
 * @param {?string=} opt_priority - приоритет отложенной задачи (low, normal, hight, critical)
 * @param {?function(this:Collection, ?)=} [opt_onIterationEnd] - функция обратного вызова на завершение итерации
 * @param {?function(this:Collection, ?)=} [opt_onComplete] - функция обратного вызова на завершение операции
 * @param {?function(this:Collection, ?)=} [opt_onChunk] - функция обратного вызова на
 *     завершение части отложенной операции
 *
 * @param {?boolean=} [opt_generator] - если true, то операция компилируется как генератор
 * @return {(!Generator|boolean)}
 */
Collection.prototype.some = function (opt_filterOrParams, opt_id, opt_from, opt_startIndex, opt_endIndex, opt_reverse, opt_inverseFilter, opt_notOwn, opt_live, opt_use, opt_vars, opt_context, opt_thread, opt_priority, opt_onIterationEnd, opt_onComplete, opt_onChunk, opt_generator) {
  var res = false;

  /** @type {?} */
  var returnVal = this.forEach(function () {
    res = true;
    this.result = res;
  }, opt_filterOrParams, opt_id, false, null, opt_from, opt_startIndex, opt_endIndex, opt_reverse, opt_inverseFilter, opt_notOwn, opt_live, opt_use, opt_vars, opt_context, res, opt_thread, opt_priority, opt_onIterationEnd, opt_onComplete, opt_onChunk, opt_generator);

  if (returnVal !== this) {
    return returnVal;
  }

  return res;
};

/**
 * Вернуть true, если все элементы коллекции соответствуют заданному условию,
 * аналог Array.prototype.every
 *
 * @param {($$CollectionFilter|?$$CollectionIteratorInterface)=} opt_filterOrParams -
 *     1) функция-фильтр;
 *     2) строковое выражение (запись эквивалентна: return + строковое выражение);
 *     3) true (если фильтр отключён).
 *     ИЛИ объект, свойствами которого указаны параметры функции (приставки opt_ отбрасываются)
 *
 * @param {?string=} opt_id - ИД коллекции
 * @param {?number=} opt_from - количество пропускаемых успешных итераций
 * @param {?number=} opt_startIndex - начальная позиция поиска
 * @param {?number=} [opt_endIndex] - конечная позиция поиска (включается)
 *
 * @param {?boolean=} opt_reverse - если true, то обход коллекции идёт с хвоста (спуск)
 * @param {?boolean=} opt_inverseFilter - если true,
 *     то успешной итерацией считается отрицательный результат
 *
 * @param {(boolean|number|null)=} opt_notOwn - если true,
 *     то итерации по объекту идут с учётом свойств прототипа,
 *     a если -1, то только свойства прототипа
 *
 * @param {?boolean=} opt_live - если true, то начальная длина коллекции не кешируется,
 *     т.е. добавленные во время операции элементы будут участвовать в обходе
 *     (только для массивов, массиво-подобных объектов, Map, Set и opt_reverse = false)
 *
 * @param {?string=} [opt_use] - тип используемого цикла внутри итератора: for, for of или for in
 * @param {Object=} [opt_vars] - объект добавляемых переменных в кластер
 *
 * @see Collection.prototype.byLink
 * @param {$$CollectionLink=} [opt_context] - дополнительный контекст
 *
 * @param {?boolean=} opt_thread - если true, то операция разбивается на части и выполняется отложено,
 *     а сам метод вернёт ссылку на объект-генератор
 *
 * @param {?string=} opt_priority - приоритет отложенной задачи (low, normal, hight, critical)
 * @param {?function(this:Collection, ?)=} [opt_onIterationEnd] - функция обратного вызова на завершение итерации
 * @param {?function(this:Collection, ?)=} [opt_onComplete] - функция обратного вызова на завершение операции
 * @param {?function(this:Collection, ?)=} [opt_onChunk] - функция обратного вызова на
 *     завершение части отложенной операции
 *
 * @param {?boolean=} [opt_generator] - если true, то операция компилируется как генератор
 * @return {(!Generator|boolean)}
 */
Collection.prototype.every = function (opt_filterOrParams, opt_id, opt_from, opt_startIndex, opt_endIndex, opt_reverse, opt_inverseFilter, opt_notOwn, opt_live, opt_use, opt_vars, opt_context, opt_thread, opt_priority, opt_onIterationEnd, opt_onComplete, opt_onChunk, opt_generator) {
  var _this18 = this;
  /** @type {$$CollectionIteratorInterface} */
  var p = _.any(opt_filterOrParams || {});
  var res = true;

  /** @type {?} */
  var returnVal = this.forEach(function () {
    res = false;
    _this18.result = res;
  }, opt_filterOrParams, opt_id, false, null, opt_from, opt_startIndex, opt_endIndex, opt_reverse, !_(opt_inverseFilter, p.inverseFilter), opt_notOwn, opt_live, opt_use, opt_vars, opt_context, res, opt_thread, opt_priority, opt_onIterationEnd, opt_onComplete, opt_onChunk, opt_generator);

  if (returnVal !== this) {
    return returnVal;
  }

  return res;
};

/**
 * Искать элементы по заданному условию или указателю.
 * Метод возвращает либо массив найденных элементов, либо
 * сам элемент (если mult = false)
 *
 * @param {($$CollectionFilter|$$CollectionLink|?$$CollectionIteratorInterface)=} opt_filterOrParams -
 *     1) функция-фильтр;
 *     2) строковое выражение (запись эквивалентна: return + строковое выражение);
 *     3) true (если фильтр отключён);
 *     4) указатель (перегрузка).
 *     ИЛИ объект, свойствами которого указаны параметры функции (приставки opt_ отбрасываются)
 *
 * @param {?string=} opt_id - ИД коллекции
 * @param {?boolean=} opt_mult - если false, то после первой успешной итерации цикл прерывается
 *
 * @param {?number=} [opt_count] - максимальное количество элементов в ответе (по умолчанию весь объект)
 * @param {?number=} opt_from - количество пропускаемых успешных итераций
 * @param {?number=} opt_startIndex - начальная позиция поиска
 * @param {?number=} [opt_endIndex] - конечная позиция поиска (включается)
 *
 * @param {?boolean=} opt_reverse - если true, то обход коллекции идёт с хвоста (спуск)
 * @param {?boolean=} opt_inverseFilter - если true,
 *     то успешной итерацией считается отрицательный результат
 *
 * @param {(boolean|number|null)=} opt_notOwn - если true,
 *     то итерации по объекту идут с учётом свойств прототипа,
 *     a если -1, то только свойства прототипа
 *
 * @param {?boolean=} opt_live - если true, то начальная длина коллекции не кешируется,
 *     т.е. добавленные во время операции элементы будут участвовать в обходе
 *     (только для массивов, массиво-подобных объектов, Map, Set и opt_reverse = false)
 *
 * @param {?string=} [opt_use] - тип используемого цикла внутри итератора: for, for of или for in
 * @param {Object=} [opt_vars] - объект добавляемых переменных в кластер
 *
 * @see Collection.prototype.byLink
 * @param {$$CollectionLink=} [opt_context] - дополнительный контекст
 *
 * @param {?boolean=} opt_chain - если true, то метод установит полученную коллекцию активной
 *     и вернёт ссылку на экземпляр Collection (только в случае синхронной операции)
 *
 * @param {?boolean=} opt_thread - если true, то операция разбивается на части и выполняется отложено,
 *     а сам метод вернёт ссылку на объект-генератор
 *
 * @param {?string=} opt_priority - приоритет отложенной задачи (low, normal, hight, critical)
 * @param {?function(this:Collection, ?)=} [opt_onIterationEnd] - функция обратного вызова на завершение итерации
 * @param {?function(this:Collection, ?)=} [opt_onComplete] - функция обратного вызова на завершение операции
 * @param {?function(this:Collection, ?)=} [opt_onChunk] - функция обратного вызова на
 *     завершение части отложенной операции
 *
 * @param {?boolean=} [opt_generator] - если true, то операция компилируется как генератор
 * @return {(!Collection|!Generator|!Array|?)}
 */
Collection.prototype.get = function (opt_filterOrParams, opt_id, opt_mult, opt_count, opt_from, opt_startIndex, opt_endIndex, opt_reverse, opt_inverseFilter, opt_notOwn, opt_live, opt_use, opt_vars, opt_context, opt_chain, opt_thread, opt_priority, opt_onIterationEnd, opt_onComplete, opt_onChunk, opt_generator) {
  var old = opt_filterOrParams;

  if (isObject(opt_filterOrParams)) {
    /** @type {$$CollectionIteratorInterface} */
    var p = _.any(opt_filterOrParams || {});
    opt_id = _(opt_id, p.id);
    opt_mult = _(opt_mult, p.mult);
    opt_context = _(opt_context, p.context);
    opt_chain = _(opt_chain, p.chain);
    opt_onComplete = _(opt_onComplete, p.onComplete);
    opt_filterOrParams = _.any(p.filter);
  }

  if (opt_filterOrParams != null && !isFunction(opt_filterOrParams) && (isString(opt_filterOrParams) && !this._isFilter(opt_filterOrParams) || isArray(opt_filterOrParams) || isNumber(opt_filterOrParams) || isLink(opt_filterOrParams))) {
    var tmp = this._chain(this._getOne(this._joinContexts(opt_context, opt_filterOrParams), opt_id), opt_chain);

    if (opt_onComplete) {
      opt_onComplete.call(this, tmp);
    }

    return tmp;
  }

  var res = [];
  var returnVal = this.forEach(function (el) {
    res.push(el);
  }, old, opt_id, opt_mult, opt_count, opt_from, opt_startIndex, opt_endIndex, opt_reverse, opt_inverseFilter, opt_notOwn, opt_live, opt_use, opt_vars, opt_context, res, opt_thread, opt_priority, opt_onIterationEnd, function () {
    if (opt_mult === false) {
      res = res[0];
    }

    this._chain(res, opt_chain);

    if (opt_onComplete) {
      opt_onComplete.call(this, res);
    }
  }, opt_onChunk, opt_generator);

  if (returnVal !== this) {
    return returnVal;
  }

  return opt_chain ? this : res;
};

/**
 * Установить новое значение элементу/там коллекции
 * по заданному условию или указателю
 *
 * @param {(!$$CollectionFilter|!$$CollectionLink|$$CollectionIteratorInterface)} filterOrParams -
 *     1) функция-фильтр;
 *     2) строковое выражение (запись эквивалентна: return + строковое выражение);
 *     3) true (если фильтр отключён);
 *     4) указатель (перегрузка).
 *     ИЛИ объект, свойствами которого указаны параметры функции (кроме val, приставки opt_ отбрасываются)
 *
 * @param {?} val - объект замены (если задан функцией, то вызывается как callback)
 * @param {?string=} opt_id - ИД коллекции
 * @param {?boolean=} opt_mult - если false, то после первой успешной итерации цикл прерывается
 *
 * @param {?number=} [opt_count] - максимальное количество обновлений (по умолчанию весь объект)
 * @param {?number=} opt_from - количество пропускаемых успешных итераций
 * @param {?number=} opt_startIndex - начальная позиция поиска
 * @param {?number=} [opt_endIndex] - конечная позиция поиска (включается)
 *
 * @param {?boolean=} opt_reverse - если true, то обход коллекции идёт с хвоста (спуск)
 * @param {?boolean=} opt_inverseFilter - если true,
 *     то успешной итерацией считается отрицательный результат
 *
 * @param {(boolean|number|null)=} opt_notOwn - если true,
 *     то итерации по объекту идут с учётом свойств прототипа,
 *     a если -1, то только свойства прототипа
 *
 * @param {?boolean=} opt_live - если true, то начальная длина коллекции не кешируется,
 *     т.е. добавленные во время операции элементы будут участвовать в обходе
 *     (только для массивов, массиво-подобных объектов, Map, Set и opt_reverse = false)
 *
 * @param {?string=} [opt_use] - тип используемого цикла внутри итератора: for или for in
 * @param {Object=} [opt_vars] - объект добавляемых переменных в кластер
 *
 * @see Collection.prototype.byLink
 * @param {$$CollectionLink=} [opt_context] - дополнительный контекст
 *
 * @param {?boolean=} opt_chain - если true, то метод установит полученную коллекцию активной
 *     и вернёт ссылку на экземпляр Collection (только в случае синхронной операции)
 *
 * @param {?boolean=} opt_thread - если true, то операция разбивается на части и выполняется отложено,
 *     а сам метод вернёт ссылку на объект-генератор
 *
 * @param {?string=} opt_priority - приоритет отложенной задачи (low, normal, hight, critical)
 * @param {?function(this:Collection, ?)=} [opt_onIterationEnd] - функция обратного вызова на завершение итерации
 * @param {?function(this:Collection, ?)=} [opt_onComplete] - функция обратного вызова на завершение операции
 * @param {?function(this:Collection, ?)=} [opt_onChunk] - функция обратного вызова на
 *     завершение части отложенной операции
 *
 * @param {?boolean=} [opt_generator] - если true, то операция компилируется как генератор
 * @return {(!Collection|!Generator|!Array|{result: boolean, key, value})}
 */
Collection.prototype.set = function (filterOrParams, val, opt_id, opt_mult, opt_count, opt_from, opt_startIndex, opt_endIndex, opt_reverse, opt_inverseFilter, opt_notOwn, opt_live, opt_use, opt_vars, opt_context, opt_chain, opt_thread, opt_priority, opt_onIterationEnd, opt_onComplete, opt_onChunk, opt_generator) {
  var old = filterOrParams;

  if (isObject(filterOrParams)) {
    /** @type {$$CollectionIteratorInterface} */
    var p = _.any(filterOrParams || {});
    opt_id = _(opt_id, p.id);
    opt_mult = _(opt_mult, p.mult);
    opt_context = _(opt_context, p.context);
    opt_chain = _(opt_chain, p.chain);
    opt_onComplete = _(opt_onComplete, p.onComplete);
    filterOrParams = _.any(p.filter);
  }

  var data = this._getOne(opt_context, opt_id),
      type = getType(data, opt_use);

  if (type === "generator" || type === "iterator") {
    throw new TypeError("Incorrect data type");
  }

  if (filterOrParams != null && !isFunction(filterOrParams) && (isString(filterOrParams) && !this._isFilter(filterOrParams) || isArray(filterOrParams) || isNumber(filterOrParams) || isLink(filterOrParams))) {
    var tmp = this._chain(this._setOne(this._joinContexts(opt_context, filterOrParams), val, opt_id), opt_chain);

    if (opt_onComplete) {
      opt_onComplete.call(this, tmp);
    }

    return tmp;
  }

  var action, report = [];

  if (isFunction(val)) {
    switch (type) {
      case "map":
        action = function (el, key, data) {
          var res = val.apply(this, arguments),
              success = res === void 0;

          if (res !== void 0 && data.get(key) !== res) {
            data.set(key, res);
            success = data.get(key) === res;
          }

          report.push({
            key: key,
            value: el,
            result: success
          });
        };

        break;

      case "set":
        action = function (el, key, data) {
          var res = val.apply(this, arguments),
              success = res === void 0;

          if (res !== void 0 && !data.has(res)) {
            data.delete(el);
            data.add(res);
            success = data.has(res);
          }

          report.push({
            key: null,
            value: el,
            result: success
          });
        };

        break;

      default:
        action = function (el, key, data) {
          var res = val.apply(this, arguments),
              success = res === void 0;

          if (res !== void 0 && data[key] !== res) {
            data[key] = res;
            success = data[key] === res;
          }

          report.push({
            key: key,
            value: el,
            result: success
          });
        };
    }

    action["__COLLECTION_TMP__length"] = action.length > val.length ? action.length : val.length;
  } else {
    switch (type) {
      case "map":
        action = function (el, key, data) {
          var success = false;

          if (data.get(key) !== val) {
            data.set(key, val);
            success = data.get(key) === val;
          }

          report.push({
            key: key,
            value: el,
            result: success
          });
        };

        break;

      case "set":
        action = function (el, key, data) {
          var success = false;

          if (!data.has(val)) {
            data.delete(el);
            data.add(val);
            success = data.has(val);
          }

          report.push({
            key: null,
            value: el,
            result: success
          });
        };

        break;

      default:
        action = function (el, key, data) {
          var success = false;

          if (data[key] !== val) {
            data[key] = val;
            success = data[key] === val;
          }

          report.push({
            key: key,
            value: el,
            result: success
          });
        };
    }
  }

  var returnVal = this.forEach(action, old, opt_id, opt_mult, opt_count, opt_from, opt_startIndex, opt_endIndex, opt_reverse, opt_inverseFilter, opt_notOwn, opt_live, opt_use, opt_vars, opt_context, report, opt_thread, opt_priority, opt_onIterationEnd, function () {
    if (opt_mult === false) {
      if (0 in report) {
        report = report[0];
      } else {
        report = {
          result: false,
          key: type === "set" ? null : void 0,

          value: val
        };
      }
    }

    this._chain(report, opt_chain);

    if (opt_onComplete) {
      opt_onComplete.call(this, report);
    }
  }, opt_onChunk, opt_generator);

  if (returnVal !== this) {
    return returnVal;
  }

  return opt_chain ? this : report;
};


/**
 * Добавить новый элемент в коллекцию или обновить имеющийся
 * по заданному условию или указателю
 *
 * @param {($$CollectionFilter|?$$CollectionIteratorInterface)} filterOrParams -
 *     1) функция-фильтр;
 *     2) строковое выражение (запись эквивалентна: return + строковое выражение);
 *     3) true (если фильтр отключён).
 *     ИЛИ объект, свойствами которого указаны параметры функции (кроме val, приставки opt_ отбрасываются)
 *
 * @param {?} val - новый элемент (если задан функцией, то вызывается как callback)
 * @param {?=} [opt_key] - имя добавляемого свойства (только для объектов)
 * @param {?string=} opt_id - ИД коллекции
 *
 * @param {?number=} opt_from - количество пропускаемых успешных итераций
 * @param {?number=} opt_startIndex - начальная позиция поиска
 * @param {?number=} [opt_endIndex] - конечная позиция поиска (включается)
 *
 * @param {?boolean=} opt_reverse - если true, то обход коллекции идёт с хвоста (спуск)
 * @param {?boolean=} opt_inverseFilter - если true,
 *     то успешной итерацией считается отрицательный результат
 *
 * @param {(boolean|number|null)=} opt_notOwn - если true,
 *     то итерации по объекту идут с учётом свойств прототипа,
 *     a если -1, то только свойства прототипа
 *
 * @param {?boolean=} opt_live - если true, то начальная длина коллекции не кешируется,
 *     т.е. добавленные во время операции элементы будут участвовать в обходе
 *     (только для массивов, массиво-подобных объектов, Map, Set и opt_reverse = false)
 *
 * @param {?string=} [opt_use] - тип используемого цикла внутри итератора: for или for in
 * @param {Object=} [opt_vars] - объект добавляемых переменных в кластер
 *
 * @see Collection.prototype.byLink
 * @param {$$CollectionLink=} [opt_context] - дополнительный контекст
 *
 * @param {?boolean=} opt_create - если false, то
 *     в случае отсутствия заданного свойства будет сгенерировано исключение,
 *     иначе оно будет создано
 *
 * @param {?boolean=} opt_thread - если true, то операция разбивается на части и выполняется отложено,
 *     а сам метод вернёт ссылку на объект-генератор
 *
 * @param {?string=} opt_priority - приоритет отложенной задачи (low, normal, hight, critical)
 * @param {?function(this:Collection, ?)=} [opt_onIterationEnd] - функция обратного вызова на завершение итерации
 * @param {?function(this:Collection, ?)=} [opt_onComplete] - функция обратного вызова на завершение операции
 * @param {?function(this:Collection, ?)=} [opt_onChunk] - функция обратного вызова на
 *     завершение части отложенной операции
 *
 * @param {?boolean=} [opt_generator] - если true, то операция компилируется как генератор
 * @return {(!Generator|{result: boolean, type: string, key, value})}
 */
Collection.prototype.addOrSet = function (filterOrParams, val, opt_key, opt_id, opt_from, opt_startIndex, opt_endIndex, opt_reverse, opt_inverseFilter, opt_notOwn, opt_live, opt_use, opt_vars, opt_context, opt_create, opt_thread, opt_priority, opt_onIterationEnd, opt_onComplete, opt_onChunk, opt_generator) {
  if (isObject(filterOrParams)) {
    /** @type {$$CollectionIteratorInterface} */
    var p = _.any(filterOrParams || {});
    opt_key = _(opt_key, p.key);
    opt_id = _(opt_id, p.id);
    opt_context = _(opt_context, p.context);
    opt_create = _(opt_create, p.create);
    opt_onComplete = _(opt_onComplete, p.onComplete);
  }

  var data = this._getOne(opt_context, opt_id, opt_create !== false);

  /** @type {?} */
  var report = null;

  var res = [], length;

  /** @type {?} */
  var returnVal = this.forEach(function (el, key, data, i, ln) {
    res.push({
      el: el,
      key: key,
      i: i
    });

    length = ln;
  }, filterOrParams, opt_id, false, null, opt_from, opt_startIndex, opt_endIndex, opt_reverse, opt_inverseFilter, opt_notOwn, opt_live, opt_use, opt_vars, opt_context, res, opt_thread, opt_priority, opt_onIterationEnd, function () {
    var isFn = isFunction(val);

    if (!length) {
      length = function () {
        return 0;
      };
    }

    if (res.length) {
      var pos = res[0];
      report = this.set([isSet(data) ? pos.el : pos.key], isFn ? val.call(this, pos.el, pos.key, data, pos.i, length, val) : val, opt_id, null, null, null, null, null, null, null, null, null, null, null, opt_context);

      report.type = "set";
    } else {
      report = this.add(isFn ? val.call(this, void 0, opt_key, data, void 0, length, val) : val, opt_key, false, opt_id, opt_context, opt_create);

      report.type = "add";
    }

    if (opt_onComplete) {
      opt_onComplete.call(this, report);
    }
  }, opt_onChunk, opt_generator);

  if (returnVal !== this) {
    return returnVal;
  }

  return report;
};



/**
 * Удалить элемент из конца коллекции,
 * аналог Array.prototype.pop
 *
 * @param {($$CollectionFilter|?$$CollectionIteratorInterface)=} opt_filterOrParams -
 *     1) функция-фильтр;
 *     2) строковое выражение (запись эквивалентна: return + строковое выражение).
 *     ИЛИ объект, свойствами которого указаны параметры функции (приставки opt_ отбрасываются)
 *
 * @param {?string=} opt_id - ИД коллекции
 * @param {?number=} opt_from - количество пропускаемых успешных итераций
 * @param {?number=} opt_startIndex - начальная позиция поиска
 * @param {?number=} [opt_endIndex] - конечная позиция поиска (включается)
 *
 * @param {?boolean=} opt_inverseFilter - если true,
 *     то успешной итерацией считается отрицательный результат
 *
 * @param {(boolean|number|null)=} opt_notOwn - если true,
 *     то итерации по объекту идут с учётом свойств прототипа,
 *     a если -1, то только свойства прототипа
 *
 * @param {?boolean=} opt_live - если true, то начальная длина коллекции не кешируется,
 *     т.е. добавленные во время операции элементы будут участвовать в обходе
 *     (только для массивов, массиво-подобных объектов, Map, Set и opt_reverse = false)
 *
 * @param {?string=} [opt_use] - тип используемого цикла: for или for in
 * @param {Object=} [opt_vars] - объект добавляемых переменных в кластер
 *
 * @see Collection.prototype.byLink
 * @param {$$CollectionLink=} [opt_context] - дополнительный контекст
 *
 * @param {?boolean=} opt_thread - если true, то операция разбивается на части и выполняется отложено,
 *     а сам метод вернёт ссылку на объект-генератор
 *
 * @param {?string=} opt_priority - приоритет отложенной задачи (low, normal, hight, critical)
 * @param {?function(this:Collection, ?)=} [opt_onIterationEnd] - функция обратного вызова на завершение итерации
 * @param {?function(this:Collection, ?)=} [opt_onComplete] - функция обратного вызова на завершение операции
 * @param {?function(this:Collection, ?)=} [opt_onChunk] - функция обратного вызова на
 *     завершение части отложенной операции
 *
 * @param {?boolean=} [opt_generator] - если true, то операция компилируется как генератор
 * @return {(!Generator|{result: boolean, key, value})}
 */
Collection.prototype.pop = function (opt_filterOrParams, opt_id, opt_from, opt_startIndex, opt_endIndex, opt_inverseFilter, opt_notOwn, opt_live, opt_use, opt_vars, opt_context, opt_thread, opt_priority, opt_onIterationEnd, opt_onComplete, opt_onChunk, opt_generator) {
  var old = opt_filterOrParams;

  if (isObject(opt_filterOrParams)) {
    /** @type {$$CollectionIteratorInterface} */
    var p = _.any(opt_filterOrParams || {});
    opt_id = _(opt_id, p.id);
    opt_context = _(opt_context, p.context);
    opt_onComplete = _(opt_onComplete, p.onComplete);
    opt_filterOrParams = _.any(p.filter);
  }

  if (opt_filterOrParams == null) {
    var tmp = this._removeOne(this._joinContexts(opt_context, "eq(-1)"), opt_id);

    if (opt_onComplete) {
      opt_onComplete.call(this, tmp);
    }

    return tmp;
  }

  return _.any(this.remove(old, opt_id, false, null, opt_from, opt_startIndex, opt_endIndex, true, opt_inverseFilter, opt_notOwn, opt_live, opt_use, opt_vars, opt_context, false, opt_thread, opt_priority, opt_onIterationEnd, opt_onComplete, opt_onChunk, opt_generator));
};


/**
 * Удалить элемент из начала коллекции,
 * аналог Array.prototype.shift
 *
 * @param {($$CollectionFilter|?$$CollectionIteratorInterface)=} opt_filterOrParams -
 *     1) функция-фильтр;
 *     2) строковое выражение (запись эквивалентна: return + строковое выражение).
 *     ИЛИ объект, свойствами которого указаны параметры функции (приставки opt_ отбрасываются)
 *
 * @param {?string=} opt_id - ИД коллекции
 * @param {?number=} opt_from - количество пропускаемых успешных итераций
 * @param {?number=} opt_startIndex - начальная позиция поиска
 * @param {?number=} [opt_endIndex] - конечная позиция поиска (включается)
 *
 * @param {?boolean=} opt_inverseFilter - если true,
 *     то успешной итерацией считается отрицательный результат
 *
 * @param {(boolean|number|null)=} opt_notOwn - если true,
 *     то итерации по объекту идут с учётом свойств прототипа,
 *     a если -1, то только свойства прототипа
 *
 * @param {?boolean=} opt_live - если true, то начальная длина коллекции не кешируется,
 *     т.е. добавленные во время операции элементы будут участвовать в обходе
 *     (только для массивов, массиво-подобных объектов, Map, Set и opt_reverse = false)
 *
 * @param {?string=} [opt_use] - тип используемого цикла: for или for in
 * @param {Object=} [opt_vars] - объект добавляемых переменных в кластер
 *
 * @see Collection.prototype.byLink
 * @param {$$CollectionLink=} [opt_context] - дополнительный контекст
 *
 * @param {?boolean=} opt_thread - если true, то операция разбивается на части и выполняется отложено,
 *     а сам метод вернёт ссылку на объект-генератор
 *
 * @param {?string=} opt_priority - приоритет отложенной задачи (low, normal, hight, critical)
 * @param {?function(this:Collection, ?)=} [opt_onIterationEnd] - функция обратного вызова на завершение итерации
 * @param {?function(this:Collection, ?)=} [opt_onComplete] - функция обратного вызова на завершение операции
 * @param {?function(this:Collection, ?)=} [opt_onChunk] - функция обратного вызова на
 *     завершение части отложенной операции
 *
 * @param {?boolean=} [opt_generator] - если true, то операция компилируется как генератор
 * @return {(!Generator|{result: boolean, key, value})}
 */
Collection.prototype.shift = function (opt_filterOrParams, opt_id, opt_from, opt_startIndex, opt_endIndex, opt_inverseFilter, opt_notOwn, opt_live, opt_use, opt_vars, opt_context, opt_thread, opt_priority, opt_onIterationEnd, opt_onComplete, opt_onChunk, opt_generator) {
  var old = opt_filterOrParams;

  if (isObject(opt_filterOrParams)) {
    /** @type {$$CollectionIteratorInterface} */
    var p = _.any(opt_filterOrParams || {});
    opt_id = _(opt_id, p.id);
    opt_context = _(opt_context, p.context);
    opt_onComplete = _(opt_onComplete, p.onComplete);
    opt_filterOrParams = _.any(p.filter);
  }

  if (opt_filterOrParams == null) {
    var tmp = this._removeOne(this._joinContexts(opt_context, "eq(0)"), opt_id);

    if (opt_onComplete) {
      opt_onComplete.call(this, tmp);
    }

    return tmp;
  }

  return _.any(this.remove(old, opt_id, false, null, opt_from, opt_startIndex, opt_endIndex, false, opt_inverseFilter, opt_notOwn, opt_live, opt_use, opt_vars, opt_context, false, opt_thread, opt_priority, opt_onIterationEnd, opt_onComplete, opt_onChunk, opt_generator));
};

/**
 * Искать элементы по заданному условию.
 * Метод возвращает либо массив найденных индексов/ключей, либо
 * сам индекс/ключ (если mult = false) или null.
 *
 * В случае, когда источником данных выступает Map,
 * то при mult = false будет возвращаться объект {value: ключ} или null.
 *
 * Для Set возвращаются позиции (числовые индексы) в списке, а не ключи.
 *
 * @param {($$CollectionFilter|?$$CollectionIteratorInterface)=} opt_filterOrParams -
 *     1) функция-фильтр;
 *     2) строковое выражение (запись эквивалентна: return + строковое выражение);
 *     3) true (если фильтр отключён).
 *     ИЛИ объект, свойствами которого указаны параметры функции (приставки opt_ отбрасываются)
 *
 * @param {?string=} opt_id - ИД коллекции
 * @param {?boolean=} opt_mult - если false, то после первой успешной итерации цикл прерывается
 *
 * @param {?number=} [opt_count] - максимальное количество элементов в ответе (по умолчанию весь объект)
 * @param {?number=} opt_from - количество пропускаемых успешных итераций
 * @param {?number=} opt_startIndex - начальная позиция поиска
 * @param {?number=} [opt_endIndex] - конечная позиция поиска (включается)
 *
 * @param {?boolean=} opt_reverse - если true, то обход коллекции идёт с хвоста (спуск)
 * @param {?boolean=} opt_inverseFilter - если true,
 *     то успешной итерацией считается отрицательный результат
 *
 * @param {(boolean|number|null)=} opt_notOwn - если true,
 *     то итерации по объекту идут с учётом свойств прототипа,
 *     a если -1, то только свойства прототипа
 *
 * @param {?boolean=} opt_live - если true, то начальная длина коллекции не кешируется,
 *     т.е. добавленные во время операции элементы будут участвовать в обходе
 *     (только для массивов, массиво-подобных объектов, Map, Set и opt_reverse = false)
 *
 * @param {?string=} [opt_use] - тип используемого цикла внутри итератора: for, for of или for in
 * @param {Object=} [opt_vars] - объект добавляемых переменных в кластер
 *
 * @see Collection.prototype.byLink
 * @param {$$CollectionLink=} [opt_context] - дополнительный контекст
 *
 * @param {?boolean=} opt_chain - если true, то метод установит полученную коллекцию активной
 *     и вернёт ссылку на экземпляр Collection (только в случае синхронной операции)
 *
 * @param {?boolean=} opt_thread - если true, то операция разбивается на части и выполняется отложено,
 *     а сам метод вернёт ссылку на объект-генератор
 *
 * @param {?string=} opt_priority - приоритет отложенной задачи (low, normal, hight, critical)
 * @param {?function(this:Collection, ?)=} [opt_onIterationEnd] - функция обратного вызова на завершение итерации
 * @param {?function(this:Collection, ?)=} [opt_onComplete] - функция обратного вызова на завершение операции
 * @param {?function(this:Collection, ?)=} [opt_onChunk] - функция обратного вызова на
 *     завершение части отложенной операции
 *
 * @param {?boolean=} [opt_generator] - если true, то операция компилируется как генератор
 * @return {(Collection|Generator|Array|{value}|?)}
 */
Collection.prototype.search = function (opt_filterOrParams, opt_id, opt_mult, opt_count, opt_from, opt_startIndex, opt_endIndex, opt_reverse, opt_inverseFilter, opt_notOwn, opt_live, opt_use, opt_vars, opt_context, opt_chain, opt_thread, opt_priority, opt_onIterationEnd, opt_onComplete, opt_onChunk, opt_generator) {
  if (isObject(opt_filterOrParams)) {
    /** @type {$$CollectionIteratorInterface} */
    var p = _.any(opt_filterOrParams || {});
    opt_id = _(opt_id, p.id);
    opt_mult = _(opt_mult, p.mult);
    opt_reverse = _(opt_reverse, p.reverse);
    opt_context = _(opt_context, p.context);
    opt_chain = _(opt_chain, p.chain);
    opt_onComplete = _(opt_onComplete, p.onComplete);
  }

  opt_mult = opt_mult !== false;
  var action, res = [];

  var data = this._getOne(opt_context, opt_id),
      dataIsSet = isSet(data);

  var size = dataIsSet ? data.size : 0;

  if (dataIsSet) {
    if (opt_reverse) {
      action = function (el, key, data, i) {
        res.push(size - i - 1);
      };
    } else {
      action = function (el, key, data, i) {
        res.push(i);
      };
    }
  } else {
    action = function (el, key) {
      res.push(key);
    };
  }

  var returnVal = this.forEach(action, opt_filterOrParams, opt_id, opt_mult, opt_count, opt_from, opt_startIndex, opt_endIndex, opt_reverse, opt_inverseFilter, opt_notOwn, opt_live, opt_use, opt_vars, opt_context, res, opt_thread, opt_priority, opt_onIterationEnd, function () {
    if (opt_mult === false) {
      if (0 in res) {
        res = isMap(data) ? { value: res[0] } : res[0];
      } else {
        res = null;
      }
    }

    this._chain(res, opt_chain);

    if (opt_onComplete) {
      opt_onComplete.call(this, res);
    }
  }, opt_onChunk, opt_generator);

  if (returnVal !== this) {
    return returnVal;
  }

  return opt_chain ? this : res;
};

/**
 * Вернуть true, если заданный элемент состоит в коллекции
 *
 * @param {?} searchElement - искомый элемент
 * @param {(number|?$$CollectionIteratorInterface)=} opt_startIndexOrParams - начальная позиция поиска
 *     ИЛИ объект, свойствами которого указаны параметры функции (приставки opt_ отбрасываются)
 *
 * @param {?string=} opt_id - ИД коллекции
 * @param {?number=} opt_from - количество пропускаемых успешных итераций
 * @param {?number=} [opt_endIndex] - конечная позиция поиска (включается)
 *
 * @param {?boolean=} opt_reverse - если true, то обход коллекции идёт с хвоста (спуск)
 * @param {?boolean=} opt_inverseFilter - если true,
 *     то успешной итерацией считается отрицательный результат
 *
 * @param {(boolean|number|null)=} opt_notOwn - если true,
 *     то итерации по объекту идут с учётом свойств прототипа,
 *     a если -1, то только свойства прототипа
 *
 * @param {?string=} [opt_use] - тип используемого цикла внутри итератора: for, for of или for in
 * @param {Object=} [opt_vars] - объект добавляемых переменных в кластер
 *
 * @see Collection.prototype.byLink
 * @param {$$CollectionLink=} [opt_context] - дополнительный контекст
 *
 * @param {?boolean=} opt_thread - если true, то операция разбивается на части и выполняется отложено,
 *     а сам метод вернёт ссылку на объект-генератор
 *
 * @param {?string=} opt_priority - приоритет отложенной задачи (low, normal, hight, critical)
 * @param {?function(this:Collection, ?)=} [opt_onIterationEnd] - функция обратного вызова на завершение итерации
 * @param {?function(this:Collection, ?)=} [opt_onComplete] - функция обратного вызова на завершение операции
 * @param {?function(this:Collection, ?)=} [opt_onChunk] - функция обратного вызова на
 *     завершение части отложенной операции
 *
 * @param {?boolean=} [opt_generator] - если true, то операция компилируется как генератор
 * @return {(!Collection|!Generator|boolean)}
 */
Collection.prototype.includes = function (searchElement, opt_startIndexOrParams, opt_id, opt_from, opt_endIndex, opt_reverse, opt_inverseFilter, opt_notOwn, opt_use, opt_vars, opt_context, opt_thread, opt_priority, opt_onIterationEnd, opt_onComplete, opt_onChunk, opt_generator) {
  if (isObject(opt_startIndexOrParams)) {
    /** @type {$$CollectionIteratorInterface} */
    var p = _.any(opt_startIndexOrParams || {});
    opt_id = _(opt_id, p.id);
    opt_notOwn = _(opt_notOwn, p.notOwn);
    opt_use = _(opt_use, p.use);
    opt_from = _(opt_from, p.from);
    opt_context = _(opt_context, p.context);
    opt_endIndex = _(opt_endIndex, p.endIndex);
    opt_reverse = _(opt_reverse, p.reverse);
    opt_vars = _(opt_vars, p.vars);
    opt_inverseFilter = _(opt_inverseFilter, p.inverseFilter);
    opt_thread = _(opt_thread, p.thread);
    opt_priority = _(opt_priority, p.priority);
    opt_onIterationEnd = _(opt_onIterationEnd, p.onIterationEnd);
    opt_onComplete = _(opt_onComplete, p.onComplete);
    opt_onChunk = _(opt_onChunk, p.onChunk);
    opt_generator = _(opt_generator, p.generator);
    opt_startIndexOrParams = _.any(p.startIndex);
  }

  var res = false;
  var returnVal = this.forEach(function () {
    res = true;
    this.result = res;
  }, isNaN(searchElement) ? function (el) {
    return isNaN(el);
  } : function (el) {
    return el === searchElement;
  }, opt_id, false, null, opt_from, opt_startIndexOrParams, opt_endIndex, opt_reverse, opt_inverseFilter, opt_notOwn, false, opt_use, opt_vars, opt_context, res, opt_thread, opt_priority, opt_onIterationEnd, opt_onComplete, opt_onChunk, opt_generator);

  if (returnVal !== this) {
    return returnVal;
  }

  return res;
};

/** @see Collection.prototype.includes */
Collection.prototype.contains = Collection.prototype.includes;


/**
 * Вернуть индекс/ключ первого элемента, который равен искомому,
 * аналог Array.prototype.indexOf.
 *
 * В случае, когда источником данных выступает Map,
 * то будет возвращаться объект {value: ключ} или null.
 *
 * Для Set возвращается позиция (числовой индекс), а не ключ.
 *
 * @param {?} searchElement - искомый элемент
 * @param {(number|?$$CollectionIteratorInterface)=} opt_startIndexOrParams - начальная позиция поиска
 *     ИЛИ объект, свойствами которого указаны параметры функции (приставки opt_ отбрасываются)
 *
 * @param {?string=} opt_id - ИД коллекции
 * @param {(boolean|number|null)=} opt_notOwn - если true,
 *     то итерации по объекту идут с учётом свойств прототипа,
 *     a если -1, то только свойства прототипа
 *
 * @param {?string=} [opt_use] - тип используемого цикла внутри итератора: for, for of или for in
 * @param {?number=} opt_from - количество пропускаемых успешных итераций
 *
 * @see Collection.prototype.byLink
 * @param {$$CollectionLink=} [opt_context] - дополнительный контекст
 *
 * @param {?number=} [opt_endIndex] - конечная позиция поиска (включается)
 * @param {Object=} [opt_vars] - объект добавляемых переменных в кластер
 *
 * @param {?boolean=} opt_inverseFilter - если true,
 *     то успешной итерацией считается отрицательный результат
 *
 * @param {?boolean=} opt_thread - если true, то операция разбивается на части и выполняется отложено,
 *     а сам метод вернёт ссылку на объект-генератор
 *
 * @param {?string=} opt_priority - приоритет отложенной задачи (low, normal, hight, critical)
 * @param {?function(this:Collection, ?)=} [opt_onIterationEnd] - функция обратного вызова на завершение итерации
 * @param {?function(this:Collection, ?)=} [opt_onComplete] - функция обратного вызова на завершение операции
 * @param {?function(this:Collection, ?)=} [opt_onChunk] - функция обратного вызова на
 *     завершение части отложенной операции
 *
 * @param {?boolean=} [opt_generator] - если true, то операция компилируется как генератор
 * @return {(Generator|{value}|?)}
 */
Collection.prototype.indexOf = function (searchElement, opt_startIndexOrParams, opt_id, opt_notOwn, opt_use, opt_from, opt_context, opt_endIndex, opt_vars, opt_inverseFilter, opt_thread, opt_priority, opt_onIterationEnd, opt_onComplete, opt_onChunk, opt_generator) {
  if (isObject(opt_startIndexOrParams)) {
    /** @type {$$CollectionIteratorInterface} */
    var p = _.any(opt_startIndexOrParams || {});
    opt_id = _(opt_id, p.id);
    opt_notOwn = _(opt_notOwn, p.notOwn);
    opt_use = _(opt_use, p.use);
    opt_from = _(opt_from, p.from);
    opt_context = _(opt_context, p.context);
    opt_endIndex = _(opt_endIndex, p.endIndex);
    opt_vars = _(opt_vars, p.vars);
    opt_inverseFilter = _(opt_inverseFilter, p.inverseFilter);
    opt_thread = _(opt_thread, p.thread);
    opt_priority = _(opt_priority, p.priority);
    opt_onIterationEnd = _(opt_onIterationEnd, p.onIterationEnd);
    opt_onComplete = _(opt_onComplete, p.onComplete);
    opt_onChunk = _(opt_onChunk, p.onChunk);
    opt_generator = _(opt_generator, p.generator);
    opt_startIndexOrParams = _.any(p.startIndex);
  }

  return this.search(isNaN(searchElement) ? function (el) {
    return isNaN(el);
  } : function (el) {
    return el === searchElement;
  }, opt_id, false, null, opt_from, opt_startIndexOrParams, opt_endIndex, false, opt_inverseFilter, opt_notOwn, null, opt_use, opt_vars, opt_context, null, opt_thread, opt_priority, opt_onIterationEnd, opt_onComplete, opt_onChunk, opt_generator);
};


/**
 * Вернуть индекс/ключ последнего элемента, который равен искомому,
 * аналог Array.prototype.lastIndexOf.
 *
 * В случае, когда источником данных выступает Map,
 * то будет возвращаться объект {value: ключ} или null.
 *
 * Для Set возвращается позиция (числовой индекс), а не ключ.
 *
 * @param {?} searchElement - искомый элемент
 * @param {(number|?$$CollectionIteratorInterface)=} opt_startIndexOrParams - начальная позиция поиска
 *     ИЛИ объект, свойствами которого указаны параметры функции (приставки opt_ отбрасываются)
 *
 * @param {?string=} opt_id - ИД коллекции
 * @param {(boolean|number|null)=} opt_notOwn - если true,
 *     то итерации по объекту идут с учётом свойств прототипа,
 *     a если -1, то только свойства прототипа
 *
 * @param {?string=} [opt_use] - тип используемого цикла внутри итератора: for, for of или for in
 * @param {?number=} opt_from - количество пропускаемых успешных итераций
 *
 * @see Collection.prototype.byLink
 * @param {$$CollectionLink=} [opt_context] - дополнительный контекст
 *
 * @param {?number=} [opt_endIndex] - конечная позиция поиска (включается)
 * @param {Object=} [opt_vars] - объект добавляемых переменных в кластер
 *
 * @param {?boolean=} opt_inverseFilter - если true,
 *     то успешной итерацией считается отрицательный результат
 *
 * @param {?boolean=} opt_thread - если true, то операция разбивается на части и выполняется отложено,
 *     а сам метод вернёт ссылку на объект-генератор
 *
 * @param {?string=} opt_priority - приоритет отложенной задачи (low, normal, hight, critical)
 * @param {?function(this:Collection, ?)=} [opt_onIterationEnd] - функция обратного вызова на завершение итерации
 * @param {?function(this:Collection, ?)=} [opt_onComplete] - функция обратного вызова на завершение операции
 * @param {?function(this:Collection, ?)=} [opt_onChunk] - функция обратного вызова на
 *     завершение части отложенной операции
 *
 * @param {?boolean=} [opt_generator] - если true, то операция компилируется как генератор
 * @return {(Generator|{value}|?)}
 */
Collection.prototype.lastIndexOf = function (searchElement, opt_startIndexOrParams, opt_id, opt_notOwn, opt_use, opt_from, opt_context, opt_endIndex, opt_vars, opt_inverseFilter, opt_thread, opt_priority, opt_onIterationEnd, opt_onComplete, opt_onChunk, opt_generator) {
  if (isObject(opt_startIndexOrParams)) {
    /** @type {$$CollectionIteratorInterface} */
    var p = _.any(opt_startIndexOrParams || {});
    opt_id = _(opt_id, p.id);
    opt_notOwn = _(opt_notOwn, p.notOwn);
    opt_use = _(opt_use, p.use);
    opt_from = _(opt_from, p.from);
    opt_context = _(opt_context, p.context);
    opt_endIndex = _(opt_endIndex, p.endIndex);
    opt_vars = _(opt_vars, p.vars);
    opt_inverseFilter = _(opt_inverseFilter, p.inverseFilter);
    opt_thread = _(opt_thread, p.thread);
    opt_priority = _(opt_priority, p.priority);
    opt_onIterationEnd = _(opt_onIterationEnd, p.onIterationEnd);
    opt_onComplete = _(opt_onComplete, p.onComplete);
    opt_onChunk = _(opt_onChunk, p.onChunk);
    opt_generator = _(opt_generator, p.generator);
    opt_startIndexOrParams = _.any(p.startIndex);
  }

  return this.search(isNaN(searchElement) ? function (el) {
    return isNaN(el);
  } : function (el) {
    return el === searchElement;
  }, opt_id, false, null, opt_from, opt_startIndexOrParams, opt_endIndex, true, opt_inverseFilter, opt_notOwn, null, opt_use, opt_vars, opt_context, null, opt_thread, opt_priority, opt_onIterationEnd, opt_onComplete, opt_onChunk, opt_generator);
};

/**
 * Создать новую коллекцию на основе старой по заданным параметрам,
 * аналог Array.prototype.map
 *
 * @param {$$CollectionCallback} callback - функция, которая вызывается
 *     для каждого элемента коллекции прошедшего фильтр
 *
 * @param {($$CollectionFilter|?$$CollectionIteratorInterface)=} opt_filterOrParams -
 *     1) функция-фильтр;
 *     2) строковое выражение (запись эквивалентна: return + строковое выражение);
 *     3) true (если фильтр отключён).
 *     ИЛИ объект, свойствами которого указаны параметры функции (приставки opt_ отбрасываются)
 *
 * @param {?string=} opt_id - ИД коллекции
 * @param {?boolean=} opt_mult - если false, то после первой успешной итерации цикл прерывается
 *
 * @param {?number=} [opt_count] - максимальное количество элементов (по умолчанию весь объект)
 * @param {?number=} opt_from - количество пропускаемых успешных итераций
 * @param {?number=} opt_startIndex - начальная позиция поиска
 * @param {?number=} [opt_endIndex] - конечная позиция поиска (включается)
 *
 * @param {?boolean=} opt_reverse - если true, то обход коллекции идёт с хвоста (спуск)
 * @param {?boolean=} opt_inverseFilter - если true,
 *     то успешной итерацией считается отрицательный результат
 *
 * @param {(boolean|number|null)=} opt_notOwn - если true,
 *     то итерации по объекту идут с учётом свойств прототипа,
 *     a если -1, то только свойства прототипа
 *
 * @param {?boolean=} opt_live - если true, то начальная длина коллекции не кешируется,
 *     т.е. добавленные во время операции элементы будут участвовать в обходе
 *     (только для массивов, массиво-подобных объектов, Map, Set и opt_reverse = false)
 *
 * @param {?string=} [opt_use] - тип используемого цикла внутри итератора: for, for of или for in
 * @param {Object=} [opt_vars] - объект добавляемых переменных в кластер
 *
 * @see Collection.prototype.byLink
 * @param {$$CollectionLink=} [opt_context] - дополнительный контекст
 *
 * @param {Object=} [opt_initial] - объект, в который будут добавляться данные
 * @param {?boolean=} opt_chain - если true, то метод установит полученную коллекцию активной
 *     и вернёт ссылку на экземпляр Collection (только в случае синхронной операции)
 *
 * @param {?boolean=} opt_thread - если true, то операция разбивается на части и выполняется отложено,
 *     а сам метод вернёт ссылку на объект-генератор
 *
 * @param {?string=} opt_priority - приоритет отложенной задачи (low, normal, hight, critical)
 * @param {?function(this:Collection, ?)=} [opt_onIterationEnd] - функция обратного вызова на завершение итерации
 * @param {?function(this:Collection, ?)=} [opt_onComplete] - функция обратного вызова на завершение операции
 * @param {?function(this:Collection, ?)=} [opt_onChunk] - функция обратного вызова на
 *     завершение части отложенной операции
 *
 * @param {?boolean=} [opt_generator] - если true, то операция компилируется как генератор
 * @return {(!Collection|!Generator|?)}
 */
Collection.prototype.map = function (callback, opt_filterOrParams, opt_id, opt_mult, opt_count, opt_from, opt_startIndex, opt_endIndex, opt_reverse, opt_inverseFilter, opt_notOwn, opt_live, opt_use, opt_vars, opt_context, opt_initial, opt_chain, opt_thread, opt_priority, opt_onIterationEnd, opt_onComplete, opt_onChunk, opt_generator) {
  if (isObject(opt_filterOrParams)) {
    /** @type {$$CollectionIteratorInterface} */
    var p = _.any(opt_filterOrParams || {});
    opt_id = _(opt_id, p.id);
    opt_use = _(opt_use, p.use);
    opt_context = _(opt_context, p.context);
    opt_initial = _(opt_initial, p.initial);
    opt_chain = _(opt_chain, p.chain);
    opt_onComplete = _(opt_onComplete, p.onComplete);
  }

  var data = this._getOne(opt_context, opt_id),
      type = "object";

  if ((opt_use || opt_notOwn) && !opt_initial) {
    opt_initial = {};
  } else if (opt_initial) {
    type = getType(opt_initial);
  } else {
    type = getType(data, opt_use);
  }

  var source = opt_initial || data, res;

  switch (type) {
    case "object":
      res = {};
      break;

    case "array":
      if (isArray(source)) {
        res = [];
      } else {
        res = {};
        type = "object";
      }

      break;

    case "generator":
    case "iterator":
      res = [];
      type = "array";
      break;

    default:
      res = new source.constructor();
  }

  /** @type {$$CollectionCallback} */
  var action;

  switch (type) {
    case "array":
      {
        action = function () {
          res.push(callback.apply(this, arguments));
        };

        action["__COLLECTION_TMP__length"] = callback.length;
      }break;

    case "object":
      {
        action = function (el, key) {
          res[key] = callback.apply(this, arguments);
        };

        action["__COLLECTION_TMP__length"] = action.length > callback.length ? action.length : callback.length;
      }break;

    case "map":
    case "weakMap":
      {
        action = function (el, key) {
          res.set(key, callback.apply(this, arguments));
        };

        action["__COLLECTION_TMP__length"] = action.length > callback.length ? action.length : callback.length;
      }break;

    case "set":
    case "weakSep":
      {
        action = function () {
          res.add(callback.apply(this, arguments));
        };

        action["__COLLECTION_TMP__length"] = callback.length;
      }break;
  }

  var returnVal = this.forEach(action, opt_filterOrParams, opt_id, opt_mult, opt_count, opt_from, opt_startIndex, opt_endIndex, opt_reverse, opt_inverseFilter, opt_notOwn, opt_live, opt_use, opt_vars, opt_context, res, opt_thread, opt_priority, opt_onIterationEnd, function () {
    this._chain(res, opt_chain);

    if (opt_onComplete) {
      opt_onComplete.call(this, res);
    }
  }, opt_onChunk, opt_generator);

  if (returnVal !== this) {
    return returnVal;
  }

  return opt_chain ? this : res;
};


/**
 * Создать новую коллекцию из элементов старой, которые подойдут под заданное условие,
 * аналог Array.prototype.filter
 *
 * @param {($$CollectionFilter|?$$CollectionIteratorInterface)=} opt_filterOrParams -
 *     1) функция-фильтр;
 *     2) строковое выражение (запись эквивалентна: return + строковое выражение);
 *     3) true (если фильтр отключён).
 *     ИЛИ объект, свойствами которого указаны параметры функции (приставки opt_ отбрасываются)
 *
 * @param {?string=} opt_id - ИД коллекции
 * @param {?boolean=} opt_mult - если false, то после первой успешной итерации цикл прерывается
 *
 * @param {?number=} [opt_count] - максимальное количество элементов (по умолчанию весь объект)
 * @param {?number=} opt_from - количество пропускаемых успешных итераций
 * @param {?number=} opt_startIndex - начальная позиция поиска
 * @param {?number=} [opt_endIndex] - конечная позиция поиска (включается)
 *
 * @param {?boolean=} opt_reverse - если true, то обход коллекции идёт с хвоста (спуск)
 * @param {?boolean=} opt_inverseFilter - если true,
 *     то успешной итерацией считается отрицательный результат
 *
 * @param {(boolean|number|null)=} opt_notOwn - если true,
 *     то итерации по объекту идут с учётом свойств прототипа,
 *     a если -1, то только свойства прототипа
 *
 * @param {?boolean=} opt_live - если true, то начальная длина коллекции не кешируется,
 *     т.е. добавленные во время операции элементы будут участвовать в обходе
 *     (только для массивов, массиво-подобных объектов, Map, Set и opt_reverse = false)
 *
 * @param {?string=} [opt_use] - тип используемого цикла внутри итератора: for, for of или for in
 * @param {Object=} [opt_vars] - объект добавляемых переменных в кластер
 *
 * @see Collection.prototype.byLink
 * @param {$$CollectionLink=} [opt_context] - дополнительный контекст
 *
 * @param {?boolean=} opt_chain - если true, то метод установит полученную коллекцию активной
 *     и вернёт ссылку на экземпляр Collection (только в случае синхронной операции)
 *
 * @param {?boolean=} opt_thread - если true, то операция разбивается на части и выполняется отложено,
 *     а сам метод вернёт ссылку на объект-генератор
 *
 * @param {?string=} opt_priority - приоритет отложенной задачи (low, normal, hight, critical)
 * @param {?function(this:Collection, ?)=} [opt_onIterationEnd] - функция обратного вызова на завершение итерации
 * @param {?function(this:Collection, ?)=} [opt_onComplete] - функция обратного вызова на завершение операции
 * @param {?function(this:Collection, ?)=} [opt_onChunk] - функция обратного вызова на
 *     завершение части отложенной операции
 *
 * @param {?boolean=} [opt_generator] - если true, то операция компилируется как генератор
 * @return {(!Collection|!Generator|!Object)}
 */
Collection.prototype.filter = function (opt_filterOrParams, opt_id, opt_mult, opt_count, opt_from, opt_startIndex, opt_endIndex, opt_reverse, opt_inverseFilter, opt_notOwn, opt_live, opt_use, opt_vars, opt_context, opt_chain, opt_thread, opt_priority, opt_onIterationEnd, opt_onComplete, opt_onChunk, opt_generator) {
  return this.map(function (el) {
    return el;
  }, opt_filterOrParams, opt_id, opt_mult, opt_count, opt_from, opt_startIndex, opt_endIndex, opt_reverse, opt_inverseFilter, opt_notOwn, opt_live, opt_use, opt_vars, opt_context, null, opt_chain, opt_thread, opt_priority, opt_onIterationEnd, opt_onComplete, opt_onChunk, opt_generator);
};

/**
 * Свернуть коллекцию (привести к другой форме) по заданным параметрам,
 * аналог Array.prototype.reduce и Array.prototype.reduceRight
 *
 * @param {function(this:Collection, ?, ?, ?, !Object, number, function(?boolean=): number, !Function): ?} callback - функция, которая вызывается
 *     для каждого элемента коллекции прошедшего фильтр
 *
 * @param {?=} opt_initialValue - начальное значение
 * @param {($$CollectionFilter|?$$CollectionIteratorInterface)=} opt_filterOrParams -
 *     1) функция-фильтр;
 *     2) строковое выражение (запись эквивалентна: return + строковое выражение);
 *     3) true (если фильтр отключён).
 *     ИЛИ объект, свойствами которого указаны параметры функции (приставки opt_ отбрасываются)
 *
 * @param {?string=} opt_id - ИД коллекции
 * @param {?boolean=} opt_mult - если false, то после первой успешной итерации цикл прерывается
 *
 * @param {?number=} [opt_count] - максимальное количество элементов в ответе (по умолчанию весь объект)
 * @param {?number=} opt_from - количество пропускаемых успешных итераций
 * @param {?number=} opt_startIndex - начальная позиция поиска
 * @param {?number=} [opt_endIndex] - конечная позиция поиска (включается)
 *
 * @param {?boolean=} opt_reverse - если true, то обход коллекции идёт с хвоста (спуск)
 * @param {?boolean=} opt_inverseFilter - если true,
 *     то успешной итерацией считается отрицательный результат
 *
 * @param {(boolean|number|null)=} opt_notOwn - если true,
 *     то итерации по объекту идут с учётом свойств прототипа,
 *     a если -1, то только свойства прототипа
 *
 * @param {?boolean=} opt_live - если true, то начальная длина коллекции не кешируется,
 *     т.е. добавленные во время операции элементы будут участвовать в обходе
 *     (только для массивов, массиво-подобных объектов, Map, Set и opt_reverse = false)
 *
 * @param {?string=} [opt_use] - тип используемого цикла внутри итератора: for, for of или for in
 * @param {Object=} [opt_vars] - объект добавляемых переменных в кластер
 *
 * @see Collection.prototype.byLink
 * @param {$$CollectionLink=} [opt_context] - дополнительный контекст
 *
 * @param {?boolean=} opt_chain - если true, то метод установит полученную коллекцию активной
 *     и вернёт ссылку на экземпляр Collection (только в случае синхронной операции)
 *
 * @param {?boolean=} opt_thread - если true, то операция разбивается на части и выполняется отложено,
 *     а сам метод вернёт ссылку на объект-генератор
 *
 * @param {?string=} opt_priority - приоритет отложенной задачи (low, normal, hight, critical)
 * @param {?function(this:Collection, ?)=} [opt_onIterationEnd] - функция обратного вызова на завершение итерации
 * @param {?function(this:Collection, ?)=} [opt_onComplete] - функция обратного вызова на завершение операции
 * @param {?function(this:Collection, ?)=} [opt_onChunk] - функция обратного вызова на
 *     завершение части отложенной операции
 *
 * @param {?boolean=} [opt_generator] - если true, то операция компилируется как генератор
 * @return {(!Collection|!Generator|?)}
 */
Collection.prototype.reduce = function (callback, opt_initialValue, opt_filterOrParams, opt_id, opt_mult, opt_count, opt_from, opt_startIndex, opt_endIndex, opt_reverse, opt_inverseFilter, opt_notOwn, opt_live, opt_use, opt_vars, opt_context, opt_chain, opt_thread, opt_priority, opt_onIterationEnd, opt_onComplete, opt_onChunk, opt_generator) {
  if (isObject(opt_filterOrParams)) {
    /** @type {$$CollectionIteratorInterface} */
    var p = _.any(opt_filterOrParams || {});
    opt_chain = _(opt_chain, p.chain);
    opt_onComplete = _(opt_onComplete, p.onComplete);
  }

  var res = opt_initialValue;
  function fn(el) {
    if (opt_initialValue == null) {
      res = el;
      opt_initialValue = true;
    } else {
      res = callback.apply(this, [res].concat(slice.call(arguments)));
    }
  }

  fn["__COLLECTION_TMP__length"] = callback.length - 1;

  var returnVal = this.forEach(fn, opt_filterOrParams, opt_id, opt_mult, opt_count, opt_from, opt_startIndex, opt_endIndex, opt_reverse, opt_inverseFilter, opt_notOwn, opt_live, opt_use, opt_vars, opt_context, res, opt_thread, opt_priority, opt_onIterationEnd, function () {
    this._chain(res, opt_chain);

    if (opt_onComplete) {
      opt_onComplete.call(this, res);
    }
  }, opt_onChunk, opt_generator);

  if (returnVal !== this) {
    return returnVal;
  }

  return opt_chain ? this : res;
};

/**
 * Группировать элементы по заданному указателю или условию (возвращает новую коллекцию)
 *
 * @param {($$CollectionLink|$$CollectionCallback)} field -
 *     1) указатель на поля для группировки;
 *     2) функция обратного вызова
 *
 * @param {($$CollectionFilter|?$$CollectionIteratorInterface)=} opt_filterOrParams -
 *     1) функция-фильтр;
 *     2) строковое выражение (запись эквивалентна: return + строковое выражение);
 *     3) true (если фильтр отключён).
 *     ИЛИ объект, свойствами которого указаны параметры функции (приставки opt_ отбрасываются)
 *
 * @param {?string=} opt_id - ИД коллекции
 * @param {?number=} [opt_count] - максимальное количество элементов (по умолчанию весь объект)
 * @param {?number=} opt_from - количество пропускаемых успешных итераций
 * @param {?number=} opt_startIndex - начальная позиция поиска
 * @param {?number=} [opt_endIndex] - конечная позиция поиска (включается)
 *
 * @param {?boolean=} opt_reverse - если true, то обход коллекции идёт с хвоста (спуск)
 * @param {?boolean=} opt_inverseFilter - если true,
 *     то успешной итерацией считается отрицательный результат
 *
 * @param {(boolean|number|null)=} opt_notOwn - если true,
 *     то итерации по объекту идут с учётом свойств прототипа,
 *     a если -1, то только свойства прототипа
 *
 * @param {?boolean=} opt_live - если true, то начальная длина коллекции не кешируется,
 *     т.е. добавленные во время операции элементы будут участвовать в обходе
 *     (только для массивов, массиво-подобных объектов, Map, Set и opt_reverse = false)
 *
 * @param {?string=} [opt_use] - тип используемого цикла внутри итератора: for, for of или for in
 * @param {Object=} [opt_vars] - объект добавляемых переменных в кластер
 *
 * @see Collection.prototype.byLink
 * @param {$$CollectionLink=} [opt_context] - дополнительный контекст
 *
 * @param {?boolean=} opt_saveKeys - если true, то сохраняются ключи, а не значения
 * @param {?boolean=} opt_useMap - если true, то для сохранения результата группировки будет использоваться Map
 *
 * @param {?boolean=} opt_chain - если true, то метод установит полученную коллекцию активной
 *     и вернёт ссылку на экземпляр Collection (только в случае синхронной операции)
 *
 * @param {?boolean=} opt_thread - если true, то операция разбивается на части и выполняется отложено,
 *     а сам метод вернёт ссылку на объект-генератор
 *
 * @param {?string=} opt_priority - приоритет отложенной задачи (low, normal, hight, critical)
 * @param {?function(this:Collection, ?)=} [opt_onIterationEnd] - функция обратного вызова на завершение итерации
 * @param {?function(this:Collection, ?)=} [opt_onComplete] - функция обратного вызова на завершение операции
 * @param {?function(this:Collection, ?)=} [opt_onChunk] - функция обратного вызова на
 *     завершение части отложенной операции
 *
 * @param {?boolean=} [opt_generator] - если true, то операция компилируется как генератор
 * @return {(!Collection|!Generator|!Object|!Map)}
 */
Collection.prototype.group = function (field, opt_filterOrParams, opt_id, opt_count, opt_from, opt_startIndex, opt_endIndex, opt_reverse, opt_inverseFilter, opt_notOwn, opt_live, opt_use, opt_vars, opt_context, opt_saveKeys, opt_useMap, opt_chain, opt_thread, opt_priority, opt_onIterationEnd, opt_onComplete, opt_onChunk, opt_generator) {
  if (isObject(opt_filterOrParams)) {
    /** @type {$$CollectionIteratorInterface} */
    var p = _.any(opt_filterOrParams || {});
    opt_saveKeys = _(opt_saveKeys, p.saveKeys);
    opt_useMap = _(opt_useMap, p.useMap);
    opt_chain = _(opt_chain, p.chain);
    opt_onComplete = _(opt_onComplete, p.onComplete);
  }

  var isFunc = isFunction(field), action;

  var res = opt_useMap ? new global["Map"]() : {};

  if (opt_useMap) {
    action = function (el, key) {
      var param = isFunc ? field.apply(this, arguments) : byLink(el, field);

      var val = opt_saveKeys ? key : el;

      if (res.has(param)) {
        res.get(param).push(val);
      } else {
        res.set(param, [val]);
      }
    };
  } else {
    action = function (el, key) {
      var param = isFunc ? field.apply(this, arguments) : byLink(el, field);

      var val = opt_saveKeys ? key : el;

      if (res[param]) {
        res[param].push(val);
      } else {
        res[param] = [val];
      }
    };
  }

  if (isFunc) {
    action["__COLLECTION_TMP__length"] = action.length > field.length ? action.length : field.length;
  }

  var returnVal = this.forEach(action, opt_filterOrParams, opt_id, true, opt_count, opt_from, opt_startIndex, opt_endIndex, opt_reverse, opt_inverseFilter, opt_notOwn, opt_live, opt_use, opt_vars, opt_context, res, opt_thread, opt_priority, opt_onIterationEnd, function () {
    this._chain(res, opt_chain);

    if (opt_onComplete) {
      opt_onComplete.call(this, res);
    }
  }, opt_onChunk, opt_generator);

  if (returnVal !== this) {
    return returnVal;
  }

  return opt_chain ? this : res;
};

/**
 * Сортировать коллекцию,
 * аналог Array.prototype.sort
 *
 * @param {($$CollectionFilter|function(this:Collection, ?): ?|?$$Collection_sort)=} [opt_fieldOrParams] -
 *     1) указатель на поле для сортировки;
 *     2) функция обратного вызова, которая возвращает значение для сортировки
 *     ИЛИ объект, свойствами которого указаны параметры метода (приставки opt_ отбрасываются)
 *
 * @param {?string=} opt_id - ИД коллекции
 *
 * @see Collection.prototype.byLink
 * @param {$$CollectionLink=} [opt_context] - дополнительный контекст
 *
 * @param {(boolean|number|null)=} opt_reverse - если true, то сортировка идёт по убыванию,
 *     а если -1, то в произвольном порядке
 *
 * @param {?string=} [opt_use] - тип используемого цикла внутри итератора: for, for of или for in
 * @param {?boolean=} opt_thread - если true, то операция разбивается на части и выполняется отложено,
 *     а сам метод вернёт ссылку на объект-генератор
 *
 * @param {?string=} opt_priority - приоритет отложенной задачи (low, normal, hight, critical)
 * @param {?function(this:Collection, ?)=} [opt_onComplete] - функция обратного вызова на завершение операции
 * @param {?function(this:Collection, ?)=} [opt_onChunk] - функция обратного вызова на
 *     завершение части отложенной операции
 *
 * @return {(!Generator|?)}
 */
Collection.prototype.sort = function (opt_fieldOrParams, opt_id, opt_context, opt_reverse, opt_use, opt_thread, opt_priority, opt_onComplete, opt_onChunk) {
  var _this19 = this;
  if (isObject(opt_fieldOrParams)) {
    /** @type {$$Collection_sort} */
    var p = _.any(opt_fieldOrParams || {});
    opt_id = _(opt_id, p.id);
    opt_context = _(opt_context, p.context);
    opt_reverse = _(opt_reverse, p.reverse);
    opt_use = _(opt_use, p.use);
    opt_thread = _(opt_thread, p.thread);
    opt_priority = _(opt_priority, p.priority);
    opt_onComplete = _(opt_onComplete, p.onComplete);
    opt_onChunk = _(opt_onChunk, p.onChunk);
    opt_fieldOrParams = _.any(p.field);
  }

  opt_reverse = opt_reverse || false;
  var data = this._getOne(opt_context, opt_id),
      isFn = isFunction(opt_fieldOrParams);

  if (!isObjectInstance(data)) {
    throw new TypeError("Incorrect data type");
  }

  var fn = function (a, b) {
    if (opt_reverse === -1) {
      return Math.round(Math.random() * 2 - 1);
    }

    var r = opt_reverse ? -1 : 1;

    if (opt_fieldOrParams) {
      if (isFn) {
        a = opt_fieldOrParams.call(_this19, a);
        b = opt_fieldOrParams.call(_this19, b);
      } else {
        a = byLink(a, opt_fieldOrParams);
        b = byLink(b, opt_fieldOrParams);
      }
    }

    if (a < b) {
      return r * -1;
    }

    if (a > b) {
      return r;
    }

    return 0;
  };

  var res;

  if (isLikeArray(data) && !opt_thread) {
    sort.call(data, fn);
    res = this._getOne(void 0, opt_id);

    if (opt_onComplete) {
      opt_onComplete.call(this, res);
    }

    return res;
  }

  var returnVal = sortObject(data, fn, opt_use, opt_thread, opt_priority, function (val) {
    if (val !== data) {
      _this19._setOne(opt_context, val, opt_id);
    }

    _this19.result = res = _this19._getOne(void 0, opt_id);

    if (opt_onComplete) {
      opt_onComplete.call(_this19, res);
    }
  }, opt_onChunk);

  if (returnVal instanceof Collection === false) {
    return returnVal;
  }

  return res;
};

/**
 * Сортировать / инвертировать объект
 *
 * @param {!Object} obj - исходный объект
 * @param {(?function(?, ?): number)=} [opt_sort] - функция сортировки
 * @param {?string=} [opt_use] - тип используемого цикла внутри итератора: for, for of или for in
 *
 * @param {?boolean=} opt_thread - если true, то операция разбивается на части и выполняется отложено,
 *     а сам метод вернёт ссылку на объект-генератор
 *
 * @param {?string=} opt_priority - приоритет отложенной задачи (low, normal, hight, critical)
 * @param {?function(this:Collection, ?)=} [opt_onComplete] - функция обратного вызова на
 *     завершение отложенной операции
 *
 * @param {?function(this:Collection, ?)=} [opt_onChunk] - функция обратного вызова на
 *     завершение части отложенной операции
 *
 * @return {(!Generator|!Collection)}
 */
function sortObject(obj, opt_sort, opt_use, opt_thread, opt_priority, opt_onComplete, opt_onChunk) {
  if (isLikeArray(obj)) {
    return sort(obj, opt_onComplete);
  }

  var values = [];
  var objIsMap = isMap(obj),
      objIsSet = isSet(obj);

  var isIterator = opt_use || !objIsMap && !objIsSet && (isGenerator(obj) || Boolean(iterator(obj)));

  /**
   * @param {!Object} arr
   * @param {number} a
   * @param {number} b
   */
  function swap(arr, a, b) {
    var tmp = arr[a];
    arr[a] = arr[b];
    arr[b] = tmp;
  }

  /**
   * @param {!Object} arr
   * @param {?function(this: ?, ?)=} [opt_onComplete]
   * @param {number=} [opt_begin]
   * @param {number=} [opt_end]
   * @return {!Collection|!Generator}
   */
  function sort(arr, opt_onComplete, opt_begin, opt_end) {
    var begin = opt_begin !== void 0 ? opt_begin : 0;

    var end = opt_end !== void 0 ? opt_end : arr.length;

    if (end - 1 > begin) {
      var _ret16 = (function () {
        var pivot = Math.floor(Math.random() * (end - begin)) + begin,
            piv = arr[pivot];

        var store = begin,
            last = end - 1;

        swap(arr, pivot, last);
        return {
          v: $C(arr).forEach(function (el, i) {
            if (opt_sort(el, piv) <= 0) {
              swap(arr, store, i);
              store++;
            }
          }, {
            onIterationEnd: function onIterationEnd() {
              swap(arr, last, store);
              this.wait(sort(arr, null, begin, store));
              this.wait(sort(arr, null, store + 1, end));
            },

            inject: obj,
            startIndex: begin,
            endIndex: last - 1,
            thread: opt_thread,
            priority: opt_priority,
            onChunk: opt_onChunk,
            onComplete: opt_onComplete
          })
        };
      })();

      if (typeof _ret16 === "object") return _ret16.v;
    }
  }

  return $C(obj).forEach(function (el, key) {
    if (isIterator || objIsSet) {
      values.push(el);
    } else {
      values.push({
        key: key,
        value: el
      });
    }

    if (objIsMap) {
      obj.delete(key);
    } else if (objIsSet) {
      obj.delete(el);
    } else {
      delete obj[key];
    }
  }, {
    use: opt_use,
    inject: obj,
    thread: opt_thread,
    priority: opt_priority,
    onComplete: opt_onComplete,
    onChunk: opt_onChunk,

    onIterationEnd: function onIterationEnd() {
      var _this20 = this;
      if (opt_sort) {
        if (values.length <= 10000 || !opt_thread) {
          values.sort(opt_sort);
        } else {
          this.wait(sort(values));
        }
      } else {
        values.reverse();
      }

      this.onComplete(function () {
        if (isIterator) {
          _this20.result = values;
          return;
        }

        _this20.wait($C(values).forEach(function (el) {
          if (objIsMap) {
            obj.set(el.key, el.value);
          } else if (objIsSet) {
            obj.add(el);
          } else {
            obj[el.key] = el.value;
          }
        }, {
          inject: obj,
          thread: opt_thread,
          priority: opt_priority,
          onChunk: opt_onChunk
        }));
      });
    }
  });
}

/**
 * Инвертировать коллекцию,
 * аналог Array.prototype.reverse
 *
 * @param {(string|?$$Collection_reverse)=} opt_idOrParams - ИД коллекции
 *     ИЛИ объект, свойствами которого указаны параметры метода (приставки opt_ отбрасываются)
 *
 * @see Collection.prototype.byLink
 * @param {$$CollectionLink=} [opt_context] - дополнительный контекст
 *
 * @param {?string=} [opt_use] - тип используемого цикла внутри итератора: for, for of или for in
 * @param {?boolean=} opt_thread - если true, то операция разбивается на части и выполняется отложено,
 *     а сам метод вернёт ссылку на объект-генератор
 *
 * @param {?string=} opt_priority - приоритет отложенной задачи (low, normal, hight, critical)
 * @param {?function(this:Collection, ?)=} [opt_onComplete] - функция обратного вызова на завершение операции
 * @param {?function(this:Collection, ?)=} [opt_onChunk] - функция обратного вызова на
 *     завершение части отложенной операции
 *
 * @return {(!Generator|?)}
 */
Collection.prototype.reverse = function (opt_idOrParams, opt_context, opt_use, opt_thread, opt_priority, opt_onComplete, opt_onChunk) {
  var _this21 = this;
  if (isObject(opt_idOrParams)) {
    /** @type {$$Collection_reverse} */
    var p = _.any(opt_idOrParams || {});
    opt_context = _(opt_context, p.context);
    opt_use = _(opt_use, p.use);
    opt_thread = _(opt_thread, p.thread);
    opt_priority = _(opt_priority, p.priority);
    opt_onComplete = _(opt_onComplete, p.onComplete);
    opt_onChunk = _(opt_onChunk, p.onChunk);
    opt_idOrParams = _.any(p.id);
  }

  var id = opt_idOrParams && String(opt_idOrParams),
      data = this._getOne(opt_context, id);

  if (!isObjectInstance(data)) {
    throw new TypeError("Incorrect data type");
  }

  var res;

  if (isLikeArray(data)) {
    reverse.call(data);
    res = this._getOne(void 0, id);

    if (opt_onComplete) {
      opt_onComplete.call(this, res);
    }

    return res;
  }

  var returnVal = sortObject(data, null, opt_use, opt_thread, opt_priority, function (val) {
    if (val !== data) {
      _this21._setOne(opt_context, val, id);
    }

    _this21.result = res = _this21._getOne(void 0, id);

    if (opt_onComplete) {
      opt_onComplete.call(_this21, res);
    }
  }, opt_onChunk);

  if (returnVal instanceof Collection === false) {
    return returnVal;
  }

  return res;
};

$C(Collection).forEach(function (el, key) {
  $C[key] = el;
});

global["define"] = globalDefine;
if (isFunction(define) && define.amd) {
  define([], function () {
    return { $C: $C, Collection: Collection };
  });
} else {
  root.Collection = Collection;
  root.$C = $C;
}
}).call(new Function('return this')(), this);
