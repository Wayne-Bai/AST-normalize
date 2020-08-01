/*
 * JsHamcrest v@VERSION
 * http://danielfm.github.com/jshamcrest/
 *
 * Library of matcher objects for JavaScript.
 *
 * Copyright (c) 2009-2013 Daniel Fernandes Martins
 * Licensed under the BSD license.
 *
 * Revision: @REV
 * Date:     @DATE
 */

var JsHamcrest = {
  /**
   * Library version.
   */
  version: '@VERSION',

  /**
   * Delegate function, useful when used to create a matcher that has a value-equalTo semantic
   */
  EqualTo: function (func) {
    return function (matcherOrValue) {
      if (!JsHamcrest.isMatcher(matcherOrValue)) {
        return func(JsHamcrest.Matchers.equalTo(matcherOrValue));
      }
      return func(matcherOrValue);
    };
  },

  /**
   * Returns whether the given object is a matcher.
   */
  isMatcher: function(obj) {
    return obj instanceof JsHamcrest.SimpleMatcher;
  },

  /**
   * Returns whether the given arrays are equivalent.
   */
  areArraysEqual: function(array, anotherArray) {
    if (array instanceof Array || anotherArray instanceof Array) {
      if (array.length != anotherArray.length) {
        return false;
      }

      for (var i = 0; i < array.length; i++) {
        var a = array[i];
        var b = anotherArray[i];

        if (a instanceof Array || b instanceof Array) {
          if(!JsHamcrest.areArraysEqual(a, b)) {
            return false;
          }
        } else if (a != b) {
          return false;
        }
      }
      return true;
    } else {
      return array == anotherArray;
    }
  },

  /**
   * Returns whether the given Arrays are equivalent. This will return true if the objects
   * inside the Arrays are equivalent i.e. they don't have to be the same object reference.
   * Two objects with the same key value pairs will be equivalent even though they are not
   * the same object.
   *
   * @param {type} expected A map of expected values.
   * @param {type} actual A map of the actual values.
   * @returns {Boolean} A Boolean signifying if the two Arrays are equivalent, true if they are.
   */
  areArraysEquivalent: function(expected, actual)
  {
    if (expected.length !== actual.length)
    {
        return false;
    }

    for (var i = 0; i < expected.length; i++)
    {
        var a = expected[i];
        var b = actual[i];

        if(JsHamcrest.areTwoEntitiesEquivalent(a, b) === false)
        {
            return false;
        }
    }

    return true;
  },

  /**
   * Returns whether the given maps are equivalent. This will return true if the objects
   * inside the maps are equivalent i.e. they don't have to be the same object reference.
   * Two objects with the same key value pairs will be equivalent even though they are not
   * the same object.
   *
   * @param {type} expected A map of expected values.
   * @param {type} actual A map of the actual values.
   * @returns {Boolean} A Boolean signifying if the two maps are equivalent, true if they are.
   */
  areMapsEquivalent: function(expected, actual)
  {
    // we need to do this both ways in case both maps have undefined values (which makes counting the number
    // of keys a non-acceptable comparison).
    if(JsHamcrest.simpleMapCompare(expected, actual) && JsHamcrest.simpleMapCompare(actual, expected))
    {
        return true;
    }

    return false;
  },

  simpleMapCompare: function(firstMap, secondMap)
  {
    for(var item in firstMap)
    {
        if(firstMap.hasOwnProperty(item))
        {
            if(!JsHamcrest.areTwoEntitiesEquivalent(firstMap[item], secondMap[item])) return false;
        }
    }

    return true;
  },

  areTwoEntitiesEquivalent: function(expected, actual)
  {
    var expectedsMatcher = JsHamcrest.retreiveEntityMatcherFunction(expected);
    var actualsMatcher = JsHamcrest.retreiveEntityMatcherFunction(actual);

    if(expectedsMatcher === actualsMatcher && expectedsMatcher(expected, actual))
    {
        return true;
    }

    return false;
  },

  /**
   * Returns the function that would be used to compare the entity with an entity of the same type.
   *
   * @param {type} entity A JavaScript entity, this method will try and figure out what type.
   */
  retreiveEntityMatcherFunction: function(entity) {
    if ( (Array.isArray && Array.isArray(entity)) || entity instanceof Array ) return JsHamcrest.areArraysEquivalent;

    if(entity instanceof Boolean) return JsHamcrest.areBooleansEqual;

    if(entity instanceof Date) return JsHamcrest.areDatesEqual;

    if(entity instanceof Function) return JsHamcrest.areFunctionsEqual;

    if(entity instanceof Number || typeof entity === "number") return JsHamcrest.areNumbersEqual;

    if(entity instanceof String || typeof entity === "string") return JsHamcrest.areStringsEqual;

    if(entity instanceof RegExp) return JsHamcrest.areRegExpEqual;

    if(entity instanceof Error) return JsHamcrest.areErrorsEqual;

    if(typeof entity === "undefined") return JsHamcrest.areEntitiesUndefined;

    if(entity === null) return JsHamcrest.areEntitiesNull;

    if(entity.constructor === Object) return JsHamcrest.areMapsEquivalent;

    return JsHamcrest.areEntitiesStrictlyEquals;
  },

  /**
   * Simple comparator functions.
   *
   * @param {type} expected The Object that is expected to be present.
   * @param {type} actual The Object that is actually present.
   */
  areBooleansEqual: function(expected, actual) { return expected.toString() === actual.toString(); },

  areDatesEqual: function(expected, actual) {    return expected.toString() === actual.toString(); },

  areFunctionsEqual: function(expected, actual) {    return expected === actual; },

  areNumbersEqual: function(expected, actual) { return expected.valueOf() === actual.valueOf(); },

  areStringsEqual: function(expected, actual) { return expected.valueOf() === actual.valueOf(); },

  areRegExpEqual: function(expected, actual) { return expected.toString() === actual.toString(); },

  areErrorsEqual: function(expected, actual) { return expected.constructor === actual.constructor && expected.message === actual.message; },

  areEntitiesUndefined: function(expected, actual) { return expected === actual; },

  areEntitiesNull: function(expected, actual) { return expected === actual; },

  areEntitiesStrictlyEquals: function(expected, actual) { return expected === actual; },

  /**
   * Builds a matcher object that uses external functions provided by the
   * caller in order to define the current matching logic.
   */
  SimpleMatcher: function(params) {
    params = params || {};

    this.matches = params.matches;
    this.describeTo = params.describeTo;

    // Replace the function to describe the actual value
    if (params.describeValueTo) {
      this.describeValueTo = params.describeValueTo;
    }
  },

  /**
   * Matcher that provides an easy way to wrap several matchers into one.
   */
  CombinableMatcher: function(params) {
    // Call superclass' constructor
    JsHamcrest.SimpleMatcher.apply(this, arguments);

    params = params || {};

    this.and = function(anotherMatcher) {
      var all = JsHamcrest.Matchers.allOf(this, anotherMatcher);
      return new JsHamcrest.CombinableMatcher({
        matches: all.matches,

        describeTo: function(description) {
          description.appendDescriptionOf(all);
        }
      });
    };

    this.or = function(anotherMatcher) {
      var any = JsHamcrest.Matchers.anyOf(this, anotherMatcher);
      return new JsHamcrest.CombinableMatcher({
        matches: any.matches,

        describeTo: function(description) {
          description.appendDescriptionOf(any);
        }
      });
    };
  },

  /**
   * Class that builds assertion error messages.
   */
  Description: function() {
    var value = '';

    this.get = function() {
      return value;
    };

    this.appendDescriptionOf = function(selfDescribingObject) {
      if (selfDescribingObject) {
        selfDescribingObject.describeTo(this);
      }
      return this;
    };

    this.append = function(text) {
      if (text != null) {
        value += text;
      }
      return this;
    };

    this.appendLiteral = function(literal) {
      var undefined;
      if (literal === undefined) {
        this.append('undefined');
      } else if (literal === null) {
        this.append('null');
      } else if (literal instanceof Array) {
        this.appendValueList('[', ', ', ']', literal);
      } else if (typeof literal == 'string') {
        this.append('"' + literal + '"');
      } else if (literal instanceof Function) {
        this.append('Function' + (literal.name ? ' ' + literal.name : ''));
      } else {
        this.append(literal);
      }
      return this;
    };

    this.appendValueList = function(start, separator, end, list) {
      this.append(start);
      for (var i = 0; i < list.length; i++) {
        if (i > 0) {
          this.append(separator);
        }
        this.appendLiteral(list[i]);
      }
      this.append(end);
      return this;
    };

    this.appendList = function(start, separator, end, list) {
      this.append(start);
      for (var i = 0; i < list.length; i++) {
        if (i > 0) {
          this.append(separator);
        }
        this.appendDescriptionOf(list[i]);
      }
      this.append(end);
      return this;
    };
  }
};


/**
 * Describes the actual value to the given description. This method is optional
 * and, if it's not present, the actual value will be described as a JavaScript
 * literal.
 */
JsHamcrest.SimpleMatcher.prototype.describeValueTo = function(actual, description) {
  description.appendLiteral(actual);
};


// CombinableMatcher is a specialization of SimpleMatcher
JsHamcrest.CombinableMatcher.prototype = new JsHamcrest.SimpleMatcher();
JsHamcrest.CombinableMatcher.prototype.constructor = JsHamcrest.CombinableMatcher;
