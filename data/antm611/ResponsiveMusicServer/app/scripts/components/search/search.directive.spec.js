/* jshint -W117, -W030 */
describe('app.components.search.amSearch', function() {

    var element;
    var scope;

    beforeEach(module('app.components.search'));

    beforeEach(inject(function($compile, $rootScope) {
        element = angular.element(
            '<am-search></am-search>'
        );

        $compile(element)($rootScope);
        $rootScope.$digest();

        scope = element.isolateScope();
    }));

    describe('initialisation', function() {
        it('should not show the results if inProgress is true', function() {
            scope.vm.inProgress = true;
            scope.$digest();

            expect(element.find('.search-loading').find('.desc').text()).toBe('Loading...');
            expect(element.find('.search-results').length).toBe(0);
        });
    });

    describe('searchResults', function() {
        beforeEach(function() {
            scope.vm.inProgress = false;
            scope.vm.searchResults = {
                artists: [],
                albums: [],
                tracks: []
            };
            scope.$digest();
        });

        it('should show the results if inProgress is false', function() {
            scope.vm.inProgress = false;
            scope.$digest();

            expect(element.find('.search-loading').find('.desc').length).toBe(0);
            expect(element.find('.search-results').length).toBe(1);
        });

        it('should show a message if there are no results', function() {
            expect(element.find('.search-loading').find('.desc').length).toBe(0);
            expect(element.find('.search-results').find('.desc').text()).toBe('No results found');
            expect(element.find('.search-results').find('.search.tracks').length).toBe(0);
            expect(element.find('.search-results').find('.search.artists').length).toBe(0);
            expect(element.find('.search-results').find('.search.albums').length).toBe(0);
        });

        it('should show tracks if tracks were found', function() {
            scope.vm.searchResults.tracks.push({
                ID: 32525,
                Name: 'asdfisgdfgsf'
            }, {
                ID: 23535,
                Name: 'asdf9sa7dgf9u'
            });
            scope.$digest();

            expect(element.find('.search-results').find('.search.tracks').find('li[am-track]').length).toBe(2);
        });

        it('should call redirectToResults if Show All is clicked for the tracks', function() {
            scope.vm.redirectToResults = jasmine.createSpy('redirectToResults');
            scope.vm.searchResults.tracks.push({
                ID: 32525,
                Name: 'asdfisgdfgsf'
            });
            scope.$digest();

            element.find('.search-results').find('.search.tracks').find('.link-right').trigger('click');

            expect(scope.vm.redirectToResults).toHaveBeenCalledWith('tracks');
        });

        it('should show albums if albums were found', function() {
            scope.vm.searchResults.albums.push({
                ID: 22425,
                Name: 'asdfs9a7gf87gi'
            }, {
                ID: 25112,
                Name: 'asdfs9adfgiusdfu'
            });
            scope.$digest();

            expect(element.find('.search-results').find('.search.albums').find('li[am-album]').length).toBe(2);
        });

        it('should call redirectToResults if Show All is clicked for the albums', function() {
            scope.vm.redirectToResults = jasmine.createSpy('redirectToResults');
            scope.vm.searchResults.albums.push({
                ID: 12547,
                Name: 'asdfs97agfiuhsdjfi'
            });
            scope.$digest();

            element.find('.search-results').find('.search.albums').find('.link-right').trigger('click');

            expect(scope.vm.redirectToResults).toHaveBeenCalledWith('albums');
        });

        it('should show tracks if tracks were found', function() {
            scope.vm.searchResults.artists.push({
                ID: 35398,
                Name: 'asdf87gsda7fuih'
            }, {
                ID: 12976,
                Name: 'asd9f7g8gisadfh'
            });
            scope.$digest();

            expect(element.find('.search-results').find('.search.artists').find('li[am-artist]').length).toBe(2);
        });

        it('should call redirectToResults if Show All is clicked for the artists', function() {
            scope.vm.redirectToResults = jasmine.createSpy('redirectToResults');
            scope.vm.searchResults.artists.push({
                ID: 39182,
                Name: 'asdf9asg7df807gsa8f7'
            });
            scope.$digest();

            element.find('.search-results').find('.search.artists').find('.link-right').trigger('click');

            expect(scope.vm.redirectToResults).toHaveBeenCalledWith('artists');
        });
    });

    describe('hideDropdowns', function() {
        it('should set the searchShown scope variable to false on the hideDropdowns event', function() {
            scope.vm.searchShown = true;

            scope.$emit('hideDropdowns', 'asdf');

            expect(scope.vm.searchShown).toBeFalsy();
        });

        it('should not set the searchShown scope variable to false on the hideDropdowns event with data set to "search"', function() {
            scope.vm.searchShown = true;

            scope.$emit('hideDropdowns', 'search');

            expect(scope.vm.searchShown).toBeTruthy();
        });
    });
});
