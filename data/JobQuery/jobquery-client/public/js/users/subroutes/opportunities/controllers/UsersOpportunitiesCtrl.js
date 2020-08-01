app.controller('UsersOpportunitiesCtrl',
  ['$scope', 'UsersOpportunity', '$state', 'GuidanceService',
  function ($scope, UsersOpportunity, $state, GuidanceService) {

  $scope.sorter = 'company.name';

  var formatOpportunities = function(opportunities, interest){
    var categories = {};
    for(var i = 0; i < opportunities.length; i++){
      var opportunity = opportunities[i];
      opportunity.interest = interest[opportunity._id];
      opportunity.match = GuidanceService.processTags(opportunity, $scope.user)[1];
      var catId = opportunity.category._id;
      if(!categories[catId]) categories[catId] = { info: opportunity.category, opportunities: [] };
      categories[catId].opportunities.push(opportunity);
    }
    return categories;
  };

  var formatMatches = function(matches){
    var interest = {};
    matches.forEach(function(match){
      interest[match.opportunity] = match.userInterest;
    });
    return interest;
  };

  UsersOpportunity.getAll().then(function (data) {
    $scope.user = data.user;

    var opportunities = data.opportunities;
    var matches = data.matches;
    var interest = formatMatches(matches);
    var categories = formatOpportunities(opportunities, interest);
    $scope.categories = categories;
  });

  $scope.goToDetail = function(opportunity){
    $state.go('users.opportunities.detail', { _id: opportunity._id });
  };

}]);
