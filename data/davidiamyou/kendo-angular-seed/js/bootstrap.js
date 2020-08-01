define([ "jquery", "angular", "angular-kendo-ui", 'app', 'routes'], function($, angular, app){
    $(document).ready(function(){
        angular.bootstrap(document, [ "app" ]);
    });
});
