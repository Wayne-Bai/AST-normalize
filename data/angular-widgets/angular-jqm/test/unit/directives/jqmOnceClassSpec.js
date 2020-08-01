"use strict";
describe('jqmOnceClass directive', function() {

    it('should set a normal class string', function() {
        var elm = testutils.ng.init('<div jqm-once-class="hello"></div>');
        expect(elm).toHaveClass('hello');
    });

    it('should interpolate the class string', function() {
        var elm = testutils.ng.init('<div ng-init="value=3" jqm-once-class="red-{{value}}"></div>');
        expect(elm).toHaveClass('red-3');
    });
});
