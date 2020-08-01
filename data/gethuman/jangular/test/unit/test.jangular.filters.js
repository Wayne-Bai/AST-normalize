/**
 * Author: Jeff Whelpley
 * Date: 10/27/14
 *
 *
 */
var name    = 'jangular.filters';
var taste   = require('taste');
var target  = taste.target(name);

describe('UNIT ' + name, function () {
    describe('addFilters()', function () {
        it('should add a new filter', function () {
            target.addFilters({
                blah: function () {
                    return 'hello, world';
                }
            });

            target.savedFilters.blah().should.equal('hello, world');
        });
    });
});