var Emitter = (function(module){
  var objects   = require('./objects'),
      iteration = require('./iteration'),
      utility   = require('./utility'),
      ObjectMap = require('./ObjectMap');

  var define = objects.define,
      Hash   = objects.Hash,
      each   = iteration.each;



  function Emitter(){
    '_events' in this || define(this, '_events', new Hash);
  }

  define(Emitter.prototype, [
    function on(type, handler, context){
      var events = this._events;
      context = context || this;
      each(type.split(/\s+/), function(event){
        if (!(event in events)) {
          events[event] = new ObjectMap;
        }
        events[event].set(handler, context);
      });
    },
    function off(type, handler){
      var events = this._events;
      each(type.split(/\s+/), function(event){
        if (event in events) {
          events[event].remove(handler);
        }
      });
    },
    function once(type, handler, context){
      context = context || this;
      this.on(type, function one(){
        this.off(type, one);
        handler.apply(context, arguments);
      });
    },
    function emit(type, a, b, c, d){
      var handlers = this._events['*'];
      if (handlers) {
        handlers.forEach(function(context, handler){
          handler.call(context, type, a, b, c, d);
        });
      }

      handlers = this._events[type];
      if (handlers) {
        handlers.forEach(function(context, handler){
          handler.call(context, a, b, c, d);
        });
      }
    }
  ]);

  return module.exports = Emitter;
})(typeof module !== 'undefined' ? module : {});
