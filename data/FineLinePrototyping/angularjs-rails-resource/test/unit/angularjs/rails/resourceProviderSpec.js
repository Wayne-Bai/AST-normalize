describe('resource provider factory config', function () {
    'use strict';

    it('should allow disabling root wrapping globally', function () {
        module('rails', function (RailsResourceProvider) {
            expect(RailsResourceProvider.rootWrapping(false)).toBe(RailsResourceProvider);
        });

        inject(function (railsResourceFactory) {
            expect(railsResourceFactory({name: 'test', url: '/test'}).config.rootWrapping).toBe(false);
        });
    });

    it('should allow setting updateMethod globally', function () {
        module('rails', function (RailsResourceProvider) {
            expect(RailsResourceProvider.updateMethod('patch')).toBe(RailsResourceProvider);
        });

        inject(function (railsResourceFactory) {
            expect(railsResourceFactory({name: 'test', url: '/test'}).config.updateMethod).toBe('patch');
        });
    });

    it('should allow setting http headers options globally', function () {
        module('rails', function (RailsResourceProvider) {
            expect(RailsResourceProvider.httpConfig({headers: {'test': "header"}})).toBe(RailsResourceProvider);
        });

        inject(function (railsResourceFactory) {
            expect(railsResourceFactory({name: 'test', url: '/test'}).config.httpConfig.headers).toEqualData({'Accept': 'application/json', 'Content-Type': 'application/json', 'test': 'header'});
        });
    });

    it('should allow setting default query parameters options globally', function () {
        module('rails', function (RailsResourceProvider) {
            expect(RailsResourceProvider.defaultParams({'test': "1"})).toBe(RailsResourceProvider);
        });

        inject(function (railsResourceFactory) {
            expect(railsResourceFactory({name: 'test', url: '/test'}).config.defaultParams).toEqualData({'test': '1'});
        });
    });

    it('should allow setting default extensions globally', function () {
        module('rails', function (RailsResourceProvider) {
            expect(RailsResourceProvider.extensions('snapshots')).toBe(RailsResourceProvider);
        });

        inject(function (railsResourceFactory) {
            expect(railsResourceFactory({name: 'test', url: '/test'}).prototype.snapshot).toBeDefined();
        });
    });

    it('should allow setting default extensions using an array', function () {
        module('rails', function (RailsResourceProvider) {
            expect(RailsResourceProvider.extensions(['snapshots'])).toBe(RailsResourceProvider);
        });

        inject(function (railsResourceFactory) {
            expect(railsResourceFactory({name: 'test', url: '/test'}).prototype.snapshot).toBeDefined();
        });
    });
});
