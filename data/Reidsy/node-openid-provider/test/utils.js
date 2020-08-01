var assert = require('assert');
var utils = require('../lib/Utils.js');

suite("Utilities Tests", function() {

  test("Test addOpenIDNamespace", function() {
    var incoming = {
      first: "one",
      second: "two",
      third: "three"
    };
    var outgoing = {
      "openid.first": "one",
      "openid.second": "two",
      "openid.third": "three"
    };
    var result = utils.addOpenIDNamespace(incoming);
    assert.deepEqual(result, outgoing);
  });

  test("Test getOpenIDFields", function() {
    var incoming = {
      "openid.first": "one",
      "openid.second": "two",
      "openid.third": "three",
      "fourth": "four",
      "fifth": "five"
    };
    var outgoing = {
      "first": "one",
      "second": "two",
      "third": "three"
    };
    var result = utils.getOpenIDFields(incoming);
    assert.deepEqual(result, outgoing);
  });

});
