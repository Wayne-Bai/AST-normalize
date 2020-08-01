/* jshint node: true */
describe('rxApp', function () {
    var scope, scopeCustomNav, collapsibleScope, compile, rootScope, el, elCustom, elCollapsible,
        elCollapsibleVar, appRoutes, httpMock, cdnPath, cdnGet;
    var standardTemplate = '<rx-app></rx-app>';
    var collapsibleTemplate = '<rx-app collapsible-nav="true"></rx-app>';
    var collapsibleExternalVarTemplate = '<rx-app collapsible-nav="true" collapsed-nav="collapsed"></rx-app>';
    var customTemplate = '<rx-app site-title="My App" menu="customNav" new-instance="true"' +
        'hide-feedback="true"></rx-app>';

    // Fake default nav that gets passed as the mock cdn response
    var defaultNav = [{
        title: 'All Tools',
        children: [
            {
                'href': '/support',
                'linkText': 'Support Service',
                'key': 'supportService',
                'directive': 'rx-support-service-search'
            }
        ]
    }];

    var customNav = [{
        title: 'Example Menu',
        children: [
            {
                href: '/1',
                linkText: '1st Order Item'
            }
        ]
    }];

    var mockNotify = {
        add: sinon.stub()
    };

    var mockSession = {
        getUserId: sinon.stub().returns('rack0000')
    };

    beforeEach(function () {
        // load module
        module('encore.ui.rxApp');
        module('encore.ui.configs');
        module('encore.ui.rxNotify');

        // load templates
        module('templates/rxApp.html');
        module('templates/rxAppNav.html');
        module('templates/rxAppNavItem.html');
        module('templates/rxPage.html');
        module('templates/rxAppSearch.html');
        module('templates/rxAccountSearch.html');

        module(function ($provide) {
            $provide.value('rxNotify', mockNotify);
            $provide.value('Session', mockSession);
        });

        // Inject in angular constructs
        inject(function ($rootScope, $compile, encoreRoutes, $httpBackend, routesCdnPath, LocalStorage) {
            rootScope = $rootScope;
            compile = $compile;
            appRoutes = encoreRoutes;
            httpMock = $httpBackend;
            cdnPath = routesCdnPath;

            LocalStorage.clear();
        });

        cdnGet = httpMock.whenGET(cdnPath.staging);
        cdnGet.respond(defaultNav);

        scope = rootScope.$new();

        collapsibleScope = rootScope.$new();
        collapsibleScope.collapsed = false;

        scopeCustomNav = rootScope.$new();
        scopeCustomNav.customNav = customNav;

        el = helpers.createDirective(standardTemplate, compile, scope);
        elCustom = helpers.createDirective(customTemplate, compile, scopeCustomNav);
        elCollapsible = helpers.createDirective(collapsibleTemplate, compile, collapsibleScope);
        elCollapsibleVar = helpers.createDirective(collapsibleExternalVarTemplate, compile, rootScope.$new());
    });

    describe('default menu', function () {
        it('should have a default title', function () {
            // get page title element
            var pageTitle = el[0].querySelector('.site-title');

            // validate it matches 'Encore'
            expect($(pageTitle).text()).to.equal('Encore');
        });

        it('should load data from the CDN', function () {
            // get the nav data from the mock CDN
            httpMock.flush();

            // get first nav section
            var navTitle = el[0].querySelector('.nav-section-title');

            // validate it matches 'Encore'
            expect($(navTitle).text()).to.equal(defaultNav[0].title);
        });

        it('should show error message if CDN failed to load', function () {
            // make CDN request fail.
            cdnGet.respond(404);

            // get the nav data from the mock CDN
            httpMock.flush();

            // expect rxNotify to be called with error
            expect(mockNotify.add).to.be.calledWith(sinon.match('Error'), sinon.match({ type: 'error' }));
        });

        it('should have a feedback link if not disabled', function () {
            var feedbackLink = el[0].querySelector('rx-feedback');

            // validate it matches 'Encore'
            expect(feedbackLink).to.exist;

            var notFeedbackLink = elCustom[0].querySelector('rx-feedback');

            expect(notFeedbackLink).to.not.exist;
        });

        it('should not show the collapsible toggle if collapsible is not true', function () {
            var collapsibleToggle = el[0].querySelector('.collapsible-toggle');

            expect(collapsibleToggle).to.be.null;
        });

        it('should allow you to set the menu as collapsible', function () {
            var collapsibleToggle = elCollapsible[0].querySelector('.collapsible-toggle');

            expect(collapsibleToggle).to.be.ok;
        });

        it('should apply the classes to the menu for collapsible status', function () {
            var collapsibleMenu = elCollapsible[0].querySelector('.collapsible');

            expect(collapsibleMenu).to.be.not.null;
        });

        it('should apply the classes to the menu for collapsed status', function () {
            var elScope = elCollapsible.isolateScope();
            var collapsibleMenu = elCollapsible[0].querySelector('.collapsed');

            expect(collapsibleMenu).to.be.null;
            elScope.collapsedNav = true;

            // We need to run the digest to update the classes
            collapsibleScope.$digest();
            collapsibleMenu = elCollapsible[0].querySelector('.collapsed');
            expect(collapsibleMenu).to.be.not.null;
        });

        it('should not have a custom URL', function () {
            expect(cdnPath.hasCustomURL).to.be.false;
        });

        it('should not set isWarning', function () {
            expect(el.isolateScope().isWarning).to.be.false;
        });

        it('should set the user name from the session', function () {
            expect(mockSession.getUserId).to.have.been.called;
            expect(el.isolateScope().userId).to.equal('rack0000');
        });
    });

    describe('custom menu', function () {
        it('should allow you to override the default title', function () {
            // get page title element
            var pageTitle = elCustom[0].querySelector('.site-title');

            // validate it matches custom app name
            expect(pageTitle.textContent).to.equal('My App');
        });

        it('should allow you to override the default nav', function () {
            // get first nav section
            var navTitle = elCustom[0].querySelector('.nav-section-title');

            // validate it matches custom nav title
            expect(navTitle.textContent).to.equal(customNav[0].title);
        });
    });
});

