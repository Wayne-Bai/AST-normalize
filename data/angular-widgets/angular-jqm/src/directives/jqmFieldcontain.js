/**
 * @ngdoc directive
 * @name jqm.directive:jqmFieldcontain
 * @restrict A
 *
 * @description
 * Used to wrap a label/form element pair.
 *
 * @example
 <example module="jqm">
 <file name="index.html">
  <div jqm-fieldcontain>
    <label for="name">Your Name:</label>
    <div jqm-textinput ng-model="name" />
  </div>
 </file>
 </example>
 */
jqmModule.directive('jqmFieldcontain', function() {
  return {
    restrict: 'A',
    compile: function(elm, attr) {
      elm[0].className += ' ui-field-contain ui-body ui-br';
    }
  };
});
