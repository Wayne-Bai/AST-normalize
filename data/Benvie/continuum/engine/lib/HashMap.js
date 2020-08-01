var HashMap = (function(module){
  var objects   = require('./objects'),
      functions = require('./functions'),
      iteration = require('./iteration'),
      DoublyLinkedList = require('./DoublyLinkedList');

  var define        = objects.define,
      inherit       = objects.inherit,
      assign        = objects.assign,
      Hash          = objects.Hash,
      bind          = functions.bind,
      iterate       = functions.iterate,
      Iterator      = iteration.Iterator,
      StopIteration = iteration.StopIteration;


  var types = assign(new Hash, {
    'string': 'strings',
    'number': 'numbers',
    'undefined': 'others',
    'boolean': 'others',
    'object': 'others'
  });


  function HashMapIterator(map, type){
    this.item = map.list.sentinel;
    this.sentinel = map.list.sentinel;
    this.type = type || 'items';
  }

  inherit(HashMapIterator, Iterator, [
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

  function HashMap(iterable){
    define(this, 'list', new DoublyLinkedList);
    this.clear();
    if (iterable != null) {
      iterate(iterable, function(item){
        if (item && typeof item === 'object' && item.length  === 2) {
          this.set(item[0], item[1]);
        }
      }, this);
    }
  }

  define(HashMap.prototype, [
    function get(key){
      var item = this[types[typeof key]][key];
      if (item) {
        return item.data;
      }
    },
    function set(key, value){
      var data = this[types[typeof key]],
          item = data[key];

      if (item) {
        item.data = value;
      } else {
        this.list.push(value);
        item = this.list.sentinel.prev;
        item.key = key;
        data[key] = item;
      }
      this.size = this.list.size;
      return value;
    },
    function has(key){
      return key in this[types[typeof key]];
    },
    function remove(key){
      var data = this[types[typeof key]];

      if (key in data) {
        data[key].unlink();
        delete data[key];
        this.size = this.list.size;
        return true;
      }
      return false;
    },
    function clear(){
      define(this, {
        strings: new Hash,
        numbers: new Hash,
        others: new Hash
      });
      this.list.clear();
      this.size = 0;
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
      return new HashMapIterator(this, type);
    }
  ]);


  return module.exports = HashMap;
})(typeof module !== 'undefined' ? module : {});
