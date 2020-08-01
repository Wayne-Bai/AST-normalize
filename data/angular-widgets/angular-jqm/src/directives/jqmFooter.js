/**
 * @ngdoc directive
 * @name jqm.directive:jqmFooter
 * @restrict A
 *
 * @description
 * Defines the footer of a `jqm-page`. For a persistent footer, put the footer directly below `jqmView` / `jqmCachingView`.
 *
 * @example
 <example module="jqm">
 <file name="index.html">
 <div jqm-page class="jqm-standalone-page" style="height: 100px;">
   Hello world!
   <div jqm-footer>
   <h1>Footer of Page1</h1>
   </div>
 </div>
 </file>
 </example>
 */
jqmModule.directive('jqmFooter', ['jqmConfig', function (jqmConfig) {
  return {
    restrict: 'A',
    // Own scope as we have a different default theme
    // than the page.
    scope: true,
    controller: angular.noop,
    link: function (scope, element, attr) {
      element.parent().data('jqmFooter', element);
      var hasExplicitTheme = scope.hasOwnProperty('$theme');
      if (!hasExplicitTheme) {
        scope.$theme = jqmConfig.secondaryTheme;
      }
      element.addClass("ui-footer ui-bar-"+scope.$theme);
    }
  };
}]);
