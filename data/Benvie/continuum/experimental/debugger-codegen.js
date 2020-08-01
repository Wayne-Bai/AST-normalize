var json = require('./debugger.json');


var types = {
  String: function(o){
    return typeof o === 'string';
  },
  Boolean: function(o){
    return typeof o === 'boolean';
  },
  Number: function(o){
    return typeof o === 'string';
  },
  Undefined: function(o){
    return typeof o === 'undefined';
  },
  Null: function(o){
    return o === null;
  },
  Object: function(o){
    return typeof o === 'object' ? o !== null : typeof o === 'function';
  },
  Primitive: function(o){
    return typeof o === 'object' ? o === null : typeof o !== 'function';
  },
  Function: function(o){
    return typeof o === 'function';
  }
};


var continuum = require('continuum'),
    astify    = require('astify'),
    each      = continuum.utility.each,
    map       = continuum.utility.map,
    ownKeys   = continuum.utility.keys,
    Hash      = continuum.utility.Hash,
    ASTNode   = astify.ASTNode,
    ASTArray  = astify.ASTArray,
    _         = astify.createNode;



var ast = _('#program', []);

/*
each(json, function(item, name){
  if (item.type === 'class') {
    var body = _('#classbody', map(item.methods, function(method, name){
      var rest,
          params = [],
          body = [];

      each(method.params, function(param, name){
        var types = param.optional ? [_(name), _('Undefined')] : [_(name)];

        if (param.rest) {
          rest = _(name);
        } else {
          params.push(_(name));
        }

        each(param.type, function(type){
          types.push(_(type.replace(/\./g, '')));
        });


        if (types.length > 1) {
          body.push(_(param.rest ? 'assertSignatures' : 'assertSignature').call(types));
        }
      });

      return _('#method', name, _('#functionexpr', null, params, body, rest));
    }));

    each(item.accessors, function(accessor, name){
      if (accessor.writable) {
        body.append(_('#method', name, _('#function', null, ['value']), 'set'));
      }
      body.append(_('#method', name, _('#function', null, []), 'get'));
    });

    if (name === item.name) {
      ast.append(_('#export', _('#class', item.name, body)));
    } else {
      ast.append(_(name).set(_('#classexpr', item.name, body)));
    }
  }
});
*/

each(json, function(item, name){
  if (item.type === 'class') {
    var proto = _('#object', map(item.methods, function(method, name){
      var rest,
          params = [],
          body = [];

      each(method.params, function(param, name){
        var types = param.optional ? [_(name), _('#literal', 'Undefined')] : [_(name)];

        if (param.rest) {
          rest = _(name);
        } else {
          params.push(_('#literal', name));
        }

        each(param.type, function(type){
          types.push(_('#literal', type.replace(/\./g, '')));
        });


        if (types.length > 1) {
          body.push(_(param.rest ? 'assertSignatures' : 'assertSignature').call(types));
        }
      });

      return _('#property', 'init', name, _('#functionexpr', name, params, body, rest));
    }));

    each(item.accessors, function(accessor, name){
      if (accessor.writable) {
        proto.append(_('#property', 'set', name, _('#functionexpr', name, ['value'])));
      }
      proto.append(_('#property', 'get', name, _('#functionexpr', name, [])));
    });

    if (name === item.name) {
      ast.append(_('#function', item.name, []));
    } else {
      ast.append(_('#var').declare(name.replace('.', ''), _(name).set(_('#functionexpr', item.name, []))));
    }
    ast.append(_('define').call([_(name).get('prototype'), proto]));
  }
});

console.log(ast.toSource());
