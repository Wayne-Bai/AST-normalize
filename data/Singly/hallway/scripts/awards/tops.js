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

exports.title = 'Top developers using the API explorer on singly.com';
exports.columnNames = ['Account','Hits', 'Name','Loc','Email','Apps'];

function getHits(appID, hours, callback) {
  getHitsPage(appID, hours, {}, {
      url: host + '/apps/logs',
      qs: {
        key: appID,
        limit:100,
        offset:0,
        since: (Date.now() - (hours * 3600 * 1000))
      },
      headers: auth,
      json: true
    }, callback);
}

function getHitsPage(appID, hours, accounts, req, cb) {
  request.get(req, function(err, res, logs) {
    if(err || !Array.isArray(logs)) return cb(err, logs);
    logs.forEach(function(log) {
      if(!Array.isArray(log.data)) return;
      log.data.forEach(function(hit) {
        if(!hit.act || hit.act === 'auth') return;
        if(!accounts[hit.act]) accounts[hit.act] = 0;
        accounts[hit.act]++;
      });
    });
    if (logs.length === 0 ) return cb(null, accounts);
    req.qs.offset += req.qs.limit;
    getHitsPage(appID, hours, accounts, req, cb);
  });
}

function getCustomApps(account, callback) {
  request.get({
    url: host + '/apps/account',
    headers: auth,
    json: true,
    qs: { id: account }
  }, function(err, resp, accountInfo) {
    if (err) return callback(err, accountInfo);
    if (!accountInfo || !accountInfo.apps) return callback('no apps');
    var nonDef = [];
    var apps = accountInfo.apps;
    for (var id in apps) {
      var app = apps[id];
      if (!(app.appName === 'Default Singly App' || app.appName === 'Singly Development Sandbox')) {
        if (!app.clientId) app.clientId = id;
        nonDef.push(app);
      }
    }
    return callback(null, nonDef);
  });
}

function getProfile(act, callback) {
  request.get({
    url: host + '/proxy/'+act+'/profile',
    headers: auth,
    json:true},
    function(err, resp, profile) {
    return callback(err, profile);
  });
}

exports.run = function(options, callback) {
  var appID = options.appID;
  var hours = options.hours;
  var actprofile = {};

  getHits(appID, hours, function(err, accounts) {
    if (err) return callback('getHits err' + JSON.stringify(err));
    if (!accounts) return callback('account is not an Object' + accounts);
    for(var act in accounts) {
      if(ignoredUsers && ignoredUsers.indexOf(act) !== -1) delete accounts[act];
    }
    async.forEachLimit(Object.keys(accounts), 10, function(act, cbAct) {
      /*if (ignoredUsers && ignoredUsers.indexOf(act) !== -1) {
        return process.nextTick(cbAct);
      }*/
      lib.getProfile(act, function(err, profile) {
        if (err) callback('failed to proxy for profile' + JSON.stringify(err));
        if (!profile) profile = {};
        getCustomApps(act, function(err, customApps) {
          if (err) return cbAct(err);
          if (customApps && customApps.length > 0) profile.apps = customApps;
          actprofile[act] = profile;
          cbAct();
        });
      });
    }, function() {
      var acts = Object.keys(accounts);
      acts.sort(function(a,b){ return accounts[b] - accounts[a]; });
      var rows = [];
      acts.forEach(function(id) {
        rows.push({
          id: id,
          hits: accounts[id],
          profile: actprofile[id]
        });
      });
      return callback(null, rows);
    });
  });
};

exports.mapRow = function(row) {
  var values = [
    {
      href: 'https://dawg.singly.com/apps/account?id='+row.id,
      text: row.id,
      truncate: 6
    },
    row.hits,
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
    appsLinks.push({
      href: host + '/app/info/' + app.clientId,
      text: app.appName
    });
  }
  values.push(appsLinks);
  return values;
};

function main() {
  var argv = require('optimist')
      ['default']('hours', 24)
      ['default']('host', 'https://dawg.singly.com')
      .demand(['auth', 'app-id'])
      .usage('node tops.js --auth dawguser:dawgpass --app-id appid')
      .argv;

  var ignored = argv.ignore || '';
  ignored = ignored.split(',');
  console.error(ignored);
  exports.init(argv.host, argv.auth, ignored);

  exports.run({appID:argv['app-id'], hours:argv.hours}, function(err, rows) {
    if (err) return console.error(err);
    exports.print(rows, console.log, console.error);
  });
}

if (process.argv[1] === __filename) {
  main();
}
