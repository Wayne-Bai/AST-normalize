var mysql = require("mysql");
var hash = require("password-hash");
var Promise = require("bluebird");
var settings = require("../settings");

Promise.promisifyAll(require("mysql/lib/Connection").prototype);
Promise.promisifyAll(require("mysql/lib/Pool").prototype);

var db_config = {
	user:settings.db.user,
	password:settings.db.password,
	database:settings.db.database
};

module.exports = {
	query: query
}

var con = mysql.createPool(db_config);

function query(sql) {
	return con.getConnectionAsync().then(function(connection) {
		return connection.queryAsync(sql)
		.spread(function(rows,fields) {
			return rows;
		}).finally(function() {
			connection.release();
		});
	});
}