// #####################################
// ####### 9 Abstract Operations #######
// #####################################


import {
  abs,
  call,
  floor,
  getIntrinsic,
  hasBrand,
  isNaN,
  isZeroOrInfinite,
  sign
} from '@@utilities';

import {
  ArrayCreate,
  ObjectCreate,
  Type
} from '@@types';

import {
  $$Assert,
  $$AssertIsInternalArray,
  $$AssertIsECMAScriptValue,
  $$AssertWontThrow,
  $$Invoke,
  $$CallerName,
  $$CreateObject,
  $$CreateInternalObject,
  $$CurrentRealm,
  $$Exception,
  $$Get,
  $$GetIntrinsic,
  $$Has,
  $$HasArgument,
  $$StringToNumber,
  $$Set
} from '@@internals';

import {
  NaN
} from '@@constants';

import {
  @@ToPrimitive: ToPrimitive
} from '@@symbols';



// ###########################################
// ##### 9.1 Type Conversion and Testing #####
// ###########################################


// #########################
// ### 9.1.1 ToPrimitive ###
// #########################

export function ToPrimitive(argument, PreferredType){
  if (Type(argument) !== 'Object') {
    return argument;
  }

  let hint = 'number';
  if (!$$HasArgument('PreferredType')) {
    hint = 'default';
  } else if (PreferredType === 'String') {
    hint = 'string';
  }

  const exoticToPrim = Get(argument, @@ToPrimitive);
  if (exoticToPrim !== undefined) {
    if (!IsCallable(exoticToPrim)) {
      throw $$Exception('cannot_convert_to_primitive', []);
    }

    const result = call(exoticToPrim, argument);
    if (Type(result) !== 'Object') {
      return result;
    } else {
      throw $$Exception('cannot_convert_to_primitive', []);
    }
  }

  if (hint === 'default') {
    hint = 'number';
  }

  return OrdinaryToPrimitive(argument, hint);
}

export function OrdinaryToPrimitive(O, hint){
  $$Assert(Type(O) === 'Object');
  $$Assert(Type(hint) === 'String' && hint === 'string' || hint === 'number');

  let tryFirst, trySecond;
  if (hint === 'string') {
    tryFirst = 'toString';
    trySecond = 'valueOf';
  } else {
    tryFirst = 'valueOf';
    trySecond = 'toString';
  }

  const first = Get(O, tryFirst);
  if (IsCallable(first)) {
    const result = call(first, O);
    if (Type(result) !== 'Object') {
      return result;
    }
  }

  const second = Get(O, trySecond);
  if (IsCallable(second)) {
    const result = call(second, O);
    if (Type(result) !== 'Object') {
      return result;
    }
  }

  throw $$Exception('cannot_convert_to_primitive', []);
}


// #######################
// ### 9.1.2 ToBoolean ###
// #######################

export function ToBoolean(argument){
  switch (Type(argument)) {
    case 'Boolean':
      return argument;
    case 'Undefined':
    case 'Null':
      return false;
    case 'Number':
      return argument !== 0 && argument === argument;
    case 'String':
      return argument !== '';
    case 'Object':
      return true;
  }
}


// ######################
// ### 9.1.3 ToNumber ###
// ######################

export function ToNumber(argument){
  switch (Type(argument)) {
    case 'Number':
      return argument;
    case 'Undefined':
      return NaN;
    case 'Null':
      return 0;
    case 'Boolean':
      return argument === true ? 1 : 0;
    case 'String':
      return $$StringToNumber(argument);
    case 'Object':
      return ToNumber(ToPrimitive(argument), 'Number');
  }
}


// #######################
// ### 9.1.4 ToInteger ###
// #######################

export function ToInteger(argument){
  const number = ToNumber(argument);

  if (isNaN(number)) {
    return 0;
  }

  if (isZeroOrInfinite(number)) {
    return number;
  }

  return sign(number) * floor(abs(number));
}


// #####################
// ### 9.1.5 ToInt32 ###
// #####################

export function ToInt32(argument){
  const number = ToNumber(argument);

  if (isNaN(number) || isZeroOrInfinite(number)) {
    return 0;
  }

  const int = sign(number) * floor(abs(number)) & 0xffffffff;

  return int >= 0x80000000 ? int - 0x80000000 : int;
}


// ######################
// ### 9.1.6 ToUint32 ###
// ######################

export function ToUint32(argument){
  const number = ToNumber(argument);

  if (isNaN(number) || isZeroOrInfinite(number)) {
    return 0;
  }

  return sign(number) * floor(abs(number)) & 0xffffffff;
}