describe('rxApp - nav environment detection', function () {
    var mockEnvironment = {
        isPreProd: function () { return false; },
        isUnifiedProd: function () { return false; }
    };

    var mockCdnPath = {
        staging: 'staging',
        preprod: 'preprod',
        production: 'production',
        hasCustomURL: false
    };

    var mockLocalStorage = {
        getObject: sinon.stub()
    };

    var testEnvironment = function (url, suffix) {
        inject(function ($httpBackend, encoreRoutes) {
            encoreRoutes.fetchRoutes();
            expect(mockLocalStorage.getObject).to.have.been.calledWith('encoreRoutes-' + suffix);
            $httpBackend.expectGET(url).respond(500);
            $httpBackend.verifyNoOutstandingExpectation();
        });
    };

    beforeEach(function () {
        module('encore.ui.rxApp');
        module('encore.ui.configs');
        module('encore.ui.rxNotify');
        module(function ($provide) {
            $provide.value('Environment', mockEnvironment);
            $provide.value('routesCdnPath', mockCdnPath);
            $provide.value('LocalStorage', mockLocalStorage);
        });

        mockLocalStorage.getObject.reset();
    });

    // These tests are organized in reverse priority order.
    // Since the mocks are not reset on each run, changing their behavior
    // in one test will propagate to the following ones.  That way, the
    // priority of the environments can be tested as well as their results.
    it('recognizes the staging environemnt', function () {
        testEnvironment(mockCdnPath.staging, 'staging');
    });

    it('recognizes a custom url', function () {
        mockCdnPath.hasCustomURL = true;
        testEnvironment(mockCdnPath.staging, 'custom');
    });

    it('recognizes the preprod environment', function () {
        mockEnvironment.isPreProd = function () { return true; };
        testEnvironment(mockCdnPath.preprod, 'preprod');
    });

    it('recognizes the prod environment', function () {
        mockEnvironment.isUnifiedProd = function () { return true; };
        testEnvironment(mockCdnPath.production, 'prod');
    });
});

