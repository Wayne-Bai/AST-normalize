/**
 * @ngdoc directive
 * @name jqm.directive:jqmTextarea
 * @restrict A
 *
 * @description
 * Creates an jquery mobile textarea on the given elemen.
 *
 * @param {string} ngModel Assignable angular expression to data-bind to.
 * @param {string=} disabled Whether this input is disabled.
 *
 * @example
 <example module="jqm">
 <file name="index.html">
 Textarea with ng-model:
 <div ng-model="model" jqm-textarea></div>

 Value: {{model}}
 <p/>
 Textarea disabled:
 <div data-disabled="disabled" jqm-textarea>Hello World</div>
 <p/>
 </file>
 </example>
 */
jqmModule.directive('jqmTextarea', ['textareaDirective', function (textareaDirective) {
  return {
    templateUrl: 'templates/jqmTextarea.html',
    replace: true,
    restrict: 'A',
    require: '?ngModel',
    scope: {
      disabled: '@'
    },
    link: function (scope, element, attr, ngModelCtrl) {
      var textarea = angular.element(element[0]);

      linkInput();

      function linkInput() {
        textarea.bind('focus', function () {
          element.addClass('ui-focus');
        });
        textarea.bind('blur', function () {
          element.removeClass('ui-focus');
        });

        angular.forEach(textareaDirective, function (directive) {
          directive.link(scope, textarea, attr, ngModelCtrl);
        });
        return textarea;
      }
    }
  };
}]);
