var path = require('path');
var jade = require('jade');
var middleware = require('web/middleware');
var _ = require('underscore');
var utils = require('utils').common;
var async = require('async');

/**
 * Runs a view test. Calls assert and test.finish().
 *
 * @param {object} test a Whiskey test object
 * @param {object} assert a Whiskey assert object
 * @param {string} view the filename of the view relative to view_path
 * @param {string} devopsjson the filename of the devopsjson file relative to fixture_path
 * @param {array} An array of objects containing:
 *    name: {string} name of the middleware
 *    mock_maker: {function} a mock of utils.request_maker (see ./tests/middleware_api_mocks/README.md)
 * @param {boolean} xhr_error if True, call the on_error callback rather than on_success
 * @param {boolean} data_error if True and if on_success is called, provide errorful data
 * @param {function} fn (optional) a callback that takes the rendered html response as an argument
 */
exports.test_view = function(test, assert, view, devopsjson, fn) {
  var view_path, fixtures_path, devops_path;

  middlewares = [middleware.injector.injector_middleware];

  view_path = path.join(__dirname, '..', '..', 'lib', 'web', 'views', view);
  fixtures_path = path.join('extern', 'devopsjson', 'examples');
  devops_path = path.join(fixtures_path, devopsjson);

  var mock_req = {
    params: {
      project: devopsjson
    },
    url: view
  };

  var res = new utils.mock_res();
  // call view-specific middleware
  var wrapped_middleware = [];
  _.each(middlewares, function(middleware) {
    wrapped_middleware.push(function(cb) {
      middleware(mock_req, res, cb);
    });
  });
  async.series(
    wrapped_middleware,
    function() {
      // this would get dumped in by express
      _.extend(mock_req.devops, res._locals);
      jade.renderFile(view_path, mock_req.devops, function(er, html) {
        assert.ifError(er, er);
        if (fn) {
          fn(html);
        }
    });

    test.finish();
  });
};