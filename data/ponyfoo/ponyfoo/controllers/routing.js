'use strict';

var taunus = require('taunus');
var taunusExpress = require('taunus-express');
var transports = require('transports');
var routes = require('./routes');
var statusHealth = require('./api/status/health');
var verifyAccountEmail = require('./account/verifyEmail');
var registerAccount = require('./account/register');
var bioUpdate = require('./api/account/bioUpdate');
var markdownImageUpload = require('./api/markdown/images');
var authorEmail = require('./api/author/email');
var articleInsert = require('./api/articles/insert');
var articleUpdate = require('./api/articles/update');
var articleRemove = require('./api/articles/remove');
var articleCompute = require('./api/articles/compute');
var articleFeed = require('./articles/feed');
var commentInsert = require('./api/comments/insert');
var commentRemove = require('./api/comments/remove');
var subscriberInsert = require('./api/subscribers/insert');
var subscriberConfirm = require('./api/subscribers/confirm');
var subscriberRemove = require('./api/subscribers/remove');
var apiErrorNotFound = require('./api/error/notFound');
var sitemap = require('./sitemap/sitemap');
var authOnly = require('./account/only');
var authorOnly = require('./author/only');
var errors = require('../lib/errors');
var env = require('../lib/env');
var redirects = require('./redirects');
var getDefaultViewModel = require('./getDefaultViewModel');
var verifyForm = require('./verifyForm');
var layout = require('../.bin/views/server/layout/layout');
var production = env('NODE_ENV') === 'production';

module.exports = function (app) {
  app.get('/api/status/health', statusHealth);
  app.get('/articles/feed', articleFeed);
  app.get('/sitemap.xml', sitemap);

  app.put('/api/markdown/images', markdownImageUpload);

  app.put('/api/articles', authorOnly, articleInsert);
  app.patch('/api/articles/:slug', authorOnly, articleUpdate);
  app.delete('/api/articles/:slug', authorOnly, articleRemove);
  app.post('/api/articles/compute-relationships', authorOnly, articleCompute);

  app.put('/api/articles/:slug/comments', commentInsert);
  app.post('/api/articles/:slug/comments', verifyForm, commentInsert);
  app.delete('/api/articles/:slug/comments/:id', authorOnly, commentRemove);

  app.put('/api/subscribers', subscriberInsert);
  app.post('/api/subscribers', verifyForm, subscriberInsert);
  app.get('/api/subscribers/:hash/confirm', subscriberConfirm);
  app.get('/api/subscribers/:hash/unsubscribe', subscriberRemove);

  app.post('/api/email', authorOnly, authorEmail);

  app.patch('/api/account/bio', authOnly, bioUpdate);
  app.all('/api/*', apiErrorNotFound);

  app.get('/account/verify-email/:token([a-f0-9]{24})', verifyAccountEmail);

  // app.post('/account/password-reset', requestPasswordReset);
  // app.get('/account/password-reset/:token([a-f0-9]{24})', validateToken);
  // app.post('/account/password-reset/:token([a-f0-9]{24})', resetPassword);

  transports.routing(app, registerAccount);
  redirects.setup(app);

  taunusExpress(taunus, app, {
    routes: routes,
    layout: layout,
    getDefaultViewModel: getDefaultViewModel,
    plaintext: {
      root: 'article', ignore: 'footer,.mm-count,.at-meta'
    },
    deferMinified: production
  });
  app.use(errors.handler);
};