// ######################
// ### 9.1.7 ToUint16 ###
// ######################

export function ToUint16(argument){
  const number = ToNumber(argument);

  if (isNaN(number) || isZeroOrInfinite(number)) {
    return 0;
  }

  return sign(number) * floor(abs(number)) & 0xffff;
}


// ######################
// ### 9.1.8 ToString ###
// ######################

export function ToString(argument){
  switch (Type(argument)) {
    case 'String':
      return argument;
    case 'Undefined':
      return 'undefined';
    case 'Number':
      return $$Invoke(argument, 'toString');
    case 'Null':
      return 'null';
    case 'Boolean':
      return argument === true ? 'true' : 'false';
    case 'Object':
      return ToString(ToPrimitive(argument, 'String'));
  }
}


// ######################
// ### 9.1.9 ToObject ###
// ######################

export function ToObject(argument){
  switch (Type(argument)) {
    case 'Object':
      return argument;
    case 'Undefined':
      throw $$Exception('undefined_to_object', []);
    case 'Null':
      throw $$Exception('null_to_object', []);
    case 'Boolean':
      return new (getIntrinsic('%Boolean%'))(argument);
    case 'Number':
      return new (getIntrinsic('%Number%'))(argument);
    case 'String':
      return new (getIntrinsic('%String%'))(argument);
  }
}


// ############################
// ### 9.1.10 ToPropertyKey ###
// ############################

export function ToPropertyKey(argument){
  const type = Type(argument);

  if (type === 'String' || type === 'Object' && hasBrand(argument, 'BuiltinSymbol')) {
    return argument;
  }

  return ToString(argument);
}



// #################################################
// ##### 9.2 Testing and Comparison Operations #####
// #################################################


// ##################################
// ### 9.2.1 CheckObjectCoercible ###
// ##################################

export function CheckObjectCoercible(argument){
  if (argument === null) {
    throw $$Exception('null_to_object', []);
  } else if (argument === undefined) {
    throw $$Exception('undefined_to_object', []);
  }

  return argument;
}

// ########################
// ### 9.2.2 IsCallable ###
// ########################

export function IsCallable(argument){
  return Type(argument) === 'Object' && $$Has(argument, 'Call');
}


// #######################
// ### 9.2.3 SameValue ###
// #######################

export function SameValue(x, y){
  return x === y ? x !== 0 || 1 / x === 1 / y : isNaN(x) && isNaN(y);
}


// ###########################
// ### 9.2.4 IsConstructor ###
// ###########################

export function IsConstructor(argument){
  return Type(argument) === 'Object' && $$Has(argument, 'Construct');
}

// ###########################
// ### 9.2.5 IsPropertyKey ###
// ###########################

export function IsPropertyKey(argument){
  const type = Type(argument);
  return type === 'String' || type === 'Object' && hasBrand(argument, 'BuiltinSymbol');
}




// #####################################
// ##### 9.3 Operations on Objects #####
// #####################################


// #################
// ### 9.3.1 Get ###
// #################

export function Get(O, P){
  $$Assert(Type(O) === 'Object');
  $$Assert(IsPropertyKey(P) === true);

  return $$Invoke(O, 'GetP', O, P);
}


// #################
// ### 9.3.2 Put ###
// #################

export function Put(O, P, V, Throw){
  $$Assert(Type(O) === 'Object');
  $$Assert(IsPropertyKey(P) === true);
  $$Assert(Type(Throw) === 'Boolean');

  const success = $$Invoke(O, 'SetP', O, P, V);
  if (Throw && !success) {
    throw $$Exception('strict_cannot_assign', [P]);
  }

  return success;
}


// ###################################
// ### 9.3.3 CreateOwnDataProperty ###
// ###################################

const normal = $$CreateInternalObject();
$$Set(normal, 'Writable', true);
$$Set(normal, 'Enumerable', true);
$$Set(normal, 'Configurable', true);

export function CreateOwnDataProperty(O, P, V){
  $$Assert(Type(O) === 'Object');
  $$Assert(IsPropertyKey(P) === true);
  //$$Assert(!hasOwn(O, P));

  const extensible = $$Invoke(O, 'IsExtensible');
  if (!extensible) {
    return extensible;
  }

  $$Set(normal, 'Value', V);
  const result = $$Invoke(O, 'DefineOwnProperty', P, normal);
  $$Set(normal, 'Value', undefined);

  return result;
}


