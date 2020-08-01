var $Array = (function(exports){
  var objects      = require('../lib/objects'),
      utility      = require('../lib/utility'),
      errors       = require('../errors'),
      constants    = require('../constants'),
      operators    = require('./operators'),
      operations   = require('./operations'),
      PropertyList = require('../lib/PropertyList'),
      $Object      = require('./$Object').$Object,
      engine       = require('../engine').engine;

  var inherit          = objects.inherit,
      define           = objects.define,
      copy             = objects.copy,
      Hash             = objects.Hash,
      tag              = utility.tag,
      $$IsArrayIndex   = operations.$$IsArrayIndex,
      $$ThrowException = errors.$$ThrowException,
      $$ToBoolean      = operators.$$ToBoolean,
      $$ToUint32       = operators.$$ToUint32,
      $$ToNumber       = operators.$$ToNumber;

  var __W = 4,
      ECW = 7;

  var DefineOwn = $Object.prototype.DefineOwnProperty;

  function $Array(array){
    this.Prototype = intrinsics['%ArrayPrototype%'];
    this.Realm = realm;
    this.properties = new PropertyList;
    this.storage = new Hash;
    tag(this);

    if (typeof array === 'number') {
      this.array = new Array(array);
    } else if (array) {
      this.array = array;
    } else {
      this.array = [];
    }
    this.length = ['length', this.array.length, __W];
  }

  exports.$Array = $Array;

  inherit($Array, $Object, {
    BuiltinBrand: 'BuiltinArray'
  }, [
    function has(key){
      if (key === 'length') {
        return true;
      } else if ((key >>> 0) == key && key < this.array.length) {
        return key in this.array;
      }
      return this.properties.has(key);
    },
    function remove(key){
      if (key === 'length') {
        return false;
      } else if ((key >>> 0) == key && key < this.array.length) {
        return delete this.array[key];
      }
      return this.properties.remove(key);
    },
    function get(key){
      if (key === 'length') {
        return this.array.length;
      } else if ((key >>> 0) == key) {
        return this.array[key];
      }
      return this.properties.get(key);
    },
    function set(key, value){
      if (key === 'length') {
        this.length[1] = this.array.length = value;
        return true;
      } else if ((key >>> 0) == key) {
        this.array[key] = value;
        return true;
      }
      return this.properties.set(key, value);
    },
    function describe(key){
      if (key === 'length') {
        this.length[1] = this.array.length;
        return this.length;
      } else if ((key >>> 0) == key && key < this.array.length) {
        if (key in this.array) {
          return [key, this.array[key], ECW];
        }
      } else {
        return this.properties.describe(key);
      }
    },
    function query(key){
      if (key === 'length') {
        return __W;
      } else if ((key >>> 0) == key) {
        return key in this.array ? ECW : null;
      }
      return this.properties.query(key);
    },
    function update(key, attr){
      if (attr === __W && key === 'length') {
        return true;
      } else if ((key >>> 0) == key && key in this.array) {
        if (attr === ECW) {
          return true;
        }
        deoptimize(this);
      }
      return this.properties.update(key, attr);
    },
    function each(callback){
      var len = this.length[1] = this.array.length;
      callback(this.length);

      for (var i=0; i < len; i++) {
        if (i in this.array) {
          callback([i+'', this.array[i], ECW]);
        }
      }

      this.properties.each(callback);
    },
    (function(){
      return function define(key, value, attr){
        if (key === 'length' && attr === __W) {
          this.length[1] = this.array.length = value;
          return true;
        } else if ((key >>> 0) == key) {
          if (attr === ECW) {
            this.array[key] = value;
            return true;
          }
          deoptimize(this);
        }
        return this.properties.define(key, value, attr);
      };
    })(),
    function DefineOwnProperty(key, desc, strict){
      var oldLenDesc = this.GetOwnProperty('length'),
          oldLen = oldLenDesc.Value,
          reject = strict ? $$ThrowException : function(e, a){ return false };


      if (key === 'length') {
        if (!('Value' in desc)) {
          return DefineOwn.call(this, 'length', desc, strict);
        }

        var newLenDesc = copy(desc),
            newLen = $$ToUint32(desc.Value);

        if (newLen.Abrupt) return newLen;

        var value = $$ToNumber(desc.Value);
        if (value.Abrupt) return value;

        if (newLen !== value) {
          return reject('invalid_array_length');
        }

        newLen = newLenDesc.Value;
        if (newLen >= oldLen) {
          return DefineOwn.call(this, 'length', newLenDesc, strict);
        }

        if (oldLenDesc.Writable === false) {
          return reject('strict_cannot_assign')
        }

        if (!('Writable' in newLenDesc) || newLenDesc.Writable) {
          var newWritable = true;
        } else {
          newWritable = false;
          newLenDesc.Writable = true;
        }

        var success = DefineOwn.call(this, 'length', newLenDesc, strict);
        if (success.Abrupt) return success;

        if (success === false) {
          return false;
        }

        while (newLen < oldLen) {
          oldLen = oldLen - 1;
          var deleted = this.Delete(''+oldLen, false);
          if (deleted.Abrupt) return deleted;

          if (!deleted) {
            newLenDesc.Value = oldLen + 1;
            if (!newWritable) {
              newLenDesc.Writable = false;
            }
            DefineOwn.call(this, 'length', newLenDesc, false);
            return reject('strict_delete_property');
          }
        }
        if (!newWritable) {
          DefineOwn.call(this, 'length', { Writable: false }, false);
        }

        return true;
      }  else if ($$IsArrayIndex(key)) {
        var index = $$ToUint32(key);
        if (index.Abrupt) return index;

        if (index >= oldLen && oldLenDesc.Writable === false) {
          return reject('strict_cannot_assign');
        }

        success = DefineOwn.call(this, key, desc, false);
        if (success.Abrupt) return success;

        if (success === false) {
          return reject('strict_cannot_assign');
        }

        if (index >= oldLen) {
          oldLenDesc.Value = index + 1;
          DefineOwn.call(this, 'length', oldLenDesc, false);
        }
        return true;
      }

      return DefineOwn.call(this, key, desc, key);
    }
  ]);

  var deoptimize = (function(){
    var deoptimized = [
      function each(callback){
        var len = this.array.length;

        for (var i=0; i < len; i++) {
          if (i in this.array) {
            this.properties.set(i+'', this.array[i]);
          } else {
            this.properties.remove(i);
          }
        }

        this.properties.set('length', this.array.length);
        this.properties.each(callback);
      },
      function remove(key){
        if ((key >>> 0) == key && key < this.array.length) {
          delete this.array[key];
        }
        return this.properties.remove(key);
      },
      function update(key, attr){
        if (!this.properties.has(key) && (key >>> 0) == key && key in this.array) {
          return this.properties.define(key, this.array[i], attr);
        }
        return this.properties.update(key, attr);
      },
      function query(key){
        var result = this.properties.query(key);
        if (result === null && (key >>> 0) == key && key in this.array) {
          this.properties.define(key, this.array[key], result = ECW);
        }
        return result;
      },
      function describe(key){
        if (key === 'length') {
          var index = this.properties.get('length'),
              len = this.array.length;

          if (index !== len) {
            for (; index < len; index++) {
              if (index in this.array) {
                this.properties.set(index, this.array[index]);
              }
            }
            this.properties.set('length', len);
          }
        } else if ((key >>> 0) == key && key < this.array.length) {
          if (key in this.array) {
            var prop = this.properties.describe(key);
            if (prop) {
              if (prop[1] !== this.array[key]) {
                this.properties.set(key, this.array[key]);
                prop[1] = this.array[key];
              }
            } else {
              prop = [i+'', this.array[i], ECW];
              this.properties.setProperty(i, prop);
            }
            return prop;
          }
          if (this.properties.has(key)) {
            this.properties.remove(key);
          }
          return;
        }
        return this.properties.describe(key);
      },
      (function(){
        return function define(key, value, attr){
          if (key === 'length' || (key >>> 0) == key) {
            this.array[key] = value;
          }
          return this.properties.define(key, value, attr);
        };
      })()
    ];

    return function deoptimize(target){
      var len = target.array.length;
      target.properties.define('length', len, __W);

      for (var i=0; i < len; i++) {
        if (i in target.array) {
          target.properties.define(i+'', target.array[i], ECW);
        }
      }

      define(target, deoptimized);
    };
  })();

  var realm, intrinsics;

  engine.on('realm-change', function(){
    realm = engine.activeRealm;
    intrinsics = engine.activeIntrinsics;
  });


  return exports;
})(typeof module !== 'undefined' ? exports : {});
