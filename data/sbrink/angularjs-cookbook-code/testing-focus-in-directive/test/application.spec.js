describe('Focus Directive', function () {
  beforeEach(angular.mock.module('focusApp'));

  it('should focus the input field', inject(function ($rootScope, $compile, $document) {
    var scope = $rootScope.$new();
    var template = '<input type="text" autofocus />';
    var element = $compile(template)(scope);
    $document.find('body').append(element);
    scope.$apply();

    expect($document.activeElement).toBeUndefined();
    $document.find('input')[0].focus();
    expect($document.activeElement).toBe(element);
  }));

});