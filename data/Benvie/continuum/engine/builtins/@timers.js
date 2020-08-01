import {
  ToInteger,
  ToString
} from '@@operations';

import {
  builtinFunction,
  internalFunction
} from '@@utilities';

import {
  $$ClearImmediate,
  $$ClearTimer,
  $$SetImmediate,
  $$SetTimer
} from '@@internals';

import {
  Function
} from '@function';


function prepareCallback(callback){
  return typeof callback === 'function' ? callback : new Function(ToString(callback));
}

internalFunction(prepareCallback);


export function clearImmediate(id){
  $$ClearImmediate(ToInteger(id));
}

builtinFunction(clearImmediate);


export function clearInterval(id){
  $$ClearTimer(ToInteger(id));
}

builtinFunction(clearInterval);


export function clearTimeout(id){
  $$ClearTimer(ToInteger(id));
}

builtinFunction(clearTimeout);


export function setImmediate(callback){
  return $$SetImmediate(prepareCallback(callback));
}

builtinFunction(setImmediate);


export function setInterval(callback, milliseconds){
  return $$SetTimer(prepareCallback(callback), ToInteger(milliseconds), true);
}

builtinFunction(setInterval);


export function setTimeout(callback, milliseconds){
  return $$SetTimer(prepareCallback(callback), ToInteger(milliseconds), false);
}

builtinFunction(setTimeout);
