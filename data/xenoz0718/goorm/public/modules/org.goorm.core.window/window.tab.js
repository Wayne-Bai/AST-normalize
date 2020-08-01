/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

/*jshint newcap:false, debug:true, unused: true, evil: true, devel: true, plusplus: false, browser: true, jquery: true, undef:false */
/*clientside jslint comment for global */
/*global org: false, core: false, YAHOO: false, confirmation_save: false */
/*jshint unused: false */



org.goorm.core.window.tab = function () {
	this.tabview = null;
	this.list_menu = null;
	this.tab = null;
	this.menuitem = null;
	this.window = null;
	this.context_menu = null;
	this.title = null;
	this.is_saved = null;
	this.tab_count = 0;
	this.tab_width = 80;
};

org.goorm.core.window.tab.prototype = {

	init: function (container, title, tabview, list_menu, filepath, windowall) {
		var self = this;

		this.container = container;
		this.is_saved = true;
		this.tabview = tabview;
		this.list_menu = list_menu;
		this.title = title;

		var window_manager = core.module.layout.workspace.window_manager;

		var check = 0;
		var titletext;

		for (var i = 0; i < windowall.window.length - 1; i++) {
			titletext = $($('.tabtitle')[i]).text();

			if (this.title == windowall.window[i].filename) {
				if (titletext.search(windowall.window[i].filepath) < 0) {
					titletext = titletext.replace(windowall.window[i].filename, windowall.window[i].filepath + windowall.window[i].filename);
					$($('.tabtitle')[i]).text(titletext);
					if ($('.tabtitle')[i].flag || $('.tabtitle')[i].flag === undefined)
						$('.tabtitle')[i].title = $('.tabtitle')[i].title.replace(windowall.window[i].filename, titletext);
					$($('#window_list_menu').find('a')[i]).text(windowall.window[i].filepath + windowall.window[i].filename);
				}
				check++;
			}
		}

		if (check !== 0) {
			this.title = filepath + this.title;
		}

		this.tab = new YAHOO.widget.Tab({
			label: "<div class='tabimage window_tab-toolbar-connect' style='float:left;margin-right:4px'></div><span class='tabtitle window_title' style='float:left'>" + this.title + "</span> <div class='window_buttons'><div class='close tab_close_button window_button'></div></div>",
			content: ""
		});
		this.tabview.addTab(this.tab);
		this.tabview.selectTab(this.tabview.getTabIndex(this.tab));
		this.tab_count = $('#workspace_window_list ul li').length;
		this.tab_id = 'tabwindow' + window_manager.tab_window_index;

		$('#workspace_window_list ul li:last').attr('id', this.tab_id);
		window_manager.tab_window_index++;

		$('.tabtitle:last')[0].title = this.title;
		this.menuitem = new YAHOO.widget.MenuItem("window_list_menu", {
			text: this.title,
			onclick: {
				fn: function () {
					self.activate();
					console.log('activate');
				}
			}
		});

		this.list_menu.addItem(this.menuitem);
		this.list_menu.render();

		this.context_menu = new org.goorm.core.menu.context();
		this.context_menu.init("configs/menu/org.goorm.core.window/window.tab.html", "window.tab", this.tab.get("labelEl"), this.title, null, function () {
			self.set_event();
		});

		//$(core).on("on_project_open.tab", function () {
			//self.set_title();
		//});

		this.move = new org.goorm.core.window.tab.move();
		this.move.init(this);

		this.resize();
	},

	set_title: function () {
		var self = this;
		var title = this.title;
		var prefix = "";
		var project = self.window.filepath.split("/").shift();
		var tab_title_container = $('#'+this.tab_id+' .tabtitle')[0];
		var tab_image_container = $('#'+this.tab_id+' .tabimage')[0];
		var tab_index = core.module.layout.workspace.window_manager.tab_manager.get_index_by_tab_id(this.tab_id);

		if (core.status.current_project_path != project && self.window.filename != "debug") {
			prefix = "[" + core.module.localization.msg.collaboration_stop_message + "] ";
		}

		if (prefix !== '' && tab_title_container.title.search(prefix) < 0) {
			this.title = prefix + title;

			tab_title_container.title = this.title;
			tab_title_container.flag = true;
			$(tab_image_container).removeClass('window_tab-toolbar-connect').addClass('window_tab-toolbar-disconnect');
		}

		if (prefix === '' && tab_title_container.title.search("[" + core.module.localization.msg.collaboration_stop_message + "] ") >= 0) {
			this.title = tab_title_container.title.replace("[" + core.module.localization.msg.collaboration_stop_message + "] ", '');

			tab_title_container.title = this.title
			tab_title_container.flag = false;
			$(tab_image_container).removeClass('window_tab-toolbar-disconnect').addClass('window_tab-toolbar-connect');
		}

		if (tab_index == core.module.layout.workspace.window_manager.tab.length-1)
			self.resize();
	},

	set_event: function () {
		var self = this;
		// window tab events
		var str = self.context_menu.name.replace(/[/.]/g, "\\.");
		var id = self.context_menu.name;

		//tab right click event assign
		$(this.tab.get("labelEl")).mousedown(function (e) {
			if (e.which === 3) {
				if ($("#" + self.window.container + "_c").css("display") == "none") {
					$("#" + str).find(".unminimize").removeClass('yuimenuitemlabel-disabled');
					$("#" + str).find(".unminimize").parent().removeClass('yuimenuitem-disabled');
					$("#" + str).find(".minimize").addClass('yuimenuitemlabel-disabled');
					$("#" + str).find(".minimize").parent().addClass('yuimenuitem-disabled');
				} else {
					$("#" + str).find(".unminimize").addClass('yuimenuitemlabel-disabled');
					$("#" + str).find(".unminimize").parent().addClass('yuimenuitem-disabled');
					$("#" + str).find(".minimize").removeClass('yuimenuitemlabel-disabled');
					$("#" + str).find(".minimize").parent().removeClass('yuimenuitem-disabled');
				}
			}
		});

		//tab click event assign
		$(this.tab.get("labelEl")).click(function (e) {
			if (e.which == 1) {
				self.activate();

				e.stopPropagation();
				e.preventDefault();
				return false;
			}
		});

		$(this.tab.get("labelEl")).parent().click(function () {
			console.log(self.window);
			self.window.activate();
		});

		//close button click event assign
		$(this.tab.get("labelEl")).find(".close").click(function (e) {
			if (e.which == 1) {
				self.close();
				return false;
			}
		});

		$("[id='"+id+"']").find(".close").click(function (e) {
			if (e.which == 1) {
				self.context_menu.hide();
				self.close();
				return false;
			}
		});

		$("[id='"+id+"']").find(".show_and_hide").click(function (e) {
			if (e.which == 1) {
				self.context_menu.hide();
				// self.window.minimize();

				var __window = $("#" + self.window.container + "_c");
				__window.toggle();

				return false;
			}
		});

		// $("[id='"+id+"']").find(".unminimize").click(function (e) {
		// 	if (e.which == 1) {
		// 		if (!$(this).hasClass('yuimenuitemlabel-disabled')) {
		// 			self.context_menu.hide();
		// 			self.activate();
		// 		}
		// 		return false;
		// 	}
		// });
	},

	set_modified: function () {
		var tabtitle = $(this.tab.get("labelEl")).find(".tabtitle").text();
		tabtitle = tabtitle.replace(" *", "");
		$(this.tab.get("labelEl")).find(".tabtitle").html(tabtitle + " *");

		this.is_saved = false;
	},

	set_saved: function () {
		var tabtitle = $(this.tab.get("labelEl")).find(".tabtitle").text();
		$(this.tab.get("labelEl")).find(".tabtitle").html(tabtitle.replace(" *", ""));

		this.is_saved = true;
	},

	connect: function (window) {
		this.window = window;
		this.set_title();
	},

	close: function () {
		var self = this;
		var window_manager = core.module.layout.workspace.window_manager;

		if (this.is_saved) {
			var tab_container = $('#'+this.tab_id+' .tabtitle');
			var target_index = window_manager.tab_manager.get_index_by_tab_id(this.tab_id);

			var check = 0,
				ii;
			for (var i = 0; i < window_manager.window.length; i++) {
				if (i == target_index) continue;

				if (window_manager.window[i].filename == window_manager.window[target_index].filename) {
					ii = i;
					check++;
				}

			}

			if (check == 1) {
				$($('.tabtitle')[ii]).text($($('.tabtitle')[ii]).text().replace(window_manager.window[ii].filepath, ''));
				$($('#window_list_menu').find('a')[ii]).text(window_manager.window[ii].filename);
			}

			window_manager.decrement_index_in_window(target_index);
			window_manager.delete_window_in_tab(target_index);

			this.tabview.removeTab(this.tab);
			this.resize();
			this.list_menu.removeItem(this.menuitem);
			this.context_menu.remove();
			if (this.window) {
				this.window.tab = null;
				this.window.close();
			}
		} else {
			confirmation_save.init({
				message: "\"" + this.window.filename + "\" " + core.module.localization.msg.confirmation_save_message,
				yes_text: core.module.localization.msg.confirmation_yes,
				cancel_text: core.module.localization.msg.confirmation_cancel,
				no_text: core.module.localization.msg.confirmation_no,

				title: "Close...",

				yes: function () {
					self.window.editor.save("close");
				},
				cancel: function () {},
				no: function () {
					self.is_saved = true;
					self.window.is_saved = true;
					self.close();
				}
			});
			confirmation_save.panel.show();
		}
		// if (this.title != "debug")
		// 	$(core).off("on_project_open.tab");
		delete this;
	},

	activate: function () {
		this.tabview.selectTab(this.tabview.getTabIndex(this.tab));

		$(this.tab.get("labelEl")).parent().off("dblclick");
		$(this.tab.get("labelEl")).parent().dblclick(function (e) {
			if (self.window.status != "unmaximized" && core.module.layout.workspace.window_manager.maximized) {
				core.module.layout.workspace.window_manager.unmaximize_all();

				e.preventDefault();
				e.stopPropagation();

				core.module.layout.workspace.window_manager.maximized = false;
			}

			return false;
		});

		$("#window_list_menu").find(".yuimenuitem-checked").each(function (i) {
			$(this).removeClass("yuimenuitem-checked");
		});

		$(this.menuitem.element).addClass("yuimenuitem-checked");
		if (this.window) {
			core.module.toolbar.switch_state(this.window.type);
			this.window.show();

			var new_window;
			if (!$("#" + this.window.container).find(".hd").hasClass("activated")) {
				for (var i = 0; i < core.module.layout.workspace.window_manager.index; i++) {
					if (core.module.layout.workspace.window_manager.window[i].alive && core.module.layout.workspace.window_manager.window[i] == this.window) {
						new_window = i;
						break;
					}
				}

				this.window.activate();
				core.module.layout.workspace.window_manager.active_window = new_window;
			}
		}
	},

	resize: function () {
		var tab_list = core.module.layout.workspace.window_manager.tab;

		this.tab_count = $('#workspace_window_list ul li').length;
		this.tab_width = $('#workspace_window_list ul').width() / this.tab_count;

		if (this.tab_width < 95) {
			this.tab_width = 95; // 14 + 20 + 46
		} else if (this.tab_width > 230) {
			this.tab_width = 230;
		}
		for (i = 0; i < this.tab_count; i++) {
			var title = tab_list[i].title;
			var title_len = 0;
			var width;
			title = title.replace("[" + core.module.localization.msg.collaboration_stop_message + "] ", "");
			title = title.split('/').pop();

			//same name check
			for(var k=0;k<this.tab_count;k++){
				if(k===i)continue;
				if(tab_list[i].window && tab_list[k].window && tab_list[i].window.filename===tab_list[k].window.filename){
					title=tab_list[i].window.filename+' - '+tab_list[i].window.filepath;	
					break;
				}
			}





			if ($('.tabtitle')[i].flag) {
				width = this.tab_width - 47 - 20;
				$($('.tabtitle')[i]).css('width', width);
			} else {
				width = this.tab_width - 47 - 20;
				$($('.tabtitle')[i]).css('width', width);
			}

			title_len = (title.length + 1) * 7 - (title.split('i').length + title.split('l').length + title.split('j').length + title.split('.').length + title.split(',').length - 4) * 3.5;
			if (title_len >= width) {
				var temp_title = title;
				while (1) {
					temp_title = temp_title.substring(0, temp_title.length - 1);
					title_len = (temp_title.length + 1) * 7 - (temp_title.split('i').length + title.split('l').length + temp_title.split('j').length + temp_title.split('.').length + temp_title.split(',').length - 4) * 3.5;
					if (title_len <= width - 11) break;
				}
				$($('.tabtitle')[i]).text(temp_title + "..");
			} else {
				$($('.tabtitle')[i]).text(title);
			}



			//modifing state -> append '*'
			if(!tab_list[i].is_saved){
				var tabtitle = $(tab_list[i].tab.get("labelEl")).find(".tabtitle").text();
				tabtitle = tabtitle.replace(" *", "");
				$(tab_list[i].tab.get("labelEl")).find(".tabtitle").html(tabtitle + " *");
			}

		
		}
	}
};
