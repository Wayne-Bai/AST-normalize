var DoublyLinkedList = (function(module){
  var objects   = require('../lib/objects'),
      iteration = require('../lib/iteration');

  var define        = objects.define,
      inherit       = objects.inherit,
      Iterator      = iteration.Iterator,
      StopIteration = iteration.StopIteration;

  function DoublyLinkedListIterator(list){
    this.item = list.sentinel;
    this.sentinel = list.sentinel;
  }

  inherit(DoublyLinkedListIterator, Iterator, [
    function next(){
      this.item = this.item.next;
      if (this.item === this.sentinel) {
        throw StopIteration;
      }
      return this.item.data;
    }
  ]);


  function Item(data, prev){
    this.data = data;
    this.after(prev);
  }

  define(Item.prototype, [
    function after(item){
      this.relink(item);
      return this;
    },
    function before(item){
      this.prev.relink(item);
      return this;
    },
    function relink(prev){
      if (this.next) {
        this.next.prev = this.prev;
        this.prev.next = this.next;
      }
      this.prev = prev;
      this.next = prev.next;
      prev.next.prev = this;
      prev.next = this;
      return this;
    },
    function unlink(){
      if (this.next) {
        this.next.prev = this.prev;
      }
      if (this.prev) {
        this.prev.next = this.next;
      }
      this.prev = this.next = null;
      return this;
    },
    function clear(){
      var data = this.data;
      this.next = this.prev = this.data = null;
      return data;
    }
  ]);

  function Sentinel(list){
    this.next = this;
    this.prev = this;
  }

  inherit(Sentinel, Item, [
    function unlink(){
      return this;
    }
  ]);

  function find(list, value){
    if (list.lastFind && list.lastFind.data === value) {
      return list.lastFind;
    }

    var item = list.sentinel,
        i = 0;

    while ((item = item.next) !== list.sentinel) {
      if (item.data === value) {
        return list.lastFind = item;
      }
    }
  }

  function DoublyLinkedList(){
    this.size = 0;
    define(this, {
      sentinel: new Sentinel,
      lastFind: null
    });
  }

  define(DoublyLinkedList.prototype, [
    function first() {
      return this.sentinel.next.data;
    },
    function last() {
      return this.sentinel.prev.data;
    },
    function unshift(value){
      var item = new Item(value, this.sentinel);
      return this.size++;
    },
    function push(value){
      var item = new Item(value, this.sentinel.prev);
      return this.size++;
    },
    function insert(value, after){
      var item = find(this, after);
      if (item) {
        item = new Item(value, item);
        return this.size++;
      }
      return false;
    },
    function replace(value, replacement){
      var item = find(this, value);
      if (item) {
        new Item(replacement, item);
        item.unlink();
        return true;
      }
      return false;
    },
    function insertBefore(value, before){
      var item = find(this, before);
      if (item) {
        item = new Item(value, item.prev);
        return this.size++;
      }
      return false;
    },
    function pop(){
      if (this.size) {
        this.size--;
        return this.sentinel.prev.unlink().data;
      }
    },
    function shift() {
      if (this.size) {
        this.size--;
        return this.sentinel.next.unlink().data;
      }
    },
    function remove(value){
      var item = find(this, value);
      if (item) {
        item.unlink();
        return true;
      }
      return false;
    },
    function has(value) {
      return !!find(this, value);
    },
    function items(){
      var item = this.sentinel,
          array = [];

      while ((item = item.next) !== this.sentinel) {
        array.push(item.data);
      }

      return array;
    },
    function clear(){
      var next,
          item = this.sentinel.next;

      while (item !== this.sentinel) {
        next = item.next;
        item.clear();
        item = next;
      }

      this.lastFind = null;
      this.size = 0;
      return this;
    },
    function clone(){
      var item = this.sentinel,
          list = new DoublyLinkedList;

      while ((item = item.next) !== this.sentinel) {
        list.push(item.data);
      }
      return list;
    },
    function __iterator__(){
      return new DoublyLinkedListIterator(this);
    }
  ]);

  return module.exports = DoublyLinkedList;
})(typeof module !== 'undefined' ? module : {});