describe('rxApp - nav caching', function () {
    var scope, compile, rootScope, el, appRoutes, httpMock,
        cdnPath, cdnGet, localStorage, createDirective;
    var standardTemplate = '<rx-app></rx-app>';

    var mockNotify = {
        add: sinon.stub()
    };

    var defaultNav = [{
        title: 'All Tools',
        children: [
            {
                'href': '/app',
                'linkText': 'App',
            }
        ]
    }];

    beforeEach(function () {
        // load module
        module('encore.ui.rxApp');
        module('encore.ui.configs');

        // load templates
        module('templates/rxApp.html');
        module('templates/rxAppNav.html');
        module('templates/rxAppNavItem.html');

        module(function ($provide) {
            $provide.value('rxNotify', mockNotify);
        });

        // Inject in angular constructs
        inject(function ($rootScope, $compile, encoreRoutes, $httpBackend, routesCdnPath, LocalStorage) {
            rootScope = $rootScope;
            compile = $compile;
            appRoutes = encoreRoutes;
            httpMock = $httpBackend;
            cdnPath = routesCdnPath;
            localStorage = LocalStorage;
        });

        cdnGet = httpMock.whenGET(cdnPath.staging);
        cdnGet.respond(defaultNav);

        localStorage.clear();
        sinon.spy(appRoutes, 'setAll');

        scope = rootScope.$new();

        createDirective = function () {
            el = helpers.createDirective(standardTemplate, compile, scope);
        };
    });

    afterEach(function () {
        localStorage.clear();
    });

    it('should load the cached menu from the local storage', function () {
        localStorage.setObject('encoreRoutes-staging', defaultNav);
        createDirective();
        var navTitle = el[0].querySelector('.nav-section-title');
        expect($(navTitle).text()).to.equal(defaultNav[0].title);
    });

    it('should cache the CDN-loaded menu', function () {
        createDirective();
        httpMock.flush();
        expect(localStorage.getObject('encoreRoutes-staging')).to.eql(defaultNav);
    });

    describe('when the CDN request fails', function () {

        beforeEach(function () {
            cdnGet.respond(404);
        });

        it('should fall back to the cached menu if available', function () {
            localStorage.setObject('encoreRoutes-staging', defaultNav);
            createDirective();

            // Nav content is written before the request responds
            var navTitle = el[0].querySelector('.nav-section-title');
            expect($(navTitle).text()).to.equal(defaultNav[0].title);

            httpMock.flush();
            expect(mockNotify.add).to.have.been
                .calledWith(sinon.match('cached version'), { type: 'warning' });
            expect(appRoutes.setAll).to.have.been.calledOnce;

            // angular.copy() used to remove $$hashKey for matching
            var routes = appRoutes.setAll.firstCall.args[0];
            expect(angular.copy(routes)).to.eql(defaultNav);
        });

        it('should show error message if nothing is cached', function () {
            createDirective();
            httpMock.flush();

            expect(mockNotify.add).to.have.been
                .calledWith(sinon.match('Error'), { type: 'error' });
            expect(appRoutes.setAll).to.not.have.been.called;
        });

    });

});

describe('rxApp - customURL', function () {
    var scope, isolateScope, compile, rootScope, el, httpMock, cdnGet, cdnPath;
    var standardTemplate = '<rx-app></rx-app>';

    var localNav = [{
        title: 'Local Nav',
        children: [
            {
                'href': '/local',
                'linkText': 'Local Nav test',
                'key': 'localNav',
                'directive': 'localNav'
            }
        ]
    }];

    beforeEach(function () {

        var customURL = 'foo.json';

        // load module
        module('encore.ui.configs');
        module('encore.ui.rxNotify');

        // load templates
        module('templates/rxApp.html');
        module('templates/rxAppNav.html');
        module('templates/rxAppNavItem.html');

        // Initialize a fake module to get at its config block
        // This is the main purpose of this whole `describe` block,
        // to test that this can be set in a `.config` and will be used
        // when running against local/staging
        angular.module('testApp', function () {})
            .config(function (routesCdnPathProvider) {
                routesCdnPathProvider.customURL = customURL;
            });
        module('encore.ui.rxApp', 'testApp');

        // Inject in angular constructs
        inject(function ($rootScope, $compile, encoreRoutes, $httpBackend, routesCdnPath) {
            rootScope = $rootScope;
            compile = $compile;
            httpMock = $httpBackend;
            cdnPath = routesCdnPath;
        });

        cdnGet = httpMock.whenGET(customURL);
        cdnGet.respond(localNav);

        scope = rootScope.$new();

        el = helpers.createDirective(standardTemplate, compile, scope);

        // Because we want to test things on the scope that were defined
        // outside of the scope: {} object, we need to use the isolateScope
        // function
        isolateScope = el.isolateScope();
    });

    it('should load data from customURL', function () {
        // get the nav data from the URL pointed to by .customURL
        httpMock.flush();

        // get first nav section
        var navTitle = el[0].querySelector('.nav-section-title');

        // validate it matches 'Local Nav'
        expect($(navTitle).text()).to.equal(localNav[0].title);
    });

    it('hasCustomURL should be set to true', function () {
        expect(cdnPath.hasCustomURL).to.be.true;
    });

    it('should have set isWarning on the scope', function () {
        expect(isolateScope.isWarning).to.be.true;
    });

    it('should set the local nav file warning message', function () {
        expect(isolateScope.warningMessage).to.contain('You are using a local nav file');
    });

});

