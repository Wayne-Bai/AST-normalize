angular.module('angular-article').directive('file', function(){
    return {
        restrict: 'E',
        templateUrl: 'templates/directive_templates/file_template.html',
        replace: true,
        scope: {
            text: '@',
            changeText: '@',
            deleteText: '@',
            name: '@'
        },
        link: function($scope, element, attrs){
            $scope.text = attrs.text;
            $scope.changeText = attrs.changeText;
            $scope.deleteText = attrs.deleteText;
            $scope.name = attrs.name;

            element.fileinput();
        }
    }

});
