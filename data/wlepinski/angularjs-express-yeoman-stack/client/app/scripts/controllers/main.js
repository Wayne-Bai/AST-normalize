'use strict';

angular.module('clientApp')
  .controller('MainCtrl', function ($scope) {
    $scope.technologies = [
      { label: 'HTML5 Boilerplate', url: 'http://html5boilerplate.com/' },
      { label: 'AngularJS', url: 'http://angularjs.org' },
      { label: 'Karma', url: 'http://karma-runner.github.io/0.8/index.html' }
    ];
  });
