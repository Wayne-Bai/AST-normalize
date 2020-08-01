Package.describe({
  name:"copleykj:livestamp",
  summary: "jQuery plugin providing auto-updating timeago text to your timestamped HTML elements using Moment.js",
  version: "1.1.6",
  git: "https://github.com/copleykj/meteor-livestamp.git"
});


Package.onUse(function (api, where) {
  api.versionsFrom("METEOR@0.9.0");

    api.use(['templating', 'underscore', 'momentjs:moment@2.9.0'], 'client');

  api.export('livestamp');

  api.addFiles(['lib/livestamp/livestamp.js', 'export-livestamp.js', 'helpers.js'], 'client');
});
