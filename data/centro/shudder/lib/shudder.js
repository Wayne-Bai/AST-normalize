function loadAndBuildTestCase() {
  var TestCase = require("./shudder/test_case.js").TestCase;
  // nested classes
  TestCase.ShouldRunContext = require("./shudder/should_run_context.js").ShouldRunContext;
  TestCase.Assertions       = require("./shudder/assertions.js").Assertions;
  TestCase.Runner           = require("./shudder/runner.js").Runner;
  TestCase.Ersatz           = require("../vendor/ersatz-for-node/ersatz.js");
  
  // Mixin the assertions into the should run-context
  for (var assertion in TestCase.Assertions) {
    TestCase.ShouldRunContext.prototype[assertion] = TestCase.Assertions[assertion];
  }
  
  // Add Ersatz hook
  TestCase.ShouldRunContext.postShould = function() {
    TestCase.Ersatz.verifyExpectations(function(failureMessage) { 
      TestCase.Assertions.assert(false, failureMessage); 
    });
  };
  
  return TestCase;
}

exports.TestCase = loadAndBuildTestCase();