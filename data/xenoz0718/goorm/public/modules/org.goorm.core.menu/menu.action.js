/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

/*jshint newcap:false, debug:true, unused: true, evil: true, devel: true, plusplus: false, browser: true, jquery: true, undef:false */
/*clientside jslint comment for global */
/*global org: false, core: false, localStorage: false, confirmation: false, confirmation_save: false */
/*jshint unused: false */


org.goorm.core.menu.action = {
	init: function () {
		$("a[action=new_project]").off("click");
		$("a[action=new_project]").click(function () {
			core.dialog.new_project.show();
			$(".project_wizard_first_button[project-type=all]").trigger("click");
		});

		$("a[action=new_file_goorm_project]").off("click");
		$("a[action=new_file_goorm_project]").click(function () {
			core.dialog.new_project.show();
			$(".project_wizard_first_button[project-type=goormp]").trigger("click");
		});

		$("a[action=new_file_file]").off("click");
		$("a[action=new_file_file]").click(function () {
			core.dialog.new_file.show("");
		});

		$("a[action=new_file_folder]").off("click");
		$("a[action=new_file_folder]").click(function () {
			core.dialog.new_folder.show("");
		});

		$("a[action=new_file_textfile]").off("click");
		$("a[action=new_file_textfile]").click(function () {
			core.dialog.new_untitled_textfile.show("");
		});

		$("a[action=new_file_other]").off("click");
		$("a[action=new_file_other]").click(function () {
			core.dialog.new_other_file.show("");
		});

		$("a[action=open_project]").off("click");
		$("a[action=open_project]").click(function () {
			core.dialog.open_project.show();
		});

		$("a[action=open_file]").off("click");
		$("a[action=open_file]").click(function () {
			core.dialog.open_file.show();
		});
		$("a[action=exit]").off("click");
		$("a[action=exit]").click(function () {
			confirmation.init({
				title: core.module.localization.msg.confirmation_exit_title,
				message: core.module.localization.msg.confirmation_exit,
				yes_text: core.module.localization.msg.confirmation_yes,
				no_text: core.module.localization.msg.confirmation_no,
				yes: function () {
					survey.init(function () {

						

						window.open('', '_self');
						window.close();
					});
					survey.panel.show();
					if (core !== undefined && core.user !== undefined) {

						if (core !== undefined && core.user !== undefined) {
							var postdata = {
								// 'id': core.user.id,
								// 'type': core.user.type,
								'path': core.status.current_project_absolute_path
							};

							$.ajax({
								type: 'POST',
								async: false,
								url: '/user/unload',
								data: postdata
							});
						}
					}
				},
				no: function () {

				}
			});

			confirmation.panel.show();
		});

		$("a[action=open_url]").off("click");
		$("a[action=open_url]").click(function () {
			core.dialog.open_url.show();
		});

		$("a[action=close_file]").off("click");
		$("a[action=close_file]").click(function () {
			var window_manager = core.module.layout.workspace.window_manager;

			if (window_manager.window[window_manager.active_window]) {
				window_manager.window[window_manager.active_window].close();
			}
		});

		$("a[action=close_all]").off("click");
		$("a[action=close_all]").click(function () {
			core.module.layout.workspace.window_manager.close_all();
		});

		$("a[action=save_file]").off("click");
		$("a[action=save_file]").click(function () {
			var window_manager = core.module.layout.workspace.window_manager;

			if (window_manager.active_window < 0) {
				alert.show(core.module.localization.msg.alert_file_not_opened);
			} else if (window_manager.window[window_manager.active_window]) {
				if (window_manager.window[window_manager.active_window].designer) {
					window_manager.window[window_manager.active_window].designer.save();
				} else if (window_manager.window[window_manager.active_window].editor) {
					window_manager.window[window_manager.active_window].editor.save();
				}
			}
		});

		$("a[action=save_all_file]").off("click");
		$("a[action=save_all_file]").click(function () {
			core.module.layout.workspace.window_manager.save_all();
		});

		$("a[action=save_as_file]").off("click");
		$("a[action=save_as_file]").click(function () {
			core.dialog.save_as_file.show();
		});

		$("a[action=move_file]").off("click");
		$("a[action=move_file]").click(function () {
			core.dialog.move_file.show("");
		});

		$("a[action=rename_file]").off("click");
		$("a[action=rename_file]").click(function () {
			if (core.status.selected_file) {
				core.dialog.rename_file.show('context');
			}
			else {
				alert.show(core.module.localization.msg.alert_select_file);
			}
		});

		$("a[action=delete_file]").off("click");
		$("a[action=delete_file]").click(function () {
			if (core.status.selected_file) {
				if ("/" + core.status.current_project_path == core.status.selected_file) {
					console.log(core.status.current_project_path);
					alert.show("Cannot Delete!");
					return;
				}
				confirmation.init({
					title: core.module.localization.msg.confirmation_delete_title,
					message: core.module.localization.msg.confirmation_delete_file,
					yes_text: core.module.localization.msg.confirmation_yes,
					no_text: core.module.localization.msg.confirmation_no,
					yes: function () {
						var postdata = {
							filename: core.status.selected_file
						};
						console.log(postdata);
						$.get("file/delete", postdata, function (data) {
							//m.s("delete: " + core.status.selected_file);
							core.module.layout.project_explorer.refresh();
							var window_list = core.module.layout.workspace.window_manager.window;

							for (var i = window_list.length - 1; i >= 0; i--) {
								console.log(window_list[i].title);
								if ((window_list[i].title).indexOf(core.status.selected_file) > -1) {
									window_list[i].is_saved = true;
									window_list[i].tab.is_saved = true;
									window_list[i].close();
								}
							}
						});
					},
					no: function () {
						confirmation.panel.hide();
					}
				});

				confirmation.panel.show();
			}
			else {
				alert.show(core.module.localization.msg.alert_select_file);
			}
		});

		$("a[action=refresh_project_directory]").off("click");
		$("a[action=refresh_project_directory]").click(function () {
			core.module.layout.project_explorer.refresh();
		});

		$("a[action=refresh_page]").off("click");
		$("a[action=refresh_page]").click(function () {
			var window_manager = core.module.layout.workspace.window_manager;
			confirmation.init({
				title: core.module.localization.msg.confirmation_title,
				message: core.module.localization.msg.alert_refresh,
				yes_text: core.module.localization.msg.confirmation_yes,
				no_text: core.module.localization.msg.confirmation_no,

				yes: function () {

					var confsave = function (ii) {
						if (ii >= window_manager.window.length) {
							window.location.replace("/");
							return;
						}

						if (window_manager.window[ii].is_saved) confsave(ii + 1);
						else {
							confirmation_save.init({
								message: "\"" + window_manager.window[ii].filepath + window_manager.window[ii].filename + "\" " + core.module.localization.msg.confirmation_save_message,
								yes_text: core.module.localization.msg.confirmation_yes,
								cancel_text: core.module.localization.msg.confirmation_cancel,
								no_text: core.module.localization.msg.confirmation_no,

								title: "Save...",
								yes: function () {
									window_manager.window[ii].editor.save();
									confsave(ii + 1);

								},
								cancel: function () {},
								no: function () {
									confsave(ii + 1);
								}
							});

							confirmation_save.panel.show();

						}
					};

					confsave(0);

				},
				no: function () {}
			});

			confirmation.panel.show();
		});

		$("a[action=print]").off("click");
		$("a[action=print]").click(function () {
			core.dialog.print.show();
		});

		$("a[action=switch_workspace]").off("click");
		$("a[action=switch_workspace]").click(function () {
			core.dialog.switch_workspace.show();
		});

		$("a[action=import_file]").off("click");
		$("a[action=import_file]").click(function () {
			core.dialog.import_file.show();
		});

		$("a[action=upload_folder]").off("click");
		$("a[action=upload_folder]").click(function () {
			core.dialog.folder_upload.show();

		});


		$("a[action=export_file]").off("click");
		$("a[action=export_file]").click(function () {
			core.dialog.export_file.show();
		});

		$("a[action=property]").off("click");
		$("a[action=property]").click(function () {
			core.dialog.property.show();
		});

		$("a[action=do_undo]").off("click");
		$("a[action=do_undo]").click(function () {
			var window_manager = core.module.layout.workspace.window_manager;

			if (window_manager.window[window_manager.active_window]) {
				if (window_manager.window[window_manager.active_window].designer) {
					window_manager.window[window_manager.active_window].designer.canvas.undo();
				} else if (window_manager.window[window_manager.active_window].editor) {
					window_manager.window[window_manager.active_window].editor.undo();
				}
			}
		});

		$("a[action=do_redo]").off("click");
		$("a[action=do_redo]").click(function () {
			var window_manager = core.module.layout.workspace.window_manager;

			if (window_manager.window[window_manager.active_window]) {
				if (window_manager.window[window_manager.active_window].designer) {
					window_manager.window[window_manager.active_window].designer.canvas.redo();
				} else if (window_manager.window[window_manager.active_window].editor) {
					window_manager.window[window_manager.active_window].editor.redo();
				}
			}
		});

		$("a[action=do_jump_to_definition]").off("click");
		$("a[action=do_jump_to_definition]").click(function () {
			var window_manager = core.module.layout.workspace.window_manager;

			if (window_manager.window[window_manager.active_window]) {
				if (window_manager.window[window_manager.active_window].editor) {
					var target_editor = window_manager.window[window_manager.active_window].editor;

					var cursor = target_editor.editor.getCursor();
					var token = target_editor.editor.getTokenAt(cursor);

					target_editor.jump_to_definition.load(token.string);
				}
			}
		});

		$("a[action=do_cut]").off("click");
		$("a[action=do_cut]").click(function () {
			var window_manager = core.module.layout.workspace.window_manager;

			if (window_manager.window[window_manager.active_window]) {
				if (window_manager.window[window_manager.active_window].designer) {
					window_manager.window[window_manager.active_window].designer.canvas.cut();
				} else if (window_manager.window[window_manager.active_window].editor) {
					window_manager.window[window_manager.active_window].editor.cut();
				}
			}
		});

		$("a[action=do_copy]").off("click");
		$("a[action=do_copy]").click(function () {
			var window_manager = core.module.layout.workspace.window_manager;

			if (window_manager.window[window_manager.active_window]) {
				if (window_manager.window[window_manager.active_window].designer) {
					window_manager.window[window_manager.active_window].designer.canvas.copy();
				} else if (window_manager.window[window_manager.active_window].editor) {
					window_manager.window[window_manager.active_window].editor.copy();
				}
			}
		});

		$("a[action=do_paste]").off("click");
		$("a[action=do_paste]").click(function () {
			var window_manager = core.module.layout.workspace.window_manager;

			if (window_manager.window[window_manager.active_window]) {
				if (window_manager.window[window_manager.active_window].designer) {
					window_manager.window[window_manager.active_window].designer.canvas.paste();
				} else if (window_manager.window[window_manager.active_window].editor) {
					if (core.env.os == "darwin") {
						alert.show(core.module.localization.msg.alert_cannot_paste_in_darwin);
					} else {
						alert.show(core.module.localization.msg.alert_cannot_paste_in_not_darwin);
					}
					return;
				}
			}
		});

		$("a[action=do_delete]").off("click");
		$("a[action=do_delete]").click(function () {
			var window_manager = core.module.layout.workspace.window_manager;

			if (window_manager.window[window_manager.active_window]) {
				if (window_manager.window[window_manager.active_window].designer) {
					window_manager.window[window_manager.active_window].designer.canvas._delete();
				} else if (window_manager.window[window_manager.active_window].editor) {
					window_manager.window[window_manager.active_window].editor.do_delete();
				}
			}
		});

		$("a[action=preference]").off("click");
		$("a[action=preference]").click(function () {
			core.dialog.preference.show();
		});

		$("a[action=do_find]").off("click");
		$("a[action=do_find]").click(function () {
			core.dialog.find_and_replace.show();
		});

		$("a[action=do_go_to_line]").off("click");
		$("a[action=do_go_to_line]").click(function () {
			core.dialog.go_to_line.show();
		});

		$("a[action=do_find_next]").off("click");
		$("a[action=do_find_next]").click(function () {
			var window_manager = core.module.layout.workspace.window_manager;

			if (window_manager.window[window_manager.active_window]) {
				if (window_manager.window[window_manager.active_window].designer) {
					window_manager.window[window_manager.active_window].designer.canvas.do_delete();
				} else if (window_manager.window[window_manager.active_window].editor) {
					core.dialog.find_and_replace.find("next");
				}
			}
		});

		$("a[action=do_find_previous]").off("click");
		$("a[action=do_find_previous]").click(function () {
			var window_manager = core.module.layout.workspace.window_manager;

			if (window_manager.window[window_manager.active_window]) {
				if (window_manager.window[window_manager.active_window].designer) {
				} else if (window_manager.window[window_manager.active_window].editor) {
					core.dialog.find_and_replace.find("previous");
				}
			}
		});

		$("a[action=auto_formatting]").off("click");
		$("a[action=auto_formatting]").click(function () {
			var window_manager = core.module.layout.workspace.window_manager;

			if (window_manager.window[window_manager.active_window]) {
				if (window_manager.window[window_manager.active_window].designer) {
				} else if (window_manager.window[window_manager.active_window].editor) {
					window_manager.window[window_manager.active_window].editor.auto_formatting();
				}
			}
		});

		$("a[action=comment_selected]").off("click");
		$("a[action=comment_selected]").click(function () {
			var window_manager = core.module.layout.workspace.window_manager;

			if (window_manager.window[window_manager.active_window]) {
				if (window_manager.window[window_manager.active_window].designer) {
				} else if (window_manager.window[window_manager.active_window].editor) {
					window_manager.window[window_manager.active_window].editor.comment_selection();
				}
			}
		});

		$("a[action=uncomment_selected]").off("click");
		$("a[action=uncomment_selected]").click(function () {
			var window_manager = core.module.layout.workspace.window_manager;

			if (window_manager.window[window_manager.active_window]) {
				if (window_manager.window[window_manager.active_window].designer) {
				} else if (window_manager.window[window_manager.active_window].editor) {
					window_manager.window[window_manager.active_window].editor.uncomment_selection();
				}
			}
		});

		$("a[action=select_all]").off("click");
		$("a[action=select_all]").click(function () {
			var window_manager = core.module.layout.workspace.window_manager;

			if (window_manager.window[window_manager.active_window]) {
				if (window_manager.window[window_manager.active_window].designer) {
					window_manager.window[window_manager.active_window].designer.canvas.select_all();
				} else if (window_manager.window[window_manager.active_window].editor) {
					window_manager.window[window_manager.active_window].editor.select_all();
				}
			}
		});

		$("a[action=search]").off("click");
		$("a[action=search]").click(function () {
			core.dialog.search.show();
		});

		$("a[action=do_share_cursor]").off("click");
		$("a[action=do_share_cursor]").click(function () {
			core.sharing_cursor = !core.sharing_cursor;

			if (core.sharing_cursor) {
				$('#goorm_main_toolbar a[action=do_share_cursor]').find(".toolbar_button").addClass("toolbar_button_pressed");
			} else {
				$('#goorm_main_toolbar a[action=do_share_cursor]').find(".toolbar_button").removeClass("toolbar_button_pressed");
			}

			$(".user_name").toggle();
			$(".user_cursor").css("visibility", "hidden");
		});

		
		
		//Main Menu : Project
		$("a[action=run]").off("click");
		$("a[action=run]").click(function () {
			var run_lock=$(this);
			if(run_lock.data('disable')===true){
				return false;
			}
			run_lock.data('disable',true);
			window.setTimeout(function(){
				run_lock.data('disable',false);
			},500);
			core.module.project.run();
		});

		$("a[action=stop]").off("click");
		$("a[action=stop]").click(function () {
			if (core.module.plugin_manager.plugins["org.goorm.plugin." + core.status.current_project_type] !== undefined && !$(this).hasClass('yuimenuitemlabel-disabled')) {
				if (core.module.plugin_manager.plugins["org.goorm.plugin." + core.status.current_project_type].stop) {
					core.status.current_project_absolute_path = core.preference.workspace_path + core.status.current_project_path + "/";
					core.module.layout.inner_bottom_tabview.selectTab(1);
					core.module.layout.inner_layout.getUnitByPosition("bottom").expand();

					core.module.plugin_manager.plugins["org.goorm.plugin." + core.status.current_project_type].stop();
				}
			} else {
				var result = {
					result: false,
					code: 0
				};
				core.module.project.display_error_message(result, 'alert');

			}
		});

		$("a[action=build_project]").off("click");
		$("a[action=build_project]").click(function (e) {

			var build_lock=$(this);
			if(build_lock.data('disable')===true){
				return false;
			}
			build_lock.data('disable',true);
			window.setTimeout(function(){
				build_lock.data('disable',false);
			},500);

			if (!$(this).hasClass('yuimenuitemlabel-disabled')) {
				core.module.layout.inner_bottom_tabview.selectTab(1);

				if (core.module.plugin_manager.plugins["org.goorm.plugin." + core.status.current_project_type] !== undefined) {

					
					core.module.plugin_manager.plugins["org.goorm.plugin." + core.status.current_project_type].build(core.status.current_project_path);
					

					
				}

				e.stopPropagation();
				e.preventDefault();
				return false;
			}
		});

		$("a[action=build_clean]").off("click");
		$("a[action=build_clean]").click(function () {
			if (!$(this).hasClass('yuimenuitemlabel-disabled')) {
				core.module.layout.inner_bottom_tabview.selectTab(1);
				core.dialog.build_clean.show();
			}
		});

		$("a[action=build_configuration]").off("click");
		$("a[action=build_configuration]").click(function () {
			core.dialog.build_configuration.show();
		});

		$("a[action=import_project]").off("click");
		$("a[action=import_project]").click(function () {
			//core.dialog.new_project.show(true);
			core.dialog.import_project.show();
			$(".project_wizard_first_button[project-type=all]").trigger("click");
		});

		$("a[action=export_project]").off("click");
		$("a[action=export_project]").click(function () {
			core.dialog.export_project.show();
		});

		$("a[action=delete_project]").off("click");
		$("a[action=delete_project]").click(function () {
			core.dialog.delete_project.show();
		});

		

		$("a[action=show_properties]").off("click");
		$("a[action=show_properties]").click(function () {
			core.dialog.project_property.show();
		});

		//Main Menu : Debug
		$("a[action=debug]").off("click");
		$("a[action=debug]").click(function () {
			var plugin_manager = core.module.plugin_manager.plugins["org.goorm.plugin." + core.status.current_project_type];

			if (plugin_manager !== undefined && plugin_manager.debug && !$(this).hasClass('yuimenuitemlabel-disabled')) {
				core.module.layout.inner_bottom_tabview.selectTab(0);
				core.module.layout.inner_layout.getUnitByPosition("bottom").expand();
				core.module.layout.terminal.status = 'debug';

				core.module.plugin_manager.plugins["org.goorm.plugin." + core.status.current_project_type].debug(core.status.current_project_path);
				$("#goorm_main_toolbar .debug_continue, #goorm_main_toolbar .debug_terminate, #goorm_main_toolbar .debug_step_over, #goorm_main_toolbar .debug_step_in, #goorm_main_toolbar .debug_step_out").removeClass('debug_not_active');
				$("#goorm_main_toolbar .debug").addClass('debug_not_active');
				$("#Debug .menu-debug-continue, #Debug .menu-debug-terminate, #Debug .menu-debug-step-over, #Debug .menu-debug-step-in, #Debug .menu-debug-step-out").removeClass('debug_not_active');
				$("#Debug .menu-debug-start").addClass('debug_not_active');
			} else {
				var result = {
					result: false,
					code: 6
				};
				core.module.project.display_error_message(result, 'alert');
			}
		});

		$("a[action=debug_continue]").off("click");
		$("a[action=debug_continue]").click(function () {
			var plugin_manager = core.module.plugin_manager.plugins["org.goorm.plugin." + core.status.current_project_type];
			var has_terminal = false;
			var windows = core.module.layout.workspace.window_manager.window;
			for (var i = 0; i < windows.length; i++) {
				if (windows[i].filetype == "terminal") {
					has_terminal = true;
				}
			}

			if (plugin_manager !== undefined && has_terminal && !$(this).hasClass('yuimenuitemlabel-disabled')) {
				core.module.layout.inner_bottom_tabview.selectTab(0);
				var cmd = {
					mode: "continue",
					project_path: core.status.current_project_path
				};
				core.module.plugin_manager.plugins["org.goorm.plugin." + core.status.current_project_type].debug_cmd(cmd);
			} else {
				var result = {
					result: false,
					code: 6
				};
				core.module.project.display_error_message(result, 'alert');
			}
		});

		$("a[action=debug_terminate]").off("click");
		$("a[action=debug_terminate]").click(function (event, is_closed) {
			var plugin_manager = core.module.plugin_manager.plugins["org.goorm.plugin." + core.status.current_project_type];
			var has_terminal = false;
			var windows = core.module.layout.workspace.window_manager.window;
			var current = [];

			for (var i = 0; i < windows.length; i++) {
				if (windows[i].filetype == "terminal") {
					has_terminal = true;
					current.push(windows[i]);
				}
			}

			if (plugin_manager !== undefined && has_terminal && !$(this).hasClass('yuimenuitemlabel-disabled')) {
				core.module.layout.inner_bottom_tabview.selectTab(0);
				var cmd = {
					mode: "terminate",
					project_path: core.status.current_project_path
				};
				core.module.plugin_manager.plugins["org.goorm.plugin." + core.status.current_project_type].debug_cmd(cmd);
				if (current.length == 1 && is_closed === undefined) {
					//$(document).trigger(core.module.layout.terminal.terminal_name + "_closed", true);
					current[0].close();
				}
				$("#goorm_main_toolbar .debug_continue, #goorm_main_toolbar .debug_terminate, #goorm_main_toolbar .debug_step_over, #goorm_main_toolbar .debug_step_in, #goorm_main_toolbar .debug_step_out").addClass('debug_not_active');
				$("#goorm_main_toolbar .debug").removeClass("debug_not_active");
				$("#Debug .menu-debug-continue, #Debug .menu-debug-terminate, #Debug .menu-debug-step-over, #Debug .menu-debug-step-in, #Debug .menu-debug-step-out").addClass('debug_not_active');
				$("#Debug .menu-debug-start").removeClass('debug_not_active');
			} else {
				var result = {
					result: false,
					code: 6
				};
				core.module.project.display_error_message(result, 'alert');
			}
		});

		$("a[action=debug_step_over]").off("click");
		$("a[action=debug_step_over]").click(function () {
			var plugin_manager = core.module.plugin_manager.plugins["org.goorm.plugin." + core.status.current_project_type];
			var has_terminal = false;
			var windows = core.module.layout.workspace.window_manager.window;
			for (var i = 0; i < windows.length; i++) {
				if (windows[i].filetype == "terminal") {
					has_terminal = true;
				}
			}

			if (plugin_manager !== undefined && has_terminal && !$(this).hasClass('yuimenuitemlabel-disabled')) {
				core.module.layout.inner_bottom_tabview.selectTab(0);
				var cmd = {
					mode: "step_over",
					project_path: core.status.current_project_path
				};
				core.module.plugin_manager.plugins["org.goorm.plugin." + core.status.current_project_type].debug_cmd(cmd);
			} else {
				var result = {
					result: false,
					code: 6
				};
				core.module.project.display_error_message(result, 'alert');
			}
		});

		$("a[action=debug_step_in]").off("click");
		$("a[action=debug_step_in]").click(function () {
			var plugin_manager = core.module.plugin_manager.plugins["org.goorm.plugin." + core.status.current_project_type];
			var has_terminal = false;
			var windows = core.module.layout.workspace.window_manager.window;
			for (var i = 0; i < windows.length; i++) {
				if (windows[i].filetype == "terminal") {
					has_terminal = true;
				}
			}

			if (plugin_manager !== undefined && has_terminal && !$(this).hasClass('yuimenuitemlabel-disabled')) {
				core.module.layout.inner_bottom_tabview.selectTab(0);
				var cmd = {
					mode: "step_in",
					project_path: core.status.current_project_path
				};
				core.module.plugin_manager.plugins["org.goorm.plugin." + core.status.current_project_type].debug_cmd(cmd);
			} else {
				var result = {
					result: false,
					code: 6
				};
				core.module.project.display_error_message(result, 'alert');
			}
		});

		$("a[action=debug_step_out]").off("click");
		$("a[action=debug_step_out]").click(function () {
			var plugin_manager = core.module.plugin_manager.plugins["org.goorm.plugin." + core.status.current_project_type];
			var has_terminal = false;
			var windows = core.module.layout.workspace.window_manager.window;
			for (var i = 0; i < windows.length; i++) {
				if (windows[i].filetype == "terminal") {
					has_terminal = true;
				}
			}

			if (plugin_manager !== undefined && has_terminal && !$(this).hasClass('yuimenuitemlabel-disabled')) {
				core.module.layout.inner_bottom_tabview.selectTab(0);
				var cmd = {
					mode: "step_out",
					project_path: core.status.current_project_path
				};
				core.module.plugin_manager.plugins["org.goorm.plugin." + core.status.current_project_type].debug_cmd(cmd);
			} else {
				var result = {
					result: false,
					code: 6
				};
				core.module.project.display_error_message(result, 'alert');
			}
		});

		//Main Menu : window
		$("a[action=new_main_window]").off("click");
		$("a[action=new_main_window]").click(function () {
			core.new_main_window();
		});

		

		$("a[action=open_recent_file]").off("click");
		$("a[action=open_recent_file]").click(function () {
			var recent_window = core.module.layout.workspace.window_manager.recent_window;

			if(recent_window && recent_window.length > 0) {
				var recent_file = recent_window[recent_window.length-1];

				core.module.layout.workspace.window_manager.open(recent_file.filepath, recent_file.filename, recent_file.filetype);
			}
		});

		$("a[action=previous_window]").off("click");
		$("a[action=previous_window]").click(function () {
			core.module.layout.workspace.window_manager.previous_window();
		});

		$("a[action=next_window]").off("click");
		$("a[action=next_window]").click(function () {
			core.module.layout.workspace.window_manager.next_window();
		});

		$("a[action=left_layout_toggle]").off("click");
		$("a[action=left_layout_toggle]").click(function () {
			if (core.module.layout.layout.getUnitByPosition("left")._collapsed) {
				core.module.layout.layout.getUnitByPosition("left").expand();
			} else {
				core.module.layout.layout.getUnitByPosition("left").collapse();
			}
		});

		$("a[action=left_project_explorer_show]").off("click");
		$("a[action=left_project_explorer_show]").click(function () {
			if (core.module.layout.layout.getUnitByPosition("left")._collapsed) {
				core.module.layout.layout.getUnitByPosition("left").expand();
			}
			core.module.layout.left_tabview.selectTab(0);
		});

		

		$("a[action=right_layout_toggle]").off("click");
		$("a[action=right_layout_toggle]").click(function () {
			if (core.module.layout.inner_layout.getUnitByPosition("right")._collapsed) {
				core.module.layout.inner_layout.getUnitByPosition("right").expand();
			} else {
				core.module.layout.inner_layout.getUnitByPosition("right").collapse();
			}
		});

		

		$("a[action=right_outline_show]").off("click");
		$("a[action=right_outline_show]").click(function () {
			if (core.module.layout.inner_layout.getUnitByPosition("right")._collapsed) {
				core.module.layout.inner_layout.getUnitByPosition("right").expand();
			}

			
			core.module.layout.inner_right_tabview.selectTab(0);
			

			
		});

		$("a[action=bottom_layout_toggle]").off("click");
		$("a[action=bottom_layout_toggle]").click(function () {
			if (core.module.layout.inner_layout.getUnitByPosition("bottom")._collapsed) {
				core.module.layout.inner_layout.getUnitByPosition("bottom").expand();
			} else {
				core.module.layout.inner_layout.getUnitByPosition("bottom").collapse();
			}
		});

		$("a[action=bottom_debug_show]").off("click");
		$("a[action=bottom_debug_show]").click(function () {
			if (core.module.layout.inner_layout.getUnitByPosition("bottom")._collapsed) {
				core.module.layout.inner_layout.getUnitByPosition("bottom").expand();
			}
			core.module.layout.inner_bottom_tabview.selectTab(0);
		});

		$("a[action=bottom_search_show]").off("click");
		$("a[action=bottom_search_show]").click(function () {
			if (core.module.layout.inner_layout.getUnitByPosition("bottom")._collapsed) {
				core.module.layout.inner_layout.getUnitByPosition("bottom").expand();
			}
			core.module.layout.inner_bottom_tabview.selectTab(2);
		});

		$("a[action=layout_default]").off("click");
		$("a[action=layout_default]").click(function () {
			var window_width = $(window).width();
			var window_height = $(window).height();

			if (core.module.layout.inner_layout.getUnitByPosition("bottom")._collapsed) {
				core.module.layout.inner_layout.getUnitByPosition("bottom").expand();
			}

			if (core.module.layout.inner_layout.getUnitByPosition("right")._collapsed) {
				core.module.layout.inner_layout.getUnitByPosition("right").expand();
			}

			if (core.module.layout.layout.getUnitByPosition("left")._collapsed) {
				core.module.layout.layout.getUnitByPosition("left").expand();
			}

			core.module.layout.layout._units.left.set('width', window_width * 0.18);
			core.module.layout.inner_layout._units.right.set('width', window_width * 0.25);
			core.module.layout.inner_layout._units.bottom.set('height', window_height * 0.25);

		});

		$("a[action=toggle_full_workspace]").off("click");
		$("a[action=toggle_full_workspace]").click(function () {
			if (core.module.layout.layout.getUnitByPosition("left")._collapsed) {
				core.module.layout.layout.getUnitByPosition("left").expand();
				core.module.layout.inner_layout.getUnitByPosition("right").expand();
				core.module.layout.inner_layout.getUnitByPosition("bottom").expand();
			} else {
				core.module.layout.layout.getUnitByPosition("left").collapse();
				core.module.layout.inner_layout.getUnitByPosition("right").collapse();
				core.module.layout.inner_layout.getUnitByPosition("bottom").collapse();
			}
		});

		$("a[action=hide_all_windows]").off("click");
		$("a[action=hide_all_windows]").click(function () {
			core.module.layout.workspace.window_manager.hide_all_windows();
		});

		$("a[action=show_all_windows]").off("click");
		$("a[action=show_all_windows]").click(function () {
			core.module.layout.workspace.window_manager.show_all_windows();
		});

		$("a[action=cascade]").off("click");
		$("a[action=cascade]").click(function () {
			core.module.layout.workspace.window_manager.cascade();
		});

		$("a[action=tile_vertically]").off("click");
		$("a[action=tile_vertically]").click(function () {
			core.module.layout.workspace.window_manager.tile_vertically();
		});
		$("a[action=tile_left]").off("click");
		$("a[action=tile_left]").click(function () {
			core.module.layout.workspace.window_manager.tile_left();
		});
		$("a[action=tile_right]").off("click");
		$("a[action=tile_right]").click(function () {
			core.module.layout.workspace.window_manager.tile_right();
		});

		$("a[action=tile_horizontally]").off("click");
		$("a[action=tile_horizontally]").click(function () {
			core.module.layout.workspace.window_manager.tile_horizontally();
		});
		
		//Main Menu : Help
		$("a[action=help_contents]").off("click");
		$("a[action=help_contents]").click(function () {
			core.dialog.help_contents.show();
		});

		$("a[action=helpSearch]").off("click");
		$("a[action=helpSearch]").click(function () {
			core.dialog.help_search.show();
		});

		$("a[action=helpTipsAndTricks]").off("click");
		$("a[action=helpTipsAndTricks]").click(function () {
			core.dialog.help_tips_and_tricks.show();
		});

		$("a[action=help_check_for_updates]").off("click");
		$("a[action=help_check_for_updates]").click(function () {
			core.dialog.help_check_for_updates.show();
		});

		$("a[action=help_install_new_plugin]").off("click");
		$("a[action=help_install_new_plugin]").click(function () {
			core.dialog.help_install_new_plugin.show();
		});

		$("a[action=help_about]").off("click");
		$("a[action=help_about]").click(function () {
			core.dialog.help_about.show();
		});

		$("a[action=help_about_private_url]").off("click");
		$("a[action=help_about_private_url]").click(function () {
			core.dialog.help_about_private_url.show();
		});

		$("a[action=help_bug_report]").off("click");
		$("a[action=help_bug_report]").click(function () {
			// core.dialog.help_bug_report.show();
			survey.init(function () {});
			survey.panel.show();
		});
		
		//Context Menu : File
		$("a[action=new_file_file_context]").off("click");
		$("a[action=new_file_file_context]").click(function () {
			var target = $("#project_treeview").find(".ygtvfocus")[0];
			if (target) {
				var node = core.module.layout.project_explorer.treeview.getNodeByElement(target);
				var target_src = node.data.parent_label + "/" + node.data.filename;
				core.dialog.new_file.show("context");

				$(core.dialog.new_file.dialog_explorer).off("treeviewRenderComplete");
				$(core.dialog.new_file.dialog_explorer).on("treeviewRenderComplete", function () {
					if (target_src[0] == '/') target_src = node.data.name;
					core.dialog.new_file.expand("#file_new_dir_tree", target_src);
					core.dialog.new_file.add_items("#file_new_files", target_src);

					$('#file_new_location_path').val(target_src);
				});

			} else {
				core.dialog.new_file.show("context");
			}
		});

		$("a[action=open_context]").off("click");
		$("a[action=open_context]").click(function () {
			var filename = (core.status.selected_file.split("/")).pop();
			var filetype = null;
			if (filename.indexOf(".") != -1)
				filetype = (filename.split(".")).pop();

			var filepath = core.status.selected_file.replace(filename, "");

			core.module.layout.workspace.window_manager.open(filepath, filename, filetype);
		});

		$("a[action=open_default_editor]").off("click");
		$("a[action=open_default_editor]").click(function () {
			var filename = (core.status.selected_file.split("/")).pop();
			var filetype = null;
			if (filename.indexOf(".") != -1)
				filetype = (filename.split(".")).pop();
			var filepath = core.status.selected_file.replace(filename, "");

			core.module.layout.workspace.window_manager.open(filepath, filename, filetype);
		});

		$("a[action=open_text_editor]").off("click");
		$("a[action=open_text_editor]").click(function () {
			var filename = (core.status.selected_file.split("/")).pop();
			var filetype = null;
			if (filename.indexOf(".") != -1)
				filetype = (filename.split(".")).pop();
			var filepath = core.status.selected_file.replace(filename, "");

			core.module.layout.workspace.window_manager.open(filepath, filename, filetype, "Editor");
		});

		$("a[action=open_vim_editor]").off("click");
		$("a[action=open_vim_editor]").click(function () {
			var filename = (core.status.selected_file.split("/")).pop();
			var filetype = null;
			if (filename.indexOf(".") != -1)
				filetype = (filename.split(".")).pop();
			var filepath = core.status.selected_file.replace(filename, "");

			var editor = core.module.layout.workspace.window_manager.open(filepath, filename, filetype, "Editor").editor;
			editor.set_option({
				"vim_mode": true
			});
		});

		

		$("a[action=move_context]").off("click");
		$("a[action=move_context]").click(function () {
			core.dialog.move_file.show("context");
		});

		$("a[action=rename_context]").off("click");
		$("a[action=rename_context]").click(function () {
			core.dialog.rename_file.show("context");
		});
		$("a[action=Copy_context]").off("click");
		$("a[action=Copy_context]").click(function () {
			core.module.layout.project_explorer.copy();
		});
		$("a[action=Paste_context]").off("click");
		$("a[action=Paste_context]").click(function () {
			core.module.layout.project_explorer.paste();
		});
		$("a[action=delete_all_context]").off("click");
		$("a[action=delete_all_context]").click(function () {
			var selected_items = $("#project_treeview .ygtvfocus .node");
			if (selected_items.length > 1) {

				var files = [],
					directorys = [];

				$(selected_items).each(function (i, o) {
					if ($(o).find('img').hasClass("file")) {
						files.push($(o).find(".fullpath").html());
					} else {
						directorys.push($(o).find(".fullpath").html());
					}
				});

				confirmation.init({
					title: core.module.localization.msg.confirmation_delete_title,
					message: core.module.localization.msg.confirmation_delete_all,
					yes_text: core.module.localization.msg.confirmation_yes,
					no_text: core.module.localization.msg.confirmation_no,
					yes: function () {
						var postdata = {
							files: files,
							directorys: directorys
						};
						$.get("file/delete_all", postdata, function (data) {
							if (data.err_code == 20) {
								alert.show(core.module.localization.msg[data.message]);
							}
							core.module.layout.project_explorer.refresh();
						});
					},
					no: function () {
						confirmation.panel.hide();
					}
				});
				confirmation.panel.show();

			} else {
				console.log("so small");
			}
		});
		$("a[action=delete_context]").off("click");
		$("a[action=delete_context]").click(function () {

			if (core.status.current_project_path === "") { //case select project
				var tmp = core.status.selected_file.substring(1); //and select project root
				if (tmp.indexOf('/') == -1) {
					core.dialog.delete_project.show(function () {
						$("#project_delete_list #selector_" + tmp.replace(core.user.id + "_", "")).click();
					});
					return;
				}
			}

			if (core.status.current_project_path === core.status.selected_file) { //each root
				core.dialog.delete_project.show(function () {
					$("#project_delete_list #selector_" + core.status.current_project_name).click();
				});
				return;
			}
			confirmation.init({
				title: core.module.localization.msg.confirmation_delete_title,
				message: core.module.localization.msg.confirmation_delete_file,
				yes_text: core.module.localization.msg.confirmation_yes,
				no_text: core.module.localization.msg.confirmation_no,
				yes: function () {
					var postdata = {
						filename: core.status.selected_file
					};
					$.get("file/delete", postdata, function (data) {
						if (data.err_code == 20) {
							alert.show(core.module.localization.msg[data.message]);
						}
						//m.s("delete: " + core.status.selected_file);
						core.module.layout.project_explorer.refresh();
						var window_list = core.module.layout.workspace.window_manager.window;

						for (var i = window_list.length - 1; i >= 0; i--) {
							if ((window_list[i].title).indexOf(core.status.selected_file) > -1) {
								window_list[i].is_saved = true;
								window_list[i].tab.is_saved = true;
								window_list[i].close();
							}
						}

					});
				},
				no: function () {
					confirmation.panel.hide();
				}
			});

			confirmation.panel.show();
		});

		$("a[action=find_in_folder_context]").off("click");
		$("a[action=find_in_folder_context]").click(function () {
			core.dialog.search.show('/'+core.status.selected_file);
		});

		$("a[action=new_file_folder_context]").off("click");
		$("a[action=new_file_folder_context]").click(function (e) {
			var target = $("#project_treeview").find(".ygtvfocus")[0];
			if (target) {
				var node = core.module.layout.project_explorer.treeview.getNodeByElement(target);
				var target_src = node.data.parent_label + "/" + node.data.filename;
				core.dialog.new_folder.show("context");

				$(core.dialog.new_folder.dialog_explorer).off("treeviewRenderComplete");
				$(core.dialog.new_folder.dialog_explorer).on("treeviewRenderComplete", function () {
					if (target_src[0] == '/') target_src = node.data.name;
					core.dialog.new_folder.expand("#folder_new_dir_tree", target_src);
					$('#folder_new_location_path').val(target_src);
				});
			} else {
				core.dialog.new_folder.show("context");
			}
		});

		$("a[action=new_file_textfile_context]").off("click");
		$("a[action=new_file_textfile_context]").click(function (e) {
			var target = $("#project_treeview").find(".ygtvfocus")[0];
			if (target) {
				var node = core.module.layout.project_explorer.treeview.getNodeByElement(target);
				var target_src = node.data.parent_label + "/" + node.data.filename;

				core.dialog.new_untitled_textfile.show("context");

				$(core.dialog.new_untitled_textfile.dialog_explorer).off("treeviewRenderComplete");
				$(core.dialog.new_untitled_textfile.dialog_explorer).on("treeviewRenderComplete", function () {
					if (target_src[0] == '/') target_src = node.data.name;
					core.dialog.new_untitled_textfile.expand("#text_new_dir_tree", target_src);
					$('#text_new_location_path').val(target_src);
				});
			} else {
				core.dialog.new_untitled_textfile.show("context");
			}
		});

		$("a[action=folder_open_context]").off("click");
		$("a[action=folder_open_context]").click(function (e) {
			var target = $("#project_treeview").find(".ygtvfocus")[0];
			core.module.layout.project_explorer.treeview.getNodeByElement(target).expand();
		});

		$("a[action=folder_close_context]").off("click");
		$("a[action=folder_close_context]").click(function (e) {
			var target = $("#project_treeview").find(".ygtvfocus")[0];
			core.module.layout.project_explorer.treeview.getNodeByElement(target).collapse();
		});

		

		$("a[action=do_terminal_clear]").off('click');
		$("a[action=do_terminal_clear]").click(function () {
			core.module.layout.terminal.Terminal.handler('\x0C');
		});
		$("a[action=do_terminal_copy]").off('click');
		$("a[action=do_terminal_copy]").click(function () {

		});

		$(core).trigger('goorm_menu_load_complete');
	}
};