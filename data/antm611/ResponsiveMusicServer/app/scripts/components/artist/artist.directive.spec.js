/* jshint -W117, -W030 */
describe('app.components.artist.amArtist', function() {

    var element,
        scope;

    beforeEach(module('app.components.artist'));

    beforeEach(inject(function($compile, $rootScope) {
        element = angular.element(
            '<li am-artist="artist"></li>'
        );

        $rootScope.artist = {ID: 1, Name: 'Artist 1'};
        $compile(element)($rootScope);
        $rootScope.$digest();

        scope = element.isolateScope();
    }));

    describe('initialisation', function() {
        it('should display the artist Name property', function() {
            expect(element.find('.content').find('.desc').text()).toBe('Artist 1');
        });

        it('should call select when clicked', function() {
            spyOn(scope.vm, 'select');

            element.trigger('click');

            expect(scope.vm.select).toHaveBeenCalled();
        });

        it('should call add when the add button is clicked', function() {
            spyOn(scope.vm, 'add');

            element.find('button.control-add').trigger('click');

            expect(scope.vm.add).toHaveBeenCalled();
        });

        it('should call play when the play button is clicked', function() {
            spyOn(scope.vm, 'play');

            element.find('button.control-play').trigger('click');

            expect(scope.vm.play).toHaveBeenCalled();
        });
    });
});
