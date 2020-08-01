/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

/*jshint newcap:false, debug:true, unused: true, evil: true, devel: true, plusplus: false, browser: true, jquery: true, undef:false */
/*clientside jslint comment for global */
/*global org: false, core: false, io: false */
/*jshint unused: false */



org.goorm.core.terminal = function () {
	this.target = null;
	this.in_panel = null;
	this.terminal_name = null;
	this.timestamp = null;
	this.index = -1;
	this.command_queue = [];
	this.resize_queue = [];
	this.status = null;
};

org.goorm.core.terminal.prototype = {
	init: function (target, terminal_name, in_panel) {
		var self = this;

		this.target = target;
		this.in_panel = in_panel;
		this.terminal_name = terminal_name;
		this.timestamp = (new Date()).getTime();

		// attach context menu
		//self.attach_context_menu();

		var init_terminal = function () {
			$(self.target).addClass('terminal');

			var cols = 80;
			var rows = 30;

			if (self.in_panel) {
				cols = parseInt(parseInt($(self.target).width() - 10, 10) / 6, 10);
			} else {
				cols = parseInt(parseInt($(self.target).parent().parent().width() - 10, 10) / 8, 10);
			}

			if (cols <= 0 || rows <= 0) {
				cols = 140;
				rows = 30;
			}

			// attach Terminal
			$(self).on(self.terminal_name + '_open_complete', function () {
				self.focus();
				window.setTimeout(function(){
					self.resize_terminal();
				}, 500)
			});

			var init = false;
			$(self).on('terminal_ready', function () {
				if (!init) {
					window.setTimeout(function () {
						

						
						$(self.target).find('div:first').prepend('Welcome to goorm terminal :)</br>');
						
					}, 100);
					init = true;
				}
			});

			var terminal_open_complete = function () {
								

				$(self.target).parent().css('outline', 'none').css('background-color', 'rgb(70,70,70)').css('overflow', 'hidden');

				self.work_resize();
				core.module.layout.refresh();
				$(self).trigger(self.terminal_name + '_open_complete');
			};

			self.Terminal = new Terminal(cols, rows);
			self.Terminal.open(self, self.target, {
				'timestamp': self.timestamp,
				'terminal_name': self.terminal_name
			}, terminal_open_complete);

			self.Terminal.bindKeys(self.target[0]);
		};

		var init_event = function () {
			$(window).on("unload", function () {

				// terminal leave
				self.Terminal.destroy();

				// socket disconnect
				self.socket.disconnect();

			});

			$(core).on("layout_resized", function () {
				self.resize_all("layout");
			});

			$(document).on(self.terminal_name + "_resized", function () {
				if (self.index >= 0) {
					self.resize_terminal();
				}
			});

			$(document).on(self.terminal_name + "_closed", function () {
				var msg = {
					index: self.index,
					workspace: core.status.current_project_path,
					terminal_name: self.terminal_name
				};
				self.socket.emit("terminal_leave", JSON.stringify(msg));
			});

			$(self.target).click(function () {
				self.focus();
			});

			var terminal = $("#terminal");

			terminal.mousedown(function () {
				self.Terminal.flag_drag = 0;
				self.Terminal.mouseon = true;
			});

			terminal.mousemove(function () {
				if (self.Terminal.mouseon) {
					self.Terminal.flag_drag++;
				}
			});

			terminal.mouseup(function () {
				self.Terminal.mouseon = false;
				if (self.Terminal.flag_drag < 5) {
					self.Terminal.flag_darg = 0;
				}
			});
		};

		var init_socket = function () {
			self.socket = io.connect();

			self.socket.on("on_change_project_dir", function (data) {
				$(self).trigger("terminal_ready");
			});

			self.socket.on("platform", function (data) {
				data = JSON.parse(data);

				

				
				self.default_prompt = /.*@.*:.*(\#|\$)/;
				

				self.platform = data.platform;
				core.env.os = data.platform;
			});

			self.socket.on("terminal_index", function (data) {
				data = JSON.parse(data);

				if (self.index == -1 && self.timestamp == data.timestamp) {
					self.index = parseInt(data.index, 10);

					var msg = {
						index: self.index,
						project_path: core.status.current_project_path
					};

					self.socket.emit("change_project_dir", JSON.stringify(msg));
				}
			});

			// result write
			self.socket.on("pty_command_result", function (msg) {

				

				
				if (self.terminal_name == msg.terminal_name) {
					self.work_queue(msg.stdout);

					if (!self.no_write) {
						self.Terminal.write(msg.stdout);
					}

					if (self.terminal_name == 'debug') {
						$(self.target).scrollTop($(self.target).parent().prop('scrollHeight'));
					}
				}
				

				if (self.terminal_name == 'debug') {
					if (msg.stdout) {
						var regex = new RegExp(self.debug_endstr);
						if (regex.test(msg.stdout)) {
							$(core.module.debug).trigger('debug_end');
						}
					}
				}
			});

			// received terminal refresh complete msg
			self.socket.on("terminal_refresh_complete", function () {
				self.resize_terminal();
			});

			
			self.socket.on('disconnect', function(){
				var lang_data = localStorage['language.data'];
				var lang = localStorage['language'];

				var msg = null;

				if (lang_data) {
					lang_data = JSON.parse(lang_data);

					if (lang_data[lang]) {
						msg = lang_data[lang]['msg']['server_is_end'].value;
					}
				}

				if (msg) {
					notice.show(msg, null, true);
				}
			});
			
		};

		// initialize socket.io event
		init_socket();

		// append message & prompt to terminal
		init_terminal();

		// initialize js event
		init_event();
	},

	attach_context_menu: function () {
		var self = this;

		// context menu
		this.context_menu = new org.goorm.core.menu.context();
		this.context_menu.init(
			"configs/menu/org.goorm.core.terminal/terminal.context.html",
			"terminal.context",
			self.target, self.timestamp, null,
			function () {}
		);
	},

	focus: function () {
		var self = this;

		$(this.target).parent().attr('tabindex', 0);
		$(this.target).parent().focus();
	},

	refresh_terminal: function () {
		var msg = {
			"index": this.index,
			"terminal_name": this.terminal_name,
			"workspace": core.status.current_project_path
		};

		this.socket.emit("terminal_refresh", JSON.stringify(msg));
	},

	resize_terminal: function () {
		var cols = 140;
		var rows = 30;

		var div_height = $(this.target).find('div:first').height();
		if (div_height <= 1) div_height = 13;
		if (div_height >= 20) div_height = 13;

		if (this.in_panel) {
			cols = parseInt(parseInt($(this.target).width() - 10, 10) / 7, 10);
			rows = parseInt(($(this.target).height() + 15) / div_height, 10);
		} else {
			var all_height = core.module.layout.inner_layout._units.bottom._configs.height.value;
			var nav_height = ($('#goorm_inner_layout_bottom .yui-nav').outerHeight(false) > 1) ? $('#goorm_inner_layout_bottom .yui-nav').outerHeight(false) : 25;

			cols = parseInt(parseInt($(this.target).parent().parent().width() - 10, 10) / 8, 10);
			rows = Math.round((all_height - nav_height) / div_height);
		}

		if (cols <= 0 || rows <= 0) {
			cols = 140;
			rows = 30;
		}

		if (cols >= 1 && rows >= 1 && this.index != -1) {
			var msg = {
				index: this.index,
				user: core.user.id,
				cols: cols,
				rows: rows
			};

			this.resize_queue.push(msg);
		}
	},

	work_resize : function() {
		var self = this;

		window.setInterval(function(){
			if( self.resize_queue.length > 0) {
				var msg = self.resize_queue.pop();

				self.socket.emit("terminal_resize", JSON.stringify(msg));
				self.Terminal.resize(msg.cols, msg.rows - 1);

				if(!self.in_panel){
					var height = $('#goorm_inner_layout_bottom .yui-content').height();
					$(self.target).parent().css('height', height+'px');
				}

				self.resize_queue = [];
			}
		}, 1000);
	},

	change_project_dir: function () {
		var self = this;

		if (this.index != -1) {
			var msg = {
				index: self.index,
				project_path: core.status.current_project_path
			};

			self.socket.emit("change_project_dir", JSON.stringify(msg));
		}
	},

	send_command: function (command, options, callback, callback_prompt) {
		var msg = {
			index: this.index,
			command: command
		};

		var prompt = options;
		var no_write = false;

		if (options && options.no_write ) {
			prompt = options.prompt;
			no_write = options.no_write;
		}

		if (!prompt) prompt = this.default_prompt;

		this.command_queue.push({
			"prompt": prompt,
			"command": msg,
			"no_write": no_write
		});

		if (callback) {
			this.command_queue.push({
				"prompt": (callback_prompt)? callback_prompt : prompt,
				"no_write": no_write,
				"callback": callback
			});
		}

		if (this.command_queue.length < 3) {
			this.work_queue();
		}
	},

	flush_command_queue: function () {
		this.command_queue = [];
	},

	work_queue: function (stdout) {
		var self = this;

		if (stdout) {
			this.stdout += stdout;
		}

		if ( !this.command_queue || this.command_queue.length === 0) {
			this.command_queue = [];
			return;
		}

		if (this.running_queue) return;
		else this.running_queue = true;
		
		this.prompt = this.command_queue[0].prompt;
		if (!this.prompt) this.prompt = this.default_prompt;

		if (this.status == 'build')
			this.stdout = this.stdout.replace(/\r\n/g, "").replace(/\n/g, "").replace(/\r/g, "");

		if (this.prompt.test(this.stdout)) {
			this.command_ready = true;
		}
		else if(this.terminal_name != 'debug' && this.stdout){
			this.stdout = this.stdout.replace(/\r\n/g, "").replace(/\n/g, "").replace(/\r/g, "");
			if (this.prompt.test(this.stdout)) {
				this.command_ready = true;
			}
		}
		// console.log(this.prompt, this.command_queue[0], this.stdout);

		if(!this.command_ready) {
			core.stdout = this.stdout;
		}

		if (this.command_ready) {

			this.command_ready = false;
			var item = this.command_queue.shift();

			if (item) {
				if (item.command) {
					item.command.user = core.user.id;
					this.socket.emit("pty_execute_command", JSON.stringify(item.command));
					this.no_write = item.no_write || false;
					this.stdout = "";
				} else if (item.callback) {
					item.callback(this.stdout);
				}
			}
		}

		this.running_queue = false;
		if (this.command_queue.length > 0) {
			window.setTimeout(function () {
				self.work_queue();
			}, 500);
		}
	},

	set_prompt: function (data) {

	},

	resize_all: function (from) {
		var self = this;

		if (this.in_panel && from == "panel") {
			if (this.index > 0)
				this.resize_terminal();
		} else if (from == "layout" && this.terminal_name != "debug") {

			if (this.index >= 0)
				this.resize_terminal();
		}
	},

	check_command: function (command) {

	}
};
