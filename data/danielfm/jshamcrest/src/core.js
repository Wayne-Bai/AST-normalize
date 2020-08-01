JsHamcrest.Matchers = {};

/**
 * The actual value must be any value considered truth by the JavaScript
 * engine.
 */
JsHamcrest.Matchers.truth = function() {
  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      return actual;
    },

    describeTo: function(description) {
      description.append('truth');
    }
  });
};

/**
 * Delegate-only matcher frequently used to improve readability.
 */
JsHamcrest.Matchers.is = JsHamcrest.EqualTo(function(matcher) {
  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      return matcher.matches(actual);
    },

    describeTo: function(description) {
      description.append('is ').appendDescriptionOf(matcher);
    }
  });
});

/**
 * The actual value must not match the given matcher or value.
 */
JsHamcrest.Matchers.not = JsHamcrest.EqualTo(function(matcher) {
  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      return !matcher.matches(actual);
    },

    describeTo: function(description) {
      description.append('not ').appendDescriptionOf(matcher);
    }
  });
});

/**
 * The actual value must be equal to the given value.
 */
JsHamcrest.Matchers.equalTo = function(expected) {
  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      if (expected instanceof Array || actual instanceof Array) {
        return JsHamcrest.areArraysEqual(expected, actual);
      }
      return actual == expected;
    },

    describeTo: function(description) {
      description.append('equal to ').appendLiteral(expected);
    }
  });
};

/**
 * Useless always-match matcher.
 */
JsHamcrest.Matchers.anything = function() {
  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      return true;
    },

    describeTo: function(description) {
      description.append('anything');
    }
  });
};

/**
 * The actual value must be null (or undefined).
 */
JsHamcrest.Matchers.nil = function() {
  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      return actual == null;
    },

    describeTo: function(description) {
      description.appendLiteral(null);
    }
  });
};

/**
 * The actual value must be the same as the given value.
 */
JsHamcrest.Matchers.sameAs = function(expected) {
  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      return actual === expected;
    },

    describeTo: function(description) {
      description.append('same as ').appendLiteral(expected);
    }
  });
};

/**
 * The actual value is a function and, when invoked, it should thrown an
 * exception with the given name.
 */
JsHamcrest.Matchers.raises = function(exceptionName) {
  return new JsHamcrest.SimpleMatcher({
    matches: function(actualFunction) {
      try {
        actualFunction();
      } catch (e) {
        if (e.name == exceptionName) {
          return true;
        } else {
          throw e;
        }
      }
      return false;
    },

    describeTo: function(description) {
      description.append('raises ').append(exceptionName);
    }
  });
};

/**
 * The actual value is a function and, when invoked, it should raise any
 * exception.
 */
JsHamcrest.Matchers.raisesAnything = function() {
  return new JsHamcrest.SimpleMatcher({
    matches: function(actualFunction) {
      try {
        actualFunction();
      } catch (e) {
        return true;
      }
      return false;
    },

    describeTo: function(description) {
      description.append('raises anything');
    }
  });
};

/**
 * Combinable matcher where the actual value must match both of the given
 * matchers.
 */
JsHamcrest.Matchers.both = JsHamcrest.EqualTo(function(matcher) {
  return new JsHamcrest.CombinableMatcher({
    matches: matcher.matches,
    describeTo: function(description) {
      description.append('both ').appendDescriptionOf(matcher);
    }
  });
});

/**
 * Combinable matcher where the actual value must match at least one of the
 * given matchers.
 */
JsHamcrest.Matchers.either = JsHamcrest.EqualTo(function(matcher) {
  return new JsHamcrest.CombinableMatcher({
    matches: matcher.matches,
    describeTo: function(description) {
      description.append('either ').appendDescriptionOf(matcher);
    }
  });
});

/**
 * All the given values or matchers should match the actual value to be
 * successful. This matcher behaves pretty much like the && operator.
 */
JsHamcrest.Matchers.allOf = function() {
  var args = arguments;
  if (args[0] instanceof Array) {
    args = args[0];
  }
  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      for (var i = 0; i < args.length; i++) {
        var matcher = args[i];
        if (!JsHamcrest.isMatcher(matcher)) {
          matcher = JsHamcrest.Matchers.equalTo(matcher);
        }
        if (!matcher.matches(actual)) {
          return false;
        }
      }
      return true;
    },

    describeTo: function(description) {
      description.appendList('(', ' and ', ')', args);
    }
  });
};

/**
 * At least one of the given matchers should match the actual value. This
 * matcher behaves pretty much like the || (or) operator.
 */
JsHamcrest.Matchers.anyOf = function() {
  var args = arguments;
  if (args[0] instanceof Array) {
    args = args[0];
  }
  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      for (var i = 0; i < args.length; i++) {
        var matcher = args[i];
        if (!JsHamcrest.isMatcher(matcher)) {
          matcher = JsHamcrest.Matchers.equalTo(matcher);
        }
        if (matcher.matches(actual)) {
          return true;
        }
      }
      return false;
    },

    describeTo: function(description) {
      description.appendList('(', ' or ', ')', args);
    }
  });
};

