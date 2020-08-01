'use strict';
// pluralize test
describe('Pluralize Filter', function() {

    var pluralize;

    beforeEach(angular.mock.module('ninja.filters'));

    beforeEach(angular.mock.inject(function($filter) {
        pluralize = $filter('pluralize');
    }));

    // test pluralization of 0
    it('should pluralize zero', function() {

        pluralize(0, 'dog').should.be.exactly('0 dogs');
        pluralize(0, 'mouse', 'mice').should.be.exactly('0 mice');
    });

    // test singular values
    it('should not pluralize a singular value', function() {

        var input = ['dude', 'amigo', 'mug', 'dog'];

        for (var i = 0; i < input.length; i++) {
            var result = pluralize(1, input[i]);
            result.should.be.exactly('1 ' + input[i]);
        }
    });

    // test plural values with 's'
    it('should pluralize with "s"', function() {

        var input = ['dude', 'amigo', 'mug', 'dog'];

        for (var i = 0; i < input.length; i++) {
            var value = i + 2;
            var result = pluralize(value, input[i]);
            result.should.be.exactly(value + ' ' + input[i] + 's');
        }
    });

    // test plural values with other
    it('should pluralize with special plural case', function() {

        var input = [
            ['mouse', 'mice'],
            ['person', 'people'],
            ['radius', 'radii']
        ];

        for (var i = 0; i < input.length; i++) {
            var value = i + 2;
            var result = pluralize(value, input[i][0], input[i][1]);
            result.should.be.exactly(value + ' ' + input[i][1]);
        }
    });

    // test edge cases with 's'
    it('should handle edge cases with "s"', function() {
        pluralize(-1, 'dog').should.be.exactly('-1 dogs');
        pluralize(null, 'dog').should.be.exactly('null dogs');
        pluralize(undefined, 'dog').should.be.exactly('undefined dogs');
        pluralize('jibberish', 'dog').should.be.exactly('jibberish dogs');
    });

    // test edge cases with other
    it('should handle edge cases with special plural case', function() {
        pluralize(-1, 'mouse', 'mice').should.be.exactly('-1 mice');
        pluralize(null, 'mouse', 'mice').should.be.exactly('null mice');
        pluralize(undefined, 'mouse', 'mice').should.be.exactly('undefined mice');
        pluralize('jibberish', 'mouse', 'mice').should.be.exactly('jibberish mice');
    });

});
