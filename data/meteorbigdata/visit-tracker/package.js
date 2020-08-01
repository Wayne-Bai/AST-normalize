Package.describe({
  name: 'bigdata:visit-tracker',
  summary: "Log visits for internal analytics and conversion attribution (GeoIP, UserAgent, Traffic Source)",
  version: '1.0.0',
  git: 'https://github.com/meteorbigdata/visit-tracker.git'
});

Npm.depends({
  "ua-parser": "0.3.3",
  "geoip-lite": "1.1.3"
});

Package.on_use(function (api, where) {

  api.versionsFrom('METEOR@1.0');

  api.use([
    'mongo',
    'matb33:collection-hooks@0.7.9',
    'gadicohen:headers@0.0.27'
  ]);

  api.export('VisitTracker');

  api.add_files('visit-tracker.js', ['server', 'client']);
  api.add_files('server.js', ['server']);
  api.add_files('client.js', ['client']);
});