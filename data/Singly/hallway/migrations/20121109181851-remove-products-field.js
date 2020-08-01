var fs = require('fs');
var async = require('async');
var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.runSql('SELECT app, notes FROM Apps', function(err, apps) {
    if (err) return callback(err);
    console.log('migrating ' + apps.length + ' apps');
    async.forEachSeries(apps, function(app, cbLoop) {
      backupRow(app, function(err) {
        if (err) return cbLoop('err backing up row:' + JSON.stringify(err));
        updateApp(db, app, cbLoop);
      });
    }, callback);
  });
};

exports.down = function(db, callback) {
  throw new Error('no way street, sucka')
};

function updateApp(db, app, callback) {
  var appID = app.app;
  var notes = app.notes;
  try {
    notes = JSON.parse(notes);
  } catch(e) {
    return process.nextTick(callback.bind(null, 'failed to parse notes'));
  }
  if (!notes.products) {
    return process.nextTick(callback);
  }
  if (!appID) {
    return process.nextTick(callback.bind(null, 'no app ID'));
  }
  delete notes.products;
  notes = JSON.stringify(notes);
  var sql = 'UPDATE Apps SET notes=? WHERE app=? LIMIT 1';
  db.runSql(sql, [notes, appID], callback);
}

function backupRow(row, callback) {
  fs.appendFile('apps_rows_backup.txt', JSON.stringify(row)+'\n', callback);
}
