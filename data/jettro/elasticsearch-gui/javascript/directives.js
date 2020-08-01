'use strict';

/* Directives */


angular.module('myApp.directives', []).
        directive('appVersion', ['version', function (version) {
            return function (scope, elm, attrs) {
                elm.text(version);
            };
        }]).
        directive('navbar', ['$location', function ($location) {
            return {
                restrict: 'E',
                transclude: true,
                scope: {heading: '@'},
                controller: 'NavbarCtrl',
                templateUrl: 'template/navbar/navbar.html',
                replace: true,
                link: function ($scope, $element, $attrs, navbarCtrl) {
                    $scope.$location = $location;
                    $scope.$watch('$location.path()', function (locationPath) {
                        navbarCtrl.selectByUrl(locationPath)
                    });
                }
            }
        }]).
        directive('navbaritem', [function () {
            return {
                require:'^navbar',
                restrict: 'E',
                templateUrl: 'template/navbar/navbaritem.html',
                replace: true,
                scope:{"theLink":"@link","theTitle":"@title"},
                link: function ($scope, $element, $attrs, navbarCtrl) {
                    $scope.item={"title": $attrs['title'], "link": $attrs['link'], "selected": false};
                    navbarCtrl.addItem($scope.item);
                }
            }
        }]).
        directive('navbardropdownitem', [function () {
            return {
                require:'^navbar',
                restrict: 'E',
                scope:{"theLink":"@link","theTitle":"@title"},
                templateUrl: 'template/navbar/navbardropdownitem.html',
                replace: true,
                link: function ($scope, $element, $attrs, navbarCtrl) {
//                    $scope.item={"title": $attrs['title'], "link": $attrs['link'], "selected": false};
//                    navbarCtrl.addItem($scope.item);
                }
            }
        }]).
        directive('navbardropdown', [function () {
            return {
                require:'^navbar',
                restrict: 'E',
                transclude: true,
                scope:{"theTitle":"@title","theLink":"@link"},
                templateUrl: 'template/navbar/navbardropdown.html',
                replace: true,
                link: function ($scope, $element, $attrs, navbarCtrl) {
                    $scope.item={"title": $scope.theTitle, "link": $scope.theLink, "selected": false};
                    navbarCtrl.addItem($scope.item);
                }
            }
        }]).
        directive('ngConfirmClick', [
            function () {
                return {
                    link: function (scope, element, attr) {
                        var msg = attr.ngConfirmClick || "Are you sure?";
                        var clickAction = attr.confirmedClick;
                        element.bind('click', function (event) {
                            if (window.confirm(msg)) {
                                scope.$eval(clickAction)
                            }
                        });
                    }
                }
            }
        ]);

