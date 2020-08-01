/*
 * User model
 */

var fields_all = "id, uname, passwd, uemail, gmt_create, gmt_modify";

/**
 * 模块依赖
 */
var db = require("../lib/db");

/**
 * DAO: find
 */
exports.findUName = function(uname, handler) {
	db.execQuery({
		"sql": "SELECT * FROM atom_user WHERE uname=?",
		"args": [uname],
		"handler": handler
	});
};

/**
 * DAO: findAll
 */
exports.findAll = function(handler) {
	db.execQuery({
		"sql": "SELECT * FROM atom_user ORDER BY id DESC",
		"handler": handler
	});
};
