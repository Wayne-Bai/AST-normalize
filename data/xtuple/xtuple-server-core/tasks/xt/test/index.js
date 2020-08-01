var lib = require('xtuple-server-lib'),
  _ = require('lodash'),
  path = require('path'),
  fs = require('fs');

/**
 * Generate the login_data file
 */
_.extend(exports, lib.task, /** @exports xtuple-server-xt-test */ {

  /** @override */
  executeTask: function (options) {
    var configFileName = path.resolve(options.xt.coredir, 'node-datasource/config.js');
    if (options.xt.demo) {
      options.xt.testdb = 'demo_' + options.type;
      exports.writeLoginData(options);
    }
    // try to back up a real pre-existing config.js
    try {
      var configFileStat = fs.lstatSync(configFileName);
      if (configFileStat.isSymbolicLink(configFileName)) {
        fs.unlinkSync(configFileName);
      }
      else if (configFileStat.isFile()) {
        fs.renameSync(configFileName, configFileName + '.' + Date.now());
      }
    } catch (e) {
      try { fs.unlinkSync(configFileName); } catch (e) {}
    }
    fs.symlinkSync(options.xt.configfile, path.resolve(options.xt.coredir, 'node-datasource/config.js'));
  },

  writeLoginData: function (options) {
    fs.writeFileSync(
      path.resolve(options.xt.coredir, 'test/lib/login_data.js'),
      lib.util.wrapModule({
        data: {
          webaddress: 'https://' + options.nginx.hostname + ':' + options.nginx.httpsport,
          username: 'admin',
          pwd: options.xt.adminpw,
          org: options.xt.testdb
        }
      }));
  },
});
