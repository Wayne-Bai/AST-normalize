/* vi:ts=2 sw=2 expandtab
 *
 * JsMockito v@VERSION
 * http://github.com/chrisleishman/jsmockito
 *
 * Mockito port to JavaScript
 *
 * Copyright (c) 2009 Chris Leishman
 * Licensed under the BSD license
 */

/**
 * Main namespace.
 * @namespace
 *
 * <h2>Contents</h2>
 *
 * <ol>
 *  <li><a href="#1">Let's verify some behaviour!</a></li>
 *  <li><a href="#2">How about some stubbing?</a></li>
 *  <li><a href="#3">Matching Arguments</a></li>
 *  <li><a href="#4">Verifying exact number of invocations / at least once /
 *  never</a></li>
 *  <li><a href="#5">Matching the context ('this')</a></li>
 *  <li><a href="#6">Making sure interactions never happened on a mock</a></li>
 *  <li><a href="#7">Finding redundant invocations</a></li>
 * </ol>
 *
 * <p>In the following examples object mocking is done with Array as this is
 * well understood, although you probably wouldn't mock this in normal test
 * development.</p>
 *
 * <h2><a name="1">1. Let's verify some behaviour!</a></h2>
 *
 * <p>For an object (via a prototype):</p>
 * <pre>
 * //mock creation
 * var prototype = new Array();
 * var mockedArray = mock(prototype);
 *
 * //using mock object
 * mockedArray.push("one");
 * mockedArray.reverse();
 *
 * //using mock object
 * mockedArray.push("one");
 * mockedArray.reverse();
 *
 * //verification
 * verify(mockedArray).push("one");
 * verify(mockedArray).reverse();
 * </pre>
 *
 * <p>For an object (via a constructor):</p>
 * <pre>
 * //mock creation
 * //WARNING: The constructor function will be run with no arguments!
 * //  Don't use this with functions that change the state of the application, use
 * //  a prototype instead (as described above).
 * var mockedArray = mock(Array);
 *
 * //using mock object
 * mockedArray.push("one");
 * mockedArray.reverse();
 *
 * //verification
 * verify(mockedArray).push("one");
 * verify(mockedArray).reverse();
 * </pre>
 *
 * <p>For a function:</p>
 * <pre>
 * //mock creation
 * var mockedFunc = mockFunction();
 *
 * //using mock function
 * mockedFunc('hello world');
 * mockedFunc.call(this, 'foobar');
 * mockedFunc.apply(this, [ 'barfoo' ]);
 *
 * //verification
 * verify(mockedFunc)('hello world');
 * verify(mockedFunc)('foobar');
 * verify(mockedFunc)('barfoo');
 * </pre>
 *
 * <p>Once created a mock will remember all interactions.  Then you selectively
 * verify whatever interactions you are interested in.</p>
 *
 * <h2><a name="2">2. How about some stubbing?</a></h2>
 *
 * <p>For an object:</p>
 * <pre>
 * var mockedArray = mock(Array);
 *
 * //stubbing
 * when(mockedArray).slice(0).thenReturn('f');
 * when(mockedArray).slice(1).thenThrow('An exception');
 * when(mockedArray).slice(2).then(function() { return 1+2 });
 *
 * //the following returns "f"
 * assertThat(mockedArray.slice(0), equalTo('f'));
 *
 * //the following throws exception 'An exception'
 * var ex = undefined;
 * try {
 *   mockedArray.slice(1);
 * } catch (e) {
 *   ex = e;
 * }
 * assertThat(ex, equalTo('An exception');
 *
 * //the following invokes the stub method, which returns 3
 * assertThat(mockedArray.slice(2), equalTo(3));
 *
 * //the following returns undefined as slice(999) was not stubbed
 * assertThat(mockedArray.slice(999), typeOf('undefined'));
 *
 * //stubs can take multiple values to return in order (same for 'thenThrow' and 'then' as well)
 * when(mockedArray).pop().thenReturn('a', 'b', 'c');
 * assertThat(mockedArray.pop(), equalTo('a'));
 * assertThat(mockedArray.pop(), equalTo('b'));
 * assertThat(mockedArray.pop(), equalTo('c'));
 * assertThat(mockedArray.pop(), equalTo('c'));
 *
 * //stubs can also be chained to return values in order
 * when(mockedArray).unshift().thenReturn('a').thenReturn('b').then(function() { return 'c' });
 * assertThat(mockedArray.unshift(), equalTo('a'));
 * assertThat(mockedArray.unshift(), equalTo('b'));
 * assertThat(mockedArray.unshift(), equalTo('c'));
 * assertThat(mockedArray.unshift(), equalTo('c'));
 *
 * //stub matching can overlap, allowing for specific cases and defaults
 * when(mockedArray).slice(3).thenReturn('abcde');
 * when(mockedArray).slice(3, lessThan(0)).thenReturn('edcba');
 * assertThat(mockedArray.slice(3, -1), equalTo('edcba'));
 * assertThat(mockedArray.slice(3, 1), equalTo('abcde'));
 * assertThat(mockedArray.slice(3), equalTo('abcde'));
 *
 * //can also verify a stubbed invocation, although this is usually redundant
 * verify(mockedArray).slice(0);
 * </pre>
 *
 * <p>For a function:</p>
 * <pre>
 * var mockedFunc = mockFunction();
 *
 * //stubbing
 * when(mockedFunc)(0).thenReturn('f');
 * when(mockedFunc)(1).thenThrow('An exception');
 * when(mockedFunc)(2).then(function() { return 1+2 });
 *
 * //the following returns "f"
 * assertThat(mockedFunc(0), equalTo('f'))
 *
 * //following throws exception 'An exception'
 * mockedFunc(1);
 * //the following throws exception 'An exception'
 * var ex = undefined;
 * try {
 *   mockedFunc(1);
 * } catch (e) {
 *   ex = e;
 * }
 * assertThat(ex, equalTo('An exception');
 *
 * //the following invokes the stub method, which returns 3
 * assertThat(mockedFunc(2), equalTo(3));
 *
 * //following returns undefined as mockedFunc(999) was not stubbed
 * assertThat(mockedFunc(999), typeOf('undefined'));
 *
 * //stubs can take multiple values to return in order (same for 'thenThrow' and 'then' as well)
 * when(mockedFunc)(3).thenReturn('a', 'b', 'c');
 * assertThat(mockedFunc(3), equalTo('a'));
 * assertThat(mockedFunc(3), equalTo('b'));
 * assertThat(mockedFunc(3), equalTo('c'));
 * assertThat(mockedFunc(3), equalTo('c'));
 *
 * //stubs can also be chained to return values in order
 * when(mockedFunc)(4).thenReturn('a').thenReturn('b').then(function() { return 'c' });
 * assertThat(mockedFunc(4), equalTo('a'));
 * assertThat(mockedFunc(4), equalTo('b'));
 * assertThat(mockedFunc(4), equalTo('c'));
 * assertThat(mockedFunc(4), equalTo('c'));
 *
 * //stub matching can overlap, allowing for specific cases and defaults
 * when(mockedFunc)(5).thenReturn('abcde')
 * when(mockedFunc)(5, lessThan(0)).thenReturn('edcba')
 * assertThat(mockedFunc(5, -1), equalTo('edcba'))
 * assertThat(mockedFunc(5, 1), equalTo('abcde'))
 * assertThat(mockedFunc(5), equalTo('abcde'))
 *
 * //can also verify a stubbed invocation, although this is usually redundant
 * verify(mockedFunc)(0);
 * </pre>
 *
 * <ul>
 * <li>By default mocks return undefined from all invocations;</li>
 * <li>Stubs can be overwritten;</li>
 * <li>Once stubbed, the method will always return the stubbed value regardless
 * of how many times it is called;</li>
 * <li>Last stubbing is more important - when you stubbed the same method with
 * the same (or overlapping) matchers many times.</li>
 * </ul>
 *
 * <h2><a name="3">3. Matching Arguments</a></h2>
 *
 * <p>JsMockito verifies arguments using 
 * <a href="http://jshamcrest.destaquenet.com/">JsHamcrest</a> matchers.
 *
 * <pre>
 * var mockedArray = mock(Array);
 * var mockedFunc = mockFunction();
 *
 * //stubbing using JsHamcrest
 * when(mockedArray).slice(lessThan(10)).thenReturn('f');
 * when(mockedFunc)(containsString('world')).thenReturn('foobar');
 *
 * //following returns "f"
 * mockedArray.slice(5);
 *
 * //following returns "foobar"
 * mockedFunc('hello world');
 *
 * //you can also use matchers in verification
 * verify(mockedArray).slice(greaterThan(4));
 * verify(mockedFunc)(equalTo('hello world'));
 *
 * //if not specified then the matcher is anything(), thus either of these
 * //will match an invocation with a single argument
 * verify(mockedFunc)();
 * verify(mockedFunc)(anything());
 * </pre>
 *
 * <ul>
 * <li>If the argument provided during verification/stubbing is not a
 * JsHamcrest matcher, then 'equalTo(arg)' is used instead;</li>
 * <li>Where a function/method was invoked with an argument, but the stub or
 * verification does not provide a matcher, then anything() is assumed;</li>
 * <li>The reverse, however, is not true - the anything() matcher will
 * <em>not</em> match an argument that was never provided.</li>
 * </ul>
 *
 * <h2><a name="4">4. Verifying exact number of invocations / at least once /
 * never</a></h2>
 *
 * <pre>
 * var mockedArray = mock(Array);
 * var mockedFunc = mockFunction();
 *
 * mockedArray.slice(5);
 * mockedArray.slice(6);
 * mockedFunc('a');
 * mockedFunc('b');
 *
 * //verification of multiple matching invocations
 * verify(mockedArray, times(2)).slice(anything());
 * verify(mockedFunc, times(2))(anything());
 *
 * //the default is times(1), making these are equivalent
 * verify(mockedArray, times(1)).slice(5);
 * verify(mockedArray).slice(5);
 * </pre>
 *
 * <h2><a name="5">5. Matching the context ('this')</a></h2>
 * 
 * Functions can be invoked with a specific context, using the 'call' or
 * 'apply' methods. JsMockito mock functions (and mock object methods)
 * will remember this context and verification/stubbing can match on it.
 *
 * <p>For a function:</p>
 * <pre>
 * var mockedFunc = mockFunction();
 * var context1 = {};
 * var context2 = {};
 *
 * when(mockedFunc).call(equalTo(context2), anything()).thenReturn('hello');
 *
 * mockedFunc.call(context1, 'foo');
 * //the following returns 'hello'
 * mockedFunc.apply(context2, [ 'bar' ]);
 *
 * verify(mockedFunc).apply(context1, [ 'foo' ]);
 * verify(mockedFunc).call(context2, 'bar');
 * </pre>
 *
 * <p>For object method invocations, the context is usually the object itself.
 * But sometimes people do strange things, and you need to test it - so
 * the same approach can be used for an object:</p>
 * <pre>
 * var mockedArray = mock(Array);
 * var otherContext = {};
 *
 * when(mockedArray).slice.call(otherContext, 5).thenReturn('h');
 *
 * //the following returns 'h'
 * mockedArray.slice.apply(otherContext, [ 5 ]);
 *
 * verify(mockedArray).slice.call(equalTo(otherContext), 5);
 * </pre>
 *
 * <ul>
 * <li>For mock functions, the default context matcher is anything();</li>
 * <li>For mock object methods, the default context matcher is
 * sameAs(mockObj).</li>
 * </ul>
 *
 * <h2><a name="6">6. Making sure interactions never happened on a mock</a></h2>
 * 
 * <pre>
 * var mockOne = mock(Array);
 * var mockTwo = mock(Array);
 * var mockThree = mockFunction();
 * 
 * //only mockOne is interacted with
 * mockOne.push(5);
 *
 * //verify a method was never called
 * verify(mockOne, never()).unshift('a');
 * 
 * //verify that other mocks were not interacted with
 * verifyZeroInteractions(mockTwo, mockThree);
 * </pre>
 *
 * <h2><a name="7">7. Finding redundant invocations</a></h2>
 *
 * <pre>
 * var mockArray = mock(Array);
 * 
 * mockArray.push(5);
 * mockArray.push(8);
 *
 * verify(mockArray).push(5);
 *
 * // following verification will fail
 * verifyNoMoreInteractions(mockArray);
 * </pre>
 */
