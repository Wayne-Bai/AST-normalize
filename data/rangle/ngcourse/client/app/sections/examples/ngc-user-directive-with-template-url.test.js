'use strict';

var expect = chai.expect;

describe('ngcUser directive', function () {
  beforeEach(module(
    'app/sections/examples/ngc-user-directive-with-template-url.html'));
  beforeEach(module('ngcourse-example-directives'));

  var compile;
  var rootScope;

  beforeEach(inject(function ($compile, $rootScope, $templateCache) {
    compile = $compile;
    rootScope = $rootScope;
  }));

  it('generates the appropriate HTML', function () {
    var scope = rootScope.$new();
    scope.userDisplayName = 'Alice';

    var element = compile(
      '<ngc-user-with-template-url user-display-name="userDisplayName"></ngc-user-with-template-url>'
    )(scope);
    scope.$digest();

    expect(element.html()).to.contain('Hello, Alice.');
    expect(element.html()).to.contain('external-template');
  });
});