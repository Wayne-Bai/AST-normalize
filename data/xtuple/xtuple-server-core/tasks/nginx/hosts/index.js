var lib = require('xtuple-server-lib'),
  _ = require('lodash'),
  fs = require('fs'),
  path = require('path');

/**
 * Append entries to the system hosts file if necessary.
 */
_.extend(exports, lib.task, /** @exports xtuple-server-nginx-hosts */ {

  /** @override */
  executeTask: function (options) {
    var id = lib.util.$(options),
      hosts = fs.readFileSync(path.resolve('/etc/hosts').toString());

    if (!new RegExp(id).test(hosts)) {
      fs.appendFileSync(path.resolve('/etc/hosts'), [
        '# (auto-generated enty by xTuple Installer)',
        '# host mappings for: ' + id,
        '127.0.0.1 ' + options.nginx.hostname,
        '127.0.0.1 ' + options.nginx.domain
      ].join('\n'));
    }
  },

  /** @override */
  uninstall: function (options) {
    // TODO implement
    // TODO remove hosts entries
  }
});
