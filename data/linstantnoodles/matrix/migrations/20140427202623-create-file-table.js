var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.createTable('file', {
    'id': {
      type: 'int',
      primaryKey: true,
      autoIncrement: true
    },
    'title': {
      type: 'string',
      length: 255
    },
    'content': {
      type: 'text'
    },
    'date_created': {
      type: 'datetime'
    },
    'date_modified': {
      type: 'datetime'
    },
    'is_published': {
      type: 'smallint',
      defaultValue: 0
    },
    'user_id': {
      type: 'int'
    }
  }, callback);
};

exports.down = function(db, callback) {
  db.dropTable('file', {
    fileExists: true
  }, callback);
};
