/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'ember-addon-review',
    environment: environment,
    baseURL: '/',
    locationType: 'auto',
    segment: {
      LOG_EVENT_TRACKING: true
    },
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },

    contentSecurityPolicy: {
      'connect-src': "'self' api.segment.io",
      'font-src': "'self' fonts.gstatic.com",
      'img-src': "'self' secure.gravatar.com usage.trackjs.com www.google-analytics.com",
      'script-src': "'self' 'unsafe-inline' cdn.segment.com cdnjs.cloudflare.com d2zah9y47r7bi2.cloudfront.net www.google-analytics.com",
      'style-src': "'self' 'unsafe-inline' cdnjs.cloudflare.com fonts.googleapis.com"
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {

  }

  return ENV;
};