JsMockito = {
  /**
   * Library version,
   */
  version: '@VERSION',

  _export: ['isMock', 'when', 'verify', 'verifyZeroInteractions',
            'verifyNoMoreInteractions', 'spy'],

  /**
   * Test if a given variable is a mock
   *
   * @param maybeMock An object
   * @return {boolean} true if the variable is a mock
   */
  isMock: function(maybeMock) {
    return typeof maybeMock._jsMockitoVerifier != 'undefined';
  },

  /**
   * Add a stub for a mock object method or mock function
   *
   * @param mock A mock object or mock anonymous function
   * @return {object or function} A stub builder on which the method or
   * function to be stubbed can be invoked
   */
  when: function(mock) {
    return mock._jsMockitoStubBuilder();
  },

  /**
   * Verify that a mock object method or mock function was invoked
   *
   * @param mock A mock object or mock anonymous function
   * @param verifier Optional JsMockito.Verifier instance (default: JsMockito.Verifiers.once())
   * @return {object or function} A verifier on which the method or function to
   * be verified can be invoked
   */
  verify: function(mock, verifier) {
    return (verifier || JsMockito.Verifiers.once()).verify(mock);
  },

  /**
   * Verify that no mock object methods or the mock function were ever invoked
   *
   * @param mock A mock object or mock anonymous function (multiple accepted)
   */
  verifyZeroInteractions: function() {
    JsMockito.each(arguments, function(mock) {
      JsMockito.Verifiers.zeroInteractions().verify(mock);
    });
  },

  /**
   * Verify that no mock object method or mock function invocations remain
   * unverified
   *
   * @param mock A mock object or mock anonymous function (multiple accepted)
   */
  verifyNoMoreInteractions: function() {
    JsMockito.each(arguments, function(mock) {
      JsMockito.Verifiers.noMoreInteractions().verify(mock);
    });
  },

  /**
   * Create a mock that proxies a real function or object.  All un-stubbed
   * invocations will be passed through to the real implementation, but can
   * still be verified.
   *
   * @param {object or function} delegate A 'real' (concrete) object or
   * function that the mock will delegate unstubbed invocations to
   * @return {object or function} A mock object (as per mock) or mock function
   * (as per mockFunction)
   */
  spy: function(delegate) {
    return (typeof delegate == 'function')?
      JsMockito.mockFunction(delegate) : JsMockito.mock(delegate, delegate);
  },

  contextCaptureFunction: function(defaultContext, handler) {
    // generate a function with overridden 'call' and 'apply' methods
    // and apply a default context when these are not used to supply
    // one explictly.
    var captureFunction = function() {
      return captureFunction.apply(defaultContext,
        Array.prototype.slice.call(arguments, 0));
    };
    captureFunction.call = function(context) {
      return captureFunction.apply(context,
        Array.prototype.slice.call(arguments, 1));
    };
    captureFunction.apply = function(context, args) {
      return handler.apply(this, [ context, args||[] ]);
    };
    return captureFunction;
  },

  matchArray: function(matchers, array) {
    if (matchers.length > array.length)
      return false;
    return !JsMockito.any(matchers, function(matcher, i) {
      return !matcher.matches(array[i]);
    });
  },

  toMatcher: function(obj) {
    return JsHamcrest.isMatcher(obj)? obj :
      JsHamcrest.Matchers.equalTo(obj);
  },

  mapToMatchers: function(srcArray) {
    return JsMockito.map(srcArray, function(obj) {
      return JsMockito.toMatcher(obj);
    });
  },

  verifier: function(name, proto) {
    JsMockito.Verifiers[name] = function() { JsMockito.Verifier.apply(this, arguments) };
    JsMockito.Verifiers[name].prototype = new JsMockito.Verifier;
    JsMockito.Verifiers[name].prototype.constructor = JsMockito.Verifiers[name];
    JsMockito.extend(JsMockito.Verifiers[name].prototype, proto);
  },

  each: function(srcArray, callback) {
    for (var i = 0; i < srcArray.length; i++)
      callback(srcArray[i], i);
  },

  eachObject: function(srcObject, callback) {
      for (var key in srcObject)
        callback(srcObject[key], key);
  },

  extend: function(dstObject, srcObject) {
    for (var prop in srcObject) {
      dstObject[prop] = srcObject[prop];
    }
    return dstObject;
  },

  objectKeys: function(srcObject) {
    var result = [];
    JsMockito.eachObject(srcObject, function(elem, key) {
      result.push(key);
    });
    return result;
  },

  objectValues: function(srcObject) {
    var result = [];
    JsMockito.eachObject(srcObject, function(elem, key) {
      result.push(elem);
    });
    return result;
  },

  map: function(srcArray, callback) {
    var result = [];
    JsMockito.each(srcArray, function(elem, key) {
      var val = callback(elem, key);
      if (val != null)
        result.push(val);
    });
    return result;
  },

  grep: function(srcArray, callback) {
    var result = [];
    JsMockito.each(srcArray, function(elem, key) {
      if (callback(elem, key))
        result.push(elem);
    });
    return result;
  },

  find: function(array, callback) {
    for (var i = 0; i < array.length; i++)
      if (callback(array[i], i))
        return array[i];
    return undefined;
  },

  any: function(array, callback) {
    return (JsMockito.find(array, callback) != undefined);
  },

  propertyNames: function(object) {
    if (Object.getOwnPropertyNames) {
      var prototype = Object.getPrototypeOf(object);
      // top-most prototype object should be ignored
      if (!prototype)
        return [];
      var names = JsMockito.propertyNames(prototype);
      var ownNames = Object.getOwnPropertyNames(object);
      JsMockito.each(ownNames, function(name) {
        if (!JsMockito.any(names, function(n) { n == name }))
          names.push(name);
      });
      return names;
    } else {
      var props = [];
      for (var name in object)
        props.push(name);
      return props;
    }
  },

  propertyDescriptor: function(object, name) {
    if (!Object.getOwnPropertyDescriptor)
      return undefined;

    var descriptor = Object.getOwnPropertyDescriptor(object, name)
    if (descriptor != undefined)
      return descriptor;
    var prototype = Object.getPrototypeOf(object);
    if (!prototype || !Object.getPrototypeOf(prototype))
      return undefined;
    return this.propertyDescriptor(prototype, name);
  },

  defineProperty: function(object, name, description) {
    if (!Object.defineProperty) {
      object[name] = description.value;
      return;
    }
    Object.defineProperty(object, name, description);
  },

  overwriteProperty: function(object, name, description) {
    JsMockito.defineProperty(object, name, {
      enumerable: description.enumerable,
      configurable: true,
      writable: true,
      value: description.value
    });
  }
};

if (typeof exports !== "undefined") exports.JsMockito = JsMockito;
