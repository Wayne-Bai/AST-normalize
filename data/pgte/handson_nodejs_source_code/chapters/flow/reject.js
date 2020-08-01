var async = require('async');
var exists = require('path').exists;

var files = [
  'filter.js',
  'does_not_exist.js',
  'squaring_client.js',
  'also_does_not_exist.js',
  'squaring_client_limited.js',
  'squaring_client_map.js',
  'also_does_not_exist_2.js',
  'squaring_server.js'
];

function callback(result) {
  console.log('of files %j, these do not exist: %j', files, result);
}

async.reject(files, exists, callback);