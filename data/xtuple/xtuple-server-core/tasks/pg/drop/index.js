var lib = require('xtuple-server-lib'),
  config = require('xtuple-server-pg-config'),
  _ = require('lodash'),
  fs = require('fs');

/**
 * Drop an existing database.
 */
_.extend(exports, lib.task, /** @exports xtuple-server-pg-drop */ {

  options: {
    dbname: {
      required: '<dbname>',
      description: 'Name of database to operate on'
    }
  },

  /** @override */
  beforeTask: function (options) {
    config.discoverCluster(options);
  },

  /** @override */
  executeTask: function (options) {
    lib.pgCli.dropdb(options, options.xt.name, options.pg.dbname);

    // update config.js
    var configObject = require(options.xt.configfile);
    var res = _.pull(configObject.datasource.databases, options.pg.dbname);

    fs.writeFileSync(options.xt.configfile, lib.util.wrapModule(configObject));
  }
});
