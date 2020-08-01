(function () {
    "use strict";
    /**
     * @class LinkedDeque
     * @classdesc A Deque using linked nodes instead of standard javascript Array. In addition the Deque can be
     * optionally capacity constrained, if unspecified, the value is set to Number.MAX_VALUE.
     * Standard javascript Array's shift, unshift, push and pop operations are implemented for linked nodes.
     *
     * [Reference: LinkedBlockingDeque in Oracle JDK](http://docs.oracle.com/javase/7/docs/api/java/util/concurrent/LinkedBlockingDeque.html)
     * @param capacity {Number=} set to Number.MAX_VALUE if not provided
     * @desc
     * #### Example -
     * ```js
     * var LinkedDeque = require("dsjslib").LinkedDeque
     * var ldq=new LinkedDeque(100)
     * ```
     */
    function LinkedDeque(capacity) {
        this._capacity = typeof capacity === 'number' ? capacity : Number.MAX_VALUE;
        this._tail = this._head = null;
        this._size = 0;
    }

    /**
     * Nodes of a doubly linked list
     * @param prev
     * @param obj
     * @param next
     * @private
     * @constructor
     */
    function QEntry(prev, obj, next) {
        if (typeof obj === 'undefined' || obj === null) {
            throw new Error('Null or Undefined values are not supported');
        }
        this.item = obj;
        this.prev = prev;
        this.next = next;
    }

    /**
     * Add item to the head of the Deque. Equivalent to ldq.offerFirst(item).
     * Returns true if obj was successfully added, false if it failed (for example, if the Deque is at
     * full capacity.
     * @memberOf LinkedDeque.prototype
     * @instance
     * @type {Function}
     * @returns {Boolean}  true if obj was successfully added, false otherwise
     */
    LinkedDeque.prototype.unshift = function (item) {
        if (this._size >= this._capacity)return false;
        var head = this._head,
            entry = new QEntry(null, item, head);
        if (!this._tail) {
            this._tail = entry;
        } else {
            head.prev = entry;
        }
        this._head = entry;
        this._size++;
        return true;
    };
    /**
     * Equivalent to {@link LinkedDeque#unshift}
     * @memberOf LinkedDeque.prototype
     * @instance
     * @returns {Boolean}  true if obj was successfully added, false otherwise
     */
    LinkedDeque.prototype.offerFirst = LinkedDeque.prototype.unshift;

    /**
     * Add item to the tail of the Deque. Equivalent to ldq.offerLast(item).
     * Returns true if obj was successfully added, false if it failed (for example, if the Deque is at
     * full capacity.
     * @memberOf LinkedDeque.prototype
     * @instance
     * @type {Function}
     * @returns {Boolean}  true if obj was successfully added, false otherwise
     * */
    LinkedDeque.prototype.push = function (item) {
        if (this._size >= this._capacity)return false;
        var tail = this._tail,
            entry = new QEntry(tail, item, null);
        if (!this._head) {
            this._head = entry;
        } else {
            tail.next = entry;
        }
        this._tail = entry;
        this._size++;
        return true;
    };

    /**
     * Equivalent to {@link LinkedDeque#push}
     * @memberOf LinkedDeque.prototype
     * @instance
     * @returns {Boolean}  true if obj was successfully added, false otherwise
     */
    LinkedDeque.prototype.offerLast = LinkedDeque.prototype.push;

    /**
     * Returns and removes the element at the head of the Deque.
     * Returns null if there is no such element
     * Equivalent to {@link LinkedDeque#pollFirst}
     * @memberOf LinkedDeque.prototype
     * @instance
     * @returns {*} Returns and removes the element at the head of the Deque, null if no such element
     */
    LinkedDeque.prototype.shift = function () {
        if (this._size <= 0)return null;
        var ret = this._head,
            next = ret.next;
        if (!next) {
            this._head = this._tail = null;
        } else {
            next.prev = null;
            ret.next = null;
        }
        this._head = next;
        this._size--;
        return ret.item;
    };

    /**
     * Equivalent to {@link LinkedDeque#shift}
     * @memberOf LinkedDeque.prototype
     * @instance
     * @returns {*} Returns and removes the element at the head of the Deque, null if no such element
     */
    LinkedDeque.prototype.pollFirst = LinkedDeque.prototype.shift;

    /**
     * Returns and removes the element at the tail of the Deque.
     * Returns null if there is no such element
     * Equivalent to {@link LinkedDeque#pop}
     * @memberOf LinkedDeque.prototype
     * @instance
     * @returns {*} Returns and removes the element at the tail of the Deque, null if no such element
     */
    LinkedDeque.prototype.pollLast = function () {
        if (this._size <= 0)return null;
        var ret = this._tail,
            prev = ret.prev;
        if (!prev) {
            this._head = this._tail = null;
        } else {
            prev.next = null;
            ret.prev = null;
        }
        this._tail = prev;
        this._size--;
        return ret.item;
    };

    /**
     * Equivalent to {@link LinkedDeque#pollLast}
     * @memberOf LinkedDeque.prototype
     * @instance
     * @returns {*} Returns and removes the element at the tail of the Deque, null if no such element
     */
    LinkedDeque.prototype.pop =
        LinkedDeque.prototype.pollLast;

    /**
     * Returns an array containing all of the elements in this Deque,
     * in proper sequence (from first to last element).
     * The returned array has no links/pointers to the Deque.
     * No items are removed from the Deque
     * @memberOf LinkedDeque.prototype
     * @instance
     * @returns {Array}
     */
    LinkedDeque.prototype.toArray = function () {
        var head = this._head,
            arr = [];
        while (head) {
            arr.push(head.item);
            head = head.next;
        }
        return arr;
    };
    /**
     * Removes all elements from the deque
     * @memberOf LinkedDeque.prototype
     * @instance
     *
     */
    LinkedDeque.prototype.clear = function () {
        var first = this._head,
            next = first;
        while (next) {
            first.prev = null;
            next = first.next;
            first.next = null;
        }
        delete this._head;
        delete this._tail;
        this._head = this._tail = null;
        this._size = 0;
    };

    /**
     * @memberOf LinkedDeque.prototype
     * @instance
     * @returns {Number} size of the array
     */
    LinkedDeque.prototype.size = function () {
        return this._size;
    };


    module.exports = LinkedDeque;

}());