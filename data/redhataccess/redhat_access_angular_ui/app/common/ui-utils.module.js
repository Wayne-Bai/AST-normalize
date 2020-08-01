'use strict';
/*jshint unused:vars */
var app = angular.module('RedhatAccess.ui-utils', ['gettext']);
//this is an example controller to provide tree data
// app.controller('TreeViewSelectorCtrl', ['$scope', 'TreeViewSelectorData',
//     function($scope, TreeViewSelectorData) {
//         $scope.name = 'Attachments';
//         $scope.attachmentTree = [];
//         TreeViewSelectorData.getTree('attachments').then(
//             function(tree) {
//                 $scope.attachmentTree = tree;
//             },
//             function() {
//             });
//     }
// ]);
app.service('RHAUtils', function () {
    /**
     * Generic function to decide if a simple object should be considered nothing
     */
    this.isEmpty = function (object) {
        if (object === undefined || object === null || object === '' || object.length === 0 || object === {}) {
            return true;
        }
        return false;
    };
    this.isNotEmpty = function (object) {
        return !this.isEmpty(object);
    };
    this.isEmailValid = function (object) {
        var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (object.match(mailformat)) {
            return true;
        } else {
            return false;
        }
    };
});
//Wrapper service for translations
app.service('translate', [
    'gettextCatalog',
    function (gettextCatalog) {
        return function (str) {
            return gettextCatalog.getString(str);
        };
    }
]);
app.filter('trust_html', ['$sce', function($sce){
    return function(text) {
        return $sce.trustAsHtml(text);
    };
}]);
app.directive('rhaChoicetree', function () {
    return {
        template: '<ul><div rha-choice ng-repeat="choice in tree"></div></ul>',
        replace: true,
        transclude: true,
        restrict: 'A',
        scope: {
            tree: '=ngModel',
            rhaDisabled: '='
        }
    };
});
app.directive('optionsDisabled', function($parse) {
    var disableOptions = function(scope, attr, element, data, fnDisableIfTrue) {
        // refresh the disabled options in the select element.
        $('option[value!="?"]', element).each(function(i, e) {
            var locals = {};
            locals[attr] = data[i];
            $(this).attr('disabled', fnDisableIfTrue(scope, locals));
        });
    };
    return {
        priority: 0,
        link: function(scope, element, attrs, ctrl) {
            // parse expression and build array of disabled options
            var expElements = attrs.optionsDisabled.match(/^\s*(.+)\s+for\s+(.+)\s+in\s+(.+)?\s*/);
            var fnDisableIfTrue = $parse(expElements[1]);
            var options = expElements[3];
            scope.$watch(options, function(newValue, oldValue) {
                if(newValue) {
                    disableOptions(scope, expElements[2], element, newValue, fnDisableIfTrue);
                }
            }, true);
        }
    };
});
app.directive('rhaChoice', function ($compile) {
    return {
        restrict: 'A',
        templateUrl: 'common/views/treenode.html',
        link: function (scope, elm) {
            scope.choiceClicked = function (choice) {
                choice.checked = !choice.checked;
                function checkChildren(c) {
                    angular.forEach(c.children, function (c) {
                        c.checked = choice.checked;
                        checkChildren(c);
                    });
                }
                checkChildren(choice);
            };
            if (scope.choice.children.length > 0) {
                var childChoice = $compile('<div rha-choicetree ng-show="!choice.collapsed" ng-model="choice.children"></div>')(scope);
                elm.append(childChoice);
            }
        }
    };
});
app.factory('TreeViewSelectorData', [
    '$http',
    '$q',
    'TreeViewSelectorUtils',
    function ($http, $q, TreeViewSelectorUtils) {
        var service = {
                getTree: function (dataUrl, sessionId) {
                    var defer = $q.defer();
                    var tmpUrl = dataUrl;
                    if (sessionId) {
                        tmpUrl = tmpUrl + '?sessionId=' + encodeURIComponent(sessionId);
                    }
                    $http({
                        method: 'GET',
                        url: tmpUrl
                    }).success(function (data, status, headers, config) {
                        var tree = [];
                        TreeViewSelectorUtils.parseTreeList(tree, data);
                        defer.resolve(tree);
                    }).error(function (data, status, headers, config) {
                        defer.reject({});
                    });
                    return defer.promise;
                }
            };
        return service;
    }
]);
app.factory('TreeViewSelectorUtils', function () {
    var parseTreeNode = function (splitPath, tree, fullFilePath) {
        if (splitPath[0] !== undefined) {
            if (splitPath[0] !== '') {
                var node = splitPath[0];
                var match = false;
                var index = 0;
                for (var i = 0; i < tree.length; i++) {
                    if (tree[i].name === node) {
                        match = true;
                        index = i;
                        break;
                    }
                }
                if (!match) {
                    var nodeObj = {};
                    nodeObj.checked = isLeafChecked(node);
                    nodeObj.name = removeParams(node);
                    if (splitPath.length === 1) {
                        nodeObj.fullPath = removeParams(fullFilePath);
                    }
                    nodeObj.children = [];
                    tree.push(nodeObj);
                    index = tree.length - 1;
                }
                splitPath.shift();
                parseTreeNode(splitPath, tree[index].children, fullFilePath);
            } else {
                splitPath.shift();
                parseTreeNode(splitPath, tree, fullFilePath);
            }
        }
    };
    var removeParams = function (path) {
        if (path) {
            var split = path.split('?');
            return split[0];
        }
        return path;
    };
    var isLeafChecked = function (path) {
        if (path) {
            var split = path.split('?');
            if (split[1]) {
                var params = split[1].split('&');
                for (var i = 0; i < params.length; i++) {
                    if (params[i].indexOf('checked=true') !== -1) {
                        return true;
                    }
                }
            }
        }
        return false;
    };
    var hasSelectedLeaves = function (tree) {
        for (var i = 0; i < tree.length; i++) {
            if (tree[i] !== undefined) {
                if (tree[i].children.length === 0) {
                    //we only check leaf nodes
                    if (tree[i].checked === true) {
                        return true;
                    }
                } else {
                    if (hasSelectedLeaves(tree[i].children)) {
                        return true;
                    }
                }
            }
        }
        return false;
    };
    var getSelectedNames = function (tree, container) {
        for (var i = 0; i < tree.length; i++) {
            if (tree[i] !== undefined) {
                if (tree[i].children.length === 0) {
                    if (tree[i].checked === true) {
                        container.push(tree[i].fullPath);
                    }
                } else {
                    getSelectedNames(tree[i].children, container);
                }
            }
        }
    };
    var service = {
            parseTreeList: function (tree, data) {
                var files = data.split('\n');
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    var splitPath = file.split('/');
                    parseTreeNode(splitPath, tree, file);
                }
            },
            hasSelections: function (tree) {
                return hasSelectedLeaves(tree);
            },
            getSelectedLeaves: function (tree) {
                if (tree === undefined) {
                    return [];
                }
                var container = [];
                getSelectedNames(tree, container);
                return container;
            }
        };
    return service;
});
app.directive('rhaResizable', [
    '$window',
    '$timeout',
    function ($window) {
        var link = function (scope, element, attrs) {
            scope.onResizeFunction = function () {
                var distanceToTop = element[0].getBoundingClientRect().top;
                var height = $window.innerHeight - distanceToTop;
                element.css('height', height);
            };
            angular.element($window).bind('resize', function () {
                scope.onResizeFunction();    //scope.$apply();
            });
            angular.element($window).bind('click', function () {
                scope.onResizeFunction();    //scope.$apply();
            });
            if (attrs.rhaDomReady !== undefined) {
                scope.$watch('rhaDomReady', function (newValue) {
                    if (newValue) {
                        scope.onResizeFunction();
                    }
                });
            } else {
                scope.onResizeFunction();
            }
        };
        return {
            restrict: 'A',
            scope: { rhaDomReady: '=' },
            link: link
        };
    }
]);
