
var utility          = continuum.utility,
    Feeder           = utility.Feeder,
    uid              = utility.uid,
    fname            = utility.fname,
    hasOwn           = utility.hasOwn,
    define           = utility.define,
    isObject         = utility.isObject,
    isExtensible     = utility.isExtensible,
    ownProperties    = utility.properties,
    getPrototypeOf   = utility.getPrototypeOf,
    getBrandOf       = utility.getBrandOf,
    describeProperty = utility.describeProperty,
    defineProperty   = utility.defineProperty,
    block            = continuum.block,
    createPanel      = continuum.createPanel,
    render           = continuum.render,
    _                = continuum._;



function initializeDOM(realm){
  var wrap = (function(){
    var id = uid();

    var map = (function(){
      if (typeof Map === 'function') {
        var weakmap = new Map;
        return {
          set: function set(key, value){
            try { weakmap.set(key, value) } catch (e) { console.log(e) }
          },
          get: function get(key){
            try { return weakmap.get(key) } catch (e) { console.log(e) }
          },
          has: function has(key){
            try { return weakmap.has(key) } catch (e) { console.log(e) }
          },
          remove: function remove(key){
            try { return weakmap['delete'](key) } catch (e) { console.log(e) }
          }
        };
      } else {
        var keys = [],
            vals = [];

        return {
          set: function set(key, value){
            if (isExtensible(key)) {
              safeDefine(key, id, value);
            } else {
              var index = key === this.lastKey ? this.lastIndex : keys.indexOf(key);
              if (~index) {
                keys[index] = key;
                vals[index] = value;
              } else {
                keys.push(key);
                vals.push(value);
              }
            }
          },
          get: function get(key){
            if (isExtensible(key)) {
              return key[id];
            } else {
              var index = key === this.lastKey ? this.lastIndex : keys.indexOf(key);
              if (~index) {
                return vals[index];
              }
            }
          },
          has: function has(key){
            if (isExtensible(key)) {
              return hasOwn(key, id);
            } else {
              var lastIndex = keys.indexOf(key);
              if (~lastIndex) {
                this.lastIndex = lastIndex;
                this.lastKey = key;
                return true;
              }
            }
            return false;
          },
          remove: function remove(key){
            if (isExtensible(key)) {
              if (hasOwn(key, id)) {
                delete key[id];
                return true;
              }
            } else {
              var index = keys.indexOf(key);
              if (!index) {
                keys.splice(index, 1);
                vals.splice(index, 1);
                return true;
              }
            }
            return false;
          }
        };
      }
    })();

    function unwrap(value){
      if (isObject(value)) {
        if (value.object) {
          value = value.object;
        }
      }
      return value;
    }

    function wrap(value){
      if (isObject(value)) {
        if (value instanceof $ExoticObject) {
          return value;
        }

        if (map.has(value)) {
          return map.get(value);
        }

        var wrapper = typeof value === 'function' ? new $ExoticFunction(value) : new $ExoticObject(value);

        map.set(value, wrapper);
        return wrapper;

      } else if (typeof value === 'string' && value.length > 100) {
        value = value.slice(0, 100);
      }
      return value;
    }

    function attrsToDesc(attr){
      if (attr < 0) {
        var val = false;
        attr = ~attr;
      } else {
        var val = true;
      }
      var desc = {
        enumerable: (attr & 1) ? val : !val,
        configurable: (attr & 2) ? val : !val
      };
      if (attr & 4) {
        desc.writable = val;
      }
      return desc;
    }

    function descToAttrs(desc){
      if (desc) {
        var attrs = desc.enumerable | (desc.configurable << 1) | (desc.writable << 2);
        if ('get' in desc || 'set' in desc) {
         attrs |= 0x08;
        }
        return attrs;
      }
    }

    function safeDefineProperty(o, key, desc){
      try {
        return defineProperty(o, key, desc);
      } catch (e) {}
    }

    function getDescriptor(o, key){
      if (hasOwn(o, key)) {
        try {
          return describeProperty(o, key);
        } catch (e) {}
      }
    }


    var handlers = (function(){
      return [
        function init(object){
          this.object = object;
          this.Extensible = isExtensible(object);
          this.Prototype = wrap(getPrototypeOf(object));

          if (object !== location) {
            var ctor = object.constructor;
            if (ctor) {
              if (ctor.prototype === object) {
                this.IsProto = true;
              }
              this.ConstructorName = fname(ctor) || getBrandOf(ctor);
            }
          }

          if (!this.ConstructorName) {
            this.ConstructorName = getBrandOf(object);
          }

          if (typeof object === 'function') {
            try { fname(object) } catch (e) {}
          }
        },
        function remove(key){
          if (this.properties.has(key)) {
            return this.properties.remove(key);
          }
          delete this.object[key];
        },
        function describe(key){
          if (key === id) return;
          if (this.properties.has(key)) {
            return this.properties.getProperty(key);
          }
          var desc = getDescriptor(this.object, key);
          if (desc) {
            var attrs = descToAttrs(desc);
            if ('value' in desc) {
              var val = wrap(desc.value);
            } else if ('get' in desc || 'set' in desc) {
              var val = { Get: wrap(desc.get),
                          Set: wrap(desc.set) };
            }
            var prop = [key, val, attrs];
            return prop;
          }
        },
        function define(key, value, attrs){
          if (this.properties.has(key)) {
            return this.properties.set(key, value, attrs);
          }
          this.object[key] = unwrap(value);
          return;
          var desc = attrsToDesc(attrs);
          desc.value = unwrap(value);
          safeDefineProperty(this.object, key, desc);
        },
        function has(key){
          if (key === id) return false;
          return this.properties.has(key) || key in this.object;
        },
        function each(callback){
          this.properties.forEach(callback, this);
          var keys = ownProperties(this.object);
          for (var i=0; i < keys.length; i++) {
            if (keys[i] === id) continue;

            var val = this.describe(keys[i]);
            if (typeof val === 'object' && val !== null) {
              callback(val);
            }
          }
        },
        function get(key){
          if (this.properties.has(key)) {
            return this.properties.get(key);
          }
          try {
            return wrap(this.object[key]);
          } catch (e) { console.log(e) }
        },
        function set(key, value){
          if (this.properties.has(key)) {
            return this.properties.set(key, value);
          }
          this.object[key] = unwrap(value);
        },
        function query(key){
          if (this.properties.has(key)) {
            return this.properties.getAttribute(key);
          }
          var desc = describeProperty(this.object, key);
          if (desc) {
            return descToAttrs(desc);
          }
        },
        function update(key, attr){
          if (this.properties.has(key)) {
            return this.properties.setAttribute(key, attr);
          }
          safeDefineProperty(this.object, key, attrsToDesc(attr));
        }
      ];
    })();

    var applyNew = continuum.utility.applyNew;
    var $ExoticObject = continuum.createExotic('Object', handlers);
    var $ExoticFunction = continuum.createExotic('Function', handlers);


    $ExoticFunction.prototype.Call = function Call(receiver, args){
      try {
        return wrap(this.call.apply(unwrap(receiver), args.map(unwrap)));
      } catch (e) {
        console.log(e);
      }
    };

    $ExoticFunction.prototype.Construct = function Construct(args){
      try {
        return wrap(applyNew(this.call, args.map(unwrap)));
      } catch (e) {
        console.log(e);
      }
    };

    return wrap;
  })();

  var oproto = wrap(Object.prototype);
  oproto.properties.setProperty(['__proto__', null, 6, {
    Get: { Call: function(r){ return r.GetInheritence() } },
    Set: { Call: function(r, a){ return r.SetInheritence(a[0]) } }
  }]);

  realm.global.set('document', wrap(document));
  realm.global.set('window', wrap((0, eval)('this')));

}
