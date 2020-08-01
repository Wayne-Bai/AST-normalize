/* jshint node: true */

describe('rxSpinner', function () {
    var scope, compile, rootScope, el;
    var validTemplate = '<div rx-spinner toggle="toggle"></div>';
    var darkTemplate = '<div rx-spinner="dark" toggle="toggle"></div>';

    beforeEach(function () {
        // load module
        module('encore.ui.rxSpinner');

        // Inject in angular constructs
        inject(function ($location, $rootScope, $compile) {
            rootScope = $rootScope;
            scope = $rootScope.$new();
            compile = $compile;
        });
    });

    it('should add spinner div to element', function () {
        el = helpers.createDirective(validTemplate, compile, scope);
        scope.$digest();

        var domEl = el[0];
        // should not have spinner by default
        expect(domEl.querySelector('.rx-spinner')).to.be.null;

        // should have it when loading is true
        scope.toggle = true;
        scope.$digest();
        expect(domEl.querySelector('.rx-spinner')).to.exist;
        expect(helpers.getChildDiv(domEl, 'rx-spinner', 'class').hasClass('dark')).to.be.false;

        // should not have it when loading is set back to false
        scope.toggle = false;
        scope.$digest();
        expect(domEl.querySelector('.rx-spinner')).to.be.null;
    });
    
    it('should add dark spinner div to element', function () {
        el = helpers.createDirective(darkTemplate, compile, scope);
        scope.$digest();

        var domEl = el[0];
        // should not have spinner by default
        expect(domEl.querySelector('.rx-spinner')).to.be.null;

        // should have it when loading is true
        scope.toggle = true;
        scope.$digest();
        expect(domEl.querySelector('.rx-spinner')).to.exist;
        expect(helpers.getChildDiv(domEl, 'rx-spinner', 'class').hasClass('dark')).to.be.true;

        // should not have it when loading is set back to false
        scope.toggle = false;
        scope.$digest();
        expect(domEl.querySelector('.rx-spinner')).to.be.null;
    });
});
