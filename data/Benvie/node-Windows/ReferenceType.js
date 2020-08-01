module.exports = ReferenceType;

var _hasOwn = Object.prototype.hasOwnProperty,
    _apply = Function.prototype.apply,
    _bind = Function.prototype.bind;

var decorate = require('./utils').decorate;

var references = new WeakMap;

function ReferenceType(name, keys, accessors){
  this.accessors = Object.create(null);
  this.refKeys = Object.create(null);

  if (Array.isArray(keys)) {
    this.names = keys;
    keys.forEach(function(key){ this[key] = key }, this.refKeys);
  } else {
    this.names = Object.keys(keys);
    this.names.forEach(function(key){ this[key] = keys[key] }, this.refKeys);
  }

  if (accessors) {
    var accessorKeys = Object.keys(accessors);
    this.names = this.names.concat(accessorKeys);
    accessorKeys.forEach(function(key){
      this[key] = Object.getOwnPropertyDescriptor(accessors, key);
    }, this.accessors);
  }

  function ReferenceHandler(target, ref){
    this.reference = ref;
    this.target = target;
  }

  ReferenceHandler.prototype = this;

  var Ctor = new Function('create', 'return function '+name+'(ref){ return create(this, ref) }')(function(instance, ref){
    var proxy = Proxy.create(new ReferenceHandler(instance, ref), Ctor.prototype);
    references.set(proxy, ref);
    return proxy;
  });
  return Ctor;
}

ReferenceType.unwrap = function unwrap(target){
  return references.get(target);
};

ReferenceType.listAccessors = function listAccessors(o){
  return Object.getOwnPropertyNames(o).filter(function(key){
    return !('value' in Object(Object.getOwnPropertyDescriptor(o, key)));
  });
};


decorate(ReferenceType.prototype, [
  function keys(){
    return this.names.concat(Object.keys(this.target));
  },
  function enumerate(){
    var i = this.names.length, k = this.names.slice();
    for (k[i++] in this.target);
    return k;
  },
  function getOwnPropertyNames(){
    return this.names.concat(Object.getOwnPropertyNames(this.target));
  },
   function get(rcvr, key){
    if (key === '__proto__') {
      return this.target.__proto__;
    } else if (key in this.refKeys) {
      return this.reference[this.refKeys[key]];
    } else if (key in this.accessors) {
      return this.accessors[key].get.call(this.reference);
    } else {
      return this.target[key];
    }
  },
  function set(rcvr, key, value){
    if (key in this.refKeys) {
      this.reference[this.refKeys[key]] = value;
    } else if (key in this.accessors) {
      this.accessors[key].set.call(this.reference, value);
    } else {
      this.target[key] = value;
    }
    return true;
  },
  function has(key){
    return key in this.refKeys || key in this.accessors || key in this.target;
  },
  function hasOwn(key){
    return key in this.refKeys || key in this.accessors || _hasOwn.call(this.target, key);
  },
  function delet\u0065(key){
    if (key in this.refKeys) {
      delete this.reference[this.refKeys[key]];
    } else {
      delete this.target[key];
    }
    return true;
  },
  function defineProperty(key, desc){
    if (key in this.refKeys) {
      Object.defineProperty(this.reference, this.refKeys[key], desc);
    } else if (key in this.accessors) {
      this.accessors[key].set.call(this.reference, desc.value);
    } else {
      Object.defineProperty(this.target, key, desc);
    }
    return true;
  },
  function getOwnPropertyDescriptor(key){
    var desc;
    if (key in this.refKeys) {
      desc = Object.getOwnPropertyDescriptor(this.reference, this.refKeys[key]) || {
        configurable: true,
        enumerable: true,
        writable: true,
        value: this.reference[this.refKeys[key]]
      };
    } else if (key in this.accessors) {
      desc = {
        configurable: true,
        enumerable: true,
        writable: true,
        value: this.accessors[key].get.call(this.reference)
      };
    } else {
      desc = Object.getOwnPropertyDescriptor(this.target, key);
    }
    desc && (desc.configurable = true);
    return desc;
  },
  function apply(rcvr, args){
    return _apply.call(this.reference, rcvr, args);
  },
  function construct(args){
    return new (_bind.apply(this.reference, [null].concat(args)));
  }
]);
