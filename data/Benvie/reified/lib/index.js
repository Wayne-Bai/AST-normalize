"use strict";

var genesis      = require('./genesis');
var NumericType  = require('./numeric');
var StructType   = require('./struct');
var ArrayType    = require('./array');
var BitfieldType = require('./bitfield');
var CharType     = require('./string');
var PointerType  = require('./pointer');
var OpaqueType   = genesis.OpaqueType;

module.exports = reified;

function reified(type, subject, size, values){
  type = genesis.lookupType(type);
  if (reified.prototype.isPrototypeOf(this)) {
    return new type(subject, size, values);
  } else {
    subject = genesis.lookupType(subject);
    if (!subject || type.Class === 'Type' && !subject) {
      return type
    }
    if (subject === 'Char') return new CharType(type);
    if (typeof subject === 'string' || subject.Class === 'Type') {
      return new reified.ArrayType(type, subject, size);
    } else if (typeof type === 'undefined') {
    } else if (Array.isArray(subject) || typeof subject === 'number') {
      return new reified.BitfieldType(type, subject, size);
    } else {
      if (typeof type !== 'string' && typeof subject === 'undefined') {
        subject = type;
        type = '';
      }
      subject = Object.keys(subject).reduce(function(ret, key){
        if (subject[key].Class !== 'Type') {
          var fieldType = reified(subject[key]);
          if (!fieldType) return ret;
          if (typeof fieldType === 'string' || fieldType.Class !== 'Type') {
            ret[key] = reified(key, subject[key]);
          } else {
            ret[key] = fieldType;
          }
        } else {
          ret[key] = subject[key];
        }
        return ret;
      }, {});
      return new reified.StructType(type, subject);
    }
  }
}

// ## static functions

reified.data = function data(type, buffer, offset, values){
  type = genesis.lookupType(type);
  if (typeof type === 'string') throw new TypeError('Type not found "'+type+'"');
  return new type(buffer, offset, values);
}

reified.reify = function reify(data){
  if (data.Class === 'Data') {
    var proto = Object.getPrototypeOf(data.constructor).prototype;
  }
  return proto.reify.call(data);
}

reified.reifier = function reifier(type, handler){
  type = reified(type);
  type.reifier(handler);
  return type;
}

reified.isType = function isType(o){ return genesis.Type.isPrototypeOf(o) }
reified.isData = function isData(o){ return genesis.Type.prototype.isPrototypeOf(o) }

Object.defineProperty(reified, 'defaultEndian', {
  enumerable: true,
  configurable: true,
  get: function(){
    return genesis.DataBuffer.prototype.endianness;
  },
  set: function(v){
    if (v !== 'LE' && v !== 'BE') throw new Error('Endianness must be "BE" or "LE"');
    genesis.DataBuffer.prototype.endianness = v;
  }
});


// pointer that points to an unknown structure, which can be later cast to something
var VoidPtr = reified('Opaque').ptr.typeDef('VoidPtr');
VoidPtr.prototype.reify = function(){
  return { type: VoidPtr, address: this.address.reify() };
}



function isSame(arr1, arr2){
  return !diff(arr1, arr2).length;
}

function diff(arr1, arr2){
  return arr1.filter(function(item){
    return !~arr2.indexOf(item);
  });
}

NumericType.Uint64 = new ArrayType('Uint64', 'Uint32', 2);
NumericType.Int64 = new ArrayType('Int64', 'Int32', 2);

var OctetString = new ArrayType('EightByteOctetString', 'Uint8', 8);

function octets(){ return new OctetString(this._data, this._offset) }
NumericType.Uint64.prototype.octets = octets;
NumericType.Int64.prototype.octets = octets;



// ## structures
genesis.api(reified, {
  Type:         genesis.Type,
  NumericType:  NumericType,
  StructType:   StructType,
  ArrayType:    ArrayType,
  BitfieldType: BitfieldType,
  DataBuffer:   genesis.DataBuffer,
  CharType:     CharType,
  PointerType:  PointerType,
  OpaqueType:   OpaqueType,
  VoidPtr:      VoidPtr,
  toString:     function toString(){ return '◤▼▼▼▼▼▼▼◥\n▶reified◀\n◣▲▲▲▲▲▲▲◢' },
});
