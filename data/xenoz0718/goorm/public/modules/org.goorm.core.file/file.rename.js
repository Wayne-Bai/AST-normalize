/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

/*jshint newcap:false, debug:true, unused: true, evil: true, devel: true, plusplus: false, browser: true, jquery: true, undef:false */
/*clientside jslint comment for global */
/*global org: false, core: false */
/*jshint unused: false */



org.goorm.core.file.rename = {
	dialog: null,
	buttons: null,
	tabview: null,
	treeview: null,
	is_alive_window: null,

	init: function () {

		var self = this;

		var dst_name_check = function (dst_name) {
			var strings = "{}[]()<>?|~`!@#$%^&*+\"'\\/";
			for (var i = 0; i < strings.length; i++)
				if (dst_name.indexOf(strings[i]) != -1) return false;
			return true;
		};

		var handle_ok = function (panel) {
			var ori_path = $("#input_rename_old_filepath").val();
			var ori_name = $("#input_rename_old_filename").val();
			var dst_name = $("#input_rename_new_filename").val();

			if (dst_name === "") {
				alert.show(core.module.localization.msg.alert_filename_empty);
				return false;
			} else if (dst_name.indexOf(" ") != -1) {
				alert.show(core.module.localization.msg.alert_allow_character);
				return false;
			} else if (!dst_name_check(dst_name)) {
				alert.show(core.module.localization.msg.alert_allow_character);
				return false;
			}

			var postdata = {
				ori_path: $("#input_rename_old_filepath").val(),
				ori_name: $("#input_rename_old_filename").val(),
				dst_name: $("#input_rename_new_filename").val()
			};

			$.get("file/rename", postdata, function (data) {
				var received_data = data;

				if (received_data.err_code === 0) {

					var window_list = core.module.layout.workspace.window_manager.window;

					for (var i = window_list.length - 1; i >= 0; i--) {
						if ((window_list[i].title).indexOf(ori_path + ori_name) > -1) {
							window_list[i].is_saved = true;
							window_list[i].tab.is_saved = true;

							var old_path=window_list[i].title;

							var new_path=old_path.replace(ori_path+ori_name, ori_path+dst_name);

							var filename = new_path.split('/').pop();
							var filepath = new_path.substring(0,new_path.length-filename.length);
							var filetype = window_list[i].filetype;
		
							window_list[i].close();

							core.module.layout.workspace.window_manager.open(filepath, filename,filetype);
						}
					}

					core.module.layout.project_explorer.refresh();
				} else if (received_data.err_code == 20) {
					alert.show(core.module.localization.msg[received_data.message]);
				} else {
					alert.show(received_data.message);
				}
			});

			if (typeof(this.hide) !== 'function' && panel) {
				panel.hide();
			}
			else{
				this.hide();
			}
		};

		var handle_cancel = function () {
			this.hide();
		};

		this.buttons = [{
			id: "g_file_rename_btn_ok",
			text: "<span localization_key='ok'>OK</span>",
			handler: handle_ok,
			isDefault: true
		}, {
			id: "g_file_rename_btn_cancel",
			text: "<span localization_key='cancel'>Cancel</span>",
			handler: handle_cancel
		}];

		this.dialog = org.goorm.core.file.rename.dialog;
		this.dialog.init({
			localization_key: "title_rename",
			title: "Rename",
			path: "configs/dialogs/org.goorm.core.file/file.rename.html",
			width: 450,
			height: 120,
			modal: true,
			opacity: true,
			buttons: this.buttons,
			success: function () {
				if (core.is_optimization) {
					self.dialog.dialog.panel.subscribe('show', function () {
						$(self.dialog.panel.element).find('input[readonly!=readonly][type=text]').focus();
					});
					$(self.dialog.dialog.panel.element).find('input[readonly!=readonly][type=text]').unbind();
					$(self.dialog.dialog.panel.element).find('input[readonly!=readonly][type=text]').keydown(function(e){
						if(e.keyCode===13)	$("#g_file_rename_btn_ok").click();
					});
				} else {
					self.dialog.panel.subscribe('show', function () {
						$(self.dialog.panel.element).find('input[readonly!=readonly][type=text]').focus();
					});
					$(self.dialog.panel.element).find('input[readonly!=readonly][type=text]').unbind();
					$(self.dialog.panel.element).find('input[readonly!=readonly][type=text]').keydown(function(e){
						if(e.keyCode===13)	$("#g_file_rename_btn_ok").click();
					});
				}
				$("#input_rename_new_filename").attr("maxlength", 250);

				
			}
		});
		this.dialog = this.dialog.dialog;
	},

	show: function (context) {
		var self = this;

		self.is_alive_window = false;

		if (context) {
			var fullpath = core.status.selected_file.split("/");

			var filename = fullpath.pop();
			var filepath = fullpath.join('/') + '/';
			filepath = filepath.replace("//", "/");

			$("#input_rename_new_filename").val(filename);
			$("#input_rename_old_filepath").val(filepath);
			$("#input_rename_old_filename").val(filename);

			var window_manager = core.module.layout.workspace.window_manager;

			for (var i = 0; i < window_manager.index; i++) {
				var window_filename = window_manager.window[i].filename;
				var window_filepath = window_manager.window[i].filepath;
				window_filepath = window_filepath + "/";
				window_filepath = window_filepath.replace("//", "/");

				if (window_manager.window[i].alive && window_filename == filename && window_filepath == filepath) {
					self.is_alive_window = true;
				}
			}

			this.dialog.panel.show();
		} else {
			var window_manager = core.module.layout.workspace.window_manager;

			for (var i = 0; i < window_manager.index; i++) {
				if (window_manager.window[i].alive) {
					self.is_alive_window = true;
				}
			}

			if (self.is_alive_window) {
				$("#input_rename_new_filename").val(window_manager.window[window_manager.active_window].filename);
				$("#input_rename_old_filepath").val(window_manager.window[window_manager.active_window].filepath);
				$("#input_rename_old_filename").val(window_manager.window[window_manager.active_window].filename);
			}
			else if(core.status.selected_file) {
				var fullpath = core.status.selected_file.split("/");

				var temp_name = fullpath.pop();
				var temp_path = fullpath.join('/') + '/';
				temp_path = temp_path.replace("//", "/");

				$("#input_rename_new_filename").val(temp_name);
				$("#input_rename_old_filepath").val(temp_path);
				$("#input_rename_old_filename").val(temp_name);
			} else {
				// alert please click ...
				//
			}

			this.dialog.panel.show();
		}
	}
};
