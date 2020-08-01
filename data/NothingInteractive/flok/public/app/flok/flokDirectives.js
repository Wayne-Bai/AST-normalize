/**
 * Flok directives
 * @copyright  Nothing Interactive 2015
 * @author     Patrick Fiaux <nodz@nothing.ch>
 */
angular.module('flokDirectives', []);

angular.module('flokDirectives').directive('niFocusOn', ['$timeout', function($timeout) {
    'use strict';

    /**
     * Directive for input elements, triggers focus
     * on or off (focusOn/blurOn) based on an expression. These were renamed to not conflict with the core
     * ngFocus and ngBlur
     * See http://stackoverflow.com/questions/14859266/input-autofocus-attribute
     *
     * @example
     * <input ni-focus-on="someScopeVariable" type="text" />
     *
     * @module flokDirectives/niFocusOn
     */
    return {
        link: function($scope, $element, attrs) {
            /*
             * Watch for the expression value to change
             */
            $scope.$watch(attrs.niFocusOn, function(val) {
                if (angular.isDefined(val) && val) {
                    $timeout(function() {
                        $element[0].focus();
                    });
                }
            }, true);

            /*
             * blurs the element base on other expression
             */
            $element.bind('blur', function() {
                if (angular.isDefined(attrs.blurOn)) {
                    $scope.$apply(attrs.blurOn);
                }
            });
        }
    };
}]);
