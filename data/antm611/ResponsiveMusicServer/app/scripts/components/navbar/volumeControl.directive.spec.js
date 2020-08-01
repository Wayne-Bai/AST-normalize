/* jshint -W117, -W030 */
describe('app.components.navbar.amVolumeControl', function() {

    var element,
        scope,
        $rootScope,
        $parentScope,
        $compile;

    beforeEach(function() {
        module('app.components.navbar');

        inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            $parentScope = $rootScope.$new();
            $parentScope.randomFunction = jasmine.createSpy('randomFunction');
            $compile = $injector.get('$compile');

            element = angular.element(
                '<am-volume-control volume-update="randomFunction"></am-volume-control>'
            );

            $compile(element)($parentScope);
            $parentScope.$digest();

            scope = element.isolateScope();
        });
    });

    describe('volumeChange', function() {
        it('should call the scope volumeUpdate function with the correct volume', function() {
            var mockEvent = {
                currentTarget: {
                    clientHeight: 400
                },
                offsetY: 100
            };

            scope.volumeChange(mockEvent);

            expect($parentScope.randomFunction).toHaveBeenCalledWith(0.75);
        });
    });
});
