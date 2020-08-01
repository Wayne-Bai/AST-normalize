/**
 * @ngdoc directive
 * @name jqm.directive:jqmPanel
 * @restrict A
 *
 * @description
 * Creates a jquery mobile panel.  Must be placed inside of a jqm-panel-container.
 *
 * @param {expression=} opened Assignable angular expression to data-bind the panel's open state to.
 * @param {string=} display Default 'reveal'.  What display type the panel has. Available: 'reveal', 'overlay', 'push'.
 * @param {string=} position Default 'left'. What position the panel is in. Available: 'left', 'right'.
 *
 * @require jqmPanelContainer.
 */
jqmModule.directive('jqmPanel', function() {
  var isDef = angular.isDefined;
  return {
    restrict: 'A',
    require: '^jqmPanelContainer',
    replace: true,
    transclude: true,
    templateUrl: 'templates/jqmPanel.html',
    // marker controller.
    controller: angular.noop,
    scope: {
      display: '@',
      position: '@'
    },
    compile: function(element, attr) {
      attr.display = isDef(attr.display) ? attr.display : 'reveal';
      attr.position = isDef(attr.position) ? attr.position : 'left';

      return function(scope, element, attr, jqmPanelContainerCtrl) {
        if (scope.position !== 'left' && scope.position !== 'right') {
          throw new Error("jqm-panel position is invalid. Expected 'left' or 'right', got '"+scope.position+"'");
        }
        jqmPanelContainerCtrl.addPanel({
          scope: scope,
          element: element
        });
      };
    }
  };
});
