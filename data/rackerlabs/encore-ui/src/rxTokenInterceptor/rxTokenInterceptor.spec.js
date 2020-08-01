/* jshint node: true */

describe('rxTokenInterceptor', function () {
    var interceptor, session;

    beforeEach(function () {
        // load module
        module('encore.ui.rxSession');

        // Initialize a fake module to get at its config block
        angular.module('testApp', function () {})
            .config(function (TokenInterceptorProvider) {
                TokenInterceptorProvider.exclusionList.push('abcd.com');
            });

        // Initialize injector for rxTokenInterceptor
        module('encore.ui.rxTokenInterceptor', 'testApp');

        inject(function ($injector) {
            interceptor = $injector.get('TokenInterceptor');
            session = $injector.get('Session');
            session.getTokenId = sinon.stub().returns('12345');
        });
    });

    it('Interceptor should exist', function () {
        expect(interceptor).to.exist;
    });

    it('Interceptor sets X-Auth-Token in headers', function () {
        var config = { headers: {}};
        interceptor.request(config);
        expect(config.headers).not.be.empty;
        expect(config.headers['X-Auth-Token']).to.eq('12345');
    });

    it('should not inject headers for rackcdn requests', function () {
        var config = {
            headers: {},
            url: 'foo.bar.rackcdn.com'
        };
        interceptor.request(config);
        expect(config.headers).to.be.empty;
    });

    it('should not inject headers for domains added to exclusionList', function () {
        var config = {
            headers: {},
            url: 'foo.bar.abcd.com'
        };
        interceptor.request(config);
        expect(config.headers).to.be.empty;
    });
});
