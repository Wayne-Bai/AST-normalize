/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

/*jshint newcap:false, debug:true, unused: true, evil: true, devel: true, plusplus: false, browser: true, jquery: true, undef:false */
/*clientside jslint comment for global */
/*global org: false, core: false, notice: false */
/*jshint unused: false */



org.goorm.core.project._new = {
	dialog: null,
	buttons: null,
	tabview: null,

	init: function () {
		var self = this;

		var handle_ok = function (panel) {
			// project create
			if ($("#input_project_type").attr("value") === "") {
				alert.show(core.module.localization.msg.alert_project_detailed_type);
				return false;
			} else if ($("#inputProjectSource").attr("value") === "") {
				alert.show(core.module.localization.msg.alert_project_source);
				return false;
			} else if ($("#input_project_detailed_type").attr("value") === "") {
				alert.show(core.module.localization.msg.alert_project_detailed_type);
				return false;
			} else if ($("#input_project_author").val() === "") {
				alert.show(core.module.localization.msg.alert_project_author);
				return false;
			} else if ($("#input_project_author_name").val() === "") {
				alert.show(core.module.localization.msg.alert_project_author_name);
				return false;
			} else if ($("#input_project_name").val() === "") {
				alert.show(core.module.localization.msg.alert_project_name);
				return false;
			//} else if ($("#input_project_desc").val() === "") {
				// alert.show(core.module.localization.msg.alert_project_desc);
				// return false;
			} else if ($("#check_project_new_import").is(":checked")) {
				if ($("#project_new_import_file").val().substr($("#project_new_import_file").val().length - 3, 3).toLowerCase() != "zip") {
					alert.show(core.module.localization.msg.alert_only_zip_allowed);
					return false;
				}
			} else if (!/^[\w가-힣 0-9a-zA-Z._-]*$/.test($("#input_project_author_name").val())) {
				alert.show(core.module.localization.msg.alert_allow_character);
				return false;
			} else if (!/^[\w-_]*$/.test($("#input_project_name").val())) {
				alert.show(core.module.localization.msg.alert_allow_character);
				return false;
			}

			if ($("#new_projectUsingPlugin").val() == "yes") {
				var senddata = {
					project_new_svn_url: $("#project_new_svn_url").attr("value"),
					project_new_svn_id: $("#project_new_svn_id").attr("value"),
					project_new_svn_pw: $("#project_new_svn_pw").attr("value"),
					project_new_svn_save_pw: $("#project_new_svn_save_pw").is(":checked")
				};

				var input_project_type = $("#input_project_type").attr("value");
				var input_project_detailed_type = $("#input_project_detailed_type").attr("value");
				var input_project_author = $("#input_project_author").val();
				var input_project_name = $("#input_project_name").val();

				core.status.current_project_path = input_project_author + "_" + input_project_name;
				core.status.current_project_name = input_project_name;
				core.status.current_project_type = input_project_type;

				core.module.plugin_manager.new_project(input_project_name, input_project_author, input_project_type, input_project_detailed_type, input_project_author + "_" + input_project_name, senddata);
			} else {
				var use_collaboration = $("#check_use_collaboration").attr("checked");
				if (use_collaboration === undefined || use_collaboration == "undefined") {
					use_collaboration = "not checked";
				}

				var plugin_name = $("#input_project_plugin").val();
				var plugin = {};
				core.preference.plugins[plugin_name] && (plugin[plugin_name] = core.preference.plugins[plugin_name]);

				var project_desc = $("#input_project_desc").val();
				project_desc = project_desc.replace(/&(lt|gt);/g, function (strMatch, p1) {
					return (p1 == "lt") ? "<" : ">";
				});
				project_desc = project_desc.replace(/<\/?[^>]+(>|$)/g, "");

				var senddata = {
					project_type: $("#input_project_type").attr("value"),
					project_detailed_type: $("#input_project_detailed_type").attr("value"),
					project_author: $("#input_project_author").val(),
					project_author_name: $("#input_project_author_name").val(),
					project_name: $("#input_project_name").val(),
					project_desc: project_desc,
					use_collaboration: use_collaboration,
					plugins: plugin,
				};



				$.get("project/new", senddata, function (data) {
					if (data.err_code === 0) {

						

						/*
						 * for plugin, moyara 12.8.6
						 */
						core.status.current_project_path = data.project_author + "_" + data.project_name;
						core.status.current_project_name = data.project_name;
						core.status.current_project_type = data.project_type;

						core.dialog.open_project.open(data.project_author + "_" + data.project_name, data.project_name, data.project_type);

						// new project with import
						if ($("#check_project_new_import").is(":checked")) {
							$("#project_new_location").val(core.status.current_project_path);
							$('#project_new_import_form').submit();
							core.module.layout.terminal.resize_terminal();
						}
						// new project without import
						else{
							$(core).trigger('project_is_created');

							core.module.plugin_manager.new_project(senddata);

							core.module.layout.terminal.resize_terminal();
						}

						
					} else {
						alert.show(data.message);
						return false;
					}

					self.dialog.panel.hide();
				});
			}

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
			id: "g_project_new_btn_ok",
			text: "<span localization_key='ok'>OK</span>",
			handler: handle_ok,
			isDefault: true
		}, {
			id: "g_project_new_btn_cancel",
			text: "<span localization_key='cancel'>Cancel</span>",
			handler: handle_cancel
		}];

		this.dialog = org.goorm.core.project._new.dialog;

		this.dialog.init({
			localization_key: "title_new_project",
			title: "New Project",
			path: "configs/dialogs/org.goorm.core.project/project._new.html",
			width: 800,
			height: 500,
			modal: true,
			opacity: true,
			buttons: this.buttons,
			success: function () {

				self.add_project_item();

				

				var form_options = {
					target: "#project_new_import_upload_output",
					beforeSubmit : function(){
						core.module.loading_bar.start("Import processing...");
					},

					success: function (data) {
						self.dialog.panel.hide();
						core.module.loading_bar.stop();
						if (data.err_code === 0) {
							notice.show(data.message);
							core.module.layout.project_explorer.refresh();
						} else {
							alert.show(data.message);
						}
					},

					error : function(){
						core.module.loading_bar.stop();
					}
				};

				$('#project_new_import_form').ajaxForm(form_options);

				$('#project_new_import_form').submit(function () {
					// return false to prevent normal browser submit and page navigation
					return false;
				});

				$("#check_project_new_import").click(function () {
					if ($(this).is(":checked")) {
						$("#project_new_import_div").show();
					} else {
						$("#project_new_import_div").hide();
					}
				});

			},
			kind: "new_project",
			next: function () {
				if ($("#project_new .project_items .selected_button").length != 1) {
					alert.show(core.module.localization.msg.alert_project_detailed_type);
					return false;
				} else {
					if ($("#project_new .project_items .selected_button").attr('project_type').indexOf('examples') >= 0) {
						$("#import_field").hide();
					} else {
						$("#import_field").show();
					}
					

					window.setTimeout(function () {
						$('#input_project_name').focus();
					}, 200);
					return true;
				}
			}
		});

		this.dialog = this.dialog.dialog;



	},

	show: function () {
		var self = this;
		

		//count the total step of wizard dialog
		this.dialog.total_step = $("div[id='project_new']").find(".wizard_step").size();
		// Add click event on dialog select item
		$(".project_wizard_first_button").click(function () {
			$(".project_wizard_second_button").removeClass("selected_button");

			$("#input_project_type").attr("value", "");
			$("#input_project_detailed_type").attr("value", "");
			$("#input_project_plugin").attr("value", "");

			$("#text_project_description").empty();

			$(".project_wizard_first_button").removeClass("selected_button");
			$(this).addClass("selected_button");

			$(".all").hide();
			$("." + $(this).attr("project_type")).show();
		});

		$(".project_wizard_second_button").click(function () {
			$(".project_wizard_second_button").removeClass("selected_button");
			$(this).addClass("selected_button");

			$("#input_project_type").attr("value", "");
			$("#input_project_detailed_type").attr("value", "");
			$("#input_project_plugin").attr("value", "");

			$("#input_project_type").attr("value", $(this).attr("project_type"));
			$("#input_project_detailed_type").attr("value", $(this).text());
			$("#input_project_plugin").attr("value", $(this).attr("plugin_name"));

			$("#text_project_description").empty();
			$("#text_project_description").append($(this).attr('description'));

			var self = this;
			$("#new_projectExpansionContainer").children().each(function (i) {
				if ($(this).attr("expansion") == $(self).attr("expansion")) {
					$(this).show();
				} else {
					$(this).hide();
				}
			});
		});

		//for init
		$(".project_wizard_second_button").removeClass("selected_button");
		$("#input_project_type").attr("value", "");
		$("#input_project_detailed_type").val("");
		$("#input_project_plugin").val("");
		$("#input_project_author").val(core.user.id.replace(/ /g, "_"));
		$("#input_project_author").attr('readonly', 'readonly');
		$("#input_project_author").addClass('readonly');
		$("#input_project_author_name").attr('readonly', 'readonly');
		$("#input_project_author_name").addClass('readonly');
		$("#input_project_author_name").val(core.user.name.replace(/ /g, "_"));
		$("#input_project_name").val("");
		$("#input_project_desc").val("");
		$("#project_new_import_upload_output").empty();
		$("#project_new_import_file").val("");
		$("#check_project_new_import").attr('checked', false);
		$("#check_use_collaboration").attr('checked', false);
		$("#project_new_import_div").hide();

		$("div[id='project_new']").find(".project_types").scrollTop(0);
		$("div[id='project_new']").find(".project_items").scrollTop(0);




		$(self.dialog.panel.element).find('input[readonly!=readonly][type=text]').unbind();
		$(self.dialog.panel.element).find('input[readonly!=readonly][type=text]').keydown(function(e){
			if(e.keyCode===13)	$("#g_w_btn_ok").click();
		});

		$(self.dialog.panel.element).find("textarea").unbind();
		$(self.dialog.panel.element).find("textarea").keydown(function(e){
			if(e.keyCode===13 && !e.shiftKey)	$("#g_w_btn_ok").click();
		});

		this.dialog.showFirstPage();

		this.dialog.panel.show();
	},

	add_project_item: function () {
		// for step 1
		$("div[id='project_new']").find(".project_types").append("<div class='project_wizard_first_button selected_button' project_type='all'><div class='project_type_icon'><img src='images/org.goorm.core.project/project.png' class='project_icon' /></div><div class='project_type_title'>All</div><div class='project_type_description'>View all available<br />project items</div></div>");

		/*
		$("div[id='project_new']").find(".project_types").append("<div class='project_wizard_first_button' project_type='goormp'><div class='project_type_icon'><img src='images/org.goorm.core.project/goorm_project.png' class='project_icon' /></div><div class='project_type_title'>goorm Project</div><div class='project_type_description'>Customization/Plugin<br />/Theme</div></div>");

		$("div[id='project_new']").find(".project_items").append("<div class='project_wizard_second_button all goormp' description=' Create New goorm Customization Project' project_type='goorm'><img src='images/org.goorm.core.project/customization.png' class='project_item_icon' /><br /><a>goorm Customization</a></div>");
		$("div[id='project_new']").find(".project_items").append("<div class='project_wizard_second_button all goormp' description=' Create New goorm Plugin' project_type='goorm'><img src='images/org.goorm.core.project/plugin.png' class='project_item_icon' /><br /><a>goorm Plugin</a></div>");
		$("div[id='project_new']").find(".project_items").append("<div class='project_wizard_second_button all goormp' description=' Create New goorm Theme' project_type='goorm'><img src='images/org.goorm.core.project/theme.png' class='project_item_icon' /><br /><a>goorm Theme</a></div>");
*/

	},



};
