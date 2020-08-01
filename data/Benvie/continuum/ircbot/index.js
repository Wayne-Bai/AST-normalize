var file = require('fs'),
    path = require('path'),
    util = require('util'),
    fs = require('fs'),
    Bot = require('oftn-bot/lib/irc'),
    continuum = require('continuum');

var createRealm = continuum.createRealm,
    createFunction = continuum.createFunction;


function render(mirror, prop){
  return renderer.render(mirror.get(prop));
}

function renderObject(mirror){
  var out = '{ ' + renderProperties(mirror) + ' }';
  return out === '{  }' ? '{}' : out;
}


function renderProperties(mirror){
  var out = '';
  if (mirror.subject.Brand) {
    out += mirror.label();
  }
  return mirror.list(false, false).map(function(prop){
    return prop + ': ' + render(mirror, prop);
  }).join(', ');
}


function renderWithNativeBrand(mirror){
  var props = renderProperties(mirror);
  if (props) props += ' ';
  return '{[' + mirror.label() +'] ' + props + '}';
}


function renderIndexed(mirror){
  return '['+mirror.list(false, false).map(function(prop){
    if (prop > -1 && !(prop < 0)) {
      return mirror.hasOwn(prop) ? render(mirror, prop) : '';
    } else {
      return prop+': '+ render(mirror, prop);
    }
  }).join(', ')+']';
}

function prepend(func, text){
  return function(mirror){
    return text + func(mirror);
  };
}


function primitiveWrapper(name){
  return function(mirror){
    return name+'('+mirror.label()+')';
  };
}


function standard(mirror){
  return mirror.label()
}


function renderFunction(mirror){
  var out = '[';
  out += mirror.isClass() ? 'Class' : 'Function';
  var name = mirror.getName();
  if (name) {
    out += ' '+name;
  }
  var props = mirror.list(false, false);
  if (props.length) {
    out+=' '+renderProperties(mirror);
  }
  return out + ']';
}

var renderer = continuum.createRenderer({
  Arguments: prepend(renderIndexed, 'Arguments '),
  Array    : renderIndexed,
  Boolean  : primitiveWrapper('Boolean'),
  Function : renderFunction,
  Global   : renderObject,
  JSON     : renderObject,
  Map      : renderObject,
  Math     : renderObject,
  Module   : renderObject,
  Object   : renderObject,
  Number   : primitiveWrapper('Number'),
  RegExp   : function(mirror){ return mirror.subject.PrimitiveValue+'' },
  Set      : renderObject,
  String   : primitiveWrapper('String'),
  WeakMap  : renderObject
});

var users = {};

var extras = continuum.createScript('./extras.js', { natives: true });


function reply(irc, message){
  irc.channel.send_reply(irc.sender, message);
}


function createContext(){
  var context,
      render = true,
      lastIRC;

  function disableUntilTick(){
    render = false;
    setTimeout(function(){
      render = true;
    }, 1);
  }

  function reset(){
    context = continuum.createRealm();
    context.evaluate(extras);

    context.on('reset', function(){
      lastIRC && reply(lastIRC, 'resetting');
      reset();
      disableUntilTick();
    });

    context.on('pause', function(){
      lastIRC && reply(lastIRC, 'paused');
      disableUntilTick();
    });

    context.on('resume', function(){
      lastIRC && reply(lastIRC, 'resumed');
      disableUntilTick();
    });

    context.on('write', function(args){
      lastIRC && reply(lastIRC, 'console: '+args[0]);
    });
  }


  return function run(irc, code){
    lastIRC = irc;
    context || reset();
    context.evaluateAsync(code, function(result){
      if (render) {
        reply(irc, renderer.render(result));
      }
    });
  };
}


function execute(context, text, command, code){
  var user = context.sender;
  if (!(user.name in users)) {
    users[user.name] = createContext();
  }
  users[user.name](context, code);
}


function ContinuumBot(profile){
  Bot.call(this, profile);
  this.set_log_level(this.LOG_ALL);
  Bot.prototype.init.call(this);
  this.register_listener(/^((?:es6|vm)>)\s*(.*)+/, execute);
}

continuum.utility.inherit(ContinuumBot, Bot);


module.exports = function(){
  return new ContinuumBot([{
    host: 'irc.freenode.net',
    port: 6667,
    nick: 'continuum',
    user: 'continuum',
    real: 'continuum',
    channels: ['#continuum', '##javascript', '#node.js', '#appjs', '#inimino']
  }]);
}
