var $TypedArray = (function(module){
  "use strict";
  var objects          = require('../lib/objects'),
      buffers          = require('../lib/buffers'),
      $Array           = require('./$Array').$Array,
      $Object          = require('./$Object').$Object,
      $$ThrowException = require('../errors').$$ThrowException,
      DataDescriptor   = require('./descriptors').DataDescriptor,
      engine           = require('../engine').engine;

  var inherit     = objects.inherit,
      define      = objects.define,
      Hash        = objects.Hash,
      DataView    = buffers.DataView,
      ArrayBuffer = buffers.ArrayBuffer;

  var types     = new Hash,
      DefineOwn = $Object.prototype.DefineOwnProperty,
      GetOwn    = $Object.prototype.GetOwnProperty;



  function hasIndex(key, max){
    var index = key >>> 0;
    return index < max && index == key;
  }


  function ArrayBufferIndex(value){
    this.Value = value;
  }

  ArrayBufferIndex.prototype = new DataDescriptor(undefined, 5);


  function Type(options){
    this.name  = options.name
    this.size  = options.size;
    this.cast  = options.cast;
    this.set   = options.set;
    this.get   = options.get;
    this.brand = 'Builtin'+this.name+'Array';
    types[this.name+'Array'] = this;
  }

  var Int8 = new Type({
    name: 'Int8',
    size: 1,
    cast: function(x){
      return (x &= 0xff) & 0x80 ? x - 0x100 : x & 0x7f;
    },
    set: DataView.prototype.setInt8,
    get: DataView.prototype.getInt8
  });

  var Int16 = new Type({
    name: 'Int16',
    size: 2,
    cast: function(x){
      return (x &= 0xffff) & 0x8000 ? x - 0x10000 : x & 0x7fff;
    },
    set: DataView.prototype.setInt16,
    get: DataView.prototype.getInt16
  });

  var Int32 = new Type({
    name: 'Int32',
    size: 4,
    cast: function(x){
      return x >> 0;
    },
    set: DataView.prototype.setInt32,
    get: DataView.prototype.getInt32
  });

  var Uint8 = new Type({
    name: 'Uint8',
    size: 1,
    cast: function(x){
      return x & 0xff;
    },
    set: DataView.prototype.setUint8,
    get: DataView.prototype.getUint8
  });

  var Uint16 = new Type({
    name: 'Uint16',
    size: 2,
    cast: function(x){
      return x & 0xffff;
    },
    set: DataView.prototype.setUint16,
    get: DataView.prototype.getUint16
  });

  var Uint32 = new Type({
    name: 'Uint32',
    size: 4,
    cast: function(x){
      return x >>> 0;
    },
    set: DataView.prototype.setUint32,
    get: DataView.prototype.getUint32
  });

  var Float32 = new Type({
    name: 'Float32',
    size: 4,
    cast: function(x){
      return +x || 0;
    },
    set: DataView.prototype.setFloat32,
    get: DataView.prototype.getFloat32
  });

  var Float64 = new Type({
    name: 'Float64',
    size: 8,
    cast: function(x){
      return +x || 0;
    },
    set: DataView.prototype.setFloat64,
    get: DataView.prototype.getFloat64
  });

  function $TypedArray(type, buffer, byteLength, byteOffset){
    $Object.call(this, intrinsics['%'+type+'Prototype%']);
    this.Buffer = buffer;
    this.ByteOffset = byteOffset;
    this.ByteLength = byteLength;
    this.Type = types[type];
    this.BuiltinBrand = this.Type.brand;
    this.Length = byteLength / this.Type.size;
    this.define('buffer', buffer, 0);
    this.define('byteLength', byteLength, 0);
    this.define('byteOffset', byteOffset, 0);
    this.define('length', this.Length, 0);
    this.init();
  }

  inherit($TypedArray, $Object, (function(){
    if (typeof Uint8Array !== 'undefined') {
      Uint8.Array   = Uint8Array;
      Uint16.Array  = Uint16Array;
      Uint32.Array  = Uint32Array;
      Int8.Array    = Int8Array;
      Int16.Array   = Int16Array;
      Int32.Array   = Int32Array;
      Float32.Array = Float32Array;
      Float64.Array = Float64Array;

      return [
        function init(){
          this.data = new this.Type.Array(this.Buffer.NativeBuffer, this.ByteOffset, this.Length);
        },
        function each(callback){
          for (var i=0; i < this.Length; i++) {
            callback([i+'', this.data[i], 5]);
          }
          this.properties.each(callback, this);
        },
        function get(key){
          if (hasIndex(key, this.Length)) {
            return this.data[+key];
          } else {
            return this.properties.get(key);
          }
        },
        function describe(key){
          if (hasIndex(key, this.Length)) {
            return [key, this.data[+key], 5];
          } else {
            return this.properties.describe(key);
          }
        },
        function set(key, value){
          if (hasIndex(key, this.Length)) {
            this.data[+key] = value;
          } else {
            return this.properties.set(key, value);
          }
        },
        (function(){ // IE6-8 leaks function expression names to surrounding scope
          return function define(key, value, attr){
            if (hasIndex(key, this.Length)) {
              this.data[+key] = value;
            } else {
              return this.properties.define(key, value, attr);
            }
          };
        })()
      ];
    }
    return [
      function init(){
        this.data = new DataView(this.Buffer.NativeBuffer, this.ByteOffset, this.ByteLength);
        this.data.get = this.Type.get;
        this.data.set = this.Type.set;
        this.bytesPer = this.Type.size;
      },
      function each(callback){
        for (var i=0; i < this.Length; i++) {
          callback([i+'', this.data.get(i * this.bytesPer, true), 5]);
        }
        this.properties.each(callback, this);
      },
      function get(key){
        if (hasIndex(key, this.Length)) {
          return this.data.get(key * this.bytesPer, true);
        } else {
          return this.properties.get(key);
        }
      },
      function describe(key){
        if (hasIndex(key, this.Length)) {
          return [key, this.data.get(key * this.bytesPer, true), 5];
        } else {
          return this.properties.describe(key);
        }
      },
      function set(key, value){
        if (hasIndex(key, this.Length)) {
          this.data.set(key * this.bytesPer, value, true);
        } else {
          return this.properties.set(key, value);
        }
      },
      (function(){ // IE6-8 leaks function expression names to surrounding scope
        return function define(key, value, attr){
          if (hasIndex(key, this.Length)) {
            this.data.set(key * this.bytesPer, value, true);
          } else {
            return this.properties.define(key, value, attr);
          }
        };
      })()
    ];
  })());

  define($TypedArray.prototype, [
    function has(key){
      return hasIndex(key, this.Length) || this.properties.has(key);
    },
    function GetOwnProperty(key){
      if (hasIndex(key, this.Length)) {
        return new ArrayBufferIndex(this.get(key));
      }

      return GetOwn.call(this, key);
    },
    function DefineOwnProperty(key, desc, strict){
      if (hasIndex(key, this.Length)) {
        if ('Value' in desc) {
          this.set(key, desc.Value);
          return true;
        }
        return false;
      }

      return DefineOwn.call(this, key, desc, strict);
    }
  ]);

  var realm, intrinsics;

  engine.on('realm-change', function(){
    realm = engine.activeRealm;
    intrinsics = engine.activeIntrinsics;
  });

  return module.exports = $TypedArray;
})(typeof module !== 'undefined' ? module : {});
