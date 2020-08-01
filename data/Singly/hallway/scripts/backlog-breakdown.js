var argv = require('optimist')
  .alias('s', 'service')
  .alias('p', 'sample')
  .alias('l', 'limit')
  .alias('a', 'app')
  .describe('s', 'The service to process')
  .describe('p', 'Set the sample rate, by default not sampled')
  .describe('m', 'The maximum number of profiles to process per service')
  .describe('a', 'Only consider synclets matching the app ID')
  .argv;

var async = require('async');
var riak = require('riak');
var redis = require('redis');
var _ = require('underscore');

var lconfig = require('lconfig');
var logger = require('logger').logger('backlog-breakdown');
var pcron = require('pcron');
var profileManager = require('profileManager');
var servezas = require('servezas');

var riakClient = new riak(
  lconfig.taskman.store.servers,
  "sched_sample_client"
);
var redisClient = redis.createClient(
  lconfig.worker.redis.port,
  lconfig.worker.redis.host
);
var scheduleDb = lconfig.worker.redis.database;

function stop(err) {
  logger.error(err);
  process.exit(1);
}

function sampleProfiles(results) {
  var sampleSize = argv.sample || 1;
  var limit = argv.limit;
  var sampled = [];

  for (var i = 0; i < results.length; i++) {
    if ((i % sampleSize) === 0) {
      sampled.push(results[i]);
      if (limit && sampled.length >= limit) break;
    }
  }

  return sampled;
}

function findNextSynclet(tasks) {
  return _.min(Object.keys(tasks), function(syncletName) {
    return tasks[syncletName].tstart;
  });
}

function runService(service, cbFn) {
  var schedule = service + '_schedule';
  redisClient.zrangebyscore(schedule, "-inf", "+inf", function (err, ids) {
    if (err) return cbFn(err);

    logger.debug(ids);
    var sampled = sampleProfiles(ids);
    logger.info('Running', sampled.length, 'profiles for', service);

    var histogram = {};

    async.forEachLimit(sampled, 10, function(id, cbMap) {
      var pid = [id, service].join('@');

      // get the tasks for the profile from riak
      riakClient.get("tasks", pid, {}, function (err, res, obj) {
        if (err) return cbMap(err);

        var nextSynclet = findNextSynclet(obj.tasks);
        if (!histogram[nextSynclet]) histogram[nextSynclet] = 0;

        profileManager.authGet(pid, null, function (err, profile) {
          if (err || !profile) return cbMap(err);

          if (!argv.app || (profile.apps && profile.apps[argv.app])) {
            histogram[nextSynclet]++;
          }

          return cbMap();
        });
      });
    }, function(err) {
      return cbFn(err, histogram);
    });
  });
}

function main() {
  var services;
  if (argv.service) services = [argv.service];
  else services = Object.keys(servezas.services());

  var serviceHistogram = {};

  logger.debug('Services:', services);
  async.forEach(services, function(service, cbEach) {
    runService(service, function(err, syncletHistogram) {
      serviceHistogram[service] = syncletHistogram;
      cbEach();
    });
  }, function(err) {
    console.log('\n', JSON.stringify(serviceHistogram, null, 2));
    process.exit();
  });
}

// initialize the profile manager then call the main function to execute
profileManager.init(function (err) {
  if (err) return stop(err);
  redisClient.select(scheduleDb, function (err) {
    if (err) return stop(err);
    servezas.load();
    main();
  });
});
