var jira = require('./jira.js');
var redis = require('redis');
var url = require('url');

var client;
var redisURL;

if(process.env.REDISCLOUD_URL !== undefined) {
  redisURL = url.parse(process.env.REDISCLOUD_URL);
  client = redis.createClient(redisURL.port, redisURL.hostname, {
    no_ready_check: true
  });
  client.auth(redisURL.auth.split(":")[1]);
} else {
  client = redis.createClient();
}

var logKey = function (id) {
  return 'TrackerTrackerImportLog' + id;
};

exports.getImportableProjects = function (req, res) {
  jira.getImportableProjects(req, res);
};

exports.importProject = function (req, res) {
  var importID = new Date().getTime();
  jira.importProject(importID, req.body);
  res.json({ id: importID });
};

exports.getImportLog = function (req, res) {
  client.hgetall(logKey(req.query.id), function (err, json) {
    client.get(logKey(req.query.id) + 'errors', function (err, results) {
      if (json && results) {
        json.errors = results;
      }
      res.json(json || { error: true });
    });
  });
};

exports.logError = function (id, val) {
  client.append(logKey(id) + 'errors', val + "\n");
};

exports.increment = function (id, key, val) {
  console.log('redis.hincrby', id, key, val);
  client.hincrby(logKey(id), key, val);
};

exports.log = function (id, key, val) {
  console.log('redis.hset', id, key, val);
  client.hset(logKey(id), key, val);
};
