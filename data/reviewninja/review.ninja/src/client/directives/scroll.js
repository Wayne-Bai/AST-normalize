'use strict';
// *****************************************************
// Graph Directive
// *****************************************************

module.directive('scroll', ['$location',
    function($location) {
        return function(scope, element, attr) {
            element.click(function(e) {
                e.preventDefault();
                $location.hash('');
                var dest = $('#' + attr.scroll.replace(/(:|\.|\[|\]|,)/g, '\\$1'));
                if(dest && dest.offset()) {
                    $location.hash(attr.scroll);
                    $('html,body').animate({ scrollTop: dest.offset().top }, 300);
                }
            });
        };
    }
]);
