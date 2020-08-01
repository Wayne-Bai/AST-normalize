var lib = require('xtuple-server-lib'),
  fs = require('fs'),
  log = require('npmlog'),
  _ = require('lodash');

/**
 * Fork an existing database; sets arguments for the restore task.
 */
_.extend(exports, lib.task, /** @exports xtuple-server-pg-fork */ {

  /**
   * @param options.pg.backup.backupFile
   * @param options.pg.dbname
   *
   * @override
   */
  executeTask: function (options) {
    var backupMoment = options.pg.backup.backupMoment;
    var backupFile = options.pg.backup.backupFile;

    if (!_.isEmpty(backupFile) && fs.existsSync(backupFile)) {
      options.pg.infile = options.pg.backup.backupFile;
    }
    else {
      log.error('pg-fork', options.pg.backup.backupFile, 'does not exist');
      log.error('pg-fork', 'I need this file in order to continue the copying process');
      log.error('pg-fork', 'Assuming that a successful backup did not occur, and bailing out');
      throw new Error(options.pg.backupFile + ' does not exist');
    }

    // options.pg.dbname now represents the database to be restored
    if (_.isDate(backupMoment) && !_.isEmpty(options.pg.dbname)) {
      options.pg.dbname = lib.util.getForkName(options, false, backupMoment);
    }
    else {
      log.error('pg-fork', 'backupMoment is', backupMoment);
      log.error('pg-fork', 'options.pg.dbname is', options.pg.dbname);
      throw new Error('backupMoment or options.pg.dbname is invalid');
    }
  }
});
