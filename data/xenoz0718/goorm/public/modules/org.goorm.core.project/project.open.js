/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

/*jshint newcap:false, debug:true, unused: true, evil: true, devel: true, plusplus: false, browser: true, jquery: true, undef:false */
/*clientside jslint comment for global */
/*global org: false, core: false, YAHOO: false, localStorage: false */
/*jshint unused: false */



org.goorm.core.project.open = {
	dialog: null,
	buttons: null,
	chat: null,
	project_list: null,
	recent_project: [],

	init: function () {

		var self = this;

		var handle_open = function (panel) {
			var data = self.project_list.get_data();

			if (data.path === "" || data.name === "" || data.type === "") {
				alert.show(core.module.localization.msg.alert_project_not_selected);
				return false;
			} else {
				self.open(data.path, data.name, data.type);
				
				if (typeof(this.hide) !== 'function' && panel) {
					panel.hide();
				}
				else{
					this.hide();
				}
			}
		};

		var handle_cancel = function () {

			this.hide();
		};

		this.buttons = [{
			id: "g_project_open_btn_open",
			text: "<span localization_key='open'>Open</span>",
			handler: handle_open,
			isDefault: true
		}, {
			id: "g_project_open_btn_cancel",
			text: "<span localization_key='cancel'>Cancel</span>",
			handler: handle_cancel
		}];

		this.dialog = org.goorm.core.project.open.dialog;
		this.dialog.init({
			localization_key: "title_open_project",
			title: "Open Project",
			path: "configs/dialogs/org.goorm.core.project/project.open.html",
			width: 800,
			height: 500,
			modal: true,
			opacity: true,
			buttons: this.buttons,
			success: function () {
				var resize = new YAHOO.util.Resize("project_open_dialog_left", {
					handles: ['r'],
					minWidth: 200,
					maxWidth: 400
				});

				resize.on('resize', function (ev) {
					var width = $("#project_open_dialog_middle").width();
					var w = ev.width;
					$("#project_open_dialog_center").css('width', (width - w - 9) + 'px');
				});
			}
		});
		this.dialog = this.dialog.dialog;

		this.project_list = new org.goorm.core.project.list();

		for (var i = 4; i >= 0; i--) {
			$("ul[id='open_recent_project_ul']").append('<li class="yuimenuitem" ><a href ="#"  class="yuimenuitemlabel" action="open_recent_project_' + i + '" ></a></li>');
		}
		$("ul[id='clear_recent_project_ul']").append('<li class="yuimenuitem" ><a href ="#"  class="yuimenuitemlabel"   action="open_recent_project_clear" localization_key="clear_recent_project" >Clear Recent Projects</a></li>');
		//hide
		for (var i = self.recent_project.length; i < 5; i++) {
			$("a[action=open_recent_project_" + i + "]").css('display', 'none');
		}
	},

	show: function () {
		this.project_list.init("#project_open");
		this.dialog.panel.show();
	},

	open: function (current_project_path, current_project_name, current_project_type) {
		var self = this;
		recent_project_temp = {};
		recent_project_temp.current_project_path = current_project_path;
		recent_project_temp.current_project_name = current_project_name;
		recent_project_temp.current_project_type = current_project_type;

		//recent project start
		//1. handle recent project data 
		if (current_project_path !== "") {
			//already contained ->remove			
			for (var i = 0; i < self.recent_project.length; i++) {
				if (self.recent_project[i].current_project_path == current_project_path) {
					self.recent_project.remove(i);
				}
			}

			//push
			self.recent_project.push(recent_project_temp);

			//over 5 -> remove 
			if (self.recent_project.length == 6) {
				self.recent_project.remove(0);
			}

		}
		//2. reorganize menu
		//2,1 setting text, click 
		for (var i = 0; i < self.recent_project.length; i++) {
			$("a[action=open_recent_project_" + i + "]").css('display', 'list-item');
			$("a[action=open_recent_project_" + i + "]").text(self.recent_project[i].current_project_path);
			$("a[action=open_recent_project_" + i + "]").unbind("click");
			$("a[action=open_recent_project_" + i + "]").click(function () {
				var target_current_project_path = $(this).text();

				for (var t = 0; t < self.recent_project.length; t++) {
					if (self.recent_project[t].current_project_path == target_current_project_path) {
						self.open(
							self.recent_project[t].current_project_path,
							self.recent_project[t].current_project_name,
							self.recent_project[t].current_project_type
						);
						break;
					}
				}
			});
			$("a[action=open_recent_project_clear]").click(function () {
				for (var i = self.recent_project.length; i >= 0; i--) {
					$("a[action=open_recent_project_" + i + "]").css('display', 'none');
					$("a[action=open_recent_project_" + i + "]").text('');
				}
				self.recent_project.length=0;
				$($("#open_recent_project_ul").children()[0]).css('display', 'list-item');

			});
		}
		//2.2 hide
		for (var i = self.recent_project.length; i < 5; i++) {
			$("a[action=open_recent_project_" + i + "]").css('display', 'none');
		}
		if (current_project_path !== "") {
			$($("#open_recent_project_ul").children()[0]).css('display', 'none');
		}
		//recent project end

		

		core.status.current_project_path = current_project_path;
		core.status.current_project_name = current_project_name;
		core.status.current_project_type = current_project_type;

		var current_project = {};
		current_project.current_project_path = current_project_path;
		current_project.current_project_name = current_project_name;
		current_project.current_project_type = current_project_type;

		localStorage.current_project = JSON.stringify(current_project);

		core.dialog.project_property.refresh_toolbox();
		core.module.layout.project_explorer.refresh();

		

		core.module.layout.terminal.change_project_dir();
		core.module.layout.workspace.window_manager.refresh_all_title();
		
		$(core).trigger("on_project_open");
	}
};
