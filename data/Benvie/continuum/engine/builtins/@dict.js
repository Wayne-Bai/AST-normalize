import {
  builtinFunction
} from '@@utilities';

import {
  ObjectCreate
} from '@@types';

import {
  ToObject
} from '@@operations';

import {
  hasOwn
} from '@reflect';


export function keys(obj){
  obj = ToObject(obj);
  return (function*(){
    for (let x in obj) {
      if (hasOwn(obj, x)) {
        yield x;
      }
    }
  })();
}

builtinFunction(keys);


export function values(obj){
  obj = ToObject(obj);
  return (function*(){
    for (let x in obj) {
      if (hasOwn(obj, x)) {
        yield obj[x];
      }
    }
  })();
}

builtinFunction(values);


export function entries(obj){
  obj = ToObject(obj);
  return (function*(){
    for (let x in obj) {
      if (hasOwn(obj, x)) {
        yield [x, obj[x]];
      }
    }
  })();
}

builtinFunction(entries);


export function dict(init){
  const d = ObjectCreate(null);
  if (init) {
    for (let key of keys(init)) {
      d[key] = init[key];
    }
  }
  return d;
}

builtinFunction(dict);
