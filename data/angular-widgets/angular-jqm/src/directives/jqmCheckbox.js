/**
 * @ngdoc directive
 * @name jqm.directive:jqmCheckbox
 * @restrict A
 *
 * @description 
 * Creates a jquery mobile checkbox on the given element.
 * 
 * Anything inside the `jqm-checkbox` tag will be a label.
 *
 * @param {string=} ngModel Assignable angular expression to data-bind to.
 * @param {string=} disabled Whether this checkbox is disabled.
 * @param {string=} mini Whether this checkbox is mini.
 * @param {string=} iconpos The position of the icon for this element. "left" or "right".
 * @param {string=} ngTrueValue The value to which the expression should be set when selected.
 * @param {string=} ngFalseValue The value to which the expression should be set when not selected.
 *
 * @example
<example module="jqm">
  <file name="index.html">
  <div jqm-checkbox ng-model="checky">
    My value is: {{checky}}
  </div>
  <div jqm-checkbox mini="true" iconpos="right" ng-model="isDisabled">
    I've got some options. Toggle me to disable the guy below.
  </div>
  <div jqm-checkbox disabled="{{isDisabled ? 'disabled' : ''}}" 
    ng-model="disably" ng-true-value="YES" ng-false-value="NO">
    I can be disabled! My value is: {{disably}}
  </div>
  </file>
</example>
 */
jqmModule.directive('jqmCheckbox', [function () {
  return {
    restrict: 'A',
    transclude: true,
    replace: true,
    templateUrl: 'templates/jqmCheckbox.html',
    scope: {
      disabled: '@',
      mini: '@',
      iconpos: '@'
    },
    require: ['?ngModel','^?jqmControlgroup'],
    link: function (scope, element, attr, ctrls) {
      var ngModelCtrl = ctrls[0],
        jqmControlGroupCtrl = ctrls[1];
      scope.toggleChecked = toggleChecked;
      scope.isMini = isMini;
      scope.getIconPos = getIconPos;
      scope.isActive = isActive;

      if (ngModelCtrl) {
        enableNgModelCollaboration();
      }

      function isMini() {
        return scope.mini || (jqmControlGroupCtrl && jqmControlGroupCtrl.$scope.mini);
      }

      function getIconPos() {
        return scope.iconpos || (jqmControlGroupCtrl && jqmControlGroupCtrl.$scope.iconpos);
      }

      function isActive() {
        return (jqmControlGroupCtrl && jqmControlGroupCtrl.$scope.type === "horizontal") && scope.checked;
      }

      function toggleChecked() {
        if (scope.disabled) {
          return;
        }
        scope.checked = !scope.checked;
        if (ngModelCtrl) {
          ngModelCtrl.$setViewValue(scope.checked);
        }
      }

      function enableNgModelCollaboration() {
        // For the following code, see checkboxInputType in angular's sources
        var trueValue = attr.ngTrueValue,
          falseValue = attr.ngFalseValue;

        if (!angular.isString(trueValue)) {
          trueValue = true;
        }
        if (!angular.isString(falseValue)) {
          falseValue = false;
        }

        ngModelCtrl.$render = function () {
          scope.checked = ngModelCtrl.$viewValue;
        };

        ngModelCtrl.$formatters.push(function (value) {
          return value === trueValue;
        });

        ngModelCtrl.$parsers.push(function (value) {
          return value ? trueValue : falseValue;
        });
      }

    }
  };
}]);