describe('rxApp - preprod environment', function () {
    var scope, compile, rootScope, el,
        appRoutes, httpMock, cdnPath, cdnGet, isolateScope;
    var standardTemplate = '<rx-app></rx-app>';

    // Fake default nav that gets passed as the mock cdn response
    var defaultNav = [{
        title: 'All Tools',
        children: [
            {
                'href': '/support',
                'linkText': 'Support Service',
                'key': 'supportService',
                'directive': 'rx-support-service-search'
            }
        ]
    }];

    var mockEnvironment = {
        isPreProd: function () { return true; },
        isLocal: function () { return false; },
        isUnifiedProd: function () { return false; }
    };

    beforeEach(function () {
        // load module
        module('encore.ui.rxApp');
        module('encore.ui.configs');
        module('encore.ui.rxNotify');

        // load templates
        module('templates/rxApp.html');
        module('templates/rxAppNav.html');
        module('templates/rxAppNavItem.html');

        module(function ($provide) {
            $provide.constant('Environment', mockEnvironment);
        });

        // Inject in angular constructs
        inject(function ($rootScope, $compile, encoreRoutes, $httpBackend, routesCdnPath) {
            rootScope = $rootScope;
            compile = $compile;
            appRoutes = encoreRoutes;
            httpMock = $httpBackend;
            cdnPath = routesCdnPath;
        });

        cdnGet = httpMock.whenGET(cdnPath.preprod);
        cdnGet.respond(defaultNav);

        scope = rootScope.$new();

        el = helpers.createDirective(standardTemplate, compile, scope);
        isolateScope = el.isolateScope();
    });

    it('hasCustomURL should be set to false', function () {
        expect(cdnPath.hasCustomURL).to.be.false;
    });

    it('should have set isPreProd on the scope', function () {
        expect(isolateScope.isPreProd).to.be.true;
    });

    it('should have set isWarning on the scope', function () {
        expect(isolateScope.isWarning).to.be.true;
    });

    it('should set the preprod warning message', function () {
        expect(isolateScope.warningMessage)
            .to.contain('You are using a pre-production environment that has real, live production data!');
    });

});

describe('rxAppNav', function () {
    var scope, compile, rootScope, el;
    var template = '<rx-app-nav items="menuItems" level="1"></rx-app-nav>';

    var menuItems = [{
        href: '/1',
        linkText: '1st Order Item'
    }];

    beforeEach(function () {
        // load module
        module('encore.ui.rxApp');

        // load templates
        module('templates/rxAppNav.html');
        module('templates/rxAppNavItem.html');

        // Inject in angular constructs
        inject(function ($rootScope, $compile) {
            rootScope = $rootScope;
            scope = $rootScope.$new();
            compile = $compile;
        });

        scope.menuItems = menuItems;

        el = helpers.createDirective(template, compile, scope);
    });

    it('should exist', function () {
        expect(el).to.have.length.of.at.least(1);
        expect(el.children()).to.have.length.of.at.least(1);
    });

    it('should add "level" class of appropriate level', function () {
        expect(el.hasClass('rx-app-nav-level-1')).to.be.true;
    });

//    TODO allow children to be dynamically injected
});

