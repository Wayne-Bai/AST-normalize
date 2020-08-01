/* jshint node: true */

describe('rxCompile', function () {
    var scope, compile, rootScope, el;
    var validTemplate = '<div rx-compile="myExpression"></div>';
    var world = 'wrrrld';
    var expression = 'Hello {{world}}';

    beforeEach(function () {
        // load module
        module('encore.ui.rxCompile');

        // Inject in angular constructs
        inject(function ($location, $rootScope, $compile) {
            rootScope = $rootScope;
            scope = $rootScope.$new();
            compile = $compile;
        });

        scope.world = world;
        scope.myExpression = expression;

        el = helpers.createDirective(validTemplate, compile, scope);
    });

    it('should compile expressions into values', function () {
        expect(el.text()).to.equal('Hello ' + world);
    });
});
