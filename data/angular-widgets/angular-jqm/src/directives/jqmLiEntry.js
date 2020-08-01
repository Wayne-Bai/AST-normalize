
/**
 * @ngdoc directive
 * @name jqm.directive:jqmLiEntry
 * @restrict A
 *
 * @description
 * Creates a jQuery mobile entry list item. This is just a plain entry, instead of a 
 * {@link jqm.directive:jqmLiLink jqmLiLink}.
 *
 * Must be inside of a {@link jqm.direcitve:jqmListview jqmListview}.
 */

/**
 * @ngdoc directive
 * @name jqm.directive:jqmLiDivider
 * @restrict A
 *
 * @description
 * Creates a jQuery mobile list divider.
 *
 * Must be inside of a {@link jqm.direcitve:jqmListview jqmListview}
 */
jqmModule.directive({
  jqmLiEntry: jqmLiEntryDirective(false),
  jqmLiDivider: jqmLiEntryDirective(true)
});
function jqmLiEntryDirective(isDivider) {
  return function() {
    return {
      restrict: 'A',
      replace: true,
      transclude: true,
      scope: {},
      templateUrl: 'templates/jqmLiEntry.html',
      link: function(scope) {
        scope.divider = isDivider;
      }
    };
  };
}
