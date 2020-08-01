describe('UsersOpportunitiesDetailCtrl', function(){

  var $httpBackend, SERVER_URL, scope;

  beforeEach(module('jobQuery'));

  beforeEach(inject(function($injector){

    var $rootScope = $injector.get('$rootScope');
    var $controller = $injector.get('$controller');
    var $stateParams = $injector.get('$stateParams');
    var UsersOpportunity = $injector.get('UsersOpportunity');
    $httpBackend = $injector.get('$httpBackend');
    scope = $rootScope.$new();
    SERVER_URL = $injector.get('SERVER_URL');

    createController = function(){
      return $controller('UsersOpportunitiesDetailCtrl', {
        $scope: scope,
        UsersOpportunity: UsersOpportunity,
        $stateParams: {_id: 1}
      });
    };

  }));

  it('should exist', function(){
    var controller = createController();
    expect(typeof controller).toBe('object');
  });

});