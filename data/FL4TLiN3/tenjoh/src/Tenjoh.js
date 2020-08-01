'use strict';

var Tenjoh = function() {
    var self = this;
    self.addComponent = function(name, fn, object) {
        var index = name.indexOf('.');
        if (isUndefined(object)) object = self;
        if (index == -1) {
            object[name] = fn();
        } else {
            if (isUndefined(object[name.slice(0, index)])) object[name.slice(0, index)] = {};
            self.addComponent(name.slice(index + 1), fn, object[name.slice(0, index)]);
        }
    };
    self.__widgets = {};
    self.addWidget = function(name, fn) {
        if (isEmpty(self.__widgets[name])) {
            self.__widgets[name] = fn;
        }
    };
    self.getWidget = function(name, partial) {
        var widget = new self.__widgets[name]();
        widget.__caller = partial;
        return widget;
    };
    self.uniqueId = function() {
        return parseInt(Math.random() * 1000 * 1000).toString(16);
    };
};

var $boolean                = 'boolean',
    $console                = 'console',
    $length                 = 'length',
    $name                   = 'name',
    $object                 = 'object',
    $string                 = 'string',
    $number                 = 'number',
    $undefined              = 'undefined',
    Error                   = window.Error,
    $root,                  // delay binding
    $tenjoh                 = window.$tenjoh || (window.$tenjoh = new Tenjoh());

(function(global){
    "use strict";
    if (Object.clone) return;
    if (!Object.create || 'valueOf' in Object.create(null)){
        return new Error('ECMAScript 5 needed');
    }
    var slice                       = Array.prototype.slice,
        isArray                     = Array.isArray,
        defineProperty              = Object.defineProperty,
        getPrototypeOf              = Object.getPrototypeOf,
        getOwnPropertyNames         = Object.getOwnPropertyNames,
        getOwnPropertyDescriptor    = Object.getOwnPropertyDescriptor,
        hasOwnProperty              = Object.prototype.hasOwnProperty,
        toString                    = Object.prototype.toString;
    /* descriptor factory */
    var noEnum = function(v){
        return {
            value:v,
            enumerable:false,
            writable:true,
            configurable:true
        };
    };
    var isPrimitive = (function(types){
        return function isPrimitive(o){
            return typeof(o) in types || o === null
        }
    })({
        'null':1, 'undefined':1, 'boolean':1, 'number':1, 'string':1
    });
    var isFunction = function isFunction(o){
        return typeof(o) === 'function';
        /* toString.call(o) === '[object Function]'; */
    };

    /* return as is, shallow or deep -- primitives + function */
    [Boolean, Number, String, Function].forEach(function (cf){
        defineProperty(cf.prototype, 'clone', noEnum(function clone(deep){
            return this.valueOf();
        }));
    });

    /* deep copy by new */
    [Date].forEach(function (cf){
        defineProperty(cf.prototype, 'clone', noEnum(function clone(deep){
            return deep ? new this.constructor(this) : this
        }));
    });
    /* general-purpose clone */
    var cloneObject = function clone(src, deep, noProto){
        if (isPrimitive(src)) return src;
        if (isArray(src) || isFunction(src)) return src.clone(deep, noProto);
        var proto = getPrototypeOf(src);
        if (proto){
            if (typeof(proto.cloneNode) === 'function')
                return src.cloneNode(deep);
            if (!noProto && hasOwnProperty.call(proto, 'clone'))
                return proto.clone.call(src, deep, noProto);
        }
        /* faithfully copy each property */
        var dst = Object.create(proto);
        getOwnPropertyNames(src).forEach(function(k){
            var desc = getOwnPropertyDescriptor(src, k);
            if (desc){ /* maybe undefined on Android :( */
                /* getters and setters are not deep-copied */
                if (deep && 'value' in desc)
                    desc.value = clone(src[k], deep, noProto);
                defineProperty(dst, k, desc);
            }else{
                dst[k] = clone(src[k], deep, noProto);
            }
        });
        return dst;
    };
    /* install methods */
    defineProperty(Array.prototype, 'clone', noEnum(function clone(deep, noProto){
        return !deep ? slice.call(this)
            : this.map(function(elem){
            return cloneObject(elem, deep, noProto);
        });
    }));
    defineProperty(Object.prototype, 'clone', noEnum(function clone(deep){
        return cloneObject(this, deep, true);
    }));
    defineProperty(Object, 'isPrimitive', noEnum(isPrimitive));
    defineProperty(Object, 'clone', noEnum(cloneObject));
})(this);
String.prototype.trim = function() { return this.replace(/^\s+|\s+$/g, ""); };
String.prototype.replaceAll = function (org, dest) { return this.split(org).join(dest); };
String.prototype.replaceFirst = function (org, dest) {
    var result;
    if (this.indexOf(org) != -1) {
        result = this.slice(0, this.indexOf(org));
        result = result + dest;
        result = result + this.slice(this.indexOf(org) + org.length);
        return result;
    } else {
        return this;
    }
};

