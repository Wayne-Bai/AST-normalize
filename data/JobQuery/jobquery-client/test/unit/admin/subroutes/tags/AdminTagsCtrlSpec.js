describe('AdminTagsCtrl', function(){

  var $httpBackend, scope, SERVER_URL;

  beforeEach(module('jobQuery'));

  beforeEach(inject(function($injector){

    var $rootScope = $injector.get('$rootScope');
    var $controller = $injector.get('$controller');
    $httpBackend = $injector.get('$httpBackend');
    scope = $rootScope.$new();
    SERVER_URL = $injector.get('SERVER_URL');

    createController = function(){
      return $controller('AdminTagsCtrl', {$scope: scope});
    };

  }));

  it('should exist', function(){
    var controller = createController();
    expect(typeof controller).toBe('object');
  });

  it('should make a GET request for all tags', function(){
    $httpBackend.expectGET(SERVER_URL + '/api/tags').respond([{},{}]);
    createController();
    $httpBackend.flush();
  });

  it('should add an empty tag when you click add new', function(){
    $httpBackend.expectGET(SERVER_URL + '/api/tags').respond([]);
    createController();
    $httpBackend.flush();
    scope.add();
    expect(scope.tags.length).toBe(1);
  });

  it('should handle removing tags which are only on the client side', function(){
    $httpBackend.expectGET(SERVER_URL + '/api/tags').respond([]);
    createController();
    $httpBackend.flush();
    scope.add();
    expect(scope.tags.length).toBe(1);
    scope.remove(0);
    expect(scope.tags.length).toBe(0);
  });

  it('should send a POST request when saving a tag without an _id', function(){
    $httpBackend.expectGET(SERVER_URL + '/api/tags').respond([]);
    createController();
    $httpBackend.flush();

    $httpBackend.expectPOST(SERVER_URL + '/api/tags').respond({});
    scope.save({});
    $httpBackend.flush();
  });

  it('should send a PUT request when saving a tag with an _id', function(){
    $httpBackend.expectGET(SERVER_URL + '/api/tags').respond([]);
    createController();
    $httpBackend.flush();
    
    $httpBackend.expectPUT(SERVER_URL + '/api/tags/1').respond({});
    scope.save({_id: 1});
    $httpBackend.flush();
  });

});