describe('rxAppNavItem', function () {
    var scope, compile, rootScope, el, location, someProp, rxvisibility;
    var template = '<rx-app-nav-item item="item"></rx-app-nav-item>';

    var menuItem = {
        href: { tld: 'example', path: 'myPath' },
        linkText: '1st',
        directive: 'fake-directive',
        visibility: function () {
            return true;
        },
        childHeader: 'some value',
        children: [
            {
                href: '/1-1',
                linkText: '1st-1st',
                childVisibility: [ 'falseChildVisibilty' ],
                children: [
                    {
                        href: '/1-1-1',
                        linkText: '1st-1st-1st'
                    }
                ]
            }, {
                href: '/1-2',
                visibility: '2 + 2 == 4',
                linkText: '1st-2nd'
            }, {
                linkText: '1st-3rd',
                visibility: function () {
                    return someProp;
                },
                children: [
                    {
                        href: '/1-3-1',
                        linkText: '1st-3rd-1st'
                    }
                ]
            }, {
                linkText: '1st-4th',
                visibility: [ 'somePropMethod', { arg1: 'arg1', arg2: 'arg2' } ],
                children: [
                    {
                        href: '/1-4-1',
                        linkText: '1st-4th-1st'
                    }
                ]
            }
        ]
    };

    beforeEach(function () {
        // load module
        module('encore.ui.rxApp');
        module('encore.ui.rxCompile');

        // load templates
        module('templates/rxAppNav.html');
        module('templates/rxAppNavItem.html');

        // Inject in angular constructs
        inject(function ($rootScope, $compile, $location, rxVisibility) {
            rootScope = $rootScope;
            scope = $rootScope.$new();
            compile = $compile;
            location = $location;
            rxvisibility = rxVisibility;
        });

        rxvisibility.addMethod(
            'somePropMethod',
            function (scope, locals) {
                /* should return false */
                return locals.arg1 === locals.arg2;
            }
        );

        rxvisibility.addMethod(
            'falseChildVisibilty',
            function () { return false; }
        );

        scope.item = _.clone(menuItem, true);

        el = helpers.createDirective(template, compile, scope);
    });

    afterEach(function () {
        el = null;
        scope = null;
    });

    it('should exist', function () {
        expect(el).to.have.length.of.at.least(1);
        expect(el.children()).to.have.length.of.at.least(2);
    });

    it('should hide if visibility property evaluates to false', function () {
        // check that first item is visible (since no 'visibility' property)
        expect(el.className).to.not.contain('ng-hide');

        // NOTE: this retreives *all* the child nav items, including the sub-child ones
        // This is why indexing is a little off
        var children = el[0].querySelectorAll('.item-children .rx-app-nav-item');

        // check that first level 2 item is visible (since 'visibility' function returns true)
        expect(children[0].className, 'first child, function').to.not.contain('ng-hide');

        // check that second level 2 item is visible (since 'visibility' expression == true)
        expect(children[2].className, 'middle child, expression').to.not.contain('ng-hide');

        // check that third level 2 item is not visible (since 'visibility' function currently returns false)
        expect(children[3].className, 'third child').to.contain('ng-hide');

        // check that third level 2 item is not visible (since 'somePropMethod' function currently returns false)
        expect(children[5].className, 'fourth child, linkText: 1st-4th').to.contain('ng-hide');

        // we need to set the property that the visibility function is checking to true
        someProp = true;
        scope.$digest();

        // now that visibility = true, el should not be hidden
        expect(children[3].className, 'last child, after someProp = true').to.not.contain('ng-hide');
    });

    it('should show/hide children based on childVisibility value', function () {
        // get children element
        var children = el[0].querySelectorAll('.item-children');

        expect(children[0].className, 'All Children').to.not.contain('ng-hide');
        expect(children[1].className, '1st Subnav Children').to.contain('ng-hide');
    });

    it('should build directive if available', function () {
        // get directive
        var directive = el[0].querySelector('.item-directive');

        expect(directive).to.exist;
        expect(directive.className).to.not.contain('.ng-hide');

        // sanity check that it correctly built directive HTML
        expect(directive.innerHTML).to.contain('<' + menuItem.directive);
        expect(directive.innerHTML).to.contain('</' + menuItem.directive + '>');
    });

    it('should increment the child nav level', function () {
        // get children element
        var children = el[0].querySelector('.item-children .rx-app-nav');
        children = angular.element(children);
        expect(children.hasClass('rx-app-nav-level-2')).to.be.true;
    });

    it('should show header for children if present', function () {
        // get child header element
        var childHeader = el[0].querySelector('.child-header');

        expect(childHeader.textContent).to.equal(menuItem.childHeader);
    });
});

