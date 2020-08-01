angular.module('wiz.validation.whitelist')

	.directive('wizValWhitelist', function () {
		return {
			restrict: 'A',
			require: 'ngModel',
			scope: { whitelist: '=wizValWhitelist' },
			link: function (scope, elem, attrs, ngModel) {

				//For DOM -> model validation
				ngModel.$parsers.unshift(function (value) {
					return validate(value);
				});

				//For model -> DOM validation
				ngModel.$formatters.unshift(function (value) {
					return validate(value);
				});

				function validate(value) {
					var valid = false;
					if (typeof value === "undefined") {
						value = "";
					}

					if (typeof scope.whitelist !== "undefined") {
						for (var i = scope.whitelist.length - 1; i >= 0; i--) {
							if (value === scope.whitelist[i]) {
								valid = true;
								break;
							}
						}
					}
					ngModel.$setValidity('wizValWhitelist', valid);
					return value;
				}
			}
		};
	});
