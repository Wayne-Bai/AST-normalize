/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*globals describe,it,before,beforeEach */
var expect = require('chai').expect;
var routerMixin;
var contextMock;
var historyMock;
var scrollToMock;
var jsdom = require('jsdom');
var lodash = require('lodash');
var React = require('react');
var testResult;

contextMock = {
    executeAction: function (action, payload) {
        testResult.dispatch = {
            action: action,
            payload: payload
        };
    },
    makePath: function(){}
};

historyMock = function (url, state) {
    return {
        getUrl: function () {
            return url || '/the_path_from_history';
        },
        getState: function () {
            return state;
        },
        on: function (listener) {
            testResult.historyMockOn = listener;
        },
        pushState: function (state, title, url) {
            testResult.pushState = {
                state: state,
                title: title,
                url: url
            };
        },
        replaceState: function (state, title, url) {
            testResult.replaceState = {
                state: state,
                title: title,
                url: url
            };
        }
    };
};

scrollToMock = function (x, y) {
    testResult.scrollTo = {x: x, y: y};
};

describe ('RouterMixin', function () {

    beforeEach(function () {
        routerMixin = require('../../../lib/RouterMixin');
        routerMixin.props = {context: contextMock};
        routerMixin.state = {
            route: {}
        };
        global.document = jsdom.jsdom('<html><body></body></html>');
        global.window = global.document.parentWindow;
        global.navigator = global.window.navigator;
        global.window.scrollTo = scrollToMock;
        testResult = {};
    });

    afterEach(function () {
        delete global.window;
        delete global.document;
        delete global.navigator;
    });

    it('contextTypes defined', function () {
        expect(routerMixin.contextTypes.executeAction).to.equal(React.PropTypes.func);
        expect(routerMixin.contextTypes.makePath).to.equal(React.PropTypes.func);
    });

    it('childContextTypes defined', function () {
        expect(routerMixin.childContextTypes.makePath).to.equal(React.PropTypes.func);
    });

    describe('getChildContext()', function() {
        it ('exposes childContextTypes to child context', function() {
            routerMixin.props = {context: contextMock };
            var childContext = routerMixin.getChildContext();
            Object.keys(routerMixin.childContextTypes).forEach(function (key) {
              expect(childContext[key]).to.be.a('function');
            }, this);
        });
    });

    describe('componentDidMount()', function () {
        it ('listen to popstate event', function () {
            routerMixin.componentDidMount();
            expect(routerMixin._historyListener).to.be.a('function');
            window.dispatchEvent({_type: 'popstate', state: {params: {a: 1}}});
            expect(testResult.dispatch.action).to.be.a('function');
            expect(testResult.dispatch.payload.type).to.equal('popstate');
            expect(testResult.dispatch.payload.url).to.equal(window.location.pathname);
            expect(testResult.dispatch.payload.params).to.eql({a: 1});
        });
        it ('listen to scroll event', function (done) {
            routerMixin.props = {context: contextMock, historyCreator: function() { return historyMock('/foo'); }};
            routerMixin.componentDidMount();
            expect(routerMixin._scrollListener).to.be.a('function');
            window.dispatchEvent({_type: 'scroll'});
            window.dispatchEvent({_type: 'scroll'});
            window.setTimeout(function() {
                expect(testResult.replaceState).to.eql({state: {scroll: {x: 0, y: 0}}, title: undefined, url: undefined});
                done();
            }, 250);
        });
        it ('dispatch navigate event for pages that url does not match', function (done) {
            routerMixin.props = {context: contextMock, checkRouteOnPageLoad: true, historyCreator: function() { return historyMock(); }};
            var origPushState = window.history.pushState;
            routerMixin.state = {
                route: {
                    url: '/the_path_from_state'
                }
            };
            routerMixin.componentDidMount();
            window.setTimeout(function() {
                expect(testResult.dispatch.action).to.be.a('function');
                expect(testResult.dispatch.payload.type).to.equal('pageload');
                expect(testResult.dispatch.payload.url).to.equal('/the_path_from_history');
                done();
            }, 10);
        });
        it ('dispatch navigate event for pages that url does not match; executeAction on this.context', function (done) {
            routerMixin.props = {checkRouteOnPageLoad: true, historyCreator: function() { return historyMock(); }};
            routerMixin.context = contextMock;
            var origPushState = window.history.pushState;
            routerMixin.state = {
                route: {
                    url: '/the_path_from_state'
                }
            };
            routerMixin.componentDidMount();
            window.setTimeout(function() {
                expect(testResult.dispatch.action).to.be.a('function');
                expect(testResult.dispatch.payload.type).to.equal('pageload');
                expect(testResult.dispatch.payload.url).to.equal('/the_path_from_history');
                done();
            }, 10);
        });
        it ('does not dispatch navigate event for pages with matching url', function (done) {
            routerMixin.props = {context: contextMock, historyCreator: function() { return historyMock(); }};
            var origPushState = window.history.pushState;
            routerMixin.state = {
                route: {
                    url: '/the_path_from_history'
                }
            };
            routerMixin.componentDidMount();
            window.setTimeout(function() {
                expect(testResult.dispatch).to.equal(undefined, JSON.stringify(testResult.dispatch));
                done();
            }, 10);
        });
    });

    describe('componentWillUnmount()', function () {
        it ('stop listening to popstate event', function () {
            routerMixin.componentDidMount();
            expect(routerMixin._historyListener).to.be.a('function');
            routerMixin.componentWillUnmount();
            expect(routerMixin._historyListener).to.equal(null);
            window.dispatchEvent({_type: 'popstate', state: {params: {a: 1}}});
            expect(testResult.dispatch).to.equal(undefined);
        });
    });

    describe('componentDidUpdate()', function () {
        it ('no-op on same route', function () {
            var prevRoute = {url: '/foo'},
                newRoute = {url: '/foo'};
            routerMixin.props = {context: contextMock, historyCreator: function() { return historyMock('/foo'); }};
            routerMixin.state = {route: newRoute};
            routerMixin.componentDidMount();
            routerMixin.componentDidUpdate({}, {route: prevRoute});
            expect(testResult.pushState).to.equal(undefined);
        });
        it ('do not pushState, navigate.type=popstate', function () {
            var oldRoute = {url: '/foo'},
                newRoute = {url: '/bar', navigate: {type: 'popstate'}};
            routerMixin.props = {context: contextMock, historyCreator: function() { return historyMock('/foo'); }};
            routerMixin.state = {route: newRoute};
            routerMixin.componentDidMount();
            routerMixin.componentDidUpdate({},  {route: oldRoute});
            expect(testResult.pushState).to.equal(undefined);
        });
        it ('update with different route, navigate.type=click, reset scroll position', function () {
            var oldRoute = {url: '/foo'},
                newRoute = {url: '/bar', navigate: {type: 'click'}};
            routerMixin.props = {
                context: contextMock,
                historyCreator: function() {
                    return historyMock('/foo');
                }
            };
            routerMixin.state = {route: newRoute};
            routerMixin.componentDidMount();
            routerMixin.componentDidUpdate({},  {route: oldRoute});
            expect(testResult.pushState).to.eql({state: {params: {}, scroll: {x: 0, y: 0}}, title: null, url: '/bar'});
            expect(testResult.scrollTo).to.eql({x: 0, y: 0});
        });
        it ('update with different route, navigate.type=click, enableScroll=false, do not reset scroll position', function () {
            var oldRoute = {url: '/foo'},
                newRoute = {url: '/bar', navigate: {type: 'click'}};
            routerMixin.props = {
                context: contextMock,
                enableScroll: false,
                historyCreator: function() {
                    return historyMock('/foo');
                }
            };
            routerMixin.state = {route: newRoute};
            routerMixin.componentDidMount();
            routerMixin.componentDidUpdate({},  {route: oldRoute});
            expect(testResult.pushState).to.eql({state: {params: {}}, title: null, url: '/bar'});
            expect(testResult.scrollTo).to.equal(undefined);
        });
        it ('update with different route, navigate.type=default, reset scroll position', function () {
            var oldRoute = {url: '/foo'},
                newRoute = {url: '/bar'};
            routerMixin.props = {
                context: contextMock,
                historyCreator: function() {
                    return historyMock('/foo');
                }
            };
            routerMixin.state = {route: newRoute};
            routerMixin.componentDidMount();
            routerMixin.componentDidUpdate({},  {route: oldRoute});
            expect(testResult.pushState).to.eql({state: {params: {}, scroll: {x: 0, y: 0}}, title: null, url: '/bar'});
            expect(testResult.scrollTo).to.eql({x: 0, y: 0});
        });
        it ('update with different route, navigate.type=default, enableScroll=false, do not reset scroll position', function () {
            var oldRoute = {url: '/foo'},
                newRoute = {url: '/bar'};
            routerMixin.props = {
                context: contextMock,
                enableScroll: false,
                historyCreator: function() {
                    return historyMock('/foo');
                }
            };
            routerMixin.state = {route: newRoute};
            routerMixin.componentDidMount();
            routerMixin.componentDidUpdate({},  {route: oldRoute});
            expect(testResult.pushState).to.eql({state: {params: {}}, title: null, url: '/bar'});
            expect(testResult.scrollTo).to.equal(undefined);
        });
        it ('do not pushState, navigate.type=popstate, restore scroll position', function () {
            var oldRoute = {url: '/foo'},
                newRoute = {url: '/bar', navigate: {type: 'popstate'}};
            routerMixin.props = {
                context: contextMock,
                historyCreator: function() {
                    return historyMock('/foo', {scroll: {x: 12, y: 200}});
                }
            };
            routerMixin.state = {route: newRoute};
            routerMixin.componentDidMount();
            routerMixin.componentDidUpdate({}, {route: oldRoute});
            expect(testResult.pushState).to.equal(undefined);
            expect(testResult.scrollTo).to.eql({x: 12, y: 200});
        });
        it ('do not pushState, navigate.type=popstate, enableScroll=false, restore scroll position', function () {
            var oldRoute = {url: '/foo'},
                newRoute = {url: '/bar', navigate: {type: 'popstate'}};
            routerMixin.props = {
                context: contextMock,
                enableScroll: false,
                historyCreator: function() {
                    return historyMock('/foo', {scroll: {x: 12, y: 200}});
                }
            };
            routerMixin.state = {route: newRoute};
            routerMixin.componentDidMount();
            routerMixin.componentDidUpdate({}, {route: oldRoute});
            expect(testResult.pushState).to.equal(undefined);
            expect(testResult.scrollTo).to.eql(undefined);
        });
        it ('update with different route, navigate.type=click, with params', function () {
            var oldRoute = {url: '/foo'},
                newRoute = {url: '/bar', navigate: {type: 'click', params: {foo: 'bar'}}};
            routerMixin.props = {context: contextMock, historyCreator: function() { return historyMock('/foo'); }};
            routerMixin.state = {route: newRoute};
            routerMixin.componentDidMount();
            routerMixin.componentDidUpdate({},  {route: oldRoute});
            expect(testResult.pushState).to.eql({state: {params: {foo: 'bar'}, scroll: {x: 0, y:0}}, title: null, url: '/bar'});
        });
        it ('update with same path and different hash, navigate.type=click, with params', function () {
            var oldRoute = {url: '/foo#hash1'},
                newRoute = {url: '/foo#hash2', navigate: {type: 'click', params: {foo: 'bar'}}};
            routerMixin.props = {context: contextMock, historyCreator: function() { return historyMock('/foo#hash1'); }};
            routerMixin.state = {route: newRoute};
            routerMixin.componentDidMount();
            routerMixin.componentDidUpdate({},  {route: oldRoute});
            expect(testResult.pushState).to.eql({state: {params: {foo: 'bar'}, scroll: {x: 0, y:0}}, title: null, url: '/foo#hash2'});
        });
    });

});
