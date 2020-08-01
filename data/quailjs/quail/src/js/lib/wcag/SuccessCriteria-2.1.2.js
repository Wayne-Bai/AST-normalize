/**
 * Success Criterion 2.1.2: No keyboard trap
 *
 * @see http://www.w3.org/TR/UNDERSTANDING-WCAG20/keyboard-operation-trapping.html
 */
quail.guidelines.wcag.successCriteria['2.1.2'] = (function (quail) {
  /**
   * Determines if this Success Criteria applies to the document.
   */
  function preEvaluator () {
    return true;
  }

  // Create a new SuccessCriteria and pass it the evaluation callbacks.
  var sc = quail.lib.SuccessCriteria({
    name: 'wcag:2.1.2',
    preEvaluator: preEvaluator
  });

  // Techniques
  sc.techniques = {};

  // Failures
  sc.failures = {};

  return sc;
}(quail));
