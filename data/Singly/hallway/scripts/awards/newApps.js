var request = require('request');
var async = require('async');

var lib = require('./lib');

var host;
var auth;
var ignoredUsers;

exports.init = function(_host, _auth, _ignoredUsers) {
  host = _host;
  auth = {Authorization:"Basic " + new Buffer(_auth).toString("base64")};
  ignoredUsers = _ignoredUsers;
  lib.init(_host, _auth, _ignoredUsers);
};

exports.title = 'New apps';

exports.run = function(options, callback) {
  var hours = options.hours;
  lib.getAccounts(hours, function(app) {
    return !(app.notes.appName === 'Default Singly App'
          || app.notes.appName === 'Singly Development Sandbox');
  }, callback);
};

exports.mapRow = function(row) {
  var values = [
    {
      href: 'https://dawg.singly.com/apps/account?id=' + row.id,
      text: row.id,
      truncate: 6
    },
    {
      href: row.profile.url,
      text: row.profile.name || row.profile.handle
    },
    row.profile.location,
    row.profile.email
  ];

  var appsLinks = [];
  var apps = row.profile && row.profile.apps && row.profile.apps.slice(0, 3);
  for (var i in apps) {
    var app = apps[i];
    if (!(app.notes.appName === 'Default Singly App' || app.notes.appName === 'Singly Development Sandbox')) {
      var text = app.notes.appName;
      if (app.notes.package) {
        text += ' (' + Object.keys(app.notes.package)[0] + ')';
      }
      appsLinks.push({
        href: host + '/app/info/' + app.app,
        text: text
      });
    }
  }
  values.push(appsLinks);
  return values;
};

exports.columnNames = ['Account','Name','Loc','Email','Apps'];

function main() {
  var argv = require('optimist')
      ['default']('hours', 24)
      ['default']('host', 'https://dawg.singly.com')
      .demand(['auth'])
      .usage('node scripts/newApps.js --auth dawguser:dawgpass')
      .argv;

  var ignored = argv.ignore || '';
  ignored = ignored.split(',');
  console.error(ignored);
  exports.init(argv.host, argv.auth, ignored);

  exports.run({hours:argv.hours}, function(err, rows) {
    if (err) return console.error(err);
    exports.print(rows, console.log, console.error);
  });
}

if (process.argv[1] === __filename) {
  main();
}
