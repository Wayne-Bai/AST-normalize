/**
 * dotcloud.js, a Javascript gateway library to powerful cloud services.
 * Copyright 2012 DotCloud Inc (Joffrey Fuhrer <joffrey@dotcloud.com>)
 *
 * This project is free software released under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 */


define(function(require) {
    /** @exports sync as dotcloud.sync */
    // We use izs' `inherits` function to factor similar behavior between our
    // array proxies. This is the non-ES5 version.
    function inherits(c, p, proto) {
        function F() { this.constructor = c; }
        F.prototype = p.prototype;
        var e = {};
        for (var i in c.prototype) {
            if (c.prototype.hasOwnProperty(i))
                e[i] = c.prototype[i];
        }
        if (proto) {
            for (i in proto) {
                if (proto.hasOwnProperty(i))
                    e[i] = proto[i];
            }
        }

        c.prototype = new F();

        for (i in e) {
            if (e.hasOwnProperty(i))
                c.prototype[i] = e[i];
        }
        c.super = p;
    }

    var merge = function(a, b) {
        for (var k in b) {
            if (!a[k]) {
                a[k] = b[k];
            } else if (typeof a[k] == 'object' && !(a[k] instanceof Array)) {
                a[k] = merge(a[k], b[k]);
            } else {
                a[k] = b[k];
            }
        }
        return a;
    };

    // This module is initialized by passing the config object which is a dependency
    // of the *dotcloud* module.
    return function(config, io) {
        /**
            Sub-module providing the synchronized storage API.

            @description
            You can retrieve a collection using the sync.synchronize method.
            All collections retrieved this way are automatically synchronized across all the
            clients who access it. Changes are persisted (in mongoDB) and propagated.

            @name sync
            @namespace
        */
        var sync = {

            /**
                Synchronize a collection.

                @description
                The resulting object ({@link dotcloud.sync.Array}) tries to behave like an Array so
                it can be handled in a similar manner, thus reducing developer burden and increasing
                flexibility.

                @public
                @name sync#synchronize
                @function
                @param {String} collection Identifies a collection (well, duh) of objects.
                @param {String} [mode=mongo] Is the persistence layer used. Currently only supports mongo
                @param {Boolean} [private=false] If the collection is private (i.e. can only be accessed by the currently authenticated user)

                @see dotcloud.sync.Array, <a href="AbstractArray.html#observe">observe</a>
                @example
// Start synchronizing the "people" collection
var people = dotcloud.sync.synchronize('people');

            */
            synchronize : function(collection, mode, pvt) {
                if (pvt === undefined && (typeof mode == 'boolean')) {
                    pvt = mode, mode = undefined;
                }

                if (mode == 'mongo' || !mode) {
                    return new this.Array(collection, pvt);
                } else {
                    throw 'Unsupported persistence mode: ' + mode;
                }

            }
        };

        /**
            @name AbstractArray
            @class Abstract class inherited by other array-behaving classes, providing basic
              iteration/lookup/observer functionality.
        */
        var AbstractArray = function(collection) {
            // Placeholder - this method is defined in child classes.
            this.__data;

            /** @lends AbstractArray.prototype */
            var that = this;

            // Update the length property.
            /** @inner */
            var updateLength = function() {
                that.length = that.__data().length;
            };

            var changeCallbacks = [updateLength];

            /**
                This method is called everytime the underlying data is changed.

                @description
                Call all the observers declared using the `observe` method.

                @memberOf AbstractArray#
                @private
                @name __notifyChanged

            */
            this.__notifyChanged = function() {
                for (var i = changeCallbacks.length - 1; i >= 0; i--) {
                    changeCallbacks[i].apply(null, arguments);
                }
            };

            /**
                Add an observer function to the synchronized array.

                @description
                Whenever an insert, removal, or update occurs, the function is called
                with parameters indicating the type and target of the change.

                @public
                @function
                @memberOf AbstractArray#
                @name observe
                @param {Function} fn Callback function called when the array is modified.
                The callback is provided two arguments. The first argument describes what type of operation has
                taken place. Its value can be "inserted", "updated", "removed" or "removed-all".
                The second argument describes the object(s) affected by the change. In the case of a deletion,
                only the removed object id will appear.
            */
            this.observe = function(fn) {
                changeCallbacks.unshift(fn);
                return this;
            };

             /**
                Find an item in the client array and return its position.

                @public
                @function
                @memberOf AbstractArray#
                @name indexOf
                @param {Object} obj Object to look up
                @see <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf">MDN > indexOf</a>
            */
            this.indexOf = function(obj) {
                return this.__data().indexOf(obj);
            };

            /**
                Produce a string by joining each value contained in the array.

                @public
                @function
                @memberOf AbstractArray#
                @name join
                @param {String} str String separating items in the resulting string.
                @see <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/join">MDN > join</a>            */
            this.join = function(str) {
                return this.__data().join(str);
            };

            /**
                Find an item in the client array and return its last position.

                @public
                @function
                @name lastIndeOf
                @memberOf AbstractArray#
                @param {Object} obj Object to look up
                @see <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/lastIndexOf">MDN > lastIndexOf</a>            */
            this.lastIndexOf = function(obj) {
                return this.__data().lastIndexOf(obj);
            };

            /**
                Reverse all elements in the client array.

                @description
                By design, the reverse operation is not reflected on the server-side

                @public
                @function
                @name reverse
                @memberOf AbstractArray#
                @see <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/lastIndexOf">MDN > lastIndexOf</a>            */
            this.reverse = function() {
                this.__data().reverse();
                return this;
            };

            /**
                Return an array containing all elements found between the `start` and
                `end` position in the client array.

                @description
                The returned Array is a plain, non-synchronized Javascript array.

                @public
                @function
                @name slice
                @memberOf AbstractArray#
                @param {Object} start Starting positiong
                @param {Object} [end] Ending position
                @see <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/slice">MDN > slice</a>            */
            this.slice = function(start, end) {
                return this.__data().slice(start, end);
            };

            /**
                Sort elements in the client array using the provided ordering function.

                @description
                By design, the sort operation is not reflected on the server-side.

                @public
                @function
                @name sort
                @memberOf AbstractArray#
                @param {Function} fn Ordering function that takes two elements and compares them.
                @see <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/sort">MDN > sort</a>            */
            this.sort = function(fn) {
                this.__data().sort(fn);
                return this;
            };

            /**
                Return a string representation of the array.

                @description

                @public
                @function
                @name toString
                @memberOf AbstractArray#
                @see <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/toString">MDN > toString</a>            */
            this.toString = function() {
                return 'SynchronizedArray(' + this.__config().collection + '):[' + this.__data().join(', ') + ']';
            };

            /**
                Return the underlying value of the client array.

                @description

                @public
                @function
                @name valueOf
                @memberOf AbstractArray#
                @see <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/valueOf">MDN > valueOf</a>            */
            this.valueOf = function() {
                return this.__data().valueOf();
            };

            /**
                Return an array containing the elements matched by the filter function.

                @description
                ES5 iteration method. The native method is not used to avoid exposing the underlying data array directly.

                @public
                @function
                @name filter
                @memberOf AbstractArray#
                @param {Function} fn Filter function, should return true if the element matches the filter, false otherwise
                @param {Object} [context] Context that the filter function should be called with
                @see <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/filter">MDN > filter</a>            */
            this.filter = function(fn, that) {
                var data = this.__data();
                var result = [];
                for (var i = 0, l = this.length; i < l; i++) {
                    var val = data[i];
                    if (fn.call(that, val, i, this)) {
                        result.push(val);
                    }
                }
                return result;
            };

            /**
                Iterate on each element in the array and apply the parameter function.

                @description
                ES5 iteration method. The native method is not used to avoid exposing the underlying data array directly.


                @public
                @function
                @name forEach
                @memberOf AbstractArray#
                @param {Function} fn iterator function
                @param {Object} [context] Context that the iterator function should be called with
                @see <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/forEach">MDN > forEach</a>
            */
            this.forEach = function(fn, that) {
                var data = this.__data();
                for (var i = 0, l = this.length; i < l; i++) {
                    var val = data[i];
                    fn.call(that, val, i, this);
                }
            };

            /**
                Check that every element in the array matches the filter function

                @public
                @function
                @name every
                @memberOf AbstractArray#
                @param {Function} fn Filter function
                @param {Object} [context] Context that the iterator function should be called with
                @see <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/every">MDN > every</a>

            */
            this.every = function(fn, that) {
                var data = this.__data();
                for (var i = 0, l = this.length; i < l; i++) {
                    var val = data[i];
                    if (!fn.call(that, val, i, this)) {
                        return false;
                    }
                }
                return true;
            };

            /**
                Check that at least one element in the array matches the filter function

                @description
                ES5 iteration method. The native method is not used to avoid exposing the underlying data array directly.

                @public
                @function
                @name some
                @memberOf AbstractArray#
                @param {Function} fn Filter function
                @param {Object} [context] Context that the iterator function should be called with
                @see <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/some">MDN > some</a>
            */
            this.some = function(fn, that) {
                var data = this.__data();
                for (var i = 0, l = this.length; i < l; i++) {
                    var val = data[i];
                    if (fn.call(that, val, i, this)) {
                        return true;
                    }
                }
                return false;
            };

            /**
                Reduce the array to a single value using the reducing function. Processes the array from left to right.

                @description
                ES5 iteration method. The native method is not used to avoid exposing the underlying data array directly.

                @public
                @function
                @name reduce
                @memberOf AbstractArray#
                @param {Function} fn Reducing function
                @param {Object} [init] Initial value used in the first invocation of the reducing function
                @see <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/Reduce">MDN > Reduce</a>            */
            this.reduce = function(fn, init) {
                var data = this.__data();
                var cur = (init !== undefined) ? init : data[0];
                for (var i = (init !== undefined) ? 0 : 1, l = this.length; i < l; i++) {
                    cur = fn(cur, data[i], i, this);
                }
                return cur;
            };

            /**
                Reduce the array to a single value using the reducing function. Processes the array from right to left.

                @description
                ES5 iteration method. The native method is not used to avoid exposing the underlying data array directly.

                @public
                @function
                @name reduceRight
                @memberOf AbstractArray#
                @param {Function} fn Reducing function
                @param {Object} [init] Initial value used in the first invocation of the reducing function
                @see <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/ReduceRight">MDN > ReduceRight</a>            */
            this.reduceRight = function(fn, init) {
                var data = this.__data();
                var cur = (init !== undefined) ? init : data[data.length - 1];
                for (var i = this.length - ((init !== undefined) ? 1 : 2); i >= 0; i--) {
                    cur = fn(cur, data[i], i, this);
                }
                return cur;
            };
        };



        /**
            Synchronized Array type, which is the return type of the `sync.synchronize`
            method.

            @description
            It wraps a javascript array and provides the same methods.
            Note: Since the underlying persistence layer has no order preservation,
            order is discarded when using this structure. (push and unshift perform the
            same operation, as well as pop and shift). If order is important to your
            application, you should use the `RedisArray`.

            @name dotcloud.sync.Array
            @augments AbstractArray
            @class
        */
        sync.Array = function(collection, pvt) {
            var data = [];
            var dbid = config.dbid;
            var svcName = pvt ? 'sync-private' : 'sync';

            // Inherit the AbstractArray class
            inherits(sync.Array, AbstractArray);
            sync.Array.super.apply(this);

            var notifyChanged = this.__notifyChanged;

            this.__data = function() { return data; };
            this.__config = function() {
                return {
                    dbid: dbid,
                    collection: collection,
                    svcName: svcName
                };
            };

            // We call this RPC method once when creating the array to retrieve
            // the whole collection.
            io.call(this.__config().svcName, 'retrieve')(dbid, collection, function(error, result) {
                if (error)
                    throw JSON.stringify(error);
                switch (result.type) {
                    case 'synchronized':
                        data = result.data || [];
                        notifyChanged('synchronized', data);
                        break;
                    case 'inserted':
                        var obj = result.data;
                        var i, j;
                        if (obj instanceof Array) {
                            for (j = obj.length - 1; j >= 0; j--) {
                                for (i = data.length - 1; i >= 0; i--) {
                                    if (data[i]._id === obj[j]._id) {
                                        break;
                                    }
                                }
                                (i < 0) && data.push(obj[j]);
                            }
                        } else {
                            for (i = data.length - 1; i >= 0; i--) {
                                if (data[i]._id === obj._id) {
                                    return;
                                }
                            }
                            data.push(obj);
                        }
                        notifyChanged('inserted', obj);
                        break;
                    case 'removed':
                        var id = result.data;
                        for (var i = data.length - 1; i >= 0; i--) {
                            if (data[i]._id === id) {
                                if (i === 0) {
                                    data.shift();
                                } else if (i === data.length - 1) {
                                    data.pop();
                                } else {
                                    data.splice(i, 1);
                                }
                                notifyChanged('removed', id);
                                break;
                            }
                        }
                        break;
                    case 'removedall':
                        data = [];
                        notifyChanged('removedall', data);
                        break;
                    case 'updated':
                        var obj = result.data;
                        if (!obj)
                            return;
                        for (var i = data.length - 1; i >= 0; i--) {
                            if (obj._id == data[i]._id) {
                                data[i] = obj;
                                notifyChanged('updated', obj);
                                break;
                            }
                        }
                        break;
                    default:
                        throw 'Unexpected change type: ' + result.type;
                }
            });

            /**
                @property
                @name dotcloud.sync.Array#length
                @description length (number of elements) of the synchronized collection.
            */
            this.length = data.length;
        };

        /**
            This method is not a standard Array method. It allows accessing the
            item present at the specified `index`.
            If the second parameter is provided, the objects will be merged and an
            update command will be sent to the underlying persistence layer.

            @public
            @name dotcloud.sync.Array#at

            @function
            @param {Number} index Index of the element we want to access
            @param {Object} [update] Update object that should be applied on the requested element
            @returns {Object} The element in its original state

        */
        sync.Array.prototype.at = function(index, update) {
            var data = this.__data(),
                cfg = this.__config();

            if (!!update) {
                data[index] = merge(data[index], update);
                io.call(cfg.svcName, 'update')(cfg.dbid, cfg.collection, data[index]._id, data[index], function(error, result) {
                    if (error) throw error;
                });
            }
            return data[index];
        };

        /**
            Remove the last element contained in the array.

            @name dotcloud.sync.Array#pop
            @public
            @function
            @see <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/pop">MDN > pop</a>
            @returns {Object} The removed element
        */
        sync.Array.prototype.pop = function() {
            var data = this.__data(),
                cfg = this.__config();
            io.call(cfg.svcName, 'remove')(cfg.dbid, cfg.collection, data[data.length - 1]._id,
                function(error, result) {
                    if (error) throw error;
                });

            return data[data.length - 1];
        };

        /**
            Add one or more elements at the end of the array.

            @name dotcloud.sync.Array#push
            @public
            @function
            @param {Object...} obj Objects to add to the collection
            @see <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/push">MDN > push</a>
            @returns {Number} The array's new length (transient)
        */
        sync.Array.prototype.push = function(obj) {
            var data = this.__data(),
                cfg = this.__config();

            if (arguments.length > 1) {
                var args = [];
                for (var i = arguments.length - 1; i >= 0; i--) {
                    args.unshift(arguments[i]);
                }
                obj = args;
            }

            io.call(cfg.svcName, 'add')(cfg.dbid, cfg.collection, obj, function(error, result) {
                if (error) throw error;
            });
            return data.length + arguments.length;
        };

        /**
            Remove the first element contained in the array.

            @name dotcloud.sync.Array#shift
            @public
            @function
            @see <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/shift">MDN > shift</a>
            @returns {Object} The removed element
        */
        sync.Array.prototype.shift = function() {
            var data = this.__data(),
                cfg = this.__config();

            io.call(cfg.svcName, 'remove')(cfg.dbid, cfg.collection, data[0]._id, function(error, result) {
                if (error) throw error;
            });
            return data[0];
        };

        /**
            Splice the array just like Javascript's Array#splice, removing `num` elements at position
            `index`, then adding objects at this same position.

            @description
            Note: the returned Array is a plain, non-synchronized Javascript array.

            @name dotcloud.sync.Array#splice
            @public
            @function
            @param {Number} index Position where the splice should be executed
            @param {Number} num Number of elements to remove
            @param {...Object} [obj] Elements to add
            @see <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/splice">MDN > splice</a>
            @returns {Array} An array containing the removed elements
            */
        sync.Array.prototype.splice = function(index, num) {
            var data = this.__data(),
                cfg = this.__config(),
                /** @inner */
                rmCb = function(error, result) {
                    if (error) throw error;
                };

            if (index < 0)
                index += data.length;

            for (var i = num - 1; i >= 0; i--) {
                io.call(cfg.svcName, 'remove')(cfg.dbid, cfg.collection, data[index + i]._id, rmCb);
            }

            for (i = arguments.length - 1; i >= 2; i--) {
                 this.push(arguments[i]);
            }
            return data.slice(index, index + num - 1);
        };

        /**
            Add one or several elements at the start of the array

            @name dotcloud.sync.Array#unshift
            @public
            @function
            @param {...Object} obj Elements to insert
            @see <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/unshift">MDN > unshift</a>
            @returns {Number} The array's new length (transient)
        */
        sync.Array.prototype.unshift = function(obj) {
            var cfg = this.__config();

            if (arguments.length > 1) {
                var args = [];
                for (var i = arguments.length - 1; i >= 0; i--) {
                    args.unshift(arguments[i]);
                }
                obj = args;
            }

            io.call(cfg.svcName, 'add')(cfg.dbid, cfg.collection, obj, function(error, result) {
                if (error) throw error;
            });
        };

        return sync;
    };
});
