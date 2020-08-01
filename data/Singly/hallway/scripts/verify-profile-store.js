var async = require('async');
var program = require('commander');

program
  .usage('[--fix]')
  .option('--fix', 'write missing config data to the KV-store')
  .option('--exit-on-error', 'exit the script as soon as an error is detected')
  .option('--workers <num>', 'select how many workers run at once')
  .parse(process.argv);

var DEFAULT_WORKERS = 5;

var logger = require('logger').logger('verify-profile-store');
var profileManager = require('profileManager');
var dal = require('dal');

var total   = 0;
var present = 0;
var missing = 0;
var errors  = 0;
var empty   = 0;
var fixed   = 0;

function reportError(pid, err) {
  logger.warn('Error', pid);
  logger.error(err);
  errors++;
  if (program.exitOnError) {
    printResults();
    process.exit(1);
  }
}

function checkProfile(pid, callback) {
  if (/^\s*$/.test(pid)) {
    empty++;
    return callback();
  }

  logger.debug('Testing', pid);
  profileManager.genGetWithoutCreate(pid, function(err, profile) {
    if (err) {
      reportError(pid, err);
      return callback();
    }

    if (profile) {
      present++;
      return callback();
    }

    logger.warn('Missing', pid);
    missing++;
    if (program.fix) saveProfile(pid, callback);
    else return callback();
  });
}

function saveProfile(pid, callback) {
  profileManager.allSet(pid, {}, {}, function(err) {
    if (err) reportError(pid, err);
    else fixed++;
    return callback();
  });
}

function printResults(err) {
  if (err) logger.error(err);
  logger.info('Done');
  logger.info('Total:',    total);
  logger.info('Present:',  present);
  logger.info('Missing:',  missing);
  if (program.fix) logger.info('Fixed:',    fixed);
  logger.info('Errors:',   errors);
  logger.info('Empty:',    empty);
  process.exit(0);
}

function noop() {}

profileManager.init(function() {
  dal.query('SELECT id FROM Profiles', [], function(err, rows) {
    var pids = rows.map(function(row) {
      return row.id;
    });

    total = pids.length;
    logger.info('Testing', total, 'profiles');

    var workers = program.workers || DEFAULT_WORKERS;
    logger.info('Running', workers, 'workers');

    var queue = async.queue(checkProfile, workers);
    queue.drain = printResults;

    pids.forEach(function(pid) {
      queue.push(pid, noop);
    });
  });
});
