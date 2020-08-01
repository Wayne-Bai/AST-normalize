/* jshint -W117, -W030 */
describe('app.components.playlist.amPlaylist', function() {

    var element;
    var scope;

    beforeEach(module('app.components.playlist'));

    beforeEach(inject(function($compile, $rootScope) {
        element = angular.element(
            '<am-playlist></am-playlist>'
        );

        $compile(element)($rootScope);
        $rootScope.$digest();

        scope = element.isolateScope();
    }));

    describe('hideDropdowns', function() {
        it('should set the playlistShown scope variable to false on the hideDropdowns event', function() {
            scope.vm.playlistShown = true;

            scope.$emit('hideDropdowns', 'asdfdugi');

            expect(scope.vm.playlistShown).toBeFalsy();
        });

        it('should not set the playlistShown scope variable to false on the hideDropdowns event with data set to "playlist"', function() {
            scope.vm.playlistShown = true;

            scope.$emit('hideDropdowns', 'playlist');

            expect(scope.vm.playlistShown).toBeTruthy();
        });
    });

    describe('display', function() {
        beforeEach(function() {
            scope.vm.playlist.push({
                ID: 18726,
                Name: 'asdf87gas8'
            }, {
                ID: 12355,
                Name: 'as8fd7g8s7afgiu'
            });
            scope.$digest();
        });

        it('should only show a message "This playlist is empty!" if there are no tracks', function() {
            scope.vm.playlist.length = 0;
            scope.$digest();

            expect(element.find('ul.playlist.tracks').children().length).toBe(1);
            expect(element.find('ul.playlist.tracks>li').text()).toBe('This playlist is empty!');
        });

        it('should display remove buttons if the playlist is not empty', function() {
            expect(element.find('ul.playlist.tracks').children().length).toBe(3);
            expect(element.find('ul.playlist.tracks').find('.link-left').text()).toBe('Clear All');
            expect(element.find('ul.playlist.tracks').find('.link-right').text()).toBe('Clear Selected');
        });

        it('should call removeAll on the controller when the Clear All button is pressed', function() {
            spyOn(scope.vm, 'removeAll');

            element.find('ul.playlist.tracks').find('.link-left').trigger('click');

            expect(scope.vm.removeAll).toHaveBeenCalledWith();
        });

        it('should call removeSelection on the controller when the Clear Selected button is pressed', function() {
            spyOn(scope.vm, 'removeSelection');

            element.find('ul.playlist.tracks').find('.link-right').trigger('click');

            expect(scope.vm.removeSelection).toHaveBeenCalledWith();
        });

        it('should contain track elements for each track', function() {
            expect(element.find('ul.playlist.tracks').find('li[am-track]').length).toBe(2);
        });
    });
});
