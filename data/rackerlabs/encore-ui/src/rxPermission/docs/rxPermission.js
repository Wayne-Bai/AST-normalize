function rxPermissionCtrl ($scope, Session, rxNotify) {
    rxNotify.add('Respect My Authority!!', {
        stack: 'permission',
        type: 'warning'
    });

    $scope.storeToken = function () {
        Session.storeToken({ access: { user: { roles: [{ name: 'test' } ] }}});
    }

    $scope.clearToken = function () {
        Session.logout();
    };
}
