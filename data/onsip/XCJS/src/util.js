/**
 * @name Function
 * @namespace
 * Utility library for mixing in common functionality to
 * native Javascript objects
 */

XC.Base.mixin.call(Function.prototype, /** @lends Function.prototype */ {

  /**
   * Around adds a flag to a function
   * that lets {@link XC.Base.mixin} know
   * to mixin the function curried with the
   * base function.  If no base function exits
   * the around function will be curried with a
   * dummy Function.  It is up to the client
   * to check the return value of the curried
   * function
   *
   * @example
   *   var foo = XC.Base.extend({
   *     bar: function (junk) {
   *       return 'foo' + junk;
   *     }
   *   });
   *   var fooBar = foo.extend({
   *     bar: function (foosBar, junk) {
   *       return 'foo' + foosBar.call(this, [junk]);
   *     }.around();
   *   });
   *   foo.bar('bell')
   *   // -> 'barbell'
   *   fooBar.bar('n')
   *   // -> 'foobarn'
   * @returns {Function} The reciever
   */
  around: function () {
    this._xcAround = true;
    return this;
  },

  /**
   * <p>Marks the function as inferior.
   * If a key exists on the mixin and the new mixin is marked as inferior,
   * it will ignore the new function, relying on the old function
   * for its implementation.</p>
   *
   * @example
   *   var foo = XC.Base.extend({
   *     bar: function () { return 1; }
   *   }, {
   *     bar: function () { return 2; }.inferior()
   *   });
   *   foor.bar()
   *   // -> 1
   * @returns {Function} The reciever
   */
  inferior: function () {
    this._xcInferior = true;
    return this;
  }
});

// must mix this in separately because we want to call inferior here
XC.Base.mixin.call(Function.prototype, /** @lends Function.prototype */ {
  /**
   * Appends the arguments given to the function,
   * returning a new function that will call the
   * original function with the given arguments appended
   * with the arguments supplied at runtime.
   *
   * @returns {Function} This function with pre-filled arguments.
   * @example
   *   function aggregate () {
   *     var sum = 0, idx = arguments.length;
   *     while (idx--) {
   *       sum += arguments[idx];
   *     }
   *     return sum;
   *   }
   *   aggregate(2, 5, 9);
   *   // -> 16
   *   var oneMore = aggregate.curry(1);
   *   oneMore(2, 5, 9);
   *   // -> 17
   */
  curry: function () {
    if (!arguments.length) {
      return this;
    }
    var curriedArgs = Array.from(arguments),
        fn = this;
    return function () {
      return fn.apply(this, curriedArgs.concat(Array.from(arguments)));
    };
  }.inferior(),

  /**
   * <p>Bind 'this' to be the value of target when the bound function
   * is invoked. Any additional arguments will be prepended to the argument
   * list when the function is called.</p>
   *
   * <p>This function is compatible with the ECMAScript 5 standard.</p>
   *
   * @param {Object} target The value that 'this' should represent.
   * @returns {Function} This function wrapped to take the target as 'this'.
   * @example
   *   var Person = {
   *     name: null,
   *     sayHi: function () {
   *       return "Hello, " + this.name;
   *     }
   *   };
   *   var mal = Person.extend({
   *     name: 'Mal'
   *   });
   *   var mrFancyPants = {
   *     name: 'Mr. FancyPants'
   *   });
   *   mal.sayHi();
   *   // -> 'Hello, Mal'
   *
   *   var sayWho = mal.sayHi.bind(mrFancyPants)
   *   sayWho();
   *   // -> 'Hello, Mr. FancyPants'
   */
  bind: function (target) {
    var _method = this,
        args = Array.from(arguments).slice(1);
    return function () {
      return _method.apply(target, args.concat(Array.from(arguments)));
    };
  }.inferior()
});

/**
 * Array mixins
 */
XC.Base.mixin.call(Array, /** @lends Array */ {
  /**
   * Convert an iterable object into an Array.
   *
   * @param {Object} object An object that is iterable
   * @returns {Array} The object converted into an Array.
   * @example
   *   function commaSeparate () {
   *     return Array.from(arguments).join(', ');
   *   }
   *
   *   commaSeparate("romeo", "juliet", "benvolio");
   *   // -> "romeo, juliet, benvolio"
   */
  from: function (iterable) {
    return Array.prototype.slice.apply(iterable);
  }.inferior()
});

/**
 * Internet Explorer doesn't implement indexOf,
 * so implement it here.
 */
XC.Base.mixin.call(Array.prototype, /** @lends Array.prototype */ {
  /**
   * Returns the index of an object in an Array.
   * This is here for JScript not having the indexOf function on the Array prototype.
   *
   * @param {Object} object The Object to look for.
   * @returns {Number} The index of the Object or -1 if it doesn't exist.
   */
  indexOf: function (o) {
    for (var i = 0; i < this.length; i++)  {
      if (this[i] === o) {
        return i;
      }
    }
    return -1;
  }.inferior()
});
