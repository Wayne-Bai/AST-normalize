/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'sinon',
  'underscore',
  'backbone',
  'router',
  'views/sign_in',
  'views/sign_up',
  'views/ready',
  'lib/constants',
  'lib/metrics',
  'lib/ephemeral-messages',
  'lib/promise',
  'models/reliers/relier',
  'models/user',
  'models/form-prefill',
  'models/auth_brokers/base',
  '../../mocks/window',
  '../../lib/helpers'
],
function (chai, sinon, _, Backbone, Router, SignInView, SignUpView, ReadyView,
      Constants, Metrics, EphemeralMessages, p, Relier,
      User, FormPrefill, NullBroker, WindowMock, TestHelpers) {
  /*global describe, beforeEach, afterEach, it*/
  var assert = chai.assert;

  describe('lib/router', function () {
    var router;
    var windowMock;
    var origNavigate;
    var navigateUrl;
    var navigateOptions;
    var metrics;
    var relier;
    var broker;
    var user;
    var formPrefill;

    beforeEach(function () {
      navigateUrl = navigateOptions = null;

      $('#container').empty().html('<div id="stage"></div>');

      windowMock = new WindowMock();
      metrics = new Metrics();

      relier = new Relier({
        window: windowMock
      });
      user = new User();
      formPrefill = new FormPrefill();

      broker = new NullBroker();

      router = new Router({
        window: windowMock,
        metrics: metrics,
        relier: relier,
        broker: broker,
        user: user,
        formPrefill: formPrefill
      });

      origNavigate = Backbone.Router.prototype.navigate;
      Backbone.Router.prototype.navigate = function (url, options) {
        navigateUrl = url;
        navigateOptions = options;
      };
    });

    afterEach(function () {
      metrics.destroy();
      windowMock = router = navigateUrl = navigateOptions = metrics = null;
      Backbone.Router.prototype.navigate = origNavigate;
      $('#container').empty();
    });

    describe('navigate', function () {
      it('Tells the router to navigate to a page', function () {
        windowMock.location.search = '';
        router.navigate('/signin');
        assert.equal(navigateUrl, '/signin');
        assert.deepEqual(navigateOptions, { trigger: true });
      });

      it('preserves window search parameters across screen transition',
        function () {
          windowMock.location.search = '?context=' + Constants.FX_DESKTOP_CONTEXT;
          router.navigate('/forgot');
          assert.equal(navigateUrl, '/forgot?context=' + Constants.FX_DESKTOP_CONTEXT);
          assert.deepEqual(navigateOptions, { trigger: true });
        });
    });

    describe('redirectToSignupOrSettings', function () {
      it('replaces current page with the signup page if there is no current account', function () {
        windowMock.location.search = '';
        router.redirectToSignupOrSettings();
        assert.equal(navigateUrl, '/signup');
        assert.deepEqual(navigateOptions, { trigger: true, replace: true });
      });

      it('replaces the current page with the settings page if there is a current account', function () {
        windowMock.location.search = '';
        sinon.stub(user, 'getSignedInAccount', function () {
          return user.initAccount({
            sessionToken: 'abc123'
          });
        });
        router.redirectToSignupOrSettings();
        assert.equal(navigateUrl, '/settings');
        assert.deepEqual(navigateOptions, { trigger: true, replace: true });
      });
    });

    describe('showView, then another showView', function () {
      var signInView, signUpView;

      beforeEach(function () {
        signInView = new SignInView({
          metrics: metrics,
          window: windowMock,
          user: user,
          relier: relier,
          router: router,
          broker: broker,
          screenName: 'signin',
          formPrefill: formPrefill
        });
        signUpView = new SignUpView({
          metrics: metrics,
          window: windowMock,
          user: user,
          relier: relier,
          router: router,
          broker: broker,
          screenName: 'signup',
          formPrefill: formPrefill
        });
      });

      afterEach(function () {
        signInView = signUpView = null;
      });

      it('shows a view, then shows the new view', function () {
        return router.showView(signInView)
            .then(function () {
              assert.ok($('#fxa-signin-header').length);

              return router.showView(signUpView);
            })
            .then(function () {
              assert.ok($('#fxa-signup-header').length);

              assert.isTrue(TestHelpers.isEventLogged(metrics, 'screen.signin'));
              assert.isTrue(TestHelpers.isEventLogged(metrics, 'screen.signup'));
            });
      });

      it('calls broker.afterLoaded only after initial view', function () {
        sinon.stub(broker, 'afterLoaded', function () {
        });

        return router.showView(signInView)
            .then(function () {
              assert.ok($('#fxa-signin-header').length);
              assert.isTrue(broker.afterLoaded.called);

              return router.showView(signUpView);
            })
            .then(function () {
              assert.ok($('#fxa-signup-header').length);
              assert.isTrue(broker.afterLoaded.calledOnce);
            });
      });

      it('does not call broker.afterLoaded if the initial view render fails', function () {
        var boom = new Error('boom');
        sinon.stub(broker, 'afterLoaded', function () { });
        sinon.stub(signInView, 'navigate', function () { });

        sinon.stub(signInView, 'afterRender', function () {
          throw boom;
        });

        return router.showView(signInView)
            .then(function () {
              assert.isFalse(broker.afterLoaded.called);
              assert.isTrue(signInView.navigate.calledWith('unexpected_error', {
                error: boom
              }));

              return router.showView(signUpView);
            })
            .then(function () {
              assert.isTrue(broker.afterLoaded.calledOnce);
            });
      });
    });

    describe('showView', function () {
      var view;

      beforeEach(function () {
        view = new SignUpView({
          metrics: metrics,
          window: windowMock,
          router: router,
          user: user,
          // ensure there is no cross talk with other tests.
          ephemeralMessages: new EphemeralMessages(),
          relier: relier,
          broker: broker,
          screenName: 'signup',
          formPrefill: formPrefill
        });
      });

      afterEach(function () {
        view = null;
      });

      it('does not append the view to the DOM if the view says it is not shown', function () {
        var origRender = view.render;
        sinon.stub(view, 'render', function () {
          // synthesize the original render occuring but force it
          // to say it should not be displayed.
          return origRender.call(view)
            .then(function () {
              return p(false);
            });
        });

        return router.showView(view)
          .then(function () {
            assert.equal($('#fxa-signup-header').length, 0);
          });
      });

      it('navigates to unexpected error view on beforeRender errors', function () {
        view.beforeRender = function () {
          throw new Error('boom');
        };

        var navigate = view.navigate;
        view.navigate = function (url, options) {
          assert.equal(options.error.message, 'boom');
          return navigate.call(this, url, options);
        };

        return router.showView(view)
          .then(function () {
            assert.include(navigateUrl, 'unexpected_error');
          });
      });

      it('navigates to unexpected error view on context errors', function () {
        view.context = function () {
          throw new Error('boom');
        };

        var navigate = view.navigate;
        view.navigate = function (url, options) {
          assert.equal(options.error.message, 'boom');
          return navigate.call(this, url, options);
        };

        return router.showView(view)
          .then(function () {
            assert.include(navigateUrl, 'unexpected_error');
          });
      });

      it('navigates to unexpected error view on afterRender errors', function () {
        view.afterRender = function () {
          throw new Error('boom');
        };

        var navigate = view.navigate;
        view.navigate = function (url, options) {
          assert.equal(options.error.message, 'boom');
          return navigate.call(this, url, options);
        };

        return router.showView(view)
          .then(function () {
            assert.include(navigateUrl, 'unexpected_error');
          });
      });

      it('only logs a screen that has children once', function () {
        view = new ReadyView({
          metrics: metrics,
          window: windowMock,
          router: router,
          user: user,
          // ensure there is no cross talk with other tests.
          ephemeralMessages: new EphemeralMessages(),
          relier: relier,
          broker: broker,
          type: 'sign_up',
          screenName: 'signup-complete'
        });

        return router.showView(view)
          .then(function () {
            assert.equal(metrics.getFilteredData().events.length, 1);
            assert.isTrue(TestHelpers.isEventLogged(metrics,
                'screen.signup-complete'));
          });
      });
    });

    describe('pathToScreenName', function () {
      it('strips leading /', function () {
        assert.equal(router.fragmentToScreenName('/signin'), 'signin');
      });

      it('strips trailing /', function () {
        assert.equal(router.fragmentToScreenName('signup/'), 'signup');
      });

      it('converts middle / to .', function () {
        assert.equal(router.fragmentToScreenName('/legal/tos/'), 'legal.tos');
      });

      it('converts _ to -', function () {
        assert.equal(router.fragmentToScreenName('complete_sign_up'),
            'complete-sign-up');
      });

      it('strips search parameters', function () {
        assert.equal(router.fragmentToScreenName('complete_sign_up?email=testuser@testuser.com'),
            'complete-sign-up');
      });

    });

    describe('onAnchorClick', function () {
      var event;

      beforeEach(function () {
        $('#container').empty().append('<a href="/signup">Sign up</a>');

        event = $.Event('click');
        event.currentTarget = $('a[href="/signup"]');
      });

      function testNoNavigation() {
        sinon.spy(router, 'navigate');
        router.onAnchorClick(event);
        assert.isFalse(router.navigate.called);
      }

      it('does nothing if the event\'s default is prevented', function () {
        sinon.stub(event, 'isDefaultPrevented', function () {
          return true;
        });

        testNoNavigation();
      });

      it('does nothing if the the alt key is depressed during click', function () {
        event.altKey = true;

        testNoNavigation();
      });

      it('does nothing if the the ctrl key is depressed during click', function () {
        event.ctrlKey = true;

        testNoNavigation();
      });

      it('does nothing if the the meta key is depressed during click', function () {
        event.metaKey = true;

        testNoNavigation();
      });

      it('does nothing if the the shift key is depressed during click', function () {
        event.shiftKey = true;

        testNoNavigation();
      });

      it('navigates otherwise', function () {

        sinon.stub(router, 'navigate', function () {
          return;
        });

        router.onAnchorClick(event);

        assert.isTrue(router.navigate.calledWith('signup'));
      });
    });

    describe('createAndShowView', function () {
      it('creates and shows a view', function () {
        return router.createAndShowView(SignUpView, { canGoBack: false })
          .then(function () {
            assert.equal($('#fxa-signup-header').length, 1);
          });
      });
    });
  });
});


