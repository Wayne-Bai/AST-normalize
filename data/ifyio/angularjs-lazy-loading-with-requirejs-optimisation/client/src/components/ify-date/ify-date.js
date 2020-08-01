angular.module('ify.date').directive('ifyDate', function($filter)
{
    var definition =
    {
        scope:
        {
            ifyDate:'='
        },
        link:link
    }

    function link(scope, element, attrs)
    {
        scope.$watch('ifyDate', function(date)
        {
            element.html($filter('date')(date, attrs.format));
        })
    }

    return definition;
});
