import {
  $$JSONParse,
  $$JSONQuote
} from '@@json';

import {
  $$StringReplace,
  $$StringSlice
} from '@@string';

import {
  call,
  enumerate,
  extend,
  hasBrand,
  internalFunction,
  setTag
} from '@@utilities';

import {
  $$Get,
  $$Exception,
  $$Set
} from '@@internals';

import {
  ToNumber,
  ToString
} from '@@operations';

import {
  Type
} from '@@types';
import {
  add,
  has,
  Set
} from '@set';

let ReplacerFunction, PropertyList, stack, indent, gap;

function J(value){
  if (has(stack, value)) {
    throw $$Exception('circular_structure', []);
  }

  const stepback = indent,
        partial  = [];

  let brackets;

  indent += gap;
  add(stack, value);

  if (hasBrand(value, 'BuiltinArray')) {
    brackets = ['[', ']'];

    for (var i=0, len = value.length; i < len; i++) {
      var prop = Str(i, value);
      partial[i] = prop === undefined ? 'null' : prop;
    }
  } else {
    const keys  = PropertyList || enumerate(value, false, true),
          colon = gap ? ': ' : ':';

    brackets = ['{', '}'];

    for (var i=0, len=keys.length; i < len; i++) {
      const prop = Str(keys[i], value);
      if (prop !== undefined) {
        partial.push($$JSONQuote(keys[i]) + colon + prop);
      }
    }
  }

  let final;
  if (!partial.length) {
    final = '';
  } else if (!gap) {
    final = partial.join(',');
  } else {
    final = '\n' + indent + partial.join(',\n' + indent) + '\n' + stepback;
  }

  stack.delete(value);
  indent = stepback;
  return brackets[0] + final + brackets[1];
}

internalFunction(J);

function Str(key, holder){
  let value = holder[key];

  if (Type(value) === 'Object') {
    const toJSON = value.toJSON;
    if (typeof toJSON === 'function') {
      value = call(toJSON, value, [key]);
    }
  }

  if (ReplacerFunction) {
    value = call(ReplacerFunction, holder, [key, value]);
  }

  if (Type(value) === 'Object') {
    const brand = $$Get(value, 'BuiltinBrand');
    if (brand === 'NumberWrapper') {
      value = $$Get(value, 'NumberValue');
    } else if (brand === 'StringWrapper') {
      value = $$Get(value, 'StringValue');
    } else if (brand === 'BooleanWrapper') {
      value = $$Get(value, 'BooleanValue');
    }
  }


  if (value === null) {
    return 'null';
  } else if (value === true) {
    return 'true';
  } else if (value === false) {
    return 'false';
  }

  const type = Type(value);
  if (type === 'String') {
    return $$JSONQuote(value);
  } else if (type === 'Number') {
    return isNaN(value) || value === Infinity || value === -Infinity ? 'null' : ToString(value);
  } else if (type === 'Object') {
    return J(value);
  }
}

internalFunction(Str);


export function stringify(value, replacer, space){
  ReplacerFunction = undefined;
  PropertyList = undefined;
  stack = new Set;
  indent = '';

  if (Type(replacer) === 'Object') {
    if (typeof replacer === 'function') {
      ReplacerFunction = replacer;
    } else if (hasBrand(replacer, 'BuiltinArray')) {
      let props = new Set;

      for (let value of replacer) {
        const type = Type(value);
        let item;

        if (type === 'String') {
          item = value;
        } else if (type === 'Number') {
          item = ToString(value);
        } else if (type === 'Object') {
          const brand = $$Get(value, 'BuiltinBrand');
          if (brand === 'String' || brand === 'Number') {
            item = ToString(value);
          }
        }

        if (item !== undefined) {
          add(props, item);
        }
      }

      PropertyList = [...props];
    }
  }

  if (Type(space) === 'Object') {
    space = ToString(space);
  }

  if (Type(space) === 'String') {
    gap = $$StringSlice(space, 0, 10);
  } else if (Type(space) === 'Number') {
    space |= 0;
    space = space > 10 ? 10 : space < 1 ? 0 : space
    gap = ' '.repeat(space);
  } else {
    gap = '';
  }

  return Str('', { '': value });
}

export function parse(source, reviver){
  return $$JSONParse(source, reviver);
}



export const JSON = {};
extend(JSON, { stringify, parse });
$$Set(JSON, 'BuiltinBrand', 'BuiltinJSON');
setTag(JSON, 'JSON');
