!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.co=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/**
 * Expose `co`.
 */

exports = module.exports = co;

/**
 * Wrap the given generator `fn`.
 *
 * @param {Function} fn
 * @return {Function}
 * @api public
 */

function co(fn) {
  var gen = fn();
  var done;

  function next(err, res) {
    var ret;

    // multiple args
    if (arguments.length > 2) {
      res = [].slice.call(arguments, 1);
    }

    // error
    if (err) {
      try {
        ret = gen.throw(err);
      } catch (e) {
        if (!done) throw e;
        return done(e);
      }
    }

    // ok
    if (!err) {
      try {
        ret = gen.send(res);
      } catch (e) {
        if (!done) throw e;
        return done(e);
      }
    }

    // done
    if (ret.done) {
      if (done) done(null, ret.value);
      return;
    }

    // array (join)
    if (Array.isArray(ret.value)) {
      ret.value = exports.join(ret.value);
    }

    // thunk
    if ('function' == typeof ret.value) {
      try {
        ret.value(next);
      } catch (e) {
        setImmediate(function(){
          next(e);
        });
      }
      return;
    }

    // promise
    if (ret.value && 'function' == typeof ret.value.then) {
      ret.value.then(function(value) {
        next(null, value);
      }, next);

      return;
    }

    // neither
    next(new Error('yield a function or promise'));
  }

  setImmediate(next);

  return function(fn){
    done = fn;
  }
}

/**
 * Wrap regular callback style `fn` as a thunk.
 *
 * @param {Function} fn
 * @return {Function}
 * @api public
 */

exports.wrap = function(fn, ctx){
  return function(){
    var args = [].slice.call(arguments);
    return function(done){
      args.push(done);
      fn.apply(ctx || this, args);
    }
  }
};

/**
 * Join the given `fns`.
 *
 * @param {Array|Function} ...
 * @return {Function}
 * @api public
 */

exports.join = function(fns) {
  if (!Array.isArray(fns)) fns = [].slice.call(arguments);

  return function(done){
    var pending = fns.length;
    var results = new Array(pending);
    var finished;

    if (!pending) return done();

    for (var i = 0; i < fns.length; i++) {
      run(fns[i], i);
    }

    function run(fn, i) {
      if (finished) return;
      try {
        fn(function(err, res){
          if (finished) return;

          if (err) {
            finished = true;
            return done(err);
          }

          results[i] = res;
          --pending || done(null, results);
        });
      } catch (err) {
        finished = true;
        done(err);
      }
    }
  }
};

},{}]},{},[1])(1)
});