// ###################################
// ### 9.3.4 DefinePropertyOrThrow ###
// ###################################

export function DefinePropertyOrThrow(O, P, desc){
  $$Assert(Type(O) === 'Object');
  $$Assert(IsPropertyKey(P) === true);

  const success = $$Invoke(O, 'DefineOwnProperty', P, desc);
  if (!success) {
    throw $$Exception('redefine_disallowed', [$$CallerName(), P]);
  }

  return success;
}


// ###################################
// ### 9.3.5 DeletePropertyOrThrow ###
// ###################################

export function DeletePropertyOrThrow(O, P){
  $$Assert(Type(O) === 'Object');
  $$Assert(IsPropertyKey(P) === true);

  const success = $$Invoke(O, 'Delete', P); // TODO: rename to DeleteProperty
  if (!success) {
    throw $$Exception('delete_disallowed', [$$CallerName(), P]);
  }
  return success;
}


// non-spec function
export function PutPropertyOrThrow(O, P, value){
  $$Assert(Type(O) === 'Object');
  $$Assert(IsPropertyKey(P) === true);

  const success = $$Invoke(O, 'Put', P, value);
  if (!success) {
    throw $$Exception('redefine_disallowed', [$$CallerName(), P]);
  }
  return success;
}


// #########################
// ### 9.3.6 HasProperty ###
// #########################

export function HasProperty(O, P){
  $$Assert(Type(O) === 'Object');
  $$Assert(IsPropertyKey(P) === true);

  return $$Invoke(O, 'HasProperty', P);
}


// #######################
// ### 9.3.7 GetMethod ###
// #######################

export function GetMethod(O, P){
  $$Assert(Type(O) === 'Object');
  $$Assert(IsPropertyKey(P) === true);

  const func = $$Invoke(O, 'GetP', O, P);
  if (func === undefined) {
    return func;
  }

  if (!IsCallable(func)) {
    throw $$Exception('property_not_function', [P]);
  }

  return func;
}


// ####################
// ### 9.3.8 Invoke ###
// ####################

const emptyArgs = [];

export function Invoke(O, P, args){
  $$Assert(IsPropertyKey(P) === true);

  args || (args = emptyArgs);

  const obj  = ToObject(O),
        func = GetMethod(obj, P);

  if (func === undefined) {
    throw $$Exception('property_not_function', [P]);
  }

  return $$Invoke(func, 'Call', O, $$Get(args, 'array'));
}


// ################################
// ### 9.3.9 TestIfSecureObject ###
// ################################

function TestIfSecureObject(O, immutable){}


// ###############################
// ### 9.3.10 MakeObjectSecure ###
// ###############################

function MakeObjectSecure(O, immutable){}


// ##################################
// ### 9.3.11 CreateArrayFromList ###
// ##################################

function CreateArrayFromList(elements){
  $$AssertIsInternalArray(elements);

  const array = ArrayCreate(0),
        len   = $$Get(elements, 'length');

  for (let n=0; n < len; n++) {
    const element = $$Get(elements, n);
    $$AssertIsECMAScriptValue(elements);
    $$AssertWontThrow(CreateOwnDataProperty(array, ToString(n), element));
  }

  return array;
}


// ##################################
// ### 9.3.12 OrdinaryHasInstance ###
// ##################################

export function OrdinaryHasInstance(C, O){
  if (!IsCallable(C)) {
    return false;
  }

  if ($$Has(C, 'BoundTargetFunction')) {
    return O instanceof $$Get(C, 'BoundTargetFunction');
  }

  if (Type(O) !== 'Object') {
    return false;
  }

  const P = Get(C, 'prototype');
  if (Type(P) !== 'Object') {
    throw $$Exception('instanceof_nonobject_proto');
  }

  do {
    O = $$Invoke(O, 'GetInheritance');
    if (O === P) {
      return true;
    }
  } while (O)

  return false;
}


// ############################################
// ### 9.3.13 OrdinaryCreateFromConstructor ###
// ############################################


export function OrdinaryCreateFromConstructor(constructor, intrinsicDefaultProto){
  if (Type(constructor) !== 'Object') {
    throw $$Exception('construct_non_constructor', [Type(constructor)]);
  }

  let proto = Get(constructor, 'prototype');

  if (!proto) {
    const realm = $$Has(constructor, 'Realm') ? $$Get(constructor, 'Realm') : $$CurrentRealm();
    proto = $$GetIntrinsic(realm, intrinsicDefaultProto);
  }

  return ObjectCreate(proto);
}

