var userOpportunities = opportunities.slice();

userOpportunities = userOpportunities.map(function(opportunity){
  opportunity.match = {
    interest: 0,
    answers: []
  }
  return opportunity;
});