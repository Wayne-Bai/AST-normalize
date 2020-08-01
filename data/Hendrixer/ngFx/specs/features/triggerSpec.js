describe('Trigger feature', function(){
  var scope,
      element;
  beforeEach(module('fx.animations.assist'));

  it('should return a new animation instance', function(){
    inject(function($rootScope, $compile, Assist){

      element = $compile('<div class="fx-trigger">trigger</div>')($rootScope);
      $rootScope.$digest();
       spyOn($rootScope, '$broadcast');
      Assist.emit(element, 'fade-normal', 'enter');
      check($rootScope.$broadcast).toHaveBeenCalledWith('fade-normal:enter');
    });
  });
});
