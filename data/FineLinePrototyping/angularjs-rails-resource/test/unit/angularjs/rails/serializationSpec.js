describe('railsSerializer', function () {
    'use strict';

    describe('provider config', function () {
        it('should allow overriding underscore method', function () {
            var overrideCalled = false;

            module('rails', function (railsSerializerProvider) {
                expect(railsSerializerProvider.underscore(function (value) {
                    overrideCalled = true;
                    return value;
                })).toBe(railsSerializerProvider);
            });

            inject(function (railsSerializer, RailsResourceInjector) {
                var test = {id: 1, firstName: 'George', middleName: 'R. R.', lastName: 'Martin'};
                expect(RailsResourceInjector.createService(railsSerializer()).serialize(test)).toEqualData(test);
                expect(overrideCalled).toBeTruthy();
            });
        });

        it('should allow overriding camelize method', function () {
            var overrideCalled = false;

            module('rails', function (railsSerializerProvider) {
                expect(railsSerializerProvider.camelize(function (value) {
                    overrideCalled = true;
                    return value;
                })).toBe(railsSerializerProvider);
            });

            inject(function (railsSerializer, RailsResourceInjector) {
                var test = {id: 1, first_name: 'George', middle_name: 'R. R.', last_name: 'Martin'};
                expect(RailsResourceInjector.createService(railsSerializer()).deserialize(test)).toEqualData(test);
                expect(overrideCalled).toBeTruthy();
            });
        });

        it('should allow overriding pluralize method', function () {
            module('rails', function (railsSerializerProvider) {
                expect(railsSerializerProvider.pluralize(function (value) {
                    return value + 'ies';
                })).toBe(railsSerializerProvider);
            });

            inject(function (railsSerializer, RailsResourceInjector) {
                expect(RailsResourceInjector.createService(railsSerializer()).pluralize('cook')).toEqual('cookies');
            });
        });

        it('should allow overriding exclusionMatchers method', function () {
            module('rails', function (railsSerializerProvider) {
                expect(railsSerializerProvider.exclusionMatchers(['_'])).toBe(railsSerializerProvider);
            });

            inject(function (railsSerializer, RailsResourceInjector) {
                var test = {id: 1, _firstName: 'George', _middleName: 'R. R.', lastName: 'Martin'};
                expect(RailsResourceInjector.createService(railsSerializer()).serialize(test)).toEqualData({id: 1, last_name: 'Martin'});
            });
        });
    });

    describe('default provider options', function () {
        var factory, railsInjector;

        function createSerializer(options, customizer) {
            return railsInjector.createService(factory(options, customizer));
        }

        beforeEach(module('rails'));

        beforeEach(inject(function (railsSerializer, RailsResourceInjector) {
            factory = railsSerializer;
            railsInjector = RailsResourceInjector;
        }));

        describe('default config', function () {
            var serializer;

            beforeEach(function () {
                serializer = createSerializer();
            });

            it('should support customizer being first parameter', function () {
                var called = false;

                createSerializer(function () {
                    called = true;
                });

                expect(called).toBeTruthy();
            });

            it('should support customizer with options as first parameter', function () {
                var called = false;

                createSerializer({}, function () {
                    called = true;
                });

                expect(called).toBeTruthy();

            });

            it('should underscore attributes on single object', function () {
                var orig = {id: 1, firstName: 'George', middleName: 'R. R.', lastName: 'Martin'},
                    result = serializer.serialize(orig);
                expect(result).toEqualData({id: 1, first_name: 'George', middle_name: 'R. R.', last_name: 'Martin'});
                result = serializer.deserialize(result);
                expect(result).toEqualData(orig);
            });

            it('should underscore attributes on nested objects', function () {
                var orig = {id: 6, title: 'Winds of Winter', pages: 1105, publicationDate: '2020-05-25', author: {id: 1, firstName: 'George', middleName: 'R. R.', lastName: 'Martin'}},
                    result = serializer.serialize(orig);
                expect(result).toEqualData({id: 6, title: 'Winds of Winter', pages: 1105, publication_date: '2020-05-25', author: {id: 1, first_name: 'George', middle_name: 'R. R.', last_name: 'Martin'}});
                result = serializer.deserialize(result);
                expect(result).toEqualData(orig);
            });

            it('should underscore attribute inside array objects', function () {
                var orig = {id: 1, firstName: 'George', middleName: 'R. R.', lastName: 'Martin', books: [
                        {id: 1, title: 'A Game of Thrones', publicationDate: '1996-08-06'}
                    ]},
                    result = serializer.serialize(orig);
                expect(result).toEqualData({id: 1, first_name: 'George', middle_name: 'R. R.', last_name: 'Martin', books: [
                    {id: 1, title: 'A Game of Thrones', publication_date: '1996-08-06'}
                ]});
                result = serializer.deserialize(result);
                expect(result).toEqualData(orig);
            });

            it('should support primitive arrays', function () {
                var orig = {id: 1, firstName: 'George', middleName: 'R. R.', lastName: 'Martin', books: [1, 2, 3]},
                    result = serializer.serialize(orig);
                expect(result).toEqualData({id: 1, first_name: 'George', middle_name: 'R. R.', last_name: 'Martin', books: [1, 2, 3]});
                result = serializer.deserialize(result);
                expect(result).toEqualData(orig);
            });

            it('should exclude attributes that start with $', function () {
                var result = serializer.serialize({id: 1, firstName: 'George', middleName: 'R. R.', lastName: 'Martin', $birthDate: '1948-09-20'});
                expect(result).toEqualData({id: 1, first_name: 'George', middle_name: 'R. R.', last_name: 'Martin'});
                result = serializer.deserialize({id: 1, first_name: 'George', middle_name: 'R. R.', last_name: 'Martin', $birth_date: '1948-09-20'});
                expect(result).toEqualData({id: 1, firstName: 'George', middleName: 'R. R.', lastName: 'Martin'});
            });

            it('should exclude functions', function () {
                var result = serializer.serialize({id: 1, firstName: 'George', middleName: 'R. R.', lastName: 'Martin', $books: [], getNumBooks: function () {
                    this.$books.length
                }});
                expect(result).toEqualData({id: 1, first_name: 'George', middle_name: 'R. R.', last_name: 'Martin'});
            });

        });

        describe('custom options', function () {
            it('should allow overriding attribute transformation functions with undefined', function () {
                var test,
                    serializer = createSerializer({underscore: undefined, camelize: undefined});

                test = {id: 1, firstName: 'George', middleName: 'R. R.', lastName: 'Martin'};
                expect(serializer.serialize(test)).toEqualData(test);
                test = {id: 1, first_name: 'George', middle_name: 'R. R.', last_name: 'Martin'};
                expect(serializer.deserialize(test)).toEqualData(test);
            });

            it('should allow overriding attribute transformation with custom function', function () {
                var result,
                    serializer = createSerializer({
                        underscore: function (attribute) {
                            return 'x' + attribute
                        },
                        camelize: function (attribute) {
                            return 'y' + attribute
                        }
                    });

                result = serializer.serialize({id: 1, firstName: 'George', middleName: 'R. R.', lastName: 'Martin'});
                expect(result).toEqualData({xid: 1, xfirstName: 'George', xmiddleName: 'R. R.', xlastName: 'Martin'});
                result = serializer.deserialize({id: 1, first_name: 'George', middle_name: 'R. R.', last_name: 'Martin'});
                expect(result).toEqualData({yid: 1, yfirst_name: 'George', ymiddle_name: 'R. R.', ylast_name: 'Martin'});
            });

            it('should allow safely ignore null excludePrefixes', function () {
                var result, underscored, camelized,
                    serializer = createSerializer({exclusionMatchers: null});

                camelized = {id: 1, firstName: 'George', middleName: 'R. R.', lastName: 'Martin', $birthDate: '1948-09-20'};
                underscored = {id: 1, first_name: 'George', middle_name: 'R. R.', last_name: 'Martin', $birth_date: '1948-09-20'};
                result = serializer.serialize(camelized);
                expect(result).toEqualData(underscored);
                result = serializer.deserialize(underscored);
                expect(result).toEqualData(camelized);
            });

            it('should allow safely ignore undefined excludePrefixes', function () {
                var result, underscored, camelized,
                    serializer = createSerializer({exclusionMatchers: undefined});

                camelized = {id: 1, firstName: 'George', middleName: 'R. R.', lastName: 'Martin', $birthDate: '1948-09-20'};
                underscored = {id: 1, first_name: 'George', middle_name: 'R. R.', last_name: 'Martin', $birth_date: '1948-09-20'};
                result = serializer.serialize(camelized);
                expect(result).toEqualData(underscored);
                result = serializer.deserialize(underscored);
                expect(result).toEqualData(camelized);
            });

            it('should allow empty excludePrefixes', function () {
                var result, underscored, camelized,
                    serializer = createSerializer({exclusionMatchers: []});

                camelized = {id: 1, firstName: 'George', middleName: 'R. R.', lastName: 'Martin', $birthDate: '1948-09-20'};
                underscored = {id: 1, first_name: 'George', middle_name: 'R. R.', last_name: 'Martin', $birth_date: '1948-09-20'};
                result = serializer.serialize(camelized);
                expect(result).toEqualData(underscored);
                result = serializer.deserialize(underscored);
                expect(result).toEqualData(camelized);
            });

            it('should treat exclusionMatcher strings as prefix exclusions', function () {
                var result,
                    serializer = createSerializer({exclusionMatchers: ['x']});

                result = serializer.serialize({xid: 1, firstNamex: 'George', middleName: 'R. R.', lastName: 'Martin', $birthDate: '1948-09-20'});
                expect(result).toEqualData({first_namex: 'George', middle_name: 'R. R.', last_name: 'Martin', $birth_date: '1948-09-20'});
                result = serializer.deserialize({xid: 1, first_namex: 'George', middle_name: 'R. R.', last_name: 'Martin', $birth_date: '1948-09-20'});
                expect(result).toEqualData({xid: 1, firstNamex: 'George', middleName: 'R. R.', lastName: 'Martin', $birthDate: '1948-09-20'});
            });

            it('should use combination of string prefix, function, and regexp for exclusions', function () {
                var result,
                    serializer = createSerializer({exclusionMatchers: ['x', /^$/, function (key) {
                        return key === 'middleName';
                    }]});

                result = serializer.serialize({xid: 1, firstName: 'George', middleName: 'R. R.', lastName: 'Martin', $birthDate: '1948-09-20'});
                expect(result).toEqualData({first_name: 'George', last_name: 'Martin'});
                result = serializer.deserialize({xid: 1, first_name: 'George', middle_name: 'R. R.', last_name: 'Martin', $birth_date: '1948-09-20'});
                expect(result).toEqualData({xid: 1, firstName: 'George', middleName: 'R. R.', lastName: 'Martin', $birth_date: '1948-09-20'});
            });
        });

        describe('customized serialization', function () {
            var camelizedAuthor = {
                    id: 1,
                    firstName: 'George',
                    middleName: 'R. R.',
                    lastName: 'Martin',
                    birthDate: '1948-09-20',
                    books: [
                        {id: 1, title: 'A Game of Thrones', pages: 694, series: 'A Song of Ice and Fire', publicationDate: '1996-08-06', authorId: 1},
                        {id: 2, title: 'A Clash of Kings', pages: 768, series: 'A Song of Ice and Fire', publicationDate: '1999-03-01', authorId: 1},
                    ]
                },
                underscoredAuthor = {
                    id: 1,
                    first_name: 'George',
                    middle_name: 'R. R.',
                    last_name: 'Martin',
                    birth_date: '1948-09-20',
                    books: [
                        {id: 1, title: 'A Game of Thrones', pages: 694, series: 'A Song of Ice and Fire', publication_date: '1996-08-06', author_id: 1},
                        {id: 2, title: 'A Clash of Kings', pages: 768, series: 'A Song of Ice and Fire', publication_date: '1999-03-01', author_id: 1},
                    ]
                };

            it('should allow single exclusion', function () {
                var result,
                    serializer = createSerializer(function (config) {
                        config.exclude('books');
                    });

                result = serializer.serialize(camelizedAuthor);
                expect(result).toEqualData({id: 1, first_name: 'George', middle_name: 'R. R.', last_name: 'Martin', birth_date: '1948-09-20'});
                result = serializer.deserialize(underscoredAuthor);
                expect(result).toEqualData(camelizedAuthor);
            });

            it('should allow variable exclusions', function () {
                var result,
                    serializer = createSerializer(function (config) {
                        config.exclude('books', 'birthDate');
                    });

                result = serializer.serialize(camelizedAuthor);
                expect(result).toEqualData({id: 1, first_name: 'George', middle_name: 'R. R.', last_name: 'Martin'});
                result = serializer.deserialize(underscoredAuthor);
                expect(result).toEqualData(camelizedAuthor);
            });

            it('should allow renaming attributes', function () {
                var result,
                    serializer = createSerializer(function (config) {
                        // this & config should be interchangeable
                        this.exclude('books', 'birthDate');
                        this.rename('id', 'authorId');
                        this.rename('firstName', 'first');
                        this.rename('middleName', 'middle');
                        config.rename('lastName', 'last');
                    });

                result = serializer.serialize(camelizedAuthor);
                expect(result).toEqualData({author_id: 1, first: 'George', middle: 'R. R.', last: 'Martin'});
                result = serializer.deserialize({author_id: 1, first: 'George', middle: 'R. R.', last: 'Martin'});
                expect(result).toEqualData({id: 1, firstName: 'George', middleName: 'R. R.', lastName: 'Martin'});
            });

            it('should allow nested attributes', function () {
                var result,
                    serializer = createSerializer(function () {
                        this.nestedAttribute('books')
                    });

                result = serializer.serialize(camelizedAuthor);
                expect(result['books_attributes']).toEqualData([
                    {id: 1, title: 'A Game of Thrones', pages: 694, series: 'A Song of Ice and Fire', publication_date: '1996-08-06', author_id: 1},
                    {id: 2, title: 'A Clash of Kings', pages: 768, series: 'A Song of Ice and Fire', publication_date: '1999-03-01', author_id: 1}
                ]);
                result = serializer.deserialize(underscoredAuthor);
                expect(result).toEqualData(camelizedAuthor);
            });

            it('should add custom attribute from function', function () {
                var result,
                    serializer = createSerializer(function () {
                        this.add('numBooks', function (author) {
                            return author.books.length;
                        });
                    });

                result = serializer.serialize(camelizedAuthor);
                expect(result['num_books']).toBe(2);
            });

            it('should add custom attribute from constant value', function () {
                var result,
                    serializer = createSerializer(function () {
                        this.add('numBooks', 2);
                    });

                result = serializer.serialize(camelizedAuthor);
                expect(result['num_books']).toBe(2);
            });

            it('should add custom attribute to collection from function', function() {
                var result, authorWithPublisher, serializedBooks,
                    serializer = createSerializer(function () {
                        this.serializeWith('books', factory(function() {
                            this.add('publisherId', function(book) {
                                return book.publisher.id;
                            });
                        }));
                    });
                authorWithPublisher = {
                    books: [
                        {id: 1, publisher: {id: 3}},
                        {id: 2, publisher: {id: 4}}
                    ]
                };
                serializedBooks = [
                    {id: 1, publisher_id: 3, publisher: {id:3}},
                    {id: 2, publisher_id: 4, publisher: {id:4}}
                ];

                result = serializer.serialize(authorWithPublisher);
                expect(result['books']).toEqual(serializedBooks);
            });

            it('should add custom attribute to collection from constant value', function() {
                var result, authorWithPublisher, serializedBooks,
                    serializer = createSerializer(function () {
                        this.serializeWith('books', factory(function() {
                            this.add('publisherId', 3);
                        }));
                    });
                authorWithPublisher = {
                    books: [
                        {id: 1, publisher: {id: 3}},
                        {id: 2, publisher: {id: 4}}
                    ]
                };
                serializedBooks = [
                    {id: 1, publisher_id: 3, publisher: {id:3}},
                    {id: 2, publisher_id: 3, publisher: {id:4}}
                ];

                result = serializer.serialize(authorWithPublisher);
                expect(result['books']).toEqual(serializedBooks);
            });

            it('should use custom serializer for books', function () {
                var result, serializedBooks, underscored,
                    serializer = createSerializer(function () {
                        this.serializeWith('books', factory(function () {
                            this.rename('publicationDate', 'published');
                        }));
                    });

                result = serializer.serialize(camelizedAuthor);
                serializedBooks = [
                    {id: 1, title: 'A Game of Thrones', pages: 694, series: 'A Song of Ice and Fire', published: '1996-08-06', author_id: 1},
                    {id: 2, title: 'A Clash of Kings', pages: 768, series: 'A Song of Ice and Fire', published: '1999-03-01', author_id: 1}
                ];

                expect(result['books']).toEqualData(serializedBooks);
                underscored = angular.copy(underscoredAuthor);
                underscored['books'] = serializedBooks;
                result = serializer.deserialize(underscored);
                expect(result).toEqualData(camelizedAuthor);
            });
        });

        describe('default exclusion serialization', function () {
            it('should only serialize id', function () {
                var result,
                    serializer = createSerializer(function (config) {
                        // this & config should be interchangeable
                        this.only('id');
                    });

                result = serializer.serialize({id: 1, first: 'George', middle: 'R. R.', last: 'Martin'});
                expect(result).toEqualData({id: 1});
                result = serializer.deserialize({id: 1, first: 'George', middle: 'R. R.', last: 'Martin'});
                expect(result).toEqualData({id: 1, first: 'George', middle: 'R. R.', last: 'Martin'});
            });

            it('should only serialize id and last', function () {
                var result,
                    serializer = createSerializer(function (config) {
                        this.only('id', 'last');
                    });

                result = serializer.serialize({id: 1, first: 'George', middle: 'R. R.', last: 'Martin'});
                expect(result).toEqualData({id: 1, last: 'Martin'});
                result = serializer.deserialize({id: 1, first: 'George', middle: 'R. R.', last: 'Martin'});
                expect(result).toEqualData({id: 1, first: 'George', middle: 'R. R.', last: 'Martin'});
            });

            it('should only serialize id and books', function() {
                var result,
                    serializer = createSerializer(function(config) {
                        this.only('id', 'books');
                        this.nestedAttribute('books');
                        this.serializeWith('books', factory(function() { }));
                    });
                var book = { id: 1, title: 'A Game of Thrones', publicationDate: '1996-08-06' };
                result = serializer.serialize({
                    id: 1, first: 'George', last: 'Martin', books: [book]
                });
                expect(result).toEqualData({ id: 1, books_attributes: [{ id: 1, title: 'A Game of Thrones', publication_date: '1996-08-06' }] });
                result = serializer.deserialize(result);
                expect(result).toEqual({ id: 1, books: [book]});
            });
        });

        describe('nested resource collection serialization', function () {
            module('rails');

            angular.module('rails').factory('Team', function (railsResourceFactory, railsSerializer) {
                return railsResourceFactory({
                    name: 'team',
                    serializer: railsSerializer(function() {
                        this.nestedAttribute('members');
                        this.resource('members', 'Member');
                        this.add('vehicle_id', function(team) {
                            return team.vehicle.id;
                        });
                        this.exclude('vehicle');
                    })
                });
            });
            angular.module('rails').factory('Member', function (railsResourceFactory, railsSerializer) {
                return railsResourceFactory({
                    name: 'member',
                    serializer: railsSerializer(function() {
                        this.resource('user', 'User');
                        this.resource('slot', 'Slot');
                        this.add('user_id', function(member) {
                            return member.user.id;
                        });
                        this.add('slot_id', function(member) {
                            return member.slot.id;
                        });
                        this.exclude('user', 'slot');
                    })
                });
            });
            angular.module('rails').factory('Slot', function (railsResourceFactory) {
                return railsResourceFactory({name: 'slot'});
            });
            angular.module('rails').factory('User', function (railsResourceFactory) {
                return railsResourceFactory({name: 'user'});
            });
            angular.module('rails').factory('Vehicle', function (railsResourceFactory) {
                return railsResourceFactory({name: 'vehicle'});
            });


            it('should add custom attribute in nested resource', inject(function(Team) {
                var team1 = new Team({
                    id: 1,
                    name: 'Team 1',
                    vehicle: { id: 123, name: 'Subaru Impreza' },
                    members: [
                        { id: 352435, user: { id: 100500, name: 'Andrey' }, slot: { id: 200425, rank_id: 1 } },
                        { id: 235433, user: { id: 100501, name: 'Anton'  }, slot: { id: 200426, rank_id: 2 } },
                    ],
                });
                var serializedTeam1 = {
                    id: 1, name: 'Team 1', vehicle_id: 123,
                    members_attributes: [{id: 352435, user_id: 100500, slot_id: 200425}, {id: 235433, user_id: 100501, slot_id: 200426}],
                };

                expect(Team.config.serializer.serialize(team1)).toEqual(serializedTeam1);
            }));
        });
    });
});
