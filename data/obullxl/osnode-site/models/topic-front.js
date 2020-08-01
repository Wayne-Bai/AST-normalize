/**
 * 模块依赖
 */
var db = require("../lib/db");

var fields_title = "id, state, catg, tflag, rflag, rfrom, mflag, mpath, visit, reply, title, gmt_create, gmt_modify";
var fields_summary = "id, state, catg, tflag, rflag, rfrom, mflag, mpath, visit, reply, title, summary, gmt_create, gmt_modify";
var fields_all = "id, state, catg, tflag, rflag, rfrom, mflag, mpath, visit, reply, title, summary, content, gmt_create, gmt_modify";

/**
 * DAO: 浏览次数+1
 */
exports.updateVisit = function(id, handler) {
	db.execQuery({
		"sql": "UPDATE atom_topic SET visit=visit+1 WHERE id=?",
		"args": [id],
		"handler": handler
	});
};

/**
 * DAO: 回复次数+1
 */
exports.updateReply = function(id, handler) {
	db.execQuery({
		"sql": "UPDATE atom_topic SET reply=reply+1 WHERE id=?",
		"args": [id],
		"handler": handler
	});
};

/**
 * DAO: findID
 */
exports.findID = function(id, handler) {
	db.execQuery({
		"sql": "SELECT * FROM atom_topic WHERE id=?",
		"args": [id],
		"handler": handler
	});
};

/**
 * DAO: 获取主页列表
 */
exports.findList = function(args, handler) {
	var sql = "SELECT " + fields_summary + " FROM atom_topic ORDER BY id DESC LIMIT ?,?";
	var params = [args.offset, args.limit];
	if(args.catgs) {
		sql = "SELECT " + fields_summary + " FROM atom_topic WHERE catg in(?) ORDER BY id DESC LIMIT ?,?";
		params = [args.catgs, args.offset, args.limit];
	}

	db.execQuery({
		"sql": sql,
		args: params,
		"handler": handler
	});
};

/**
 * DAO: 获取主页置顶列表
 */
exports.findTopList = function(args, handler) {
	var sql = "SELECT " + fields_summary + " FROM atom_topic WHERE topt in(?) ORDER BY id DESC LIMIT ?,?";
	var params = [args.topts, args.offset, args.limit];
	if(args.catgs) {
		sql = "SELECT " + fields_summary + " FROM atom_topic WHERE catg in(?) AND topt in(?) ORDER BY id DESC LIMIT ?,?";
		params = [args.catgs, args.topts, args.offset, args.limit];
	}

	db.execQuery({
		"sql": sql,
		args: params,
		"handler": handler
	});
};

/**
 * DAO: 获取Top阅读排行榜
 */
exports.findTopVisits = function(args, handler) {
	var sql = "SELECT " + fields_title + " FROM atom_topic ORDER BY visit DESC, id DESC LIMIT ?";
	var params = [args.count || 5];
	if(args.catgs) {
		sql = "SELECT " + fields_title + " FROM atom_topic WHERE catg in(?) ORDER BY visit DESC, id DESC LIMIT ?";
		params = [args.catgs, args.count || 5];
	}

	db.execQuery({
		"sql": sql,
		args: params,
		"handler": handler
	});
};

/**
 * DAO: 获取Top评论排行榜
 */
exports.findTopReplys = function(args, handler) {
	var sql = "SELECT " + fields_title + " FROM atom_topic ORDER BY reply DESC, id DESC LIMIT ?";
	var params = [args.count || 5];
	if(args.catgs) {
		sql = "SELECT " + fields_title + " FROM atom_topic WHERE catg in(?) ORDER BY reply DESC, id DESC LIMIT ?";
		params = [args.catgs, args.count || 5];
	}

	db.execQuery({
		"sql": sql,
		args: params,
		"handler": handler
	});
};
