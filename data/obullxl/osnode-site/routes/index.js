/**
 * 公用页面模块
 */

var log = require("../lib/log");
var config = require('../config');
var User = require('../models/user');
var crypto = require('crypto');
var RUtil = require('./rutil');

/**
 * 登录页面
 */
exports.login = function(request, response) {
	// log.info("用户登录：" + require('util').inspect(request.method));
	var method = request.method || '';
	var data = RUtil.front_data(request);
	data.title = '管理员登录';
	data.uname = '';

	// 登录页面
	if(method.toUpperCase() === "GET") {
		response.render('login', data);
	}

	// 登录验证请求
	else if(method.toUpperCase() === "POST") {
		var uname = request.body.uname;
		data.uname = uname;

		User.findUName(uname, function(results) {
			// log.info("用户信息：" + require('util').inspect(results));

			if(results.length <= 0) {
				// 用户不存在
				data.errDesp = "用户不存在！";
				response.render("login", data);
			} else {
				var tmpUser = results[0];
				var passwd = request.body.passwd;
				passwd = crypto.createHash('md5').update(passwd).digest('hex');
				if(tmpUser.passwd === passwd) {
					// 登录成功
					request.session.admin = tmpUser;
					response.redirect(request.session.lastpage || "/admin/topic-manage.html");
				} else {
					// 用户密码错误
					data.errDesp = "用户密码错误！";
					response.render("login", data);
				}
			}
		});
	}
};

/**
 * 登出系统
 */
exports.logout = function(request, response) {
	request.session.admin = null;
	response.redirect("/login.html");
};
