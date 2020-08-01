define(['app'], function(app)
{
    app.controller('ContactViewController',
    [
        '$scope',

        function($scope)
        {
            $scope.page =
            {
                heading: 'Contact Us'
            };
        }
    ]);
});