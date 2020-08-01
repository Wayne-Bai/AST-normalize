angular.module('cookbookApp', [])
  .directive('blacklist', function ($parse) {
    return {
      require:'ngModel',
      link: function (scope, element, attrs, ngModelCtrl) {
        var badWords = $parse(attrs.blacklist)(scope) || [];
        ngModelCtrl.$parsers.push(function (value) {
          if (value) {
            var containsBadWord = badWords.some(function(str) {
              return value.indexOf(str) >= 0;
            });
            ngModelCtrl.$setValidity('blacklist', !containsBadWord);
          }
        });
      }
    };
  })
  .controller('MainController', function($scope) {
    $scope.blacklistValues = ['hello', 'bye'];
  });


