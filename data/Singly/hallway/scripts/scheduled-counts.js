// imports
var async = require('async');
var redis = require('redis');
var lconfig = require('lconfig');
var lutil = require('lutil');

// array of the min syncles
var scheduledCounts = {};

/**
 * Logs and error and exits.
 */
function stop(message) {
  console.log("Error: " + message);
  process.exit(1);
}

var scheduleDb = 3;
var redisClient = redis.createClient(lconfig.worker.redis.port,
                                 lconfig.worker.redis.host);

redisClient.select(scheduleDb, function (err) {
  if (err) return stop("rclient.select failed: " + err);
  redisClient.keys("*_schedule",
    function (err, keys) {
      if (err) return stop("Failed keys: " + err);
      async.forEachLimit(keys, 5, function(key, cbKeys) {
        redisClient.zcount(key, "-inf", "+inf",
          function (err, count) {
            if (!err) {
              scheduledCounts[key] = count;
            }
            cbKeys(null);
          }
        );
      },
      function(error) {

        Object.keys(scheduledCounts).forEach(function(schedule) {
          console.log(schedule + "," + scheduledCounts[schedule]);
        });

        // then exit
        process.exit(0);
      });
    }
  );
});