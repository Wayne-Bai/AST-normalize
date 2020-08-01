import {
  @@create: create
} from '@@symbols';


import {
  $$CreateObject,
  $$Get,
  $$GetIntrinsic,
  $$Set
} from '@@internals';

import {
  builtinClass,
  define,
  extend,
  isInitializing
} from '@@utilities';

import {
  OrdinaryCreateFromConstructor,
  ToString
} from '@@operations';


const global = $$GetIntrinsic('global');

const HIDDEN = 6;



function setOrigin(filename = '', origin = null){
  this.filename = filename;
  this.origin = origin;
}

function setCode(loc, code){
  const start    = $$Get(loc, 'start'),
        line     = $$Get(start, 'line'),
        column   = $$Get(start, 'column'),
        fullLine = code.split('\n')[line - 1];

  this.line = fullLine;
  this.column = column;
  this.code = line + '\n' + '-'.repeat(column) + '^';
}



export class Error {
  constructor(message){
    if (!isInitializing(this, 'setCode')) {
      return new Error(message);
    }

    this.message = ToString(message);
    $$Set(this, 'setCode', setCode);
    $$Set(this, 'setOrigin', setOrigin);
  }

  toString(){
    return `${this.name}: ${this.message}`;
  }
}

define(Error.prototype, 'name', 'Error', HIDDEN);
define(Error.prototype, 'message', '', HIDDEN);

extend(Error, {
  @@create(){
    const obj = OrdinaryCreateFromConstructor(this, '%ErrorPrototype%');
    $$Set(obj, 'setCode', undefined);
    $$Set(obj, 'setOrigin', undefined);
    $$Set(obj, 'BuiltinBrand', 'BuiltinError');
    return obj;
  }
});

builtinClass(Error);



export class EvalError extends Error {
  constructor(message){
    if (!isInitializing(this, 'setCode')) {
      return new EvalError(message);
    }

    super(message);
  }
}

builtinClass(EvalError);
define(EvalError.prototype, 'name', 'EvalError', HIDDEN);


export class RangeError extends Error {
  constructor(message){
    if (!isInitializing(this, 'setCode')) {
      return new RangeError(message);
    }

    super(message);
  }
}

builtinClass(RangeError);
define(RangeError.prototype, 'name', 'RangeError', HIDDEN);


export class ReferenceError extends Error {
  constructor(message){
    if (!isInitializing(this, 'setCode')) {
      return new ReferenceError(message);
    }

    super(message);
  }
}

builtinClass(ReferenceError);
define(ReferenceError.prototype, 'name', 'ReferenceError', HIDDEN);



export class SyntaxError extends Error {
  constructor(message){
    if (!isInitializing(this, 'setCode')) {
      return new SyntaxError(message);
    }

    super(message);
  }
}

builtinClass(SyntaxError);
define(SyntaxError.prototype, 'name', 'SyntaxError', HIDDEN);


export class TypeError extends Error {
  constructor(message){
    if (!isInitializing(this, 'setCode')) {
      return new TypeError(message);
    }

    super(message);
  }
}

builtinClass(TypeError);
define(TypeError.prototype, 'name', 'TypeError', HIDDEN);


export class URIError extends Error {
  constructor(message){
    if (!isInitializing(this, 'setCode')) {
      return new URIError(message);
    }

    super(message);
  }
}

builtinClass(URIError);
define(URIError.prototype, 'name', 'URIError', HIDDEN);
