// ========== initialize documentation app module ========== //
angular.module('adaptv.adaptStrapDocs', [
  'ngSanitize',
  'adaptv.adaptStrap'
])

  .config(['$adConfigProvider', function ($adConfigProvider) {
    $adConfigProvider.paging.response = {
      totalItems: 'results.opensearch:totalResults',
      itemsLocation: 'results.data'
    };
  }])

// ========== documentation support controllers ========== //
  .controller('layoutCtrl', ['$scope', '$anchorScroll', '$location', 'adaptStrapModules',
    function ($scope, $anchorScroll, $location, adaptStrapModules) {
      $scope.modules = adaptStrapModules;

      $scope.scrollTo = function (id, $event) {
        $event.preventDefault();
        $location.hash(id);
        $anchorScroll();
      };
    }
  ])

// ========== documentation support directives ========== //
  .directive('markdown', function ($compile, $http) {
    var converter = new Showdown.converter();
    return {
      restrict: 'E',
      replace: true,
      link: function (scope, element, attrs) {
        function extractExamples(content) {
          var matchStartKey = '<!-- ad_example_start -->';
          function doMatch(regexp, content) {
            var match, matches = [];
            while ((match = regexp.exec(content)) !== null) {
              matches.push(match.index);
            }
            return matches;
          }
          var starts = doMatch(/<!-- ad_example_start -->/g, content);
          var ends = doMatch(/<!-- ad_example_end -->/g, content);
          var tempContent = '';
          if (starts.length === ends.length) {
            for (var i = 0; i < starts.length; i++) {
              tempContent += content.substring(starts[i] + matchStartKey.length, ends[i]);
            }
          }
          return (tempContent) ? tempContent : content;
        }

        function load() {
          if ('src' in attrs) {
            $http.get(attrs.src).then(function (data) {
              var format = attrs.src.split('.');
              if (format[format.length - 1] === 'js' || format[format.length - 1] === 'html' ||
                format[format.length - 1] === 'css') {
                if (format[format.length - 1] === 'html') {
                  data.data = '```\n' + extractExamples(data.data) + '\n```';
                } else {
                  data.data = '```\n' + data.data + '\n```';
                }

              }
              element.html(converter.makeHtml(data.data));
              element.find('pre code').each(function (i, block) {
                if (hljs) {
                  hljs.highlightBlock(block);
                }
              });
            });
          } else {
            element.html(converter.makeHtml(element.html()));
            element.find('pre code').each(function (i, block) {
              if (hljs) {
                hljs.highlightBlock(block);
              }
            });
          }
        }

        attrs.$observe('src', function () {
          load();
        });
      }
    };
  })
  .directive('codeNavigator', [function () {
    return {
      link: function (scope) {
        scope.currentFile = scope.files[0];
        scope.setCurrentFile = function (file) {
          scope.currentFile = file;
        };
      },
      restrict: 'E',
      scope: {
        files: '=',
        basePath: '@'
      },
      templateUrl: 'docs/codeNavigator.html'
    };
  }])
  .directive('componentOptions', [function () {
    return {
      link: function (scope) {
        scope.myHTML =
          'I am an <code>HTML</code>string with ' +
          '<a href="#">links!</a> and other <em>stuff</em>';
      },
      restrict: 'E',
      scope: {
        module: '='
      },
      templateUrl: 'docs/componentOptions.html'
    };
  }])
  .directive('adVersion', ['$http', function ($http) {
    return {
      restrict: 'E',
      template: '<p style="padding-left:10px; color: rgba(255,255,255,.5)">' +
        '<img src="//travis-ci.org/Adaptv/adapt-strap.svg"> | current v{{ version }}</p>' +
        '<p style="padding-left:10px;"><a href="https://codeclimate.com/github/Adaptv/adapt-strap">' +
        '<img src="https://codeclimate.com/github/Adaptv/adapt-strap/badges/coverage.svg" /></a></p>' +
        '<p style="padding-left:10px;"><a href="https://codeclimate.com/github/Adaptv/adapt-strap">' +
        '<img src="https://codeclimate.com/github/Adaptv/adapt-strap/badges/gpa.svg" /></a></p>',
      link: function (scope) {
        $http.get('bower.json').success(function (response) {
          scope.version = response.version;
        });
      }
    };
  }]);
