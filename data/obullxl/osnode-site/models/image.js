/**
 * 模块依赖
 */
var db = require("../lib/db");

var fields_all = "id, state, topic, mpath, summary, gmt_create, gmt_modify";

/**
 * DAO: insert
 */
exports.insert = function(obj, handler) {
	db.execQuery({
		"sql": "INSERT INTO atom_image(topic, mpath, summary, gmt_create, gmt_modify) VALUES(?, ?, NOW(), NOW())",
		"args": [obj.topic, obj.mpath, obj.summary],
		"handler": handler
	});
};

/**
 * DAO: findAll
 */
exports.findAll = function(tpcId, handler) {
	db.execQuery({
		"sql": "SELECT * FROM atom_reply WHERE topic=? ORDER BY id ASC",
		"args": [tpcId],
		"handler": handler
	});
};
