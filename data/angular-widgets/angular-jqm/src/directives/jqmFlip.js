/**
 * @ngdoc directive
 * @name jqm.directive:jqmFlip
 * @restrict A
 *
 * @description
 * Creates a jquery mobile flip switch on the given element.
 *
 * Anything inside the `jqm-flip` tag will be a label.
 *
 * Labels for the on and off state can be omitted.
 * If no values for the on and off state are specified on will be bound to true and off to false.
 *
 * A theme can be set with the jqm-theme directive and specific styles can be set with the ng-style parameter.
 * This is necessary to extend the width of the flip for long labels.
 *
 * @param {expression=} ngModel Assignable angular expression to data-bind to.
 * @param {string=} disabled Whether this flip switch is disabled.
 * @param {string=} mini Whether this flip should be displayed minified.
 * @param {string=} ngOnLabel The label which should be shown when fliped on (optional).
 * @param {string=} ngOnValue The value to which the expression should be set when fliped on (optional, default: true).
 * @param {string=} ngOffLabel The label which should be shown when fliped off (optional).
 * @param {string=} ngOffValue The value to which the expression should be set when fliped off (optional, default:false).
 *
 * @example
<example module="jqm">
  <file name="index.html">
   <p>Selected value is: {{flip}}</p>
   <div jqm-flip ng-model="flip">
   Default values true/false
   </div>
   <div jqm-flip ng-model="flip" jqm-theme="e">
   With theme
   </div>
   <div jqm-flip ng-model="flip2" on-label="On" on-value="On" off-label="Off" off-value="Off">
   My value is {{flip2}}
   </div>
  </file>
</example>
 */
jqmModule.directive('jqmFlip', [function () {
  return {
    restrict: 'A',
    transclude: true,
    replace: true,
    templateUrl: 'templates/jqmFlip.html',
    scope: {
      onLabel: '@',
      onValue: '@',
      offLabel: '@',
      offValue: '@',
      mini: '@',
      disabled: '@'
    },
    require: ['?ngModel', '^?jqmControlgroup'],
    link: function (scope, element, attr, ctrls) {
      var ngModelCtrl = ctrls[0];
      var jqmControlGroupCtrl = ctrls[1];
      var parsedOn;
      var parsedOff;

      scope.theme = scope.$theme || 'c';
      scope.isMini = isMini;
      scope.onValue = angular.isDefined(attr.onValue) ? scope.onValue : true;
      scope.offValue = angular.isDefined(attr.offValue) ? scope.offValue : false;

      initToggleState();
      bindClick();

      function initToggleState () {
        ngModelCtrl.$parsers.push(parseBoolean);
        parsedOn = parseBoolean(scope.onValue);
        parsedOff = parseBoolean(scope.offValue);
        ngModelCtrl.$render = updateToggleStyle;
        ngModelCtrl.$viewChangeListeners.push(updateToggleStyle);
      }

      function updateToggleStyle () {
        updateNaNAsOffValue();
        var toggled = isToggled();
        scope.toggleLabel = toggled ? scope.onLabel : scope.offLabel;
        scope.onStyle = toggled ? 100 : 0;
        scope.offStyle = toggled ? 0 : 100;
      }

      // this has to be done in the change listener,
      // otherwise the potential scope value would be overwritten with the off value
      function updateNaNAsOffValue () {
        if (!ngModelCtrl.$viewValue) {
          ngModelCtrl.$setViewValue(parsedOff);
        }
      }

      function bindClick () {
        scope.toggle = function () {
          ngModelCtrl.$setViewValue(isToggled() ? parsedOff : parsedOn);
        };
      }

      function isToggled () {
        return ngModelCtrl.$viewValue === parsedOn;
      }

      function isMini() {
        return scope.mini || (jqmControlGroupCtrl && jqmControlGroupCtrl.$scope.mini);
      }

      function parseBoolean(value) {
        if (value === 'true') {
          return true;
        } else if (value === 'false') {
          return false;
        }
        return value;
      }
    }
  };
}]);
