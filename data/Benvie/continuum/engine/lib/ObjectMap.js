var ObjectMap = (function(module){
  var objects          = require('./objects'),
      functions        = require('./functions'),
      iteration        = require('./iteration'),
      utility          = require('./utility'),
      DoublyLinkedList = require('./DoublyLinkedList');

  var define        = objects.define,
      inherit       = objects.inherit,
      assign        = objects.assign,
      hasOwn        = objects.hasOwn,
      Hash          = objects.Hash,
      uid           = utility.uid,
      bind          = functions.bind,
      iterate       = functions.iterate,
      Iterator      = iteration.Iterator,
      StopIteration = iteration.StopIteration;


  function ObjectMapIterator(map, type){
    this.item = map.list.sentinel;
    this.sentinel = map.list.sentinel;
    this.type = type || 'items';
  }

  inherit(ObjectMapIterator, Iterator, [
    function next(){
      var item = this.item = this.item.next;

      if (item === this.sentinel) {
        throw StopIteration;
      } else if (this.type === 'key') {
        return item.key;
      } else if (this.type === 'value') {
        return item.data;
      } else {
        return [item.key, item.data];
      }
    }
  ]);


  function tag(map, object){
    if (hasOwn(object, map.tag)) {
      return object[map.tag];
    }
    var id = uid();
    try {
      define(object, map.tag, id);
    } catch (e) {
      var index = map.frozenKeys.indexOf(object);
      if (~index) {
        return map.frozenIds[index];
      }
      map.frozenIds[index] = id;
    }
    return id;
  }

  function ObjectMap(iterable){
    define(this, {
      list: new DoublyLinkedList,
      tag: uid()
    });

    this.clear();
    if (iterable != null) {
      iterate(iterable, function(item){
        if (item && typeof item === 'object' && item.length  === 2) {
          this.set(item[0], item[1]);
        }
      }, this);
    }
  }

  define(ObjectMap.prototype, [
    function get(key){
      var item = this.objects[tag(this, key)];
      if (item) {
        return item.data;
      }
    },
    function set(key, value){
      var id = tag(this, key),
          item = this.objects[id];

      if (item) {
        item.data = value;
      } else {
        this.list.push(value);
        item = this.list.sentinel.prev;
        item.key = key;
        this.objects[id] = item;
      }
      this.size = this.list.size;
      return value;
    },
    function has(key){
      return !!this.objects[tag(this, key)];
    },
    function remove(key){
      var id = tag(this, key),
          item = this.objects[id];

      if (item) {
        item.unlink();
        this.objects[id] = null;
        this.size = this.list.size;
        return true;
      }
      return false;
    },
    function clear(){
      define(this, 'objects', new Hash);
      define(this, 'frozenKeys', []);
      define(this, 'frozenIds', []);
      this.list.clear();
      this.size = 0;
    },
    function forEach(callback, context){
      var item = this.list.sentinel,
          sentinel = item;

      context = context || this;
      while (item.next !== sentinel) {
        item = item.next;
        callback.call(context, item.data, item.key, this);
      }
    },
    function keys(){
      var out = [];
      iterate(this.__iterator__('key'), bind(_push, out));
      return out;
    },
    function values(){
      var out = [];
      iterate(this.__iterator__('value'), bind(_push, out));
      return out;
    },
    function items(){
      var out = [];
      iterate(this, bind(_push, out));
      return out;
    },
    function __iterator__(type){
      return new ObjectMapIterator(this, type);
    }
  ]);


  return module.exports = ObjectMap;
})(typeof module !== 'undefined' ? module : {});
