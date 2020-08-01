angular.module('angular-article').directive('slider', function () {
    return {
        restrict: 'E',
        templateUrl: 'templates/directive_templates/slider_template.html',
        replace: true,
        scope: {
            value: '=',
            min: '@',
            max: '@',
            orientation: '@',
            range: '@'
        },
        link: function ($scope, element, attrs) {
            $scope.min = attrs.min;
            $scope.max = attrs.max;
            $scope.orientation = attrs.orientation;
            $scope.range = attrs.range;
            $scope.text = attrs.text;
            $scope.value = attrs.value;

            $scope.$watch('value', function (value){
                $scope.value = value;
            });

            element.on("slide", function (event, ui) {
                $scope.$apply(function () {
                    $scope.value = ui.value;
                })
            });


            element.slider({
                min: $scope.min,
                max: $scope.max,
                value: 0,
                orientation: $scope.orientation,
                range: $scope.range
            });
        }
    }
});
