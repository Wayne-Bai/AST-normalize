angular.module('angular-article')
    .directive('alert', function () {
        return {
            restrict: 'E',
            templateUrl: 'templates/directive_templates/alert_template.html',
            replace: true,
            transclude: true,
            scope: {
                data: '='
            },
            link: function ($scope, element, attrs) {

                $scope.transcluded = element.find('div[ng-transclude]').contents();

                $scope.$watch('data', function(value){
                    $scope.alert = value;

                });

                $scope.close = function(){
                    $scope.alert.isShow = false;
                }
            }
        }
    });