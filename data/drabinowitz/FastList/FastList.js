(function (context) {

  'use strict';

  /****************************************/
  //
  //     FastList function
  //
  //relies on Node Constructor defined below
  //relies on getUUID defined below
  /****************************************/

  var FastList = function () {

    this.head = null;
    this.tail = null;
    this.length = 0;
    this.listIndex = {};

  };

  FastList.prototype._mustFind = function(keyAt) {

    var node = this.listIndex[keyAt];
    if (node) return node;
    throw new Error(keyAt + ' does not reference an existing node.  Create a node with this key first using an add method');

  };

  FastList.prototype._mustNotFind = function(keyAt) {

    if (this.listIndex[keyAt]) throw new Error(keyAt + ' already refers to an existing node.  Use \'set\' to update an existing node or make sure to pass in a unique key.');

  };

  FastList.prototype._add = function(val, key) {

    key = key || getUUID();

    try {
      this._mustNotFind(key);
      var newNode = new Node({
        value: val,
        key: key
      });
      this.listIndex[key] = newNode;
      this.length++;
      return newNode;
    }

    catch (e) {
      throw e;
    }

  };

  FastList.prototype._addFirst = function(val, key) {

    if (!this.length) this.head = this.tail = this._add(val, key);
    else throw new Error('List already has elements.  Use add before/after instead');
    return this.head.__key__;
  };

  FastList.prototype._placeIn = function (newNode, keyAt, placeAbove) {

    try {
      var nodeAt = this._mustFind(keyAt);

      var placeAt = placeAbove ? 'parent' : 'next';
      var relation = placeAbove ? 'next' : 'parent';

      if (nodeAt[placeAt]) {
        newNode[placeAt] = nodeAt[placeAt];
        nodeAt[placeAt][relation] = newNode;
      }

      newNode[relation] = nodeAt;
      nodeAt[placeAt] = newNode;

      if (placeAbove && nodeAt === this.head) this.head = newNode;
      else if (!placeAbove && nodeAt === this.tail) this.tail = newNode;

    }

    catch (e) {
      throw e;
    }

  };

  FastList.prototype.addBefore = function (keyAt, val, key) {

    try {

      var newNode = this._add(val, key);
      this._placeIn(newNode, keyAt, true);
      return newNode.__key__;

    }

    catch (e) {
      throw e;
    }

  };

  FastList.prototype.addAfter = function (keyAt, val, key) {

    try {

      var newNode = this._add(val, key);
      this._placeIn(newNode, keyAt, false);
      return newNode.__key__;

    }

    catch (e) {
      throw e;
    }

  };

  FastList.prototype.addToTail = function (val, key) {

    if (this.head) return this.addAfter(this.tail.__key__, val, key);
    return this._addFirst(val, key);

  };

  FastList.prototype.addToHead = function (val, key) {

    if (this.head) return this.addBefore(this.head.__key__, val, key);
    return this._addFirst(val, key);

  };

  FastList.prototype.removeAt = function (keyAt) {

    var nodeAt = this.listIndex[keyAt];

    if (nodeAt){

      if (nodeAt.parent) nodeAt.parent.next = nodeAt.next;
      else if (this.head === nodeAt) this.head = nodeAt.next;

      if (nodeAt.next) nodeAt.next.parent = nodeAt.parent;
      else if (this.tail === nodeAt) this.tail = nodeAt.parent;

      delete this.listIndex[keyAt];

      this.length--;

      return nodeAt.value;

    }

  };

  FastList.prototype.removeFromHead = function () {

    if (this.head) return this.removeAt(this.head.__key__);
    return null;

  };

  FastList.prototype.removeFromTail = function () {

    if (this.tail) return this.removeAt(this.tail.__key__);
    return null;

  };

  FastList.prototype.get = function (keyAt) {

    var node = this.listIndex[keyAt];
    if (node) return node.value;

  };

  FastList.prototype.first = function () {
    if (this.length) return this.get(this.head.__key__);
  };

  FastList.prototype.last = function () {
    if (this.length) return this.get(this.tail.__key__);
  };

  FastList.prototype.set = function (keyAt, val) {

    try {
      var node = this._mustFind(keyAt);
      node.value = val;
    }

    catch (e) {
      throw e;
    }

  };

  //Convenience methods

  FastList.prototype.forEach = FastList.prototype.each = function (cb) {

    for (var node = this.head; node; node = node.next) {
      cb (node.value, node.__key__, this);
    }

  };

  function defaultSort (a, b) {
    if (a === null) a = 'null';
    if (b === null) b = 'null';
    return a.toString() < b.toString() ? -1 : 1;
  }

  FastList.prototype.sort = function (sortFn) {

    sortFn = sortFn || defaultSort;

    for (var node = this.head; node; node = node.next) {
      var oldParent = node.parent;

      while (oldParent && sortFn(node.value, oldParent.value) < 0) {

        oldParent.next = node.next;
        node.parent = oldParent.parent;

        if (oldParent === this.head) this.head = node;
        else oldParent.parent.next = node;
        if (node === this.tail) this.tail = oldParent;
        else node.next.parent = oldParent;

        oldParent.parent = node;
        node.next = oldParent;

        oldParent = node.parent;

      }
    }
  };

  /****************************************/
  //
  //     List Node Constructor
  //
  /****************************************/

  function Node (node) {

    this.value = node.value;
    this.next = node.next || null;
    this.parent = node.parent || null;
    this.__key__ = node.key;

  }

  context.FastList = FastList;

  /****************************************/
  //
  //     getUUID
  //
  /****************************************/

  function getUUID(){

    var d = new Date().getTime();

    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });

    return uuid;

  }

})(window);
