angular.module('angular-article').directive('spinner', function () {
    return {
        restrict: 'E',
        templateUrl: 'templates/directive_templates/spinner_template.html',
        replace: true,
        scope: {
            value: '='
        },
        link: function ($scope, element, attrs) {

            $scope.$watch('value', function (value) {
                $scope.value = value;
            });

            element.on("spin", function (event, ui) {
                $scope.$apply(function () {
                    $scope.value = ui.value;
                })
            });

            element.on("change", function (event, ui) {
                var m = element.spinner('value');
                $scope.$apply(function () {
                    $scope.value = m;
                })
            });

            element.spinner();
        }
    }

});
