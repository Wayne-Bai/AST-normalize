//This is so not stable it's not even funny so be prepared for breakage.
//In node or chrome it requires you somehow load the included direct-proxies shim.
//This isn't set up to work in Firefox yet but it should be done by loading the shim without the V8 wrapper.

if (typeof global.Proxy === 'object') {
  var Reflect = require('direct-proxies');
  var Proxy = Reflect.Proxy;
}

var reified = require('reified');

var wrapmap = new WeakMap;
var typemap = new WeakMap;
var proxies = new WeakMap;

function unwrapIface(o){ return wrapmap.get(o) }
function unwrapType(o){ return typemap.get(o) }
function unwrap(o){ return proxies.get(o) }
reified.unwrap = unwrap;

function dataWrap(data){
  var iface = {
    array: function(){ return Array.apply(null, Array(data.length)) },
    struct: function(){ return {} },
    numeric: function(){ return new Number },
    bitfield: function(){ return {} }
  }[data.DataType]();

  wrapmap.set(iface, data);
  typemap.set(iface, data.constructor);
  var proxy = Proxy(iface, handler(data));
  proxies.set(proxy, data);
  return proxy;
}



Array.isArray = function(orig){
  return function isArray(){
    var arr = arguments[0];
    if (Object(arr) === arr && proxies.has(arr)) {
      return unwrap(arr).DataType === 'array';
    } else {
      return orig(arr);
    }
  }
}(Array.isArray);

function unique(a){
  return Object.keys(a.reduce(function(r,s){ r[s]=1; return r },{}));
}

function rewrap(target, property){
  var val = unwrapIface(target)[property];
  return val.DataType === 'numeric' ? val.reify() : dataWrap(val);
}

function typeWrap(o){
  var proxy = Proxy(o, TypeHandler);
  wrapmap.set(proxy, o);
  return proxy;
}

var TypeHandler = {
  apply: function(target, receiver, args){
    return dataWrap(Reflect.construct(target, args));
  },
  construct: function(target, args){
    return dataWrap(Reflect.construct(target, args));
  }
};

function handler(of){
  return Proxy({}, {
    get: function(t, trap){
      return function(target, name, val){
        var res = DataHandler[trap].apply(t, arguments);
        if (1) {
          if (trap === 'apply') name = undefined;
          if (trap === 'get') val = undefined;
          if (trap === 'construct') val = name, name = undefined;
          var log = [trap];
          name && log.push(name);
          val && log.push(val);
          res !== undefined && log.push(res);
          console.log.apply(console, log)
        }
        return res;
      }
    }
  });
}

function NormalDesc(v){ this.value = v }
NormalDesc.prototype = { enumerable: true, configurable: true, writable: true }
function HiddenDesc(v){ this.value = v }
HiddenDesc.prototype = { configurable: true, writable: true }

var DataHandler = {
  __proto__: Reflect,
  getOwnPropertyNames: function(target){
    return unique(unwrapType(target).keys.concat(Reflect.getOwnPropertyNames(target)));
  },
  keys: function(target){
    return unique(unwrapType(target).keys.concat(Reflect.keys(target)));
  },
  getOwnPropertyDescriptor: function(target, name){
    if (~unwrapType(target).keys.indexOf(name)) {
      return new NormalDesc(rewrap(target, name));
    } else {
      return Reflect.getOwnPropertyDescriptor(target, name);
    }
  },
  enumerate: function(target){
    return Reflect.enumerate(target);
  },
  iterate: function(target){
    return Reflect.iterate(target);
  },
  get: function(target, name, receiver){
    if (name === '__proto__') {
      return Object.getPrototypeOf(target);
    } else if (~unwrapType(target).keys.indexOf(name)) {
      return rewrap(target, name);
    } else {
      return Reflect.get(target, name, receiver);
    }
  },
  set: function(target, name, value, receiver){
    if (name === '__proto__') {
      target.__proto__ = value;
    } else if (~unwrapType(target).keys.indexOf(name)) {
      unwrapIface(target)[name] = value;
    } else {
      Reflect.set(target, name, value, receiver);
    }
  },
  apply: function(target, receiver, args){
    return unwrapIface(target);
  }
};



var reify = module.exports = Proxy(reified, {
  apply: function(target, receiver, args){
    return typeWrap(Reflect.apply(target, receiver, args));
  },
  construct: function(target, args){
    return dataWrap(Reflect.construct(target, args));
  }
});


var RGB = reify('RGB', { r: 'Uint8', g: 'Uint8', b: 'Uint8' });

var red = RGB({r: 0, g: 0, b: 0 });
red.r = 100;
console.log(red);
/*

var traps = {
  getOwnPropertyDescriptor  : ['target', 'name']                       , //->  desc | undefined
  getOwnPropertyNames       : ['target']                               , //->  [ string ]
  defineProperty            : ['target', 'name', 'descriptor']         , //->  boolean
  preventExtensions         : ['target']                               , //->  boolean
  freeze                    : ['target']                               , //->  boolean
  seal                      : ['target']                               , //->  boolean
  deleteProperty            : ['target', 'name']                       , //->  boolean
  hasOwn                    : ['target', 'name']                       , //->  boolean
  has                       : ['target', 'name']                       , //->  boolean
  get                       : ['target', 'name', 'receiver']           , //->  any
  set                       : ['target', 'name', 'value', 'receiver']  , //->  boolean
  enumerate                 : ['target']                               , //->  [ string ]
  iterate                   : ['target']                               , //->  iterator
  keys                      : ['target']                               , //->  [ string ]
  apply                     : ['target', 'receiver', 'args']           , //->  any
  construct                 : ['target', 'args']                       , //->  any
};
*/

