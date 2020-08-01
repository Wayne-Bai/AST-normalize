/**
 * The actual number must be greater than the expected number.
 */
JsHamcrest.Matchers.greaterThan = function(expected) {
  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      return actual > expected;
    },

    describeTo: function(description) {
      description.append('greater than ').appendLiteral(expected);
    }
  });
};

/**
 * The actual number must be greater than or equal to the expected number
 */
JsHamcrest.Matchers.greaterThanOrEqualTo = function(expected) {
  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      return actual >= expected;
    },

    describeTo: function(description) {
      description.append('greater than or equal to ').appendLiteral(expected);
    }
  });
};

/**
 * The actual number must be less than the expected number.
 */
JsHamcrest.Matchers.lessThan = function(expected) {
  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      return actual < expected;
    },

    describeTo: function(description) {
      description.append('less than ').appendLiteral(expected);
    }
  });
};

/**
 * The actual number must be less than or equal to the expected number.
 */
JsHamcrest.Matchers.lessThanOrEqualTo = function(expected) {
  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      return actual <= expected;
    },

    describeTo: function(description) {
      description.append('less than or equal to ').append(expected);
    }
  });
};

/**
 * The actual value must not be a number.
 */
JsHamcrest.Matchers.notANumber = function() {
  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      return isNaN(actual);
    },

    describeTo: function(description) {
      description.append('not a number');
    }
  });
};

/**
 * The actual value must be divisible by the given number.
 */
JsHamcrest.Matchers.divisibleBy = function(divisor) {
  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      return actual % divisor === 0;
    },

    describeTo: function(description) {
      description.append('divisible by ').appendLiteral(divisor);
    }
  });
};

/**
 * The actual value must be even.
 */
JsHamcrest.Matchers.even = function() {
  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      return actual % 2 === 0;
    },

    describeTo: function(description) {
      description.append('even');
    }
  });
};

/**
 * The actual number must be odd.
 */
JsHamcrest.Matchers.odd = function() {
  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      return actual % 2 !== 0;
    },

    describeTo: function(description) {
      description.append('odd');
    }
  });
};

/**
 * The actual number must be between the given range (inclusive).
 */
JsHamcrest.Matchers.between = function(start) {
  return {
    and: function(end) {
      var greater = end;
      var lesser = start;

      if (start > end) {
        greater = start;
        lesser = end;
      }

      return new JsHamcrest.SimpleMatcher({
        matches: function(actual) {
          return actual >= lesser && actual <= greater;
        },

        describeTo: function(description) {
          description.append('between ').appendLiteral(lesser)
              .append(' and ').appendLiteral(greater);
        }
      });
    }
  };
};

/**
 * The actual number must be close enough to *expected*, that is, the actual
 *  number is equal to a value within some range of acceptable error.
 */
JsHamcrest.Matchers.closeTo = function(expected, delta) {
  if (!delta) {
    delta = 0;
  }

  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      return (Math.abs(actual - expected) - delta) <= 0;
    },

    describeTo: function(description) {
      description.append('number within ')
          .appendLiteral(delta).append(' of ').appendLiteral(expected);
    }
  });
};

/**
 * The actual number must be zero.
 */
JsHamcrest.Matchers.zero = function() {
  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      return actual === 0;
    },

    describeTo: function(description) {
      description.append('zero');
    }
  });
};

