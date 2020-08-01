'use strict';

angular.module('todoWebApp')
    .directive('ngEscape', function() {
        return function (scope, element, attrs) {
            element.bind('keydown keypress', function (event) {
                if(event.which === 27) {
                    scope.$apply(function() {
                        scope.$eval(attrs['ngEscape']); // Our directive will take a function as 'parameter'
                    });
                    event.preventDefault();
                }
            });
        };
    });