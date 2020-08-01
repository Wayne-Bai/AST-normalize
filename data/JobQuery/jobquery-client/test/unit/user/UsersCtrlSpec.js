describe('UsersCtrl', function(){

  beforeEach(module('jobQuery'));

  beforeEach(inject(function($injector){

    var $rootScope = $injector.get('$rootScope');
    var $controller = $injector.get('$controller');

    createController = function(){
      return $controller('UsersCtrl', {$scope: $rootScope.$new()});
    };

  }));

  it('should exist', function(){
    var controller = createController();
    expect(typeof controller).toBe('object');
  });

});