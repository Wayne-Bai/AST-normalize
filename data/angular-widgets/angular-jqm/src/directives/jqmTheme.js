/**
 * @ngdoc directive
 * @name jqm.directive:jqmTheme
 * @restrict A
 *
 * @description
 * Sets the jqm theme for this element and it's children by adding a `$theme` property to the scope.
 * Other directives like `jqmCheckbox` evaluate that property.
 *
 * @example
 <example module="jqm">
 <file name="index.html">
 <div>
   <div jqm-checkbox jqm-theme="a">Theme a</div>
   <div jqm-checkbox jqm-theme="b">Theme b</div>
 </div>
 </file>
 </example>
 */
jqmModule.directive('jqmTheme', [function () {
  return {
    restrict: 'A',
    // Need an own scope so we can distinguish between the parent and the child scope!
    scope: true,
    compile: function compile() {
      return {
        pre: function preLink(scope, iElement, iAttrs) {
          // Set the theme before all other link functions of children
          var theme = iAttrs.jqmTheme;
          if (theme) {
            scope.$theme = theme;
          }
        }
      };
    }
  };
}]);
