"use strict";


module.exports = DataBuffer;

var types = ['Int8', 'Int16', 'Int32', 'Uint8', 'Uint16', 'Uint32', 'Float32', 'Float64'];

// Basic stand-in for Buffer in browsers that defers to ArrayBuffer
var Buffer = function(global){
  if ('Buffer' in global) return global.Buffer;

  function Buffer(subject, offset, length){
    return new ArrayBuffer(subject, offset, length);
  }
  Buffer.isBuffer = function isBuffer(o){
    return o instanceof ArrayBuffer;
  }
  return Buffer;
}(Function('return this')());

var ArrayBuffers = { ArrayBuffer:  ArrayBuffer };

function isArrayBuffer(o){
  return o instanceof ArrayBuffer || !!(o && o.constructor && o.constructor.name in ArrayBuffers);
}


function DataBuffer(subject, offset, length){
  if (!DataBuffer.prototype.isPrototypeOf(this)) return new DataBuffer(subject, offset, length);
  if (!subject) throw new Error('Tried to initialize with no usable length or subject');
  if (isArrayBuffer(subject)) {
    this.array = subject;
  }

  if (subject) {
    if (subject.buffer) {
      offset = (subject.offset || subject.byteOffset || 0) + (offset || 0);
      while (subject.buffer) subject = subject.buffer;
    }
    if (typeof offset === 'undefined') {
      offset = subject.offset || subject.byteOffset;
    }
    if (typeof length === 'undefined') {
      length = subject.length || subject.byteLength;
    }
  }

  if (typeof subject === 'number') {
    this.view = new DataView(new Buffer(subject));
  } else if (Buffer.isBuffer(subject)) {
    this.view = new DataView(subject, offset, length);
  } else if (subject instanceof DataView) {
    this.view = new DataView(subject.buffer, offset, length);
  } else if (DataBuffer.isDataBuffer(subject)) {
    this.view = new DataView(subject.buffer, subject.offset + offset, length || subject.length);
  }
  this.length = this.view.byteLength;
  this.buffer = this.view.buffer;
  this.offset = this.view.byteOffset;
}

DataBuffer.isBuffer = Buffer.isBuffer;
DataBuffer.isDataBuffer = function isDataBuffer(o){ return DataBuffer.prototype.isPrototypeOf(o) }

function toNum(n){ return isFinite(n) ? +n : 0 }
function toNumOrUndef(n){ if (isFinite(n)) return +n }
function toUint8(x) { return (x >>> 0) & 0xff }

DataBuffer.prototype = {
  constructor: DataBuffer,
  endianness: 'LE',

  subarray: function(start, end){
    start = toNum(start);
    end = toNumOrUndef(end);
    return new DataBuffer(this.view, start, end);
  },

  typed: function(type, offset, length){
    type = ArrayBuffers[type+'Array'];
    if (arguments.length === 1) {
      return new type(this.view);
    } else if (arguments.length === 2) {
      return new type(this.view, toNum(offset));
    } else {
      length = toNum(length) || (this.length / type.BYTES_PER_ELEMENT) | 0;
      return new type(this.view, toNum(offset), length);
    }
  },

  copy: function(target, targetOffset, start, end){
    if (isFinite(target)) {
      end = start, start = targetOffset, targetOffset = target;
      target = null;
    }
    targetOffset = toNum(targetOffset);
    start = toNum(start);
    end = end ? +end : this.length - 1;
    if (start > end) throw new Error('End less than start');
    if (start < 0) throw new RangeError('Start less than zero');
    if (end >= this.length) throw new RangeError('End greater than length');
    var length = end - start;
    if (!target) {
      target = new Buffer(length);
    } else if (targetOffset + length > target.length) {
      length = target.length;
    }

    target = new DataBuffer(target, targetOffset, length).typed('Uint8');
    var source = this.subarray(start, end).typed('Uint8');
    for (var i=0; i<length; i++) {
      target[i] = source[i];
    }
    return target;
  },

  clone: function(){
    var buffer = new DataBuffer(new Buffer(this.length));
    for (var i=0; i < this.length; i++) {
      buffer.writeUint8(i, this.readUint8(i));
    }
    return buffer;
  },

  fill: function(v){
    v = toNum(v);
    var buff = this.typed('Uint8');
    for (var i=0; i < this.length; i++) {
      buff[i] = v;
    }
  },

  write: function(source, offset, length){
    length = isFinite(length) ? +length : source.length;
    offset = isFinite(offset) ? +offset : 0;
    length = Math.min(this.length, length+offset, source.length);
    var target = this.subarray(offset, offset.length).typed('Uint8');
    for (var i=0; i<length; i++) {
      target[i] = source[i];
    }
    return this;
  },

  map: function(){
    return [].map.apply(this.typed('Uint8'), arguments);
  },

  slice: function(start, end, encoding){
    return this.subarray(start, end).toString(encoding || 'ascii');
  },

  toArray: function(type){
    return [].map.call(this.typed(type || 'Uint8'), function(x){ return x });
  },

  toString: function(encoding){
    switch (encoding) {
      case 'ascii':
        return this.map(function(val){
          return String.fromCharCode(val);
        }).join('');
      default:
        return this.map(function(v){
          return ('000'+v.toString(10)).slice(-3)
        })
          .join(' ')
          .split(/((?:\d\d\d ?){10}(?: ))/)
          .filter(Boolean)
          .map(Function.call.bind(''.trim))
          .join('\n')
    }
  }
}

types.forEach(function(type){
  ArrayBuffers[type+'Array'] = global[type+'Array'];
  DataBuffer.prototype['read'+type] = function(offset){
    return this.view['get'+type](toNum(offset), this.endianness === 'LE');
  }
  DataBuffer.prototype['write'+type] = function(offset, value){
    return this.view['set'+type](toNum(offset), toNum(value), this.endianness === 'LE');
  }
});


Array.apply(null, Array(20)).forEach(function(n, index){
  Object.defineProperty(DataBuffer.prototype, index, {
    configurable: true,
    get: function(){ return this.readUint8(index) },
    set: function(v){ return this.writeUint8(index, v) }
  })
});
