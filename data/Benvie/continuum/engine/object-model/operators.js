var operators = (function(exports){
  "use strict";
  var constants        = require('../constants'),
      Nil              = require('./$Nil'),
      symbols          = require('./$Symbol').wellKnownSymbols,
      $$ThrowException = require('../errors').$$ThrowException,
      engine           = require('../engine').engine;

  var hasInstanceSymbol  = symbols.hasInstance,
      createSymbol       = symbols.create,
      ToPrimitiveSymbol  = symbols.ToPrimitive;

  var isFalsey       = Nil.isFalsey,
      isNullish      = Nil.isNullish,
      isUndefined    = Nil.isUndefined,
      isUndetectable = Nil.isUndetectable;


  function $$HasPrimitiveBase(v){
    var type = typeof v.base;
    return type === 'string' || type === 'number' || type === 'boolean';
  }

  exports.$$HasPrimitiveBase = $$HasPrimitiveBase;


  // ## $$GetValue

  function $$GetValue(v){
    if (!v || !v.Reference || v.Abrupt) return v;
    var base = v.base;

    if (base == null) {
      return $$ThrowException('not_defined', [v.name]);
    } else {
      var type = typeof base;

      if (type !== 'object') {
        if (type === 'string' && v.name === 'length' || v.name >= 0 && v.name < base.length) {
          return base[v.name];
        }
        base = $$ToObject(base);
      }

      if (base.Get) {
        if ('thisValue' in v) {
          return base.GetP($$GetThisValue(v), v.name);
        } else {
          return base.Get(v.name);
        }
      }

      if (base.GetBindingValue) {
        return base.GetBindingValue(v.name, v.strict);
      }
    }
  }

  exports.$$GetValue = $$GetValue;

  // ## $$PutValue

  function $$PutValue(v, w){
    if (!v) {
      return $$ThrowException('non_object_property_store', [TYPEOF(v), TYPEOF(w)]);
    } else if (v.Abrupt) {
      return v;
    } else if (!v.Reference) {
      return $$ThrowException('non_object_property_store', [v.name, v.base]);
    } else if (w && w.Abrupt) {
      return w;
    }

    var base = v.base;

    if (base == null) {
      if (v.strict) {
        return $$ThrowException('not_defined', [v.name, base]);
      }

      var global = engine.activeGlobal;
      return global ? global.Put(v.name, w, false) : false;
    }

    if (typeof base !== 'object') {
      base = $$ToObject(base);
    }

    if (base.Get) {
      if ('thisValue' in v) {
        return base.SetP(GetThisValue(v), v.name, w, v.strict);
      }
      return base.Put(v.name, w, v.strict);
    } else if (base.SetMutableBinding) {
      return base.SetMutableBinding(v.name, w, v.strict);
    }
  }
  exports.$$PutValue = $$PutValue;

  // ## GetThisValue

  function $$GetThisValue(v){
    if (!v || v.Abrupt || !v.Reference) {
      return v;
    }

    var base = v.base;

    if (base == null) {
      return $$ThrowException('non_object_property_load', [v.name, base]);
    }

    return 'thisValue' in v ? v.thisValue : base;
  }
  exports.$$GetThisValue = $$GetThisValue;

  var runtime;


  function $$ToObject(argument){
    switch (typeof argument) {
      case 'undefined':
        return $$ThrowException('undefined_to_object', []);
      case 'object':
        return argument === null ? $$ThrowException('null_to_object', []) : argument;
      case 'boolean':
        var name = '%Boolean%';
        break;
      case 'number':
        var name = '%Number%';
        break;
      case 'string':
        var name = '%String%';
    }

    return intrinsics[name].Construct([argument]);
  }

  exports.$$ToObject = $$ToObject;


  function $$Type(argument){
    if (argument === null) {
      return 'Null';
    }
    switch (typeof argument) {
      case 'undefined':
        return 'Undefined';
      case 'object':
        if (argument.Reference) {
          return $$Type($$GetValue(argument));
        } else if (argument.Completion){
          return 'Completion';
        } else if (isUndefined(argument)) {
          return 'Undefined'
        }
        return 'Object';
      case 'string':
        return 'String';
      case 'number':
        return 'Number';
      case 'boolean':
        return 'Boolean';
    }
  }

  exports.$$Type = $$Type;


  function $$IsCallable(argument){
    if (argument && argument.Abrupt) return argument;
    return !!(argument && typeof argument === 'object' ? argument.Call : false);
  }

  exports.$$IsCallable = $$IsCallable;


  function $$ToPrimitive(argument, PreferredType){
    if ($$Type(argument) !== 'Object') {
      return argument;
    }

    if (PreferredType === 'String') {
      var hint = 'string';
    } else if (PreferredType === 'Number') {
      var hint = 'number';
    } else {
      var hint = 'default';
    }

    var exoticToPrim = argument.Get(ToPrimitiveSymbol);
    if (exoticToPrim !== undefined) {
      if (!$$IsCallable(exoticToPrim)) {
        return $$ThrowException('cannot_convert_to_primitive', []);
      }
      var result = exoticToPrim.Call(argument, [hint]);
      if ($$Type(result) !== 'Object') {
        return result;
      }
      return $$ThrowException('cannot_convert_to_primitive', []);
    }

    if (hint === 'default') {
      hint = 'number';
    }

    return $$OrdinaryToPrimitive(argument, hint);
  }

  exports.$$ToPrimitive = $$ToPrimitive;


  function $$OrdinaryToPrimitive(O, hint){
    // Assert: $$Type(O) is Object
    // Assert: $$Type(hint) is String and its value is either "string" or "number"

    if (hint === 'string') {
      var tryFirst  = 'toString',
          trySecond = 'valueOf';
    } else {
      var tryFirst  = 'valueOf',
          trySecond = 'toString';
    }

    var first = O.Get(tryFirst);
    if ($$IsCallable(first)) {
      var result = first.Call(O);
      if ($$Type(result) !== 'Object') {
        return result;
      }
    }

    var second = O.Get(trySecond);
    if ($$IsCallable(second)) {
      var result = second.Call(O);
      if ($$Type(result) !== 'Object') {
        return result;
      }
    }

    return $$ThrowException('cannot_convert_to_primitive', []);
  }

  exports.$$OrdinaryToPrimitive = $$OrdinaryToPrimitive;


  function $$ToBoolean(argument){
    if (argument && argument.Completion) return argument;
    return !isFalsey(argument);
  }
  exports.$$ToBoolean = $$ToBoolean;


  function $$ToNumber(argument){
    if (!isFalsey(argument) && typeof argument === 'object') {
      if (argument.Abrupt) return argument;
      return $$ToNumber($$ToPrimitive(argument, 'Number'));
    }
    return +argument;
  }
  exports.$$ToNumber = $$ToNumber;


  function $$ToInteger(argument){
    argument = $$ToNumber(argument);

    if (argument && argument.Abrupt) return argument;

    if (argument !== argument) {
      return 0;
    }

    if (argument === 0 || argument === Infinity || argument === -Infinity) {
      return argument;
    }

    return argument >> 0;
  }
  exports.$$ToInteger = $$ToInteger;

  // ## $$ToUint32

  function $$ToUint32(argument){
    argument = $$ToNumber(argument);
    if (argument && argument.Abrupt) return argument;
    return argument >>> 0;
  }
  exports.$$ToUint32 = $$ToUint32;

  // ## $$ToInt32

  function $$ToInt32(argument){
    argument = $$ToNumber(argument);
    if (argument && argument.Abrupt) return argument;
    return argument >> 0;
  }
  exports.$$ToInt32 = $$ToInt32;

  // ## $$ToUint16

  function $$ToUint16(argument){
    argument = $$ToNumber(argument);
    if (argument && argument.Abrupt) return argument;
    return argument >>> 0 & 0xffff;
  }
  exports.$$ToUint16 = $$ToUint16;


  // ## $$ToPropertyKey

  function $$ToPropertyKey(argument){
    if (isFalsey(argument)) {
      return argument + '';
    }
    var type = typeof argument;
    if (type === 'string' || type === 'object' && argument.Abrupt || argument.BuiltinBrand === 'BuiltinSymbol') {
      return argument;
    }
    return $$ToString(argument);
  }
  exports.$$ToPropertyKey = $$ToPropertyKey;

  // ## $$ToString

  function $$ToString(argument){
    switch (typeof argument) {
      case 'string': return argument;
      case 'undefined':
      case 'number':
      case 'boolean': return ''+argument;
      case 'object':
        if (argument === null) {
          return 'null';
        } else if (argument.Abrupt) {
          return argument;
        } else if (isUndetectable(argument)) {
          return argument.toString();
        }
        return $$ToString($$ToPrimitive(argument, 'String'));
    }
  }
  exports.$$ToString = $$ToString;


  void function(createChanger){
    exports.PRE_INC  = createChanger(true, 1);
    exports.POST_INC = createChanger(false, 1);
    exports.PRE_DEC  = createChanger(true, -1);
    exports.POST_DEC = createChanger(false, -1);
  }(function(pre, change){
    return function(ref) {
      var val = $$ToNumber($$GetValue(ref));
      if (val && val.Abrupt) return val;

      var newVal = val + change,
          result = $$PutValue(ref, newVal);

      if (result && result.Abrupt) return result;
      return pre ? newVal : val;
    };
  });

  var MUL, DIV, MOD, SUB, BIT_OR, BIT_AND, BIT_XOR;
  void function(makeMathOp){
    exports.MUL     = MUL     = makeMathOp(function(l, r){ return l * r });
    exports.DIV     = DIV     = makeMathOp(function(l, r){ return l / r });
    exports.MOD     = MOD     = makeMathOp(function(l, r){ return l % r });
    exports.SUB     = SUB     = makeMathOp(function(l, r){ return l - r });
    exports.BIT_AND = BIT_AND = makeMathOp(function(l, r){ return l & r });
    exports.BIT_OR  = BIT_OR  = makeMathOp(function(l, r){ return l | r });
    exports.BIT_XOR = BIT_XOR = makeMathOp(function(l, r){ return l ^ r });
  }(function(finalize){
    return function(lval, rval) {
      lval = $$ToNumber(lval);
      if (lval && lval.Abrupt) return lval;
      rval = $$ToNumber(rval);
      if (rval && rval.Abrupt) return rval;
      return finalize(lval, rval);
    };
  });

  function convertAdd(a, b, type, converter){
    if (typeof a !== type) {
      a = converter(a);
      if (a && a.Abrupt) return a;
    } else if (typeof b !== type) {
      b = converter(b);
      if (b && b.Abrupt) return b;
    }
    return a + b;
  }



  function ADD(lval, rval) {
    lval = $$ToPrimitive(lval);
    if (lval && lval.Abrupt) return lval;

    rval = $$ToPrimitive(rval);
    if (rval && rval.Abrupt) return rval;

    if (typeof lval === 'string' || typeof rval === 'string') {
      return convertAdd(lval, rval, 'string', $$ToString);
    }
    return convertAdd(lval, rval, 'number', $$ToNumber);
  }
  exports.ADD = ADD;



  function STRING_ADD(lval, rval){
    return convertAdd(lval, rval, 'string', $$ToString);
  }
  exports.STRING_ADD = STRING_ADD;



  var SHL, SHR, SAR;
  void function(makeShifter){
    exports.SHL = SHL = makeShifter(function(l, r){ return l << r });
    exports.SHR = SHR = makeShifter(function(l, r){ return l >> r });
    exports.SAR = SAR = makeShifter(function(l, r){ return l >>> r });
  }(function(finalize){
    return function(lval, rval) {
      lval = $$ToInt32(lval);
      if (lval && lval.Abrupt) return lval;
      rval = $$ToUint32(rval);
      if (rval && rval.Abrupt) return rval;
      return finalize(lval, rval & 0x1f);
    };
  });



  function COMPARE(x, y, left){
    if (left === false) {
      var lval = x,
          rval = y;
    } else {
      var lval = y,
          rval = x;
    }

    lval = $$ToPrimitive(lval, 'Number');
    if (lval && lval.Abrupt) return lval;

    rval = $$ToPrimitive(rval, 'Number');
    if (rval && rval.Abrupt) return rval;

    var ltype = typeof lval,
        rtype = typeof rval;

    if (ltype === 'string' || rtype === 'string') {
      if (ltype !== 'string') {
        lval = $$ToString(lval);
        if (lval && lval.Abrupt) return lval;
      } else if (rtype !== 'string') {
        rval = $$ToString(rval);
        if (rval && rval.Abrupt) return rval;
      }
      if (typeof lval === 'string' && typeof rval === 'string') {
        return lval < rval;
      }
    } else {
      if (ltype !== 'number') {
        lval = $$ToNumber(lval);
        if (lval && lval.Abrupt) return lval;
      }
      if (rtype !== 'number') {
        rval = $$ToNumber(rval);
        if (rval && rval.Abrupt) return rval;
      }
      if (typeof lval === 'number' && typeof rval === 'number') {
        return lval < rval;
      }
    }
  }

  var LT, GT, LTE, GTE;
  void function(creatorComparer){
    exports.LT  = LT  = creatorComparer(true, false);
    exports.GT  = GT  = creatorComparer(false, false);
    exports.LTE = LTE = creatorComparer(true, true);
    exports.GTE = GTE = creatorComparer(false, true);
  }(function(reverse, left){
    return function(lval, rval){
      if (reverse) {
        var temp = lval;
        lval = rval;
        rval = temp;
      }

      var result = COMPARE(rval, lval, left);
      if (result && result.Abrupt) return result;

      if (isUndefined(result)) {
        return false;
      }
      return left ? !result : result;
    };
  });


  function $$OrdinaryHasInstance(C, O){
    $$OrdinaryHasInstance = require('./operations').$$OrdinaryHasInstance;
    return $$OrdinaryHasInstance(C, O);
  }


  function $$GetMethod(O, P){
    $$GetMethod = require('./operations').$$GetMethod;
    return $$GetMethod(O, P);
  }

  function INSTANCE_OF(O, C){
    var instOfHandler = $$GetMethod(C, hasInstanceSymbol);

    if (instOfHandler !== undefined) {
      return instOfHandler.Call(C, [O]);
    }

    if (!C || !C.Call) {
      return $$ThrowException('instanceof_function_expected', [TYPEOF(C)]);
    }

    return $$OrdinaryHasInstance(C, O);
  }
  exports.INSTANCE_OF = INSTANCE_OF;



  function EQUAL(lval, rval) {
    if (lval && lval.Abrupt) return lval;
    if (rval && rval.Abrupt) return rval;
    if (lval === rval) {
      return true;
    }
    if (lval === undefined) {
      return isUndetectable(rval);
    }
    if (rval === undefined) {
      return isUndetectable(lval);
    }
    return false;
  }
  exports.EQUAL = EQUAL;

  function NOT_EQUAL(lval, rval){
    return !EQUAL(lval, rval);
  }
  exports.NOT_EQUAL = NOT_EQUAL;


  function EQUIVALENT(lval, rval){
    if (lval && lval.Abrupt) return lval;
    if (rval && rval.Abrupt) return rval;

    var ltype = typeof lval,
        rtype = typeof rval;

    if (isNullish(lval)) {
      return isNullish(rval);
    } else if (isNullish(rval)) {
      return isNullish(lval);
    } else if (ltype === rtype) {
      return EQUAL(lval, rval);
    } else if (ltype === 'number' || rtype === 'string') {
      return EQUIVALENT(lval, $$ToNumber(rval));
    } else if (ltype === 'string' || rtype === 'number') {
      return EQUIVALENT($$ToNumber(lval), rval);
    } else if (rtype === 'boolean') {
      return EQUIVALENT(lval, $$ToNumber(rval));
    } else if (ltype === 'boolean') {
      return EQUIVALENT($$ToNumber(lval), rval);
    } else if (rtype === 'object' && ltype === 'number' || ltype === 'string') {
      return EQUIVALENT(lval, $$ToPrimitive(rval));
    } else if (ltype === 'object' && rtype === 'number' || rtype === 'object') {
      return EQUIVALENT($$ToPrimitive(lval), rval);
    }
    return false;
  }
  exports.EQUIVALENT = EQUIVALENT;

  function NOT_EQUIVALENT(lval, rval){
    var result = EQUIVALENT(lval, rval);
    return typeof result === 'boolean' ? !result : result

  }
  exports.NOT_EQUAL = NOT_EQUAL;



  function VOID(ref){
    var val = $$GetValue(ref);
    if (val && val.Abrupt) return val;
  }
  exports.VOID = VOID;

  function TYPEOF(val) {
    var type = typeof val;
    switch (type) {
      case 'undefined':
      case 'boolean':
      case 'number':
      case 'string': return type;
      case 'object':
        if (val === null) {
          return 'object';
        }

        if (val.Abrupt) return val;

        if (val.Reference) {
          if (isUndefined(val.base)) {
            return 'undefined';
          }
          return TYPEOF($$GetValue(val));
        }

        if ('Call' in val) {
          return 'function';
        }

        if (isUndefined(val)) {
          return 'undefined';
        }

        return 'object';
      }
  }
  exports.TYPEOF = TYPEOF;


  function POSITIVE(ref){
    return $$ToNumber($$GetValue(ref));
  }
  exports.POSITIVE = POSITIVE;


  var NEGATIVE, BIT_NOT, NOT;
  void function(createUnaryOp){
    exports.NEGATIVE = NEGATIVE = createUnaryOp($$ToNumber,  function(n){ return -n });
    exports.BIT_NOT  = BIT_NOT  = createUnaryOp($$ToInt32,   function(n){ return ~n });
    exports.NOT      = NOT      = createUnaryOp($$ToBoolean, function(n){ return isFalsey(n) });
  }(function(convert, finalize){
    return function(ref){
      if (isFalsey(ref) || typeof ref !== 'object') {
        return finalize(ref);
      }

      var val = convert($$GetValue(ref));
      if (val && val.Abrupt) return val;
      return finalize(val);
    }
  });


  function DELETE(ref){
    if (isFalsey(ref) || !ref.Reference) {
      return true;
    }

    var base = ref.base;
    if (isUndefined(base)) {
      if (ref.strict) {
        return $$ThrowException('strict_delete_property', [ref.name, base]);
      }
      return true;
    }

    if (base.Delete) {
      if ('thisValue' in ref) {
        return $$ThrowException('super_delete_property', ref.name);
      } else {
        return base.Delete(ref.name, ref.strict);
      }
    } else if (base.DeleteBinding) {
      return base.DeleteBinding(ref.name);
    }
    return true;
  }
  exports.DELETE = DELETE;


  function IN(lval, rval) {
    if (!rval || !rval.HasProperty) {
      return $$ThrowException('invalid_in_operator_use', [lval, TYPEOF(rval)]);
    }

    lval = $$ToPropertyKey(lval);
    if (lval && lval.Abrupt) return lval;

    return rval.HasProperty(lval);
  }
  exports.IN = IN;



  function UnaryOperation(operator, val) {
    switch (operator) {
      case 'delete': return DELETE(val);
      case 'void':   return VOID(val);
      case 'typeof': return TYPEOF(val);
      case '+':      return POSITIVE(val);
      case '-':      return NEGATIVE(val);
      case '~':      return BIT_NOT(val);
      case '!':      return NOT(val);
    }
  }
  exports.UnaryOperation = UnaryOperation;



  function BinaryOperation(operator, lval, rval) {
    switch (operator) {
      case 'instanceof': return INSTANCE_OF(lval, rval);
      case 'in':         return IN(lval, rval);
      case '==':         return EQUIVALENT(lval, rval);
      case '!=':         return NOT_EQUIVALENT(lval, rval);
      case '===':        return EQUAL(lval, rval);
      case '!==':        return NOT_EQUAL(lval, rval);
      case '<':          return LT(lval, rval);
      case '>':          return GT(lval, rval);
      case '<=':         return LTE(lval, rval);
      case '>=':         return GTE(lval, rval);
      case '*':          return MUL(lval, rval);
      case '/':          return DIV(lval, rval);
      case '%':          return MOD(lval, rval);
      case '+':          return ADD(lval, rval);
      case 'string+':    return STRING_ADD(lval, rval);
      case '-':          return SUB(lval, rval);
      case '<<':         return SHL(lval, rval);
      case '>>':         return SHR(lval, rval);
      case '>>>':        return SAR(lval, rval);
      case '|':          return BIT_OR(lval, rval);
      case '&':          return BIT_AND(lval, rval);
      case '^':          return BIT_XOR(lval, rval);
    }
  }
  exports.BinaryOperation = BinaryOperation;


  var realm, intrinsics;

  engine.on('realm-change', function(){
    realm = engine.activeRealm;
    intrinsics = engine.activeIntrinsics;
  });

  return exports;
})(typeof module !== 'undefined' ? module.exports : {});
