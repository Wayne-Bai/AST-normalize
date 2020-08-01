app.controller('AdminCompaniesCtrl', ['$scope', '$controller', 'Company', function ($scope, $controller, Company) {

  Company.getAll().then(function (companies) {
    $scope.companies = companies;
  });

}]);
