import {
  $$CreateObject,
  $$Exception
} from '@@internals';

import {
  builtinClass
} from '@@utilities';

import {
  ToBoolean
} from '@@operations';


export class Symbol {
  constructor(name, isPublic){
    if (name == null) {
      throw $$Exception('unnamed_symbol', []);
    }
    return $$CreateObject('Symbol', name, ToBoolean(isPublic));
  }
}


builtinClass(Symbol);
