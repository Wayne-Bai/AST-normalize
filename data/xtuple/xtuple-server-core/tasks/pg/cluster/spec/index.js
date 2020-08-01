var assert = require('assert'),
  _ = require('lodash'),
  exec = require('child_process').execSync;

exports.afterExecute = function (options) {

  it('pg.cluster.name should be set correctly', function () {
    var scalarVersion = options.xt.version.replace(/\./g, '');
    assert.ok(new RegExp(options.xt.name + "-" + scalarVersion + "-").test(options.pg.cluster.name));
  });

  it('should be able to control my personal pg cluster', function () {
    exec('sudo -u {xt.name} pg_ctlcluster {pg.version} {pg.cluster.name} reload'
      .format(options));
  });
};