describe('rxPage', function () {
    var scope, compile, rootScope, el, pageTitle;
    var template = '<rx-page title="myCustomTitle"></rx-page>';

    beforeEach(function () {
        // load module
        module('encore.ui.rxApp');
        module('encore.ui.rxPageTitle');

        // load templates
        module('templates/rxPage.html');

        // Inject in angular constructs
        inject(function ($rootScope, $compile) {
            rootScope = $rootScope;
            scope = $rootScope.$new();
            compile = $compile;
        });

        inject(function (rxPageTitle) {
            pageTitle = rxPageTitle;
        });

        scope.myCustomTitle = 'foobar';
        el = helpers.createDirective(template, compile, scope);
    });

    it('should exist', function () {
        expect(el).to.have.length.of.at.least(1);
        expect(el.children()).to.have.length.of.at.least(1);
    });

    it('should have foobar as a title', function () {
        expect(pageTitle.getTitle()).to.equal('foobar');
    });

    it('should update page title if title changes', function () {
        scope.myCustomTitle = 'abc';
        scope.$digest();
        expect(pageTitle.getTitle()).to.equal('abc');
    });
});

describe('rxVisibility', function () {
    var rxvisibility;

    beforeEach(function () {
        module('encore.ui.rxApp');

        inject(function (rxVisibility) {
            rxvisibility = rxVisibility;
        });
    });

    it('should have an added method', function () {
        var method = function () {};

        rxvisibility.addMethod('foo', method);
        expect(rxvisibility.hasMethod('foo'), 'hasMethod').to.be.true;
    });

    it('should have added a visibility object', function () {
        var obj = {
            name: 'someName',
            method: function () { return true; }
        };

        rxvisibility.addVisibilityObj(obj);
        expect(rxvisibility.hasMethod('someName'), 'hasMethod').to.be.true;
        expect(rxvisibility.getMethod('someName'), 'getMethod').to.equal(obj.method);
    });

    it('should return an added method', function () {
        var method = function () {};

        rxvisibility.addMethod('foo', method);
        expect(rxvisibility.getMethod('foo'), 'getMethod').to.equal(method);

    });

    it('should return undefined for an unknown method', function () {
        expect(rxvisibility.getMethod('foo'), 'getMethod').to.be.undefined;
    });
});

describe('rxVisibilityPathParams', function () {

    beforeEach(function () {
        // Necessary so `$routeProvider` is available
        module('ngRoute');

        module('encore.ui.rxApp');

    });

    it('should let me set location', function () {
        module(function ($routeProvider) {
            $routeProvider.when('/foo/:barId', {});
        });

        inject(function ($location, $route, $rootScope, $routeParams, rxVisibilityPathParams) {
            $location.path('/foo/someIdForBar');
            $rootScope.$digest();
            expect($routeParams).to.deep.equal({ barId: 'someIdForBar' });
            var scope = $rootScope.$new();
            var method = rxVisibilityPathParams.method;
            expect(method(scope, { param: 'barId' }), ':barId should be present').to.be.true;
            expect(method(scope, { param: 'abc' }), ':abc is not defined, should not be present').to.be.false;
        });

    });
});

describe('rxHideIfUkAccount', function () {
    var $location, $route, $rootScope, $routeParams, rxHideIfUkAccount;

    beforeEach(function () {
        // Necessary so `$routeProvider` is available
        module('ngRoute');

        module('encore.ui.rxApp');

        module(function ($routeProvider) {
            $routeProvider.when('/accounts/:accountNumber', {});
        });

        inject(function ($injector) {
            $location = $injector.get('$location');
            $route = $injector.get('$route');
            $rootScope = $injector.get('$rootScope');
            $routeParams = $injector.get('$routeParams');
            rxHideIfUkAccount = $injector.get('rxHideIfUkAccount');
        });
    });

    it('should return false if UK account', function () {
        $location.path('/accounts/10000001');
        $rootScope.$digest();
        expect($routeParams).to.deep.equal({ accountNumber: '10000001' });
        var method = rxHideIfUkAccount.method;
        expect(method(), 'UK Account should return false').to.be.false;
    });

    it('should return true if not UK account', function () {
        $location.path('/accounts/9999999');
        $rootScope.$digest();
        expect($routeParams).to.deep.equal({ accountNumber: '9999999' });
        var method = rxHideIfUkAccount.method;
        expect(method(), 'Non-UK Account should return true').to.be.true;
    });
});

