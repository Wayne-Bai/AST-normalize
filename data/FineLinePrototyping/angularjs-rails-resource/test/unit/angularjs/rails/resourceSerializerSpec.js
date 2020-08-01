describe('railsResourceFactory', function () {
    'use strict';


    beforeEach(function () {
        module('rails');

        angular.module('rails').factory('BookSerializer', function(railsSerializer) {
            return railsSerializer(function () {
                this.exclude('publicationDate');
            });
        });
    });

    describe('serialization', function() {
        var $httpBackend, $rootScope, factory, Author, Book,
            config = {
                url: '/test',
                name: 'test'
            };

        beforeEach(inject(function (_$httpBackend_, _$rootScope_, railsResourceFactory, railsSerializer) {
            $httpBackend = _$httpBackend_;
            $rootScope = _$rootScope_;
            factory = railsResourceFactory;

            Author = railsResourceFactory({
                url: '/authors',
                name: 'author',
                serializer: railsSerializer(function () {
                    this.exclude('birthDate', 'books');
                })
            });

            Book = railsResourceFactory({
                url: '/books',
                name: 'book',
                serializer: 'BookSerializer'
            });
        }));

        afterEach(function() {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        it('create should exclude serializer exclusions', inject(function($httpBackend) {
            var promise, result;
            var data = new Author({firstName: 'George', lastName: 'Martin', middleName: 'R. R.', birthDate: '1948-09-20', books: [{id: 1, title: 'A Game of Thrones'}]});

            $httpBackend.expectPOST('/authors', {author: {first_name: 'George', last_name: 'Martin', middle_name: 'R. R.'}}).respond(200, {author: {id: 123, first_name: 'George', last_name: 'Martin', middle_name: 'R. R.'}});
            data.create();
            $httpBackend.flush();
        }));

        it('create should use factory serializer', inject(function($httpBackend) {
            var promise, result;
            var data = new Book({title: 'A Game of Thrones', publicationDate: '1996-08-06', pages: 694});

            $httpBackend.expectPOST('/books', {book: {title: 'A Game of Thrones', pages: 694}}).respond(200, {book: {id: 123, title: 'A Game of Thrones', pages: 694}});
            data.create();
            $httpBackend.flush();
        }));
    });

    describe('nested resource serialization', function() {
        var $httpBackend, $rootScope, factory, Author, Book,
            config = {
                url: '/test',
                name: 'test'
            };

        beforeEach(inject(function (_$httpBackend_, _$rootScope_, railsResourceFactory, railsSerializer) {
            $httpBackend = _$httpBackend_;
            $rootScope = _$rootScope_;
            factory = railsResourceFactory;

            Book = railsResourceFactory({
                url: '/books',
                name: 'book',
                serializer: 'BookSerializer'
            });

            Author = railsResourceFactory({
                url: '/authors',
                name: 'author',
                serializer: railsSerializer(function () {
                    this.resource('books', Book);
                    this.exclude('birthDate');
                })
            });

        }));

        afterEach(function() {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        it('create should use nested resource serializer', inject(function($httpBackend) {
            var promise, result;
            var data = new Author({firstName: 'George', lastName: 'Martin', middleName: 'R. R.', birthDate: '1948-09-20', books: [{id: 1, title: 'A Game of Thrones', publicationDate: '1996-08-06', pages: 694}]});

            $httpBackend.expectPOST('/authors', {author: {first_name: 'George', last_name: 'Martin', middle_name: 'R. R.', books: [{id: 1, title: 'A Game of Thrones', pages: 694}]}})
                .respond(200, {author: {id: 123, first_name: 'George', last_name: 'Martin', middle_name: 'R. R.'}});
            data.create();
            $httpBackend.flush();
        }));

        it('create should construct nested resource objects', inject(function($httpBackend) {
            var promise, result;

            $httpBackend.expectGET('/authors/1').respond(200, {author: {id: 123, first_name: 'George', last_name: 'Martin', middle_name: 'R. R.', books: [{id: 1, title: 'A Game of Thrones', publication_date: '1996-08-06', pages: 694}]}});
            expect(promise = Author.get(1)).toBeDefined();

            promise.then(function (response) {
                result = response;
            });

            $httpBackend.flush();

            expect(result).toBeInstanceOf(Author);
            expect(result['books']).toBeDefined();
            expect(result['books'].length).toBe(1);
            expect(result['books'][0]).toBeInstanceOf(Book);
        }));
    });
});