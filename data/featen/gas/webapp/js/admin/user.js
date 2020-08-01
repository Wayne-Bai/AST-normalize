user = angular.module('user')

user.factory("User", ['$http', 'Alerts', function($http, Alerts) {
        /*this.data = {
			user: null,
			authenticated: false,
                    };
	*/
    this.get = function(call) {
        var promise = $http.get("/service/user/");
        
        Alerts.handle(promise, undefined, undefined, call);
    };
    
    this.signin = function(data, scall, ecall) {
        var promise = $http.post("/service/user/signin", data);
        var error = {
            type: "error",
            strong: "Failed!",
            message: "Could not sign in. Try again in a few minutes."
        };
        var success = {
            type: "success",
            strong: "Success!",
            message: "Sign in success."
        };
        Alerts.handle(promise, error, success, scall, ecall);

        return promise;
    };

    this.signout = function( scall, ecall) {
    	var promise = $http.get("/service/user/signout");
        var error = {
                type: "error",
                strong: "Failed!",
                message: "Could not signout."
            };
            var success = {
                type: "success",
                strong: "Success!",
                message: "Sign out success."
            };
            Alerts.handle(promise, error, success, scall, ecall);

        return promise;
    };
    
    return this;
}]);

user.controller('UsersCtrl', ['$scope', '$routeParams', '$route', '$location', 'Global', 'User', 'Alerts', function($scope, $routeParams, $route, $location, Global, User, Alerts) {
        $scope.global = Global;
        $scope.data = {email: '', password: ''};

        $scope.getCurrUser = function() {
            User.get(function(u) {
                Global.user = u;
                Global.authenticated = true;
            });
        };


        $scope.checkauth = function() {
            if (!Global.authenticated) {
                $location.path('/signin');
            }
        };

        $scope.signin = function() {
            User.signin({"NameOrEmail": $scope.data.email, "Passwd": $scope.data.password}, function(u) {
                Global.user = u;
                Global.authenticated = true;
                $location.path('/');
            });
        };
        $scope.signout = function() {
            User.signout(function() {
                Global.user = null;
                Global.authenticated = false;
                $location.path('/signin');
            });
        };
    }]);
