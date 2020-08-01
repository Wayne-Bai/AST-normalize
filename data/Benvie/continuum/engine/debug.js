var debug = (function(exports){
  "use strict";
  var objects   = require('./lib/objects'),
      iteration = require('./lib/iteration'),
      utility   = require('./lib/utility'),
      constants = require('./constants'),
      runtime   = require('./runtime'),
      engine    = require('./engine').engine;

  var isObject   = objects.isObject,
      inherit    = objects.inherit,
      create     = objects.create,
      define     = objects.define,
      assign     = objects.assign,
      properties = objects.properties,
      hasOwn     = objects.hasOwn,
      getBrandOf = objects.getBrandOf,
      Hash       = objects.Hash,
      each       = iteration.each,
      quotes     = utility.quotes,
      uid        = utility.uid;

  var ENUMERABLE   = 0x01,
      CONFIGURABLE = 0x02,
      WRITABLE     = 0x04,
      ACCESSOR     = 0x08;

  function always(value){
    return function(){ return value };
  }

  function alwaysCall(func, args){
    args || (args = []);
    return function(){ return func.apply(null, args) }
  }

  function isNegativeZero(n){
    return n === 0 && 1 / n === -Infinity;
  }

  var now = Date.now || function now(){ return +new Date };

  function realm(){
    if (!engine.activeRealm && engine.realms.length) {
      engine.changeRealm(engine.realms[0]);
    }

    return engine.activeRealm;
  }


  function Mirror(){}

  define(Mirror.prototype, {
    destroy: function(){
      this.subject = null;
      this.destroy = null;
    },
    type: null,
    getPrototype: function(){
      return _Null;
    },
    get: function(){
      return _Undefined;
    },
    getValue: function(){
      return _Undefined;
    },
    kind: 'Unknown',
    label: always(''),
    hasOwn: always(null),
    has: always(null),
    list: alwaysCall(Array),
    inheritedAttrs: alwaysCall(create, [null]),
    ownAttrs: alwaysCall(create, [null]),
    getterAttrs: alwaysCall(create, [null]),
    isExtensible: always(null),
    isEnumerable: always(null),
    isConfigurable: always(null),
    getOwnDescriptor: always(null),
    getDescriptor: always(null),
    describe: always(null),
    isAccessor: always(null),
    isWritable: always(null),
    query: always(null)
  });

  function MirrorValue(subject, label){
    this.subject = subject;
    this.type = typeof subject;
    this.kind = getBrandOf(subject)+'Value';
    if (this.type === 'number' && isNegativeZero(subject)) {
      label = '-0';
    }
    this.label = always(label);
  }

  inherit(MirrorValue, Mirror);

  function MirrorStringValue(subject){
    this.subject = subject;
  }

  inherit(MirrorStringValue, MirrorValue, {
    label: always('string'),
    kind: 'StringValue',
    type: 'string'
  });

  function MirrorNumberValue(subject){
    this.subject = subject;
  }

  inherit(MirrorNumberValue, MirrorValue, {
    label: always('number'),
    kind: 'NumberValue',
    type: 'number'
  });


  var proto = uid();


  var MirrorPrototypeAccessor = (function(){
    function MirrorPrototypeAccessor(holder, accessor, key){
      this.holder = holder;
      this.subject = accessor;
      this.key = key;
    }


    inherit(MirrorPrototypeAccessor, Mirror, {
      accessor: true,
      kind: 'Accessor'
    }, [
      function label(){
        var label = [];
        if (this.subject.Get) label.push('Getter');
        if (this.subject.Set) label.push('Setter');
        return label.join('/');
      },
      function getName(){
        return (this.subject.Get || this.subject.Set).get('name');
      }
    ]);

    return MirrorPrototypeAccessor;
  })();




  var MirrorObject = (function(){
    function MirrorObject(subject){
      subject.__introspected = this;
      this.subject = subject;
      this.accessors = new Hash;
    }

    inherit(MirrorObject, Mirror, {
      kind: 'Object',
      type: 'object',
      parentLabel: '[[proto]]',
      attrs: null,
      props: null
    }, [
      function destroy(){
        this.__introspected = null;
        this.destroy = null;
      },
      function get(key){
        if (this.isAccessor(key)) {
          var prop = this.describe(key),
              accessor = prop[1] || prop[3];

          if (!this.accessors[key]) {
            if (this.subject.isProto) {
              this.accessors[key] = new MirrorPrototypeAccessor(this.subject, accessor, key);
            } else {
              this.accessors[key] = new MirrorAccessor(this.subject, accessor, key);
            }
          }
          return this.accessors[key];
        } else {
          var prop = this.subject.describe(key);
          if (prop) {
            return introspect(prop[1]);
          } else {
            return this.getPrototype().get(key);
          }
        }
      },
      function describe(key){
        return this.subject.describe(key) || this.getPrototype().describe(key);
      },
      function isClass(){
        return !!this.subject.Class;
      },
      function getBrand(){
        return this.subject.BuiltinBrand;
      },
      function getValue(key){
        return this.get(key).subject;
      },
      function getPrototype(){
        //return introspect(this.subject.GetInheritance());
        var obj = this.subject;
        do {
          obj = obj.GetInheritance();
        } while (obj && obj.HiddenPrototype)
        return introspect(obj);
      },
      function setPrototype(value){
        realm().enterMutationContext();
        var proto = this.subject.Prototype;

        if (proto && proto.HiddenPrototype) {
          var result = proto.SetInheritance(value);
        } else {
          var result = this.subject.SetInheritance(value);
        }

        realm().exitMutationContext();
        return introspect(result);
      },
      function set(key, value){
        realm().enterMutationContext();
        var result = introspect(this.subject.set(key, value));
        realm().exitMutationContext();
        return result;
      },
      function update(key, attr){
        realm().enterMutationContext();
        var result = introspect(this.subject.update(key, attr));
        realm().exitMutationContext();
        return result;
      },
      function defineProperty(key, desc){
        desc = Object(desc);
        var Desc = {};
        if ('value' in desc) {
          Desc.Value = desc.value;
        }
        if ('get' in desc) {
          Desc.Get = desc.get;
        }
        if ('set' in desc) {
          Desc.Set = desc.set;
        }
        if ('enumerable' in desc) {
          Desc.Enumerable = desc.enumerable;
        }
        if ('configurable' in desc) {
          Desc.Configurable = desc.configurable;
        }
        if ('writable' in desc) {
          Desc.Writable = desc.writable;
        }
        realm().enterMutationContext();
        var ret = this.subject.DefineOwnProperty(key, Desc, false);
        realm().exitMutationContext();
        return ret;
      },
      function hasOwn(key){
        if (this.subject) {
          return this.subject.has(key);
        } else {
          return false;
        }
      },
      function has(key){
        return this.hasOwn(key) || this.getPrototype().has(key);
      },
      function isExtensible(key){
        return this.subject.IsExtensible();
      },
      function getDescriptor(key){
        return this.getOwnDescriptor(key) || this.getPrototype().getDescriptor(key);
      },
      function getOwnDescriptor(key){
        var prop = this.subject.describe(key);
        if (prop) {
          if (prop[2] & ACCESSOR) {
            return {
              name: prop[0],
              get: prop[1].Get,
              set: prop[1].Set,
              enumerable: (prop[2] & ENUMERABLE) > 0,
              configurable: (prop[2] & CONFIGURABLE) > 0
            }
          } else {
            return {
              name: prop[0],
              value: prop[1],
              writable: (prop[2] & WRITABLE) > 0,
              enumerable: (prop[2] & ENUMERABLE) > 0,
              configurable: (prop[2] & CONFIGURABLE) > 0
            }
          }
        }
      },
      function getInternal(name){
        return this.subject[name];
      },
      function isEnumerable(key){
        return (this.query(key) & ENUMERABLE) > 0;
      },
      function isConfigurable(key){
        return (this.query(key) & CONFIGURABLE) > 0;
      },
      function isAccessor(key){
        return (this.query(key) & ACCESSOR) > 0;
      },
      function isWritable(key){
        var prop = this.subject.describe(key);
        if (prop) {
          return !!(prop[2] & ACCESSOR ? prop[1].Set : prop[2] & WRITABLE);
        } else {
          return this.subject.IsExtensible();
        }
      },
      function query(key){
        var attrs = this.subject.query(key);
        return attrs === null ? this.getPrototype().query(key) : attrs;
      },
      function toStringTag(){
        if (this.subject.toStringTag) {
          return this.subject.toStringTag();
        }
        return '';
      },
      function label(){
        var tag = this.toStringTag();
        if (tag) {
          return tag;
        }

        var brand = this.subject.BuiltinBrand;
        if (brand && brand !== 'BuiltinObject') {
          return brandMap[brand];
        }

        if (this.subject.ConstructorName) {
          return this.subject.ConstructorName;
        } else if (this.has('constructor')) {
          var ctorName = this.get('constructor').get('name');
          if (ctorName.subject && typeof ctorName.subject === 'string') {
            return ctorName.subject;
          }
        }

        return 'Object';
      },
      function inheritedAttrs(){
        return this.ownAttrs(this.getPrototype().inheritedAttrs());
      },
      function ownAttrs(props){
        props || (props = new Hash);
        this.subject.each(function(prop){
          var key = prop[0] === '__proto__' ? proto : prop[0];
          props[key] = prop;
        });
        return props;
      },
      function getterAttrs(own){
        var inherited = this.getPrototype().getterAttrs(),
            props = this.ownAttrs();

        for (var k in props) {
          if (own || (props[k][2] & ACCESSOR)) {
            inherited[k] = props[k];
          }
        }
        return inherited;
      },
      function list(hidden, own){
        var keys = [],
            props = own
              ? this.ownAttrs()
              : own === false
                ? this.inheritedAttrs()
                : this.getterAttrs(true);

        for (var k in props) {
          var prop = props[k];
          if (hidden || !prop[0].Private && (prop[2] & ENUMERABLE)) {
            keys.push(prop[0]);
          }
        }

        return keys.sort();
      }
    ]);

    return MirrorObject;
  })();



  var MirrorArray = (function(){

    function MirrorArray(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorArray, MirrorObject, {
      kind: 'Array'
    }, [
      function list(hidden, own){
        var keys = [],
            indexes = [],
            len = this.getValue('length'),
            props = own
              ? this.ownAttrs()
              : own === false
                ? this.inheritedAttrs()
                : this.getterAttrs(true);


        for (var k in props) {
          var prop = props[k];
          if (hidden || !prop[0].Private && (prop[2] & ENUMERABLE)) {
            if (prop[0] >= 0 && prop[0] < len) {
              indexes.push(prop[0]);
            } else {
              keys.push(prop[0]);
            }
          }
        }

        return indexes.concat(keys.sort());
      }
    ]);

    return MirrorArray;
  })();


  var MirrorArguments = (function(){
    function MirrorArguments(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorArguments, MirrorArray, {
      kind: 'Arguments'
    });

    return MirrorArguments;
  })();


  var MirrorArrayBufferView = (function(){
    function MirrorArrayBufferView(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorArrayBufferView, MirrorArray, {
      kind: 'ArrayBuffer'
    }, [
      function label(){
        return brandMap[this.subject.BuiltinBrand];
      }
    ]);
    return MirrorArrayBufferView;
  })();

  var MirrorDate = (function(){

    function MirrorDate(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorDate, MirrorObject, {
      kind: 'Date'
    }, [
      function primitiveValue(){
        return this.subject.DateValue;
      },
      function label(){
        var toLocaleString = this.subject.Get('toLocaleString');
        if (toLocaleString) {
          return toLocaleString.Call(this.subject, []);
        }
        return 'Invalid Date';
      }
    ]);

    return MirrorDate;
  })();


  var MirrorError = (function(){
    function MirrorError(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorError, MirrorObject, {
      kind: 'Error'
    }, [
      function label(){
        return this.getValue('name');
      }
    ]);

    return MirrorError;
  })();


  var MirrorThrown = (function(){
    function MirrorThrown(subject){
      if (isObject(subject)) {
        MirrorError.call(this, subject);
      } else {
        return introspect(subject);
      }
    }

    inherit(MirrorThrown, MirrorError, {
      kind: 'Thrown'
    }, [
      function getError(){
        if (this.subject.BuiltinBrand === 'StopIteration') {
          return 'StopIteration';
        }
        return this.getValue('name') + ': ' + this.getValue('message');
      },
      function origin(){
        var file = this.getValue('filename') || '',
            type = this.getValue('origin') || '';

        return file && type ? type + ' ' + file : type + file;
      },
      function trace(){
        return this.subject.trace;
      },
      function context(){
        return this.subject.context;
      }
    ]);

    return MirrorThrown;
  })();


  var MirrorFunction = (function(){
    function MirrorFunction(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorFunction, MirrorObject, {
      type: 'function',
      kind: 'Function'
    }, [
      function getName(){
        return this.subject.get('name');
      },
      function getDetails(){
        var params = this.subject.FormalParameters;
        if (params && params.reduced) {
          return params.reduced;
        }
        return { params: [], defaults: [], name: this.getName(), rest: null };
      },
      function apply(receiver, args){
        if (receiver.subject) {
          receiver = receiver.subject;
        }
        realm().enterMutationContext();
        var ret = this.subject.Call(receiver, args);
        realm().exitMutationContext();
        return introspect(ret);
      },
      function construct(args){
        if (this.subject.Construct) {
          realm().enterMutationContext();
          var ret = this.subject.Construct(args);
          realm().exitMutationContext();
          return introspect(ret);
        } else {
          return false;
        }
      },
      function getScope(){
        return introspect(this.subject.Scope);
      },
      function isStrict(){
        return !!this.subject.Strict;
      },
      function isClass(){
        return !!this.subject.isClass;
      },
      function isConstructor(){
        return !!this.subject.isConstructor || this.subject.constructCount > 0;
      },
      function isGenerator(){
        return !!this.subject.isGenerator;
      },
      function ownAttrs(props){
        var strict = this.isStrict();
        props || (props = new Hash);
        this.subject.each(function(prop){
          if (!prop[0].Private) {
            var key = prop[0] === '__proto__' ? proto : prop[0];
            props[key] = prop;
          }
        });
        return props;
      }
    ]);

    return MirrorFunction;
  })();



  var MirrorGlobal = (function(){
    function MirrorGlobal(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorGlobal, MirrorObject, {
      kind: 'Global'
    }, [
      function getEnvironment(){
        return introspect(this.subject.env);
      }
    ]);

    return MirrorGlobal;
  })();


  var MirrorJSON = (function(){
    function MirrorJSON(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorJSON, MirrorObject, {
      kind: 'JSON'
    });

    return MirrorJSON;
  })();


  var MirrorMath = (function(){
    function MirrorMath(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorMath, MirrorObject, {
      kind: 'Math'
    });

    return MirrorMath;
  })();


  var MirrorModule = (function(){
    function MirrorModule(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorModule, MirrorObject, {
      kind: 'Module'
    }, [
      function get(key){
        if (this.isAccessor(key)) {
          if (!this.accessors[key]) {
            var prop = this.describe(key),
                accessor = prop[1] || prop[3];

            realm().enterMutationContext();
            this.accessors[key] = introspect(accessor.Get.Call(this.subject, []));
            realm().exitMutationContext();
          }

          return this.accessors[key];
        } else {
          return introspect(this.subject.get(key));
        }
      }
    ]);

    return MirrorModule;
  })();

  var MirrorRegExp = (function(){
    function MirrorRegExp(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorRegExp, MirrorObject, {
      kind: 'RegExp'
    }, [
      function label(){
        return this.subject.PrimitiveValue+'';
      }
    ]);

    return MirrorRegExp;
  })();



  var MirrorPrimitiveWrapper = (function(){
    function MirrorPrimitiveWrapper(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorPrimitiveWrapper, MirrorObject, {
      kind: 'PrimitiveWrapper'
    }, [
      function primitiveValue(){
        return this.subject.getPrimitiveValue();
      },
      function primitiveLabel(){
        return ''+this.primitiveValue();
      },
      function label(){
        return MirrorObject.prototype.label.call(this)+'('+this.primitiveLabel()+')';
      }
    ]);

    return MirrorPrimitiveWrapper;
  })();

  var MirrorBoolean = (function(){
    function MirrorBoolean(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorBoolean, MirrorPrimitiveWrapper, {
      kind: 'Boolean'
    }, [
      function primitiveValue(){
        return this.subject.BooleanValue;
      }
    ]);

    return MirrorBoolean;
  })();

  var MirrorNumber = (function(){
    function MirrorNumber(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorNumber, MirrorPrimitiveWrapper, {
      kind: 'Number'
    }, [
      function primitiveValue(){
        return this.subject.NumberValue;
      }
    ]);

    return MirrorNumber;
  })();


  var MirrorString = (function(){
    function MirrorString(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorString, MirrorPrimitiveWrapper,{
      kind: 'String'
    }, [
      MirrorArray.prototype.list,
      function primitiveValue(){
        return this.subject.StringValue;
      },
      function primitiveLabel(){
        return quotes(this.subject.StringValue);
      }
    ]);

    return MirrorString;
  })();


  var MirrorSymbol = (function(){
    function MirrorSymbol(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorSymbol, MirrorObject, {
      kind: 'Symbol'
    }, [
      function label(){
        return '@' + (this.subject.Name || 'Symbol');
      },
      function isPrivate(){
        return this.subject.Private;
      }
    ]);

    return MirrorSymbol;
  })();



  var MirrorCollection = (function(){
    function CollectionIterator(data){
      this.guard = this.current = data.guard;
      this.index = 0;
    }

    define(CollectionIterator.prototype, [
      function next(){
        if (!this.current || this.current.next === this.guard) {
          this.guard = this.current = null;
          throw StopIteration;
        }
        this.index++;
        return this.current = this.current.next;
      }
    ]);

    function MirrorCollection(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorCollection, MirrorObject, [
      function count(){
        return this.data.size;
      },
      function __iterator__(){
        return new CollectionIterator(this.data);
      }
    ]);

    return MirrorCollection;
  })();

  var MirrorNil = (function(){
    function MirrorNil(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorNil, MirrorObject, {
      kind: 'Nil'
    }, [
      function label(){
        return 'nil';
      },
      function list(){
        return [];
      }
    ]);

    return MirrorNil;
  })();


  var MirrorSet = (function(){
    function MirrorSet(subject){
      MirrorCollection.call(this, subject);
      var map = this.subject.SetData;
      if (map) {
        this.data = map.MapData;
      }
    }

    inherit(MirrorSet, MirrorCollection, {
      kind: 'Set'
    }, [
    ]);

    return MirrorSet;
  })();

  var MirrorMap = (function(){
    function MirrorMap(subject){
      MirrorCollection.call(this, subject);
      this.data = this.subject.MapData;
    }

    inherit(MirrorMap, MirrorCollection, {
      kind: 'Map'
    }, [
    ]);

    return MirrorMap;
  })();


  var MirrorWeakMap = (function(){
    function MirrorWeakMap(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorWeakMap, MirrorObject, {
      kind: 'WeakMap'
    });

    return MirrorWeakMap;
  })();


  var MirrorAccessor = (function(){
    function MirrorAccessor(holder, accessor, key){
      this.holder = holder;
      this.accessor = accessor;
      this.key = key;
      this.refresh();
    }


    inherit(MirrorAccessor, Mirror, {
      accessor: true
    }, [
      function refresh(){
        var timestamp = now();
        if (this.cooldown && timestamp - this.cooldown < 10000) return;
        this.cooldown = timestamp;
        if (this.cooldown)
        if (this.accessor.Get) {
          if (this.accessor.Get.isStrictThrower) {
            var subject = this.accessor.Get;
            this.refresh = function(){ return this }
          } else {
            realm().enterMutationContext();
            var subject = this.accessor.Get.Call(this.holder, []);
            realm().exitMutationContext();
          }
        } else {
          var subject = undefined;
        }
        if (subject !== this.subject || !this.introspected) {
          this.subject = subject;
          this.introspected = introspect(subject);
          this.kind = this.introspected.kind;
          this.type = this.introspected.type;
        }
        return this;
      },
      function destroy(){
        if (this.introspected.destroy) {
          this.introspected.destroy();
        }
        this.subject = null;
        this.destroy = null;
        this.holder = null;
        this.key = null;
      }
    ]);

    function forward(func, key){
      if (hasOwn(MirrorAccessor.prototype, key)) return;
      var src = func+'',
          paren = src.indexOf('('),
          name = src.slice(src.indexOf(' ') + 1, paren),
          args = src.slice(paren, src.indexOf(')') + 1),
          ref = 'this.introspected.'+name,
          forwarder = new Function('return function '+name+args+'{ this.refresh(); if ('+ref+') return '+ref+args+' }')();

      define(MirrorAccessor.prototype, forwarder);
    }

    each([MirrorObject, MirrorFunction, MirrorThrown, MirrorPrimitiveWrapper], function(Mirror){
      each(properties(Mirror.prototype), function(key){
        if (typeof Mirror.prototype[key] === 'function') {
          forward(Mirror.prototype[key], key);
        }
      });
    });

    return MirrorAccessor;
  })();

  var MirrorProxy = (function(){
    function MirrorProxy(subject){
      if (subject.__introspected) {
        return subject.__introspected;
      }
      subject.__introspected = this;
      this.subject = subject;
      if ('Call' in subject) {
        this.type = 'function';
      }
      this.target = introspect(subject.ProxyTarget);
      this.cache = new Hash;
      this.kind = this.target.kind;
      if (this.kind === 'Scope' || this.kind === 'Global') {
        this.kind = 'Object';
      }
    }

    function descToAttrs(desc){
      if (desc) {
        if ('Value' in desc) {
          return desc.Enumerable | (desc.Configurable << 1) | (desc.Writable << 2);
        }
        return desc.Enumerable | (desc.Configurable << 1) | ACCESSOR;
      }
    }

    function attrsToDesc(attrs){
      var desc = {};
      if (attrs > 0) {
        if (attrs & ENUMERABLE) desc.Enumerable = true;
        if (attrs & CONFIGURABLE) desc.Configurable = true;
        if (attrs & WRITABLE) desc.Writable = true;
      }
      return desc;
    }

    inherit(MirrorProxy, Mirror, {
      type: 'object'
    }, [
      MirrorObject.prototype.getInternal,
      MirrorObject.prototype.isExtensible,
      MirrorObject.prototype.getPrototype,
      MirrorObject.prototype.setPrototype,
      MirrorObject.prototype.inheritedAttrs,
      MirrorObject.prototype.getterAttrs,
      MirrorObject.prototype.isEnumerable,
      MirrorObject.prototype.isConfigurable,
      MirrorObject.prototype.isAccessor,
      MirrorObject.prototype.isWritable,
      MirrorObject.prototype.getDescriptor,
      MirrorObject.prototype.defineProperty,
      MirrorFunction.prototype.apply,
      MirrorFunction.prototype.construct,
      function getName(){
        return this.subject.Get('name');
      },
      function getDetails(){
        return this.target.getDetails();
      },
      function getScope(){
        return this.target.getScope();
      },
      function isConstructor(){
        return this.target.isConstructor() || this.subject.constructCount > 0;
      },
      function isClass(){
        return this.target.isClass();
      },
      function isStrict(){
        return this.target.isStrict();
      },
      function list(hidden, own){
        return this.target.list.call(this, hidden, own);
      },
      function label(){
        return this.target.label();
      },
      function set(key, value){
        realm().enterMutationContext();
        var result = introspect(this.subject.Set(key, value));
        realm().exitMutationContext();
        return result;
      },
      function update(key, attr){
        realm().enterMutationContext();
        var result = introspect(this.subject.DefineOwnProperty(key, attrsToDesc(attr)));
        realm().exitMutationContext();
        return result;
      },
      function query(key){
        var prop = this.describe(key);
        if (prop) {
          return prop[2];
        }
      },
      function get(key){
        return introspect(this.getValue(key));
      },
      function getValue(key){
        var prop = key in this.cache ? this.cache[key] : this.describe(key);
        if (prop) {
          return prop[1];
        }
      },
      function hasOwn(key){
        return this.subject.HasOwnProperty(key);
      },
      function has(key){
        return this.subject.HasProperty(key);
      },
      function scheduleReset(){
        if (!this.resetScheduled) {
          this.resetScheduled = true;
          var self = this;
          setTimeout(function(){
            self.enumerated = false;
            self.resetScheduled = false;
            self.cache = new Hash;
          }, 15);
        }
      },
      function describe(key){
        if (key in this.cache) {
          return this.cache[key];
        }
        if (key !== '__proto__') {
          var desc = this.subject.GetOwnProperty(key);
          this.scheduleReset();
          if (desc) {
            if ('Get' in desc || 'Set' in desc) {
              var val = { Get: desc.Get, Set: desc.Set };
            } else {
              var val = desc.Value;
            }
            this.cache[key] = [key, val, descToAttrs(desc)];
          } else {
            this.cache[key] = undefined;
          }
          return this.cache[key];
        }
      },
      function ownAttrs(props){
        if (this.enumerated) {
          return this.cache;
        }
        this.enumerated = true;

        var keys = this.subject.Enumerate(false, false);

        for (var i=0; i < keys.length; i++) {
          this.describe(keys[i]);
        }

        return this.cache;
      }
    ]);

    return MirrorProxy;
  })();



  var MirrorScope = (function(){
    function MirrorScope(subject){
      if (subject.type === 'GlobalEnv') {
        return new MirrorGlobalScope(subject);
      }
      subject.__introspected = this;
      this.subject = subject;
    }

    inherit(MirrorScope, Mirror, {
      kind: 'Scope',
      type: 'scope',
      parentLabel: '[[outer]]',
      isExtensible: always(true),
      isEnumerable: always(true),
      isAccessor: always(false)
    }, [
      function isAccessor(key){
        return this.getPrototype().isAccessor(key) || false;
      },
      function getOuter(){
        return introspect(this.subject.outer);
      },
      function getPrototype(){
        return introspect(this.subject.outer);
      },
      function getValue(key){
        return this.subject.GetBindingValue(key);
      },
      function get(key){
        return introspect(this.subject.GetBindingValue(key));
      },
      function getOwn(key){
        if (this.hasOwn(key)) {
          return introspect(this.subject.GetBindingValue(key));
        }
      },
      function label(){
        return this.subject.type;
      },
      function hasOwn(key){
        return this.subject.HasBinding(key);
      },
      function has(key){
        return this.subject.HasBinding(key) || this.getPrototype().has(key);
      },
      function inheritedAttrs(){
        return this.ownAttrs(this.getPrototype().inheritedAttrs());
      },
      function ownAttrs(props){
        props || (props = new Hash);

        each(this.subject.EnumerateBindings(), function(key){
          key = key === '__proto__' ? proto : key;
          props[key] = [key, null, 7]
        });
        return props;
      },
      function isClass(){
        return !!this.subject.Class;
      },
      function list(hidden, own){
        own = true;
        var props = own ? this.ownAttrs() : this.inheritedAttrs(),
            keys = [];

        for (var k in props) {
          keys.push(props[k][0]);
        }

        return keys.sort();
      },
      function isConfigurable(key){
        return !(this.subject.deletables && key in this.subject.deletables);
      },
      function isWritable(key){
        return !(this.subject.consts && key in this.subject.consts);
      },
      function getOwnDescriptor(key){
        if (this.hasOwn(key)) {
          return { configurable: this.isConfigurable(key),
                   enumerable: true,
                   writable: this.isWritable(key),
                   value: this.get(key)   };
        }
      },
      function getDescriptor(key){
        return this.getOwnDescriptor(key) || this.getPrototype().getDescriptor(key);
      },
      function describe(key){
        return [this.subject.GetBindingValue(key), value, this.query(key)];
      },
      function query(key){
        return 1 | (this.isConfigurable(key) << 1) | (this.isWritable(key) << 2);
      }
    ]);

    return MirrorScope;
  })();

  var MirrorGlobalScope = (function(){
    function MirrorGlobalScope(subject){
      subject.__introspected = this;
      this.subject = subject;
      this.global = introspect(subject.bindings);
    }

    inherit(MirrorGlobalScope, MirrorScope, {
    }, [
      function getPrototype(){
        return this.global.getPrototype();
      },
      function isExtensible(){
        return this.global.isExtensible();
      },
      function isEnumerable(key){
        return this.global.isEnumerable(key);
      },
      function isConfigurable(key){
        return this.global.isConfigurable(key);
      },
      function isWritable(key){
        return this.global.isWritable(key);
      },
      function isAccessor(key){
        return this.global.isAccessor(key);
      },
      function query(key){
        return this.global.query(key);
      },
      function describe(key){
        return this.global.describe(key) || MirrorScope.prototype.describe.call(this, key);
      },
      function getOwnDescriptor(key){
        return this.global.getOwnDescriptor(key) || MirrorScope.prototype.getOwnDescriptor.call(this, key);
      },
      function list(hidden, own){
        return this.global.list(hidden, true).concat(this.subject.importedNames);
      }
    ]);

    return MirrorGlobalScope;
  })();


  var brandMap = {
    BuiltinArguments   : 'Arguments',
    BuiltinArray       : 'Array',
    BuiltinArrayBuffer : 'ArrayBuffer',
    BooleanWrapper     : 'Boolean',
    BuiltinDataView    : 'DataView',
    BuiltinDate        : 'Date',
    BuiltinError       : 'Error',
    BuiltinFunction    : 'Function',
    GlobalObject       : 'global',
    BuiltinJSON        : 'JSON',
    BuiltinMap         : 'Map',
    BuiltinMath        : 'Math',
    BuiltinModule      : 'Module',
    BuiltinNil         : 'Nil',
    NumberWrapper      : 'Number',
    BuiltinRegExp      : 'RegExp',
    BuiltinSet         : 'Set',
    StringWrapper      : 'String',
    BuiltinSymbol      : 'Symbol',
    BuiltinWeakMap     : 'WeakMap',
    BuiltinInt8Array   : 'Int8Array',
    BuiltinUint8Array  : 'Uint8Array',
    BuiltinInt16Array  : 'Int16Array',
    BuiltinUint16Array : 'Uint16Array',
    BuiltinInt32Array  : 'Int32Array',
    BuiltinUint32Array : 'Uint32Array',
    BuiltinFloat32Array: 'Float32Array',
    BuiltinFloat64Array: 'Float64Array'
  };

  var brands = {
    BuiltinArguments   : MirrorArguments,
    BuiltinArray       : MirrorArray,
    BooleanWrapper     : MirrorBoolean,
    BuiltinDate        : MirrorDate,
    BuiltinError       : MirrorError,
    BuiltinFunction    : MirrorFunction,
    GlobalObject       : MirrorGlobal,
    BuiltinJSON        : MirrorJSON,
    BuiltinMap         : MirrorMap,
    BuiltinMath        : MirrorMath,
    BuiltinModule      : MirrorModule,
    BuiltinNil         : MirrorNil,
    NumberWrapper      : MirrorNumber,
    BuiltinRegExp      : MirrorRegExp,
    BuiltinSet         : MirrorSet,
    StringWrapper      : MirrorString,
    BuiltinSymbol      : MirrorSymbol,
    BuiltinWeakMap     : MirrorWeakMap,
    BuiltinInt8Array   : MirrorArrayBufferView,
    BuiltinUint8Array  : MirrorArrayBufferView,
    BuiltinInt16Array  : MirrorArrayBufferView,
    BuiltinUint16Array : MirrorArrayBufferView,
    BuiltinInt32Array  : MirrorArrayBufferView,
    BuiltinUint32Array : MirrorArrayBufferView,
    BuiltinFloat32Array: MirrorArrayBufferView,
    BuiltinFloat64Array: MirrorArrayBufferView
  };

  var _Null        = new MirrorValue(null, 'null'),
      _Undefined   = new MirrorValue(undefined, 'undefined'),
      _True        = new MirrorValue(true, 'true'),
      _False       = new MirrorValue(false, 'false'),
      _NaN         = new MirrorValue(NaN, 'NaN'),
      _Infinity    = new MirrorValue(Infinity, 'Infinity'),
      _NegInfinity = new MirrorValue(-Infinity, '-Infinity'),
      _Zero        = new MirrorValue(0, '0'),
      _NegZero     = new MirrorValue(-0, '-0'),
      _One         = new MirrorValue(1, '1'),
      _NegOne      = new MirrorValue(-1, '-1'),
      _Empty       = new MirrorValue('', "''");

  var numbers = new Hash,
      strings = new Hash;


  function introspect(subject){
    switch (typeof subject) {
      case 'undefined': return _Undefined;
      case 'boolean': return subject ? _True : _False;
      case 'string':
        if (subject === '') {
          return _Empty
        } else if (subject.length < 20) {
          if (subject in strings) {
            return strings[subject];
          } else {
            return strings[subject] = new MirrorStringValue(subject);
          }
        } else {
          return new MirrorStringValue(subject);
        }
      case 'number':
        if (subject !== subject) {
          return _NaN;
        }
        switch (subject) {
          case Infinity: return _Infinity;
          case -Infinity: return _NegInfinity;
          case 0: return 1 / subject === -Infinity ? _NegZero : _Zero;
          case 1: return _One;
          case -1: return _NegOne;
        }
        if (subject in numbers) {
          return numbers[subject];
        } else {
          return numbers[subject] = new MirrorNumberValue(subject);
        }
      case 'object':
        if (subject == null) {
          return _Null;
        } else if (subject instanceof Mirror) {
          return subject;
        } else if (subject.__introspected) {
          return subject.__introspected;
        } else if (subject.Environment) {
          return new MirrorScope(subject);
        } else if (subject.Completion) {
          return new MirrorThrown(subject.value);
        } else if (subject.BuiltinBrand) {
          if (subject.Proxy) {
            return new MirrorProxy(subject);
          } else if (subject.BuiltinBrand in brands) {
            return new brands[subject.BuiltinBrand](subject);
          } else if (subject.Call) {
            return new MirrorFunction(subject);
          } else {
            return new MirrorObject(subject);
          }
        } else {
          return _Undefined
        }
    }
  }


  var Renderer = (function(){

    function alwaysLabel(mirror){
      return mirror.label();
    }


    function Renderer(handlers){
      if (handlers) {
        for (var k in this) {
          if (k in handlers) {
            this[k] = handlers[k];
          }
        }
      }
    }

    define(Renderer.prototype, [
      function render(subject){
        var mirror = introspect(subject);
        return this[mirror.kind](mirror);
      }
    ]);

    assign(Renderer.prototype, {
      Unknown: alwaysLabel,
      BooleanValue: alwaysLabel,
      StringValue: function(mirror){
        return quotes(mirror.subject);
      },
      NumberValue: function(mirror){
        var label = mirror.label();
        return label === 'number' ? mirror.subject : label;
      },
      UndefinedValue: alwaysLabel,
      NullValue: alwaysLabel,
      Thrown: function(mirror){
        return mirror.getError();
      },
      Accessor: alwaysLabel,
      Arguments: alwaysLabel,
      Array: alwaysLabel,
      ArrayBuffer: alwaysLabel,
      Boolean: alwaysLabel,
      Date: alwaysLabel,
      Error: function(mirror){
        return mirror.getValue('name') + ': ' + mirror.getValue('message');
      },
      Function: alwaysLabel,
      Global: alwaysLabel,
      JSON: alwaysLabel,
      Map: alwaysLabel,
      Math: alwaysLabel,
      Module: alwaysLabel,
      Nil: alwaysLabel,
      Object: alwaysLabel,
      Number: alwaysLabel,
      RegExp: alwaysLabel,
      Scope: alwaysLabel,
      Set: alwaysLabel,
      Symbol: alwaysLabel,
      String: alwaysLabel,
      WeakMap: alwaysLabel
    });

    return Renderer;
  })();


  var renderer = new Renderer;

  define(exports, [
    function basicRender(o){
      return renderer.render(o);
    },
    function createRenderer(handlers){
      return new Renderer(handlers);
    },
    function isMirror(o){
      return o instanceof Mirror;
    },
    introspect,
    Renderer
  ]);


  define(exports, 'mirrors', {
    Mirror                 :Mirror,
    MirrorValue            :  MirrorValue,
    MirrorNull             :    _Null,
    MirrorUndefined        :    _Undefined,
    MirrorTrue             :    _True,
    MirrorFalse            :    _False,
    MirrorStringValue      :    MirrorStringValue,
    MirrorEmpty            :      _Empty,
    MirrorNumberValue      :    MirrorNumberValue,
    MirrorInfinity         :      _Infinity,
    MirrorNaN              :      _NaN,
    MirrorNegInfinity      :      _NegInfinity,
    MirrorZero             :      _Zero,
    MirrorNegZero          :      _NegZero,
    MirrorOne              :      _One,
    MirrorNegOne           :      _NegOne,
    MirrorPrototypeAccessor:  MirrorPrototypeAccessor,
    MirrorObject           :  MirrorObject,
    MirrorArray            :    MirrorArray,
    MirrorArguments        :      MirrorArguments,
    MirrorArrayBufferView  :      MirrorArrayBufferView,
    MirrorPrimitiveWrapper :    MirrorPrimitiveWrapper,
    MirrorBoolean          :      MirrorBoolean,
    MirrorNumber           :      MirrorNumber,
    MirrorString           :      MirrorString,
    MirrorDate             :    MirrorDate,
    MirrorError            :    MirrorError,
    MirrorThrown           :      MirrorThrown,
    MirrorFunction         :    MirrorFunction,
    MirrorGlobal           :    MirrorGlobal,
    MirrorJSON             :    MirrorJSON,
    MirrorMath             :    MirrorMath,
    MirrorModule           :    MirrorModule,
    MirrorNil              :    MirrorNil,
    MirrorRegExp           :    MirrorRegExp,
    MirrorSymbol           :    MirrorSymbol,
    MirrorCollection       :    MirrorCollection,
    MirrorSet              :      MirrorSet,
    MirrorMap              :      MirrorMap,
    MirrorWeakMap          :    MirrorWeakMap,
    MirrorAccessor         :  MirrorAccessor,
    MirrorProxy            :  MirrorProxy,
    MirrorScope            :  MirrorScope,
    MirrorGlobalScope      :    MirrorGlobalScope
  });

  return exports;
})(typeof module !== 'undefined' ? module.exports : {});
