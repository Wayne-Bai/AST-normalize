angular.module('angular-article').directive('radiobutton', function () {
    return {
        restrict: 'E',
        templateUrl: 'templates/directive_templates/radiobutton_template.html',
        replace: true,
        scope: {
            value: '@',
            id: '@',
            name: '@',
            text: '@',
            checked: '='
        },
        link: function ($scope, element, attrs) {
            $scope.value = attrs.value;
            $scope.id = attrs.id;
            $scope.text = attrs.text;
            $scope.name = attrs.name;

            $scope.$watch('checked', function (value) {
                if (value)
                {
                    $scope.checked = value;
                }

                else $scope.checked = false;
            });

            element.children().on('toggle', function (val) {
                console.log(val);
                $scope.$apply(function(){
                    $scope.checked = !$scope.checked;
                });

            });

            element.children().radio();
        }
    }
});