function noop() {}
function now() { return new Date().getTime(); }
function lowercase(string) { return isString(string) ? string.toLowerCase() : string; }
function uppercase(string) { return isString(string) ? string.toUpperCase() : string; }
function isUndefined(_var) { return typeof _var === $undefined; }
function isDefined(_var) { return typeof _var !== $undefined; }
function isObject(value) { return value != null && typeof value == $object  && !isArray(value); }
function isTypeObject(value) { return value != null && typeof value == $object  && !isArray(value); }
function isArray(value) { return Object.prototype.toString.apply(value) == '[object Array]'; }
function isNumber(value) { return typeof value == 'number'; }
function isString(value) { return typeof value == $string; }
function isFunction(_var) { return typeof _var == 'function'; }
function isBoolean(value) { return typeof value == $boolean; }
function isEmpty(_var) { return isUndefined(_var) || _var == null || isEmptyObject(_var); }
function isEmptyObject(_var) { return typeof _var == $object && _var.length == 0 }
function getRandomArbitary(min, max) { return Math.random() * (max - min) + min; }
function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function forEach(obj, iterator, context) {
    var key;
    if (obj) {
        if (isFunction(obj)) {
            for (key in obj) {
                if (key != 'prototype' && key != $length && key != $name
                        && obj.hasOwnProperty(key)) {
                    iterator.call(context, obj[key], key);
                }
            }
        } else if (obj.forEach && obj.forEach !== forEach) {
            obj.forEach(iterator, context);
        } else if (isObject(obj) && isNumber(obj.length)) {
            for (key = 0; key < obj.length; key++)
                iterator.call(context, obj[key], key);
        } else {
            for (key in obj)
                iterator.call(context, obj[key], key);
        }
    }
    return obj;
}

function sortedKeys(obj) {
    var keys = [];
    for ( var key in obj) {
        if (obj.hasOwnProperty(key)) {
            keys.push(key);
        }
    }
    return keys.sort();
}

function forEachSorted(obj, iterator, context) {
    var keys = sortedKeys(obj);
    for ( var i = 0; i < keys.length; i++) {
        iterator.call(context, obj[keys[i]], keys[i]);
    }
    return keys;
}
function zeroPadding(string, length) {
    while (string.length < length) {
        string = '0' + string;
    }
    return string;
}
window.sprintf || (function() {
    var _BITS = { i: 0x8011, d: 0x8011, u: 0x8021, o: 0x8161, x: 0x8261, X: 0x9261, f: 0x92, c: 0x2800, s: 0x84 },
        _PARSE = /%(?:(\d+)\$)?(#|0)?(\d+)?(?:\.(\d+))?(l)?([%iduoxXfcs])/g;
    window.sprintf = _sprintf;
    function _sprintf(format) {
        function _fmt(m, argidx, flag, width, prec, size, types) {
            if (types === "%") { return "%"; }
            var v = "", w = _BITS[types], overflow, pad;
            idx = argidx ? parseInt(argidx) : next++;
            w & 0x400 || (v = (av[idx] === void 0) ? "" : av[idx]);
            w & 3 && (v = (w & 1) ? parseInt(v) : parseFloat(v), v = isNaN(v) ? "": v);
            w & 4 && (v = ((types === "s" ? v : types) || "").toString());
            w & 0x20  && (v = (v >= 0) ? v : v % 0x100000000 + 0x100000000);
            w & 0x300 && (v = v.toString(w & 0x100 ? 8 : 16));
            w & 0x40  && (flag === "#") && (v = ((w & 0x100) ? "0" : "0x") + v);
            w & 0x80  && prec && (v = (w & 2) ? v.toFixed(prec) : v.slice(0, prec));
            w & 0x6000 && (overflow = (typeof v !== "number" || v < 0));
            w & 0x2000 && (v = overflow ? "" : String.fromCharCode(v));
            w & 0x8000 && (flag = (flag === "0") ? "" : flag);
            v = w & 0x1000 ? v.toString().toUpperCase() : v.toString();
            if (!(w & 0x800 || width === void 0 || v.length >= width)) {
                pad = Array(width - v.length + 1).join(!flag ? " " : flag === "#" ? " " : flag);
                v = ((w & 0x10 && flag === "0") && !v.indexOf("-")) ? ("-" + pad + v.slice(1)) : (pad + v);
            }
            return v;
        }
        var next = 1, idx = 0, av = arguments;
        return format.replace(_PARSE, _fmt);
    }
})();

