var acl = require('acl');
var async = require('async');

var done = 0;
function die(err) {
  if (err) console.log(err);
  console.log(done);
  process.exit(1);
}

// this just resets all app owners, should always be safe to run anytime
acl.getApps(function (err, apps) {
  if (err) return die(err);
  async.forEachSeries(apps, function (app, cbApps) {
    var notes;
    try { notes = JSON.parse(app.notes); } catch (e) { die(e + " " + notes); }
    done++;
    acl.setAppOwners(app.app, notes, cbApps);
  }, die);
});