describe('rxAccountUsers', function () {
    var rootScope, scope, compile, q, userSelect, users, encoreRoutesMock;
    var validTemplate = '<rx-account-users></rx-account-users>';

    beforeEach(function () {

        angular.module('testDirective', function () {})
            .factory('Encore', function () {
                return {
                    getAccountUsers: function () {
                        return {
                            users: [
                                { username: 'testaccountuser' },
                                { username: 'hub_cap' }
                            ]
                        };
                    }
                };
            })
            .factory('encoreRoutes', function ($q) {
                var mockReturn = true;
                return {
                    isActiveByKey: function () {
                        var deferred = $q.defer();
                        deferred.resolve(mockReturn);
                        return deferred.promise;
                    },

                    setMock: function (mockValue) {
                        mockReturn = mockValue;
                    }
                };
            });

        module('encore.ui.rxApp', 'testDirective');
        module('templates/rxAccountUsers.html');

        inject(function ($rootScope, $compile, $templateCache, $location, $route, $q, encoreRoutes) {
            rootScope = $rootScope;
            compile = $compile;
            scope = $rootScope.$new();
            q = $q;
            encoreRoutesMock = encoreRoutes;

            $location.url('http://server/cloud/');
            $route.current = {};
            $route.current.params = {
                accountNumber: 323676,
                user: 'hub_cap'
            };

            scope.currentUser = 'hub_cap';
            scope.users = [
                { username: 'testaccountuser' },
                { username: 'hub_cap' }
            ];

            var accountUsersHtml = $templateCache.get('templates/rxAccountUsers.html');
            $templateCache.put('/templates/rxAccountUsers.html', accountUsersHtml);
        });

        userSelect = helpers.createDirective(angular.element(validTemplate), compile, scope);
        users = userSelect.find('option');
    });

    it('should have two account users', function () {
        expect(users).to.have.length(2);
        expect(users[0].text).to.equal('testaccountuser');
        expect(users[1].text).to.equal('hub_cap');
    });

    it('should select current user', function () {
        expect(users[1]).to.be.selected;
    });

    it('should not render when encoreRoutes.isActiveByKey() returns false', function () {
        encoreRoutesMock.setMock(false);
        userSelect = helpers.createDirective(angular.element(validTemplate), compile, scope);
        expect(userSelect.find('select')).to.have.length(0);
    });

});

describe('rxStatusTags - custom status tags', function () {
    var rxstatusTags;

    beforeEach(function () {

        // Initialize a fake module to get at its config block
        // This is the main purpose of this whole `describe` block,
        // to test that this can be set in a `.config`
        angular.module('testApp', function () {})
            .config(function (rxStatusTagsProvider) {
                rxStatusTagsProvider.addStatus({
                    key: 'testKey',
                    class: 'test-class',
                    text: 'test text'
                });
            });
        module('encore.ui.rxApp', 'testApp');

        // Inject in angular constructs
        inject(function (rxStatusTags) {
            rxstatusTags = rxStatusTags;
        });

    });

    it('should know about testKey', function () {
        var config = rxstatusTags.getTag('testKey');
        expect(config.text).to.equal('test text');
        expect(config.class).to.equal('test-class');
        expect(rxstatusTags.hasTag('testKey')).to.be.true;
    });

    it('should return empty text and class values for unknown keys', function () {
        var config = rxstatusTags.getTag('missingKey');
        expect(config.text).to.equal('');
        expect(config.class).to.equal('');
        expect(rxstatusTags.hasTag('missingKey')).to.be.false;

    });

});

describe('rxStatusTag', function () {
    var scope, compile, rootScope, el, emptyEl, badEl;
    var standardTemplate = '<rx-status-tag status="alpha"></rx-status-tag>';
    var emptyTemplate = '<rx-status-tag></rx-status-tag>';
    var badTemplate = '<rx-status-tag status="badtag"></rx-status-tag>';

    beforeEach(function () {
        // load module
        module('encore.ui.rxApp');

        // Inject in angular constructs
        inject(function ($rootScope, $compile) {
            rootScope = $rootScope;
            compile = $compile;
        });

        scope = rootScope.$new();

        el = helpers.createDirective(standardTemplate, compile, scope);
        emptyEl = helpers.createDirective(emptyTemplate, compile, scope);
        badEl = helpers.createDirective(badTemplate, compile, scope);
    });

    it('draws an alpha tag', function () {
        var span = el.find('.status-tag');

        expect(span.text(), 'text').to.equal('Alpha');
    });

    it('does not draw the tag when no status key is passed in', function () {
        var span = emptyEl.find('.status-tag');
        expect(span.length).to.equal(0);
    });

    it('does not draw the tag when an unknown status key is provided', function () {
        var span = badEl.find('.status-tag');
        expect(span.length).to.equal(0);
    });
});
