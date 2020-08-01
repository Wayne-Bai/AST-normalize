/**
 * Copyright 2013, Radius Intelligence, Inc.
 * All Rights Reserved
 */

define([
    'angular',
    'angularMocks',
    'format-input.filter'
], function (angular, mocks, formatInputFilter) {
    'use strict';

    describe('formatNumber', function () {

        beforeEach(mocks.module(function ($filterProvider) {
            $filterProvider.register('formatInput', formatInputFilter);
        }));

        it('should have an format input filter', mocks.inject(function($filter) {
            expect($filter('formatInput')).not.toEqual(null);
        }));

        it('should format a string into "span-<string>"', mocks.inject(function ($filter) {
            expect($filter('formatInput')('a')).toEqual('span-a');
        }));
    });
});
