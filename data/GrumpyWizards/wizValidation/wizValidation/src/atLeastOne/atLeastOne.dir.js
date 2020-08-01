angular.module('wiz.validation.atLeastOne')

	.directive('wizValAtLeastOne', ['wizAtLeastOneSvc', function (wizAtLeastOneSvc) {
		return {
			restrict: 'A',
			require: 'ngModel',
			link: function (scope, elem, attrs, ngModel) {

				//For DOM -> model validation
				ngModel.$parsers.unshift(function (value) {
					addValue(value);
					return value;
				});

				//For model -> DOM validation
				ngModel.$formatters.unshift(function (value) {
					addValue(value);
					return value;
				});

				function addValue(value) {
					wizAtLeastOneSvc.addValue({
						name: attrs.ngModel,
						group: attrs.wizValAtLeastOne,
						value: value
					});
				}

				function validate() {
					var valid = false;

					if (!wizAtLeastOneSvc.isEmpty(attrs.wizValAtLeastOne)) {
						valid = true;
					}

					ngModel.$setValidity('wizValAtLeastOne', valid);
				}

				scope.$watch(function () {
					return wizAtLeastOneSvc.values;
				}, function () {
					validate();
				}, true);

				scope.$on('$destroy', function () {
					wizAtLeastOneSvc.cleanup();
				});
			}
		};
	}]);
