function rxStatusCtrl ($scope, $rootScope, Status) {
    Status.setScope($scope);

    $scope.triggerRouteChangeSuccess = function () {
        $rootScope.$broadcast('$routeChangeSuccess');
    };

    $scope.clear = function () {
        Status.clear();
        $scope.notify = undefined;
    };

    $scope.setLoading = function (msg) {
        Status.clear();
        $scope.notify = Status.setLoading(msg);
    };

    $scope.setSuccess = function (msg) {
        Status.clear();
        $scope.notify = Status.setSuccess(msg);
    };

    $scope.setSuccessNext = function (msg) {
        Status.clear();
        $scope.notify = Status.setSuccessNext(msg);
    };

    $scope.setSuccessImmediate = function (msg) {
        Status.clear();
        $scope.notify = Status.setSuccessImmediate(msg);
    };

    $scope.setWarning = function (msg) {
        Status.clear();
        $scope.notify = Status.setWarning(msg);
    };

    $scope.setInfo = function (msg) {
        Status.clear();
        $scope.notify = Status.setInfo(msg);
    };

    $scope.setError = function (msg) {
        Status.clear();
        $scope.notify = Status.setError(msg);
    };

    $scope.dismiss = function () {
        $scope.notify && Status.dismiss($scope.notify);
        $scope.notify = undefined;
    };
}
