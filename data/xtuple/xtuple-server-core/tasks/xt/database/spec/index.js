var _ = require('lodash'),
  task = require('../');

exports.afterTask = function (_options) {
  var options = { };

  describe('source databases', function () {
    this.timeout(300 * 1000); // 5 minutes

    beforeEach(function () {
      options = JSON.parse(JSON.stringify(_options));

      options.xt.demo = false;
      options.xt.quickstart = false;
      options.xt.empty = false;
    });
    it('should be able to build the "quickstart" database from source', function () {
      options.xt.quickstart = true;
      task.beforeInstall(options);
      task.executeTask(options);
      task.afterTask(options);
    });
    it.skip('should be able to build the "empty" database from source', function () {
      options.xt.empty = true;
      task.beforeInstall(options);
      task.executeTask(options);
      task.afterTask(options);
    });
  });
};
