var assert = require('assert'),
    fs     = require('fs'),
    lib    = require('xtuple-server-lib'),
    pgrep  = require('pgrep');

exports.afterTask = function (options) {
  it('should configure and start Xvfb', function () {
    assert(fs.existsSync(options.xvfb.serviceFile));
    pgrep.exec({full: false, name: options.xvfb.processName})
         .then(function (pids) { assert(pids && pids.length >= 1); });
  });
};
