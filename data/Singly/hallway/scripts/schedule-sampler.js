// imports
var async = require('async');
var riak = require('riak');
var redis = require('redis');
var lconfig = require('lconfig');
var pcron = require('pcron');
var profileManager = require('profileManager');
var lutil = require('lutil');

// require certain parameters on the command line
var argv = require('optimist')
  .demand("service")
  .alias('s', 'service')
  .alias('p', 'sample')
  .alias('m', 'maxResults')
  .alias('i', 'ignoreGreater')
  .alias('a', 'appId')
  .describe('s', 'The service to process')
  .describe('p', 'Set the sample rate, by default not sampled')
  .describe('m', 'The maximum number of results to process')
  .describe('i', 'Ignore schedules > x number of seconds')
  .describe('a', 'Filter output to a matching app id')
  .argv;

// the redis and riak clients
var RiakClient = require("riak"), client;
var riakClient = new RiakClient(lconfig.taskman.store.servers,
                                "sched_sample_client");
var redisClient = redis.createClient(lconfig.worker.redis.port,
                                 lconfig.worker.redis.host);
var scheduleDb = lconfig.worker.redis.database;

// array of the min syncles
var minSynclets = [];

/**
 * Logs and error and exits.
 */
function stop(message) {
  console.log("Error: " + message);
  process.exit(1);
}

function sample(results) {

  var sampleSize = argv.sample || 3;
  var maxResults = argv.maxresults || 10;
  var sampled = [];
  for (var i = 0; i < results.length; i++) {
    if ((i % sampleSize) === 0) {
      sampled.push(results[i]);
      if (sampled.length >= maxResults) {
        break;
      }
    }
  }
  return sampled;
}

/**
 * Main procedure that finds the min delta synclets matching a given app id.
 */
function main(pcronInst) {
  redisClient.zrangebyscore(argv.service + "_schedule", "-inf", "+inf",
    function (err, ids) {

      if (err) return stop("Failed zrangebyscore: " + err);

      var sampled = sample(ids, 3, 10);
      console.log(sampled);

      // loop through the albums in sequence
      async.forEachLimit(sampled, 5, function(id, cbIds) {

        // get the tasks for the profile from riak
        riakClient.get("tasks", id + "@" + argv.service, {},
          function (err, res, obj) {
            if (!err) {

              // loop through and find the min delta task
              var minDelta = -1;
              var minSynclet = null;
              var tasks = obj.tasks;
              Object.keys(tasks).forEach(function(syncletName) {
                var synclet = tasks[syncletName];
                var started = synclet.tstart;
                var scheduled = synclet.at;
                var deltaInSeconds = (scheduled - started) / 1000;
                if (deltaInSeconds < minDelta || minDelta < 0) {
                  minDelta = deltaInSeconds;
                  minSynclet = syncletName;
                }
              });

              // apply bounding filter if set
              if (!argv.ignoreGreater || (minDelta < argv.ignoreGreater)) {

                // get the profile for the id, filter by appid
                profileManager.authGet(id + "@" + argv.service, null,
                  function (err, profile) {
                    if (!err && profile && profile.apps) {

                      // add the synclet info to an array, shoud be only min
                      // delta synclets for that match an appid
                      if (!argv.appId || profile.apps[argv.appId]) {
                        var appId = Object.keys(profile.apps)[0];
                        minSynclets.push({
                          "appId" : appId,
                          "profileId": id,
                          "base": id + "@" + argv.service,
                          "name": minSynclet,
                          "delta": minDelta
                        });
                      }
                    }
                    cbIds(null);
                  }
                ); // end profile manager call
              }
              else {
                cbIds(null);
              }
            }
          }
        ); // end riak call
      },
      function(error) {

        // print out the min delta synclets and their times
        for (var i = 0; i < minSynclets.length; i++) {
          var minSyncletObj = minSynclets[i];
          console.log(minSyncletObj.name + "," + minSyncletObj.delta + "," +
            minSyncletObj.base + "," + minSyncletObj.appId);
        }

        // then exit
        process.exit(0);
      });

    } // end redis return function
  ); // end redis zrangebyscore
}

// initialize the profile manager then call the main function to execute
profileManager.init(function (err) {
  if (err) return stop("ProfileManager init failed: " + err);
  redisClient.select(scheduleDb, function (err) {
    if (err) return stop("rclient.select failed: " + err);
    main(pcron.init(redisClient));
  });
});
