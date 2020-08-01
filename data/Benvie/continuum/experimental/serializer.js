

  function Serializer(){
  this.cache = new Hash;
  this.repo = new Hash;
}

define(Serializer.prototype, [
  function ident(obj){
    if (isObject(obj)) {
      if ('id' in obj) {
        if (typeof obj.id !== 'number') {
          delete obj.id;
          tag(obj);
        }
      } else {
        tag(obj);
      }
    }
  },
  function serialize(value){
    if (!isObject(value)) {
      if (value !== value) {
        return ['NaN'];
      } else if (value === Infinity) {
        return ['Infinity'];
      } else if (value === -Infinity) {
        return ['-Infinity'];
      } else if (value === 0) {
        return 1 / value === -Infinity ? ['-0'] : 0;
      } else if (value === undefined) {
        return ['undefined'];
      } else {
        return value;
      }
    }
    if (value.save) {
      return value.save(this);
    }
    if ('Get' in value || 'Set' in value) {
      var ret = { type: value.type || 'Accessor' };
      if (value.Get) {
        ret.Get = this.serialize(value.Get);
      }
      if (value.Set) {
        ret.Set = this.serialize(value.Set);
      }
      return ret;
    }
    if (value instanceof Array) {
      return map(value, serialize, this);
    }
    if (typeof value === 'function' && value.name) {
      value = value.name;
    } else if (value && value.constructor && value.constructor.name) {
      value = value.constructor.name;
    }
    return ['unhandled object '+value];
  },
  function has(id){
    return id in this.cache;
  },
  function set(id, value){
    this.cache[id] = value;
    value.id = id;
    if (!(id in this.repo)) {
      this.repo[id] = value;
    }
    return value;
  },
  function get(id){
    return this.cache[id];
  },
  function add(obj){
    this.repo[obj.id] = obj.id in this.cache ? this.cache[obj.id] : this.serialize(obj);
  }
]);



  function $Object(serializer){
    if (!serializer) {
      var returnRepo = true;
      serializer = new Serializer;
    }

    if (serializer.has(this.id)) {
      return this.id
    }

    var serialized = serializer.set(this.id, {
      type: this.constructor.name,
      BuiltinBrand: this.BuiltinBrand.name
    });

    if (IsCallable(this)) {
      var name = this.get('name');
      if (name && typeof name === 'string') {
        serialized.name = name;
      }
      if (this.strict) {
        serialized.Strict = this.strict;
      }
      serialized.Parameters = null;
    }

    if (!this.IsExtensible()) {
      serialized.Extensible = false;
    }

    if (this.ConstructorName) {
      serialized.ConstructorName = this.ConstructorName;
    }

    each(['MapData', 'SetData', 'WeakMapData'], function(data){
      if (this[data]) {
        serializer.add(this[data]);
        serialized[data] = this[data].id;
      }
    }, this);

    var objects = [],
        functions = [],
        self = this,
        isFunction = IsCallable(this);

    var props = [];
    this.properties.each(function(prop){
      if (isFunction) {
        if (prop[0] === 'arguments' || prop[0] === 'caller') {
          if (prop[1] === null || self.strict) {
            return;
          }
        } else if (prop[0] === 'length') {
          return;
        }
      }
      if (typeof prop[0] === 'string') {
        var key = prop[0];
      } else {
        serializer.add(prop[0]);
        var key = prop[0].id;
      }
      prop = [key, prop[2], 0, prop[1]];
      props.push(prop);
      if (isObject(prop[3])) {
        if (prop[3].Scope) {
          functions.push(prop);
        } else {
          objects.push(prop);
        }
      } else {
        prop[3] = serializer.serialize(prop[3]);
      }
    });

    each(objects, function(prop){
      serializer.add(prop[3]);
      prop[3] = prop[3].id;
      prop[2] = 1;
    });

    var proto = this.GetInheritance();
    if (proto) {
      serializer.add(proto);
      serialized.Prototype = proto.id;
    } else {
      serialized.Prototype = null;
    }

    each(functions, function(prop){
      serializer.add(prop[3]);
      prop[3] = prop[3].id;
      prop[2] = 2;
    });

    serialized.properties = props;
    return returnRepo ? serializer.repo : serialized;
  },



  function $Function(serializer){
    serializer || (serializer = new Serializer);
    var serialized = $Object.prototype.save.call(this, serializer);
    if (typeof serialized === 'number') {
      return serialized;
    }
    serialized.Strict = this.strict;
    serialized.ThisMode = this.ThisMode;
    if (this.Scope) {
      serializer.add(this.Scope);
      serialized.Scope = this.Scope.id;
    }
    if (this.code) {
      serializer.add(this.code);
      serialized.Code = this.code.id;
      var code = serializer.repo[this.code.id];
      serialized.Parameters = code.params;
      delete code.params;
    }
    if (this.HomeObject) {
      serializer.add(this.HomeObject);
      serialized.HomeObject = this.HomeObject.id;
    }
    if (this.MethodName) {
      serialized.MethodName = serializer.serialize(this.MethodName);
    }

    return serialized;
  },


  function $BoundFunction(serializer){
    if (!serializer) {
      var returnRepo = true;
      serializer = new Serializer;
    }

    var serialized = $Object.prototype.save.call(this, serializer);
    if (typeof serialized === 'number') {
      return serialized;
    }
    delete serialized.Parameters;
    if (isObject(this.TargetFunction)) {
      serializer.add(this.TargetFunction);
      serialized.TargetFunction = this.TargetFunction.id;
    }
    if (isObject(this.BoundThis)) {
      serializer.add(this.BoundThis);
      serialized.BoundThis = this.BoundThis.id;
    } else {
      serialized.BoundThis = serializer.serialize(this.BoundThis);
    }
    serialized.BoundArgs = map(this.BoundArgs, function(arg){
      if (isObject(arg)) {
        serializer.add(arg);
        return arg.id;
      } else {
        return serializer.serialize(arg);
      }
    });

    return returnRepo ? serializer.repo : serialized;
  },

  function $Symbol(serializer){
    serializer || (serializer = new Serializer);
    if (serializer.has(this.id)) {
      return this.id;
    }

    return serializer.set(this.id, {
      type: '$Symbol',
      Name: this.Name,
      Private: this.Private
    });
  },

  var primitiveWrapperSave = (function(){
    return function save(serializer){
      serializer || (serializer = new Serializer);
      var serialized = $Object.prototype.save.call(this, serializer);
      if (typeof serialized === 'number') {
        return serialized;
      }

      serialized.PrimitiveValue = this.PrimitiveValue;
      return serialized;
    };
  })();


  function $Module(serializer){
    var props = this.properties;
    this.properties = fakeProps;

    serializer || (serializer = new Serializer);
    var serialized = $Object.prototype.save.call(this, serializer);
    this.properties = props;
    if (typeof serialized === 'number') {
      return serialized;
    }

    delete serialized.properties;
    delete serialized.Prototype;
    delete serialized.Extensible;
    serialized.exports = [];


    this.properties.each(function(prop){
      var value = prop[1].Get.Call();

      if (isObject(value)) {
        serializer.add(value);
        value = value.id;
      } else {
        value = serializer.serialize(value);
        if (typeof value === 'number') {
          value = [value];
        }
      }

      serialized.exports.push(value);
    });

    return serialized;
  },


  function $NativeFunction(serializer){
    var serialized = $Object.prototype.save.call(this, serializer);
    if (typeof serialized === 'number') {
      return serialized;
    }
    delete serialized.Parameters;
    return serialized;
  },

  function Env(serializer){
    if (serializer.has(this.id)) {
      return this.id;
    }

    var serialized = serializer.set(this.id, {
      type: this.type
    });

    if (this.outer) {
      serializer.add(this.outer);
      serialized.outer = this.outer.id;
    }

    if (this.symbols) {
      serialized.symbols = {};
      each(this.symbols, function(symbol, name){
        serializer.add(symbol);
        serialized.symbols[name] = symbol.id;
      });
    }

    return serialized;
  },
  function DeclarativeEnv(serializer){
    var serialized = EnvironmentRecord.prototype.save.call(this, serializer);
    if (typeof serialized === 'number') {
      return serialized;
    }
    serialized.bindings = {};
    each(this.bindings, function(binding, name){
      if (isObject(binding) && 'id' in binding) {
        serializer.add(binding);
        serialized.bindings[name] = binding.id;
      } else {
        serialized.bindings[name] = serializer.serialize(binding);
      }
    });
    var deletables = ownKeys(this.deletables);
    if (deletables.length) {
      serialized.deletables = deletables;
    }
    var consts = ownKeys(this.consts);
    if (deletables.length) {
      serialized.consts = consts;
    }
    return serialized;
  },
  function ObjectEnv(serializer){
    var serialized = EnvironmentRecord.prototype.save.call(this, serializer);
    if (typeof serialized === 'number') {
      return serialized;
    }
    serializer.add(this.bindings);
    serialized.bindings = this.bindings.id;
    return serialized;
  },
  function FunctionEnv(serializer){
    var serialized = DeclarativeEnvironmentRecord.prototype.save.call(this, serializer);
    if (typeof serialized === 'number') {
      return serialized;
    }
    if (isObject(this.thisValue)) {
      serializer.add(this.thisValue);
      serialized.thisValue = this.thisValue.id;
    }
    if (this.HomeObject) {
      serializer.add(this.HomeObject);
      serialized.HomeObject =this.HomeObject.id;
    }
    if (this.MethodName) {
      serialized.MethodName = serializer.serialize(this.MethodName);
    }
    return serialized;
  },
  function GlobalEnv(serializer){
    serializer || (serializer = new Serializer);
    var serialized = ObjectEnvironmentRecord.prototype.save.call(this, serializer);
    if (typeof serialized === 'number') {
      return serialized;
    }
    serializer.add(this.bindings.Realm.natives);
    serialized.natives = this.bindings.Realm.natives.id;
    return serialized;
  },

  function MapData(serializer){
    serializer || (serializer = new Serializer);
    if (serializer.has(this.id)) {
      return this.id;
    }

    var serialized = serializer.set(this.id, {
      type: 'MapData',
      size: this.size,
      items: []
    });
    this.forEach(function(value, key){
      serialized.items.push(map([key, value], function(item){
        if (isObject(item)) {
          serializer.add(item);
          return item.id;
        } else {
          item = serializer.serialize(item);
          return typeof item === 'number' ? [item] : item;
        }
      }));
    });
    return serialized;
  },
  function WeakMapData(serializer){
    if (serializer.has(this.id)) {
      return this.id;
    }

    return serializer.set(this.id, {
      type: 'WeakMapData'
    });
  },
  function $Date(serializer){
    return +primitiveWrapperSave.call(this, serializer);
  }
  function StandardOpCode(serializer){
    var out = [this.name];
    for (var i=0; i < this.params; i++) {
      out[i+1] = serializer.serialize(this.params[i]);
    }
    return out;
  },
  function Directive(serializer){
    var serialized = [this.op.name]//, serializeLocation(this.loc)];
    if (this.op.params) {
      var params = serialized[2] = [];
      for (var i=0; i < this.op.params; i++) {
        if (this[i] && this[i].id) {
          serializer.add(this[i]);
          params[i] = this[i].id;
        } else if (this[i] instanceof Code) {
          serializer.ident(this[i]);
          serializer.add(this[i]);
          params[i] = this[i].id;
        } else {
          params[i] = serializer.serialize(this[i]);
        }
      }
    }
    return serialized;
  },
  function Parameters(serializer){
    var serialized = {
      formals: this.reduced,
      count: this.ExpectedArgumentCount
    };
    if (this.Rest) {
      serialized.rest = reducer(this.Rest);
    }
    return serialized;
  },
  function Code(serializer){
    if (serializer.has(this.id)) {
      return this.id;
    }

    var serialized = serializer.set(this.id, {
      type: 'Code',
      varDecls: this.varDecls,
      flags: this.flags,
      range: this.range,
      loc: serializeLocation(this.loc)
    });
    if (this.classDefinition) {
      if (!this.classDefinition.id) {
        serializer.ident(this.classDefinition);
      }
      serializer.add(this.classDefinition);
      this.classDefinition = this.classDefinition.id;
    }
    if (this.scopeType !== undefined) {
      serialized.scopeType = this.scopeType;
    }
    if (this.lexicalType !== undefined) {
      serialized.lexicalType = this.lexicalType;
    }

    if (this.unwinders.length) {
      serialized.unwinders = [];
      each(this.unwinders, function(transfer){
        serialized.unwinders.push(serializer.serialize(transfer));
      })
    }

    if (this.exportedNames) {
      serialized.exports = this.exportedNames;
    }

    if (this.imports) {
      serialized.imports = this.imports;
    }

    if (this.params) {
      serialized.params = serializer.serialize(this.params);
    }

    serialized.ops = map(this.ops, serializer.serialize, serializer);

    return serialized;
  },
  function ClassDefinition(serializer){
    if (serializer.has(this.id)) {
      return this.id;
    }
    var serialized = serializer.set(this.id, {
      type: 'ClassDefinition',
    });

    if (this.name) {
      serialized.name = serializer.serialize(this.name);
    }
    if (this.hasSuper) {
      serializer.hasSuper = true;
    }
    var methods = {
      method: [],
      get: [],
      set: []
    };

    each(this.methods, function(method){
      serializer.add(method.code);
      methods[method.kind].push([serializer.serialize(method.name), method.code.id]);
    });
    if (methods.method.length) {
      serialized.methods = methods.method;
    }
    if (methods.get.length) {
      serialized.getters = methods.get;
    }
    if (methods.set.length) {
      serialized.setters = methods.set;
    }
    if (this.symbols[0].length) {
      var privates = [],
          publics = [];
      each(this.symbols[0], function(symbol, i){
        if (this.symbols[1][i]) {
          publics.push(symbol);
        } else {
          privates.push(symbol);
        }
      }, this);
      if (privates.length) {
        serialized.privateSymbols = privates;
      }
      if (publics.length) {
        serialized.publicSymbols = publics;
      }
    }

    return serialized;
  },
  function Unwinder(serializer){
    return [this.type, this.begin, this.end];
  }
  function Symbol(serializer){
    if (this[0] === '@') {
      return ['@', this[1]];
    }
    return this[1];
  }
