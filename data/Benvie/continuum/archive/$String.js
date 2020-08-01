var $String = (function(exports){
  var objects     = require('../lib/objects'),
      utility     = require('../lib/utility'),
      descriptors = require('./descriptors'),
      $Object     = require('./$Object').$Object;

  var StringIndex = descriptors.StringIndex,
      inherit     = objects.inherit,
      define      = objects.define,
      numbers     = utility.numbers,
      unique      = utility.unique;

  var StringValueSymbol = require('./$Symbol').wellKnownSymbols.StringValue;


  var ___ = 0,
      E__ = 1,
      _CW = 6;

  var ObjectGet = $Object.prototype.get,
      ObjectHas = $Object.prototype.has,
      ObjectEach = $Object.prototype.each,
      ObjectQuery = $Object.prototype.query,
      ObjectGetOwn = $Object.prototype.GetOwnProperty,
      ObjectDescribe = $Object.prototype.describe,
      ObjectEnumerate = $Object.prototype.Enumerate;


  function $String(value){
    $Object.call(this, intrinsics.StringProto);
    this.StringValue = value;
    this.define('length', value.length, ___);
  }

  exports.$String = $String;


  inherit($String, $Object, {
    BuiltinBrand: 'StringWrapper',
    type: '$String'
  }, [

    function each(callback){
      var str = this.getPrimitiveValue();
      for (var i=0; i < str.length; i++) {
        callback([i+'', str[i], E__]);
      }
      ObjectEach.call(this, callback);
    },
    function has(key){
      var str = this.getPrimitiveValue();
      if (key < str.length && key >= 0) {
        return true;
      }
      return ObjectHas.call(this, key);
    },
    function get(key){
      var str = this.getPrimitiveValue();
      if (key < str.length && key >= 0) {
        return str[key];
      }
      return ObjectGet.call(this, key);
    },
    function query(key){
      var str = this.getPrimitiveValue();
      if (key < str.length && key >= 0) {
        return E__;
      }
      return ObjectQuery.call(this, key);
    },
    function describe(key){
      var str = this.getPrimitiveValue();
      if (key < str.length && key >= 0) {
        return [key, str[key], E__];
      }
      return ObjectDescribe.call(this, key);
    },
    function GetOwnProperty(key){
      var str = this.getPrimitiveValue();
      if (key < str.length && key >= 0) {
        return new StringIndex(str[key]);
      }

      var desc = ObjectGetOwn.call(this, key);
      if (desc) {
        return desc;
      }
    },
    function Get(key){
      var str = this.getPrimitiveValue();
      if (key < str.length && key >= 0) {
        return str[key];
      }
      return this.GetP(this, key);
    },
    function Enumerate(includePrototype, onlyEnumerable){
      var str = this.getPrimitiveValue();
      var props = ObjectEnumerate.call(this, includePrototype, onlyEnumerable);
      return unique(numbers(str.length).concat(props));
    }
  ]);

  var realm, intrinsics;

  define($String, [
    function changeRealm(newRealm){
      realm = newRealm;
      intrinsics = realm ? realm.intrinsics : undefined;
    }
  ]);

  return exports;
})(typeof module !== 'undefined' ? exports : {});
