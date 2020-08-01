/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

/*jshint newcap:false, debug:true, unused: true, evil: true, devel: true, node: true, plusplus: false, undef: false */
/*serverside jslint comment for global */
/*global __path: false */
/*jshint unused: false */



var http = require('http');
var fs = require("fs");
var querystring = require('querystring');

module.exports = {
	send_to_bug_report: function (query, evt) {
		var return_data = {};
		return_data.err_code = 0;
		return_data.message = "process done";

		var ori_data = {};
		ori_data.id = query.id;
		ori_data.subject = query.title;
		ori_data.email = query.email;
		ori_data.version = query.version;
		ori_data.content = query.explanation;

		// ori_data.board_id = 'ide_bugreport';
		// ori_data.subject = query.title;
		// ori_data.content = '';
		// ori_data.language = 'ko';
		// ori_data.member_id = query.id;
		// ori_data.member_nick = query.author;

		// var temp_data = {};
		// temp_data.email = query.email;
		// temp_data.version = query.version;
		// temp_data.module = query.module;
		// temp_data.explanation = query.explanation;
		// ori_data.content = JSON.stringify(temp_data);

		var post_data = querystring.stringify(ori_data);
		var post_options = {
			host: 'goorm.io',
			port: '3000',
			path: '/user_comments/add',
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': post_data.length
			}
		};

		var post_req = http.request(post_options, function (res) {
			res.setEncoding('utf8');

			var data = "";

			res.on('data', function (chunk) {
				data += chunk;
			});

			res.on('end', function () {
				evt.emit("help_send_to_bug_report", return_data);
			});
		});

		post_req.on('error', function (e) {});

		post_req.write(post_data);
		post_req.end();
	},

	get_readme_markdown: function (language, filename, filepath) {
		var input;
		var markdownpath = (filepath === undefined) ? __path : __path + filepath;

		/* file name
			README
			NODEJS_MANUAL
			EXAMPLE_TUTORIAL
		*/
		if (!filename) filename = 'README';

		if (language == "kor") {
			input = fs.readFileSync(markdownpath + filename + '_KO.md', 'utf8');
		} else {
			input = fs.readFileSync(markdownpath + filename + '.md', 'utf8');
		}
		var output = require("markdown").markdown.toHTML(input);

		return {
			html: output
		};
	}
};
