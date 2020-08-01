var pg = require('pg');
var config = require('../lib/config');

module.exports = function () {
  config.database.user = 'postgres';
  config.database.database = 'postgres';

  dropDatabase(function () {
    dropUser(function () {
      console.log('Done');
      process.exit();
    });
  });
};

function connect (callback) {
  pg.connect(config.database, function (err, client, done) {
    if (err) {
      console.log(err);
      process.exit(1);
    }

    callback(client, done);
  });
};

function dropDatabase (callback) {
  console.log('Dropping database...');

  connect(function (client, done) {
    var query = {
      text: 'drop database crypton_test'
    };

    client.query(query, function (err, result) {
      done();

      if (err) {
        console.log(err);
        return callback();
      }

      console.log('Dropped database');
      callback();
    });
  });
};

function dropUser (callback) {
  console.log('Dropping user...');

  connect(function (client, done) {
    var query = {
      text: 'drop role crypton_test_user'
    };

    client.query(query, function (err, result) {
      done();

      if (err) {
        console.log(err);
        return callback();
      }

      console.log('Dropped user');
      callback();
    });
  });
}
