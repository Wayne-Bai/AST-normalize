var fs = require('fs');

var async = require('async');
var dbm = require('db-migrate');
var type = dbm.dataType;

var l = 60000;
var get = 'SELECT * FROM Profiles WHERE service="github" AND LENGTH(auth) > '+l;

exports.up = function(db, callback) {
  var backup = fs.createWriteStream('rows_backup.txt');
  // gets all the rows with "long" (gt 60k) auth fields
  db.runSql(get, function(err, rows) {
    //console.log(rows);
    // loop over them
    async.forEachSeries(rows, function(row, cbEach) {
      //console.error('row', row);
      fs.appendFile('rows_backup.txt', JSON.stringify(row)+'\n', function(err) {
        if (err) return cbEach('couldn\'t backup row! ' + JSON.stringify(err));
        var auth = row.auth;
        var pid = row.id;
        // fix the auth
        var newAuth = fix(auth);

        // a string response is an error
        if (typeof newAuth === 'string') {
          console.error('fail to fix auth for', pid,':', newAuth);
          cbEach(newAuth);
        } else {
          // it worked
          console.log('saving auth for', pid, newAuth);
          saveNewAuth(db, pid, newAuth, cbEach);
        }
      })
    }, callback);
  });
};

var saveSql = 'UPDATE Profiles SET auth=? WHERE id=? LIMIT 1';
function saveNewAuth(db, pid, auth, callback) {
  // ensure there is a pid and it is for a github profile
  if (!(pid && pid.indexOf('@github') > 0)) {
    return process.nextTick(function() {
      callback('invalid pid: ' + pid);
    })
  }
  // just double check that auth is an object and it has a pid
  if (!(auth && typeof auth === 'object' && auth.pid === pid)) {
    return process.nextTick(callback.bind(this, 'invalid auth'));
  }
  var auth = JSON.stringify(auth);

  // save it back out
  db.runSql(saveSql, [auth, pid], callback);
}

exports.down = function(db, callback) {
  // one way street, no going back dude
};

// if it doesn't have these fields, we should inspect it manually and try again
var requireFields = [
  'accessToken',
  'token',
  'clientID',
  'clientSecret',
  'pid',
  'profile',
  'accounts',
  'apps'
];

function fix(auth) {
  // it's gotta be a valid string
  if (!auth || typeof auth !== 'string') return 'invalid auth';
  //auth = auth.substring(0, 2000);
  // this is one pattern that matches how we used to save info
  var eventsStart = auth.indexOf('}},"events":[');
  // this is another pattern
  if (eventsStart === -1) eventsStart = auth.indexOf('}},"userEvents":[');
  // if we didn't find either, bail
  if (eventsStart === -1) {
    return 'couldn\'t find "events"';
  }
  // the object needs to be closed
  auth = auth.substring(0, eventsStart + 2) + '}';
  // parse it just to be sure everything worked
  try {
    auth = JSON.parse(auth);
  } catch(e) {
    return 'couldn\'t parse the substring: ' + auth;
  }
  // make sure all the requiredFields are present
  var missing = missingFields(auth, requireFields);
  // fail if something was missing
  if (missing) return missing;

  // all set!
  return auth;
}

// check for the presence of fields
function missingFields(auth, fields) {
  for (var i in fields) {
    var f = fields[i];
    if (!auth[f]) return 'no ' + f;
  }
}
