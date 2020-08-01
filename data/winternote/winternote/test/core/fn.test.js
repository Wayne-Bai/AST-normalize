define([
    'jquery',
    'underscore',
    'src/core/fn'
], function ($, _, fn) {

    describe('fn.transfer(tables)', function () {
        it('fn.transfer() provides transferred to new object.', function () {
            var range = {
                startContainer: {},
                startOffset: {x:10, y:10},
                endContainer: {},
                endOffset: {x:10, y:50}
            };

            var getStartPoint = fn.transfer({
                'startContainer': 'container',
                'startOffset': 'offset'
            });

            var getEndPoint = fn.transfer({
                'endContainer': 'container',
                'endOffset': 'offset'
            });

            expect(getStartPoint(range)).toEqual({
                container: range.startContainer,
                offset: range.startOffset
            });

            expect(getEndPoint(range)).toEqual({
                container: range.endContainer,
                offset: range.endOffset
            });
        });
    });
});