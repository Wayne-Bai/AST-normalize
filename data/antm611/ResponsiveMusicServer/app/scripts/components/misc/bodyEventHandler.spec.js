/* jshint -W117, -W030 */
describe('app.components.misc.amBodyEventHandler', function() {

    var element,
        scope;

    beforeEach(module('app.components.misc'));

    beforeEach(inject(function($compile, $rootScope) {
        window.$rootScope = $rootScope;

        element = angular.element(
            '<div am-body-event-handler="asdf98h98hiusfh"></div>'
        );

        $rootScope.testFunction = jasmine.createSpy('testFunction');
        $compile(element)($rootScope);
        $rootScope.$digest();

        scope = element.scope();
    }));

    describe('click', function() {
        it('should emit a hideDropdowns event with the bodyEventHandler attribute text as the data', function() {
            spyOn($rootScope, '$emit');

            element.trigger('click');

            expect($rootScope.$emit).toHaveBeenCalledWith('hideDropdowns', 'asdf98h98hiusfh');
        });
    });
});
